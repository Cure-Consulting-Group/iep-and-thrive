import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '5 Questions Every IEP Parent Should Ask Before Summer | IEP & Thrive',
  description:
    'A free parent guide from a credentialed NYC SPED interventionist. Know exactly what to ask before choosing a summer program for your child with an IEP.',
  openGraph: {
    title: '5 Questions Every IEP Parent Should Ask Before Summer | IEP & Thrive',
    description:
      'A free parent guide from a credentialed NYC SPED interventionist. Know exactly what to ask before choosing a summer program for your child with an IEP.',
    type: 'article',
  },
}

export default function SummerGuideLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
