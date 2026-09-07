# IEP & Thrive — screen inventory (ios, mid-fi)

| Screen | Purpose | Nav | Primary action | Fixed | Sticky | Scrolls | Below fold |
|---|---|---|---|---|---|---|---|
| Cold launch, first item | A child who has never opened the app is being taught within fifteen seconds, having read nothing | none | Hear the sound again | Exit (icon only, top-left, always present); Continue: a forward chevron, icon-only, thumb-height | — | The grapheme, very large, instructional letterform (single-story a and g); Speaker button: replays the phoneme. Large, centre, obviously tappable; No title. No welcome. No name field. No age field. No account. | 0 px |
| Sound introduction | Introduce one phoneme and its spelling, replayable without limit | none | Replay | Exit  /  progress dots (position only, no percentage, no timer); Continue (icon-only chevron) | — | Grapheme at display size with the mouth-shape cue beside it; Speaker button, primary. Tapping anywhere else also interrupts audio; Example word, spoken and shown, using only graphemes already taught | 0 px |
| Tracing canvas | Child traces the grapheme with guided stroke order and forgiving tolerance | none | Trace the letter | Exit  /  replay sound  /  progress dots; Skip this item (always available, never penalised) | — | Trace target: glyph scaled to fit the canvas, stroke-order ghost, start dot; Stroke counter as dots, not numerals | 0 px |
| Blending | Push taught sounds together into a word at a pace the child controls | none | Blend the sounds | Exit  /  progress dots; Continue | — | Graphemes laid out separately, each individually tappable to hear its sound; Blend control: child drags the sounds together, controlling speed with the gesture; The assembled word, revealed only after the child completes the blend | 0 px |
| Word building, Elkonin boxes | Child places graphemes into one box per phoneme, making the sound-to-spelling map visible | none | Place the letters | Exit  /  replay word  /  progress dots; Check | — | Elkonin boxes: one box per phoneme, sized to the grapheme they take; Grapheme tray: draggable tiles including plausible distractors; Spoken word prompt, replayable | 0 px |
| Mastery check | Confirm a skill is held without the screen reading as a test | none | Answer | Exit  /  progress dots; Continue | — | The item, presented identically to ordinary practice; Response options, large targets, icon and audio supported | 0 px |
| After a wrong answer | The highest-stakes screen in the product: recover from an error without implying deficiency | none | Try again | Exit  /  progress dots; Try again | — | The same item, with one targeted cue added - not a restatement of the lesson; A single scaffold: the first sound, or one box pre-filled | 0 px |
| Session complete | End a session on a satisfying, brief, entirely unmonetised note | none | Done | Done | — | What was learned this session, shown as the graphemes themselves; One short line of specific, earned acknowledgement | 0 px |
| Pause and exit | Leave from anywhere, in one action, at no cost | none | Leave | — | — | Sheet: Keep going  /  Leave  /  Parent area (small, low contrast, bottom); No warning, no confirmation, no progress-loss message | 0 px |
| Parental gate | Keep a child out of the adult area without administering a reading test | none | Enter the answer | Close (returns straight to learning) | — | Arithmetic challenge rendered as numerals: 13 x 4; Number pad, numerals only; One line explaining this is for a grown-up | 0 px |
| Parent area | Tell an adult what this is, what it teaches, what it costs, and what it collects | none | Read | < Back to learning | — | What this teaches, in plain language, no jargon and no diagnosis claims; Cost: free. All of it. Forever. Stated without qualification; Data: nothing leaves this device. No account, no analytics, no network; Settings: audio volume, reduced motion, reset progress; Research study: join with a code (optional, off by default) | 0 px |
| Research study consent | The one consented path where anything leaves the device | none | Join the study | < Back; Join the study | — | Exactly what is sent: sessions started, skills reached, days since first open; Exactly what is never sent: name, age, voice, drawings, device id, anything identifying; Study code from the teacher or the study team; Leave the study: one tap, deletes the token, stops all uploads | 0 px |

## Notes and states

- **Cold launch, first item**: Replaces the shipped OnboardingView, which opens 'Welcome, Parent!' and collects name and age - a child alone cannot get past it
- **Cold launch, first item**: Phoneme audio autoplays once on entry, then waits. It never loops unprompted
- **Cold launch, first item**: First-run: identical to every later run. There is no first-run variant, deliberately
- **Cold launch, first item**: Offline is the normal state, not an error. Nothing on this screen implies a connection
- **Sound introduction**: Any tap interrupts narration immediately - this is the incumbent's single loudest complaint
- **Sound introduction**: Reduced motion: mouth-shape cue is a static illustration rather than an animation
- **Sound introduction**: No text is load-bearing. A child who reads nothing on this screen can still proceed
- **Tracing canvas**: Fixes the shipped defect: makeLetterPath hardcodes 300pt and centres but never scales, so a two-glyph blend renders ~1236pt on a ~350pt canvas
- **Tracing canvas**: Multi-glyph targets (sh, bl, ai) must fit the same canvas as a single glyph
- **Tracing canvas**: Tolerance is forgiving by design; motor difficulty frequently co-occurs and is not what we are assessing
- **Tracing canvas**: Success animation is brief and quiet. No confetti, no fanfare, no score
- **Blending**: New surface. The engine is pure Domain (BlendingEngine) per ADR-000 D9
- **Blending**: The child sets the tempo. No automatic blending animation the child has to sit through
- **Blending**: Each grapheme remains tappable throughout, so a child can re-hear one sound without restarting
- **Word building, Elkonin boxes**: New surface. Boxes are the standard multisensory apparatus and must read as boxes, not as a spelling test
- **Word building, Elkonin boxes**: A wrong tile returns to the tray without commentary. No red, no buzzer, no shake
- **Word building, Elkonin boxes**: Distractors are phonologically plausible, never arbitrary
- **Mastery check**: Must be visually indistinguishable from practice. A child who knows they are being tested performs worse and this population has been tested constantly
- **Mastery check**: No score, no percentage, no 'quiz' framing, no results summary
- **Mastery check**: Mastery is inferred across items by PacingEngine, never announced on a single answer
- **After a wrong answer**: The incumbent's defining failure is a remedial lecture triggered by two wrong answers. We add one cue and return control
- **After a wrong answer**: No error colour, no error sound, no 'not quite', no counter of attempts
- **After a wrong answer**: After a second miss the item is set aside for spaced review and the session moves on. The child is never stuck
- **Session complete**: No upsell. No paywall. No account prompt. No 'save your progress'. No streak. No next-session countdown
- **Session complete**: Deletes the shipped behaviour where a paywall auto-presents to the child after three missions
- **Session complete**: Brief by design - a child who wants to stop should be able to leave in one tap
- **Pause and exit**: Reachable from every child screen via the persistent top-left control
- **Pause and exit**: Progress is saved continuously, so there is genuinely nothing to lose and nothing to warn about
- **Pause and exit**: The parent entry point lives here and is deliberately unattractive to a child
- **Parental gate**: Numeric, never the conventional spelled-out-word gate. Dyslexia is strongly heritable, so a reading gate is a literacy test on a parent who may share the diagnosis
- **Parental gate**: A wrong answer regenerates a new problem silently. No lockout, no attempt counter
- **Parental gate**: Required for App Store Kids Category; no gate exists in the shipped app today
- **Parent area**: This is the screen a teacher reads before deciding whether to recommend the app
- **Parent area**: The zero-collection statement must be literally true per ADR-000 D1, not a summary of a policy
- **Parent area**: Reset progress is destructive and irreversible with no cloud copy - confirm, and say so plainly
- **Parent area**: No diagnosis language anywhere. We teach; we do not identify dyslexia
- **Research study consent**: Off by default. ADR-000 D6 - the sole exception to the zero-network rule
- **Research study consent**: Written for a parent, at a reading level that does not assume the parent reads fluently either
- **Research study consent**: Revocation must be as prominent as joining, and take effect immediately
