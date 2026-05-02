/**
 * Shared e-signature primitives for IEP & Thrive (B6 photo release, E3
 * enrollment agreement, and any future e-signed legal docs).
 *
 * Coordination contract for Agent 5 (E3 enrollment agreement):
 *   - documentType is an open string; "photoRelease" and "enrollmentAgreement"
 *     are reserved.
 *   - documentVersion is semver-ish (e.g. "1.0.0"). Re-versioning is required
 *     whenever the rendered text changes; the documentHash captured at sign
 *     time MUST equal sha256(documentText) of the rendered template at sign
 *     time, so old versions remain verifiable.
 *   - signedAt / ip / userAgent are SERVER-SET ONLY — never trust the client
 *     for these. The client builds an `UnsignedAuditRecord` with the fields
 *     it CAN provide; the Cloud Function adds server-side fields and
 *     produces a full SignatureAuditRecord.
 *   - PDFs are generated server-side via pdf-lib (functions/) and stored at
 *     `legal-signatures/{uid}/{docId}/{slug}.pdf`. The client holds a
 *     download URL only.
 *
 * Why a shared lib (and not duplicated per doc-type): both B6 and E3 (and
 * future docs) need: (1) the same audit shape so the admin viewer can list
 * "all signed docs across types" with one query, (2) the same hash function
 * so tampering checks work uniformly, (3) the same PDF embedding so the
 * artifacts look consistent in litigation/CSE-meeting contexts.
 */

// ─── Types ───

export type SignatureDocumentType =
  | 'photoRelease'
  | 'enrollmentAgreement'
  | string

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
  /** Server-captured at submit time. */
  ip: string
  /** Server-captured at submit time (HTTP User-Agent header). */
  userAgent: string
  /** What the signer typed in the "Type your full name" box. */
  typedName: string
  /** GCS path under the legal-signatures/{uid}/{docId}/ prefix. */
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
 * available (browser + modern Node) and falls back gracefully. Used both for
 * the client-side `createSignatureRecord` step (so the doc hash is available
 * to display before submit) and on the server (to verify the client did not
 * tamper with the rendered text).
 */
export async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input)
  // Browsers + Node 18+ expose globalThis.crypto.subtle
  const subtle: SubtleCrypto | undefined =
    (globalThis as unknown as { crypto?: { subtle?: SubtleCrypto } }).crypto?.subtle
  if (!subtle) {
    throw new Error(
      '[e-signature] Web Crypto subtle not available. Install in a modern browser/Node 18+.'
    )
  }
  const buf = await subtle.digest('SHA-256', enc)
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
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
 * `pdf-lib` and lives in functions/src/photo-release.ts (and equivalent for
 * E3). This module exposes the type signature so client callers can rely on
 * a stable contract; clients should NOT call this directly — the server
 * always produces the canonical PDF as part of the submit flow.
 *
 * Exported as a named function (not a type) so test harnesses can mock it.
 */
export async function generateSignedPdf(
  _input: GeneratePdfInput
): Promise<Uint8Array> {
  throw new Error(
    '[e-signature] generateSignedPdf is implemented server-side only. ' +
      'Clients receive the rendered PDF via Storage URL after submit.'
  )
}

// ─── Server-side helper (functions/) ───
//
// `getServerSideAuditMeta(req)` — see functions/src/photo-release.ts. Lives
// there (not here) because it pulls Express/Functions request types we don't
// want to import in the client bundle. The shape is documented in the
// SignatureAuditRecord interface above (signedAt + ip + userAgent).
