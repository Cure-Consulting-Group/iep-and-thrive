# Tutoring Slot Management Runbook

> Owner: Founder. Last reviewed: 2026-05-02.

This runbook covers ongoing weekly availability management for the
year-round tutoring offering. Tutoring slots live in the same Firestore
collection as discovery-call and consultation slots (`availableSlots/`)
but with `type: "tutoring"`. They're seeded in bulk via a script and
edited one-off through the admin UI when needed.

---

## When to use what

| Task | Tool | Frequency |
|---|---|---|
| Initial roll-out — seed 12 weeks of slots from the standard template | `scripts/seed-tutoring-slots.mjs` | Once at launch |
| Quarterly refresh — extend the calendar another 12 weeks | `scripts/seed-tutoring-slots.mjs` | Every ~10 weeks |
| Schedule change — drop Friday afternoons, add Saturday morning, etc. | Edit template + `--rebuild` | When schedule changes |
| Black out one specific date (illness, conference, snow day) | `/admin/slots` UI | Ad-hoc |
| Add a one-off slot outside the weekly template | `/admin/slots` UI | Ad-hoc |
| Cohort weeks (Jul 7 – Aug 14) | Auto-skipped by seeder; add manually if needed | Annual |

---

## Quick-start: seed 12 weeks of slots

```bash
# From the repo root, with gcloud auth application-default login active:
node scripts/seed-tutoring-slots.mjs --weeks 12
```

Defaults applied:
- **Start date:** the next Monday (today, if today is Monday)
- **Template:** the embedded `DEFAULT_TEMPLATE` in the script
  (Mon 4–6pm · Wed 4–5pm · Fri 3–5pm · Sat 10am–12pm)
- **Duration:** 60 minutes per slot
- **Cohort blackout:** Jul 7 – Aug 14, 2026 (skipped automatically)

You'll see a summary like:

```
Seed tutoring slots → project: iep-and-thrive
════════════════════════════════════════════════════════════
Window:    2026-05-11 → 2026-08-02  (12 week(s))
Cohort blackout: 2026-07-07 → 2026-08-14 (auto-skipped)
Mode:      IDEMPOTENT (skip dupes)
────────────────────────────────────────────────────────────
Created:                  104
Skipped (already exist):  28
Skipped (cohort window):  44  (16 day(s))
════════════════════════════════════════════════════════════
Done.
```

Re-running the same command is **safe** — slots that already exist at
the same `(date, startTime)` are skipped, never overwritten.

---

## Pre-flight: --dry-run

Always run with `--dry-run` first when changing the template or window:

```bash
node scripts/seed-tutoring-slots.mjs --dry-run --weeks 4
```

The script will print every slot it WOULD create, grouped by date, with
no Firestore writes. Inspect the output, then re-run without
`--dry-run`.

---

## Seeder reference

```
node scripts/seed-tutoring-slots.mjs [flags]

  --start YYYY-MM-DD   Anchor date (default: next Monday)
  --weeks N            Weeks to seed (default: 12, max: 52)
  --rebuild            Delete existing tutoring slots in window first,
                       then recreate from the template
  --dry-run            Print slots without writing to Firestore
  --template PATH      Path to JSON template (default: embedded template)
  -h, --help           Show help
```

**Authentication:** the script uses `firebase-admin` with Application
Default Credentials. Either set `GOOGLE_APPLICATION_CREDENTIALS` to a
service-account JSON path, or run `gcloud auth application-default
login` once on your workstation.

**Project guard:** if `GCLOUD_PROJECT` or `GOOGLE_CLOUD_PROJECT` is set
to anything other than `iep-and-thrive`, the script aborts before
touching Firestore.

---

## Editing the weekly template

The default template lives inline at the top of
`scripts/seed-tutoring-slots.mjs`. For longer-term schedules you can
edit `scripts/tutoring-slot-template.json` and pass `--template`:

```json
{
  "monday":    ["16:00", "17:00", "18:00"],
  "tuesday":   [],
  "wednesday": ["16:00", "17:00"],
  "thursday":  [],
  "friday":    ["15:00", "16:00", "17:00"],
  "saturday":  ["10:00", "11:00", "12:00"],
  "sunday":    []
}
```

Rules:
- Times are 24-hour `HH:mm` strings, local Long Island time (Eastern).
- An empty array means **no slots that day** — explicitly include the
  key with `[]` to be unambiguous.
- All seven day keys must be present (validated on load).
- The script computes each slot's end time by adding 60 minutes to the
  start. To run shorter or longer sessions, edit the script's
  `DEFAULT_DURATION_MINUTES` constant (a future change ticket can
  promote this to a CLI flag).

**Re-seeding after a template change:**

1. Edit the template JSON (or the inline `DEFAULT_TEMPLATE`)
2. Dry-run to preview:
   ```bash
   node scripts/seed-tutoring-slots.mjs --dry-run --weeks 12 \
     --template scripts/tutoring-slot-template.json
   ```
3. Run with `--rebuild` to wipe the old slots in the window and replace:
   ```bash
   node scripts/seed-tutoring-slots.mjs --weeks 12 --rebuild \
     --template scripts/tutoring-slot-template.json
   ```

> **Booked-slot safety:** `--rebuild` only deletes slots where
> `bookedBy` is null AND `isAvailable` is true. Booked or marked-busy
> slots are preserved untouched, so you can never accidentally cancel
> a confirmed family booking by re-seeding. The summary line
> `Preserved (booked):` reports how many were kept.

---

## Blacking out a specific date

Use the `/admin/slots` UI (https://iepandthrive.com/admin/slots):

1. Sign in as the admin account
2. Switch the **Slots for Date** picker to the date you want to black out
3. Click **Disable** on each slot, or **Delete** to remove it entirely

`Disable` keeps the slot record (audit trail) but flips
`isAvailable: false` so parents can't book it. `Delete` wipes the
record. Either way, parents see "no slots available" for that day.

If a parent has already booked a slot you need to cancel:

1. Go to `/admin/bookings`
2. Find the booking, change status to `cancelled`
3. The booking system will automatically free the slot and notify the
   parent (per the existing booking lifecycle Cloud Function)

---

## Adding a one-off slot

`/admin/slots` UI → **Create Slots** → **Single** mode:

1. Set the date and time
2. Choose the type — **NOTE:** the existing UI lists Discovery Call /
   Consultation / Check-In. Until ticket H5 lands and adds "Tutoring"
   to the slot-type dropdown, one-off tutoring slots have to be added
   via the admin SDK or by re-running the seeder with a custom template
   that includes that single date.
3. After H5: select **Tutoring** from the dropdown and click
   **Create Slot**

For frequently-needed one-offs (a make-up session, a special holiday
hour), prefer adding to the weekly template and re-seeding — the
template stays the source of truth.

---

## Cohort weeks (July 7 – August 14, 2026)

The seeder hard-codes the cohort blackout — no tutoring slots are
generated inside that window because the founder is in cohort
delivery. Existing weekly subscribers should expect a paused or
reduced cadence during these weeks (per the subscription policy in
`docs/tutoring-prd.md`).

If you need to add a single tutoring slot during cohort weeks
(e.g., a returning parent needs an off-cycle session):

- Use `/admin/slots` → Single mode (manual override)
- Do NOT edit the seeder's `COHORT_BLACKOUT_*` constants

This keeps the blackout policy explicit and prevents accidentally
seeding a full week of cohort-conflicting slots.

---

## When to re-run

| Trigger | Action |
|---|---|
| **Initial launch** | Seed 12 weeks once; verify `/admin/subscribers` and `/book?type=tutoring` |
| **Calendar runway < 4 weeks** | Re-seed forward another 12 weeks (idempotent — safe) |
| **Schedule change** (new day, new time) | Edit template, run `--dry-run`, then `--rebuild` |
| **Annual cohort dates change** | Edit `COHORT_BLACKOUT_START` / `COHORT_BLACKOUT_END` in the seeder, redeploy as a normal code change |
| **Founder going on vacation** | `/admin/slots` UI: disable each affected day's slots manually |

A useful operational rhythm: every Monday morning, glance at
`/admin/slots` to make sure the next 4 weeks have visible slots. If
the runway is shrinking, run:

```bash
node scripts/seed-tutoring-slots.mjs --weeks 12
```

Idempotency makes this a safe weekly habit.

---

## Verification & testing

### Manual verification (after every run)

```bash
# Dry-run identical to what you just ran:
node scripts/seed-tutoring-slots.mjs --dry-run --weeks <N> --start <YYYY-MM-DD>
```

If the dry-run reports zero new slots after a real run, that's the
idempotent-success signal: everything is already in place.

### Spot-check the booking calendar

1. Sign in as a test subscriber account
2. Visit `/book?type=tutoring`
3. Confirm slots appear on the expected days
4. Confirm cohort-window weeks (Jul 7 – Aug 14) show no slots

### Unit tests

The seeder's pure planning logic (`planSlots`) has unit tests at
`tests/unit/seed-tutoring-slots.test.mjs`. Run them after editing the
seeder:

```bash
node tests/unit/seed-tutoring-slots.test.mjs
```

These cover cohort blackout boundaries, day-of-week mapping, end-time
arithmetic, and empty-template behaviour. Pass = safe to deploy.

---

## Troubleshooting

**Q: I ran the seeder and got `ABORT: GCLOUD_PROJECT="..."`**

The script refuses to run unless the active gcloud project is
`iep-and-thrive` (or unset). Fix:

```bash
unset GCLOUD_PROJECT GOOGLE_CLOUD_PROJECT
gcloud config set project iep-and-thrive
```

Re-run.

**Q: `Could not load the default credentials`**

Set up Application Default Credentials:

```bash
gcloud auth application-default login
```

This opens a browser, signs you in, and writes credentials to a
well-known path that `firebase-admin` finds automatically.

**Q: I want to delete ALL future tutoring slots and start over**

```bash
node scripts/seed-tutoring-slots.mjs --weeks 52 --rebuild --start <today>
```

This rebuilds the next 52 weeks, deleting un-booked tutoring slots in
that window and recreating from the current template. Booked slots
are preserved.

**Q: I edited the inline DEFAULT_TEMPLATE and the change isn't taking effect**

The script reads the inline template once per invocation — no caching.
If your change isn't reflected, double-check you saved the file and
that you're not still passing `--template <old-path>`.

**Q: Slots show up in Firestore but parents can't see them on the booking page**

Check `isAvailable: true` and `type: "tutoring"` in the Firestore
document. If those look right, check the booking page query — it may
be filtering by date range that doesn't include the seeded dates.
Compare to the queries in `lib/booking-service.ts`.

---

## Change log

| Date | Author | Change |
|---|---|---|
| 2026-05-02 | Initial draft (H9) | First version |
