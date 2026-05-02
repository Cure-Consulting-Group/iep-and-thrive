#!/usr/bin/env node

/**
 * E13 — Seed Test Cohort Accounts
 * ────────────────────────────────
 * Creates 3 Firebase Auth parent accounts at different cohort lifecycle
 * stages for solo-founder QA. Idempotent: deletes existing test users by
 * email before creating fresh.
 *
 * Authentication: requires GOOGLE_APPLICATION_CREDENTIALS env var pointing
 * to a service account JSON, OR `gcloud auth application-default login`
 * to be run before this script.
 *
 * Project guard: aborts if GCLOUD_PROJECT or GOOGLE_CLOUD_PROJECT is set
 * to anything other than `iep-and-thrive`.
 *
 * Usage:
 *   node scripts/seed-test-accounts.mjs
 *
 * Test accounts created:
 *   parent-test-inquiry@iepandthrive.com   (form submitted, no deposit)
 *   parent-test-deposited@iepandthrive.com (25% deposit paid)
 *   parent-test-enrolled@iepandthrive.com  (paid in full, intake done)
 *
 * Each user has `isTest: true` on their profile doc; weekly-digest and
 * attendance-notifications functions filter on this flag so test
 * accounts never receive production emails.
 *
 * Passwords follow the formula `TestPass123!{persona}`. Founder stores
 * the credentials in 1Password.
 */

import { initializeApp, applicationDefault, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

const PROJECT_ID = 'iep-and-thrive'

function assertEnvironment() {
  const project = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || ''
  if (project && project !== PROJECT_ID) {
    console.error(`ABORT: GCLOUD_PROJECT="${project}", expected "${PROJECT_ID}"`)
    process.exit(1)
  }
}

const PERSONAS = [
  {
    key: 'inquiry',
    email: 'parent-test-inquiry@iepandthrive.com',
    password: 'TestPass123!inquiry',
    displayName: '[TEST] Parent — Inquiry',
    parent: { phone: '(555) 010-0001' },
    student: {
      name: '[TEST] Avery Inquiry',
      dateOfBirth: '2017-09-15',
      grade: '3',
      district: 'Test District (Nassau)',
      programTrack: 'full',
      enrollmentStatus: 'inquiry',
      medicalNotes: '[TEST] Diagnosed dyslexia (per parent intake form). No allergies.',
      iepDocumentUrl: '',
      emergencyContacts: [
        { name: '[TEST] Emergency Contact', phone: '(555) 010-1001', relationship: 'Aunt' },
      ],
    },
  },
  {
    key: 'deposited',
    email: 'parent-test-deposited@iepandthrive.com',
    password: 'TestPass123!deposited',
    displayName: '[TEST] Parent — Deposited',
    parent: { phone: '(555) 010-0002' },
    student: {
      name: '[TEST] Riley Deposited',
      dateOfBirth: '2016-04-22',
      grade: '4',
      district: 'Test District (Suffolk)',
      programTrack: 'reading',
      enrollmentStatus: 'deposited',
      medicalNotes: '[TEST] ADHD with reading delay; takes Adderall 10mg morning dose.',
      iepDocumentUrl: '',
      emergencyContacts: [
        { name: '[TEST] Co-Parent', phone: '(555) 010-1002', relationship: 'Co-parent' },
      ],
    },
  },
  {
    key: 'enrolled',
    email: 'parent-test-enrolled@iepandthrive.com',
    password: 'TestPass123!enrolled',
    displayName: '[TEST] Parent — Enrolled',
    parent: { phone: '(555) 010-0003' },
    student: {
      name: '[TEST] Jordan Enrolled',
      dateOfBirth: '2017-12-03',
      grade: '3',
      district: 'Test District (Nassau)',
      programTrack: 'math',
      enrollmentStatus: 'enrolled',
      medicalNotes: '[TEST] Dyscalculia diagnosis; peanut allergy (EpiPen on file).',
      iepDocumentUrl: '',
      emergencyContacts: [
        { name: '[TEST] Grandparent', phone: '(555) 010-1003', relationship: 'Grandparent' },
      ],
    },
  },
]

const ADMIN_PERSONA = {
  key: 'admin',
  email: 'admin-test@iepandthrive.com',
  password: 'TestPass123!admin',
  displayName: '[TEST] Admin Instructor',
  phone: '(555) 010-9999',
}

async function deleteExistingByEmail(auth, email) {
  try {
    const existing = await auth.getUserByEmail(email)
    await auth.deleteUser(existing.uid)
    return existing.uid
  } catch (err) {
    if (err.code === 'auth/user-not-found') return null
    throw err
  }
}

async function deleteUserDoc(db, uid) {
  if (!uid) return
  const userRef = db.collection('users').doc(uid)
  // Clean up nested students subcollection first.
  const studentsSnap = await userRef.collection('students').get()
  const batch = db.batch()
  studentsSnap.docs.forEach((d) => batch.delete(d.ref))
  batch.delete(userRef)
  await batch.commit()
}

async function seedOne(auth, db, persona) {
  const oldUid = await deleteExistingByEmail(auth, persona.email)
  if (oldUid) await deleteUserDoc(db, oldUid)

  const created = await auth.createUser({
    email: persona.email,
    password: persona.password,
    displayName: persona.displayName,
    emailVerified: true,
  })

  const userRef = db.collection('users').doc(created.uid)
  await userRef.set({
    email: persona.email,
    displayName: persona.displayName,
    role: 'parent',
    phone: persona.parent.phone,
    isTest: true,
    createdAt: FieldValue.serverTimestamp(),
  })

  const studentRef = userRef.collection('students').doc()
  await studentRef.set({
    ...persona.student,
    isTest: true,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })

  return { uid: created.uid, studentId: studentRef.id, email: persona.email }
}

async function seedAdmin(auth, db) {
  const oldUid = await deleteExistingByEmail(auth, ADMIN_PERSONA.email)
  if (oldUid) await deleteUserDoc(db, oldUid)

  const created = await auth.createUser({
    email: ADMIN_PERSONA.email,
    password: ADMIN_PERSONA.password,
    displayName: ADMIN_PERSONA.displayName,
    emailVerified: true,
  })

  // Custom claim drives Firestore rules and ProtectedRoute requireAdmin guard.
  await auth.setCustomUserClaims(created.uid, { admin: true })

  await db.collection('users').doc(created.uid).set({
    email: ADMIN_PERSONA.email,
    displayName: ADMIN_PERSONA.displayName,
    role: 'admin',
    phone: ADMIN_PERSONA.phone,
    isTest: true,
    createdAt: FieldValue.serverTimestamp(),
  })

  return { uid: created.uid, email: ADMIN_PERSONA.email }
}

async function main() {
  assertEnvironment()

  if (!getApps().length) {
    initializeApp({ credential: applicationDefault(), projectId: PROJECT_ID })
  }
  const auth = getAuth()
  const db = getFirestore()

  console.log(`\nSeeding test cohort accounts in project: ${PROJECT_ID}`)
  console.log('═'.repeat(60))

  const results = []
  for (const persona of PERSONAS) {
    const r = await seedOne(auth, db, persona)
    results.push({ ...r, persona: persona.key, status: persona.student.enrollmentStatus })
    console.log(`  ✅ ${persona.key.padEnd(10)} → ${persona.email}  uid=${r.uid}`)
  }

  // Admin instructor account (custom claim admin:true).
  const adminRes = await seedAdmin(auth, db)
  console.log(`  ✅ admin      → ${adminRes.email}  uid=${adminRes.uid}`)

  console.log('═'.repeat(60))
  console.log(`\nDone. Credentials (store in 1Password under "IEP & Thrive — Test Accounts"):\n`)
  for (const persona of PERSONAS) {
    console.log(`  ${persona.email}`)
    console.log(`    password: ${persona.password}`)
  }
  console.log(`  ${ADMIN_PERSONA.email}`)
  console.log(`    password: ${ADMIN_PERSONA.password}`)
  console.log(`\nTo reset: node scripts/reset-test-accounts.mjs`)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
