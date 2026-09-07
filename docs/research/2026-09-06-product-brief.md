# PRD-LP-001 — product brief

**Draft for approval, September 6, 2026.** Satisfies **TASK-LP-001**, which has blocked 14 web
and 20 iOS tickets. Grounded in four research reports committed alongside it; every factual
claim here traces to one of them or to the code.

---

## 1. What this is

A phone-native app that teaches a child to decode, and a parent-held record of what they
learned.

The child opens it alone and works through a systematic Orton-Gillingham decoding sequence. The
parent gets a record of progress against skills — one they own, can export, and can bring to a
CSE meeting if they choose.

## 2. Who it is for

**The child:** 8–11, reading below grade level, has or would qualify for an IEP. Dyslexia,
phonological processing difficulty, or a general decoding delay.

**The buyer:** their parent. Specifically the parent for whom the system has not delivered —
because eligibility takes months, because the service is mandated but unstaffed, or because
they were never told what to do at home.

**The affordability constraint, which governs pricing (§6):** the families most failed by the
system are disproportionately those who cannot pay a premium. Affluent parents already retain
private Orton-Gillingham tutors at ~$200/hour in NYC. They are not the underserved population.
A product priced for them serves the segment that needs it least.

## 3. The gap this fills, verified

> **Systematic decoding instruction, on a phone, for an 8–11 year old reading below grade
> level, with no adult sitting beside them.**

Every existing product satisfies two of those three:

| Product | Systematic | Age 8–11 | Phone |
| --- | --- | --- | --- |
| Lexia Core5 | yes | yes | **no** — 0 iPhone devices; 1024×768 minimum published |
| Nessy Reading & Spelling | yes | yes | **no** — no modern iOS app; store shelf abandoned since 2020 |
| Hooked on Phonics (17,946 ratings) | yes | **no** — sequence ends ~Grade 2 | yes |
| Teach Your Monster (29,074 ratings) | yes | **no** — early reader | yes |
| Lexy / GoLexic / DyslexiaBuddy | nominally | yes | yes — but 315 / 5 / 8 ratings |

**What is NOT true, and must not be claimed:** that parents have no path. Nessy sells direct at
~$15.50/month and Lexia for Home at $175/year, with no school, no evaluation and no gatekeeper.
The honest claim is form factor and independence, not absence. The dishonest version will not
survive contact with an informed parent.

## 4. The wedge, and it is not the phone

**Lexia Core5 holds 3.51 stars across 14,209 ratings.** For comparison: Khan Academy Kids 4.79,
Epic 4.71, Prodigy 4.75, IXL 4.34, Speech Blubs 4.62. It is the lowest-rated substantial
education app in the set at a sample size that is not noise.

Every recurring complaint is about pacing and agency, not pedagogy: remedial lectures that
repeat, narration the child cannot skip, "counting down the minutes until they can log off."

Nobody says the instruction is wrong. They say the child is trapped inside it.

**A well-funded, district-standard, evidence-backed product that children resent is the
opportunity.** The differentiator is a rigorous sequence the child does not hate — child agency
inside real instruction. That is orthogonal to form factor: a phone app with unskippable
narration earns the same 3.5 stars.

## 5. What this is not

- **Not a school product.** No district sales, no roster sync, no SSO, no DPA, no §2-d
  compliance programme. Selling to a NYC school would additionally activate conflict-of-interest
  rules against the teacher network (§8).
- **Not a service.** Nobody delivers hours. If it needs her time per family, it is the wrong
  product — that is the bottleneck this exists to escape.
- **Not comprehension, yet.** The existing engine traces any string; comprehension is a
  different engine and is deferred (§7).
- **Not a diagnostic.** It does not identify dyslexia or replace an evaluation.

## 6. Pricing — free core, paid record

The accessibility constraint and the unit economics point the same way, which is fortunate
because only one of them is negotiable.

**Free, permanently: the entire decoding sequence.** Every level, every grapheme, no cap. The
child's learning is not paywalled. This is the thing the parent cannot get elsewhere on a phone
and it is the thing the mission requires be free.

**Paid: the parent's record.** Progress against skills over time, the exportable summary, and
multi-child. Priced beneath the incumbents — the credible comparison set is Lexia at $175/year
and Nessy at ~$186/year, so a materially lower annual price is both defensible and differentiating.

Rationale, stated plainly so it can be argued with:

- A free core is the only structure that reaches the families this is for.
- It matches the category: Otsimo, Speech Blubs, Goally, Reading Eggs and Hooked on Phonics are
  all free-with-purchase.
- It converts the hardest problem (a parent paying before the child has succeeded) into an
  easier one (a parent paying because the child already has).
- **Ad-supported is not available.** The amended COPPA Rule makes third-party advertising in a
  child-directed app a compliance and reputational hazard this brand cannot absorb.

**Open, and material:** whether the paid record alone sustains the business. It may not. Named
as a risk rather than resolved (§10).

## 7. Content — the binding constraint

The app ships **38 level definitions**, of which about 35 are engine-backed: ~22 grapheme
tracing levels and 13 math. Six literacy levels (`predict`, `monitor`, `retell`, `main-idea`,
`details`, `topic`) have no engine behind them — the app would speak the string "main-idea" and
ask the child to trace it. They are titles, not levels.

At the app's own pacing (3–4 nodes per 10–15 minute session, 3 sessions/week), 38 nodes is
**under four weeks of content**. A twelve-month subscription needs roughly **546**.

**This is a data problem, not an engineering problem, and that is the single most valuable fact
about this codebase.** `LiteracyFeature` sets `currentLetter = level.targetValue`; `LetterTracer`
renders any string through CoreText. A new grapheme is one struct instance — no new art, no new
code. The scope-and-sequence she already authored has 98 rows.

**Therefore: decoding depth first.** Graphemes, blends, digraphs, vowel teams, syllable types,
morphology — the OG core, where structured literacy's evidence is strongest and where the engine
already works. Comprehension is a separate engine and a separate decision.

## 8. Distribution — seeding, not an engine

The founder has a NYC teacher network. What the evidence supports it doing is **seeding a first
cohort**, not driving growth.

**Hard constraints, from primary sources:**

- **No referral fees, commissions, revenue share, referrer-linked discount codes, or free
  premium in exchange for referrals.** Chancellor's Regulation C-110 §II.D.2 bars "any type of
  business relationship" with a student at the teacher's assigned school or their siblings.
  Georgia, Texas and Massachusetts educator ethics codes bar it independently. **The exposure
  lands on the teacher, not the company** — and the teachers are the channel.
- **One written permission:** a NYC teacher may advertise in "publications of the PTA or other
  parent's organizations of *other* schools" (COIB DOE FAQ).
- **Do not sell to a NYC school** while the network is the channel; it makes the company a firm
  "doing business with the City" and activates moonlighting, ownership and $50-gift rules
  against the network and the founder.

**Why growth is unproven:** every teacher→parent loop that worked (Epic, Prodigy, ClassDojo,
SplashLearn) required the teacher to use the product *with students in class*. That is ruled
out. No verified case exists of a teacher cold-recommending a paid consumer product with no
classroom usage underneath it. The only conversion figure in the category is Prodigy's ">95%
never paid."

A free core changes this materially: a teacher recommending something free to a struggling
family is a different act from recommending a purchase, and it is unambiguously permitted.

## 9. Compliance — non-negotiable, and it is the product thesis

"A child using a phone unsupervised" is simultaneously the differentiator and the hardest
regulatory posture available.

- **Amended COPPA Rule — full compliance was required by April 22, 2026 and has passed.**
  "Personal information" now includes biometric identifiers, expressly **voiceprints**. The Sand
  Tray captures stroke data; any read-aloud check captures voice. Both need counsel. A written
  information security programme and a written data retention policy are required *documents*.
- **Texas App Store Accountability Act** — effective January 1 2026, enforcement permitted since
  July 2026. Requires Apple's Declared Age Range API and deletion after verification. Utah
  parallel. **Unscoped engineering on a shipping app.**
- **Parent-provided data only.** No school ever supplies student data. This keeps the product
  outside FERPA and NY Ed Law §2-d entirely, and — separately — C-110 §II.D.1 bars a DOE
  employee from presenting privately-authored progress reports at a CSE meeting, while saying
  nothing about what a *parent* may bring. One architecture, three independent legal
  justifications. Do not compromise it.

## 10. Risks, ranked

1. **Retention.** Education is the highest voluntary-churn subscription category measured. The
   incumbent's own reviews say children disengage. Four weeks of content against a twelve-month
   subscription is the concrete form of this risk.
2. **Distribution has no proven mechanic.** Teacher referral without classroom usage is
   unprecedented. A free core helps and does not solve it.
3. **The empty slot may be empty for a reason.** Lexia's 1024×768 floor is a deliberate published
   constraint from a better-resourced company, and several dyslexia phone apps already exist with
   almost no users. That is evidence the constraint may be demand or distribution rather than
   product availability.
4. **Revenue may not follow a free core.** The paid record is unproven as a business.
5. **No solo unfunded comparable exists.** Every functioning teacher→parent loop had venture
   funding and a team.

## 11. What would make this real, in order

1. **Does a teacher refer at all without compensation?** Ethics makes compensation unavailable,
   so this is not optional to test, and no comparable answers it.
2. **Does a child return in week five?** Requires content past the four-week cliff. This is the
   one item that is pure execution and can start immediately.
3. **Does a parent pay for the record once the child has succeeded?**

## 12. Decisions this brief asks for

- Approve the definition in §1–§3, and retire "parents have no path" from all positioning.
- Approve free-core / paid-record (§6), or reject it with the alternative.
- Approve decoding-first, comprehension deferred (§7).
- Confirm no referral compensation, ever (§8).
- Accept that district sales are out of scope while the teacher network is the channel (§8).
