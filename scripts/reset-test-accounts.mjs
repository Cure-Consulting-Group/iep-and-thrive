#!/usr/bin/env node

/**
 * E13 — Reset Test Cohort Accounts
 * ─────────────────────────────────
 * Deletes all Firebase Auth users + Firestore docs for accounts whose
 * email matches the test pattern. Use to clean state between QA passes
 * or before re-running the seed.
 *
 * Usage:
 *   node scripts/reset-test-accounts.mjs
 *
 * Matches email prefix `parent-test-`; will not touch any other users.
 */

import { initializeApp, applicationDefault, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

const PROJECT_ID = 'iep-and-thrive'
const TEST_EMAIL_PREFIXES = ['parent-test-', 'admin-test']

function assertEnvironment() {
  const project = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || ''
  if (project && project !== PROJECT_ID) {
    console.error(`ABORT: GCLOUD_PROJECT="${project}", expected "${PROJECT_ID}"`)
    process.exit(1)
  }
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
  assertEnvironment()

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
