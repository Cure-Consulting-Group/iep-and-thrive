/**
 * E3 — Single source of truth for the enrollment agreement plain-text body.
 *
 * The text is the EXACT body shown to the signer at /enroll/agreement and
 * the EXACT body baked into the rendered PDF. The agreementHash (sha256)
 * is computed against this string and is what the server-side function
 * verifies before persisting an audit record.
 *
 * To revise the agreement:
 *   1. Bump ENROLLMENT_AGREEMENT_VERSION (semver-ish: 1.0, 1.1, 2.0, ...).
 *   2. Edit ENROLLMENT_AGREEMENT_TEXT.
 *   3. Update docs/legal/enrollment-agreement.md to match.
 *   4. Re-deploy. Already-signed agreements retain their old version + hash;
 *      new signatures bind to the new version.
 *
 * Do NOT include parent or student names here — they are merged into the
 * PDF separately so the hash is the same for every signer of this version.
 */

export const ENROLLMENT_AGREEMENT_VERSION = '1.0'

export const ENROLLMENT_AGREEMENT_TEXT = `IEP & THRIVE — ENROLLMENT AGREEMENT
Version 1.0  ·  Summer 2026 Cohort

Program: IEP & Thrive Summer Intensive
Program dates: July 7 – August 15, 2026  ·  Mon–Fri, 9:00am – 1:00pm
Operator: Cure Consulting Group LLC, doing business as IEP & Thrive

SECTION 1 — EDUCATIONAL RECORDS CONSENT
I authorize IEP & Thrive to receive and use my child's IEP, 504 Plan, and any
related psychoeducational/neuropsychological evaluations solely for the
purpose of designing individualized instruction during the summer program.
These records will be stored securely, shared only with authorized IEP &
Thrive instructors, and either returned to me or securely destroyed within
90 days of program conclusion. Reports issued by IEP & Thrive do not
replace official IEP progress monitoring by the school district.

SECTION 2 — MEDICAL DISCLOSURE
I will disclose all known allergies, medications, diagnoses, and behavioral
considerations relevant to the program before Day 1. I authorize IEP &
Thrive staff to administer prescribed medication if I have provided written
instructions and the medication in its original labeled container.

SECTION 3 — PAYMENT TERMS
A non-refundable deposit equal to 25% of tuition reserves the cohort spot.
The remaining balance is due by June 23, 2026. Failure to pay the balance
on time may result in forfeiture of the spot. Payment is processed securely
via Stripe. A $35 fee applies to returned or declined payments.

SECTION 4 — PROGRAM EXPECTATIONS
My child is expected to attend all scheduled sessions. Three or more
unexcused absences may result in dismissal without refund. Drop-off is
8:45–9:00 AM and pick-up is 1:00–1:15 PM. My child will only be released
to authorized individuals listed in the parent portal. Late pick-up fees
of $25 per occurrence may apply. IEP & Thrive uses positive behavioral
supports; if persistent behavior compromises the safety or learning of
others, IEP & Thrive may dismiss my child from the program.

SECTION 5 — NO GUARANTEE OF OUTCOMES
Enrollment does not guarantee specific academic results, IEP modifications,
or changes to my child's school placement. The program is supplemental and
does not replace ESY, Related Services, or any IDEA-mandated services.

SECTION 6 — LIABILITY WAIVER
I acknowledge inherent risks of program participation including physical
injury, emotional distress, and exposure to illness. To the maximum extent
permitted by New York law, I release IEP & Thrive, its owners, employees,
agents, and instructors from claims arising out of my child's participation
except in cases of gross negligence or willful misconduct.

SECTION 7 — AGREEMENT & ELECTRONIC SIGNATURE
I confirm that:
  - I have read and agree to the IEP & Thrive Terms of Service, Privacy
    Policy, and Refund Policy.
  - All information I have provided is accurate and complete.
  - I am the legal parent or guardian of the enrolling student and have
    authority to enter into this agreement.

SECTION 8 — ELECTRONIC RECORDS & SIGNATURE CONSENT
By ticking the separate "I consent to do business electronically" checkbox
on this page, I agree:
  (a) to receive this agreement and related communications in electronic
      form rather than paper;
  (b) that my drawn signature and typed printed name together constitute
      my electronic signature, intended to have the same legal effect as a
      handwritten signature under the federal ESIGN Act (15 U.S.C. § 7001)
      and New York State Technology Law Article 3;
  (c) that I am able to view and retain this agreement in PDF format
      (any modern web browser plus a PDF reader is sufficient);
  (d) that I may withdraw this consent at any time by emailing
      hello@iepandthrive.com — withdrawal applies to future communications;
      records signed prior to withdrawal are retained as part of the
      enrollment file;
  (e) that I may request a paper copy of this signed agreement at any time
      by emailing hello@iepandthrive.com (no fee).

My drawn signature, typed printed name, and IP address as recorded by the
IEP & Thrive server constitute my electronic signature. The agreement
version and SHA-256 hash recorded in the audit block of the resulting PDF
bind this signature to the exact text displayed above.
`
