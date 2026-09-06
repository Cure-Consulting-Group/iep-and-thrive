const SAFE_ORIGIN = 'https://same-origin.invalid'
const MAX_DECODE_PASSES = 8

function decodeFully(value: string): string | null {
  let decoded = value

  for (let pass = 0; pass < MAX_DECODE_PASSES; pass += 1) {
    let next: string
    try {
      next = decodeURIComponent(decoded)
    } catch {
      return null
    }

    if (next === decoded) return decoded
    decoded = next
  }

  // An unusually deeply encoded value is not needed as a local destination.
  return null
}

function parsesWithHost(value: string): boolean {
  try {
    const parsed = new URL(value, SAFE_ORIGIN)
    return parsed.origin !== SAFE_ORIGIN
  } catch {
    return true
  }
}

/**
 * Validate a login continuation as a same-origin absolute path.
 *
 * This intentionally accepts no URL with an authority component, including
 * authorities hidden behind percent encoding or URL parser backslash rules.
 */
export function safeNextPath(raw: string | null | undefined): string | null {
  if (typeof raw !== 'string' || raw.length === 0) return null
  if (!raw.startsWith('/') || raw.startsWith('//')) return null
  if (/[\\\u0000-\u0020\u007f]/.test(raw)) return null

  const decoded = decodeFully(raw)
  if (decoded === null) return null
  if (/[\\\u0000-\u0020\u007f]/.test(decoded)) return null
  if (!decoded.startsWith('/') || decoded.startsWith('//')) return null
  if (parsesWithHost(raw) || parsesWithHost(decoded)) return null

  // Reject dot segments after decoding so URL normalization cannot turn a
  // continuation into an unintended path.
  const decodedPath = decoded.split(/[?#]/, 1)[0]
  if (decodedPath.split('/').some((segment) => segment === '.' || segment === '..')) {
    return null
  }

  try {
    const parsed = new URL(raw, SAFE_ORIGIN)
    const result = `${parsed.pathname}${parsed.search}${parsed.hash}`
    if (!result.startsWith('/') || result.startsWith('//') || result.includes('\\')) {
      return null
    }
    return result
  } catch {
    return null
  }
}
