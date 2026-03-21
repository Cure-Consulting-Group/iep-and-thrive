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

// ─── S4-02: Booking Email Triggers ───
export {
  onBookingCreated,
  onBookingUpdated,
  sendBookingReminders,
} from "./booking-emails";
