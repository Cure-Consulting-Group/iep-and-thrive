import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import '@/styles/globals.css'

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '600', '700'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'IEP & Thrive | SPED Summer Intensive — Long Island, NY',
  description:
    'An evidence-based summer intensive for students with IEPs and learning differences on Long Island. Led by a credentialed NYC SPED interventionist. Small groups, IEP-aligned, 6 weeks.',
  keywords: [
    'SPED tutor Long Island',
    'IEP summer program NYC',
    'dyslexia tutoring Nassau County',
    'special education summer program LI',
    'Orton-Gillingham Long Island',
  ],
  openGraph: {
    title: 'IEP & Thrive — SPED Summer Intensive',
    description: 'Your child deserves a summer that builds — not breaks.',
    url: 'https://iepandthrive.com',
    siteName: 'IEP & Thrive',
    locale: 'en_US',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${playfairDisplay.variable} ${dmSans.variable}`}
    >
      <body className="font-body bg-cream text-text antialiased">
        <a href="#main" className="skip-to-content">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  )
}
