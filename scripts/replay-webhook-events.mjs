#!/usr/bin/env node

/**
 * Replay Stripe webhook deliveries after an operator reviews their state.
 *
 * Dry-run is the default. `--apply` is required to reset a terminal/legacy
 * claim or POST a replay. The script prints only event identifiers, types,
 * timestamps, claim state, and HTTP status — never a Stripe event body,
 * customer email, payment method, or provider error payload.
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=... GCLOUD_PROJECT=demo-payments \
 *     STRIPE_SECRET_KEY=... STRIPE_WEBHOOK_SECRET=... \
 *     node scripts/replay-webhook-events.mjs --event-id evt_123
 *
 *   node scripts/replay-webhook-events.mjs \
 *     --from 2026-09-01T00:00:00Z --to 2026-09-02T00:00:00Z
 *
 * Add `--apply` only after reviewing the preview. The production project has
 * no implicit default; set GCLOUD_PROJECT/GOOGLE_CLOUD_PROJECT or pass
 * `--project` explicitly. `STRIPE_WEBHOOK_URL` may override the derived HTTPS
 * function URL when replaying a local emulator or a staged endpoint.
 */

import { createHmac } from 'node:crypto'
import { initializeApp, applicationDefault, getApps } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import Stripe from 'stripe'

const PRODUCTION_PROJECT_ID = 'iep-and-thrive'
const WEBHOOK_EVENT_COLLECTION = 'webhookEventLog'

function usage() {
  console.error('Usage: replay-webhook-events.mjs --event-id <id> [--project <id>] [--apply]')
  console.error('   or: replay-webhook-events.mjs --from <ISO> --to <ISO> [--project <id>] [--apply]')
}

function parseArgs(argv) {
  const opts = {
    eventId: null,
    from: null,
    to: null,
    project: null,
    url: process.env.STRIPE_WEBHOOK_URL?.trim() || '',
    apply: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--event-id' || arg === '--event') opts.eventId = argv[++index]
    else if (arg === '--from') opts.from = argv[++index]
    else if (arg === '--to') opts.to = argv[++index]
    else if (arg === '--project') opts.project = argv[++index]
    else if (arg === '--url') opts.url = argv[++index]
    else if (arg === '--apply') opts.apply = true
    else if (arg === '--help' || arg === '-h') {
      usage()
      process.exit(0)
    } else {
      console.error(`ABORT: unknown argument: ${arg}`)
      usage()
      process.exit(2)
    }
  }

  if ((opts.eventId && (opts.from || opts.to)) || (!opts.eventId && (!opts.from || !opts.to))) {
    console.error('ABORT: provide exactly one event id or a complete --from/--to time range.')
    usage()
    process.exit(2)
  }
  return opts
}

/** Never read a Firebase default project for an operational replay. */
function resolveProjectId(opts) {
  const explicit =
    opts.project?.trim() ||
    process.env.GCLOUD_PROJECT?.trim() ||
    process.env.GOOGLE_CLOUD_PROJECT?.trim() ||
    ''
  if (!explicit) {
    console.error('ABORT: set GCLOUD_PROJECT/GOOGLE_CLOUD_PROJECT or pass --project <id>.')
    console.error(`This command replays payment webhooks and will not assume the production project "${PRODUCTION_PROJECT_ID}" or any other default.`)
    process.exit(1)
  }
  return explicit
}

function requireCredentials() {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.FIRESTORE_EMULATOR_HOST) {
    console.error('ABORT: GOOGLE_APPLICATION_CREDENTIALS is not set.')
    console.error('Point it at a service-account key, or set FIRESTORE_EMULATOR_HOST for a local emulator.')
    process.exit(1)
  }
}

function parseIsoSeconds(value, label) {
  const millis = Date.parse(value || '')
  if (!Number.isFinite(millis)) {
    console.error(`ABORT: ${label} must be a valid ISO-8601 timestamp.`)
    process.exit(2)
  }
  return Math.floor(millis / 1000)
}

function safeError(error) {
  if (!(error instanceof Error)) return 'non-error failure'
  return `${error.name}: ${error.message}`
    .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, '[redacted-email]')
    .replace(/\b(?:sk|rk|pk|whsec)_[A-Za-z0-9]+\b/gi, '[redacted-secret]')
    .replace(/\b(?:payment[_-]?method|paymentMethod|card|cvc|cvv|email)\s*[:=]\s*[^\s,;]+/gi, '[redacted-sensitive-field]')
    .replace(/\b(?:\d[ -]?){13,19}\b/g, '[redacted-payment-identifier]')
    .replace(/\s+/g, ' ')
    .slice(0, 240)
}

function claimSummary(snapshot) {
  if (!snapshot.exists) return 'absent → acquire on replay'
  const data = snapshot.data() || {}
  if (data.status === 'succeeded') return 'succeeded → no change'
  if (data.status === 'processing') {
    const expiry = data.leaseExpiresAt?.toMillis?.() ?? null
    if (expiry !== null && expiry > Date.now()) return 'processing/live lease → refuse'
    return 'processing/expired lease → reclaim on replay'
  }
  if (data.status === 'failed' && data.failureKind === 'permanent') {
    return 'failed/permanent → explicit replay reset'
  }
  if (data.status === 'failed') return 'failed/transient → acquire on replay'
  return 'legacy/unknown → explicit replay reset'
}

async function listEvents(stripe, opts) {
  if (opts.eventId) return [await stripe.events.retrieve(opts.eventId)]

  const from = parseIsoSeconds(opts.from, '--from')
  const to = parseIsoSeconds(opts.to, '--to')
  if (from > to) {
    console.error('ABORT: --from must be earlier than or equal to --to.')
    process.exit(2)
  }

  const events = []
  const listing = stripe.events.list({ created: { gte: from, lte: to }, limit: 100 })
  for await (const event of listing) events.push(event)
  return events
}

async function resetForManualReplay(db, event) {
  const ref = db.collection(WEBHOOK_EVENT_COLLECTION).doc(event.id)
  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists) return 'absent'
    const data = snapshot.data() || {}
    if (data.status === 'succeeded') return 'succeeded'
    if (
      data.status === 'processing' &&
      data.leaseExpiresAt?.toMillis?.() > Date.now()
    ) {
      return 'live'
    }

    const attempts =
      typeof data.attempts === 'number' && Number.isInteger(data.attempts) && data.attempts >= 0
        ? data.attempts
        : 0
    const now = Timestamp.now()
    transaction.set(ref, {
      eventId: event.id,
      eventType: typeof data.eventType === 'string' ? data.eventType : event.type,
      type: typeof data.type === 'string' ? data.type : event.type,
      status: 'failed',
      failureKind: 'transient',
      attempts,
      leaseId: null,
      leaseExpiresAt: null,
      firstSeenAt: data.firstSeenAt || now,
      lastError: 'manual replay requested',
      replayRequestedAt: now,
      updatedAt: now,
    }, { merge: true })
    return 'reset'
  })
}

function replayPayload(event, webhookSecret) {
  const payload = JSON.stringify(event)
  const timestamp = Math.floor(Date.now() / 1000)
  const signed = `${timestamp}.${payload}`
  const digest = createHmac('sha256', webhookSecret).update(signed).digest('hex')
  return { payload, signature: `t=${timestamp},v1=${digest}` }
}

function resolveWebhookUrl(opts, projectId) {
  const url = opts.url || `https://us-east1-${projectId}.cloudfunctions.net/stripeWebhook`
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(parsed.hostname)) {
      console.error('ABORT: replay URL must use HTTPS outside localhost.')
      process.exit(1)
    }
    return parsed.toString()
  } catch {
    console.error('ABORT: STRIPE_WEBHOOK_URL/--url is not a valid URL.')
    process.exit(1)
  }
}

async function postReplay(url, event, webhookSecret) {
  const { payload, signature } = replayPayload(event, webhookSecret)
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'stripe-signature': signature,
    },
    body: payload,
    signal: AbortSignal.timeout(30_000),
  })
  // Do not read or print the response body: a provider/error envelope can
  // contain data that is not safe for an operator terminal.
  return response.status
}

async function main() {
  const opts = parseArgs(process.argv.slice(2))
  const projectId = resolveProjectId(opts)
  requireCredentials()

  const stripeKey = process.env.STRIPE_SECRET_KEY?.trim() || ''
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim() || ''
  if (!stripeKey || !webhookSecret) {
    console.error('ABORT: STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET are required.')
    process.exit(1)
  }

  if (!getApps().length) initializeApp({ credential: applicationDefault(), projectId })
  const db = getFirestore()
  const stripe = new Stripe(stripeKey)
  const events = await listEvents(stripe, opts)
  const mode = opts.apply ? 'APPLY' : 'DRY RUN (no writes; pass --apply to execute)'
  console.log(`\nStripe webhook replay — project ${projectId}`)
  console.log(`Mode: ${mode}`)
  console.log('═'.repeat(78))

  if (events.length === 0) {
    console.log('No matching Stripe events found.')
    return
  }

  const url = opts.apply ? resolveWebhookUrl(opts, projectId) : null
  for (const event of events) {
    const claim = await db.collection(WEBHOOK_EVENT_COLLECTION).doc(event.id).get()
    const created = new Date(event.created * 1000).toISOString()
    console.log(`\n${event.id}  type=${event.type}  created=${created}`)
    console.log(`  claim: ${claimSummary(claim)}`)

    if (!opts.apply) continue
    if (claim.exists && claim.data()?.status === 'succeeded') {
      console.log('  action: skipped; succeeded work is never replayed automatically')
      continue
    }

    const reset = await resetForManualReplay(db, event)
    if (reset === 'live') {
      console.log('  action: refused; another worker holds a live lease')
      continue
    }
    if (reset === 'succeeded') {
      console.log('  action: skipped; event became succeeded during review')
      continue
    }
    if (reset === 'reset') console.log('  action: reset terminal/legacy state for one explicit replay')
    else console.log('  action: no existing claim; webhook will acquire it')

    const status = await postReplay(url, event, webhookSecret)
    console.log(`  HTTP status: ${status}`)
  }
}

main().catch((error) => {
  console.error(`\nFAILED: ${safeError(error)}`)
  process.exitCode = 1
})
