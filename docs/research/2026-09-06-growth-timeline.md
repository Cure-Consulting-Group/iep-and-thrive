# Growth timeline

**September 6, 2026.** Phases, gates, and what each one is allowed to assume. Serves
[the vision](2026-09-06-product-vision.md) and [PRD-LP-001](2026-09-06-product-brief.md).

**The discipline:** each phase proves one thing that the next phase depends on. A phase that
does not clear its gate does not get built past. The riskiest assumption is tested first and
cheapest, which is the reverse of how the existing corpus sequenced work.

---

## The three unknowns, in the order they can kill this

1. **Does a child return in week five?** The app holds ~35 real levels — under four weeks at its
   own pacing. Everything downstream is worthless if the answer is no, and this is the only one
   that is pure execution.
2. **Will a teacher recommend it with nothing in it for them?** No comparable answers this,
   because in every teacher-led product the teacher was compensated in free product they used in
   class. Compensation is barred, so this is not optional to test.
3. **Will a parent pay for the record after the child has succeeded?**

Retention first, distribution second, revenue third. Any other order tests a cheap question with
expensive work.

---

## Phase 0 — Make it lawful and shippable · now

Nothing here is optional and none of it is growth. It is the cost of having a child-facing app
in 2026.

- **COPPA.** The amended Rule's compliance deadline was 22 April 2026 and has passed. Confirm the
  no-personal-information design for the free tier, and get counsel on stroke data and any voice
  capture — "personal information" now expressly includes voiceprints. Produce the two required
  written artefacts: an information security programme and a data retention policy.
- **Age assurance.** Texas's App Store Accountability Act has been enforceable since July 2026;
  Utah parallels it. Integrate Apple's Declared Age Range API and delete the signal after use.
- **Kids Category decision.** Determine whether to enter it, and reconcile Firebase and
  Crashlytics with Guidelines 1.3 and 5.1.4.
- **Remove the six phantom levels** — `predict`, `monitor`, `retell`, `main-idea`, `details`,
  `topic` have no engine and would ask a child to trace the string "main-idea".

**Gate:** legally shippable, and no level in the app lies about what it does.

## Phase 1 — Depth · the only thing that matters until it is done

One goal: a child who starts in week one still has somewhere to go in week twelve.

- Build the decoding sequence out on the existing tracing engine, which already accepts any
  string. This is data entry against a sequence the founder already authored, not engineering.
- Add the minimum interactions tracing cannot cover — blending and word-building at least.
- Placement without an assessment, without an adult, and without failing a struggling reader
  repeatedly in their first session.
- Mastery and review pacing designed against the incumbent's failure: skippable narration,
  no remedial lecture on failure, a clean exit at any moment.

**Gate — the one that matters:** a cohort of real children, week-eight retention measured against
the category baseline of roughly 7% monthly churn. **If this gate fails, nothing else is worth
building**, and the honest response is to stop rather than to market harder.

## Phase 2 — The record · the first thing anyone pays for

Only once children stay.

- Skill-indexed progress: what was taught, what was mastered, what is emerging, over time.
- A parent-held export, phrased so a parent can carry it into a CSE meeting themselves. Never
  authored or presented by a DOE employee — Chancellor's Regulation C-110 §II.D.1 bars that, and
  the parent-held form sidesteps it entirely.
- Parent account, at which point personal information enters and verifiable consent is taken.
  This is the first gate in the entire product and it exists because the law requires it here and
  not before.
- Multi-child.

**Gate:** parents who saw their child progress convert at a rate that supports the business. The
rate is unknown; the only public anchor in the category is Prodigy's ">95% never paid," on a
different mechanic.

## Phase 3 — Distribution · the unproven one

Deliberately last, because the evidence for it is weakest and it cannot be tested honestly until
there is something worth recommending.

- **Teachers recommend. Nobody is paid.** No commissions, no revenue share, no referrer-linked
  codes, no free premium for referrals. Chancellor's Regulation C-110 §II.D.2 bars "any type of
  business relationship" with a student at the teacher's assigned school or their siblings, and
  Georgia, Texas and Massachusetts educator ethics codes bar it independently. **The exposure
  lands on the teacher, and the teachers are the channel.**
- **Reviews are the compensation.** Families who benefit say so publicly. That is permitted,
  costs nothing, and is the only lever available.
- **One written permission worth using:** a NYC teacher may advertise in "publications of the PTA
  or other parent's organizations of *other* schools" (COIB DOE FAQ).
- A free core makes this materially easier: recommending something free is a different act from
  recommending a purchase, and it is unambiguously permitted.

**Gate:** teachers refer without compensation, at a rate that produces cohorts rather than
anecdotes.

## Phase 4 — Scale, and only then enterprise

Enterprise sales are not forbidden — they are **sequenced last**, on purpose. An eight-to-
eighteen-month procurement cycle cannot be the first revenue for a company with no capital, and
building for a district buyer this early would bend the product away from the child.

Two conditions before any school conversation:

1. Outcome data from real children, which only Phases 1–2 can produce.
2. Acceptance that selling to a NYC school makes the company a firm "doing business with the
   City," activating moonlighting, ownership and $50-gift rules against the teacher network and
   the founder. **The channel and the enterprise motion are mutually exclusive while she is
   NYCPS-employed.** That is a real either/or with a date on it — the founder transition plan
   puts her day-job incompatibility at roughly September 2027.

---

## What each phase may assume

| Phase | May assume | May NOT assume |
| --- | --- | --- |
| 0 | Nothing | That existing compliance is adequate |
| 1 | The app is lawful | That anyone will stay |
| 2 | Children stay | That anyone will pay |
| 3 | Parents pay | That teachers will refer |
| 4 | Teachers refer | That schools will buy |

## The honest expectation

No solo, unfunded founder has built a teacher-referral-to-parent-purchase business to meaningful
revenue in the public record. Every comparable had venture funding and a team. On the most mature
teacher-distribution channel that exists, the average TeachersPayTeachers seller earns low
single-digit thousands a year.

So the realistic twelve-month outcome is **a validated retention curve on a small cohort of real
children and an answer on whether teachers refer** — not revenue. Twenty-four months is where
revenue becomes a reasonable question, and only if the Phase 1 gate cleared.

Planning against anything more optimistic means planning against a number nobody has evidence
for.
