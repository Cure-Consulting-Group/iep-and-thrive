'use client'

import { useState, useEffect } from 'react'

export default function UrgencyBanner() {
  const [dismissed, setDismissed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = sessionStorage.getItem('urgencyBannerDismissed')
    if (stored === 'true') {
      setDismissed(true)
    }
  }, [])

  const handleDismiss = () => {
    setDismissed(true)
    sessionStorage.setItem('urgencyBannerDismissed', 'true')
  }

  if (!mounted || dismissed) return null

  return (
    <div
      className="bg-amber text-white font-body"
      style={{ fontSize: '13px', fontWeight: 500, padding: '10px 2rem' }}
    >
      <div className="mx-auto flex items-center justify-between max-w-7xl">
        <p className="text-center flex-1">
          <span aria-hidden="true">🌿 </span>
          <strong>Summer 2026 enrollment is open.</strong> Reserve your
          child&apos;s spot — cohorts are limited to 6 students.{' '}
          <strong>Spots filling fast.</strong>
        </p>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss banner"
          className="ml-4 flex-shrink-0 text-white/80 hover:text-white transition-colors duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  )
}
