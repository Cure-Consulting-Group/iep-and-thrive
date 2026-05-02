/**
 * E3 — Server-side audit metadata extraction.
 * Captures originating IP and User-Agent from the incoming HTTPS request
 * for the signature audit record. Trust the standard Cloud Functions
 * forwarded headers; fall back to req.ip and a sentinel when missing.
 */

import type { Request } from "firebase-functions/v2/https"

export interface ServerAuditMeta {
  ip: string
  userAgent: string
  signedAt: string
}

function firstForwardedIp(xff: string | undefined): string | null {
  if (!xff) return null
  const head = xff.split(",")[0]?.trim()
  return head || null
}

export function extractAuditMetadata(req: Request): ServerAuditMeta {
  const xff = req.headers["x-forwarded-for"]
  const xffStr = Array.isArray(xff) ? xff[0] : xff
  const ip =
    firstForwardedIp(xffStr) ||
    (req.ip as string | undefined) ||
    "0.0.0.0"

  const ua = req.headers["user-agent"]
  const userAgent = (Array.isArray(ua) ? ua[0] : ua) || "unknown"

  return {
    ip,
    userAgent,
    signedAt: new Date().toISOString(),
  }
}
