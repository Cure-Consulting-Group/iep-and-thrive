# Runbook — environments

Covers **TASK-LP-054**. Read this before running anything that writes data.

## The three environments

| Alias | Firebase project | `NEXT_PUBLIC_FIREBASE_ENV` | Data |
| --- | --- | --- | --- |
| `local` | emulator suite (no cloud project) | `local` | Throwaway, in-memory |
| `staging` | `iep-and-thrive-staging` | `staging` | Synthetic only |
| `production` | `iep-and-thrive` | `production` | **Real families** |

`.firebaserc` carries the aliases, so every command takes `-P staging` or
`-P production` rather than relying on whatever `default` happens to be.

## Why this ticket existed

Two independent mistakes combined into a third:

1. `lib/functions-config.ts` decided "am I local?" with
   `window.location.hostname === 'localhost'`. A developer on `127.0.0.1` —
   the same machine, a different spelling — called **production** Functions.
2. `lib/firebase.ts` never connected to an emulator at all. So a developer on
   `localhost` got Functions on the emulator and Auth, Firestore and Storage in
   production. A partially-local environment looks local and is not.

Both are now decided once in `lib/env.ts` and asserted at startup. A build that
combines a staging project with production Auth throws
`EnvironmentConfigError` instead of running. `tests/unit/env.test.mjs` covers
the mixed cases.

Absent configuration is deliberately **not** fatal — a CI checkout with no
`.env.local` must still be able to run `next build`. Only present-and-
contradictory configuration is refused.

## Local development

```bash
# 1. Point the web app at the emulators.
cat > .env.local <<'ENV'
NEXT_PUBLIC_FIREBASE_ENV=local
NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-iep-local
NEXT_PUBLIC_FIREBASE_API_KEY=demo-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=demo-iep-local.firebaseapp.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=demo-iep-local.appspot.com
ENV

# 2. Start the suite. A `demo-` project id keeps the emulators fully offline.
firebase emulators:start --project demo-iep-local

# 3. Run the app.
npm run dev
```

A `demo-`prefixed project id is what makes the emulator refuse to reach any
real backend. Keep it.

## Seeding and resetting

Both scripts refuse to run without `E2E_SYNTHETIC_PROJECT_ID`, refuse the
production id outright, and abort when the resolved project disagrees with the
declared one (TASK-LP-011). `reset-test-accounts.mjs` deletes accounts — its
previous guard defaulted to production when the variable was unset.

```bash
E2E_SYNTHETIC_PROJECT_ID=iep-and-thrive-staging \
  node scripts/seed-test-accounts.mjs
```

## Running the security rules suite

Independent of the above; uses its own loopback ports so it cannot collide with
a running dev emulator.

```bash
npx firebase emulators:exec --config firebase.security.json \
  --project demo-iep-security "npm run test:security"
```

## Still outstanding

The staging project **does not exist yet**. Creating it, granting
least-privilege identities, and seeding synthetic data are operational steps
that need console access; this repo now assumes it and will fail loudly if
pointed at the wrong one, which is the half that belongs in version control.

Until staging exists:

- E2E runs against production. That is why the merge gate only runs the
  deterministic read-only specs, and why the stateful suite is scheduled and
  non-gating. See `.github/workflows/e2e.yml`.
- Do not run seed or reset against anything. There is no safe target.
