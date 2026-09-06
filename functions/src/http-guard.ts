import * as admin from "firebase-admin";
import { createHash } from "node:crypto";
import type { Request } from "firebase-functions/v2/https";
import type { Response } from "express";

// Loopback development origins, anchored. The previous entry was an unanchored
// /localhost/, which also matched https://localhost.evil.com and
// https://evil-localhost.attacker.io — any attacker-controlled host containing
// the substring got CORS access to these endpoints. TASK-LP-010 calls for exact
// origin allowlists, so this matches only real loopback hosts on a port.
const LOOPBACK_ORIGIN = /^http:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d{1,5})?$/;

const PRODUCTION_ORIGINS: Array<string | RegExp> = [
  "https://iep-and-thrive.web.app",
  "https://iepandthrive.com",
];

// Loopback is only allowed outside production. A deployed production function
// has no reason to accept a browser origin on the caller's own machine.
export const PUBLIC_CORS_ORIGINS: Array<string | RegExp> =
  process.env.FUNCTIONS_EMULATOR === "true" || process.env.NODE_ENV !== "production"
    ? [...PRODUCTION_ORIGINS, LOOPBACK_ORIGIN]
    : PRODUCTION_ORIGINS;

const QUOTA_COLLECTION = "httpQuotaCounters";

export interface QuotaOptions {
  limit: number;
  windowSeconds: number;
}

function firstHeaderValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

/** Hash the first proxy-reported address so raw caller IPs are never persisted. */
export function getCallerKey(req: Request): string {
  const forwarded = firstHeaderValue(req.headers["x-forwarded-for"]);
  const forwardedIp = forwarded?.split(",")[0]?.trim();
  const caller = forwardedIp || req.ip?.trim() || "unknown";
  return sha256Hex(caller);
}

/** Build the endpoint + caller key consumed by the Firestore quota counter. */
export function quotaKey(req: Request, endpoint: string): string {
  return `${endpoint}:${getCallerKey(req)}`;
}

export function errorEnvelope(
  res: Response,
  status: number,
  code: string,
  message: string
): void {
  res.status(status).json({ error: { code, message } });
}

export function assertMethod(
  req: Request,
  res: Response,
  allowed: string[]
): boolean {
  if (allowed.includes(req.method)) return true;

  res.setHeader("Allow", allowed.join(", "));
  errorEnvelope(res, 405, "method_not_allowed", "This method is not supported.");
  return false;
}

export function assertContentType(
  req: Request,
  res: Response,
  expected = "application/json"
): boolean {
  const contentType = firstHeaderValue(req.headers["content-type"]);
  const mediaType = contentType?.split(";", 1)[0]?.trim().toLowerCase();
  if (mediaType === expected.toLowerCase()) return true;

  errorEnvelope(
    res,
    415,
    "unsupported_media_type",
    `Requests must use ${expected}.`
  );
  return false;
}

export function assertBodySize(
  req: Request,
  res: Response,
  maxBytes: number
): boolean {
  const contentLengthHeader = firstHeaderValue(req.headers["content-length"]);
  const contentLength = contentLengthHeader ? Number(contentLengthHeader) : NaN;
  const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
  const tooLargeByHeader = Number.isFinite(contentLength) && contentLength > maxBytes;
  const tooLargeByBody = !!rawBody && rawBody.byteLength > maxBytes;

  if (!tooLargeByHeader && !tooLargeByBody) return true;

  errorEnvelope(res, 413, "request_too_large", "The request is too large.");
  return false;
}

/** Respond to a genuine quota rejection without exposing the configured limit. */
export function rejectQuota(res: Response, retryAfterSeconds: number): boolean {
  res.setHeader("Retry-After", String(Math.max(1, Math.ceil(retryAfterSeconds))));
  errorEnvelope(
    res,
    429,
    "quota_exceeded",
    "Too many requests right now. Please wait a moment and try again."
  );
  return false;
}

export async function assertQuota(
  req: Request,
  res: Response,
  endpoint: string,
  opts: QuotaOptions
): Promise<boolean> {
  const result = await checkQuota(quotaKey(req, endpoint), opts);
  return result.allowed ? true : rejectQuota(res, result.retryAfterSeconds);
}

export async function checkQuota(
  key: string,
  opts: QuotaOptions
): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  const limit = Math.floor(opts.limit);
  const windowMs = Math.floor(opts.windowSeconds * 1000);

  if (!Number.isFinite(limit) || limit < 1 || !Number.isFinite(windowMs) || windowMs < 1) {
    // Invalid quota configuration must not make a public form unavailable.
    return { allowed: true, retryAfterSeconds: 0 };
  }

  const nowMs = Date.now();
  const windowStartMs = Math.floor(nowMs / windowMs) * windowMs;
  const windowEndMs = windowStartMs + windowMs;
  const counterId = sha256Hex(`${key}:${windowStartMs}`);

  try {
    const db = admin.firestore();
    const counterRef = db.collection(QUOTA_COLLECTION).doc(counterId);
    return await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(counterRef);
      const data = snapshot.data() ?? {};
      const count = typeof data.count === "number" && Number.isFinite(data.count)
        ? data.count
        : 0;

      if (snapshot.exists && count >= limit) {
        return {
          allowed: false,
          retryAfterSeconds: Math.max(1, Math.ceil((windowEndMs - nowMs) / 1000)),
        };
      }

      const nextCount = count + 1;
      const counterData = {
        count: nextCount,
        windowStartedAt: admin.firestore.Timestamp.fromMillis(windowStartMs),
        // Configure a Firestore TTL policy on expiresAt. This dedicated quota
        // collection intentionally has no scheduled cleanup in this task.
        expiresAt: admin.firestore.Timestamp.fromMillis(windowEndMs),
      };

      if (snapshot.exists) {
        transaction.update(counterRef, counterData);
      } else {
        transaction.create(counterRef, counterData);
      }

      return { allowed: true, retryAfterSeconds: 0 };
    });
  } catch (error) {
    // Rate limiting fails OPEN on Firestore infrastructure errors so an outage
    // in the quota store does not take a legitimate contact form down. A
    // genuine over-limit result above still fails CLOSED.
    console.error("[http-guard] quota check failed; allowing request", error);
    return { allowed: true, retryAfterSeconds: 0 };
  }
}
