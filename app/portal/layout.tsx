'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/lib/auth-context'

const portalLinks = [
  { label: 'Dashboard', href: '/portal', icon: '📊' },
  { label: 'My Bookings', href: '/portal/bookings', icon: '📅' },
  { label: 'Resources', href: '/portal/resources', icon: '📁' },
  { label: 'Progress Reports', href: '/portal/reports', icon: '📈' },
  { label: 'My Profile', href: '/portal/profile', icon: '👤' },
]

export default function PortalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { profile, signOut } = useAuth()

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-cream">
        {/* Top bar */}
        <header className="sticky top-0 z-40 h-16 bg-white/95 backdrop-blur-md border-b border-border">
          <div className="mx-auto flex h-full items-center justify-between px-6 max-w-7xl">
            <div className="flex items-center gap-4">
              <Link href="/" className="font-display font-bold text-lg">
                <span className="text-forest">IEP</span>
                <span className="text-amber"> & </span>
                <span className="text-forest">Thrive</span>
              </Link>
              <span className="hidden sm:inline-block text-xs font-body text-text-muted bg-sage/20 px-2.5 py-1 rounded-full">
                Parent Portal
              </span>
            </div>

            <div className="flex items-center gap-4">
              {profile?.role === 'admin' && (
                <>
                  <Link
                    href="/admin"
                    className="text-sm font-body font-semibold text-forest hover:text-forest-mid transition-colors"
                  >
                    Admin Dashboard
                  </Link>
                  <span className="text-text-muted/30">|</span>
                </>
              )}
              <span className="hidden sm:inline text-sm font-body text-text-muted">
                {profile?.displayName || profile?.email}
              </span>
              <button
                onClick={() => signOut()}
                className="text-sm font-body text-text-muted hover:text-forest transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl flex">
          {/* Sidebar — desktop */}
          <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-border bg-white min-h-[calc(100vh-4rem)] p-4 gap-1">
            {portalLinks.map((link) => {
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

          {/* Main content */}
          <main className="flex-1 p-6 md:p-8">
            {children}
          </main>
        </div>

        {/* Bottom nav — mobile */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-border">
          <div className="flex justify-around py-2">
            {portalLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex flex-col items-center gap-0.5 px-2 py-1 text-xs font-body transition-colors ${
                    isActive ? 'text-forest font-semibold' : 'text-text-muted'
                  }`}
                >
                  <span className="text-lg">{link.icon}</span>
                  <span className="truncate max-w-[60px]">{link.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </ProtectedRoute>
  )
}
