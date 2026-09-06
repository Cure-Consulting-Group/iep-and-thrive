# External source register

Checked September 5, 2026. These primary sources inform requirements and market constraints; they do not certify the application or establish approval for a specific school, privacy model, or commercial offer. Product recommendations remain hypotheses for review. Recheck changeable policies before release. No proprietary assessment items were copied into this packet.

| ID | Primary source | Application to this audit |
| --- | --- | --- |
| S01 | [NYCPS AI and screen-time guidance](https://www.schools.nyc.gov/about-us/policies/guidance-on-artificial-intelligence) | Current institutional channel constraints; qualify intended grade, setting, instructional purpose, and actual authorization before school use. |
| S02 | [FTC final COPPA changes](https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-finalizes-changes-childrens-privacy-rule-limiting-companies-ability-monetize-kids-data) | Requires deliberate child-data collection, disclosure/consent, security, and retention design; qualified review must resolve applicability and implementation details. |
| S03 | [NYSED data privacy/security FAQ](https://www.nysed.gov/data-privacy-security/frequently-asked-questions-about-data-privacy-and-security) | Third-party educational contractors need purpose-limited access, safeguards, and appropriate contractual handling of protected information. |
| S04 | [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) | Kids-category/adult-gate, privacy, and purchase requirements; the adult gate is not equivalent to consent to collect child data. |
| S05 | [Apple account deletion guidance](https://developer.apple.com/support/offering-account-deletion-in-your-app/) | Apps supporting account creation need an in-app way to initiate deletion; sign-out alone is insufficient. |
| S06 | [Stripe webhook guidance](https://docs.stripe.com/webhooks) | Handlers must handle duplicates, retries, and events arriving out of order; the endpoint event API version determines payload shape. |
| S07 | [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Web engineering accessibility target and criterion-by-criterion audit reference; no conformance claim is made here. |
| S08 | [Firebase Security Rules behavior](https://firebase.google.com/docs/rules/rules-behavior) | Authorization is evaluated by matching rules; permissive overlapping rules cannot be counteracted by a separate denial. Rules are not a substitute for server handler validation. |
| S09 | [NYCPS family privacy packet](https://www.schools.nyc.gov/school-life/know-your-rights/student-privacy/privacy-packet-for-families) | Institutional student-data access requires the relevant privacy/security process; practitioner interest alone does not authorize a school deployment. |

For the invoice-schema concern, the repository's installed `functions/node_modules/stripe/types/Invoices.d.ts` places the subscription reference under `Invoice.Parent.SubscriptionDetails`. The application casts to the older top-level shape. This is a compatibility concern requiring fixtures for the actual deployed webhook version, not proof that every production invoice is currently failing.

Dependency advisory URLs, affected ranges, and dependency metadata are retained in the two machine-readable npm reports under [evidence](evidence/). npm advisory counts are not counts of confirmed exploitable application paths. No forced dependency updates were performed during this audit.
