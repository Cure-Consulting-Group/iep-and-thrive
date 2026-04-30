#!/usr/bin/env node
import { initializeApp, applicationDefault, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

if (!getApps().length) initializeApp({ credential: applicationDefault(), projectId: 'iep-and-thrive' })
const auth = getAuth()
const db = getFirestore()

const emails = [
  'parent-test-inquiry@iepandthrive.com',
  'parent-test-deposited@iepandthrive.com',
  'parent-test-enrolled@iepandthrive.com',
]

for (const email of emails) {
  const u = await auth.getUserByEmail(email)
  const userDoc = await db.collection('users').doc(u.uid).get()
  const studentsSnap = await db.collection('users').doc(u.uid).collection('students').get()
  console.log(`\n${email}`)
  console.log(`  uid: ${u.uid}`)
  console.log(`  user doc exists: ${userDoc.exists}, isTest: ${userDoc.data()?.isTest}, role: ${userDoc.data()?.role}`)
  console.log(`  students: ${studentsSnap.size}`)
  studentsSnap.docs.forEach((d) => {
    const s = d.data()
    console.log(`    - id=${d.id}, name="${s.name}", status=${s.enrollmentStatus}, track=${s.programTrack}`)
  })
}
