/**
 * G2 — Unsubscribe token generation + verification.
 *
 * Token format: <base64url(uid)>.<hex(hmac-sha256(secret, uid))>
 *
 * The secret lives in functions/.env as UNSUBSCRIBE_SECRET (gitignored).
 * Pure crypto — no Firebase dependency, so both the email-templates
 * (token generation at send time) and the unsubscribe handler (token
 * verification at click time) can import it without circular refs.
 *
 * Why HMAC-of-uid (no expiry, no payload): unsubscribe links are static
 * for the lifetime of an account. They don't need expiry — the worst
 * case is a forwarded email leaking the link, which only does what the
 * recipient could already do (unsubscribe themselves). Adding expiry
 * just creates dead links in archived emails.
 */

import * as crypto from "crypto";

function getSecret(): string {
  const secret = process.env.UNSUBSCRIBE_SECRET;
  if (!secret) {
    throw new Error(
      "UNSUBSCRIBE_SECRET env var is not set. Required for token generation/verification."
    );
  }
  return secret;
}

export function generateUnsubscribeToken(uid: string): string {
  const encodedUid = Buffer.from(uid, "utf8").toString("base64url");
  const hmac = crypto.createHmac("sha256", getSecret()).update(uid).digest("hex");
  return `${encodedUid}.${hmac}`;
}

export function verifyUnsubscribeToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [encodedUid, hmac] = parts;
  if (!encodedUid || !hmac) return null;

  let uid: string;
  try {
    uid = Buffer.from(encodedUid, "base64url").toString("utf8");
  } catch {
    return null;
  }
  if (!uid) return null;

  const expected = crypto.createHmac("sha256", getSecret()).update(uid).digest("hex");

  // Constant-time comparison to prevent timing attacks.
  let actualBuf: Buffer;
  let expectedBuf: Buffer;
  try {
    actualBuf = Buffer.from(hmac, "hex");
    expectedBuf = Buffer.from(expected, "hex");
  } catch {
    return null;
  }
  if (actualBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(actualBuf, expectedBuf)) return null;

  return uid;
}
