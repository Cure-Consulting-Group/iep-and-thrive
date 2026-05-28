# iOS Release Runbook — TestFlight Distribution

**Owner:** Eng / Founder
**Trigger:** `git tag v0.X.0 && git push --tags`
**SLA:** TestFlight processing usually completes in 15–30 minutes after the GitHub Action finishes.

This runbook covers the one-time Apple Developer + GitHub setup, and the recurring per-release process for shipping iOS builds to TestFlight.

---

## TL;DR (recurring releases)

After the one-time setup is done, every release is just:

```bash
# Bump version in ios/project.yml (MARKETING_VERSION line) if you want
# a user-visible version change. Build number is auto-incremented by CI.
git tag v0.2.0
git push origin v0.2.0
```

The `iOS Release` GitHub Action fires automatically, builds + signs the app, uploads to TestFlight, and (15–30 min later) the new build becomes available to internal testers.

---

## One-time setup (do this once, never again)

### 1. Apple Developer Program enrollment

- Sign up at <https://developer.apple.com/programs/enroll/>
- $99/year (renews annually)
- Use the same Apple ID you want to own the App Store Connect listing
- Approval takes 1–3 days for individuals, longer for organizations

### 2. Register the iOS App ID

In <https://developer.apple.com/account/resources/identifiers/list>:
- New Identifier → App IDs → App
- Description: `IEP and Thrive`
- Bundle ID: `com.cureconsulting.IEPAndThrive` (explicit, NOT wildcard)
- Capabilities: enable **Sign in with Apple** (required by `IEPAndThrive.entitlements`)

### 3. Create App Store Connect record

<https://appstoreconnect.apple.com/apps>:
- New App → iOS
- Platform: iOS
- Name: `IEP & Thrive`
- Primary language: English (U.S.)
- Bundle ID: select `com.cureconsulting.IEPAndThrive`
- SKU: `iepandthrive-ios-001` (any unique string)

You don't need to fill out the App Store metadata yet — TestFlight works with just the app record.

### 4. Generate App Store Connect API key

<https://appstoreconnect.apple.com/access/integrations/api>:
- Users and Access → Keys → App Store Connect API → `+`
- Name: `iep-and-thrive-github-actions`
- Access: **App Manager** (required for TestFlight uploads)
- Download the `.p8` private key file — Apple only lets you download it ONCE
- Note the **Issuer ID** (top of the Keys page) and the **Key ID** (column in the table)

### 5. Set up Match for certificate management

Match stores your distribution certificate + provisioning profile in a private, encrypted GitHub repo. This way CI can sign builds without you manually re-creating certs every time they expire.

1. **Create a new private GitHub repo** named e.g. `iep-and-thrive-match` (under `Cure-Consulting-Group` org). Empty, no README — Match populates it.

2. **Generate a Personal Access Token (PAT)** with `repo` scope for that repo. Save it.

3. **Run Match init locally** (one-time, from your Mac):
   ```bash
   cd ios
   bundle install                       # installs Fastlane
   bundle exec fastlane match init      # interactive — pick "git"
   # Repo URL: https://github.com/Cure-Consulting-Group/iep-and-thrive-match.git
   bundle exec fastlane match appstore --app_identifier com.cureconsulting.IEPAndThrive
   # Match will generate the cert + profile, encrypt them with the
   # password you provide (REMEMBER THIS PASSWORD), and push to the
   # private repo.
   ```

### 6. Add GitHub Actions secrets

In <https://github.com/Cure-Consulting-Group/iep-and-thrive/settings/secrets/actions>:

| Secret | Source |
|--------|--------|
| `APP_STORE_CONNECT_API_KEY_ID` | Step 4: the Key ID |
| `APP_STORE_CONNECT_API_KEY_ISSUER_ID` | Step 4: the Issuer ID |
| `APP_STORE_CONNECT_API_KEY_CONTENT` | `base64 -i AuthKey_XXXXX.p8` from Step 4 (paste the whole base64 string) |
| `MATCH_PASSWORD` | Step 5: the password you set during `match init` |
| `MATCH_GIT_URL` | `https://github.com/Cure-Consulting-Group/iep-and-thrive-match.git` |
| `MATCH_GIT_BASIC_AUTHORIZATION` | `base64` of `username:PAT` from Step 5.2 (e.g. `printf 'rcureton:ghp_xxx' \| base64`) |

### 7. Smoke-test the workflow

```bash
git tag v0.1.0-test
git push origin v0.1.0-test
```

Watch <https://github.com/Cure-Consulting-Group/iep-and-thrive/actions> — the `iOS Release` workflow should run, succeed, and upload to TestFlight. Confirm in App Store Connect under TestFlight → Builds.

If it fails, see the **Troubleshooting** section below.

---

## Recurring release process

### Pre-release checklist

- [ ] All Phase 3+ PRs merged for the release window
- [ ] iOS CI (`Build and Check`) green on `main`
- [ ] STATE.md updated to reflect what's in the build
- [ ] Manual smoke-test of the build on a real device once

### Cut the release

```bash
# Pull latest main
git checkout main && git pull origin main

# (Optional) bump MARKETING_VERSION in ios/project.yml if you want a
# user-visible version change. Re-run xcodegen + commit.
# vim ios/project.yml
# cd ios && xcodegen generate && cd ..
# git commit -am "chore: bump iOS marketing version to 0.2.0"
# git push origin main

# Tag + push
git tag v0.2.0 -m "Sprint 8 pilot build"
git push origin v0.2.0
```

The GitHub Action picks up the tag, builds, signs, and uploads.

### After the upload

TestFlight processing takes 15–30 minutes. Once the build appears:

1. **Add internal testers** in App Store Connect → TestFlight → Internal Testing → add Apple IDs.
2. **External testing** (pilot families) requires a one-time Beta App Review for the first build. Submit by clicking "Submit for Beta Review" on the build. Apple usually approves in 24 hours.
3. **Send invites**: testers get an email; they install via the TestFlight app.

---

## Troubleshooting

### `Could not find provisioning profile for app: com.cureconsulting.IEPAndThrive`
Match hasn't been initialized for this app identifier. Run `bundle exec fastlane match appstore --app_identifier com.cureconsulting.IEPAndThrive` locally to populate the certs repo, then re-trigger the workflow.

### `Authentication credentials are missing`
Verify all 6 secrets are present in GitHub Actions settings (case-sensitive names) and that the `.p8` content is base64-encoded with no newlines.

### `Invalid Code Signing Entitlements`
The build's entitlements file declares a capability that the App ID doesn't have. Fix: in <https://developer.apple.com/account/resources/identifiers>, edit the `com.cureconsulting.IEPAndThrive` App ID and enable the missing capability. Then run `bundle exec fastlane match nuke distribution && bundle exec fastlane match appstore` locally to regenerate the cert + profile with the new entitlements.

### `App Store Connect API rate limit exceeded`
The free tier of API keys is rate-limited. Add a retry on the workflow or wait 30 min and re-run.

### Build succeeds but build never appears in TestFlight
App Store Connect processing failed — Apple emails the team admin with details. Common causes:
- Privacy manifest issue (re-check `PrivacyInfo.xcprivacy` declarations vs. actual data collection)
- Missing required device family in Info.plist
- ITMS-90809 deprecated API warnings (usually informational, but a hard error in some cases)

---

## Related docs

- `docs/legal/data-deletion-process.md` — COPPA deletion workflow (mentioned in Privacy Manifest)
- `docs/runbooks/firestore-backups.md` — Firestore backup process (data the iOS app writes)
- `STATE.md` — current sprint status + Phase progression
