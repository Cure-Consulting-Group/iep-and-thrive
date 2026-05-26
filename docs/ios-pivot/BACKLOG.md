# Engineering Backlog: IEP & Thrive iOS

## Epic 1: Foundation & Architecture
**Goal:** Establish the iOS project structure, CI/CD pipeline, design system tokens, and the TCA (The Composable Architecture) + offline-first data layer.

### Tickets
*   **[ENG-101] iOS Project Initialization & CI/CD**
    *   **Description:** Initialize the Xcode project (SwiftUI lifecycle). Set up Fastlane for TestFlight distribution. Configure Firebase iOS SDK for Auth, Crashlytics, and Performance Monitoring. Add TCA (`swift-composable-architecture`) via SPM.
    *   **Acceptance Criteria:** Empty app builds and deploys to TestFlight via GitHub Actions. Crashlytics is receiving test crashes. TCA dependency is resolved.
*   **[ENG-102] Design System Implementation**
    *   **Description:** Translate `.stitch/DESIGN.md` into a native SwiftUI `Theme.swift` file. Define custom colors (Forest, Sage, Cream, Amber), typography (Playfair Display, DM Sans), and standard modifiers.
    *   **Acceptance Criteria:** `Theme` struct provides all tokens. A "Style Guide" preview view displays all text styles, colors, and button variants.
*   **[ENG-103] TCA Root Store & SwiftData Client**
    *   **Description:** Define the `RootFeature` reducer. Implement a TCA `DependencyKey` for SwiftData to manage the `StudentProfile`, `LessonProgress`, and `Sparks` models. Build a background sync manager to push SwiftData changes to Firestore, exposed as an asynchronous TCA effect.
    *   **Acceptance Criteria:** App root is driven by a TCA `Store`. Data reads/writes are handled via TCA dependencies with zero UI latency. Background sync effect works when online.

---

## Epic 2: The Parent Gate & Onboarding
**Goal:** Build the secure, trustworthy 3-step setup flow for parents.
**Reference Screen ID:** `3d87d9c7750c48d6b15b46ade3e3d230`

### Tickets
*   **[ENG-201] Parent Math Gate (TCA Feature)**
    *   **Description:** Implement Apple's required "Math Gate". Build a dedicated TCA Reducer (`MathGateFeature`) handling input validation and lockout state.
    *   **Acceptance Criteria:** Accurate math validation. Locks out after 3 failed attempts, state managed cleanly via TCA.
*   **[ENG-202] Onboarding UI & State Machine**
    *   **Description:** Build the 3-step profile setup UI. Use TCA to manage the multi-step form state (`OnboardingFeature`), handling transitions and validation. Collect Name, Age, and Primary Focus.
    *   **Acceptance Criteria:** Pixel-perfect implementation of the card UI. Progress bar driven by TCA state. Upon completion, data is saved via the SwiftData dependency.

---

## Epic 3: The Island of Discovery (Navigation)
**Goal:** Implement the gamified, vertical scrolling journey map.
**Reference Screen ID:** `fc0e92ae1bcb43e8a6bc8ad488d2bb11`

### Tickets
*   **[ENG-301] Vertical Scrolling Biome Engine**
    *   **Description:** Implement a custom `ScrollView` that handles the large biome backgrounds.
    *   **Acceptance Criteria:** Map scrolls fluidly at 60fps on iPad. Backgrounds transition seamlessly.
*   **[ENG-302] Interactive Lesson Nodes & TCA Integration**
    *   **Description:** Place circular nodes along the path. The `JourneyFeature` reducer should observe `LessonProgress` to determine node states (Locked, Active, Completed). 
    *   **Acceptance Criteria:** Active node pulses. Tapping an active node sends an action to the Store to route to the lesson. Locked nodes trigger a haptic feedback effect.
*   **[ENG-303] Sparks Counter & Safe Space UI**
    *   **Description:** Implement the floating UI overlays. The Sparks counter should observe the global shared state in the Root Reducer.
    *   **Acceptance Criteria:** Sparks counter animates when state changes. Safe Space FAB sends an action to route to the Safe Space view.

---

## Epic 4: Literacy Engine (Tactile Sand Tray)
**Goal:** Build the multisensory Orton-Gillingham tracing module.
**Reference Screen ID:** `ee14655ff18548ed99dace628d828bbf`

### Tickets
*   **[ENG-401] Sand Tray Visuals & Touch Tracking**
    *   **Description:** Implement the wood/sand texture background. Build a custom touch tracking view that captures user strokes.
    *   **Acceptance Criteria:** Smooth line drawing with variable width. Sand texture is visible beneath the drawn line.
*   **[ENG-402] Ghost Letter Guide & Validation (TCA)**
    *   **Description:** Overlay the faint "ghost letter". The `LiteracyFeature` reducer handles stroke validation logic.
    *   **Acceptance Criteria:** Reducer detects when tracing is "close enough" and transitions state to success.
*   **[ENG-403] CoreHaptics Integration**
    *   **Description:** Create a TCA dependency wrapper for `CoreHaptics` to provide continuous, textured feedback while drawing.
    *   **Acceptance Criteria:** Gritty haptic sensation plays only while the finger/pencil is moving.

---

## Epic 5: Math Engine (Physics Blocks)
**Goal:** Build the CRA-based snap cube addition module.
**Reference Screen ID:** `3b59404c06c9429f9a010b35bff90ba9`

### Tickets
*   **[ENG-501] SpriteKit Physics Environment**
    *   **Description:** Set up a `SpriteView` within SwiftUI. Configure the physics world and felt surface.
    *   **Acceptance Criteria:** Physics world runs smoothly. Objects rest on the boundary.
*   **[ENG-502] 3D Snap Cubes & Drag Gestures**
    *   **Description:** Create the cube `SKSpriteNode` objects. Implement drag-and-drop gestures.
    *   **Acceptance Criteria:** Cubes can be dragged and interact physically.
*   **[ENG-503] Addition Validation & TCA Bridge**
    *   **Description:** Build a bridge between the SpriteKit scene delegate and the `MathFeature` reducer. When blocks enter the target area, send an action to the Store to validate the equation.
    *   **Acceptance Criteria:** TCA reducer accurately counts blocks based on SpriteKit events. Success triggers celebration animation and awards Sparks via an effect.

---

## Epic 6: Safe Space (Sensory Regulation)
**Goal:** Build the immersive, low-clutter deregulation room.
**Reference Screen ID:** `95b0e40252a546b398f06586711cc671`

### Tickets
*   **[ENG-601] Safe Space Environment & Audio Engine**
    *   **Description:** Implement the room background. Create an `AudioClient` TCA dependency to manage `AVAudioPlayer` for ambient nature sounds.
    *   **Acceptance Criteria:** Scene renders perfectly. Audio loops seamlessly and volume is controllable via TCA actions.
*   **[ENG-602] Interactive Digital Pet**
    *   **Description:** Implement the digital pet. Tap gestures send actions to the `SafeSpaceFeature` to trigger "happy" animations.
    *   **Acceptance Criteria:** Pet idles. Tapping triggers joyful reaction.

---

## Epic 7: Monetization & Parent Reporting
**Goal:** Implement the subscription model and automated progress digests.

### Tickets
*   **[ENG-701] StoreKit 2 Client (TCA)**
    *   **Description:** Implement native Apple In-App Subscriptions wrapped in a TCA `StoreKitClient` dependency. Build the Paywall UI (`PaywallFeature`).
    *   **Acceptance Criteria:** Subscriptions process successfully. Premium state is reflected in the Root Reducer.
---

## Epic 8: Content Sprint (Weeks 1 & 2)
**Goal:** Transition from a technical demo to a viable V1 by digitizing the first two weeks of the Orton-Gillingham and CRA Math curriculum.

### Tickets
*   **[ENG-801] CurriculumProvider & Level Mapping**
    *   **Description:** Create a `CurriculumClient` TCA dependency. Map the Week 1 & 2 grid from `curriculum/scope-and-sequence.md` into a structured Swift data source. Feed the `LiteracyFeature` and `MathFeature` with specific level data (target letters, equations, biome context).
    *   **Acceptance Criteria:** Store can fetch 30+ distinct level definitions. Nodes on the Journey Map are correctly assigned to their curriculum content.
*   **[ENG-802] Level Preview Popup & Lesson Launch**
    *   **Description:** Build the `LevelPreview` UI (as suggested in Stitch). A beautiful modal that appears when a node is tapped, showing the level title, learning goal, and a "Start" button.
    *   **Acceptance Criteria:** Tapping a node in `JourneyView` presents the popup. Tapping "Start" routes the user into the correct `Literacy` or `Math` engine via the Root navigation stack.
