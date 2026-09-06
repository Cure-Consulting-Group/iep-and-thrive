/**
 * Single source of truth for which environment this client is talking to.
 * TASK-LP-054.
 *
 * The failure this exists to prevent: before it, `lib/functions-config.ts`
 * decided "am I local?" by testing `window.location.hostname === 'localhost'`,
 * while `lib/firebase.ts` never connected to an emulator at all. So a developer
 * on http://127.0.0.1 — the same machine, a different spelling — sent Function
 * calls to production. And a developer on localhost got the worst combination
 * available: Functions on the emulator, Auth/Firestore/Storage in production.
 * Neither case announced itself.
 *
 * Two rules follow from that:
 *   1. One resolver, used by every client. Never re-derive "am I local" locally.
 *   2. An incoherent combination is a startup error, not a warning. A silent
 *      mixed environment is how synthetic test data reaches real families.
 */

export type AppEnvironment = 'local' | 'staging' | 'production'

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]', '::1', '0.0.0.0'])

export const PRODUCTION_PROJECT_ID = 'iep-and-thrive'

export class EnvironmentConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EnvironmentConfigError'
  }
}

/**
 * Resolve the environment.
 *
 * `NEXT_PUBLIC_FIREBASE_ENV` is authoritative when set — a deployed staging
 * build must not be reclassified by whatever hostname it happens to serve from.
 * Only when it is absent do we fall back to the hostname, and then only to
 * detect local development.
 */
export function resolveEnvironment(
  explicit: string | undefined = process.env.NEXT_PUBLIC_FIREBASE_ENV,
  hostname: string | null = typeof window !== 'undefined' ? window.location.hostname : null,
): AppEnvironment {
  const declared = explicit?.trim().toLowerCase()
  if (declared) {
    if (declared === 'local' || declared === 'staging' || declared === 'production') {
      return declared
    }
    throw new EnvironmentConfigError(
      `NEXT_PUBLIC_FIREBASE_ENV must be one of local|staging|production, got "${declared}".`,
    )
  }
  if (hostname !== null && LOCAL_HOSTNAMES.has(hostname)) return 'local'
  return 'production'
}

export function isLocalEnvironment(env: AppEnvironment): boolean {
  return env === 'local'
}

export interface FirebaseClientConfig {
  apiKey?: string
  authDomain?: string
  projectId?: string
  storageBucket?: string
  messagingSenderId?: string
  appId?: string
}

/**
 * Reject combinations that cannot be correct.
 *
 * Deliberately does NOT complain about values that are merely absent. A missing
 * apiKey is already a loud Firebase SDK error, and treating absence as fatal
 * here would break `next build` in CI checkouts that legitimately have no
 * .env.local. What we reject is a configuration that is *present and
 * contradictory* — the case that otherwise runs happily against the wrong data.
 */
export function assertEnvironmentCoherent(
  env: AppEnvironment,
  config: FirebaseClientConfig,
): void {
  const projectId = config.projectId?.trim()

  if (env === 'local' && projectId === PRODUCTION_PROJECT_ID) {
    throw new EnvironmentConfigError(
      `Refusing to start: NEXT_PUBLIC_FIREBASE_ENV=local but ` +
        `NEXT_PUBLIC_FIREBASE_PROJECT_ID is the production project ` +
        `"${PRODUCTION_PROJECT_ID}". Local runs must target an emulator or a ` +
        `synthetic project, or emulator writes would land in production.`,
    )
  }

  if (env === 'staging' && projectId === PRODUCTION_PROJECT_ID) {
    throw new EnvironmentConfigError(
      `Refusing to start: NEXT_PUBLIC_FIREBASE_ENV=staging but ` +
        `NEXT_PUBLIC_FIREBASE_PROJECT_ID is the production project ` +
        `"${PRODUCTION_PROJECT_ID}". This is the mixed-environment build the ` +
        `A01 audit called out; set the staging project id.`,
    )
  }

  if (env === 'production' && projectId && projectId !== PRODUCTION_PROJECT_ID) {
    throw new EnvironmentConfigError(
      `Refusing to start: NEXT_PUBLIC_FIREBASE_ENV=production but ` +
        `NEXT_PUBLIC_FIREBASE_PROJECT_ID is "${projectId}". A production build ` +
        `pointed at a non-production project will write real user actions to ` +
        `synthetic data.`,
    )
  }

  // authDomain and storageBucket are derived from the project; a mismatch means
  // someone edited one env var and not the others.
  if (projectId && config.authDomain && !config.authDomain.startsWith(`${projectId}.`)) {
    throw new EnvironmentConfigError(
      `Refusing to start: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ` +
        `("${config.authDomain}") does not belong to project "${projectId}". ` +
        `Auth would issue tokens for a different project than Firestore reads.`,
    )
  }

  if (projectId && config.storageBucket && !config.storageBucket.startsWith(`${projectId}.`)) {
    throw new EnvironmentConfigError(
      `Refusing to start: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ` +
        `("${config.storageBucket}") does not belong to project "${projectId}".`,
    )
  }
}

/** Emulator ports. Must match firebase.json. */
export const EMULATOR_PORTS = {
  auth: 9099,
  firestore: 8080,
  storage: 9199,
  functions: 5001,
} as const

export const EMULATOR_HOST = '127.0.0.1'
