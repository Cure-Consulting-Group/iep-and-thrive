import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

// ─── Types ───

export type EnrollmentStatus = 'inquiry' | 'discovery' | 'deposited' | 'enrolled' | 'completed'
export type ProgramTrack = 'reading' | 'math' | 'full'

export interface Student {
  id: string
  parentId: string
  parentName: string
  parentEmail: string
  name: string
  dateOfBirth: string
  grade: string
  district: string
  programTrack: ProgramTrack
  enrollmentStatus: EnrollmentStatus
  medicalNotes: string
  iepDocumentUrl: string
  emergencyContacts: { name: string; phone: string; relationship: string }[]
  createdAt: Timestamp
  updatedAt: Timestamp
}

// ─── Operations ───

export async function getAllStudents(): Promise<Student[]> {
  // Students are stored as subcollections under users
  // We need to get all users first, then get their students
  const usersSnap = await getDocs(collection(db, 'users'))
  const allStudents: Student[] = []

  for (const userDoc of usersSnap.docs) {
    const userData = userDoc.data()
    const studentsRef = collection(db, 'users', userDoc.id, 'students')
    const studentsSnap = await getDocs(query(studentsRef, orderBy('createdAt', 'desc')))

    for (const studentDoc of studentsSnap.docs) {
      allStudents.push({
        id: studentDoc.id,
        parentId: userDoc.id,
        parentName: userData.displayName || '',
        parentEmail: userData.email || '',
        ...studentDoc.data(),
      } as Student)
    }
  }

  return allStudents
}

export async function getStudentsByParent(parentId: string): Promise<Student[]> {
  const studentsRef = collection(db, 'users', parentId, 'students')
  const q = query(studentsRef, orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)

  // Get parent info
  const parentDoc = await getDoc(doc(db, 'users', parentId))
  const parentData = parentDoc.data()

  return snap.docs.map((d) => ({
    id: d.id,
    parentId,
    parentName: parentData?.displayName || '',
    parentEmail: parentData?.email || '',
    ...d.data(),
  } as Student))
}

export async function addStudent(
  parentId: string,
  student: Omit<Student, 'id' | 'parentId' | 'parentName' | 'parentEmail' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const studentsRef = collection(db, 'users', parentId, 'students')
  const docRef = doc(studentsRef)

  await setDoc(docRef, {
    ...student,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return docRef.id
}

export async function updateStudent(
  parentId: string,
  studentId: string,
  updates: Partial<Omit<Student, 'id' | 'parentId' | 'parentName' | 'parentEmail' | 'createdAt'>>
) {
  return updateDoc(doc(db, 'users', parentId, 'students', studentId), {
    ...updates,
    updatedAt: serverTimestamp(),
  })
}

export async function updateEnrollmentStatus(
  parentId: string,
  studentId: string,
  status: EnrollmentStatus
) {
  return updateDoc(doc(db, 'users', parentId, 'students', studentId), {
    enrollmentStatus: status,
    updatedAt: serverTimestamp(),
  })
}
