# IEP & Thrive: Development Workflow

## 1. Branching Strategy: GitHub Flow
To maintain a high velocity while ensuring the stability of our Apple HIG-award-winning codebase, we follow **GitHub Flow**.

*   **`main` Branch:**
    *   The source of truth for the latest stable, production-ready code.
    *   **Protected:** Direct commits are disabled. 
    *   All changes must arrive via Pull Request.
*   **Feature Branches (`feature/*`):**
    *   Used for new features, UI components, and learning modules (e.g., `feature/sand-tray-haptics`).
    *   Branched from `main`.
*   **Hotfix Branches (`hotfix/*`):**
    *   Used for urgent production bug fixes.
    *   Branched from `main`.

## 2. Pull Request (PR) Requirements
Every PR must pass the following "Quality Gates" before it is eligible for merging:

1.  **CI Build Green:** The `iOS CI` GitHub Action must succeed (Build + Lint).
2.  **Code Review:** At least one "Approve" from a peer developer.
3.  **TCA Standards:** State management must strictly follow TCA patterns (Reducers, Actions, State).
4.  **HIG Compliance:** UI changes must be verified against the Stitch designs and Apple's Human Interface Guidelines.

## 3. Auto-Merge Strategy
We leverage GitHub's **Auto-Merge** feature to reduce friction.

*   Once a PR has been approved and all CI checks are green, the PR will be automatically merged into `main`.
*   We use **Squash and Merge** to keep the `main` history clean and readable.

## 4. CI/CD Infrastructure
*   **iOS CI (`.github/workflows/ios-ci.yml`):** Runs on every push to a PR. Checks Swift syntax, builds the project, and (eventually) runs unit tests.
*   **TestFlight Distribution:** Automated via Fastlane whenever a release tag is pushed.

## 5. Getting Started on a New Task
1.  Pull the latest `main`: `git checkout main && git pull origin main`
2.  Create your branch: `git checkout -b feature/my-new-feature`
3.  Implement changes using TCA and SwiftUI.
4.  Push and open a PR: `git push origin feature/my-new-feature`
5.  Wait for CI and review approval.
6.  Enable Auto-Merge on the PR.
