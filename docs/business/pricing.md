# MVP pricing

This document defines the post-MVP parent-record offer. It supersedes the pricing direction in the historical [financial model](../financial-model.md) and [GTM plan](../gtm-plan.md) for this product; those files remain historical and are not edited.

## Recommendation

The instructional core is free forever. The parent-held record is $49/year, with a $5.99 monthly option. A no-questions $0 hardship tier is granted on request with no means test. The free child experience includes the complete decoding sequence, every MVP skill, and no account or gate. The paid offer is the record of progress against skills over time, exportable summary, and multi-child capability when the record phase ships.

This is a post-MVP commercial phase. ADR-000 D7 says accounts, verifiable parental consent, Firebase sync, and StoreKit purchase arrive together after the child has a local history and the retention gate has been measured. MVP does not charge for instruction or collect payment.

## Why this price structure fits the user

The product is for families the system has failed and who are disproportionately unable to pay a premium. Charging for instruction would exclude the exact child the product exists to reach. Selling the record after the child has made progress asks the parent to pay for an adult-held artifact rather than for the child’s access to teaching. It does not promise a diagnosis, replace an evaluation, or claim an IEP outcome.

The credible comparison set is Lexia for Home at $175/year and Nessy at approximately $186/year; Nessy also sells direct at approximately $15.50/month. These are real paths for parents, so the positioning must be honest. IEP & Thrive differentiates on a free instructional core, an independent phone form factor, and a child-controlled experience—not on the claim that parents otherwise have no help.

## Why annual is the default

Education is the highest voluntary-churn subscription category measured in the source research, with roughly 7% monthly churn as the category baseline used for the retention gate. An annual default reduces repeated monthly decision points and aligns the paid record with a child’s longer learning arc. The $5.99 monthly option preserves access for a family that cannot make an annual payment. The hardship tier ensures that inability to pay does not become a learning gate or a humiliating application process.

The annual default is a hypothesis, not a proven conversion result. The paid record has not been validated. We will measure conversion only after children have succeeded enough for a parent to understand the record’s value, and we will keep retention and affordability guardrails ahead of revenue optimization.

## Why the free tier costs almost nothing to serve

ADR-000 D1 makes the free tier entirely on-device: no account, no server-side learner record, no Firebase learner sync, no third-party analytics, no content fetch, and no crash reporter with a network transport. Content and audio ship in the app bundle. Therefore the marginal infrastructure cost per free child is effectively zero, subject to ordinary App Store distribution and support costs. The consented cohort endpoint is a narrow study exception, not a general free-tier learner backend.

That architecture is also the privacy and trust thesis. No third-party advertising or child-directed data monetization is available. The app is not an ad-supported surface.

## Why ad-supported is unavailable

Ad-supported is unavailable, not merely unattractive. The product serves children using a phone alone, and the amended COPPA Rule makes third-party advertising in a child-directed app a compliance and reputational hazard identified by the research. Ads would introduce incentives and data practices that conflict with the free-core promise, teacher trust, and the no-network architecture. No third-party ads, sponsored content, or data sale may be introduced as a workaround for weak conversion.

## Commercial guardrails and open decisions

- Instruction remains free in every tier, forever.
- Hardship access is granted on request, with no means test and no demand for documentation.
- No claim may imply that payment buys better teaching or a diagnosis.
- The paid record begins only after the retention gate and the consented account design are ready.
- Counsel must determine whether StoreKit purchase satisfies verifiable parental consent before upgrade-flow design.
- The founder and study owner must define the conversion cohort and report paid conversion alongside retention, hardship requests, and cancellations.

The key question is whether parents who saw progress will pay for the record. The answer is unknown and belongs in the risk register, not in a forecast presented as fact.
