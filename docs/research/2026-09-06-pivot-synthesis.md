# Pivot research — synthesis


> **SUPERSEDED, September 6, 2026.** This document concluded the wedge was the practitioner
> with the app as instrument, and argued against the parent-direct path. The owner reviewed that
> and decided otherwise: build the platform, because a practice monetizes her time and the
> day-job incompatibility point is roughly September 2027. Later research also corrected two of
> the premises below — the ~$175 band is *not* empty (Lexia $175/yr and Nessy ~$186/yr occupy it),
> and a verified product gap exists that this document did not know about. See
> **[PRD-LP-001](2026-09-06-product-brief.md)** for the operative direction. Retained for the
> market evidence, which stands.

**September 6, 2026.** Two parallel investigations: an internal map of the existing strategy
corpus, and external market intelligence on the SPED learning-platform market. Raw reports sit
beside this file. This is the synthesis and the decision it implies.

## The question this was meant to answer

The owner is pivoting to "the full iOS app and web platform, really targeting this market."
The research was commissioned to support that. **It does not support it as framed.**

## Both halves converge on one unresolved decision

The corpus contains a direct, never-reconciled contradiction:

> *"A career Dean who has written IEPs, chaired CSE meetings, and can explain to a hearing
> officer… **is the product.** Everything else is delivery."* — `icp-002:106`

> *"Scale the curriculum globally by **removing the human-provider bottleneck**… **The app *is*
> the provider.**"* — `ios-pivot/PRD.md:7`, `AUDIT.md:13`

The external research answers it, and the answer is the first one — but with the app as the
delivery instrument and the evidence generator rather than the product.

## The three facts that decide it

**1. Parent-direct is the only open path, and it is the graveyard.**
Education is the highest voluntary-churn subscription category Recurly tracks — 4.2% monthly.
Kids' education apps are reported at 7.4% monthly / 59.9% annually, with "child lost interest"
the leading cancellation reason. Begin (HOMER, codeSpark, Little Passports) filed Chapter 11 on
December 17, 2025, proposing to eliminate ~$106.5M of ~$205.5M in funded debt. HOMER was the most
popular reading app for under-fives. That was not a distribution failure.

Price anchors are also set low: IXL ~$10–20/mo, Reading Eggs $9.99/mo, Nessy ~$13.50–15.50/mo.
The one encouraging number is Lexia for Home at **$175/yr** — proof a segment pays ~10× for
something that reads as clinical rather than edutainment. At ~7% monthly churn that is roughly
$200 LTV, capping allowable CAC near $65.

**2. District procurement is closed for 24–36 months.**
ESSER's spending deadline passed March 2026; districts face ~$1,200 per-student cuts. Global
edtech investment fell from $16.7B (2021) to under $3B (2025). Incumbents undercut at $12–14 per
student per year (Amplify). NYC — the home market — is curriculum-locked under NYC Reads. And on
June 16, 2026 day-to-day administration of OSEP special-education programs moved to HHS, so
nobody at district level currently knows their federal counterpart. Budget zero district revenue
for 24 months.

**3. The credential already unlocks a paying channel that the app does not.**
NYC issues Related Services Authorizations and P4/SETSS when it cannot staff a mandated service.
The family then hires an independent provider who must be permanently licensed or certified by
NYSED. It pays a **licensed human** for delivered hours. No mechanism reimburses a
parent-purchased app.

## Where that lands

**The wedge is the practitioner, with the app as the instrument.**

Run an RSA/SETSS-eligible independent provider practice, which the credential already unlocks and
which pays at licensed-provider rates. Use the iOS app as the between-session practice tool
families receive, and as the instrument that produces the progress data behind the report.

This survives the objections that kill the alternatives:

- Revenue-positive from month one, versus needing ~1,000 subscribers at $175/yr to reach $175K.
- It generates efficacy evidence that cannot otherwise be bought — the What Works Clearinghouse
  lost its supporting contracts in the February 2025 IES cancellations and is not funding new
  content, so a small product can no longer out-evidence an incumbent through that route.
- **Parent-provided data stays outside FERPA and NY Ed Law §2-d entirely** — those attach when a
  *school* discloses records, not when a parent shares their own child's. Compliance becomes
  COPPA-only. This is a deliberate architectural fork, not an accident.
- It defers the district decision until there is data worth showing.

## The argument against the IEP-goal wedge, which is the appealing one

Worth recording because it was the intuitive answer and it is weaker than it looks:

- Parents buy their child reading, not a CSE artifact. The leading cancellation reason is the
  child losing interest; a good report does not survive a closed app.
- IEP-goal mapping is manual clinical work disguised as software. By hand it caps around 50
  families; automated, it makes clinical claims about a legally operative document.
- Goalbook (~$595/teacher/yr) and n2y already do IEP-goal alignment — for districts and teachers.
- The need is annual and one-shot, which pulls churn *up* right after the CSE meeting.
- "Credentialed NYC SPED interventionist" sells a person locally; it does not sell an app in Ohio.

The narrow defensible software claim, once there is data behind it: **a parent-held,
IEP-goal-indexed progress record with a CSE-ready export.** Generic apps produce engagement
metrics; districts produce goal data parents cannot access. Nobody produces goal-indexed evidence
the parent owns. That gap is real — it is just not a subscription business on its own yet.

## Compliance exposure that is live regardless of strategy

- **The amended COPPA Rule required full compliance by April 22, 2026 — already passed.**
  "Personal information" now covers biometric identifiers including **voiceprints**. The Sand Tray
  letter-formation stroke capture and any read-aloud fluency check sit near or inside that
  definition. It also requires a *written* information security program and a *written* data
  retention policy — documents, not practices.
- **The Texas App Store Accountability Act took effect January 1, 2026**, and the Supreme Court
  allowed enforcement in July 2026. App stores must pass age and parental-consent signals to
  developers, who must delete them after verification. Apple ships a Declared Age Range API.
  **This is unscoped engineering work on a shipping child-facing app.**
- FTC enforcement in this exact segment is active: the Illuminate Education order was finalised
  June 5, 2026 over a breach affecting 10M+ students; ABCmouse paid $10M over cancellation
  practices — directly relevant to a $175/yr subscription.
- **WCAG 2.1 Level AA** becomes the standard for district-licensed mobile apps, with compliance
  dates of April 26, 2027 and April 26, 2028 by entity size.

## Three holes only the owner can close

1. **Actual NYC RSA/SETSS provider rates.** The documents exist and are named in the raw report.
   This is the single most decision-relevant number and the research did not obtain it.
2. **Orton-Gillingham trademark clearance.** No live registration status, litigation history, or
   AOGPE licensing policy was found. Two hours of attorney time. Safe framing meanwhile:
   "developed by an Orton-Gillingham trained practitioner"; never "Orton-Gillingham certified app."
3. **Cost of an ESSA Tier IV logic model.** No vendor publishes pricing. Two phone calls.

## A note on numbers not used

Published "special education software market size" figures are unusable — $23B, $2.5B, and $1.08B
were retrieved from different vendors for ostensibly the same market. None are cited here. The
usable base is NCES: 7.5M students ages 3–21 under IDEA, 15% of public school students, specific
learning disabilities the largest category at 32% — 2022-23 data; 2024-25 is unpublished.
