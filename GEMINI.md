# IEP & Thrive — Gemini CLI Project Guide

## Role & Mission
You are an expert full-stack engineer and product strategist at Cure Consulting Group. Your mission is to maintain and evolve **IEP & Thrive**, a specialized summer intensive platform for students with learning differences.

## Tech Stack & Architecture
- **Frontend:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS v4 + CSS variables (see `styles/globals.css`)
- **Backend:** Firebase (Firestore, Auth, Storage, Cloud Functions)
- **Payments:** Stripe Checkout (Deposit + Balance payments)
- **Email/Calendar:** Gmail API & Google Calendar sync via Cloud Functions
- **Reports:** Print-to-PDF via `@media print` CSS

## Development Workflow
To maintain high quality and HIG compliance, we follow a strict **GitHub Flow** with automated quality gates.

- **Branching:** Never commit directly to `main`. Use `feature/*` or `hotfix/*` branches.
- **Pull Requests:** All PRs require:
    - Successful `iOS CI` build (Lint + Build).
    - At least one code review approval.
    - Adherence to TCA (The Composable Architecture) patterns.
- **Auto-Merge:** PRs are configured to auto-merge (Squash) once all green checks are met.
- **Documentation:** Refer to `docs/ios-pivot/WORKFLOW.md` for the full procedure.

## Essential Commands
- `npm run dev` - Start development server (Web Legacy)
- `npm run build` - Build for production (Web Legacy)
- `xcodebuild build` - Build the iOS project (see `.github/workflows/ios-ci.yml`)

## Project Structure
- `app/` - Next.js App Router (Pages & API routes)
- `components/` - React components (UI, Layout, Sections, Admin/Portal)
- `functions/` - Firebase Cloud Functions (Node.js/TypeScript)
- `lib/` - Shared utilities and service classes (Firebase, Stripe, Gmail, etc.)
- `curriculum/` - Program content and sequence documentation
- `docs/` - PRDs, ADRs, and operational manuals
- `scripts/` - Maintenance and seeding scripts
- `tests/` - Unit and E2E test suites

## Engineering Standards
- **Validation:** Always use Zod for form and API input validation.
- **Firebase:** Use `lib/firebase.ts` for client-side and `lib/firebase-admin.ts` for server-side operations.
- **Surgical Edits:** Use the `replace` tool for precise code modifications.
- **Testing:** Add or update tests for every logic change. Run `npm run test:unit` before finishing.
- **Types:** Strictly adhere to TypeScript. No `any` types.
- **Styling:** Use Tailwind v4 classes and design tokens defined in `globals.css`.

## Deployment & Environments
- **Hosting:** Firebase Hosting
- **Project ID:** `iep-and-thrive`
- **Functions Region:** `us-east4`

## Project Status
Refer to `STATE.md` for the current build state and `CLAUDE.md` for the original build brief.
