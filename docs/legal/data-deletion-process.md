# Data Deletion Process — IEP & Thrive iOS App

> [!NOTE]
> **Manual process today.** An automated UI is deferred to Phase 4 (post-pilot). Until then this document IS the process — operator must follow these steps end-to-end on every parent request.

**Owner:** Program operator (hello@iepandthrive.com)
**SLA:** 30 calendar days from request to confirmation (COPPA-aligned)
**Last updated:** 2026-05-28

---

## When this applies

A parent may request deletion of their child's iOS app data at any time by emailing **hello@iepandthrive.com** with the subject line "Delete my child's iPad data" or equivalent.

Deletion requests for **web-portal data** (enrollment records, IEP documents, etc.) follow a different retention schedule — see the Privacy Policy and the operations manual. This document covers ONLY the iOS-app-generated Firestore subcollections and the Firebase Auth account, since those are the data flows added in the Phase 1–3 iOS pivot.

---

## What gets deleted

When a request comes in, the operator removes:

1. **iOS-app-written Firestore data:**
   - `users/{uid}/students/{studentId}/profile` (the StudentProfile doc)
   - `users/{uid}/students/{studentId}/lessons/*` (every LessonProgress doc)
   - `users/{uid}/students/{studentId}/sparks/*` (every SparksRecord doc)
2. **Firebase Auth account** (if the parent confirms they don't need it for the web portal — most do, so often this stays):
   - The Firebase Auth user record under the parent's UID
3. **Crashlytics history:**
   - 90-day rolling retention means historical crash reports tied to the UID will age out automatically; we don't take active steps in Crashlytics

What does NOT get deleted by this process:
- Web-portal enrollment / payment / progress-report records (separate retention schedule)
- The iOS device's local SwiftData (the family controls that — uninstalling the app clears it)
- Aggregated, anonymized analytics

---

## Operator runbook

Prerequisites: `firebase` CLI authenticated as a project admin against `iep-and-thrive`.

### 1. Confirm the request

Reply to the parent within 2 business days confirming:
- You received the request
- You'll process within 30 days
- Which UID / student you're acting on (ask them to confirm the child's first name; cross-reference with their portal account)

### 2. Locate the documents

```bash
# Find the parent's authed UID from email
firebase auth:export tmp/users.json --project iep-and-thrive
jq '.users[] | select(.email == "parent@example.com") | .localId' tmp/users.json

# List students under that UID via Firebase Console or:
firebase firestore:get "users/<UID>/students" --project iep-and-thrive
```

### 3. Delete the subcollections

Firestore doesn't recursively delete by default — use the CLI's recursive flag against the specific student path:

```bash
firebase firestore:delete \
  "users/<UID>/students/<STUDENT_ID>" \
  --project iep-and-thrive \
  --recursive --yes
```

If the parent requested deletion of ALL children under their account, repeat per studentId. If they want the entire `users/{uid}` doc gone, delete that path recursively too.

### 4. (Optional) Delete the Auth account

ONLY if the parent confirms they don't need access to the web portal:

```bash
firebase auth:delete <UID> --project iep-and-thrive
```

### 5. Confirm with the parent

Email the parent:
- The exact documents deleted (paths, count of lessons + sparks removed)
- A statement that Crashlytics history will age out within 90 days
- That web-portal records are governed by a separate retention schedule (see Privacy Policy)

### 6. Log the action

Add a row to `tools/data-deletion-log.csv` (or equivalent — create the file on first run):

```
2026-XX-XX, <UID>, <STUDENT_ID>, <REQUESTING_PARENT_EMAIL>, <OPERATOR_INITIALS>
```

Retain this log for 3 years per the operations manual.

---

## Phase 4 — automation

A self-service deletion flow is on the roadmap:

- iOS app: settings → "Delete this iPad's data" button → confirms → calls a Cloud Function that recursively deletes the subcollection
- Web portal: settings → "Delete my account" → same Cloud Function entrypoint

Until then this manual process is the only deletion path. Track requests in the log so we can measure volume before investing in the UI.

---

## Legal review items still open

Items in this document that need attorney sign-off before pilot:

1. **30-day SLA** matches COPPA's general expectation but isn't an explicit statutory deadline — confirm with counsel that this is the right commitment.
2. **Auth account deletion** when parent has an active web-portal enrollment: confirm with counsel whether we should refuse deletion (since they'd lose access to their own paid program) or proceed with a clear warning.
3. **Crashlytics 90-day passive retention** vs explicit deletion: confirm with counsel whether passive aging-out is sufficient under COPPA / NY SHIELD.
