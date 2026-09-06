#!/usr/bin/env node

/**
 * E13 — Reset Test Cohort Accounts
 * ─────────────────────────────────
 * Deletes all Firebase Auth users + Firestore docs for accounts whose
 * email matches the test pattern. Use to clean state between QA passes
 * or before re-running the seed.
 *
 * Usage:
 *   E2E_SYNTHETIC_PROJECT_ID=<non-prod project> node scripts/reset-test-accounts.mjs
 *
 * Matches email prefix `parent-test-`; will not touch any other users.
 *
 * Project guard: this script DELETES accounts, so it refuses to run unless
 * E2E_SYNTHETIC_PROJECT_ID names a non-production project and the resolved
 * Firebase project agrees. The previous guard only compared GCLOUD_PROJECT
 * when it happened to be set, which meant an unset variable silently targeted
 * production. Matches the guard in seed-test-accounts.mjs (TASK-LP-011).
 */

import { initializeApp, applicationDefault, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

const PRODUCTION_PROJECT_ID = 'iep-and-thrive'
const SYNTHETIC_PROJECT_ENV = 'E2E_SYNTHETIC_PROJECT_ID'
const TEST_EMAIL_PREFIXES = ['parent-test-', 'admin-test']

function assertEnvironment() {
  const syntheticProject = process.env[SYNTHETIC_PROJECT_ENV]?.trim() || ''
  const resolvedProject =
    process.env.GCLOUD_PROJECT?.trim() ||
    process.env.GOOGLE_CLOUD_PROJECT?.trim() ||
    syntheticProject

  if (!syntheticProject) {
    console.error(`ABORT: Set ${SYNTHETIC_PROJECT_ENV} to the intended synthetic Firebase project.`)
    console.error('This script deletes accounts and will not default to any project.')
    process.exit(1)
  }
  if (resolvedProject === PRODUCTION_PROJECT_ID) {
    console.error(`ABORT: Refusing to reset production project "${PRODUCTION_PROJECT_ID}".`)
    process.exit(1)
  }
  if (resolvedProject !== syntheticProject) {
    console.error(
      `ABORT: Resolved Firebase project "${resolvedProject}" does not match ${SYNTHETIC_PROJECT_ENV}.`,
    )
    process.exit(1)
  }

  return syntheticProject
}

async function deleteUserCascading(db, uid) {
  const userRef = db.collection('users').doc(uid)
  const studentsSnap = await userRef.collection('students').get()
  const batch = db.batch()
  studentsSnap.docs.forEach((d) => batch.delete(d.ref))
  batch.delete(userRef)
  await batch.commit()
  return studentsSnap.size
}

async function main() {
  const PROJECT_ID = assertEnvironment()

  if (!getApps().length) {
    initializeApp({ credential: applicationDefault(), projectId: PROJECT_ID })
  }
  const auth = getAuth()
  const db = getFirestore()

  console.log(`\nResetting test accounts (prefixes 'parent-test-' / 'admin-test') in: ${PROJECT_ID}`)
  console.log('═'.repeat(60))

  let pageToken
  let deleted = 0
  let studentsDeleted = 0

  do {
    const list = await auth.listUsers(1000, pageToken)
    for (const user of list.users) {
      const email = user.email || ''
      if (!TEST_EMAIL_PREFIXES.some((pre) => email.startsWith(pre))) continue
      const studentCount = await deleteUserCascading(db, user.uid)
      await auth.deleteUser(user.uid)
      console.log(`  🗑️  ${email}  (uid=${user.uid}, students=${studentCount})`)
      deleted++
      studentsDeleted += studentCount
    }
    pageToken = list.pageToken
  } while (pageToken)

  console.log('═'.repeat(60))
  console.log(`Removed ${deleted} test users and ${studentsDeleted} student records.`)
  if (deleted === 0) console.log('(No test accounts found — nothing to reset.)')
}

main().catch((err) => {
  console.error('Reset failed:', err)
  process.exit(1)
})
