/**
 * Google Calendar Sync — Cloud Function
 * S4-03: Creates/deletes Google Calendar events for bookings
 *
 * Graceful fallback: skips calendar operations when credentials not configured.
 */

import * as admin from "firebase-admin";
import { google } from "googleapis";

// ─── Get Calendar Client ───

function getCalendarClient() {
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    return null;
  }

  try {
    const credentials = JSON.parse(serviceAccountKey);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });

    return google.calendar({ version: "v3", auth });
  } catch (error) {
    console.error("[Calendar] Failed to parse service account key:", error);
    return null;
  }
}

// ─── Create Calendar Event ───

export async function createCalendarEvent(data: {
  bookingId: string;
  parentName: string;
  studentName: string;
  parentEmail: string;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
}): Promise<string | null> {
  const calendar = getCalendarClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";

  if (!calendar) {
    console.log(
      "[Calendar] Credentials not configured — event NOT created (scaffold mode)"
    );
    console.log(`[Calendar] Would create event for: ${data.parentName} on ${data.date}`);
    return null;
  }

  const typeLabel =
    data.type === "discovery_call"
      ? "Discovery Call"
      : data.type === "consultation"
        ? "Consultation"
        : "Check-In";

  // Build ISO datetime strings (assume ET timezone)
  const startDateTime = `${data.date}T${convertTo24h(data.startTime)}:00`;
  const endDateTime = `${data.date}T${convertTo24h(data.endTime)}:00`;

  try {
    const event = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: `${typeLabel}: ${data.studentName} (${data.parentName})`,
        description: `Booking ID: ${data.bookingId}\nParent: ${data.parentName}\nStudent: ${data.studentName}\nType: ${typeLabel}`,
        start: { dateTime: startDateTime, timeZone: "America/New_York" },
        end: { dateTime: endDateTime, timeZone: "America/New_York" },
        attendees: data.parentEmail ? [{ email: data.parentEmail }] : [],
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 24 * 60 },
            { method: "popup", minutes: 30 },
          ],
        },
      },
    });

    const eventId = event.data.id || null;

    // Store calendarEventId back on the booking document
    if (eventId) {
      await admin
        .firestore()
        .collection("bookings")
        .doc(data.bookingId)
        .update({ calendarEventId: eventId });
      console.log(`[Calendar] Created event ${eventId} for booking ${data.bookingId}`);
    }

    return eventId;
  } catch (error) {
    console.error("[Calendar] Failed to create event:", error);
    return null;
  }
}

// ─── Delete Calendar Event ───

export async function deleteCalendarEvent(
  calendarEventId: string
): Promise<void> {
  if (!calendarEventId) return;

  const calendar = getCalendarClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";

  if (!calendar) {
    console.log(
      "[Calendar] Credentials not configured — event NOT deleted (scaffold mode)"
    );
    return;
  }

  try {
    await calendar.events.delete({
      calendarId,
      eventId: calendarEventId,
    });
    console.log(`[Calendar] Deleted event ${calendarEventId}`);
  } catch (error) {
    console.error("[Calendar] Failed to delete event:", error);
  }
}

// ─── Helpers ───

/**
 * Convert "10:00 AM" style time to "10:00" 24h format.
 */
function convertTo24h(time: string): string {
  if (!time) return "00:00";

  // Already in 24h format
  if (!time.toLowerCase().includes("am") && !time.toLowerCase().includes("pm")) {
    return time.replace(/[^0-9:]/g, "");
  }

  const isPM = time.toLowerCase().includes("pm");
  const cleaned = time.replace(/[ap]m/i, "").trim();
  const [hoursStr, minutesStr] = cleaned.split(":");
  let hours = parseInt(hoursStr, 10);
  const minutes = minutesStr ? minutesStr.replace(/\D/g, "") : "00";

  if (isPM && hours !== 12) hours += 12;
  if (!isPM && hours === 12) hours = 0;

  return `${hours.toString().padStart(2, "0")}:${minutes.padStart(2, "0")}`;
}
