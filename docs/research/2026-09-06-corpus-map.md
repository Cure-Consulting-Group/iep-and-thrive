# Corpus map — what the existing strategy docs actually cover

**September 6, 2026.** Machine-assisted read of 28 strategy/research documents (4,361 lines),
excluding the September audit, ticket files, and runbooks. Findings only; file:line evidence in
each claim.

## Which product each doc serves

| Bucket | Files | Lines | Share |
| --- | --- | --- | --- |
| Physical school venture (NYC Carter-funded) | 10 | 1,917 | **44%** |
| Summer intensive (Long Island) | 6 | 1,178 | 27% |
| Tutoring service (removed 2026-09-06) | 2 | 643 | 15% |
| **iOS learning app** | 9 | **434** | **10%** |
| Cross-cutting | 1 | 189 | 4% |

**10% of the corpus concerns the product now being built**, and it is the thinnest material in the
repository. Those 434 lines contain no market sizing, no named competitor, no pricing research,
and no unit economics — the four things the 3,095 lines of services strategy do have.

The best-sourced material (Carter day school, citing Chalkbeat and Manhattan Institute, with
self-flagged weak assumptions) is for a product not being built.

## The contradictions that matter

**Human as product vs human as bottleneck.** `icp-002:106` — the credentialed Dean "*is the
product. Everything else is delivery.*" Against `ios-pivot/PRD.md:7` and `AUDIT.md:13` — remove
"the human-provider bottleneck"; "*the app is the provider.*" No document reconciles these. Every
downstream question resolves differently depending on the answer.

**The reporting engine that the PRD excludes.** `PRD.md:61` puts parent dashboards and PDF
generation out of scope for V1; `AUDIT.md:12` discards the parent portal. Five months later
`master-plan.md:65` declares the iOS app "*the outcome-reporting engine*" and `:69` demands IEP-goal
mapping plus report generation. **The PRD was never amended.** `compliance-framework.md:61` still
states the app does not collect IEP documents. The shipped code matches the PRD; the strategy
contradicts both.

**The web platform has no supporting document.** `ADR-001:25` "*abandons the existing React/Web
codebase*"; `PRD.md:59` puts web sync out of scope; `AUDIT.md:19` confirms abandoning the web
frontend. The stated pivot includes a web platform. Nothing in the corpus supports one.

**Six price points are live simultaneously:** $3,500–4,000/6wk, $5,500–6,500/6wk, $125/hr,
$76,500/yr, $82,000/yr, and a single "$9.99/mo" prefixed "e.g." (`ios-pivot/ROADMAP.md:55`).
`operating-rhythm:82` states plainly that "*a $3,500–4,000 price does not survive*" — while
`gtm-plan.md` still carries it.

**Four incompatible customers** appear across the corpus: parent paying cash, parent choosing with
district paying and attorney gatekeeping, the district itself, and a consumer app subscriber.

**Geography:** `roadmap.md:3` targets Long Island; `master-plan.md:20` says "*Long Island is the
wrong center of gravity*" because 92–98% of NY due-process filings are NYC. Both are current.

**Founder runway:** `master-plan.md:99` assumes ~25 months to open a school;
`founder-transition-plan.md:86` puts the day-job incompatibility point at "*roughly September
2027 — about twelve months from now — not September 2028.*"

## What is stale

Everything keyed to the Summer 2026 cohort (ran July 7 – Aug 14/15; today is September 6) —
`gtm-plan.md` phase gates, `financial-model.md`'s month-by-month cash flow for a year now
elapsed, `operations-manual.md` and `parent-handbook.md` dates, and validation deadlines of
April 15 and May 15, 2026.

**No document anywhere records the actual results of that cohort.** `roadmap.md:8–31` sets Year 1
OKRs (18 students, $45,000 net revenue, NPS 70+) and `master-plan.md:41–46` re-cites them as
instrumented targets. The outcome is unrecorded.

Still live and imminent: `master-plan.md:136–141` sets decision gates at **September 30, 2026**
(lock summer outcome data, begin CSE tracking) and **October 31, 2026** (four validation calls).

Tutoring docs (643 lines) describe files deleted today, including a file map naming
`components/sections/TutoringPricing.tsx` and `lib/subscription.ts`.

`docs/ios-pivot/*` was last touched 2026-05-25 — before Sprints 6–7, before the summer cohort,
and before the September audit.

## What is genuinely missing

Verified absent by full-text search across all 28 files:

- **No software market sizing of any kind.** The only TAMs are services markets — after-school
  programs and private tutoring.
- **No named software competitor, ever.** Zero hits for Lexia, Amplify, Nessy, Amira, IXL, Khan,
  Duolingo, Homer, Reading Eggs, MobyMax, Speechify. Every competitive analysis compares against
  *buildings*.
- **No subscription economics.** No CAC by channel, no churn, no ARPU, no trial-to-paid, no App
  Store commission modeled. `financial-model.md:185` books website development at **$0**.
- **No content production plan.** `RFC-001:27` asks directly how art scales for six weeks of daily
  content; nothing answers. Six weeks of content is a six-week retention ceiling, and no document
  addresses what a child does in month three.
- **NY Education Law §2-d appears nowhere** — the statute governing any vendor holding NY student
  data. Nor does any Apple Kids Category analysis (Guidelines 1.3 / 5.1.4 constrain third-party
  analytics in kids' apps; the app ships Firebase and Crashlytics).
- **No accessibility conformance target**, no VPAT, no efficacy study design, no IEP-goal taxonomy,
  and no analysis of child speech-recognition accuracy despite `PRD.md:43` specifying the `Speech`
  framework for validating a child reading aloud.
