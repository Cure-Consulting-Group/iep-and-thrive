# Compliance Framework — IEP & Thrive

**Program:** SPED Summer Intensive
**Jurisdiction:** New York State
**Population:** Minors with IEPs and learning differences (ages 5–12)

---

## 1. Regulatory Landscape

| Regulation | Applicability | Priority |
|-----------|---------------|----------|
| **COPPA** | Program serves children under 13; website collects parent data | 🔴 Critical |
| **FERPA** | Parents voluntarily share IEP/education records | 🔴 Critical |
| **IDEA** | Program is supplemental — not a mandated service provider | 🟡 Awareness |
| **ADA / Section 504** | Disability-related data; physical accessibility | 🟡 High |
| **NY SHIELD Act** | Breach notification; data security requirements | 🔴 Critical |
| **NYS Business Laws** | LLC registration, EIN, tax obligations | 🔴 Critical |
| **NYS Labor Laws** | Hiring, background checks, employment | 🟡 High |
| **HIPAA** | Generally NOT applicable (educational program, not healthcare provider) | 🟢 Low — monitor |
| **CCPA/CPRA** | Only if California residents enroll | 🟢 Low — monitor |

---

## 2. Data Classification

| Classification | Examples | Handling |
|---------------|----------|---------|
| **Restricted** | IEP/504 Plans, evaluation reports, medical information, diagnoses | Encrypted storage; access limited to authorized instructors; return/destroy within 90 days of program end |
| **Confidential** | Student name, address, parent contact, behavioral notes | Secure storage; not shared externally; retained per retention schedule |
| **Confidential — iOS App** | Child first name + age, learning progress (lessons completed, scores, sparks), Firebase Auth UID | Firestore (`users/{uid}/students/{id}/*`) with owner-only security rules; SwiftData on-device. Returned to anon-default or deleted per parent request (see `docs/legal/data-deletion-process.md`) |
| **Internal** | Enrollment numbers, financial data, staff records | Business-use only; standard security |
| **Public** | Website content, program descriptions, pricing | Freely shared |

### 2.1 iOS App Data Flows

The iOS companion app uses a strictly bounded data model:

```
Onboarding (anon Firebase Auth)
  → SwiftData:    StudentProfile  (id, firstName, age, primaryFocus)
  → Firestore:    users/{anonUid}/students/default/profile

Mission complete (anon or authed)
  → SwiftData:    LessonProgress (UUID, levelIndex, category, isCompleted, score)
  → SwiftData:    SparksRecord   (UUID, amount, reason, earnedAt)
  → Firestore:    users/{uid}/students/{studentId}/{lessons|sparks}/{uuid}

Parent sign-in (email / Google / Apple)
  → migrateAnonData(anon, authed, pickedStudentId)
    copies users/{anonUid}/students/default/* → users/{authedUid}/students/{pickedStudentId}/*
  → anon docs left in place for retry safety; cleaned up via the data-deletion process

Crash / non-fatal
  → Firebase Crashlytics: stack trace + breadcrumbs
  → No child name / IEP content in breadcrumbs (only IDs + state-machine labels)
```

**Storage region:** Firestore default region is `us-east4` (Northern Virginia). All data stays inside Google Cloud's US data centers per the project config in `STATE.md`.

**iOS app vs web portal:** the iOS app does NOT collect IEP documents, evaluation reports, medical notes, or any of the "Restricted" categories above — those flow through the web portal's intake form into the same Firestore project but a different collection (`progressReports` etc.). The iOS app's data is therefore strictly "Confidential" tier.

---

## 3. COPPA Compliance Checklist

| Requirement | Status | Implementation |
|------------|--------|----------------|
| Parental consent before collecting child data | ☐ Pending | Enrollment Agreement includes consent section; iOS app's anonymous mode does not collect identifying child data until a parent enters the child's name on the Onboarding screen (under parental supervision per the program contract) |
| Collect only data necessary for educational purpose | ☐ Pending | Intake form limited to program-relevant fields; iOS app's `PrivacyInfo.xcprivacy` declares only first-name, age, learning progress, Firebase Auth UID, crash diagnostics |
| No behavioral advertising using child data | ✅ | No ad tracking on website; no data sold; iOS app sets `NSPrivacyTracking=false` |
| Parental right to review/delete child data | ☐ Pending | Process documented in Privacy Policy; manual deletion workflow in `docs/legal/data-deletion-process.md` |
| Data security measures | ☐ Pending | Encrypted storage, access controls; iOS app uses Firestore owner-only rules + Firebase Auth |
| Clear privacy policy | ☐ Pending | Privacy Policy scaffold created (includes iOS section); needs attorney review |
| No conditioning participation on excess data | ✅ | Only program-essential data collected |

---

## 4. FERPA Compliance Checklist

| Requirement | Status | Implementation |
|------------|--------|----------------|
| Records obtained from parents (not directly from school) | ✅ | Parents voluntarily upload IEP/504 documents |
| Records used only for authorized educational purpose | ☐ Pending | Documented in Enrollment Agreement Section 1 |
| Records stored securely | ☐ Pending | Encrypted cloud storage + locked physical storage |
| Records returned/destroyed after program | ☐ Pending | 90-day return/destroy policy in Privacy Policy |
| No re-disclosure of education records | ✅ | Only shared with authorized program instructors |

---

## 5. NY SHIELD Act Compliance

| Requirement | Status | Implementation |
|------------|--------|----------------|
| Reasonable data security safeguards | ☐ Pending | Define and document security measures |
| Breach notification within 72 hours | ☐ Pending | Incident response plan needed |
| Employee training on data handling | ☐ Pending | Staff onboarding includes data handling training |
| Destruction of records when no longer needed | ☐ Pending | Retention schedule defined in Privacy Policy |

---

## 6. Business Compliance Checklist

| Requirement | Status | Action | Deadline |
|------------|--------|--------|----------|
| LLC registered in New York | ☐ Pending | File with NY Dept of State | Before deposits |
| EIN obtained from IRS | ☐ Pending | Apply online at IRS.gov | Before deposits |
| DBA (if operating under trade name) | ☐ Pending | File with county clerk if "IEP & Thrive" differs from LLC name | Before marketing |
| General Liability Insurance | ☐ Pending | Obtain $1M/$2M policy | Before deposits |
| Professional Liability (E&O) Insurance | ☐ Pending | Obtain minimum $1M policy | Before deposits |
| Workers' Compensation (if hiring) | ☐ Pending | Required in NY if hiring employees | Before hiring |
| Background checks (founder + staff) | ☐ Pending | NYS DCJS fingerprinting | Before program |
| CPR/First Aid certification | ☐ Pending | American Red Cross or AHA | Before program |
| Sales tax exemption evaluation | ☐ Pending | Educational services may be exempt | Before launch |
| Zoning compliance (if home-based) | ☐ Pending | Check local zoning for educational use | Before lease |
| Facility lease/agreement | ☐ Pending | Secure by April 15, 2026 | April 15, 2026 |

---

## 7. Vendor Assessment

| Vendor | Data Access | Compliance | Risk |
|--------|------------|-----------|------|
| **Stripe** | Payment card data (PCI DSS Level 1 certified) | SOC 2, PCI DSS | Low ✅ |
| **Resend** | Parent email, student first name | Privacy policy reviewed | Low ✅ |
| **Vercel** | Anonymous web analytics | SOC 2, GDPR | Low ✅ |
| **Firebase Auth (Google)** | Parent email, Apple/Google OAuth tokens, anon Firebase UIDs | SOC 1/2/3, ISO 27001, FERPA-aligned with Google Cloud terms | Low ✅ |
| **Firebase Firestore (Google)** | iOS app StudentProfile, LessonProgress, SparksRecord; web portal student records | SOC 1/2/3, ISO 27001; region: us-east4 | Low ✅ |
| **Firebase Crashlytics (Google)** | Stack traces + breadcrumbs (no PII; only state-machine labels + UIDs) | Same Google Cloud terms; 90-day retention default | Low ✅ |
| **Google Workspace** | If used for storing student records | FERPA-compliant with BAA | Medium — needs BAA ⚠️ |
| **Calendly** | Parent name, email, phone | SOC 2 | Low ✅ |

> [!WARNING]
> **If using Google Workspace for student records (IEPs, assessments):** Execute a FERPA/COPPA-specific BAA with Google before storing any student education records in Google Drive.

---

## 8. Mandated Reporter Obligations

All staff of IEP & Thrive are **mandated reporters** under New York State Social Services Law §413. This means:

- Any staff member who has **reasonable cause to suspect** child abuse or maltreatment must report to the NYS Statewide Central Register (SCR)
- **Hotline:** 1-800-342-3720
- Reports must be made **immediately** (oral report), followed by a written report within 48 hours
- Failure to report is a **Class A misdemeanor** under NYS law
- All staff will be trained on mandated reporter obligations during onboarding

---

## 9. Incident Response Plan

### Data Breach

| Step | Action | Timeline |
|------|--------|----------|
| 1 | Identify and contain the breach | Immediate |
| 2 | Assess scope: what data, how many individuals affected | Within 24 hours |
| 3 | Notify affected individuals | Within 72 hours (NY SHIELD Act) |
| 4 | Notify NYS Attorney General (if >500 residents affected) | Within 72 hours |
| 5 | Document incident and remediation | Within 7 days |
| 6 | Review and update security measures | Within 30 days |

### Physical Safety Incident

| Step | Action | Timeline |
|------|--------|----------|
| 1 | Administer first aid / call 911 | Immediate |
| 2 | Notify parent/guardian | Immediate |
| 3 | Document incident (written report) | Within 24 hours |
| 4 | Notify insurance carrier | Within 48 hours |
| 5 | Review incident and update protocols | Within 7 days |

---

## 10. Annual Compliance Calendar

| Month | Activity |
|-------|----------|
| **January** | Review and renew insurance policies; update Privacy Policy if needed |
| **February** | Staff background check renewals (if applicable) |
| **March** | Review compliance framework; update for any regulatory changes |
| **April** | Staff onboarding training (data handling, mandated reporting, CPR) |
| **May** | Facility safety inspection; finalize emergency protocols |
| **June** | Pre-program audit: all consent forms collected, records secured |
| **July–August** | Active program: maintain compliance, document incidents |
| **September** | Post-program: return/destroy student records; collect feedback |
| **October** | Annual compliance review; document lessons learned |
| **November** | Update legal documents for following year if needed |
| **December** | Year-end financial review; tax preparation |
