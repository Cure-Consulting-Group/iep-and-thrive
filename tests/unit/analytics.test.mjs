import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

const source = ts.transpileModule(readFileSync('lib/analytics.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText

function loadAnalytics() {
  const events = []
  const logs = []
  const context = {
    exports: {},
    require() {
      throw new Error('analytics should not load runtime dependencies')
    },
    window: {
      gtag: (...args) => events.push(args),
    },
    process: { env: { NODE_ENV: 'development' } },
    console: { log: (...args) => logs.push(args) },
  }
  vm.runInNewContext(source, context)
  return { analytics: context.exports, events, logs }
}

test('analytics helpers never forward personal free text or intake payloads', () => {
  const { analytics, events, logs } = loadAnalytics()
  const personalName = 'Maya-raw-name-should-never-leave'
  const intakePayload = {
    childName: personalName,
    learningChallenge: 'private intake notes',
  }

  analytics.trackEnrollmentSubmit(personalName)
  analytics.trackContactSubmit(personalName)
  analytics.trackStripeCheckoutClick(personalName)
  analytics.trackDiscoveryCallClick(personalName)
  analytics.trackBookingCreated(personalName)
  analytics.trackFAQItemOpened(personalName)
  analytics.trackEvent('enrollment_form_submit', {
    form_type: 'enrollment_inquiry',
    name: personalName,
    intake: intakePayload,
    program_interest: personalName,
  })
  analytics.trackEvent('unknown_event', { intake: intakePayload })

  assert.equal(logs.length, 0, 'analytics must not log event payloads')
  assert.ok(events.length > 0)
  for (const event of events) {
    const serialized = JSON.stringify(event)
    assert.equal(serialized.includes(personalName), false)
    assert.equal(serialized.includes('private intake notes'), false)
    assert.equal(serialized.includes('intake'), false)
    if (event.length > 2) {
      assert.equal(typeof event[2], 'object')
      assert.equal(Array.isArray(event[2]), false)
    }
  }
})

test('analytics helpers emit stable keys for supported values', () => {
  const { analytics, events } = loadAnalytics()

  analytics.trackEnrollmentSubmit('Full Academic Intensive')
  analytics.trackFAQItemOpened('Does my child need an IEP to enroll?')

  assert.deepEqual(JSON.parse(JSON.stringify(events[0])), [
    'event',
    'enrollment_form_submit',
    { form_type: 'enrollment_inquiry', program_interest: 'full' },
  ])
  assert.deepEqual(JSON.parse(JSON.stringify(events[1])), [
    'event',
    'faq_item_opened',
    { question_id: 'program_eligibility' },
  ])
})
