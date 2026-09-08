# Architecture review — findings and dispositions

**September 7, 2026.** Adversarial system and privacy review of the architecture set by an
independent reviewer (Gemini 3.8 Flash, read-only worktree), against
[ADR-000](ADR-000-mvp-architecture-decisions.md). Twelve findings returned with a verdict of
`rethink`.

**Every finding below carries my own label, not the reviewer's severity.** Adversarial reviewers
overstate, and one finding is a legal conclusion I am not willing to take from a model. The
reviewer's severities are recorded so the disagreement is visible.

## Verdict: I disagree with `rethink`, and record why

`fix-first` is the correct verdict. Ten of the twelve findings are defects in *how the documents
specify* something, not evidence that a decision is wrong. None of D1 through D10 falls. The
zero-network posture, skills-first progress, and late-arriving personal information all survive
every finding intact; what fails is the precision of some claims and the robustness of two
post-MVP mechanisms that are not built for another year.

That distinction matters, because `rethink` would mean reopening decisions that are correct.

## Findings

| # | Finding | Reviewer | My label | Disposition |
| --- | --- | --- | --- | --- |
| F0 | The runtime invariant test uses an injected mock transport, which proves no *transport* calls, not no I/O. It cannot see a system framework opening a socket. | P0 | **Confirmed** | Fix the claim and add a real check |
| F1 | MetricKit registration does not itself transmit, but OS-level analytics may, under a separate user setting. | P1 | **Confirmed as a claim-precision defect; Disputed as a code-level leak** | Fix the wording, keep MetricKit |
| F2 | Post-MVP migration commits a staging generation as the active record, so a second device or a reinstall overwrites the first. | P0 | **Confirmed** | Redesign as an idempotent merge |
| F3 | A network failure between cloud commit and client acknowledgement leaves an unrecoverable desync; the retry is rejected. | P1 | **Confirmed** | Add an idempotent status endpoint |
| F4 | SwiftData models carry no sync state or outbox, so incremental sync would require diffing the whole store. | P1 | **Confirmed, downgraded to P2** | Post-MVP only; record, do not build |
| F5 | Cohort rate limits are keyed to accepted requests and participant tokens, so *failed* code guesses are unbounded. | P0 | **Confirmed** | Fix now |
| F6 | One participant can exhaust the shared cohort code's daily quota and deny the whole study. | P1 | **Confirmed** | Fixed by the same change as F5 |
| F7 | `daysSinceFirstOpen`, an exact seven-day cadence, and provider IP logs together fingerprint a participant across a few dozen families. | P1 | **Confirmed, raised to P0** | Fix now — this attacks the claim itself |
| F8 | `Presentation → Data → Domain` violates strict Clean Architecture by letting the UI reach persistence. | P1 | **Disputed** | A convention choice, not a defect |
| F9 | Domain restricted to Foundation cannot declare TCA `DependencyKey` conformances, pushing registration into Presentation. | P1 | **Confirmed** | Add a bridging target |
| F10 | StoreKit purchase and Sign in with Apple do not satisfy COPPA verifiable parental consent under 16 CFR § 312.5. | P0 | **Unverified** | Already ADR-000 Q1; route to counsel |
| F11 | Entitlement depends only on asynchronous App Store Server Notifications, so an immediate post-purchase migration races the webhook. | P0 | **Confirmed** | Add synchronous JWS verification |

## Notes on the four I did not simply accept

**F1 — the distinction is the whole product.** The reviewer says MetricKit "bypasses all three
enforcement layers" and recommends removing it. That overstates the mechanism: registering an
`MXMetricManager` subscriber does not cause our binary to transmit anything. What is true, and what
we must say precisely, is that the operating system may send device analytics to Apple under the
user's own Share-Analytics setting, entirely independently of whether our app exists — and that
Xcode Organizer crash data reaching us is a consequence of that setting, not of a request we make.

Keeping MetricKit is right. Stating "the app makes zero network requests" is right. Stating "no
data about this child reaches anyone" would not be, and the privacy document must draw that line
explicitly rather than let a reader infer the stronger claim. Our entire trust proposition is the
precision of this sentence, so it gets fixed even though no code changes.

**F7 — raised, not lowered.** The reviewer rated this P1. It attacks the one claim the product is
built on, in the one place we do transmit, against a population of a few dozen where fingerprinting
is easy. An "unidentified participant token" that is trivially re-identifiable by upload timing is
worse than no anonymity claim at all, because families consented on the strength of it. Treated as
P0.

**F8 — disputed.** The reviewer applies textbook Clean Architecture to a TCA codebase. In TCA, a
feature holds its dependency clients and those clients live in the data layer; `Presentation → Data`
is the idiom, not a violation. Strict inversion would mean protocols in Domain and a separate
composition target — cleaner on paper, heavier in practice, and not what
[the Cure standard](../../CLAUDE.md) requires. Recorded as an open convention decision rather than
a defect. Note that F9, which I did confirm, pushes in the same direction and may make the
inversion worth doing anyway.

**F10 — unverified, and it stays that way.** The reviewer states a legal conclusion about
16 CFR § 312.5. It may well be correct — the FTC's enumerated consent methods do not obviously
include an in-app purchase, and the monetary-transaction method requires notifying the account
holder of each transaction. But an architecture reviewer is not counsel, and this is exactly the
question ADR-000 already routes to a lawyer as Q1. The finding's real value is the citation and the
suggested alternative; both go to counsel with the question. Nothing is changed on a model's legal
opinion.

## What the reviewer needed and did not have

1. A formal opinion on whether an in-app parental gate and StoreKit purchase satisfy verifiable
   parental consent (already ADR-000 Q1).
2. The `Info.plist` App Transport Security keys, network entitlements, and system-framework network
   capabilities — genuinely missing, and F0 cannot be closed without them.
3. A synchronous StoreKit 2 transaction verification endpoint (F11).
4. An in-app account deletion and Apple token revocation path, required by App Store Review
   Guideline 5.1.1(v). **Not previously captured anywhere** and the most useful of the four.
