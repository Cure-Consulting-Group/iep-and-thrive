"use client"

import Script from 'next/script'
import { usePathname } from 'next/navigation'

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
const PUBLIC_MARKETING_ROUTES = new Set([
  '/',
  '/about',
  '/program',
  '/tutoring',
  '/faq',
  '/contact',
  '/enroll',
  '/summer-guide',
])

export function isPublicMarketingRoute(pathname: string | null): boolean {
  return pathname !== null && PUBLIC_MARKETING_ROUTES.has(pathname)
}

export default function GoogleAnalytics() {
  const pathname = usePathname()

  if (!GA_MEASUREMENT_ID || !isPublicMarketingRoute(pathname)) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  )
}
