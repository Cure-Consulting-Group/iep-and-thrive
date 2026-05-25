# IEP & Thrive: iOS Pivot Audit & Translation Strategy (V2: Student-First)

## Executive Summary
This document audits the existing web-based capabilities of the IEP & Thrive platform and maps them to a native, HIG-award-winning iOS ecosystem. Based on strategic realignment, **the pivot discards the heavy administrative/provider portals**. Instead, the product is transitioning entirely into a highly scalable, story-driven, interactive **Student Learning Journey**. Parents and teachers transition from active portal users to simply the *buyers (subscribers)* who receive automated progress digests.

---

## 1. Current Web Capabilities -> The Shift

| Web Feature (Current) | iOS Pivot Translation | Rationale for Shift |
| :--- | :--- | :--- |
| **Parent Portal (Heavy)** | **Discarded.** Replaced by a lightweight "Parent Gate" in-app. | Parents don't want another portal to manage; they want an app that occupies and develops their child. |
| **Admin/Provider Dashboard** | **Discarded.** | Removes human bottleneck. The app *is* the provider. Infinite scalability. |
| **Intake / IEP Uploads** | **Automated Profiling.** | A quick 3-step onboarding quiz configures the child's learning algorithm (Reading focus vs. Math focus). |
| **Offline Curriculum** | **The Core App Engine.** | The 6-week Orton-Gillingham and CRA math curriculum becomes a digital, gamified adventure. |
| **Stripe Checkout** | **Apple In-App Subscriptions.** | Frictionless conversion. Free trial -> Monthly/Annual subscription. |

---

## 2. The iOS Translation: The Student Journey

To win an Apple Design Award (HIG), the app must be exceptionally crafted, highly accessible, and deeply native. 

### 2.1 The Core Loop: Story-Driven Learning
*   **The Narrative:** Students embark on a journey (e.g., exploring islands, building a world) where progression is gated by completing learning modules.
*   **Micro-Interactions:** Short, 3-5 minute bursts of interactive learning to accommodate ADHD and executive function challenges.

### 2.2 Orton-Gillingham (Literacy) Engine
*   **Tactile Learning:** Translating "sand trays" to screen interactions using Apple Pencil or touch with **Core Haptics** (feeling the "texture" of letters).
*   **Vocal Validation:** Using the **Speech Framework** for students to read words aloud to the app, receiving instant, positive feedback.

### 2.3 CRA Math Engine
*   **Physics-based Manipulatives:** Digital snap cubes and fraction strips that snap together with satisfying physical properties using **UIDynamicAnimator** or **SpriteKit**.

### 2.4 The Parent Experience (The Buyer)
*   **Frictionless Subscription:** Apple Pay IAP. 
*   **Background Reassurance:** Weekly automated push notifications: *"Alex mastered 3 new vowel teams this week! Tap to view the animation they unlocked."*

---

## 3. Technology & Architecture Translation

| Requirement | Apple Native Framework | Why it wins HIG |
| :--- | :--- | :--- |
| UI & Layout | **SwiftUI** | Fluid, interruptible animations. Deep ecosystem integration. |
| Gamification | **SpriteKit / Metal** | Smooth 60/120fps physics and particle effects. |
| Accessibility | **Accessibility APIs** | Dynamic Type, VoiceOver, Guided Access (locking app so kids don't wander). |
| Data & Offline | **SwiftData + CloudKit** | Kids play in the car with no Wi-Fi. Syncs seamlessly when connected. |
| Monetization | **StoreKit 2** | Native, trusted subscription management. |