/**
 * Cloud Functions URL config.
 *
 * The environment decision lives in lib/env.ts and nowhere else. This module
 * used to make its own: `window.location.hostname === "localhost"`, which meant
 * a developer on http://127.0.0.1 — same machine, different spelling — sent
 * every Function call to production while believing they were local. It also
 * hardcoded the production project id, so a staging build called production
 * Functions.
 */

import { EMULATOR_HOST, EMULATOR_PORTS, PRODUCTION_PROJECT_ID, resolveEnvironment } from './env'

const REGION = 'us-east1'

const APP_ENVIRONMENT = resolveEnvironment()

// The project the Functions live in follows the same env vars as the rest of
// the Firebase config, so a staging build cannot silently call production.
const PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() || PRODUCTION_PROJECT_ID

export const FUNCTIONS_BASE_URL =
  APP_ENVIRONMENT === 'local'
    ? `http://${EMULATOR_HOST}:${EMULATOR_PORTS.functions}/${PROJECT_ID}/${REGION}`
    : `https://${REGION}-${PROJECT_ID}.cloudfunctions.net`

export const CLOUD_FUNCTIONS = {
  contact: `${FUNCTIONS_BASE_URL}/contact`,
  enroll: `${FUNCTIONS_BASE_URL}/enroll`,
  stripeCheckout: `${FUNCTIONS_BASE_URL}/stripeCheckout`,
  summerGuideCapture: `${FUNCTIONS_BASE_URL}/summerGuideCapture`,
  submitEnrollmentAgreement: `${FUNCTIONS_BASE_URL}/submitEnrollmentAgreement`,
  getSignedAgreementPdf: `${FUNCTIONS_BASE_URL}/getSignedAgreementPdf`,
} as const;
