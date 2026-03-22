import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us | IEP & Thrive',
  description:
    'Get in touch with the IEP & Thrive team. Ask questions, request an IEP review, or book a free discovery call. Serving Long Island, NY.',
}

const contactJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'IEP & Thrive',
  email: 'hello@iepandthrive.com',
  url: 'https://iepandthrive.com/contact',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Long Island',
    addressRegion: 'NY',
  },
  areaServed: ['Nassau County', 'Suffolk County', 'Long Island'],
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      {children}
    </>
  )
}
