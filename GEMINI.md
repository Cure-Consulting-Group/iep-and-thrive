# IEP & Thrive — Gemini CLI Project Guide

## Role & Mission
You are an expert full-stack engineer and product strategist at Cure Consulting Group. Your mission is to maintain and evolve **IEP & Thrive**, a specialized multisensory learning platform for students with learning differences.

## Tech Stack & Architecture (iOS Pivot)
- **Frontend:** Native iOS (SwiftUI)
- **State Management:** The Composable Architecture (TCA) - Mandatory
- **Learning Engines:** SpriteKit (Physics), CoreHaptics (Multisensory), Speech (Voice Synthesis)
- **Data Layer:** SwiftData (Local source of truth) + Firebase (Cloud Sync)
- **Design System:** Stitch-native (Forest/Sage/Cream palette)
- **Legacy Web:** Next.js 14 / Tailwind CSS v4 / Stripe Checkout

## Development Workflow
To maintain high quality and HIG compliance, we follow **GitHub Flow** with automated quality gates.
- **Branching:** Never commit directly to `main`. Use `feature/*` or `hotfix/*` branches.
- **Pull Requests:** All PRs require:
    - Successful `iOS CI` build (Lint + Build).
    - At least one code review approval.
    - Strict adherence to TCA patterns.
- **Auto-Merge:** PRs are configured to auto-merge (Squash) once quality gates are satisfied.

## Essential Commands
- `cd ios && xcodegen generate` - Regenerate the Xcode project from `project.yml`
- `xcodebuild build` - Build the iOS project (see `.github/workflows/ios-ci.yml`)
- `npm run dev` - Start development server (Web Legacy)

## Engineering Standards
- **Surgical Edits:** Use the `replace` tool for precise code modifications.
- **Testing:** Include `TestStore` unit tests for every TCA reducer change.
- **Styling:** Use `Theme.swift` tokens and follow Apple HIG strictly for ADA award readiness.
- **Persistence:** Always use TCA dependency wrappers for Database and StoreKit clients.

## Project Status
Refer to `STATE.md` for the current build state and `docs/ios-pivot/` for detailed architectural specs.
