# RFC 002: HIG Compliance & Neurodivergent Accessibility

## Objective
To ensure the IEP & Thrive app not only meets Apple's Human Interface Guidelines (HIG) but sets a new industry standard for accessibility tailored specifically to neurodivergent users (ADHD, Dyslexia, Autism, Sensory Processing Disorders).

## Background
Standard accessibility (VoiceOver, large text) is table stakes for an Apple Design Award. We must go further by addressing cognitive accessibility and sensory regulation.

## Proposed Strategy

### 1. Sensory Regulation (The "Calm" UI)
*   **Visual Clutter:** Zero unnecessary UI elements during gameplay. No constant score tickers or flashing banners.
*   **Color Palette:** Use the established brand colors (`--forest`, `--sage`, `--cream`) to create a low-anxiety visual environment. Avoid stark white backgrounds (reduces visual stress for dyslexic readers).
*   **Audio/Haptic Toggles:** A dedicated "Sensory Settings" panel allowing the child to independently adjust background music, sound effects, and haptic intensity.

### 2. Cognitive Accessibility
*   **Dyslexia-Friendly Typography:** Support for OpenDyslexic or Apple's San Francisco font with adjusted letter-spacing and line-height.
*   **Clear Affordances:** Buttons must look undeniably like buttons. No ambiguous flat design elements during critical learning tasks.
*   **Single-Task Focus:** The screen should only ever ask the child to do one thing at a time.

### 3. Apple APIs to Leverage
*   **Guided Access / Screen Time:** The app should be fully compatible with iOS Guided Access, allowing parents to lock the iPad into the app during "learning time."
*   **Dynamic Type:** The UI must scale perfectly if the user has a system-wide large text preference.
*   **VoiceOver Customization:** All custom SpriteKit nodes (e.g., interactive math blocks) must have custom accessibility labels and traits so visually impaired students can use the manipulatives via VoiceOver.

## Open Questions
1.  **Over-Stimulation:** How do we balance "fun, gamified rewards" (particle effects, sounds) without triggering sensory overload for users with Autism?
2.  **Typography:** Do we force a specific font, or rely entirely on the user's iOS system settings?