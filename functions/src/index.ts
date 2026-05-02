/**
 * Cloud Functions — IEP & Thrive
 * Barrel export for all functions
 */

import * as admin from "firebase-admin";

// Initialize Firebase Admin
admin.initializeApp();

// ─── S4-01: HTTP Functions (API replacements) ───
export { contact } from "./contact";
export { enroll } from "./enroll";
export { stripeCheckout } from "./stripe-checkout";
export { stripeWebhook } from "./stripe-webhook";

// ─── S4-02: Booking Email Triggers ───
export {
  onBookingCreated,
  onBookingUpdated,
  sendBookingReminders,
} from "./booking-emails";

// ─── Summer Guide Lead Capture + Drip ───
export { summerGuideCapture } from "./summer-guide-capture";
export { summerGuideDrip } from "./summer-guide-drip";

// ─── D2: Attendance Flag → Parent Notification ───
export { onAttendanceFlagged } from "./attendance-notifications";

// ─── D5: Friday Weekly Digest ───
export { sendWeeklyDigest } from "./weekly-digest";

// ─── G2: CAN-SPAM Unsubscribe Handler ───
export { unsubscribe } from "./unsubscribe";

// ─── G3: Pre-Program Ramp Series ───
export { sendPreProgramRamp, previewRampEmail } from "./pre-program-ramp";

// ─── B1: Welcome Email Sequence (day-0 / day-2 / day-7) ───
export { sendWelcomeSequence } from "./welcome-sequence";

// ─── Unified Email Preview (HTTPS, admin-token gated) ───
export { previewEmail } from "./preview-email";

// ─── G4: Balance Due Reminders (T-30 / T-14 / T-7) ───
export { sendBalanceDueReminders } from "./balance-due-reminders";
