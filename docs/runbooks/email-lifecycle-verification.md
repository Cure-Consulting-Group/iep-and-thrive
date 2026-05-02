# Email Lifecycle Verification Runbook

This runbook covers manual verification for the four lifecycle email
families introduced in B1 / G4 / G6 / G11. All four are scheduled
Cloud Functions running daily at 9:00 AM ET in us-east1.

The unified previewEmail HTTPS function lets the founder render or send
any template from any test cohort persona, bypassing the isTest filter.
It still respects unsubscribed.

## Endpoint

Hit the previewEmail function URL with query params:
- kind: welcome, balance, photoRelease, intakeIncomplete, or ramp
- phase: appropriate phase string per family
- uid: parent uid in Firestore
- sendTo: destination email address
- dryRun: optional. When 1, response includes rendered html and text without sending.

Required header X-Admin-Token must match the admin preview token env var.

## B1 — Welcome sequence (kind=welcome)

Phases:
- day-0: first run after a parent has depositPaid true on their user doc
- day-2: at least 2 days since depositPaidAt; branches on intakeSubmitted
- day-7: at least 7 days since depositPaidAt

Dedupe counter: users/{uid}.welcomeEmailsSent. Counter is bypassed for preview sends (where sendTo is set).

Manual checks:
1. Dry-run render the day-0 email for a deposited test persona.
2. Confirm the unsubscribe link appears in the footer (lifecycle kind).
3. Send to your real inbox using the sendTo query parameter.
4. Confirm the welcomeEmailsSent counter does NOT increment for previews.

## G4 — Balance due reminders (kind=balance)

Anchor: BALANCE DUE ISO is 2026-06-23. T-30 fires May 24, T-14 fires Jun 9, T-7 fires Jun 16.

Per-track balance amount (75 percent of tuition):
- full track: 3000 dollars
- reading track: 2625 dollars
- math track: 2625 dollars

Manual checks:
1. Dry-run the T-30 template for each track and confirm the dollar amount renders correctly.
2. Confirm the CTA link points at stripeCheckout with type=balance and the correct program param.
3. After a real send, confirm users/{uid}.balanceReminders.<phase> is set to true.

## G6 — Photo / video release reminder (kind=photoRelease)

Trigger window: daysToStart in 0..14 inclusive. The function fires for each parent who has
at least one student in deposited or enrolled status without photoReleaseSignedAt set,
and whose user doc does not yet have photoReleaseReminderSentAt.

Manual checks:
1. Dry-run for a deposited test persona; confirm the CTA points at /portal/photo-release.
2. Real send; confirm users/{uid}.photoReleaseReminderSentAt is written.
3. Run the function a second time; confirm no second send fires.

## G11 — Intake started-but-incomplete (kind=intakeIncomplete)

Trigger window: students with intakeStartedAt set, intakeSubmitted not true,
and at least 7 days since intakeStartedAt.

The intake page (/portal/intake) writes intakeStartedAt on first field interaction
and intakeSubmitted true plus intakeSubmittedAt on form submit.

Manual checks:
1. Sign in as a deposited test persona; visit /portal/intake; type one character into
   any field. Confirm users/{uid}/students/{sid}.intakeStartedAt is set in Firestore.
2. Backdate intakeStartedAt to 8 days ago via the Firestore console.
3. Trigger the scheduled function; confirm intakeIncompleteReminderSentAt is written
   on the student doc and the email lands.
4. Submit the intake form fully; confirm intakeSubmitted true is written and the next
   scheduled run skips the student.

## G3 — Pre-program ramp (kind=ramp, included for completeness)

Existing G3 templates are also reachable through previewEmail. This unifies founder QA
across both legacy previewRampEmail and new endpoints. Recommend deprecating
previewRampEmail in a future cleanup; the new function supports the same phases.

## Quick smoke test sequence

Iterate through every new template and ramp phase in dryRun mode and assert each one
returns a non-empty subject and templateId. A small loop in shell using curl plus jq
is sufficient. Any error response indicates a misconfigured template or schema mismatch.
