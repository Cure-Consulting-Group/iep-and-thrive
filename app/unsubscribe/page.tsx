'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const UNSUBSCRIBE_URL = 'https://us-east1-iep-and-thrive.cloudfunctions.net/unsubscribe'

type UnsubState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; alreadyUnsubscribed: boolean }
  | { status: 'error'; message: string }

function UnsubscribeContent() {
  const params = useSearchParams()
  const token = params.get('token') || ''
  const [state, setState] = useState<UnsubState>({ status: 'idle' })

  useEffect(() => {
    if (!token) {
      setState({ status: 'error', message: 'Missing or invalid unsubscribe link.' })
      return
    }
    setState({ status: 'loading' })
    fetch(`${UNSUBSCRIBE_URL}?token=${encodeURIComponent(token)}`)
      .then(async (r) => {
        const data = await r.json().catch(() => ({}))
        if (r.ok && data.ok) {
          setState({ status: 'success', alreadyUnsubscribed: !!data.alreadyUnsubscribed })
        } else {
          setState({ status: 'error', message: data.error || `Server returned ${r.status}.` })
        }
      })
      .catch((err) => setState({ status: 'error', message: err.message || 'Network error.' }))
  }, [token])

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl border border-border p-8 text-center">
        <div className="mb-6">
          <span className="font-display font-bold text-2xl">
            <span className="text-forest">IEP</span>
            <span className="text-amber"> & </span>
            <span className="text-forest">Thrive</span>
          </span>
        </div>

        {state.status === 'loading' && (
          <p className="text-text-muted font-body">Updating your preferences…</p>
        )}

        {state.status === 'success' && (
          <>
            <h1 className="font-display font-bold text-forest text-xl mb-2">
              {state.alreadyUnsubscribed ? "You're already unsubscribed." : "You've been unsubscribed."}
            </h1>
            <p className="text-text-muted font-body text-sm mb-6 leading-relaxed">
              You'll no longer receive lifecycle or marketing emails from IEP &amp; Thrive.
              Transactional emails about your account (booking confirmations, payment receipts,
              attendance updates while a student is enrolled) will continue.
            </p>
            <p className="text-xs text-text-muted">
              Changed your mind? <Link href="/contact" className="text-forest underline">Contact us</Link> to resubscribe.
            </p>
          </>
        )}

        {state.status === 'error' && (
          <>
            <h1 className="font-display font-bold text-forest text-xl mb-2">
              We couldn't process that request.
            </h1>
            <p className="text-text-muted font-body text-sm mb-6">
              {state.message}
            </p>
            <p className="text-xs text-text-muted">
              If this keeps happening, <Link href="/contact" className="text-forest underline">contact us</Link>
              {' '}and we'll unsubscribe you manually.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <UnsubscribeContent />
    </Suspense>
  )
}
