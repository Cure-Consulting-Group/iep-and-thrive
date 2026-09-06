'use client'

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react'
import {
  User,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

export interface UserProfile {
  uid: string
  email: string | null
  displayName: string | null
  role: 'parent' | 'admin'
  phone: string
  createdAt: unknown
  isTest?: boolean
  unsubscribed?: boolean
  unsubscribedAt?: unknown
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const googleProvider = new GoogleAuthProvider()

async function getOrCreateProfile(user: User): Promise<UserProfile> {
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)

  if (snap.exists()) {
    return { uid: user.uid, ...snap.data() } as UserProfile
  }

  // First-time user — create profile
  const newProfile: Omit<UserProfile, 'uid'> = {
    email: user.email,
    displayName: user.displayName,
    role: 'parent',
    phone: '',
    createdAt: serverTimestamp(),
  }

  await setDoc(ref, newProfile)
  return { uid: user.uid, ...newProfile }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Mirrors `user` for the listener, which closes over empty deps.
  const currentUidRef = useRef<string | null>(null)

  useEffect(() => {
    let generation = 0
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      const currentGeneration = ++generation
      // onIdTokenChanged also fires on Firebase's silent ~hourly token refresh.
      // Tearing the tree down then would remount every ProtectedRoute child and
      // discard in-progress form state, so only reset on a real identity change.
      const isSameUserRefresh =
        firebaseUser !== null && currentUidRef.current === firebaseUser.uid
      currentUidRef.current = firebaseUser?.uid ?? null
      setUser(firebaseUser)
      if (!isSameUserRefresh) {
        setLoading(true)
        setProfile(null)
      }
      if (firebaseUser) {
        try {
          const [userProfile, token] = await Promise.all([
            getOrCreateProfile(firebaseUser),
            firebaseUser.getIdTokenResult(),
          ])
          if (currentGeneration !== generation) return
          // Match Firestore/Storage authorization; persisted profile roles
          // are historical display data, never an authority source.
          setProfile({ ...userProfile, uid: firebaseUser.uid,
            role: token.claims.admin === true ? 'admin' : 'parent' })
        } catch (err) {
          if (currentGeneration !== generation) return
          console.error('Failed to load profile:', err)
          // A refresh that fails transiently must not drop the role and bounce
          // an admin to /portal; keep the profile already on screen.
          if (!isSameUserRefresh) setProfile(null)
        }
      }
      // Always clear, even on a same-user refresh: an initial load still in
      // flight when a refresh supersedes it would otherwise never settle.
      if (currentGeneration === generation) setLoading(false)
    })

    return () => { generation++; unsubscribe() }
  }, [])

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName })
  }

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider)
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
  }

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signIn, signUp, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
