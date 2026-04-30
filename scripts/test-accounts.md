# Test Cohort Accounts (E13)

Seeded by `scripts/seed-test-accounts.mjs`. Reset by `scripts/reset-test-accounts.mjs`.

## Convention

- **Email pattern**: `parent-test-{persona}@iepandthrive.com`
- **Password formula**: `TestPass123!{persona}`
- **Profile flag**: `isTest: true` on every test account's `users/{uid}` doc and on every nested `students/{sid}` doc.
- **Display names**: every test account name is `[TEST]`-prefixed so it's unmistakable in admin views.
- **Filter coverage**: `sendWeeklyDigest` and `onAttendanceFlagged` functions skip `isTest === true` users — test accounts will never receive production digest or notification emails.

## Accounts

| Persona | Email | Password | Stage | Track |
|---|---|---|---|---|
| Inquiry | `parent-test-inquiry@iepandthrive.com` | `TestPass123!inquiry` | Form submitted, no deposit | Full Academic |
| Deposited | `parent-test-deposited@iepandthrive.com` | `TestPass123!deposited` | 25% deposit paid | Reading & Language |
| Enrolled | `parent-test-enrolled@iepandthrive.com` | `TestPass123!enrolled` | Paid in full, intake done | Math & Numeracy |

## Storage

Copy the credentials block above into 1Password under the entry **"IEP & Thrive — Test Accounts"**. Tag the entry `internal · test`. Do **not** commit real passwords to this file beyond the formula above.

## Browser profile workflow

The simplest QA workflow:

1. Run admin work in your default Chrome / Safari profile (logged in as the founder admin).
2. Spin up a separate Chrome profile (or Firefox container) called "IEP Test — Inquiry" / "Deposited" / "Enrolled". Sign each into one persona.
3. Switch profiles to walk through the parent UX without affecting your admin session.

## Re-running

Both seed and reset are idempotent and project-guarded (`iep-and-thrive` only):

```bash
node scripts/seed-test-accounts.mjs    # delete-then-create all 3
node scripts/reset-test-accounts.mjs   # remove all parent-test-* accounts + nested student docs
```

## Auth requirements (one-time)

Run on a machine that has either:

- `GOOGLE_APPLICATION_CREDENTIALS` env var pointing to a service account JSON with `Firebase Authentication Admin` + `Cloud Datastore User` roles, **OR**
- `gcloud auth application-default login` completed against an account with project owner/editor on `iep-and-thrive`.

The Firebase CLI auth used by `firebase deploy` is **not** sufficient — Application Default Credentials are a separate gcloud concept. If the seed errors with `Could not load the default credentials`, run:

```bash
gcloud auth application-default login
gcloud config set project iep-and-thrive
```

## CI / GitHub Actions

The `.github/workflows/e2e.yml` workflow runs the Playwright suite against production on every push to `main`, every PR, every 6 hours, and on manual dispatch.

Test passwords are stored as GitHub Actions secrets (so they don't appear in CI logs):

| Secret | Value |
|---|---|
| `E2E_INQUIRY_PASSWORD` | `TestPass123!inquiry` |
| `E2E_DEPOSITED_PASSWORD` | `TestPass123!deposited` |
| `E2E_ENROLLED_PASSWORD` | `TestPass123!enrolled` |

These are intentionally low-stakes (test accounts gated by `isTest` so they never receive production emails). If the password formula changes, update both the seed script and the GitHub secrets:

```bash
gh secret set E2E_INQUIRY_PASSWORD --body '<new-password>' -R Cure-Consulting-Group/iep-and-thrive
# repeat for deposited / enrolled
```

## E10 — separate manual step (CI hosting deploy)

This is a different ticket. The `deploy.yml` workflow is broken because it requires a `FIREBASE_SERVICE_ACCOUNT` repo secret that doesn't exist. To unblock CI deploys (currently founder uses local `firebase deploy` only):

1. Firebase Console → IAM & admin → Service accounts → Create service account named `github-actions-deploy`
2. Grant roles: **Firebase Hosting Admin**, **Cloud Functions Developer** (least privilege)
3. Keys tab → Add key → JSON → download
4. `gh secret set FIREBASE_SERVICE_ACCOUNT --body "$(cat path/to/key.json)" -R Cure-Consulting-Group/iep-and-thrive`
5. Delete the local key file
6. Re-run the failing `Deploy to Firebase` workflow; should pass

## When to rotate

These credentials are low-stakes (test accounts gated by `isTest`) but rotate the password formula if any test account password ever appears outside 1Password (slacked, screenshot, committed to a branch). Update both this doc and the `scripts/seed-test-accounts.mjs` PERSONAS block, then run reset + seed.
