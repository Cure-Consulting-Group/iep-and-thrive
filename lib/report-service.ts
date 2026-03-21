import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTaskSnapshot,
} from 'firebase/storage'
import { db, storage } from '@/lib/firebase'

// ─── Types ───

export interface ProgressReport {
  id: string
  studentId: string
  studentName: string
  parentId: string
  weekNumber: number       // 1–6 or 7 for "Final"
  reportUrl: string
  fileName: string
  storagePath: string
  goalsTargeted: string
  accuracyPercentage: number
  engagementNotes: string
  homePractice: string
  publishedAt: Timestamp
  viewedAt: Timestamp | null
  createdAt: Timestamp
}

// ─── Operations ───

const reportsRef = collection(db, 'progressReports')

export async function uploadReport(
  file: File,
  meta: {
    studentId: string
    studentName: string
    parentId: string
    weekNumber: number
    goalsTargeted: string
    accuracyPercentage: number
    engagementNotes: string
    homePractice: string
  },
  onProgress?: (pct: number) => void
): Promise<string> {
  const docRef = doc(reportsRef)
  const storagePath = `reports/${meta.studentId}/${docRef.id}/${file.name}`
  const storageRefObj = ref(storage, storagePath)

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRefObj, file)

    uploadTask.on(
      'state_changed',
      (snapshot: UploadTaskSnapshot) => {
        const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
        onProgress?.(pct)
      },
      (error) => reject(error),
      async () => {
        try {
          const reportUrl = await getDownloadURL(uploadTask.snapshot.ref)
          await import('firebase/firestore').then(({ setDoc }) =>
            setDoc(docRef, {
              ...meta,
              reportUrl,
              fileName: file.name,
              storagePath,
              publishedAt: serverTimestamp(),
              viewedAt: null,
              createdAt: serverTimestamp(),
            })
          )
          resolve(docRef.id)
        } catch (err) {
          reject(err)
        }
      }
    )
  })
}

export async function getAllReports(): Promise<ProgressReport[]> {
  const q = query(reportsRef, orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ProgressReport))
}

export async function getReportsByStudent(studentId: string): Promise<ProgressReport[]> {
  const q = query(reportsRef, where('studentId', '==', studentId), orderBy('weekNumber', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ProgressReport))
}

export async function getReportsByParent(parentId: string): Promise<ProgressReport[]> {
  const q = query(reportsRef, where('parentId', '==', parentId), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ProgressReport))
}

export async function markReportViewed(reportId: string) {
  return updateDoc(doc(db, 'progressReports', reportId), {
    viewedAt: serverTimestamp(),
  })
}

export async function deleteReport(reportId: string) {
  const snap = await getDoc(doc(db, 'progressReports', reportId))
  if (snap.exists()) {
    const data = snap.data()
    if (data.storagePath) {
      try {
        await deleteObject(ref(storage, data.storagePath))
      } catch {
        // File may already be deleted
      }
    }
  }
  return deleteDoc(doc(db, 'progressReports', reportId))
}
