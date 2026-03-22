/**
 * Google Calendar Service
 * S5-05: Creates/deletes Google Calendar events for bookings
 *
 * Primary integration runs via Cloud Functions (functions/src/calendar-sync.ts).
 * This client-side module provides types and a thin wrapper for any
 * server-side Next.js usage (e.g., API routes if re-enabled).
 *
 * SETUP:
 * 1. Enable Google Calendar API in GCP Console
 * 2. Create a service account and share the target calendar with it
 * 3. Set environment variables:
 *    GOOGLE_CALENDAR_ID=primary (or a specific calendar ID)
 *    GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
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

export interface BookingCalendarData {
  bookingId: string
  parentName: string
  studentName: string
  parentEmail: string
  date: string        // YYYY-MM-DD
  startTime: string   // "10:00 AM" or "10:00"
  endTime: string     // "10:20 AM" or "10:20"
  type: string        // "discovery_call" | "consultation" | "check_in"
}

// ─── Calendar Client ───

function getCalendarClient() {
  // Dynamic import to avoid bundling googleapis in client builds
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { google } = require('googleapis')

  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY

  if (!serviceAccountKey) {
    console.warn('[Calendar] GOOGLE_SERVICE_ACCOUNT_KEY not set — calendar sync disabled')
    return null
  }

  try {
    const credentials = JSON.parse(serviceAccountKey)
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    })

    return google.calendar({ version: 'v3', auth })
  } catch (error) {
    console.error('[Calendar] Failed to parse service account key:', error)
    return null
  }
}

// ─── Create Calendar Event ───

export async function createCalendarEvent(
  input: CalendarEventInput
): Promise<string> {
  const calendar = getCalendarClient()
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary'

  if (!calendar) {
    console.log('[Calendar] Skipping event creation — credentials not configured')
    return ''
  }

  try {
    const event = await calendar.events.insert({
      calendarId,
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

    console.log(`[Calendar] Created event: ${event.data.id}`)
    return event.data.id || ''
  } catch (error) {
    console.error('[Calendar] Failed to create event:', error)
    return ''
  }
}

// ─── Delete Calendar Event ───

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  if (!eventId) return

  const calendar = getCalendarClient()
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary'

  if (!calendar) {
    console.log('[Calendar] Skipping event deletion — credentials not configured')
    return
  }

  try {
    await calendar.events.delete({
      calendarId,
      eventId,
    })
    console.log(`[Calendar] Deleted event: ${eventId}`)
  } catch (error) {
    console.error('[Calendar] Failed to delete event:', error)
  }
}

// ─── Update Calendar Event ───

export async function updateCalendarEvent(
  eventId: string,
  input: Partial<CalendarEventInput>
): Promise<void> {
  if (!eventId) return

  const calendar = getCalendarClient()
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary'

  if (!calendar) {
    console.log('[Calendar] Skipping event update — credentials not configured')
    return
  }

  try {
    const requestBody: Record<string, unknown> = {}
    if (input.title) requestBody.summary = input.title
    if (input.description) requestBody.description = input.description
    if (input.startDateTime) requestBody.start = { dateTime: input.startDateTime, timeZone: 'America/New_York' }
    if (input.endDateTime) requestBody.end = { dateTime: input.endDateTime, timeZone: 'America/New_York' }
    if (input.attendeeEmail) requestBody.attendees = [{ email: input.attendeeEmail }]
    if (input.location) requestBody.location = input.location

    await calendar.events.patch({
      calendarId,
      eventId,
      requestBody,
    })
    console.log(`[Calendar] Updated event: ${eventId}`)
  } catch (error) {
    console.error('[Calendar] Failed to update event:', error)
  }
}
