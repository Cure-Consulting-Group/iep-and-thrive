'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Program', href: '#program' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'FAQ', href: '#faq' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  return (
    <nav
      className={`sticky top-0 z-50 h-16 transition-all duration-200 ${
        scrolled
          ? 'bg-cream/95 backdrop-blur-md border-b border-border'
          : 'bg-cream border-b border-transparent'
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex h-full items-center justify-between px-8 max-w-7xl">
        {/* Logo */}
        <Link href="/" className="font-display font-bold" style={{ fontSize: '19px' }}>
          <span className="text-forest">IEP</span>
          <span className="text-amber"> & </span>
          <span className="text-forest">Thrive</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-text-muted hover:text-forest font-body text-sm transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#enroll"
            className="inline-flex items-center rounded-full bg-forest px-5 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-forest-mid"
          >
            Reserve a Spot
            <span className="ml-1" aria-hidden="true">&rarr;</span>
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          <span
            className={`block w-5 h-0.5 bg-forest transition-all duration-200 ${
              mobileOpen ? 'rotate-45 translate-y-1' : ''
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-forest transition-all duration-200 ${
              mobileOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-forest transition-all duration-200 ${
              mobileOpen ? '-rotate-45 -translate-y-1' : ''
            }`}
          />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-40 bg-cream" role="dialog" aria-label="Navigation menu">
          <div className="flex flex-col items-center justify-center gap-8 pt-16">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-forest font-display text-2xl font-semibold"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#enroll"
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center rounded-full bg-forest px-8 py-3 text-base font-semibold text-white transition-colors duration-200 hover:bg-forest-mid"
            >
              Reserve a Spot
              <span className="ml-1" aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}
