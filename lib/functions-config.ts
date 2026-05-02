/**
 * Cloud Functions URL config
 *
 * In production, Cloud Functions are available at:
 * https://us-east1-iep-and-thrive.cloudfunctions.net/{functionName}
 *
 * For local development with emulators:
 * http://localhost:5001/iep-and-thrive/us-east1/{functionName}
 */

const PROJECT_ID = "iep-and-thrive";
const REGION = "us-east1";

// Detect if running locally
const isLocal =
  typeof window !== "undefined" && window.location.hostname === "localhost";

export const FUNCTIONS_BASE_URL = isLocal
  ? `http://localhost:5001/${PROJECT_ID}/${REGION}`
  : `https://${REGION}-${PROJECT_ID}.cloudfunctions.net`;

export const CLOUD_FUNCTIONS = {
  contact: `${FUNCTIONS_BASE_URL}/contact`,
  enroll: `${FUNCTIONS_BASE_URL}/enroll`,
  stripeCheckout: `${FUNCTIONS_BASE_URL}/stripeCheckout`,
  summerGuideCapture: `${FUNCTIONS_BASE_URL}/summerGuideCapture`,
  submitEnrollmentAgreement: `${FUNCTIONS_BASE_URL}/submitEnrollmentAgreement`,
  getSignedAgreementPdf: `${FUNCTIONS_BASE_URL}/getSignedAgreementPdf`,
  // Tutoring (Epic H)
  // H1 — drop-in + IEP review reuse the existing one-time stripeCheckout
  tutoringDropIn: `${FUNCTIONS_BASE_URL}/stripeCheckout`,
  tutoringIepReview: `${FUNCTIONS_BASE_URL}/stripeCheckout`,
  // H3 — tutoring subscription checkout (Stripe subscription mode)
  tutoringSubscription: `${FUNCTIONS_BASE_URL}/subscriptionCheckout`,
  // H11 — Stripe customer-portal session minter
  customerPortal: `${FUNCTIONS_BASE_URL}/customerPortal`,
} as const;
