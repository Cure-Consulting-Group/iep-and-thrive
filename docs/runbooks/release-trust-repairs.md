# Runbook — release the A01/A02 trust repairs

Covers **TASK-LP-006**, including its September 6 2026 correction. This is the release of
work that is already merged to `main` and has never been deployed.

**Do not skip section 2.** Releasing the rules without provisioning admin custom claims first
locks every administrator out of the admin UI.

---

## 0. What is being released, and what it changes

Merged in PR #39, undeployed as of this writing:

| Surface | Change |
| --- | --- |
| `firestore.rules` | `/users/{userId}` create restricted to a fixed key set with `role` forced to `parent`; owner update restricted to a contact/preferences allowlist |
| `storage.rules` | `/signedAgreements/{enrollmentId}` closed to direct client read and write |
| `lib/auth-context.tsx` | Role derived from `token.claims.admin`, never from the persisted field |
| `app/login/page.tsx` | Admin redirect reads `getIdTokenResult()` |

The vulnerability closed: `/users/{userId}` previously allowed the owner to update **any**
field including `role`, and the client trusted that persisted field for admin routing and
admin UI. A parent could write `role: 'admin'` to their own document.

Scope of that escalation: `isAdmin()` in the rules was **already** claim-based, so a
self-promoted parent got the admin *shell*, not admin *data*. Every rule-guarded read still
failed. Real, but bounded to UI and routing.

---

## 1. Preconditions

- [ ] `main` is green and contains PR #39.
- [ ] You have a service-account key with Firebase Auth admin rights, and
      `GOOGLE_APPLICATION_CREDENTIALS` points at it.
- [ ] You have the Firebase CLI authenticated against the production project.
- [ ] **TASK-LP-054 is done** — a staging project exists and this has been rehearsed there.
      If 054 is not done, rehearse on a scratch project before touching production. Do not
      let production be the first environment that sees these rules.
- [ ] Record the currently deployed rules so you can compare and roll back:

`firebase-tools` has no `rules:get` command — an earlier version of this runbook
said it did, and an operator following it stalled here. Read the live ruleset
through the Rules REST API, the same way `.github/workflows/deploy.yml` does:

```bash
TOKEN="$(gcloud auth print-access-token)"
for pair in "cloud.firestore:firestore.rules" "cloud.storage:storage.rules"; do
  release="${pair%%:*}"; local_file="${pair##*:}"
  ruleset=$(curl -sS -H "Authorization: Bearer $TOKEN" \
    "https://firebaserules.googleapis.com/v1/projects/iep-and-thrive/releases/$release" \
    | python3 -c 'import json,sys; print(json.load(sys.stdin).get("rulesetName",""))')
  curl -sS -H "Authorization: Bearer $TOKEN" \
    "https://firebaserules.googleapis.com/v1/$ruleset" \
    | python3 -c 'import json,sys; print(json.load(sys.stdin)["source"]["files"][0]["content"], end="")' \
    > "/tmp/deployed.$local_file"
  diff "$local_file" "/tmp/deployed.$local_file" && echo "$local_file matches"
done
```

If the deployed rules differ from `main` in ways this release did not introduce, **stop**.
Something was deployed out of band and needs reconciling first.

---

## 2. Provision admin custom claims — do this BEFORE deploying

`isAdmin()` resolves `request.auth.token.admin == true`. It has never read
`users/{uid}.role`. Administrators holding only the persisted field have always been denied
admin data; after this release they also lose the admin shell.

### 2a. Audit

```bash
GCLOUD_PROJECT=iep-and-thrive \
GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json \
  node scripts/provision-admin-claims.mjs audit --json | tee ops/evidence/admin-claims-before.json
```

Read the three sections. The one that matters is **"Has `users/{uid}.role == 'admin'` but NO
claim"** — those are the accounts about to be locked out.

### 2b. Build the allowlist by hand

```
ops/admins.txt        # one email per line, # comments allowed
```

**Do not generate this file from the audit output.** Before the A01 repair any parent could
write `role: 'admin'` to their own document, so a `role: 'admin'` in Firestore is exactly the
forgeable signal this release exists to stop trusting. Every address goes in only because a
human confirmed the person is staff.

If the audit shows a `role: 'admin'` account you do not recognise, that is a possible
exploitation of the old rule. Investigate before releasing; do not assume it is benign, and
do not claim a breach without evidence either. Record what you find.

### 2c. Dry run, then apply

```bash
GCLOUD_PROJECT=iep-and-thrive node scripts/provision-admin-claims.mjs grant --allowlist ops/admins.txt
# review the GRANT / REVOKE lists, then:
GCLOUD_PROJECT=iep-and-thrive \
  node scripts/provision-admin-claims.mjs grant --allowlist ops/admins.txt --apply --json \
  | tee ops/evidence/admin-claims-granted.json
```

Claims reach a client only on the next ID-token refresh (up to an hour). **Tell affected staff
to sign out and back in.** Do not wait it out during a release window.

### 2d. Confirm

```bash
GCLOUD_PROJECT=iep-and-thrive node scripts/provision-admin-claims.mjs audit
```

The "role admin but no claim" list should now be empty, or contain only accounts you
deliberately excluded and have recorded a reason for.

---

## 3. Deploy

Rules first, then hosting. Rules are the security boundary; the client change is cosmetic by
comparison and is safe to lag by a few minutes. The reverse order would briefly leave the new
client running against old permissive rules.

Do not deploy by hand. `.github/workflows/deploy.yml` deploys all four surfaces
in the required order (indexes → rules → functions → hosting) from one verified
commit, and reads the rules back afterwards. Hand-deploying skips the gate and,
as written before, omitted Functions and indexes entirely — which this session
changed heavily.

```bash
gh workflow run "Release" --ref main
gh run watch "$(gh run list --workflow=Release --limit 1 --json databaseId -q '.[0].databaseId')"
```

The deploy job is `workflow_dispatch`-only precisely so this step is deliberate.
It will not fire on a merge.

Record the deployed revision hashes in the TASK-LP-006 evidence section.

---

## 4. Verify against the deployed environment

```bash
# Rules regressions — 17 cases, runs against the emulator, not production.
npx firebase emulators:exec --config firebase.security.json \
  --project demo-iep-security "npm run test:security"

# Web unit suite — 43 cases including the auth-context regressions.
npm run test:unit
```

Then, against production, by hand:

- [ ] An admin signs in and lands on `/admin`, and admin data loads (not an empty shell).
- [ ] A parent signs in, reaches `/portal`, and cannot reach `/admin`.
- [ ] A parent can still edit their own display name and phone.
- [ ] A parent cannot write `role`, `stripeCustomerId`, or `subscription` — confirm through the
      emulator suite rather than by attempting a real privileged write in production.
- [ ] A signed agreement PDF is still reachable through `getSignedAgreementPdf`, and a direct
      Storage URL to `signedAgreements/` is refused.
- [ ] Leave a portal page open for over an hour, or force a token refresh, and confirm the page
      does not blank or bounce. This is the regression fixed in `d23f8ee`; it is exactly the
      kind of thing that only appears in a long-lived session.

Then run the full E2E suite, which is non-gating and currently red for the claim reason above:

```bash
gh workflow run "E2E (Playwright)"
```

After section 2, the three `admin-curriculum` specs and `photo-release` should pass for the
first time since June. If they still fail, the claim did not take — recheck 2d before
assuming a product bug.

---

## 5. Historical exposure review

Still open, and **not** satisfied by deploying:

- [ ] Compare billing mappings against authoritative Stripe records; the old rule let a parent
      write `stripeCustomerId`.
- [ ] Inspect historical Storage download tokens for `signedAgreements/`. Closing the rule does
      not invalidate a token already issued. Revoke by rewriting object tokens if any are found.
- [ ] Check whether any account currently holds `role: 'admin'` without a legitimate reason.

Record findings as evidence on TASK-LP-006. Until this is done, prior exposure status is
**unknown** — say that, rather than either claiming a breach or a clean bill of health.

---

## 6. Rollback

Do **not** roll back to the previous rules; they contain the escalation. If the release
misbehaves:

- Admin lockout → finish section 2. That is the fix, not a rollback.
- A legitimate parent write is refused → add the specific field to the update allowlist in
  `firestore.rules` and redeploy rules. Do not restore the blanket `allow update: if isOwner()`.
- Client-side breakage → roll back **hosting only** to the prior release. The tightened rules
  are safe to leave deployed and the old client keeps working under them, because the old
  client's writes were already within the new allowlist.

Record what happened and why in `STATE.md` before ending the session.
