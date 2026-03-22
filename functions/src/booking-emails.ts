/**
 * Booking Email Cloud Functions
 * S4-02: Firestore-triggered functions for booking lifecycle emails
 */

import {
  onDocumentCreated,
  onDocumentUpdated,
} from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import { sendEmail, logEmail } from "./email-service";
import {
  bookingConfirmationTemplate,
  bookingReminderTemplate,
  bookingCancellationTemplate,
} from "./email-templates";
import {
  createCalendarEvent,
  deleteCalendarEvent,
} from "./calendar-sync";

// ─── On Booking Created → Send Confirmation ───

export const onBookingCreated = onDocumentCreated(
  {
    document: "bookings/{bookingId}",
    region: "us-east1",
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const booking = snapshot.data();
    const parentEmail = booking.parentEmail || booking.email;

    if (!parentEmail) {
      console.log("[BookingEmails] No parent email found, skipping");
      return;
    }

    // Format date and time for email
    const date = booking.date || "TBD";
    const startTime = booking.startTime || "TBD";
    const endTime = booking.endTime || "TBD";

    const template = bookingConfirmationTemplate({
      parentName: booking.parentName || "Parent",
      studentName: booking.studentName || "Student",
      date,
      startTime,
      endTime,
      type: booking.type || "consultation",
    });

    const sent = await sendEmail({
      to: parentEmail,
      subject: template.subject,
      htmlBody: template.html,
    });

    await logEmail(
      parentEmail,
      template.subject,
      "booking_confirmation",
      sent
    );

    // Create Google Calendar event
    await createCalendarEvent({
      bookingId: event.params.bookingId,
      parentName: booking.parentName || "Parent",
      studentName: booking.studentName || "Student",
      parentEmail,
      date: date,
      startTime: startTime,
      endTime: endTime,
      type: booking.type || "consultation",
    });
  }
);

// ─── On Booking Updated → Handle Cancellation ───

export const onBookingUpdated = onDocumentUpdated(
  {
    document: "bookings/{bookingId}",
    region: "us-east1",
  },
  async (event) => {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();

    if (!beforeData || !afterData) return;

    // Only send cancellation email when status changes to "cancelled"
    if (beforeData.status !== "cancelled" && afterData.status === "cancelled") {
      const parentEmail = afterData.parentEmail || afterData.email;
      if (!parentEmail) return;

      const template = bookingCancellationTemplate({
        parentName: afterData.parentName || "Parent",
        studentName: afterData.studentName || "Student",
        date: afterData.date || "TBD",
        startTime: afterData.startTime || "TBD",
        type: afterData.type || "consultation",
      });

      const sent = await sendEmail({
        to: parentEmail,
        subject: template.subject,
        htmlBody: template.html,
      });

      await logEmail(
        parentEmail,
        template.subject,
        "booking_cancellation",
        sent
      );

      // Delete Google Calendar event if one exists
      if (afterData.calendarEventId) {
        await deleteCalendarEvent(afterData.calendarEventId);
      }
    }
  }
);

// ─── Daily Reminder (8am ET) ───

export const sendBookingReminders = onSchedule(
  {
    schedule: "0 8 * * *", // 8am UTC — adjust for ET
    timeZone: "America/New_York",
    region: "us-east1",
  },
  async () => {
    // Get bookings for tomorrow
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tomorrowStr = tomorrow.toISOString().split("T")[0]; // YYYY-MM-DD

    const snapshot = await admin
      .firestore()
      .collection("bookings")
      .where("date", "==", tomorrowStr)
      .where("status", "==", "confirmed")
      .get();

    console.log(
      `[BookingReminders] Found ${snapshot.size} bookings for ${tomorrowStr}`
    );

    const promises = snapshot.docs.map(async (doc) => {
      const booking = doc.data();
      const parentEmail = booking.parentEmail || booking.email;
      if (!parentEmail) return;

      const template = bookingReminderTemplate({
        parentName: booking.parentName || "Parent",
        studentName: booking.studentName || "Student",
        date: booking.date || tomorrowStr,
        startTime: booking.startTime || "TBD",
        endTime: booking.endTime || "TBD",
        type: booking.type || "consultation",
      });

      const sent = await sendEmail({
        to: parentEmail,
        subject: template.subject,
        htmlBody: template.html,
      });

      await logEmail(
        parentEmail,
        template.subject,
        "booking_reminder",
        sent
      );
    });

    await Promise.all(promises);
    console.log("[BookingReminders] All reminders processed");
  }
);
