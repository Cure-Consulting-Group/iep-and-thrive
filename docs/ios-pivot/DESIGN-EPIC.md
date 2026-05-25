# Design Epic: IEP & Thrive iOS App

**Status:** COMPLETE (High-Fidelity Assets Generated)
**Project ID:** `3962400022517079455`
**Design System ID:** `assets/5127935140677832000`

## 1. Vision & Vibe
The app is designed to feel like a premium, storybook-quality iPad game ("The Island of Discovery"). It uses a hand-painted illustrative style to mask rigorous clinical pedagogy (Orton-Gillingham and CRA Math).

## 2. Design System (Stitch)
- **Palette:** Forest (#1B4332), Sage (#B7E4C7), Cream (#FDFAF4), Amber (#D4860B).
- **Typography:** Playfair Display (Display/Serif), DM Sans (UI/Sans).
- **Radius:** 20px (Cards), 100px (Pills), 12px (Elements).
- **Rules:** Light-mode primary for learning surfaces to ensure maximum clarity and reduced visual fatigue.

## 3. Core Screens (Asset Manifest)

### 3.1 The Island of Discovery (Map)
- **Screen ID:** `fc0e92ae1bcb43e8a6bc8ad488d2bb11`
- **Focus:** Vertical scrolling biome-based navigation.
- **Interactions:** Level nodes, glowing active state, Sparks counter overlay.

### 3.2 Parent Gate (Onboarding Step 1)
- **Screen ID:** `3d87d9c7750c48d6b15b46ade3e3d230`
- **Focus:** Trustworthy, clean profile setup.
- **Interactions:** Standard form inputs with premium card styling.

### 3.3 Tactile Sand Tray (Literacy Engine)
- **Screen ID:** `ee14655ff18548ed99dace628d828bbf`
- **Focus:** High-fidelity wood/sand textures.
- **Interactions:** Ghost-letter tracing guide. Requires `CoreHaptics` and `Apple Pencil` optimization.

### 3.4 Physics Blocks (Math Engine)
- **Screen ID:** `3b59404c06c9429f9a010b35bff90ba9`
- **Focus:** 3D rendered snap cubes on a felt surface.
- **Interactions:** Drag-and-drop with physical mass. Requires `SpriteKit` physics engine.

### 3.5 Safe Space (Sensory Regulation)
- **Screen ID:** `95b0e40252a546b398f06586711cc671`
- **Focus:** Extremely low visual clutter, hand-painted indoor scene.
- **Interactions:** Interactive digital pet, earned item placement, ambient sound control.

## 4. Engineering Handoff Notes
1. **Framework:** All screens should be implemented in native **SwiftUI**.
2. **Learning Modules:** Literacy and Math modules should use **SpriteKit** nodes integrated into SwiftUI views for physics and fluid interactions.
3. **Accessibility:** Ensure all generated asset IDs translate to meaningful `accessibilityLabel` and `accessibilityHint` values per RFC-002.
4. **Offline:** All progress data must be stored in **SwiftData** locally first.
