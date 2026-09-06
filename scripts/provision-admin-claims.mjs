#!/usr/bin/env node
/**
 * Provision Firebase admin custom claims — TASK-LP-006 (September 6 correction).
 *
 * WHY THIS EXISTS
 *
 * `isAdmin()` in firestore.rules and storage.rules resolves
 * `request.auth.token.admin == true` — a custom claim. It has never read the
 * persisted `users/{uid}.role` field. Before the A01 repair the *client* trusted
 * that persisted field for admin routing and admin UI, which is the escalation
 * A01 closed: any parent could write `role: 'admin'` to their own document.
 *
 * The consequence is that an admin holding only `role: 'admin'` in Firestore has
 * always been denied admin *data* by rules, while still being shown the admin
 * shell. After A01 they lose the shell too. Releasing A01 without first granting
 * real custom claims turns a confusing half-lockout into a total one.
 *
 * THE RULE THIS SCRIPT ENFORCES
 *
 * The persisted `role` field is exactly the thing an attacker could forge, so it
 * is a discovery signal here and never an authorization decision. This script
 * will not grant a claim from the Firestore document alone. Every uid must also
 * appear in an operator-supplied allowlist, so a forged `role: 'admin'` written
 * by a parent before the repair cannot promote itself through this script.
 *
 * USAGE
 *
 *   # 1. See who currently holds the claim, and who claims to be an admin.
 *   GOOGLE_APPLICATION_CREDENTIALS=... node scripts/provision-admin-claims.mjs audit
 *
 *   # 2. Review the audit output. Build an allowlist of the accounts that are
 *   #    genuinely staff. One email per line; blank lines and # comments ignored.
 *   #    Never generate this file from the audit output without reading it.
 *
 *   # 3. Dry run (default) — shows exactly what would change, writes nothing.
 *   GOOGLE_APPLICATION_CREDENTIALS=... \
 *     node scripts/provision-admin-claims.mjs grant --allowlist ops/admins.txt
 *
 *   # 4. Apply. Requires the explicit flag; there is no interactive prompt so
 *   #    that the run is reproducible and recordable as release evidence.
 *   GOOGLE_APPLICATION_CREDENTIALS=... \
 *     node scripts/provision-admin-claims.mjs grant --allowlist ops/admins.txt --apply
 *
 *   # Revoke a claim (same allowlist semantics — the file lists who KEEPS it).
 *   ... grant --allowlist ops/admins.txt --revoke-unlisted --apply
 *
 * Claim propagation: a granted claim reaches a client only on its next ID-token
 * refresh (up to an hour) or an explicit getIdToken(true). Tell affected staff to
 * sign out and back in rather than waiting.
 *
 * Output is written to stdout as a table and, with --json, as a machine-readable
 * record suitable for attaching to the TASK-LP-006 release evidence. It never
 * prints passwords or tokens.
 */

import { readFileSync } from 'node:fs'
import { initializeApp, applicationDefault, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

const PRODUCTION_PROJECT_ID = 'iep-and-thrive'

function parseArgs(argv) {
  const [, , command, ...rest] = argv
  const opts = { command, allowlist: null, apply: false, revokeUnlisted: false, json: false }
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i]
    if (a === '--allowlist') opts.allowlist = rest[++i]
    else if (a === '--apply') opts.apply = true
    else if (a === '--revoke-unlisted') opts.revokeUnlisted = true
    else if (a === '--json') opts.json = true
    else {
      console.error(`Unknown argument: ${a}`)
      process.exit(2)
    }
  }
  return opts
}

function resolveProjectId() {
  const explicit = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT
  return explicit || PRODUCTION_PROJECT_ID
}

function readAllowlist(path) {
  let raw
  try {
    raw = readFileSync(path, 'utf8')
  } catch (err) {
    console.error(`ABORT: cannot read allowlist "${path}": ${err.message}`)
    process.exit(1)
  }
  const emails = raw
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => l.toLowerCase())
  if (emails.length === 0) {
    console.error(`ABORT: allowlist "${path}" is empty. Refusing to proceed.`)
    process.exit(1)
  }
  const dupes = emails.filter((e, i) => emails.indexOf(e) !== i)
  if (dupes.length) {
    console.error(`ABORT: duplicate entries in allowlist: ${[...new Set(dupes)].join(', ')}`)
    process.exit(1)
  }
  return new Set(emails)
}

/** Every Auth user, with their claim state and their (untrusted) Firestore role. */
async function collectUsers(auth, db) {
  const users = []
  let pageToken
  do {
    const page = await auth.listUsers(1000, pageToken)
    for (const u of page.users) {
      users.push({
        uid: u.uid,
        email: (u.email || '').toLowerCase(),
        disabled: u.disabled,
        hasClaim: u.customClaims?.admin === true,
        persistedRole: null,
      })
    }
    pageToken = page.pageToken
  } while (pageToken)

  // The persisted role is a discovery signal only — see the header comment.
  const snap = await db.collection('users').get()
  const roleByUid = new Map()
  snap.forEach((doc) => roleByUid.set(doc.id, doc.get('role') ?? null))
  for (const u of users) u.persistedRole = roleByUid.get(u.uid) ?? null

  return users
}

function describe(u) {
  return `${u.email || '(no email)'}  uid=${u.uid}${u.disabled ? '  [DISABLED]' : ''}`
}

async function commandAudit(users, opts) {
  const withClaim = users.filter((u) => u.hasClaim)
  const claimsAdminRole = users.filter((u) => u.persistedRole === 'admin')
  const forged = claimsAdminRole.filter((u) => !u.hasClaim)
  const claimOnly = withClaim.filter((u) => u.persistedRole !== 'admin')

  console.log(`\nAdmin claim audit — project ${resolveProjectId()}`)
  console.log('═'.repeat(70))
  console.log(`\nHolds admin custom claim (authoritative): ${withClaim.length}`)
  for (const u of withClaim) console.log(`  ✓ ${describe(u)}`)

  console.log(`\nHas users/{uid}.role == 'admin' but NO claim: ${forged.length}`)
  if (forged.length) {
    console.log('  These are locked out of admin UI after the A01 release.')
    console.log('  Before the A01 repair any parent could write this field themselves,')
    console.log('  so treat every entry as unverified until a human confirms it.')
  }
  for (const u of forged) console.log(`  ! ${describe(u)}`)

  console.log(`\nHolds claim but role field disagrees: ${claimOnly.length}`)
  for (const u of claimOnly) console.log(`  ? ${describe(u)}  role=${u.persistedRole ?? 'unset'}`)

  console.log(`\nTotal Auth users: ${users.length}`)
  console.log('\nNext: build an allowlist of genuinely-staff emails, then run `grant`.')
  console.log('Do not generate that file from this output without reading it.\n')

  if (opts.json) {
    console.log(JSON.stringify({
      project: resolveProjectId(),
      generatedAt: new Date().toISOString(),
      totalUsers: users.length,
      withClaim: withClaim.map((u) => ({ uid: u.uid, email: u.email })),
      persistedRoleAdminWithoutClaim: forged.map((u) => ({ uid: u.uid, email: u.email })),
      claimWithoutPersistedRole: claimOnly.map((u) => ({ uid: u.uid, email: u.email })),
    }, null, 2))
  }
}

async function commandGrant(auth, users, opts, allow) {
  const byEmail = new Map()
  for (const u of users) if (u.email) byEmail.set(u.email, u)

  const unknown = [...allow].filter((e) => !byEmail.has(e))
  if (unknown.length) {
    console.error(`ABORT: allowlist names accounts with no Auth user: ${unknown.join(', ')}`)
    console.error('Fix the allowlist rather than letting a typo silently grant nothing.')
    process.exit(1)
  }

  const toGrant = [...allow].map((e) => byEmail.get(e)).filter((u) => !u.hasClaim)
  const disabled = toGrant.filter((u) => u.disabled)
  if (disabled.length) {
    console.error(`ABORT: allowlist includes disabled accounts: ${disabled.map((u) => u.email).join(', ')}`)
    process.exit(1)
  }
  const alreadyOk = [...allow].map((e) => byEmail.get(e)).filter((u) => u.hasClaim)
  const toRevoke = opts.revokeUnlisted
    ? users.filter((u) => u.hasClaim && !allow.has(u.email))
    : []

  const mode = opts.apply ? 'APPLY' : 'DRY RUN (no writes — pass --apply to execute)'
  console.log(`\nAdmin claim provisioning — project ${resolveProjectId()}`)
  console.log(`Mode: ${mode}`)
  console.log('═'.repeat(70))
  console.log(`\nAlready correct: ${alreadyOk.length}`)
  for (const u of alreadyOk) console.log(`  = ${describe(u)}`)
  console.log(`\nWill GRANT admin claim: ${toGrant.length}`)
  for (const u of toGrant) console.log(`  + ${describe(u)}  (persisted role: ${u.persistedRole ?? 'unset'})`)
  console.log(`\nWill REVOKE admin claim: ${toRevoke.length}`)
  for (const u of toRevoke) console.log(`  - ${describe(u)}`)

  if (!opts.apply) {
    console.log('\nNothing was written. Re-run with --apply once the lists above are correct.\n')
    return { granted: [], revoked: [] }
  }

  const granted = []
  const revoked = []
  for (const u of toGrant) {
    // Merge rather than replace: other claims on the account must survive.
    const existing = (await auth.getUser(u.uid)).customClaims ?? {}
    await auth.setCustomUserClaims(u.uid, { ...existing, admin: true })
    granted.push({ uid: u.uid, email: u.email })
    console.log(`  granted  ${u.email}`)
  }
  for (const u of toRevoke) {
    const existing = (await auth.getUser(u.uid)).customClaims ?? {}
    const { admin: _drop, ...rest } = existing
    await auth.setCustomUserClaims(u.uid, rest)
    revoked.push({ uid: u.uid, email: u.email })
    console.log(`  revoked  ${u.email}`)
  }

  console.log(`\nDone. Granted ${granted.length}, revoked ${revoked.length}.`)
  console.log('Claims reach clients on the next ID-token refresh (up to an hour).')
  console.log('Tell affected staff to sign out and back in.\n')

  if (opts.json) {
    console.log(JSON.stringify({
      project: resolveProjectId(),
      appliedAt: new Date().toISOString(),
      granted,
      revoked,
    }, null, 2))
  }
  return { granted, revoked }
}

async function main() {
  const opts = parseArgs(process.argv)
  if (!opts.command || !['audit', 'grant'].includes(opts.command)) {
    console.error('Usage: provision-admin-claims.mjs <audit|grant> [--allowlist f] [--apply] [--revoke-unlisted] [--json]')
    process.exit(2)
  }
  // Validate arguments and read the allowlist BEFORE touching the network, so a
  // missing flag reports the flag rather than a downstream credential error.
  let allow = null
  if (opts.command === 'grant') {
    if (!opts.allowlist) {
      console.error('ABORT: grant requires --allowlist <file>.')
      console.error('The persisted role field is forgeable and is never sufficient on its own.')
      process.exit(2)
    }
    allow = readAllowlist(opts.allowlist)
  }
  if (opts.revokeUnlisted && opts.command !== 'grant') {
    console.error('ABORT: --revoke-unlisted only applies to grant.')
    process.exit(2)
  }

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error('ABORT: GOOGLE_APPLICATION_CREDENTIALS is not set.')
    console.error('Point it at a service-account key with Firebase Auth admin rights.')
    process.exit(1)
  }

  const projectId = resolveProjectId()
  if (!getApps().length) {
    initializeApp({ credential: applicationDefault(), projectId })
  }
  const auth = getAuth()
  const db = getFirestore()

  const users = await collectUsers(auth, db)
  if (opts.command === 'audit') await commandAudit(users, opts)
  else await commandGrant(auth, users, opts, allow)
}

main().catch((err) => {
  console.error(`\nFAILED: ${err.message}`)
  process.exitCode = 1
})
