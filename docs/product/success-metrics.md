# MVP success metrics

These definitions are written before the cohort data exists. They are the measurement contract for the Phase 1 gate and may not be changed after seeing results merely to make the outcome look better. The product’s north-star evidence is a child returning to useful instruction, not a download, rating, or monetization event.

## Primary gate: week-eight retention

**Definition.** The denominator is every consented MVP cohort device that opens its first instructional session during the cohort start window. A child is **week-eight retained** when that same device records at least one completed instructional session during cohort week eight, after the first open, with the session occurring in the product’s intended learning loop. The numerator is retained devices; the metric is numerator divided by denominator. A device that only opens a settings or support screen does not count. A device that returns for a session but does not complete the instructional encounter does not count.

The study must report the denominator, numerator, cohort dates, missing uploads, and any exclusions before comparing the result. The cohort path is the narrow parent-consented aggregate upload described in ADR-000 D6: sessions started, skills reached, and days since first open under a random participant token, with no name, account, or device identifier. The study does not create a learner record.

**Benchmark.** Compare the result with the category baseline of roughly 7% monthly churn. This is a
comparison point, not a target, and eight-week retention is not identical to monthly subscription
churn.

**What a cohort of 30-50 can and cannot establish.** This has to be stated before enrolment because
it determines what the readout is allowed to conclude. For a single proportion at n=40, the 95%
Wilson interval is roughly +/-15 points at its widest. An observed 12/40 carries the interval
[18.1%, 45.4%]; an observed 16/40 carries [26.3%, 55.4%]. Those overlap, so **this study cannot
distinguish a 30% retention product from a 45% one.** Estimating a rate to +/-10 points would need
n of about 97, and to +/-7 points about 196. We are not going to recruit that through an
uncompensated teacher network for an unlaunched app, and pretending otherwise would produce a
number with a false claim of precision attached.

What n=40 does establish reliably is the two things that actually change what we build.

**The pre-registered decision rule.** Fixed now, before Sprint 1, and not revisable after seeing
results. Expressed as proportions so it holds at any cohort size between 30 and 50.

| Observed week-eight retention | 95% interval at n=40 | Decision |
| --- | --- | --- |
| **20% or below** (<=8/40) | upper bound 34.8% | **Stop and fix.** The interval excludes an acceptable product. This is a real kill signal and we act on it. |
| **21% to 59%** | intervals overlap everything | **Ambiguous, declared in advance.** The study did not answer the rate question. Decide on the secondary evidence below, or fund a second cohort of ~100. Do not rationalise a number in this band into a pass. |
| **60% or above** (>=24/40) | lower bound 44.6% | **Proceed** to the record phase. |

Clearing the floor is not evidence of success. It is the absence of catastrophe, and the readout
must say so in those words.

**The secondary evidence, which is well powered at this n** because it is measured within each
child rather than across children:

1. **The session at which each child hits the content cliff.** Forty children give forty independent
   observations of where the content ran out. This is the single most actionable number in the
   study and it does not depend on the retention rate at all.
2. **The shape of the curve.** Where the drop falls -- week one, week three, week five -- tells us
   whether we have an onboarding problem, a difficulty-ramp problem, or a depth problem. Shape is
   far more informative here than level, and it survives a small n.
3. **Whether children return unprompted.** There are no notifications and no streaks by decision, so
   any return at all is signal rather than a response to a nudge.
4. **Parent-reported exit reasons**, gathered by follow-up from the consented cohort. Qualitative,
   small-n appropriate, and the only route to why rather than whether.

**Decision.** Apply the rule above. If the result lands in the ambiguous band, say "the study did
not answer this" out loud rather than picking the reading that justifies continuing. Do not market
harder, buy attention, or expand distribution in response to a retention failure.

## Supporting metrics

| Metric | Exact definition | Why it matters |
| --- | --- | --- |
| Session completion | Completed instructional encounters divided by started instructional encounters, reported by session and cohort week | Shows whether the 10–15-minute loop finishes |
| Skills mastered | Count of unique skill IDs meeting the authored mastery rule, reported per device and cohort week | Measures learning evidence rather than level-count progress |
| Time to first taught item | Elapsed time from first open to the first item that delivers instruction for a declared skill; report median and distribution | Detects onboarding and access friction |
| Placement quality | Week-two continuation rate segmented by inferred starting position, not placement accuracy | ADR-000 forbids a placement test; continuation is the useful outcome |
| Content availability | Share of enrolled devices with an eligible next level after each session | Detects the four-week content cliff and empty-path failures |
| Audio integrity | Share of authored audio references that resolve and play to completion in release validation | A phonics lesson cannot teach the intended sound with missing or synthesized instructional audio |

Supporting metrics are diagnostic. None supersedes the retention gate. A high skill count with low return behavior is not success; a long session with few mastered skills may represent friction.

## Anti-metrics

The team refuses to optimize downloads, star ratings, session length, streak counts, or raw level completions. Downloads measure acquisition, not teaching. Ratings may describe sentiment but cannot establish retention or learning. Longer sessions can mean engagement or that a child cannot exit. Streaks reward frequency and can pressure a child without proving skill. Raw level counts contradict the skill-first taxonomy.

Revenue is also not the first gate. The paid parent record is a post-retention hypothesis. A purchase before evidence that children stay would reverse the growth timeline’s order of unknowns.

## Measurement guardrails

- Report by cohort start week and intended three-sessions-per-week cadence.
- Preserve the raw aggregate counters and the calculation version.
- Do not infer mastery from rewards, streaks, time, or a single correct response.
- Do not call a child diagnosed, remediated, or at grade level based on these metrics.
- Do not identify a child or reconstruct identity from the random study token.
- Document missing uploads and device exclusions rather than silently removing them.
- Keep placement evaluation focused on week-two continuation, since the product starts teaching immediately.

## Stopping rule

Stop and fix the product if any of these hold:

1. Week-eight retention is **20% or below**, per the pre-registered rule above.
2. Session completion drops materially as content gets harder -- a difficulty-ramp failure, which
   the curve shape will show before the endpoint does.
3. The cohort reaches the content floor before week eight, in which case the study measured our
   content plan rather than our product and the gate must be re-run after the floor is raised.
4. The measurement path cannot produce a trustworthy denominator and numerator -- unclear consent,
   missing uploads, or an ambiguous exclusion rule. An untrustworthy number is worse than no number
   because it will be acted on.

"Market harder" is not an acceptable response to any of these. Distribution testing begins only
after the founder and study owner can explain the retention curve and name the content and agency
changes made in response to it.

## Owners and open decisions

The founder owns the gate decision. The study owner owns cohort protocol, calculation reproducibility, and missing-data reporting. Engineering owns event semantics and the no-network invariant. The educator owns mastery rules and sequence validity. Counsel owns the future interpretation of consent and any data collection outside D1/D6. Before enrollment, the team must record the exact comparison method to the roughly 7% baseline, the minimum cohort size, and the performance support matrix; these are assumptions to validate, not invented historical facts.
