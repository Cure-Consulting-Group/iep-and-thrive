# RFC 001: The Gamification & Story Engine

## Objective
To define the core loop that transforms a rigorous 6-week Orton-Gillingham / CRA Math curriculum into an addictive, story-driven iOS game for children aged 6-10 with learning differences.

## The Problem
Traditional educational apps often look like "worksheets on a screen." Neurodivergent children quickly identify this and disengage. The learning must be heavily masked by play, narrative, and high-frequency rewards.

## Proposed Solution: "The Island of Discovery"

### 1. The Core Loop
*   **Action:** Child completes a 3-minute interactive phonics or math drill (e.g., tracing letters in digital sand, stacking physics-based math cubes).
*   **Reward:** Earns "Sparks" (in-game currency) and unlocks the next narrative node.
*   **Progression:** The node reveals a new piece of the story (e.g., a short, beautifully animated cutscene or dialogue) and unlocks a new area on the scrolling map.
*   **Sandbox (The Hook):** Sparks can be spent in a sandbox area (e.g., decorating a treehouse, feeding a digital pet). This gives agency and a reason to return daily.

### 2. Translating the Curriculum
*   *Instead of "Week 1: Short Vowels"...* it becomes "The Whispering Woods" where the child must help characters by identifying the missing sounds.
*   *Instead of "CRA Multiplication"...* it becomes "The Factory," where the child uses snap cubes to build bridges for robots.

### 3. Pacing & Cognitive Load
*   **Micro-Sessions:** A session is explicitly designed to last 10-15 minutes (3-4 nodes).
*   **Frictionless Exits:** The app actively encourages the child to stop after the daily goal is met, preventing hyper-fixation and burnout.

## Open Questions
1.  **Narrative Scope:** Do we hire a dedicated narrative designer, or use AI-generated story nodes?
2.  **Asset Generation:** SpriteKit requires high-quality 2D assets. How do we scale art production for 6 weeks of daily content?
3.  **Failure States:** How do we handle a child failing a node? (Crucial: It must not feel punitive. It should feel like "try a different tool" rather than "you got an F").