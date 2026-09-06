# Web page inventory

Every page source discovered under `app/` is listed below, including three legacy `_api-server` route-handler files separately. Dynamic placeholder exports require actual Hosting verification; a page file does not establish that arbitrary IDs resolve. Shared layout/data paths were traced and grouped in [system map](system-map.md); not every page was interactively exercised.

| Source | Route shape | Focus / related tickets |
| --- | --- | --- |
| [app/about/page.tsx](../../../../app/about/page.tsx) | `/about` | Public discovery, current claims, accessible navigation: 034, 039, 040 |
| [app/admin/assessments/[studentId]/page.tsx](../../../../app/admin/assessments/[studentId]/page.tsx) | `/admin/assessments/[studentId]` | Restricted staff operations, data authorization/history: 007, 008, 022, 037, 042–047 |
| [app/admin/assessments/page.tsx](../../../../app/admin/assessments/page.tsx) | `/admin/assessments` | Restricted staff operations, data authorization/history: 007, 008, 022, 037, 042–047 |
| [app/admin/assessments/student/page.tsx](../../../../app/admin/assessments/student/page.tsx) | `/admin/assessments/student` | Restricted staff operations, data authorization/history: 007, 008, 022, 037, 042–047 |
| [app/admin/attendance/page.tsx](../../../../app/admin/attendance/page.tsx) | `/admin/attendance` | Restricted staff operations, data authorization/history: 007, 008, 022, 037, 042–047 |
| [app/admin/bookings/page.tsx](../../../../app/admin/bookings/page.tsx) | `/admin/bookings` | Restricted staff operations, data authorization/history: 007, 008, 022, 037, 042–047 |
| [app/admin/curriculum/assessments/post/page.tsx](../../../../app/admin/curriculum/assessments/post/page.tsx) | `/admin/curriculum/assessments/post` | Restricted staff operations, data authorization/history: 007, 008, 022, 037, 042–047 |
| [app/admin/curriculum/assessments/pre/page.tsx](../../../../app/admin/curriculum/assessments/pre/page.tsx) | `/admin/curriculum/assessments/pre` | Restricted staff operations, data authorization/history: 007, 008, 022, 037, 042–047 |
| [app/admin/curriculum/assessments/probes/page.tsx](../../../../app/admin/curriculum/assessments/probes/page.tsx) | `/admin/curriculum/assessments/probes` | Restricted staff operations, data authorization/history: 007, 008, 022, 037, 042–047 |
| [app/admin/curriculum/communications/page.tsx](../../../../app/admin/curriculum/communications/page.tsx) | `/admin/curriculum/communications` | Restricted staff operations, data authorization/history: 007, 008, 022, 037, 042–047 |
| [app/admin/curriculum/lesson/[date]/page.tsx](../../../../app/admin/curriculum/lesson/[date]/page.tsx) | `/admin/curriculum/lesson/[date]` | Restricted staff operations, data authorization/history: 007, 008, 022, 037, 042–047 |
| [app/admin/curriculum/page.tsx](../../../../app/admin/curriculum/page.tsx) | `/admin/curriculum` | Restricted staff operations, data authorization/history: 007, 008, 022, 037, 042–047 |
| [app/admin/curriculum/portfolio/page.tsx](../../../../app/admin/curriculum/portfolio/page.tsx) | `/admin/curriculum/portfolio` | Restricted staff operations, data authorization/history: 007, 008, 022, 037, 042–047 |
| [app/admin/curriculum/scope-and-sequence/page.tsx](../../../../app/admin/curriculum/scope-and-sequence/page.tsx) | `/admin/curriculum/scope-and-sequence` | Restricted staff operations, data authorization/history: 007, 008, 022, 037, 042–047 |
| [app/admin/curriculum/today/page.tsx](../../../../app/admin/curriculum/today/page.tsx) | `/admin/curriculum/today` | Restricted staff operations, data authorization/history: 007, 008, 022, 037, 042–047 |
| [app/admin/curriculum/week/[weekNumber]/materials/page.tsx](../../../../app/admin/curriculum/week/[weekNumber]/materials/page.tsx) | `/admin/curriculum/week/[weekNumber]/materials` | Restricted staff operations, data authorization/history: 007, 008, 022, 037, 042–047 |
| [app/admin/curriculum/week/[weekNumber]/page.tsx](../../../../app/admin/curriculum/week/[weekNumber]/page.tsx) | `/admin/curriculum/week/[weekNumber]` | Restricted staff operations, data authorization/history: 007, 008, 022, 037, 042–047 |
| [app/admin/email-log/page.tsx](../../../../app/admin/email-log/page.tsx) | `/admin/email-log` | Restricted staff operations, data authorization/history: 007, 008, 022, 037, 042–047 |
| [app/admin/materials/[weekNumber]/page.tsx](../../../../app/admin/materials/[weekNumber]/page.tsx) | `/admin/materials/[weekNumber]` | Restricted staff operations, data authorization/history: 007, 008, 022, 037, 042–047 |
| [app/admin/materials/page.tsx](../../../../app/admin/materials/page.tsx) | `/admin/materials` | Restricted staff operations, data authorization/history: 007, 008, 022, 037, 042–047 |
| [app/admin/page.tsx](../../../../app/admin/page.tsx) | `/admin` | Restricted staff operations, data authorization/history: 007, 008, 022, 037, 042–047 |
| [app/admin/pipeline/page.tsx](../../../../app/admin/pipeline/page.tsx) | `/admin/pipeline` | Restricted staff operations, data authorization/history: 007, 008, 022, 037, 042–047 |
| [app/admin/probes/page.tsx](../../../../app/admin/probes/page.tsx) | `/admin/probes` | Restricted staff operations, data authorization/history: 007, 008, 022, 037, 042–047 |
| [app/admin/probes/week/[weekNumber]/page.tsx](../../../../app/admin/probes/week/[weekNumber]/page.tsx) | `/admin/probes/week/[weekNumber]` | Restricted staff operations, data authorization/history: 007, 008, 022, 037, 042–047 |
| [app/admin/reports/page.tsx](../../../../app/admin/reports/page.tsx) | `/admin/reports` | Restricted staff operations, data authorization/history: 007, 008, 022, 037, 042–047 |
| [app/admin/reports/template/alignment/page.tsx](../../../../app/admin/reports/template/alignment/page.tsx) | `/admin/reports/template/alignment` | Restricted staff operations, data authorization/history: 007, 008, 022, 037, 042–047 |
| [app/admin/reports/template/final/page.tsx](../../../../app/admin/reports/template/final/page.tsx) | `/admin/reports/template/final` | Restricted staff operations, data authorization/history: 007, 008, 022, 037, 042–047 |
| [app/admin/reports/template/weekly/page.tsx](../../../../app/admin/reports/template/weekly/page.tsx) | `/admin/reports/template/weekly` | Restricted staff operations, data authorization/history: 007, 008, 022, 037, 042–047 |
| [app/admin/resources/page.tsx](../../../../app/admin/resources/page.tsx) | `/admin/resources` | Restricted staff operations, data authorization/history: 007, 008, 022, 037, 042–047 |
| [app/admin/slots/page.tsx](../../../../app/admin/slots/page.tsx) | `/admin/slots` | Restricted staff operations, data authorization/history: 007, 008, 022, 037, 042–047 |
| [app/admin/students/page.tsx](../../../../app/admin/students/page.tsx) | `/admin/students` | Restricted staff operations, data authorization/history: 007, 008, 022, 037, 042–047 |
| [app/admin/subscribers/page.tsx](../../../../app/admin/subscribers/page.tsx) | `/admin/subscribers` | Restricted staff operations, data authorization/history: 007, 008, 022, 037, 042–047 |
| [app/book/page.tsx](../../../../app/book/page.tsx) | `/book` | Server reservation, timezone, credit/cancel: 042, 043 |
| [app/contact/page.tsx](../../../../app/contact/page.tsx) | `/contact` | Public discovery, current claims, accessible navigation: 034, 039, 040 |
| [app/enroll/agreement/page.tsx](../../../../app/enroll/agreement/page.tsx) | `/enroll/agreement` | Inquiry, canonical signing, trusted payment: 012, 038, 045, 050 |
| [app/enroll/page.tsx](../../../../app/enroll/page.tsx) | `/enroll` | Inquiry, canonical signing, trusted payment: 012, 038, 045, 050 |
| [app/faq/page.tsx](../../../../app/faq/page.tsx) | `/faq` | Public discovery, current claims, accessible navigation: 034, 039, 040 |
| [app/login/page.tsx](../../../../app/login/page.tsx) | `/login` | Verified account, recovery, continuation: 006, 075 |
| [app/page.tsx](../../../../app/page.tsx) | `/` | Public discovery, current claims, accessible navigation: 034, 039, 040 |
| [app/portal/agreements/page.tsx](../../../../app/portal/agreements/page.tsx) | `/portal/agreements` | Family identity, authorized data, evidence and recovery: 014, 021, 032, 035–037 |
| [app/portal/bookings/page.tsx](../../../../app/portal/bookings/page.tsx) | `/portal/bookings` | Family identity, authorized data, evidence and recovery: 014, 021, 032, 035–037 |
| [app/portal/intake/page.tsx](../../../../app/portal/intake/page.tsx) | `/portal/intake` | Family identity, authorized data, evidence and recovery: 014, 021, 032, 035–037 |
| [app/portal/notifications/page.tsx](../../../../app/portal/notifications/page.tsx) | `/portal/notifications` | Family identity, authorized data, evidence and recovery: 014, 021, 032, 035–037 |
| [app/portal/page.tsx](../../../../app/portal/page.tsx) | `/portal` | Family identity, authorized data, evidence and recovery: 014, 021, 032, 035–037 |
| [app/portal/photo-release/page.tsx](../../../../app/portal/photo-release/page.tsx) | `/portal/photo-release` | Family identity, authorized data, evidence and recovery: 014, 021, 032, 035–037 |
| [app/portal/profile/page.tsx](../../../../app/portal/profile/page.tsx) | `/portal/profile` | Family identity, authorized data, evidence and recovery: 014, 021, 032, 035–037 |
| [app/portal/reports/page.tsx](../../../../app/portal/reports/page.tsx) | `/portal/reports` | Family identity, authorized data, evidence and recovery: 014, 021, 032, 035–037 |
| [app/portal/resources/page.tsx](../../../../app/portal/resources/page.tsx) | `/portal/resources` | Family identity, authorized data, evidence and recovery: 014, 021, 032, 035–037 |
| [app/portal/students/[studentId]/sessions/page.tsx](../../../../app/portal/students/[studentId]/sessions/page.tsx) | `/portal/students/[studentId]/sessions` | Family identity, authorized data, evidence and recovery: 014, 021, 032, 035–037 |
| [app/portal/subscription/page.tsx](../../../../app/portal/subscription/page.tsx) | `/portal/subscription` | Family identity, authorized data, evidence and recovery: 014, 021, 032, 035–037 |
| [app/privacy/page.tsx](../../../../app/privacy/page.tsx) | `/privacy` | Public discovery, current claims, accessible navigation: 034, 039, 040 |
| [app/program/page.tsx](../../../../app/program/page.tsx) | `/program` | Public discovery, current claims, accessible navigation: 034, 039, 040 |
| [app/signup/page.tsx](../../../../app/signup/page.tsx) | `/signup` | Verified account, recovery, continuation: 006, 075 |
| [app/success/page.tsx](../../../../app/success/page.tsx) | `/success` | Public discovery, current claims, accessible navigation: 034, 039, 040 |
| [app/summer-guide/page.tsx](../../../../app/summer-guide/page.tsx) | `/summer-guide` | Public discovery, current claims, accessible navigation: 034, 039, 040 |
| [app/terms/page.tsx](../../../../app/terms/page.tsx) | `/terms` | Public discovery, current claims, accessible navigation: 034, 039, 040 |
| [app/tutoring/page.tsx](../../../../app/tutoring/page.tsx) | `/tutoring` | Public discovery, current claims, accessible navigation: 034, 039, 040 |
| [app/unsubscribe/page.tsx](../../../../app/unsubscribe/page.tsx) | `/unsubscribe` | Public discovery, current claims, accessible navigation: 034, 039, 040 |

## Legacy API source files

- [app/_api-server/contact/route.ts](../../../../app/_api-server/contact/route.ts): legacy implementation; active deployment uses exported Cloud Functions. Verify callers before retirement (057, 072).
- [app/_api-server/enroll/route.ts](../../../../app/_api-server/enroll/route.ts): legacy implementation; active deployment uses exported Cloud Functions. Verify callers before retirement (057, 072).
- [app/_api-server/stripe/checkout/route.ts](../../../../app/_api-server/stripe/checkout/route.ts): legacy implementation; active deployment uses exported Cloud Functions. Verify callers before retirement (057, 072).
