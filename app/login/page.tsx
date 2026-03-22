'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signInWithGoogle } = useAuth()
  const router = useRouter()

  const redirectAfterLogin = async () => {
    // Check Firestore profile to determine redirect
    const { doc, getDoc } = await import('firebase/firestore')
    const { db } = await import('@/lib/firebase')
    const { auth: firebaseAuth } = await import('@/lib/firebase')
    const uid = firebaseAuth.currentUser?.uid
    if (uid) {
      const snap = await getDoc(doc(db, 'users', uid))
      if (snap.exists() && snap.data().role === 'admin') {
        router.push('/admin')
        return
      }
    }
    router.push('/portal')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
      await redirectAfterLogin()
    } catch (err: unknown) {
      const firebaseError = err as { code?: string }
      if (firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/wrong-password' || firebaseError.code === 'auth/invalid-credential') {
        setError('Invalid email or password.')
      } else if (firebaseError.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    try {
      await signInWithGoogle()
      await redirectAfterLogin()
    } catch {
      setError('Google sign-in failed. Please try again.')
    }
  }

  return (
    <main id="main" className="min-h-screen flex items-center justify-center px-4 py-16 bg-cream">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="font-display font-bold text-2xl">
            <span className="text-forest">IEP</span>
            <span className="text-amber"> & </span>
            <span className="text-forest">Thrive</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-forest mt-4">
            Welcome Back
          </h1>
          <p className="text-text-muted font-body mt-2">
            Sign in to access your parent portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-md border border-border p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-body">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-forest font-body mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-cream/50 px-4 py-3 text-sm font-body text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest transition-all"
                placeholder="parent@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-forest font-body mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-cream/50 px-4 py-3 text-sm font-body text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-forest text-white py-3 text-sm font-semibold font-body transition-all duration-200 hover:bg-forest-mid disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-text-muted text-xs font-body">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 rounded-full border-2 border-border bg-white py-3 text-sm font-semibold font-body text-text transition-all duration-200 hover:bg-cream hover:border-forest/30"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Sign up link */}
        <p className="text-center mt-6 text-sm text-text-muted font-body">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-forest font-semibold hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </main>
  )
}
