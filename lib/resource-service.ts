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
  increment,
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

export interface Resource {
  id: string
  title: string
  description: string
  category: 'handbook' | 'worksheet' | 'form' | 'other'
  visibility: 'all' | 'enrolled'
  fileName: string
  fileUrl: string
  fileSize: number
  storagePath: string
  downloadCount: number
  uploadedBy: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

// ─── Operations ───

const resourcesRef = collection(db, 'resources')

export async function uploadResource(
  file: File,
  meta: { title: string; description: string; category: Resource['category']; visibility: Resource['visibility'] },
  uploadedBy: string,
  onProgress?: (pct: number) => void
): Promise<string> {
  const docRef = doc(resourcesRef)
  const storagePath = `resources/${docRef.id}/${file.name}`
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
          const fileUrl = await getDownloadURL(uploadTask.snapshot.ref)
          await import('firebase/firestore').then(({ setDoc }) =>
            setDoc(docRef, {
              ...meta,
              fileName: file.name,
              fileUrl,
              fileSize: file.size,
              storagePath,
              downloadCount: 0,
              uploadedBy,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
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

export async function getAllResources(): Promise<Resource[]> {
  const q = query(resourcesRef, orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Resource))
}

export async function getResourcesByCategory(category: Resource['category']): Promise<Resource[]> {
  const q = query(resourcesRef, where('category', '==', category), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Resource))
}

export async function getVisibleResources(visibility: 'all' | 'enrolled' = 'all'): Promise<Resource[]> {
  let q
  if (visibility === 'all') {
    q = query(resourcesRef, where('visibility', '==', 'all'), orderBy('createdAt', 'desc'))
  } else {
    q = query(resourcesRef, orderBy('createdAt', 'desc'))
  }
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Resource))
}

export async function incrementDownloadCount(resourceId: string) {
  return updateDoc(doc(db, 'resources', resourceId), {
    downloadCount: increment(1),
  })
}

export async function deleteResource(resourceId: string) {
  const snap = await getDoc(doc(db, 'resources', resourceId))
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
  return deleteDoc(doc(db, 'resources', resourceId))
}

export async function updateResource(
  resourceId: string,
  updates: Partial<Pick<Resource, 'title' | 'description' | 'category' | 'visibility'>>
) {
  return updateDoc(doc(db, 'resources', resourceId), {
    ...updates,
    updatedAt: serverTimestamp(),
  })
}
