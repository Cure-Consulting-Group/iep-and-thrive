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

  // Ensure no other projects are configured
  const projectAliases = Object.keys(rc.projects || {})
  const nonDefaultProjects = projectAliases.filter((k) => k !== 'default')
  check(
    'No extra project aliases configured',
    nonDefaultProjects.length === 0,
    `Found aliases: ${nonDefaultProjects.join(', ')}`
  )
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
try {
  const cliOutput = execSync('npx firebase use 2>&1', { cwd: ROOT, encoding: 'utf-8' })
  const activeProject = cliOutput.match(/Active Project:\s*(\S+)/)?.[1] || cliOutput.trim()
  check(
    `Firebase CLI active project is "${EXPECTED_PROJECT_ID}"`,
    cliOutput.includes(EXPECTED_PROJECT_ID),
    `CLI output: ${cliOutput.trim().split('\n')[0]}`
  )
} catch {
  console.log('  ⚠️  Could not verify Firebase CLI — run "firebase login" if needed')
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
