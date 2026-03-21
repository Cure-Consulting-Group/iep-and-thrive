import Link from 'next/link'

const programLinks = [
  { label: 'Full Academic Intensive', href: '/program#full-academic' },
  { label: 'Reading & Language Intensive', href: '/program#reading' },
  { label: 'Math & Numeracy Intensive', href: '/program#math' },
  { label: 'IEP Advocacy Services', href: '/contact' },
]

const enrollLinks = [
  { label: 'Reserve a Spot', href: '/enroll' },
  { label: 'Book Discovery Call', href: '/contact' },
  { label: 'Tuition & Deposits', href: '/program#pricing' },
  { label: 'FAQ', href: '/faq' },
]

const contactLinks = [
  { label: 'hello@iepandthrive.com', href: 'mailto:hello@iepandthrive.com' },
  { label: 'Long Island, NY', href: '#' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
]

export default function Footer() {
  return (
    <footer className="bg-[#111810] text-white/60" role="contentinfo">
      <div className="mx-auto max-w-7xl px-8 py-10 md:py-[3rem] md:px-12 lg:px-[5rem]">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          {/* Column 1 — Logo + description */}
          <div>
            <Link href="/" className="font-display text-xl font-bold">
              <span className="text-white">IEP</span>
              <span className="text-sage"> & </span>
              <span className="text-white">Thrive</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed max-w-xs">
              A specialized SPED summer intensive for students with IEPs and
              learning differences on Long Island, NY. Led by a credentialed NYC
              interventionist. Powered by Cure Consulting Group.
            </p>
          </div>

          {/* Column 2 — Program */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white/80 font-body">
              Program
            </h4>
            <ul className="space-y-2.5">
              {programLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Enroll */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white/80 font-body">
              Enroll
            </h4>
            <ul className="space-y-2.5">
              {enrollLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Contact */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-white/80 font-body">
              Contact
            </h4>
            <ul className="space-y-2.5">
              {contactLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-8 py-6 text-xs md:flex-row md:px-12 lg:px-[5rem]">
          <p>
            &copy; 2026 IEP &amp; Thrive &middot; A Cure Consulting Group
            program &middot; All rights reserved.
          </p>
          <p>Serving Nassau &amp; Suffolk County, Long Island, NY</p>
        </div>
      </div>
    </footer>
  )
}
