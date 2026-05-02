/**
 * B6 - Photo/Video release e-signature submit handler.
 *
 * Flow:
 *   1. Verify Firebase ID token in Authorization: Bearer header.
 *   2. Capture server-side IP + User-Agent.
 *   3. sha256(documentText on disk) MUST equal client-supplied documentHash.
 *      (Client cannot lie about which version they signed.)
 *   4. Persist signature PNG -> Storage at
 *      legal-signatures/{uid}/{docId}/signature.png
 *   5. Render signed PDF (pdf-lib) embedding text + signature + audit block.
 *      Save at legal-signatures/{uid}/{docId}/photo-release.pdf
 *   6. Write users/{uid}/legalDocs/photoRelease audit doc.
 *   7. Send transactional email copy via sendEmailWithResult.
 *   8. Respond { signedAt, pdfDownloadUrl, pdfStoragePath }.
 *
 * The on-disk release text mirrors docs/legal/photo-release.md and
 * the client constant in app/portal/photo-release/page.tsx. Edits
 * require coordinated bumps across all three files PLUS a version
 * bump in PHOTO_RELEASE_VERSION.
 */

import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as crypto from "crypto";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { sendEmailWithResult, logEmail, escapeHtml } from "./email-service";

const PHOTO_RELEASE_VERSION = "1.0.0";

// Server-side mirror of the canonical release text. The client sends a
// documentHash; we re-hash this constant and reject any submit whose hash
// doesn't match (defense against client-side tampering with the rendered
// text). When the markdown source is edited, BOTH this constant AND the
// app/portal/photo-release/page.tsx constant must be updated in lockstep,
// and PHOTO_RELEASE_VERSION must be bumped.
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
`;

// ─── Helpers ───

function sha256Hex(input: string): string {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}

interface ServerAuditMeta {
  ip: string;
  userAgent: string;
  signedAt: string;
}

/**
 * Extract IP + User-Agent from a Firebase Functions onRequest req.
 * Cloud Run / Firebase Hosting puts the real client IP in
 * x-forwarded-for; req.ip falls back to the proxy hop.
 *
 * Exported so future signature flows (E3, etc.) reuse the same shape.
 */
export function getServerSideAuditMeta(req: {
  headers: { [key: string]: string | string[] | undefined };
  ip?: string;
}): ServerAuditMeta {
  const fwd = req.headers['x-forwarded-for'];
  const xff = Array.isArray(fwd) ? fwd[0] : fwd;
  const ip = (xff || req.ip || '').toString().split(',')[0].trim() || 'unknown';
  const ua = req.headers['user-agent'];
  const userAgent = (Array.isArray(ua) ? ua[0] : ua) || 'unknown';
  return { ip, userAgent, signedAt: new Date().toISOString() };
}

interface SubmitBody {
  unsigned?: {
    uid?: string;
    documentType?: string;
    documentVersion?: string;
    documentHash?: string;
    typedName?: string;
  };
  signatureDataUrl?: string;
  marketingOptIn?: boolean;
}

// ─── PDF rendering ───

/**
 * Build a signed-document PDF embedding (a) the release text,
 * (b) the signature image, and (c) the audit block.
 *
 * Layout: 8.5x11 letter, 1" margins, 11pt body. Wraps text manually
 * (pdf-lib does not auto-wrap). One signature page at the end.
 */
async function renderSignedPdf(opts: {
  documentText: string;
  signaturePngBytes: Uint8Array;
  audit: {
    uid: string;
    documentType: string;
    documentVersion: string;
    documentHash: string;
    typedName: string;
    signedAt: string;
    ip: string;
    userAgent: string;
    marketingOptIn: boolean;
    parentEmail: string;
  };
}): Promise<Uint8Array> {
  const { documentText, signaturePngBytes, audit } = opts;
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const sigImg = await pdfDoc.embedPng(signaturePngBytes);

  const pageWidth = 612;  // 8.5"
  const pageHeight = 792; // 11"
  const margin = 54;      // 0.75"
  const lineHeight = 14;
  const fontSize = 10;
  const maxWidth = pageWidth - margin * 2;

  // Naive word-wrap. Splits on whitespace and breaks lines that exceed
  // maxWidth. Long unbroken tokens are emitted on their own line.
  function wrap(line: string): string[] {
    const words = line.split(/\s+/);
    const out: string[] = [];
    let buf = '';
    for (const w of words) {
      const trial = buf ? buf + ' ' + w : w;
      const width = font.widthOfTextAtSize(trial, fontSize);
      if (width <= maxWidth) { buf = trial; continue; }
      if (buf) out.push(buf);
      buf = w;
    }
    if (buf) out.push(buf);
    return out.length ? out : [''];
  }

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let cursor = pageHeight - margin;

  // Header on first page only.
  page.drawText('IEP & Thrive - Photo & Video Release', {
    x: margin, y: cursor, size: 16, font: fontBold, color: rgb(0.106, 0.263, 0.196),
  });
  cursor -= 24;
  page.drawText('Version ' + audit.documentVersion + ' - signed ' + audit.signedAt, {
    x: margin, y: cursor, size: 10, font, color: rgb(0.4, 0.4, 0.4),
  });
  cursor -= 22;

  function drawLine(text: string, opts?: { bold?: boolean; size?: number }) {
    const sz = opts?.size ?? fontSize;
    const f = opts?.bold ? fontBold : font;
    if (cursor < margin + lineHeight) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      cursor = pageHeight - margin;
    }
    page.drawText(text, { x: margin, y: cursor, size: sz, font: f });
    cursor -= lineHeight;
  }

  for (const para of documentText.split(/\n\n+/)) {
    for (const raw of para.split('\n')) {
      for (const wrapped of wrap(raw)) drawLine(wrapped);
    }
    cursor -= 6; // paragraph gap
  }

  // Always start audit + signature on a fresh page so it is not split.
  page = pdfDoc.addPage([pageWidth, pageHeight]);
  cursor = pageHeight - margin;
  page.drawText('Signature & Audit', {
    x: margin, y: cursor, size: 16, font: fontBold, color: rgb(0.106, 0.263, 0.196),
  });
  cursor -= 28;

  // Signature image: scale to fit a 320x100 box.
  const sigBox = { w: 320, h: 100 };
  const sigDims = sigImg.scaleToFit(sigBox.w, sigBox.h);
  page.drawImage(sigImg, {
    x: margin, y: cursor - sigDims.height, width: sigDims.width, height: sigDims.height,
  });
  cursor -= sigDims.height + 8;
  page.drawText('Typed name: ' + audit.typedName, {
    x: margin, y: cursor, size: 11, font: fontBold,
  });
  cursor -= 22;

  const auditLines = [
    ['Signer (Firebase uid)', audit.uid],
    ['Signer (email)',         audit.parentEmail],
    ['Document type',          audit.documentType],
    ['Document version',       audit.documentVersion],
    ['Document hash (sha256)', audit.documentHash],
    ['Signed at (UTC)',        audit.signedAt],
    ['Signer IP',              audit.ip],
    ['Signer user agent',      audit.userAgent],
    ['Marketing opt-in',       audit.marketingOptIn ? 'yes' : 'no'],
  ];
  for (const [k, v] of auditLines) {
    page.drawText(k + ':', { x: margin, y: cursor, size: 10, font: fontBold });
    const valLines = wrap(v);
    for (let i = 0; i < valLines.length; i++) {
      page.drawText(valLines[i], { x: margin + 140, y: cursor, size: 10, font });
      cursor -= lineHeight;
    }
    cursor -= 2;
  }

  return pdfDoc.save();
}

// ─── HTTP handler ───

export const submitPhotoRelease = onRequest(
  {
    region: "us-east1",
    cors: ["https://iep-and-thrive.web.app", "https://iepandthrive.com", /localhost/],
    memory: '512MiB',
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ ok: false, error: 'Method not allowed' });
      return;
    }

    // 1. Verify ID token.
    const authHeader = req.headers.authorization || '';
    const m = /^Bearer (.+)$/.exec(authHeader);
    if (!m) {
      res.status(401).json({ ok: false, error: 'Missing bearer token' });
      return;
    }
    let decoded: admin.auth.DecodedIdToken;
    try {
      decoded = await admin.auth().verifyIdToken(m[1]);
    } catch (err) {
      console.warn('[submitPhotoRelease] token verify failed:', err);
      res.status(401).json({ ok: false, error: 'Invalid token' });
      return;
    }
    const uid = decoded.uid;
    const parentEmail = decoded.email || '';

    const body = (req.body || {}) as SubmitBody;
    const u = body.unsigned || {};
    if (u.uid !== uid) {
      res.status(400).json({ ok: false, error: 'uid mismatch' });
      return;
    }
    if (u.documentType !== 'photoRelease') {
      res.status(400).json({ ok: false, error: 'documentType mismatch' });
      return;
    }
    if (u.documentVersion !== PHOTO_RELEASE_VERSION) {
      res.status(409).json({ ok: false, error: 'documentVersion stale; please refresh' });
      return;
    }
    const expectedHash = sha256Hex(PHOTO_RELEASE_TEXT);
    if (u.documentHash !== expectedHash) {
      console.warn('[submitPhotoRelease] hash mismatch (expected ' + expectedHash + ', got ' + u.documentHash + ')');
      res.status(409).json({ ok: false, error: 'documentHash mismatch; please refresh and re-sign' });
      return;
    }
    const typedName = (u.typedName || '').trim();
    if (typedName.length < 2) {
      res.status(400).json({ ok: false, error: 'typedName too short' });
      return;
    }
    const sigDataUrl = body.signatureDataUrl || '';
    const sigPrefix = 'data:image/png;base64,';
    if (!sigDataUrl.startsWith(sigPrefix)) {
      res.status(400).json({ ok: false, error: 'signatureDataUrl must be data:image/png' });
      return;
    }
    const sigBytes = Buffer.from(sigDataUrl.slice(sigPrefix.length), 'base64');
    if (sigBytes.length === 0 || sigBytes.length > 2 * 1024 * 1024) {
      res.status(400).json({ ok: false, error: 'signature image must be 1B-2MB' });
      return;
    }
    const marketingOptIn = body.marketingOptIn === true;

    const meta = getServerSideAuditMeta(req);
    const docId = meta.signedAt.replace(/[^0-9A-Za-z]/g, '').slice(0, 14);
    const baseStoragePath = 'legal-signatures/' + uid + '/' + docId;
    const signatureImageStoragePath = baseStoragePath + '/signature.png';
    const pdfStoragePath = baseStoragePath + '/photo-release.pdf';

    try {
      const bucket = admin.storage().bucket();

      // 4. Save signature PNG.
      await bucket.file(signatureImageStoragePath).save(sigBytes, {
        contentType: 'image/png',
        resumable: false,
        metadata: { metadata: { uid, documentType: 'photoRelease', documentVersion: PHOTO_RELEASE_VERSION } },
      });

      // 5. Render + save signed PDF.
      const pdfBytes = await renderSignedPdf({
        documentText: PHOTO_RELEASE_TEXT,
        signaturePngBytes: sigBytes,
        audit: {
          uid,
          documentType: 'photoRelease',
          documentVersion: PHOTO_RELEASE_VERSION,
          documentHash: expectedHash,
          typedName,
          signedAt: meta.signedAt,
          ip: meta.ip,
          userAgent: meta.userAgent,
          marketingOptIn,
          parentEmail,
        },
      });
      await bucket.file(pdfStoragePath).save(Buffer.from(pdfBytes), {
        contentType: 'application/pdf',
        resumable: false,
        metadata: { metadata: { uid, documentType: 'photoRelease', documentVersion: PHOTO_RELEASE_VERSION } },
      });

      // 6. Audit doc in Firestore.
      const auditRecord = {
        uid,
        documentType: 'photoRelease',
        documentVersion: PHOTO_RELEASE_VERSION,
        documentHash: expectedHash,
        signedAt: meta.signedAt,
        ip: meta.ip,
        userAgent: meta.userAgent,
        typedName,
        signatureImageStoragePath,
        pdfStoragePath,
        marketingOptIn,
        signedAtTimestamp: admin.firestore.FieldValue.serverTimestamp(),
      };
      await admin.firestore()
        .collection('users').doc(uid)
        .collection('legalDocs').doc('photoRelease')
        .set(auditRecord, { merge: true });

      // 7. Generate a long-lived signed download URL (7 days). Storage
      // rules also gate access by uid; the signed URL is a convenience
      // for the email + portal display.
      let pdfDownloadUrl: string | undefined;
      try {
        const [url] = await bucket.file(pdfStoragePath).getSignedUrl({
          action: 'read',
          expires: Date.now() + 7 * 24 * 3600 * 1000,
        });
        pdfDownloadUrl = url;
      } catch (err) {
        console.warn('[submitPhotoRelease] signed URL failed (storage may not be ready):', err);
      }

      // 8. Email the parent a copy. Transactional kind = no opt-out check.
      if (parentEmail) {
        const subject = 'Your IEP & Thrive photo/video release - signed';
        const safeName = escapeHtml(typedName);
        const safeWhen = escapeHtml(meta.signedAt);
        const safeUrl = pdfDownloadUrl ? escapeHtml(pdfDownloadUrl) : '';
        const html =
          '<p>Hi ' + safeName + ',</p>' +
          '<p>Thanks for signing the IEP &amp; Thrive photo/video release. ' +
          'A signed copy is attached for your records.</p>' +
          '<p><strong>Signed at:</strong> ' + safeWhen + ' (UTC)<br>' +
          '<strong>Document version:</strong> ' + PHOTO_RELEASE_VERSION + '<br>' +
          '<strong>Marketing use:</strong> ' + (marketingOptIn ? 'opted in' : 'declined') + '</p>' +
          (safeUrl
            ? '<p><a href="' + safeUrl + '">Download your signed PDF</a> (valid 7 days; available anytime in your portal).</p>'
            : '<p>Your signed PDF is available in the parent portal under Photo Release.</p>') +
          '<p>If you did not sign this document, please reply to this email immediately.</p>';
        const text =
          'Hi ' + typedName + ',\n\n' +
          'Thanks for signing the IEP & Thrive photo/video release.\n\n' +
          'Signed at: ' + meta.signedAt + ' (UTC)\n' +
          'Document version: ' + PHOTO_RELEASE_VERSION + '\n' +
          'Marketing use: ' + (marketingOptIn ? 'opted in' : 'declined') + '\n\n' +
          (pdfDownloadUrl ? 'PDF: ' + pdfDownloadUrl + '\n\n' : '') +
          'If you did not sign this document, please reply immediately.\n';
        const sendRes = await sendEmailWithResult({
          to: parentEmail,
          subject,
          htmlBody: html,
          textBody: text,
          kind: 'transactional',
          recipientUid: uid,
        });
        await logEmail(parentEmail, subject, 'general', sendRes.ok, {
          messageId: sendRes.messageId,
          error: sendRes.error,
          meta: { kind: 'photo-release-confirmation', documentVersion: PHOTO_RELEASE_VERSION },
        });
      }

      res.status(200).json({
        ok: true,
        signedAt: meta.signedAt,
        pdfStoragePath,
        pdfDownloadUrl,
      });
    } catch (err) {
      console.error('[submitPhotoRelease] failed:', err);
      const msg = err instanceof Error ? err.message : 'Server error';
      res.status(500).json({ ok: false, error: msg });
    }
  }
);
