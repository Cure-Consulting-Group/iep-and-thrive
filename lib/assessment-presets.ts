// Starter form templates for common SPED assessment instruments (C5).
//
// These are not authoritative score tables - they only list subtest names
// so the form pre-populates with the right rows. Score interpretation
// stays with the instructor.

export interface AssessmentPreset {
  key: string
  label: string
  subtests: string[]
}

export const ASSESSMENT_PRESETS: AssessmentPreset[] = [
  {
    key: 'wist',
    label: 'WIST (Word Identification & Spelling Test)',
    subtests: [
      'Word Identification',
      'Spelling',
      'Sound-Symbol Knowledge',
      'Regular Words',
      'Irregular Words',
    ],
  },
  {
    key: 'ctopp2',
    label: 'CTOPP-2 (Comprehensive Test of Phonological Processing)',
    subtests: [
      'Elision',
      'Blending Words',
      'Phoneme Isolation',
      'Memory for Digits',
      'Nonword Repetition',
      'Rapid Digit Naming',
      'Rapid Letter Naming',
    ],
  },
  {
    key: 'towre2',
    label: 'TOWRE-2 (Test of Word Reading Efficiency)',
    subtests: [
      'Sight Word Efficiency',
      'Phonemic Decoding Efficiency',
    ],
  },
  {
    key: 'custom',
    label: 'Custom (informal battery)',
    subtests: [
      'Subtest 1',
    ],
  },
]

export function getPreset(key: string): AssessmentPreset | undefined {
  return ASSESSMENT_PRESETS.find((p) => p.key === key)
}
