'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { auth, db } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'
import { doc, getDoc } from 'firebase/firestore'
import { SignatureCanvas, SignatureCanvasHandle } from '@/components/portal/SignatureCanvas'
import { createSignatureRecord, sha256Hex } from '@/lib/e-signature'

const PHOTO_RELEASE_VERSION = '1.0.0'

const PHOTO_RELEASE_TEXT = `Photo & Video Release - IEP & Thrive Summer Intensive

1. Purpose
This release authorizes IEP & Thrive (a program of Cure Consulting Group LLC) (the "Program") to capture and use photographs and short video recordings of your child during the Summer 2026 intensive (July 7 - August 15, 2026, Long Island, NY).

We capture media for three purposes:
  a) Portfolio artifacts - photos of your child's work attached to their weekly progress record. Visible to you in the parent portal.
  b) Lesson documentation - short videos used internally for instructor self-review and for the family showcase on the final program day.
  c) Marketing & program advocacy (separate opt-in) - promotional use on iepandthrive.com, social media, family case studies, and grant/foundation reports. Children are never identified by full name in marketing materials without separate written consent.

2. Scope of Permission
By signing this release, you grant the Program a non-exclusive, royalty-free, perpetual license to capture, store, and use still photographs taken during program hours; short video clips (typically under 60 seconds) captured during program hours; and photographs of student work product.

The Program will NOT capture footage of your child outside of program hours, audio recordings of your child for any use outside the immediate family showcase, or identifying information (full name, school district, IEP details) in any media used outside the parent portal.

3. Marketing Use - Separate Opt-In
Marketing use (publication on iepandthrive.com, social media, written case studies, district sales decks) requires a separate, affirmative opt-in below. You may grant portfolio + lesson use without granting marketing use, and you may withdraw marketing consent at any time without affecting your child's enrollment.

4. Retention & Deletion
Portfolio + lesson media: retained for the duration of the program plus 12 months. Marketing media (if opted in): retained for up to 3 years; you may request deletion at any time. After the retention period, media is permanently deleted from cloud storage. The signed PDF of this release is retained as part of your child's enrollment record.

5. Withdrawal of Consent
You may withdraw this consent at any time by emailing hello@iepandthrive.com. On receipt, marketing-use media is removed within 14 days; portfolio media is preserved if its removal would compromise the CSE-ready final report; future media capture for your child stops immediately. Withdrawal does not retroactively invalidate uses that already occurred.

6. No Compensation
You acknowledge that no compensation will be paid for the use of media covered by this release, and that you are signing voluntarily.

7. Acknowledgement
By signing below, you confirm: you are the legal parent or guardian of the named student and have authority to grant this release; you have read and understood Sections 1 through 6; you understand that marketing use is a separate opt-in (Section 3) and that you may decline it without affecting your child's enrollment.

The electronic signature captured on this document constitutes a legally binding signature under the federal Electronic Signatures in Global and National Commerce Act (E-SIGN, 15 U.S.C. section 7001 et seq.) and the New York Electronic Signatures and Records Act (ESRA).
`

interface SignedDocRecord {
  signedAt: { seconds: number } | string
  pdfStoragePath?: string
  pdfDownloadUrl?: string
  documentVersion?: string
  marketingOptIn?: boolean
}

function formatDateLocal(d: Date): string {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function functionsBase(): string {
  // Hosting rewrites /<function> -> deployed function. In dev with the
  // Firebase emulator the caller can override via window.NEXT_PUBLIC_FUNCTIONS_URL.
  if (typeof window !== 'undefined') {
    const w = window as unknown as { NEXT_PUBLIC_FUNCTIONS_URL?: string }
    if (w.NEXT_PUBLIC_FUNCTIONS_URL) return w.NEXT_PUBLIC_FUNCTIONS_URL
  }
  return ''
}

export default function PhotoReleasePage() {
  const { user, profile, loading } = useAuth()
  const canvasRef = useRef<SignatureCanvasHandle | null>(null)
  const [hasSignature, setHasSignature] = useState(false)
  const [typedName, setTypedName] = useState('')
  const [consent, setConsent] = useState(false)
  const [marketingOptIn, setMarketingOptIn] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signed, setSigned] = useState<SignedDocRecord | null>(null)
  const [docHash, setDocHash] = useState('')

  useEffect(() => {
    sha256Hex(PHOTO_RELEASE_TEXT).then(setDocHash).catch(() => setDocHash(''))
  }, [])

  useEffect(() => {
    if (!user) return
    let cancelled = false
    ;(async () => {
      try {
        const ref = doc(db, 'users', user.uid, 'legalDocs', 'photoRelease')
        const snap = await getDoc(ref)
        if (!cancelled && snap.exists()) {
          setSigned(snap.data() as SignedDocRecord)
        }
      } catch (err) {
        console.warn('[photo-release] failed to check existing signature:', err)
      }
    })()
    return () => { cancelled = true }
  }, [user])

  const canSubmit = useMemo(
    () => !!user && hasSignature && typedName.trim().length >= 2 && consent && !submitting,
    [user, hasSignature, typedName, consent, submitting]
  )

  async function handleSubmit() {
    if (!canSubmit || !user) return
    setSubmitting(true)
    setError(null)
    try {
      const dataUrl = canvasRef.current?.getDataUrl()
      if (!dataUrl) throw new Error('Please draw your signature before submitting.')

      const unsigned = await createSignatureRecord({
        uid: user.uid,
        documentType: 'photoRelease',
        documentVersion: PHOTO_RELEASE_VERSION,
        documentText: PHOTO_RELEASE_TEXT,
        signatureDataUrl: dataUrl,
        typedName,
      })

      const idToken = await auth.currentUser?.getIdToken()
      if (!idToken) throw new Error('Authentication required. Please sign in again.')

      const url = functionsBase() + '/submitPhotoRelease'
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + idToken,
        },
        body: JSON.stringify({ unsigned, signatureDataUrl: dataUrl, marketingOptIn }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || ('Submit failed (' + res.status + ')'))
      }
      const json = (await res.json()) as { signedAt: string; pdfDownloadUrl?: string; pdfStoragePath?: string }
      setSigned({
        signedAt: json.signedAt,
        pdfDownloadUrl: json.pdfDownloadUrl,
        pdfStoragePath: json.pdfStoragePath,
        documentVersion: PHOTO_RELEASE_VERSION,
        marketingOptIn,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-100 rounded w-1/2 animate-pulse" />
        <div className="h-64 bg-gray-100 rounded animate-pulse" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-border bg-white p-6">
        <p className="font-body text-text">Please sign in to view and sign the photo/video release.</p>
        <Link href="/login" className="mt-3 inline-block font-body font-semibold text-forest hover:underline">
          Sign in &rarr;
        </Link>
      </div>
    )
  }

  if (signed) {
    const dt =
      typeof signed.signedAt === 'string'
        ? new Date(signed.signedAt)
        : new Date((signed.signedAt?.seconds || 0) * 1000)
    return (
      <div className="space-y-6">
        <header>
          <h1 className="font-display text-2xl font-bold text-forest">Photo & Video Release</h1>
          <p className="text-text-muted font-body text-sm mt-1">
            Signed on {formatDateLocal(dt)}.{' '}
            {signed.documentVersion ? 'Version ' + signed.documentVersion + '.' : ''}
          </p>
        </header>

        <div className="rounded-2xl border border-sage bg-sage-pale p-6">
          <p className="font-body font-semibold text-forest">Signed and on file.</p>
          <p className="text-sm font-body text-text mt-1">
            A copy was emailed to {profile?.email}. You can also download it below.
          </p>
          {signed.pdfDownloadUrl ? (
            <a
              href={signed.pdfDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-forest text-white font-body font-semibold px-4 py-2 hover:bg-forest-mid transition-colors"
            >
              Download signed PDF
            </a>
          ) : (
            <p className="text-xs font-body text-text-muted mt-3">
              Download link will appear once Storage finishes processing the PDF.
            </p>
          )}
          {typeof signed.marketingOptIn === 'boolean' ? (
            <p className="text-xs font-body text-text-muted mt-3">
              Marketing use: {signed.marketingOptIn ? 'opted in' : 'declined'}.
            </p>
          ) : null}
        </div>

        <Link href="/portal" className="font-body font-semibold text-forest hover:underline">
          &larr; Back to portal
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-forest">Photo & Video Release</h1>
        <p className="text-text-muted font-body text-sm mt-1">
          Required before any portfolio photos or showcase videos can be captured.
          Version {PHOTO_RELEASE_VERSION}.
        </p>
      </header>

      <article className="rounded-2xl border border-border bg-white p-6 space-y-4 max-h-96 overflow-y-auto">
        {PHOTO_RELEASE_TEXT.split('\n\n').map((para, i) => (
          <p key={i} className="font-body text-sm text-text leading-relaxed whitespace-pre-line">
            {para}
          </p>
        ))}
      </article>

      <section className="rounded-2xl border border-border bg-white p-6 space-y-5">
        <div>
          <label className="block text-sm font-body font-semibold text-forest mb-2">
            Sign here
          </label>
          <SignatureCanvas
            ref={canvasRef}
            ariaLabel="Photo release signature canvas"
            onChange={setHasSignature}
          />
        </div>

        <div>
          <label htmlFor="typed-name" className="block text-sm font-body font-semibold text-forest mb-2">
            Type your full legal name
          </label>
          <input
            id="typed-name"
            type="text"
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            className="w-full rounded-lg border border-border bg-cream px-3 py-2 font-body text-sm text-text focus:outline-none focus:border-forest"
            placeholder={profile?.displayName || 'Jane Doe'}
            autoComplete="name"
          />
          {profile?.displayName &&
            typedName.trim().length >= 2 &&
            typedName.trim().toLowerCase() !== profile.displayName.toLowerCase() ? (
            <p className="text-xs font-body text-amber mt-1">
              Heads up: this does not match your account name ({profile.displayName}). That is
              fine if you go by a different legal name; we record both.
            </p>
          ) : null}
        </div>

        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-forest"
            />
            <span className="text-sm font-body text-text">
              I have read and agree to the photo/video release above. I am the legal
              parent or guardian of the enrolled student.
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={marketingOptIn}
              onChange={(e) => setMarketingOptIn(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-forest"
            />
            <span className="text-sm font-body text-text">
              <strong>Optional:</strong> I also consent to marketing use of my child's
              image (Section 3 above). My child will not be identified by full name.
            </span>
          </label>
        </div>

        <details className="text-xs font-body text-text-muted">
          <summary className="cursor-pointer">Audit details (recorded with your signature)</summary>
          <dl className="mt-2 space-y-1">
            <div><dt className="inline font-semibold">Document version: </dt><dd className="inline">{PHOTO_RELEASE_VERSION}</dd></div>
            <div><dt className="inline font-semibold">Document hash: </dt><dd className="inline break-all">{docHash || '...'}</dd></div>
            <div><dt className="inline font-semibold">Signer (account): </dt><dd className="inline">{profile?.email}</dd></div>
            <div><dt className="inline font-semibold">Signed at: </dt><dd className="inline">set on submit (server time)</dd></div>
            <div><dt className="inline font-semibold">IP & user-agent: </dt><dd className="inline">captured server-side</dd></div>
          </dl>
        </details>

        {error ? (
          <div className="rounded-xl border border-amber bg-amber-light p-3">
            <p className="text-sm font-body text-text">{error}</p>
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full rounded-full bg-forest text-white font-body font-semibold py-3 hover:bg-forest-mid transition-colors disabled:bg-text-muted disabled:cursor-not-allowed"
        >
          {submitting ? 'Signing...' : 'Confirm & sign'}
        </button>
      </section>
    </div>
  )
}
