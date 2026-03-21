/**
 * Google Calendar Service — Scaffold
 *
 * This module will integrate with the Google Calendar API to:
 * 1. Create calendar events when bookings are confirmed
 * 2. Delete calendar events when bookings are cancelled
 * 3. Sync availability slots with a dedicated booking calendar
 *
 * SETUP REQUIRED:
 * 1. Enable the Google Calendar API in GCP Console:
 *    https://console.cloud.google.com/apis/library/calendar-json.googleapis.com?project=iep-and-thrive
 *
 * 2. Create OAuth2 credentials or a service account:
 *    - For service account: Share the target calendar with the service account email
 *    - For OAuth2: Complete the consent flow and store refresh token
 *
 * 3. Set environment variables:
 *    GOOGLE_CALENDAR_ID=primary (or a specific calendar ID)
 *    GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
 *    — OR —
 *    GOOGLE_OAUTH_CLIENT_ID=
 *    GOOGLE_OAUTH_CLIENT_SECRET=
 *    GOOGLE_OAUTH_REFRESH_TOKEN=
 *
 * 4. Install googleapis:
 *    npm install googleapis
 *
 * USAGE (after setup):
 *    import { createCalendarEvent, deleteCalendarEvent } from '@/lib/google-calendar'
 *    const eventId = await createCalendarEvent({ ... })
 */

// ─── Types ───

export interface CalendarEventInput {
  title: string
  description: string
  startDateTime: string   // ISO 8601: "2026-07-15T10:00:00-04:00"
  endDateTime: string     // ISO 8601: "2026-07-15T10:20:00-04:00"
  attendeeEmail?: string  // Parent's email
  location?: string       // Virtual meeting link or physical address
}

// ─── Placeholder Functions ───

/**
 * Creates a Google Calendar event for a booking.
 * Returns the Google Calendar event ID.
 *
 * TODO: Implement after Google Calendar API credentials are configured.
 */
export async function createCalendarEvent(
  input: CalendarEventInput
): Promise<string> {
  console.log('[Google Calendar] Event creation scaffold — credentials not yet configured')
  console.log('[Google Calendar] Event:', input.title, input.startDateTime)

  // Placeholder — return empty string until API is configured
  return ''

  /*
  // ──── Implementation Template ────
  // Uncomment and configure after setting up credentials

  import { google } from 'googleapis'

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}'),
    scopes: ['https://www.googleapis.com/auth/calendar'],
  })

  const calendar = google.calendar({ version: 'v3', auth })

  const event = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
    requestBody: {
      summary: input.title,
      description: input.description,
      start: { dateTime: input.startDateTime, timeZone: 'America/New_York' },
      end: { dateTime: input.endDateTime, timeZone: 'America/New_York' },
      attendees: input.attendeeEmail ? [{ email: input.attendeeEmail }] : [],
      location: input.location,
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 },
        ],
      },
    },
  })

  return event.data.id || ''
  */
}

/**
 * Deletes a Google Calendar event (e.g., on booking cancellation).
 *
 * TODO: Implement after Google Calendar API credentials are configured.
 */
export async function deleteCalendarEvent(eventId: string): Promise<void> {
  if (!eventId) return
  console.log('[Google Calendar] Event deletion scaffold — credentials not yet configured')
  console.log('[Google Calendar] Would delete event:', eventId)

  /*
  // ──── Implementation Template ────
  import { google } from 'googleapis'

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}'),
    scopes: ['https://www.googleapis.com/auth/calendar'],
  })

  const calendar = google.calendar({ version: 'v3', auth })

  await calendar.events.delete({
    calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
    eventId,
  })
  */
}

/**
 * Updates a Google Calendar event (e.g., reschedule).
 *
 * TODO: Implement after Google Calendar API credentials are configured.
 */
export async function updateCalendarEvent(
  eventId: string,
  input: Partial<CalendarEventInput>
): Promise<void> {
  if (!eventId) return
  console.log('[Google Calendar] Event update scaffold — credentials not yet configured')
  console.log('[Google Calendar] Would update event:', eventId, input)
}
