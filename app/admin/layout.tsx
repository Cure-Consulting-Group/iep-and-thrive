'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/lib/auth-context'

const adminLinks = [
  { label: 'Dashboard', href: '/admin', icon: '📊' },
  { label: 'Students', href: '/admin/students', icon: '🎓' },
  { label: 'Bookings', href: '/admin/bookings', icon: '📅' },
  { label: 'Slots', href: '/admin/slots', icon: '🕐' },
  { label: 'Resources', href: '/admin/resources', icon: '📁' },
  { label: 'Reports', href: '/admin/reports', icon: '📈' },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { profile, signOut } = useAuth()

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-cream">
        {/* Top bar */}
        <header className="sticky top-0 z-40 h-16 bg-forest text-white">
          <div className="mx-auto flex h-full items-center justify-between px-6 max-w-7xl">
            <div className="flex items-center gap-4">
              <Link href="/" className="font-display font-bold text-lg text-white">
                IEP <span className="text-amber">&</span> Thrive
              </Link>
              <span className="hidden sm:inline-block text-xs font-body bg-white/20 px-2.5 py-1 rounded-full">
                Admin
              </span>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/portal" className="text-sm font-body text-white/70 hover:text-white transition-colors">
                Parent Portal
              </Link>
              <span className="text-white/30">|</span>
              <span className="hidden sm:inline text-sm font-body text-white/70">
                {profile?.displayName}
              </span>
              <button
                onClick={() => signOut()}
                className="text-sm font-body text-white/70 hover:text-white transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl flex">
          {/* Sidebar */}
          <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-border bg-white min-h-[calc(100vh-4rem)] p-4 gap-1">
            {adminLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-body transition-all duration-200 ${
                    isActive
                      ? 'bg-forest text-white font-semibold'
                      : 'text-text-muted hover:bg-sage/20 hover:text-forest'
                  }`}
                >
                  <span className="text-base">{link.icon}</span>
                  {link.label}
                </Link>
              )
            })}
          </aside>

          {/* Main */}
          <main className="flex-1 p-6 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
