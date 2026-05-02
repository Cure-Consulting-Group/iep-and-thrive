/**
 * E-Signature shared types & client helpers.
 *
 * SHARED ACROSS:
 *   - E3 Enrollment Agreement (this worktree)
 *   - B6 Photo/Video Release   (sibling worktree, parallel)
 *
 * Both flows produce the same shape of audit record + signed PDF; merge
 * resolution between the two worktrees should preserve a single source
 * of truth here. If they conflict, prefer the union of all documentType
 * values and keep the function signatures stable.
 *
 * ESIGN/UETA satisfaction summary (full prose lives in
 * docs/legal/enrollment-agreement.md Section 8):
 *   1. Consent to electronic records — captured on /enroll/agreement as
 *      a SEPARATE checkbox distinct from the signature itself.
 *   2. Intent to sign — drawn signature (canvas PNG) + typed printed name
 *      = two distinct affirmative acts.
 *   3. Association of signature with record — agreementHash (sha256 of
 *      the agreement text) is embedded in the PDF audit block; the
 *      canvas signature image is rendered into the same PDF.
 *   4. Record retention/integrity — PDF stored in GCS at
 *      gs://iep-and-thrive.firebasestorage.app/signedAgreements/{enrollmentId}.pdf,
 *      audit record in Firestore at enrollmentAgreements/{id}; both
 *      retained indefinitely (covered by E1 backup automation).
 *   5. Ability to receive a signed copy — emailed at sign-time + always
 *      downloadable from /portal/agreements.
 *   6. Withdrawal of consent disclosure — Section 8 of the enrollment
 *      agreement explains how (email hello@iepandthrive.com) and the
 *      effect (future communications switch to paper, prior records
 *      retained).
 */

export type SignedDocumentType =
  | "enrollmentAgreement"
  | "photoRelease"
  | string

export interface SignatureAuditRecord {
  uid: string
  documentType: SignedDocumentType
  documentVersion: string
  /** sha256 hex of the agreement text presented to the signer. */
  documentHash: string
  signedAt: string
  /** Originating IP captured from the X-Forwarded-For chain on the server. */
  ip: string
  /** User-Agent string at the moment of signing. */
  userAgent: string
  /** Printed name typed by the signer; satisfies UETA "intent to sign". */
  typedName: string
  /** GCS path to the canvas signature PNG (data:image/png) blob. */
  signatureImageStoragePath: string
  /** GCS path to the rendered signed PDF. */
  pdfStoragePath: string
}

/**
 * Compute sha256 hex of a UTF-8 string. Used to bind a signature to the
 * exact text the signer saw. Browser implementation uses Web Crypto;
 * server (Node) imports re-implement via node:crypto in the function code.
 */
export async function sha256Hex(text: string): Promise<string> {
  if (typeof window !== "undefined" && window.crypto?.subtle) {
    const buf = new TextEncoder().encode(text)
    const digest = await window.crypto.subtle.digest("SHA-256", buf)
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  }
  // Node fallback (build-time, SSR, or test runner).
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createHash } = require("crypto") as typeof import("crypto")
  return createHash("sha256").update(text, "utf8").digest("hex")
}

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
  programTrack: "full" | "reading" | "math" | string
}

export interface SubmitEnrollmentAgreementResponse {
  ok: boolean
  enrollmentId?: string
  pdfStoragePath?: string
  redirectTo?: string
  error?: string
}
