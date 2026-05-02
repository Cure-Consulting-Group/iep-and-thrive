/**
 * E3 — Enrollment Agreement e-signature Cloud Functions.
 * See lib/e-signature.ts for the ESIGN/UETA satisfaction summary.
 */

import { onRequest } from "firebase-functions/v2/https"
import * as admin from "firebase-admin"
import * as crypto from "crypto"
import { z } from "zod"
import { extractAuditMetadata } from "./audit"
import { generateSignedPdf } from "./pdf-generator"
import { sendEmailWithResult, logEmail } from "../email-service"
import { signedAgreementDeliveryTemplate } from "../email-templates"

const submitSchema = z.object({
  inquiryId: z.string().min(1),
  documentVersion: z.string().min(1),
  documentHash: z.string().regex(/^[a-f0-9]{64}$/i),
  documentText: z.string().min(50),
  signatureDataUrl: z.string().regex(/^data:image\/png;base64,/i),
  typedName: z.string().min(2),
  electronicConsent: z.literal(true),
  parentName: z.string().min(2),
  studentName: z.string().optional(),
  programTrack: z.enum(["full", "reading", "math"]),
})

const ALLOWED_ORIGINS = [
  "https://iep-and-thrive.web.app",
  "https://iepandthrive.com",
  /localhost/,
]

function sha256Hex(text: string): string {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex")
}

async function verifyAuth(req: import("firebase-functions/v2/https").Request): Promise<string | null> {
  const authHeader = req.headers.authorization || ""
  if (!authHeader.startsWith("Bearer ")) return null
  const idToken = authHeader.slice(7)
  try {
    const decoded = await admin.auth().verifyIdToken(idToken)
    return decoded.uid
  } catch (err) {
    console.error("[e-signature] verifyIdToken failed", err)
    return null
  }
}
export const submitEnrollmentAgreement = onRequest(
  {
    region: "us-east1",
    cors: ALLOWED_ORIGINS,
    memory: "512MiB",
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ ok: false, error: "Method not allowed" })
      return
    }

    const uid = await verifyAuth(req)
    if (!uid) {
      res.status(401).json({ ok: false, error: "Authentication required" })
      return
    }

    let payload
    try {
      payload = submitSchema.parse(req.body)
    } catch (err) {
      res.status(400).json({ ok: false, error: "Invalid payload" })
      return
    }

    const recomputed = sha256Hex(payload.documentText)
    if (recomputed !== payload.documentHash.toLowerCase()) {
      res.status(400).json({ ok: false, error: "documentHash mismatch" })
      return
    }

    const audit = extractAuditMetadata(req)
    const enrollmentId = admin.firestore().collection("enrollmentAgreements").doc().id
    const bucket = admin.storage().bucket()
    const pdfPath = "signedAgreements/" + enrollmentId + ".pdf"
    const sigPath = "signatures/" + uid + "/" + enrollmentId + ".png"

    let pdfBytes: Uint8Array
    try {
      pdfBytes = await generateSignedPdf({
        documentText: payload.documentText,
        documentVersion: payload.documentVersion,
        documentHash: payload.documentHash,
        signatureDataUrl: payload.signatureDataUrl,
        typedName: payload.typedName,
        parentName: payload.parentName,
        studentName: payload.studentName || "",
        programTrack: payload.programTrack,
        signedAt: audit.signedAt,
        ip: audit.ip,
        userAgent: audit.userAgent,
      })
    } catch (err) {
      console.error("[e-signature] PDF render failed", err)
      res.status(500).json({ ok: false, error: "Failed to render signed PDF" })
      return
    }

    try {
      const sigB64 = payload.signatureDataUrl.replace(/^data:image\/png;base64,/, "")
      await bucket.file(sigPath).save(Buffer.from(sigB64, "base64"), {
        contentType: "image/png",
        resumable: false,
        metadata: { metadata: { uid, enrollmentId, kind: "signature-image" } },
      })
      await bucket.file(pdfPath).save(Buffer.from(pdfBytes), {
        contentType: "application/pdf",
        resumable: false,
        metadata: { metadata: { uid, enrollmentId, kind: "signed-agreement" } },
      })
    } catch (err) {
      console.error("[e-signature] storage write failed", err)
      res.status(500).json({ ok: false, error: "Failed to persist signed PDF" })
      return
    }
    const auditDoc = {
      uid,
      inquiryId: payload.inquiryId,
      documentType: "enrollmentAgreement" as const,
      documentVersion: payload.documentVersion,
      documentHash: payload.documentHash.toLowerCase(),
      typedName: payload.typedName,
      parentName: payload.parentName,
      studentName: payload.studentName || null,
      programTrack: payload.programTrack,
      electronicConsent: true,
      signedAt: audit.signedAt,
      signedAtServer: admin.firestore.FieldValue.serverTimestamp(),
      ip: audit.ip,
      userAgent: audit.userAgent,
      signatureImageStoragePath: sigPath,
      pdfStoragePath: pdfPath,
    }
    try {
      await admin
        .firestore()
        .collection("enrollmentAgreements")
        .doc(enrollmentId)
        .set(auditDoc)
    } catch (err) {
      console.error("[e-signature] firestore write failed", err)
      res.status(500).json({ ok: false, error: "Failed to persist audit record" })
      return
    }

    try {
      const userSnap = await admin.firestore().collection("users").doc(uid).get()
      const parentEmail = (userSnap.data()?.email as string) || ""
      if (parentEmail) {
        const tpl = signedAgreementDeliveryTemplate({
          parentName: payload.parentName,
          studentName: payload.studentName || "",
          programTrack: payload.programTrack,
        })
        const result = await sendEmailWithResult({
          to: parentEmail,
          subject: tpl.subject,
          htmlBody: tpl.html,
          textBody: tpl.text,
          kind: "transactional",
          attachments: [
            {
              filename: "IEP-and-Thrive-Enrollment-Agreement.pdf",
              content: Buffer.from(pdfBytes),
              contentType: "application/pdf",
            },
          ],
        })
        await logEmail(parentEmail, tpl.subject, "general", result.ok, {
          meta: {
            templateId: "signed_agreement_delivery",
            enrollmentId,
            uid,
          },
          messageId: result.messageId ?? undefined,
          error: result.error,
        })
      }
    } catch (err) {
      console.error("[e-signature] delivery email failed (non-fatal)", err)
    }

    const redirectTo = "/api/stripe/checkout?program=" + encodeURIComponent(payload.programTrack)

    res.status(200).json({
      ok: true,
      enrollmentId,
      pdfStoragePath: pdfPath,
      redirectTo,
    })
  }
)
export const getSignedAgreementPdf = onRequest(
  {
    region: "us-east1",
    cors: ALLOWED_ORIGINS,
  },
  async (req, res) => {
    if (req.method !== "GET") {
      res.status(405).json({ ok: false, error: "Method not allowed" })
      return
    }

    const uid = await verifyAuth(req)
    if (!uid) {
      res.status(401).json({ ok: false, error: "Authentication required" })
      return
    }

    const enrollmentId = (req.query.enrollmentId as string) || ""
    if (!enrollmentId) {
      res.status(400).json({ ok: false, error: "Missing enrollmentId" })
      return
    }

    const docSnap = await admin
      .firestore()
      .collection("enrollmentAgreements")
      .doc(enrollmentId)
      .get()
    if (!docSnap.exists) {
      res.status(404).json({ ok: false, error: "Not found" })
      return
    }
    const data = docSnap.data() ?? {}
    const isAdmin = await admin
      .auth()
      .getUser(uid)
      .then((u) => u.customClaims?.admin === true)
      .catch(() => false)
    if (data.uid !== uid && !isAdmin) {
      res.status(403).json({ ok: false, error: "Forbidden" })
      return
    }

    const pdfPath = (data.pdfStoragePath as string) || ""
    if (!pdfPath) {
      res.status(404).json({ ok: false, error: "No PDF on record" })
      return
    }

    try {
      const file = admin.storage().bucket().file(pdfPath)
      const [signedUrl] = await file.getSignedUrl({
        version: "v4",
        action: "read",
        expires: Date.now() + 10 * 60 * 1000,
      })
      res.status(200).json({ ok: true, url: signedUrl })
    } catch (err) {
      console.error("[e-signature] signed URL failed", err)
      res.status(500).json({ ok: false, error: "Failed to issue signed URL" })
    }
  }
)
