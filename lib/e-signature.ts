/**
 * Shared e-signature primitives for IEP & Thrive (B6 photo release, E3
 * enrollment agreement, and any future e-signed legal docs).
 *
 * SHARED ACROSS:
 *   - B6 Photo/Video Release  (functions/src/photo-release.ts)
 *   - E3 Enrollment Agreement (functions/src/e-signature/)
 *
 * ESIGN/UETA satisfaction summary (full prose lives in
 * docs/legal/enrollment-agreement.md Section 8 and docs/legal/photo-release.md):
 *   1. Consent to electronic records — captured as a SEPARATE checkbox
 *      distinct from the signature itself.
 *   2. Intent to sign — drawn signature (canvas PNG) + typed printed name
 *      = two distinct affirmative acts.
 *   3. Association of signature with record — documentHash (sha256 of
 *      the rendered text) is embedded in the PDF audit block; the canvas
 *      signature image is rendered into the same PDF.
 *   4. Record retention/integrity — PDFs stored in GCS, audit record in
 *      Firestore; both retained indefinitely (covered by E1 backup
 *      automation).
 *   5. Ability to receive a signed copy — emailed at sign-time + always
 *      downloadable from /portal/agreements.
 *   6. Withdrawal of consent disclosure — covered in legal docs.
 *
 * Coordination contract:
 *   - documentType is an open string; "photoRelease" and "enrollmentAgreement"
 *     are reserved.
 *   - documentVersion is semver-ish (e.g. "1.0.0"). Re-versioning is required
 *     whenever the rendered text changes; the documentHash captured at sign
 *     time MUST equal sha256(documentText) of the rendered template at sign
 *     time, so old versions remain verifiable.
 *   - signedAt / ip / userAgent are SERVER-SET ONLY — never trust the client
 *     for these.
 *   - PDFs are generated server-side via pdf-lib (functions/) and stored at
 *     `legal-signatures/{uid}/{docId}/{slug}.pdf` (B6) or
 *     `signedAgreements/{enrollmentId}.pdf` (E3). The client holds a
 *     download URL only.
 */

// ─── Types ───

export type SignatureDocumentType =
  | 'photoRelease'
  | 'enrollmentAgreement'
  | string

/** Back-compat alias — older E3 code imports `SignedDocumentType`. */
export type SignedDocumentType = SignatureDocumentType

export interface SignatureAuditRecord {
  /** Firebase Auth uid of the signer (parent). */
  uid: string
  documentType: SignatureDocumentType
  /** Semver of the document text at sign time (front-matter `documentVersion`). */
  documentVersion: string
  /** sha256 hex of the exact rendered text shown to the signer. */
  documentHash: string
  /** ISO8601, server-set. */
  signedAt: string
  /** Server-captured at submit time (X-Forwarded-For chain). */
  ip: string
  /** Server-captured at submit time (HTTP User-Agent header). */
  userAgent: string
  /** What the signer typed in the "Type your full name" box. */
  typedName: string
  /** GCS path of the canvas signature PNG. */
  signatureImageStoragePath: string
  /** GCS path of the rendered PDF. */
  pdfStoragePath: string
}

/**
 * Subset of `SignatureAuditRecord` the CLIENT can produce. Fields populated
 * server-side (signedAt, ip, userAgent, signatureImageStoragePath,
 * pdfStoragePath) are intentionally absent here.
 */
export type UnsignedAuditRecord = Omit<
  SignatureAuditRecord,
  'ip' | 'userAgent' | 'signedAt' | 'signatureImageStoragePath' | 'pdfStoragePath'
>

// ─── Hashing ───

/**
 * Compute a deterministic sha256 hex digest of a string. Uses Web Crypto when
 * available (browser + modern Node) and falls back to node:crypto for
 * SSR/test contexts.
 */
export async function sha256Hex(input: string): Promise<string> {
  const subtle: SubtleCrypto | undefined =
    (globalThis as unknown as { crypto?: { subtle?: SubtleCrypto } }).crypto?.subtle
  if (subtle) {
    const enc = new TextEncoder().encode(input)
    const buf = await subtle.digest('SHA-256', enc)
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }
  // Node fallback (SSR, test runner, or older Node without WebCrypto)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createHash } = require('crypto') as typeof import('crypto')
  return createHash('sha256').update(input, 'utf8').digest('hex')
}

// ─── Client-side record builder ───

export interface CreateSignatureInput {
  uid: string
  documentType: SignatureDocumentType
  documentVersion: string
  /** Exact text the signer saw on the page. Used to compute documentHash. */
  documentText: string
  /** PNG data URL from <SignatureCanvas>.toDataURL('image/png'). */
  signatureDataUrl: string
  typedName: string
}

/**
 * Build the client-side portion of the audit record. The Cloud Function
 * receives this plus the `signatureDataUrl` and produces the full
 * `SignatureAuditRecord` (adding ip/userAgent/signedAt and storage paths).
 *
 * NOTE: `signatureDataUrl` is intentionally NOT in the returned record — it
 * is uploaded as a separate field in the request body so the Cloud Function
 * can persist the PNG to Storage and reference it by path.
 */
export async function createSignatureRecord(
  input: CreateSignatureInput
): Promise<UnsignedAuditRecord> {
  if (!input.uid) throw new Error('createSignatureRecord: uid required')
  if (!input.documentType) throw new Error('createSignatureRecord: documentType required')
  if (!input.documentVersion) throw new Error('createSignatureRecord: documentVersion required')
  if (!input.documentText) throw new Error('createSignatureRecord: documentText required')
  if (!input.signatureDataUrl || !input.signatureDataUrl.startsWith('data:image/png')) {
    throw new Error('createSignatureRecord: signatureDataUrl must be a data:image/png URL')
  }
  const trimmedName = input.typedName.trim()
  if (trimmedName.length < 2) {
    throw new Error('createSignatureRecord: typedName must be at least 2 characters')
  }

  const documentHash = await sha256Hex(input.documentText)

  return {
    uid: input.uid,
    documentType: input.documentType,
    documentVersion: input.documentVersion,
    documentHash,
    typedName: trimmedName,
  }
}

// ─── PDF generation (interface only — implementation lives in functions/) ───

export interface GeneratePdfInput {
  documentText: string
  signatureDataUrl: string
  auditRecord: SignatureAuditRecord
}

/**
 * Generate a signed PDF embedding the document text, the signature image,
 * and the full audit block. Implementation note: the actual rendering uses
 * `pdf-lib` and lives in functions/src/photo-release.ts (B6) and
 * functions/src/e-signature/pdf-generator.ts (E3). This module exposes the
 * type signature so client callers can rely on a stable contract; clients
 * should NOT call this directly — the server always produces the canonical
 * PDF as part of the submit flow.
 */
export async function generateSignedPdf(
  _input: GeneratePdfInput
): Promise<Uint8Array> {
  throw new Error(
    '[e-signature] generateSignedPdf is implemented server-side only. ' +
      'Clients receive the rendered PDF via Storage URL after submit.'
  )
}

// ─── E3 enrollment-agreement submit payload ───

/**
 * Client-side payload for posting an enrollment agreement signature to
 * functions/src/e-signature/index.ts:submitEnrollmentAgreement.
 *
 * - signatureDataUrl: data:image/png;base64,... from canvas.toDataURL
 * - typedName: signer-typed printed name
 * - electronicConsent: true ONLY if the signer ticked the SEPARATE
 *   ESIGN consent checkbox (NOT the signature itself).
 * - documentVersion / documentHash: the version + hash of the text the
 *   signer saw, computed client-side from the rendered agreement.
 * - inquiryId: links the agreement back to the enrollment inquiry that
 *   preceded it (so the post-sign Stripe redirect knows the program).
 */
export interface SubmitEnrollmentAgreementInput {
  inquiryId: string
  documentVersion: string
  documentHash: string
  documentText: string
  signatureDataUrl: string
  typedName: string
  electronicConsent: boolean
  parentName: string
  studentName?: string
  programTrack: 'full' | 'reading' | 'math' | string
}

export interface SubmitEnrollmentAgreementResponse {
  ok: boolean
  enrollmentId?: string
  pdfStoragePath?: string
  redirectTo?: string
  error?: string
}
