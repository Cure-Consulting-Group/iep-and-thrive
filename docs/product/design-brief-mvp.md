# Design brief — MVP

**September 7, 2026.** The assignment for `/design-studio`. Every wireframe, screen, token, icon
and production asset for the MVP is produced from this brief. It is written to be handed to a
design team that has not read anything else in this repository.

Binding context: [ADR-000](../architecture/ADR-000-mvp-architecture-decisions.md),
[PRD-LP-001](../research/2026-09-06-product-brief.md),
[the vision](../research/2026-09-06-product-vision.md).

---

## The assignment in one sentence

Design a phone app that teaches a nine-year-old who cannot read well to decode, that they can
operate alone, without asking an adult what anything says.

## The user, stated precisely

A child aged 8 to 11 who reads below grade level. They have an IEP or would qualify for one. They
already know they are behind — they have been measured, pulled out of class, and grouped by
ability, and they are aware of all of it. They have a phone and more screen time than their peers,
not less. There is no adult sitting next to them. There may not be an adult available at all.

They are not a beginner. They are a competent nine-year-old who cannot decode.

## The five constraints that make this different from ordinary children's app design

**1. The interface cannot depend on reading.** This is the one that governs everything. Our user
cannot reliably read the labels on our buttons — that is why they are here. Every control must be
operable through iconography, audio, position and consistency. A first-time user must be able to
complete a full session having read nothing. Text may support; it may never be the only carrier of
meaning. Applies to error states, empty states and settings, which is where this rule is usually
quietly broken.

**2. It must not look like it is for a five-year-old.** The category's phone apps are built for
early readers and are decorated accordingly — cartoon animals, rounded pastel everything, googly
eyes. A nine-year-old who already feels behind reads that as an insult and closes it, and every
retention curve after that is a lie. The register we want is closer to a good sports or music app
for a young teenager than to a preschool toy: confident, clean, a little cool, taking the user
seriously. Warmth without infantilising. This is the single most likely way for the design to
fail, and it will fail invisibly, because a child does not file a complaint — they just stop.

**3. Interruption is a first-class state, not an edge case.** The incumbent holds 3.51 stars
across 14,209 ratings, and essentially every recurring complaint is about being trapped:
narration that cannot be skipped, remedial sequences that repeat, children counting down until
they can log off. The design answer is structural. Any tap interrupts audio. An exit is reachable
from every screen in one action. Leaving mid-item costs nothing and is never commented on. There
is no "are you sure?", no guilt, no progress-loss warning.

**4. No compulsion mechanics, at all.** No streaks, no daily-loss framing, no leaderboards, no
countdown timers, no notification nagging. Partly this is ethics — the user is a child with a
disability who has been failed by adults already. Partly it is method: the MVP exists to measure
whether the *teaching* retains a child, and retention bought with compulsion would corrupt the only
number the entire project is being built to produce.

**5. The instructional letterforms are a pedagogical decision, not a typographic one.** Inside the
tracing and word-building surfaces, glyphs must use a single-story `a` and a single-story `g` and
match a standard teaching hand. A child learning that this shape is /a/ must not meet a
double-story `a` in the one place they are being taught letter identity. This constraint applies to
instructional content only; UI chrome can use the interface face.

## Accessibility floor

WCAG 2.2 AA is the minimum, not the target, and it is a release gate. Note that the currently
shipped amber `#D4860B` measures 2.91:1 on white and 2.79:1 on cream — it fails even the 3:1
large-text threshold and is used for urgency text throughout. Every token pair must be checked with
`scripts/contrast_check.py` in both themes.

Also required: Dynamic Type support without layout collapse; generous letter spacing and line
height in any running text; no meaning carried by colour alone; motion respecting
`prefers-reduced-motion`; targets sized for a child's thumb, one-handed, in portrait; and no
timing-dependent interaction anywhere, since processing speed is frequently the diagnosis.

## Screens to design

**The child's product** — the whole MVP, in order of a first session:

1. **Cold launch → first item.** No onboarding, no account, no name, no age question, no "Welcome,
   Parent!". The app opens and teaching begins. This screen replaces an existing onboarding flow
   that a child alone literally cannot get past. Design the first fifteen seconds precisely.
2. **Sound introduction** — the child hears a phoneme and sees its spelling. Replayable
   indefinitely, interruptible always.
3. **Tracing canvas** — existing surface, needs redesign around a correctly scaled glyph, guided
   stroke order, and forgiving success criteria.
4. **Blending** — sounds pushed together into a word, at a pace the child controls. New surface.
5. **Word building with Elkonin boxes** — one box per phoneme, child places graphemes. New surface.
6. **Mastery check and advance** — must not read as a test.
7. **Failure and retry** — the highest-stakes screen in the product. A wrong answer must never
   trigger a lecture, a replay of instruction the child just heard, or any implication of
   deficiency.
8. **Session complete** — satisfying, brief, no upsell of any kind, no streak.
9. **Pause and exit** — reachable from everywhere, one action, no confirmation.

**The adult's surfaces** — small and deliberately unglamorous:

10. **Numeric parental gate.** Arithmetic (`13 × 4`) with a number pad — never the conventional
    spelled-out-word gate. Dyslexia is strongly heritable, so a reading-based gate is a literacy
    test administered to a parent who may share the diagnosis; it would lock our paying customer
    out of a reading app and look like ordinary funnel drop-off.
11. **Parent information screen**, behind the gate: what this is, what it teaches, what it costs
    (nothing), and what it collects (nothing).
12. **Cohort consent and code entry** — the one consented measurement path, opt-in, plainly
    revocable.

**States for every screen:** first-run, loading, mid-item, interrupted, offline (which is the
normal state, not an error), and reduced-motion.

## Production assets

- App icon, full iOS set, plus the App Store 1024px master.
- App Store screenshots and preview framing, positioned for a parent or teacher deciding whether
  it is safe to hand a child a phone — not for a child, who will never see the listing.
- Kids Category compliant listing assets.
- The design system: three-tier tokens, light and dark, validated by `tokens_lint.py` and
  `contrast_check.py`, exported as W3C tokens for implementation.
- Instructional glyph specification and any audio-visual sync guidance for the phoneme assets.

## What we are not designing

Accounts, login, payment, paywall, progress reports, the parent record, streaks, avatars, social
features, Android, the math curriculum, comprehension, and anything school-facing. All are out of
MVP scope by decision, not by omission.

## The bar

The design succeeds if a nine-year-old who cannot read the interface can be taught by it, alone,
eight weeks running, and never once feels talked down to.
