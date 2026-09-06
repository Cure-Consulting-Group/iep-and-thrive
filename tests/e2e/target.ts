/**
 * E2E target safety. TASK-LP-069.
 *
 * The suite defaulted `E2E_BASE_URL` to the production hostname, so a test run
 * with no configuration at all pointed at real families' data — and several of
 * these specs write: they toggle materials checklists, enter probe scores, and
 * submit signed agreements. That is how the admin-curriculum specs came to
 * mutate production on every CI run.
 *
 * Two rules:
 *   1. Targeting production at all requires saying so explicitly.
 *   2. A mutating spec refuses to run against production regardless.
 *
 * Read-only smoke against production stays possible and is still useful; it
 * just has to be opted into rather than arrived at by omission.
 */

export const PRODUCTION_ORIGINS = [
  'https://iep-and-thrive.web.app',
  'https://iepandthrive.com',
]

export function isProductionTarget(baseUrl: string | undefined): boolean {
  if (!baseUrl) return false
  // Compare parsed origins, not strings. `https://IEPANDTHRIVE.COM` and
  // `https://iepandthrive.com:443` are the production origin but did not match
  // a case-sensitive comparison, so a mutating spec pointed at either form
  // sailed past assertSafeTargetForMutation and could write real data.
  let origin: string
  try {
    origin = new URL(baseUrl.trim()).origin.toLowerCase()
  } catch {
    return false
  }
  return PRODUCTION_ORIGINS.some((o) => {
    try {
      return new URL(o).origin.toLowerCase() === origin
    } catch {
      return false
    }
  })
}

/**
 * Resolve the base URL for a run, refusing to silently choose production.
 * Called from playwright.config.ts so the refusal happens at configuration
 * time, before a single test executes.
 */
export function resolveBaseUrl(): string {
  const explicit = process.env.E2E_BASE_URL?.trim()

  if (!explicit) {
    if (process.env.E2E_ALLOW_PRODUCTION === '1') return PRODUCTION_ORIGINS[0]
    throw new Error(
      'E2E_BASE_URL is not set.\n' +
        'This suite no longer defaults to production (TASK-LP-069). Set\n' +
        '  E2E_BASE_URL=http://127.0.0.1:3000        for a local candidate build, or\n' +
        '  E2E_BASE_URL=https://<staging-host>       for staging, or\n' +
        '  E2E_ALLOW_PRODUCTION=1                    to run read-only smoke against production.',
    )
  }

  if (isProductionTarget(explicit) && process.env.E2E_ALLOW_PRODUCTION !== '1') {
    throw new Error(
      `E2E_BASE_URL points at production (${explicit}).\n` +
        'Set E2E_ALLOW_PRODUCTION=1 to confirm that is intended. Only read-only\n' +
        'specs may run there; mutating specs refuse regardless of this flag.',
    )
  }

  return explicit
}

/**
 * Guard for a spec that writes. Put this in the describe block of any test that
 * creates, updates or deletes anything.
 *
 * Deliberately throws rather than skipping: a mutating test pointed at
 * production is a configuration error someone needs to see and fix, not a
 * condition to route around quietly.
 */
export function assertSafeTargetForMutation(baseUrl: string | undefined): void {
  if (isProductionTarget(baseUrl)) {
    throw new Error(
      `Refusing to run a mutating E2E spec against production (${baseUrl}).\n` +
        'These specs write real records. Point E2E_BASE_URL at staging or a local\n' +
        'candidate build. See TASK-LP-069 and docs/runbooks/environments.md.',
    )
  }
}
