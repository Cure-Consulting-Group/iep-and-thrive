# Family access regression tests

Install dependencies with `npm ci`. With the Firebase CLI and Java installed, run from the repository root:

```sh
firebase emulators:exec --project demo-iep-security --config firebase.security.json --only firestore,storage 'npm run test:security'
```

If loopback emulators already occupy the configured ports, run `npm run test:security` against them. The suite explicitly targets `demo-iep-security`, loads the repository rules, and clears only that synthetic project's Firestore data. It never uses production credentials or records.

Coverage: profile initialization and allowed edits; denial of billing/role/subscription injection, protected-field deletion, and cross-family access; custom-claim admin writes; denial of all direct signed-PDF reads/writes; preserved owner report access. The unit suite separately executes the auth provider against mocked Firebase responses to verify claims, token refresh, sign-out races, and failure handling.

These tests do not exercise live Stripe or production signed URLs. The portal downloads agreements through `getSignedAgreementPdf`, which checks owner/admin authorization and issues a ten-minute signed URL. Storage rules do not revoke existing download tokens or previously issued signed URLs.
