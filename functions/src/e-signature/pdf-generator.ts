/**
 * E3 — Signed PDF generator using pdf-lib.
 *
 * Renders a portable 8.5 x 11 portrait document containing:
 *   - Header: "IEP & Thrive — Enrollment Agreement" + version + cohort label
 *   - Body:   the full agreement text the signer was shown (line-wrapped
 *             onto multiple pages as needed; preserves blank lines)
 *   - Signature block: parent printed name, child name, embedded canvas
 *             signature PNG (decoded from data URL), typed-name line
 *   - Audit block: signedAt UTC, IP, User-Agent, agreementVersion,
 *             agreementHash (sha256). Designed to render legibly on print
 *             so a court / district can read it without tooling.
 *
 * The PDF is the durable artifact that satisfies UETA "record retention
 * and integrity" — the signature image and audit block are both inside
 * the file, so a leaked or copied PDF still shows when, where, and what
 * was signed.
 */

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib"

export interface PdfInput {
  documentText: string
  documentVersion: string
  documentHash: string
  signatureDataUrl: string
  typedName: string
  parentName: string
  studentName: string
  programTrack: string
  signedAt: string
  ip: string
  userAgent: string
}

const PAGE_W = 612 // 8.5"
const PAGE_H = 792 // 11"
const MARGIN = 54  // 0.75"
const LINE_H = 14
const FONT_BODY = 11
const FONT_HEADER = 18
const FONT_AUDIT = 9

function trackLabel(track: string): string {
  if (track === "reading") return "Reading & Language Intensive"
  if (track === "math") return "Math & Numeracy Intensive"
  if (track === "full") return "Full Academic Intensive"
  return track
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const out: string[] = []
  for (const rawLine of text.split(/\r?\n/)) {
    if (rawLine.trim() === "") {
      out.push("")
      continue
    }
    const words = rawLine.split(/\s+/)
    let cur = ""
    for (const w of words) {
      const candidate = cur ? cur + " " + w : w
      const width = font.widthOfTextAtSize(candidate, size)
      if (width > maxWidth && cur) {
        out.push(cur)
        cur = w
      } else {
        cur = candidate
      }
    }
    if (cur) out.push(cur)
  }
  return out
}

function newPage(pdf: PDFDocument): PDFPage {
  return pdf.addPage([PAGE_W, PAGE_H])
}

export async function generateSignedPdf(input: PdfInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  const fontBody = await pdf.embedFont(StandardFonts.TimesRoman)
  const fontBold = await pdf.embedFont(StandardFonts.TimesRomanBold)
  const fontMono = await pdf.embedFont(StandardFonts.Courier)

  // ── Header on page 1 ──
  let page = newPage(pdf)
  let y = PAGE_H - MARGIN
  const drawHeader = () => {
    page.drawText("IEP & Thrive — Enrollment Agreement", {
      x: MARGIN,
      y,
      size: FONT_HEADER,
      font: fontBold,
      color: rgb(0.106, 0.263, 0.196), // forest #1B4332
    })
    y -= 24
    page.drawText(
      "Version " + input.documentVersion + "  ·  Summer 2026 Cohort  ·  " + trackLabel(input.programTrack),
      { x: MARGIN, y, size: 10, font: fontBody, color: rgb(0.4, 0.4, 0.4) }
    )
    y -= 20
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_W - MARGIN, y },
      thickness: 0.6,
      color: rgb(0.7, 0.7, 0.7),
    })
    y -= 18
  }
  drawHeader()

  // ── Body: wrap and paginate ──
  const wrapped = wrapText(input.documentText, fontBody, FONT_BODY, PAGE_W - 2 * MARGIN)
  for (const line of wrapped) {
    if (y < MARGIN + LINE_H) {
      page = newPage(pdf)
      y = PAGE_H - MARGIN
    }
    if (line === "") {
      y -= LINE_H
      continue
    }
    page.drawText(line, { x: MARGIN, y, size: FONT_BODY, font: fontBody, color: rgb(0.1, 0.1, 0.1) })
    y -= LINE_H
  }

  // ── Signature block: always start on a fresh page or push to bottom ──
  // Reserve room: ~220 pts. If less remains, paginate.
  if (y < MARGIN + 240) {
    page = newPage(pdf)
    y = PAGE_H - MARGIN
  }

  y -= 8
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_W - MARGIN, y },
    thickness: 0.6,
    color: rgb(0.7, 0.7, 0.7),
  })
  y -= 18
  page.drawText("Signature", { x: MARGIN, y, size: 13, font: fontBold, color: rgb(0.106, 0.263, 0.196) })
  y -= 18
  page.drawText("Parent / Guardian: " + input.parentName, { x: MARGIN, y, size: FONT_BODY, font: fontBody })
  y -= LINE_H
  if (input.studentName) {
    page.drawText("Student: " + input.studentName, { x: MARGIN, y, size: FONT_BODY, font: fontBody })
    y -= LINE_H
  }

  // Embed signature PNG (canvas).
  try {
    const b64 = input.signatureDataUrl.replace(/^data:image\/png;base64,/, "")
    const sigBytes = Buffer.from(b64, "base64")
    const sigImage = await pdf.embedPng(sigBytes)
    const sigBoxW = 220
    const sigDims = sigImage.scaleToFit(sigBoxW, 80)
    y -= 8
    page.drawImage(sigImage, {
      x: MARGIN,
      y: y - sigDims.height,
      width: sigDims.width,
      height: sigDims.height,
    })
    y -= sigDims.height + 4
    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: MARGIN + sigBoxW, y },
      thickness: 0.5,
      color: rgb(0.6, 0.6, 0.6),
    })
    y -= 12
    page.drawText("Drawn signature", { x: MARGIN, y, size: 9, font: fontBody, color: rgb(0.4, 0.4, 0.4) })
    y -= 16
  } catch (err) {
    // If the PNG cannot be decoded, leave a clearly-labeled placeholder.
    y -= 16
    page.drawText("[signature image could not be embedded]", { x: MARGIN, y, size: 9, font: fontBody, color: rgb(0.6, 0.0, 0.0) })
    y -= 16
  }

  page.drawText("Printed name (typed): " + input.typedName, { x: MARGIN, y, size: FONT_BODY, font: fontBody })
  y -= LINE_H

  // ── Audit block ──
  if (y < MARGIN + 110) {
    page = newPage(pdf)
    y = PAGE_H - MARGIN
  }
  y -= 14
  page.drawText("Audit", { x: MARGIN, y, size: 11, font: fontBold, color: rgb(0.106, 0.263, 0.196) })
  y -= 14
  const auditLines: Array<[string, string]> = [
    ["Signed at (UTC):", input.signedAt],
    ["IP address:", input.ip],
    ["User-Agent:", input.userAgent],
    ["Agreement version:", input.documentVersion],
    ["Agreement sha256:", input.documentHash],
  ]
  for (const [k, v] of auditLines) {
    if (y < MARGIN + LINE_H) {
      page = newPage(pdf)
      y = PAGE_H - MARGIN
    }
    page.drawText(k, { x: MARGIN, y, size: FONT_AUDIT, font: fontBold, color: rgb(0.3, 0.3, 0.3) })
    const valueLines = wrapText(v, fontMono, FONT_AUDIT, PAGE_W - MARGIN - (MARGIN + 110))
    let firstLine = true
    for (const ln of valueLines) {
      if (!firstLine) {
        y -= LINE_H
        if (y < MARGIN + LINE_H) {
          page = newPage(pdf)
          y = PAGE_H - MARGIN
        }
      }
      page.drawText(ln, { x: MARGIN + 110, y, size: FONT_AUDIT, font: fontMono, color: rgb(0.2, 0.2, 0.2) })
      firstLine = false
    }
    y -= LINE_H
  }

  // Footer line on the last page.
  page.drawText(
    "This electronic signature is intended by the signer to have the same legal effect as a written signature, per ESIGN (15 U.S.C. § 7001) and N.Y. State Technology Law Article 3.",
    { x: MARGIN, y: MARGIN - 4, size: 8, font: fontBody, color: rgb(0.45, 0.45, 0.45) }
  )

  return await pdf.save()
}
