'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  requireAdmin?: boolean
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
      } else if (requireAdmin && profile?.role !== 'admin') {
        router.push('/portal')
      }
    }
  }, [user, profile, loading, requireAdmin, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-forest/20 border-t-forest rounded-full animate-spin" />
          <p className="text-text-muted font-body text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return null
  if (requireAdmin && profile?.role !== 'admin') return null

  return <>{children}</>
}
