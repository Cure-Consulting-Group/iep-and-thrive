# IEP & Thrive MVP personas

These are the only three product personas for the MVP. They are grounded in [PRD-LP-001](../research/2026-09-06-product-brief.md), the product vision, and [ADR-000](../architecture/ADR-000-mvp-architecture-decisions.md). They describe people and constraints supported by the research, not demographic inventions.

## 1. The child: the independent learner

**Profile.** Eight to eleven years old, reading below grade level, with or likely to qualify for an IEP. The child may have dyslexia, phonological processing difficulty, or a general decoding delay. They already know they are behind. They have a phone and more screen time than peers. They open the app alone.

**A day with the product.** The child picks up a phone without waiting for an adult, opens IEP & Thrive, and enters a short lesson immediately. There is no account, test, school roster, diagnosis prompt, or adult handoff. The app introduces a sound, shows how it is written, plays recorded phoneme audio, and guides a tracing, blending, or word-building encounter. The child can skip narration, leave cleanly, and return for another 10–15-minute session later in the week. Early performance quietly informs where the next work begins. Progress stays on the device.

**Trying to accomplish.** The child is trying to learn to read words they could not decode, without being publicly measured or trapped in a babyish experience. They need real teaching, not a practice shell that assumes an adult already taught the skill. They need an experience that respects their age and agency while preserving a systematic sequence.

**What would make them quit.** A first screen that feels like an assessment; content that is too hard and repeatedly exposes failure; narration they cannot skip; a remedial lecture after two mistakes; childish language; a session that takes longer than promised; or a content cliff that leaves nowhere to go after a few weeks.

**The one thing we must never do.** Never make the child pay, prove a diagnosis, wait for an adult, or feel that the product is confirming they are behind. We teach; we do not diagnose.

## 2. The parent-buyer: the constrained advocate

**Profile.** The parent is seeking help because the system did not deliver for their child: eligibility took months, a mandated service was unstaffed, or nobody told them what to do at home. The research says this family is disproportionately unable to pay a premium. The parent is a buyer eventually, but the child’s instruction must not depend on payment.

**A day with the product.** The parent hears about the app through a permitted community or teacher recommendation, checks the static safety and “why it is free” pages, and lets the child try it independently. At MVP, the parent does not create an account or hand over a child profile. They may participate in the consented cohort measurement study and see the child’s lived progress locally, but the exportable parent-held record is a later paid-record phase. If the product earns trust, the parent may later pay for that record rather than for instruction.

**Trying to accomplish.** The parent wants a credible, affordable way to help their child practice systematic decoding at home without becoming the full-time teacher, purchasing a premium tutor, or waiting for an unavailable service. They want evidence of what was taught and learned when the record phase exists. They need honest positioning: direct alternatives exist, and this product offers a different form factor, price structure, and independence.

**What would make them quit.** A paywall around instruction; an unexpected account or data request before value; an unsupported efficacy or diagnosis promise; an expensive subscription demanded before the child has succeeded; confusing or inaccessible content; or a privacy design that makes them responsible for unexplained exposure.

**The one thing we must never do.** Never turn a family’s lack of money into a reason their child receives less instruction or a degraded learning path. The full decoding sequence is free forever; payment is for the parent-held record and later record features.

## 3. The referring teacher: the exposed recommender

**Profile.** An educator with a relationship to families and a desire to help a struggling reader. The teacher recommends the product, is never compensated, and carries the ethics exposure personally. The teacher is not an unpaid operator and is not the MVP buyer.

**A day with the product.** The teacher learns about the free core, reads the trust information, and decides whether it is appropriate to mention to a family. If the teacher is in New York City, the written permission identified in the research allows advertising in PTA or parent-organization publications of other schools. The teacher can point to a product that a child opens independently, with no classroom roster or school data. The teacher does not administer placement, monitor a dashboard, or transact with the company.

**Trying to accomplish.** The teacher wants to offer a useful, lawful, low-friction option to a family without creating a business relationship, compromising professional ethics, or promising an outcome they cannot substantiate. They need the product’s claims to be accurate and its free core to be genuinely useful.

**What would make them quit.** Any request to sell, track, persuade, administer, collect school data, or defend an unsupported claim; any compensation mechanism; a product that asks them to use it in class; or a crash that makes their recommendation look careless.

**The one thing we must never do.** Never place the teacher in an impermissible business relationship or make them absorb the company’s legal and reputational risk. The product must remain free to recommend, child-independent, and honest.

## Explicit anti-persona: the affluent private-tutor buyer

The affluent parent already retaining a private Orton–Gillingham tutor at approximately $200/hour is explicitly not our design center. That family may use the product, but the MVP must not optimize for their willingness to pay, spare device, spare adult time, or ability to purchase premium service. Designing for them would raise the price, move the product toward adult-mediated tutoring, and make the free instructional mission secondary. It would also serve the segment that needs the product least while excluding the families defined by constrained access and inability to pay a premium.
