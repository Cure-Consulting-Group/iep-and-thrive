'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import SignatureCanvas from '@/components/portal/SignatureCanvas'
import { useAuth } from '@/lib/auth-context'
import { ENROLLMENT_AGREEMENT_TEXT, ENROLLMENT_AGREEMENT_VERSION } from '@/lib/enrollment-agreement-text'
import { sha256Hex } from '@/lib/e-signature'
import { CLOUD_FUNCTIONS } from '@/lib/functions-config'
import { getAuth } from 'firebase/auth'
import Link from 'next/link'

type ProgramTrack = 'full' | 'reading' | 'math'

export default function EnrollmentAgreementPage() {
  const router = useRouter()
  const search = useSearchParams()
  const { user, profile, loading: authLoading } = useAuth()
  const inquiryId = search.get('inquiryId') || ''
  const trackParam = (search.get('program') as ProgramTrack | null) || null

  const [docHash, setDocHash] = useState<string>('')
  const [signatureDataUrl, setSignatureDataUrl] = useState('')
  const [typedName, setTypedName] = useState('')
  const [studentName, setStudentName] = useState('')
  const [electronicConsent, setElectronicConsent] = useState(false)
  const [agreementConsent, setAgreementConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const programTrack: ProgramTrack = useMemo(() => {
    if (trackParam && ['full', 'reading', 'math'].includes(trackParam)) return trackParam
    return 'full'
  }, [trackParam])

  useEffect(() => {
    sha256Hex(ENROLLMENT_AGREEMENT_TEXT).then(setDocHash).catch(() => setDocHash(''))
  }, [])

  const parentName = profile?.displayName || ''

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!user) { setError("Please sign in before signing the agreement."); return }
    if (!inquiryId) { setError("Missing inquiryId. Return to the enrollment form."); return }
    if (!signatureDataUrl) { setError("Please draw your signature above."); return }
    if (typedName.trim().length < 2) { setError("Please type your full printed name."); return }
    if (!electronicConsent) { setError("Please tick the electronic-records consent checkbox."); return }
    if (!agreementConsent) { setError("Please confirm you have read and agree to the agreement."); return }
    setSubmitting(true)
    try {
      const auth = getAuth()
      const idToken = await auth.currentUser?.getIdToken()
      if (!idToken) throw new Error("Not signed in")
      const submitUrl = CLOUD_FUNCTIONS.submitEnrollmentAgreement
      const res = await fetch(submitUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + idToken,
        },
        body: JSON.stringify({
          inquiryId,
          documentVersion: ENROLLMENT_AGREEMENT_VERSION,
          documentHash: docHash,
          documentText: ENROLLMENT_AGREEMENT_TEXT,
          signatureDataUrl,
          typedName: typedName.trim(),
          electronicConsent: true,
          parentName: parentName || typedName.trim(),
          studentName: studentName.trim(),
          programTrack,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to record signature")
      const ck = await fetch(CLOUD_FUNCTIONS.stripeCheckout + "?program=" + programTrack)
      const ckJson = await ck.json().catch(() => ({}))
      if (ckJson && ckJson.url) { window.location.href = ckJson.url; return }
      router.push("/portal/agreements")
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }
  if (authLoading) {
    return <main id="main" className="py-20 px-6 text-center">Loading...</main>
  }

  if (!user) {
    const next = encodeURIComponent("/enroll/agreement?inquiryId=" + inquiryId + "&program=" + programTrack)
    return (
      <main id="main" className="py-20 px-6 text-center max-w-2xl mx-auto">
        <h1 className="font-display text-2xl text-forest mb-3">Sign in to continue</h1>
        <p className="text-warm-gray mb-6">
          You need a parent account before you can sign the enrollment agreement.
          This protects the audit record.
        </p>
        <Link href={"/login?next=" + next} className="inline-block bg-forest text-white px-5 py-3 rounded-full font-semibold">
          Sign in / Create account
        </Link>
      </main>
    )
  }
  return (
    <main id="main" className="bg-cream py-12 px-4 md:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-border p-6 md:p-10">
        <header className="mb-6">
          <p className="eyebrow mb-2">Enrollment - Step 2 of 3</p>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-forest mb-2">
            Sign the enrollment agreement
          </h1>
          <p className="text-warm-gray text-sm">
            Read the agreement below, draw your signature, type your printed name,
            and confirm both consent boxes. After signing you will be taken to
            secure Stripe checkout for the deposit.
          </p>
        </header>

        <section
          className="border border-border rounded-xl bg-cream-deep p-5 md:p-6 mb-6 max-h-96 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-text"
          aria-label="Enrollment agreement text"
        >
          {ENROLLMENT_AGREEMENT_TEXT}
        </section>

        <div className="text-xs text-text-muted mb-6 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <span className="font-semibold text-forest">Version</span>
            <div className="font-mono">{ENROLLMENT_AGREEMENT_VERSION}</div>
          </div>
          <div>
            <span className="font-semibold text-forest">Program</span>
            <div className="font-mono">{programTrack}</div>
          </div>
          <div>
            <span className="font-semibold text-forest">SHA-256</span>
            <div className="font-mono break-all">{docHash || "..."}</div>
          </div>
        </div>
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label htmlFor="studentName" className="block text-xs uppercase font-semibold text-text-muted mb-1.5">
              Student name (the child being enrolled)
            </label>
            <input
              id="studentName"
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full rounded-xl border border-border px-4 py-3 text-sm"
              placeholder="First Last"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-semibold text-text-muted mb-1.5">
              Your signature
            </label>
            <SignatureCanvas onChange={setSignatureDataUrl} ariaLabel="Draw your signature" />
          </div>

          <div>
            <label htmlFor="typedName" className="block text-xs uppercase font-semibold text-text-muted mb-1.5">
              Printed name (typed)
            </label>
            <input
              id="typedName"
              type="text"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              className="w-full rounded-xl border border-border px-4 py-3 text-sm"
              placeholder="Type your full legal name"
              required
            />
          </div>
          <label className="flex items-start gap-3 text-sm leading-relaxed">
            <input
              type="checkbox"
              checked={electronicConsent}
              onChange={(e) => setElectronicConsent(e.target.checked)}
              className="mt-1"
              required
            />
            <span>
              <strong>I consent to do business electronically.</strong>{" "}
              I agree to receive this agreement and related enrollment
              communications in electronic form, and I intend my signature
              above to bind me to this agreement under ESIGN and N.Y. State
              Technology Law. I understand I can request a paper copy at
              any time by emailing hello@iepandthrive.com.
            </span>
          </label>

          <label className="flex items-start gap-3 text-sm leading-relaxed">
            <input
              type="checkbox"
              checked={agreementConsent}
              onChange={(e) => setAgreementConsent(e.target.checked)}
              className="mt-1"
              required
            />
            <span>
              I have read the enrollment agreement above and agree to its
              terms (including the deposit refund policy and liability waiver).
            </span>
          </label>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-forest text-white py-3.5 text-sm font-semibold hover:bg-forest-mid disabled:opacity-60"
          >
            {submitting ? "Signing..." : "Sign and continue to deposit"}
          </button>
          <p className="text-xs text-text-muted text-center">
            We will email you a PDF copy at sign-time. You can re-download it
            anytime from <Link href="/portal/agreements" className="underline">Portal &rsaquo; Agreements</Link>.
          </p>
        </form>
      </div>
    </main>
  )
}
