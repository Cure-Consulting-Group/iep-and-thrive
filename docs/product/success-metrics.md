# MVP success metrics

These definitions are written before the cohort data exists. They are the measurement contract for the Phase 1 gate and may not be changed after seeing results merely to make the outcome look better. The product’s north-star evidence is a child returning to useful instruction, not a download, rating, or monetization event.

## Primary gate: week-eight retention

**Definition.** The denominator is every consented MVP cohort device that opens its first instructional session during the cohort start window. A child is **week-eight retained** when that same device records at least one completed instructional session during cohort week eight, after the first open, with the session occurring in the product’s intended learning loop. The numerator is retained devices; the metric is numerator divided by denominator. A device that only opens a settings or support screen does not count. A device that returns for a session but does not complete the instructional encounter does not count.

The study must report the denominator, numerator, cohort dates, missing uploads, and any exclusions before comparing the result. The cohort path is the narrow parent-consented aggregate upload described in ADR-000 D6: sessions started, skills reached, and days since first open under a random participant token, with no name, account, or device identifier. The study does not create a learner record.

**Benchmark.** Compare the result with the category baseline of roughly 7% monthly churn. This is a comparison point, not a claim that the MVP has already achieved a target or that eight-week retention is identical to monthly subscription churn. The interpretation and confidence limits are owned by the study owner and founder before the readout.

**Decision.** If the cohort does not clear the pre-registered retention gate or the pattern shows an early content/agency cliff, stop and fix the product. Do not market harder, buy attention, or expand distribution to hide a retention failure.

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

Stop and fix the product if week-eight retention fails the pre-registered gate, if session completion drops materially as content becomes harder, if the cohort reaches the content floor before week eight, or if the measurement path cannot produce a trustworthy denominator and numerator. “Market harder” is not an acceptable response to any of those results. The product may proceed to distribution testing only after the founder and study owner can explain the retention curve and the content/agency changes made in response.

## Owners and open decisions

The founder owns the gate decision. The study owner owns cohort protocol, calculation reproducibility, and missing-data reporting. Engineering owns event semantics and the no-network invariant. The educator owns mastery rules and sequence validity. Counsel owns the future interpretation of consent and any data collection outside D1/D6. Before enrollment, the team must record the exact comparison method to the roughly 7% baseline, the minimum cohort size, and the performance support matrix; these are assumptions to validate, not invented historical facts.
