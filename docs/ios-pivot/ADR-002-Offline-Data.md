# ADR 002: Offline-First Data & Synchronization Strategy

## Status
Proposed

## Context
Children will use this app in various environments: at home, in the car on road trips, or in schools with restrictive or poor Wi-Fi. The core learning loop (gameplay) cannot be blocked by a loading spinner or a network request. However, parents (subscribers) need accurate progress data synced to their push notifications and accounts.

## Options Considered
1.  **Online-Only (REST/GraphQL):** Fetch data on demand.
2.  **Firebase Firestore (Offline Mode):** Use the existing Firebase backend with its built-in offline caching.
3.  **SwiftData + CloudKit:** Apple's native ORM and sync engine.

## Decision
We will use **SwiftData as the local source of truth, syncing to Firebase Firestore in the background.**

## Rationale
*   **Instant UI:** SwiftData provides synchronous, instantaneous reads and writes for the UI. When a child completes a level, the state updates locally in milliseconds, keeping the game loop fluid.
*   **Backend Continuity:** We already have Firebase setup for the web platform. While we are abandoning the web *frontend*, maintaining Firebase Auth and Firestore allows us to use Cloud Functions for Stripe webhooks and parent email/push notifications.
*   **The Flow:** 
    1. Child plays -> SwiftData updates locally.
    2. Background Task -> Syncs SwiftData changes to Firestore.
    3. Firestore Trigger -> Sends "Weekly Progress" push notification to parent via APNs.

## Consequences
*   **Positive:** Zero loading screens for the child. Seamless offline play.
*   **Negative:** Building a reliable two-way sync between SwiftData and Firestore is technically complex and requires careful conflict resolution logic (though mostly it will be append-only progress data).