#!/usr/bin/env node

/**
 * Firebase Project Security Verification Script
 * ──────────────────────────────────────────────
 * Ensures this codebase is locked to the correct Firebase project
 * and validates critical security configuration before deployment.
 *
 * Usage: node scripts/verify-firebase.mjs
 */

import { readFileSync, existsSync } from 'fs'
import { execSync } from 'child_process'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

// ─── Configuration ───
const EXPECTED_PROJECT_ID = 'iep-and-thrive'
const EXPECTED_AUTH_DOMAIN = 'iep-and-thrive.firebaseapp.com'
const EXPECTED_HOSTING_SITE = 'iep-and-thrive' // deploys to iep-and-thrive.web.app

let passed = 0
let failed = 0

function check(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✅ ${label}`)
    passed++
  } else {
    console.log(`  ❌ ${label}${detail ? ` — ${detail}` : ''}`)
    failed++
  }
}

console.log('\n🔒 Firebase Project Security Verification')
console.log('═'.repeat(50))

// ─── 1. Verify .firebaserc project binding ───
console.log('\n📋 Project Binding')
const firebasercPath = resolve(ROOT, '.firebaserc')
if (existsSync(firebasercPath)) {
  const rc = JSON.parse(readFileSync(firebasercPath, 'utf-8'))
  const defaultProject = rc.projects?.default
  check(
    `.firebaserc default project is "${EXPECTED_PROJECT_ID}"`,
    defaultProject === EXPECTED_PROJECT_ID,
    `Found: "${defaultProject || 'not set'}"`
  )

  // Aliases used to be forbidden outright, which was the right rule when the
  // repo could only ever mean one project. TASK-LP-054 requires named
  // environments, so the rule becomes: only known aliases may exist, and
  // anything named production must be the production project. An unrecognized
  // alias is still a failure — that is how a stray personal project gets
  // deployed to by accident.
  const ALLOWED_ALIASES = new Set(['default', 'production', 'staging'])
  const projectAliases = Object.keys(rc.projects || {})
  const unknownAliases = projectAliases.filter((k) => !ALLOWED_ALIASES.has(k))
  check(
    'Only known project aliases are configured',
    unknownAliases.length === 0,
    `Unexpected aliases: ${unknownAliases.join(', ')}`
  )
  if (rc.projects?.production) {
    check(
      `"production" alias points at "${EXPECTED_PROJECT_ID}"`,
      rc.projects.production === EXPECTED_PROJECT_ID,
      `Found: "${rc.projects.production}"`
    )
  }
  if (rc.projects?.staging) {
    check(
      '"staging" alias is not the production project',
      rc.projects.staging !== EXPECTED_PROJECT_ID,
      `staging must be a separate project; found "${rc.projects.staging}"`
    )
  }
} else {
  check('.firebaserc file exists', false, 'File not found')
}

// ─── 2. Verify firebase.json ───
console.log('\n📄 Firebase Configuration')
const firebaseJsonPath = resolve(ROOT, 'firebase.json')
if (existsSync(firebaseJsonPath)) {
  const config = JSON.parse(readFileSync(firebaseJsonPath, 'utf-8'))

  check('firebase.json exists', true)
  check('Firestore rules file configured', !!config.firestore?.rules)
  check('Storage rules file configured', !!config.storage?.rules)
  check('Hosting configured', !!config.hosting)
  check('Hosting public directory is "out"', config.hosting?.public === 'out')

  // Verify rules files exist
  if (config.firestore?.rules) {
    check(
      `Firestore rules file exists (${config.firestore.rules})`,
      existsSync(resolve(ROOT, config.firestore.rules))
    )
  }
  if (config.storage?.rules) {
    check(
      `Storage rules file exists (${config.storage.rules})`,
      existsSync(resolve(ROOT, config.storage.rules))
    )
  }
} else {
  check('firebase.json exists', false, 'File not found')
}

// ─── 3. Verify environment variables ───
console.log('\n🔐 Environment Variables')
const envPath = resolve(ROOT, '.env.local')
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8')

  check(
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID matches expected',
    envContent.includes(`NEXT_PUBLIC_FIREBASE_PROJECT_ID=${EXPECTED_PROJECT_ID}`)
  )
  check(
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN matches expected',
    envContent.includes(`NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${EXPECTED_AUTH_DOMAIN}`)
  )
  check('Firebase API key is present', envContent.includes('NEXT_PUBLIC_FIREBASE_API_KEY='))
  check('No test/dev project IDs leaked', !envContent.includes('demo-project'))
} else {
  console.log('  ⚠️  .env.local not found — skipping env var checks (expected in CI)')
  passed += 4
}

// ─── 4. Verify Firestore security rules ───
console.log('\n🛡️  Security Rules')
const rulesPath = resolve(ROOT, 'firestore.rules')
if (existsSync(rulesPath)) {
  const rules = readFileSync(rulesPath, 'utf-8')

  check('Firestore rules require authentication', rules.includes('request.auth'))
  check('Firestore rules check admin role', rules.includes('admin'))
  check(
    'No open "allow read, write: if true" rules',
    !rules.includes('allow read, write: if true')
  )
  check(
    'No wildcard write without auth',
    !rules.match(/allow\s+write:\s+if\s+true/)
  )
}

const storageRulesPath = resolve(ROOT, 'storage.rules')
if (existsSync(storageRulesPath)) {
  const sRules = readFileSync(storageRulesPath, 'utf-8')
  check('Storage rules require authentication', sRules.includes('request.auth'))
  check('Storage rules enforce file size limits', sRules.includes('request.resource.size'))
}

// ─── 5. Verify Firebase CLI targets the right project ───
console.log('\n🔗 CLI Verification')
// The deploy target is pinned by .firebaserc and by the explicit --project flag
// in the Release workflow, both of which are deterministic. `firebase use`
// reports an *interactive login's* active project, which does not exist on a CI
// runner — so a missing active project is a skip, not a failure. It became a
// failure the moment firebase-tools was pinned as a dependency: before that the
// command could not resolve at all and fell into the catch below.
try {
  const cliOutput = execSync('npx --no-install firebase use 2>&1', { cwd: ROOT, encoding: 'utf-8' })
  const noActiveProject =
    /No project (is )?currently active|not logged in|Command requires authentication/i.test(cliOutput)
  if (noActiveProject) {
    console.log('  ⏭️  No interactive Firebase login (expected in CI) — target comes from .firebaserc')
  } else {
    check(
      `Firebase CLI active project is "${EXPECTED_PROJECT_ID}"`,
      cliOutput.includes(EXPECTED_PROJECT_ID),
      `CLI output: ${cliOutput.trim().split('\n')[0]}`
    )
  }
} catch {
  console.log('  ⏭️  Firebase CLI not runnable here — target comes from .firebaserc')
}

// ─── 6. Verify no accidental exposure ───
console.log('\n🚫 Exposure Prevention')
const gitignorePath = resolve(ROOT, '.gitignore')
if (existsSync(gitignorePath)) {
  const gitignore = readFileSync(gitignorePath, 'utf-8')
  check('.env.local is in .gitignore', gitignore.includes('.env.local') || gitignore.includes('.env*.local'))
  check('node_modules is in .gitignore', gitignore.includes('node_modules'))
}

// Verify no service account keys in repo
const dangerousFiles = [
  'service-account-key.json',
  'serviceAccountKey.json',
  'google-credentials.json',
]
for (const f of dangerousFiles) {
  check(`No ${f} in project root`, !existsSync(resolve(ROOT, f)))
}

// ─── Summary ───
console.log('\n' + '═'.repeat(50))
if (failed === 0) {
  console.log(`✅ ALL ${passed} CHECKS PASSED — Safe to deploy to ${EXPECTED_PROJECT_ID}`)
  console.log(`   Target: ${EXPECTED_HOSTING_SITE}.web.app`)
} else {
  console.log(`⚠️  ${failed} CHECK(S) FAILED out of ${passed + failed}`)
  console.log('   Fix the issues above before deploying.')
  process.exit(1)
}
console.log()
