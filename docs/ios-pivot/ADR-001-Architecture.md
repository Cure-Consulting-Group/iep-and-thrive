# ADR 001: Native iOS Architecture (SwiftUI & SpriteKit)

## Status
Proposed

## Context
IEP & Thrive is pivoting to a student-first, story-driven learning application. The goal is to build an engaging, highly interactive, and accessible experience that can win an Apple Design Award (HIG compliance). We need to select the primary UI framework and rendering engine.

## Options Considered
1.  **React Native / Expo:** Allows code-sharing with the existing Next.js web platform.
2.  **Flutter:** Good for 2D game-like interfaces and cross-platform.
3.  **Native iOS (SwiftUI + SpriteKit):** Pure Apple ecosystem.

## Decision
We will build exclusively on **Native iOS using SwiftUI for the application layer, SpriteKit/Metal for interactive learning modules, and The Composable Architecture (TCA) for robust state management.**

## Rationale
*   **HIG Excellence & Awards:** Native components provide the fluid feel required for an Apple Design Award.
*   **State Management (TCA):** Point-Free's TCA provides a predictable, testable, and composable foundation for managing the complex state transitions of a story-driven game (branching narratives, progression tracking, and lesson logic). It allows us to isolate side effects (Firebase sync, Haptics, Audio) cleanly.
*   **Accessibility (Crucial for SPED):** Apple's native Accessibility APIs integrate flawlessly with SwiftUI/TCA.
*   **Multisensory Feedback:** `CoreHaptics` and SpriteKit physics provide the tactile feedback required for neurodivergent learners.

## Consequences
*   **Positive:** Unmatched performance, fluid animations, deep OS integration.
*   **Negative:** Abandons the existing React/Web codebase. Requires dedicated iOS/Swift engineering expertise. Delays Android expansion (acceptable given the "iOS first" strategy).