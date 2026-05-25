# Product Requirements Document (PRD): IEP & Thrive iOS App

## 1. Product Vision & Goals
**Vision:** To create a magical, deeply engaging, story-driven iOS application that translates specialized IEP (Individualized Education Program) interventions into digital play. We aim to win an Apple Design Award (HIG) by making specialized education beautiful, accessible, and infinitely scalable.

**Goals:**
1. Scale the IEP & Thrive curriculum globally by removing the human-provider bottleneck.
2. Achieve industry-leading engagement rates for neurodivergent children (ADHD, Dyslexia, Autism).
3. Build a frictionless monetization loop targeting parents/teachers as subscribers.

## 2. Target Audience & Personas

### Primary User (The Child)
*   **Age:** 6–10 years old (Grades 1-5).
*   **Profile:** Has an IEP or learning difference (Dyslexia, Dyscalculia, ADHD). Often experiences frustration or fatigue with traditional "school" apps.
*   **Needs:** High visual reward, low cognitive overhead on UI navigation, multi-sensory feedback, short session durations.

### The Buyer (The Parent/Teacher)
*   **Profile:** Overwhelmed, looking for tools that *actually* work and align with IEP goals, rather than generic entertainment.
*   **Needs:** Trust in the pedagogy (Orton-Gillingham/CRA), easy subscription management, passive reassurance that it's working (notifications/brief reports).

## 3. Product Principles
1.  **Play First, Learn Always:** It must feel like an premium iOS game, not a worksheet on a screen.
2.  **Sensory Rich, Cognitively Clear:** Heavy use of haptics, sound design, and fluid animations, but *zero* visual clutter. Clean interfaces.
3.  **HIG Excellence:** Deep integration with Apple's native APIs (SwiftUI, SpriteKit, CoreHaptics, Accessibility).
4.  **Zero-Guilt Screentime:** Parents should feel proud when their child asks to play.

## 4. Core Features (MVP Scope)

### 4.1 The Onboarding (Parent Gate)
*   **Quick Profile:** 3 questions to set the child's baseline (Age, Primary Focus: Math/Reading, Current Challenge).
*   **The Paywall:** Native StoreKit 2 integration offering a Free Trial -> Monthly/Annual subscription.
*   **Parent Lock:** Apple-standard math-gate (e.g., "Solve 3x4 to access settings") to keep kids in the play zone.

### 4.2 The Journey (Navigation)
*   A scrolling, interactive map.
*   Students progress from node to node.
*   Each node represents a micro-lesson (3-5 minutes).

### 4.3 Literacy Engine (Orton-Gillingham)
*   **Tactile Tracing:** Tracing letters/phonograms with the finger/Pencil. The screen provides haptic feedback resembling sand, shaving cream, or paint.
*   **Phoneme Blending:** Dragging physical-feeling letter tiles together to build words.
*   **Voice Check:** App asks child to read a word; uses `Speech` framework to validate and cheer them on.

### 4.4 Numeracy Engine (CRA Math)
*   **Snap Cubes:** Dragging blocks onto the screen to solve addition/multiplication visually.
*   **Physics:** Blocks have mass and gravity (SpriteKit), making counting tactile.

### 4.5 The Reward Loop
*   Completing nodes unlocks pieces of a larger story, animated stickers, or items to decorate a virtual "safe space" (a room or island).

## 5. Success Metrics
*   **Lead Metric:** Session Completion Rate (Target: >85% of started sessions are finished).
*   **Engagement:** Average Sessions Per Week (Target: 3+).
*   **Monetization:** Trial-to-Paid Conversion Rate (Target: >15%).
*   **Quality:** App Store Rating (Target: 4.8+) and Apple Editorial Featuring.

## 6. Out of Scope for V1
*   Web app syncing or access.
*   Live tutoring connections or chat.
*   Complex parent dashboards with PDF generations (replaced by simple push notifications).