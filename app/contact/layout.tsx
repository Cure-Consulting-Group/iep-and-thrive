import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us | IEP & Thrive',
  description:
    'Get in touch with the IEP & Thrive team. Ask questions, request an IEP review, or book a free discovery call. Serving Long Island, NY.',
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
