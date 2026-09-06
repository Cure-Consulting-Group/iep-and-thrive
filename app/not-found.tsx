import Link from 'next/link'

export default function NotFound() {
  return (
    <main id="main" className="min-h-[60vh] bg-cream px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow mb-3">404 · Page not found</p>
        <h1 className="text-4xl font-bold text-forest sm:text-5xl">
          This page took a different path.
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-text-muted">
          The link may be outdated or the address may have a typo. Let&apos;s get
          you back to a place that&apos;s ready to help.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-forest-mid"
        >
          Back to home
        </Link>
      </div>
    </main>
  )
}
