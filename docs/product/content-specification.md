# MVP content specification

This is the curriculum contract for an educator authoring against the MVP. It implements [ADR-000 D2–D4](../architecture/ADR-000-mvp-architecture-decisions.md): recorded audio, content as validated data, and skills as a first-class taxonomy separate from levels.

## Authoring principle

The author creates a sequence a nine-year-old can enter alone and continue for eight weeks. A Skill is the unit of instruction and the future parent record. A Level is a practice encounter that evidences one or more skills. A level number is not a learning claim. Every level is data, not Swift code, and CI must reject malformed, unreachable, unpronounceable, unsupported-engine, or missing-audio entries.

## Skill taxonomy

The MVP taxonomy has stable IDs, human-readable descriptions, prerequisite links, and mastery states. Minimum fields are:

| Field | Requirement |
| --- | --- |
| `skillId` | Stable, unique identifier; never derived from display order |
| `strand` | Decoding strand, such as grapheme, digraph, blend, vowel team, r-controlled vowel, syllable type |
| `instructionalLabel` | Educator language that describes the teachable skill |
| `childLabel` | Age-respectful language shown to the child |
| `prerequisites` | Earlier skills required before this skill is introduced |
| `masteryRule` | Explicit evidence threshold and review behavior, authored with the educator |
| `levelIds` | Encounters that teach or evidence the skill |
| `audioAssetIds` | Required recorded assets |

Mastery is not a reward, streak, or completion badge. It is a skill state evidenced by repeated work. The record is not the MVP feature, but the taxonomy must make a later parent-held record meaningful: “can decode closed syllables with short vowels” is useful; “completed level 47” is not.

## Decoding scope and sequence

The sequence is intentionally a floor of approximately 120 nodes, not a claim that 120 nodes teach every decoding skill a child may need. The strands are:

1. **Single graphemes shipping today.** Start with the single consonant and short-vowel graphemes represented by the existing tracing engine. Each node introduces the sound, the written grapheme, a recorded phoneme, a grapheme name where pedagogically appropriate, and decodable practice.
2. **Digraphs and blends.** Introduce consonant digraphs and consonant blends only after the prerequisite single graphemes are taught. Separate “two letters, one sound” digraph work from adjacent sounds in blends.
3. **Vowel teams and r-controlled vowels.** Add the authored vowel teams and r-controlled patterns in prerequisite order. The child should hear the target sound-pattern relationship and practice words whose other graphemes are already available.
4. **Closed and open syllables.** Introduce the syllable types once the relevant short and long patterns are prepared. Keep syllable-type language adult-clear in the taxonomy and age-respectful in the child-facing copy.

Morphology and comprehension are not required to inflate this floor. Comprehension remains a separate engine and decision. The scope and sequence may be extended after the retention gate, but an extension is not an excuse to blur the MVP contract.

## Why approximately 120, not approximately 546

The planned session is 10–15 minutes, with 3–4 nodes consumed per session and three sessions each week. Across eight weeks:

`3 nodes × 3 sessions × 8 weeks = 72 nodes`  
`4 nodes × 3 sessions × 8 weeks = 96 nodes`

Therefore a cohort can consume roughly 72–96 nodes. A floor of approximately 120 leaves roughly 24–48 nodes of cushion. That cushion lets review, inferred placement, skips, slower learners, and mastery pacing occur without the study measuring content exhaustion instead of retention. The same arithmetic explains the earlier twelve-month estimate: at the same pacing, a year would require roughly 546 nodes. Approximately 120 is an MVP measurement floor; approximately 546 is a longer subscription-depth requirement, not an MVP promise.

## Level authoring template

Each level must be authored as a data record with at least:

```yaml
levelId: dec-001
strand: single-grapheme
skillIds: [grapheme.m, phoneme.m]
prerequisites: []
title: "The /m/ sound"
childPrompt: "Listen, trace, and find the sound."
engine: trace
targetValue: m
exampleWords: [am, mat]
audioAssetIds: [phoneme.m, grapheme.m, word.am, word.mat, instruction.trace.001]
masteryEvidence: "defined by educator and validator"
reviewAfter: [dec-002]
```

The final schema may use JSON, but the semantic requirements do not change. Authors must state the skill being taught, the engine that exists, prerequisites, child copy, examples, audio, and evidence. A level cannot quietly use a string such as `main-idea` when no engine exists.

## Editorial rules

- Example words must be decodable under the sequence position.
- Never use a word containing a grapheme or pattern not yet taught. This includes prompts, hints, encouragement examples, and audio labels.
- Do not smuggle an untaught pattern into a “fun” word, proper noun, story title, or reward.
- Use age-respectful language for a nine-year-old who already knows they are behind. Avoid baby talk, deficit labels, shame, countdowns, and language that treats remediation as punishment.
- Keep prompts short enough for an independent child and make narration skippable.
- A wrong answer receives a useful next action, not a lecture. Do not repeat an adult explanation after two errors.
- Child-facing copy describes the action and sound; educator-facing taxonomy describes the underlying skill precisely.
- Do not imply diagnosis, grade-level recovery, guaranteed mastery, or an IEP outcome.
- A skill state must not be represented by sparks, streaks, stars, or a completion celebration alone.

## Audio asset inventory

Per ADR-000 D2, the bundle requires approximately 44 phoneme recordings, approximately 120 example-word recordings at the MVP floor, and instruction and encouragement lines. The inventory must include a stable asset ID, source text, phonological target, speaker/session, format, duration, and licensing/consent status. It must cover every phoneme, grapheme name, example word, instruction, and encouragement line used by a level. One consistent voice and room are required for the instructional set. Missing IDs are CI failures. Text-to-speech is not an instructional substitute; it may be used only for non-instructional UI text where a screen reader would otherwise speak.

## Editorial acceptance gate

The educator signs off the scope and sequence, the validator confirms graph reachability and decodability, and an accessibility/content review confirms age-respectful copy. The content freeze is complete only when the 120-node floor has valid skills, prerequisites, engines, examples, audio, and review behavior. Content authoring is the long pole and requires an educator; faster code cannot substitute for missing curriculum decisions.
