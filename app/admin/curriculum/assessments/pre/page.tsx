'use client'

import { useState } from 'react'
import Link from 'next/link'

/* ------------------------------------------------------------------ */
/*  Collapsible Section                                                */
/* ------------------------------------------------------------------ */
function Section({
  title,
  icon,
  defaultOpen = false,
  children,
}: {
  title: string
  icon: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden print:break-inside-avoid">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 cursor-pointer hover:bg-cream-deep/40 transition-colors duration-200"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <h2 className="font-display text-lg font-bold text-text text-left">{title}</h2>
        </div>
        <svg
          className={`w-5 h-5 text-text-muted shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-6 pb-6 space-y-6">{children}</div>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Sub-section header                                                 */
/* ------------------------------------------------------------------ */
function SubHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={`font-display font-bold text-base text-text mb-3 ${className}`}>{children}</h3>
  )
}

/* ------------------------------------------------------------------ */
/*  Instruction prompt callout                                         */
/* ------------------------------------------------------------------ */
function Prompt({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-sage-pale/50 rounded-xl px-4 py-3 text-sm text-forest italic border-l-4 border-forest-light print:bg-gray-100">
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Score badge                                                        */
/* ------------------------------------------------------------------ */
function ScoreBadge({ label }: { label: string }) {
  return (
    <span className="inline-block bg-forest/10 text-forest font-bold text-sm px-3 py-1 rounded-full font-body">
      {label}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Scoring key badge                                                  */
/* ------------------------------------------------------------------ */
function ScoringKey({ items }: { items: { label: string; meaning: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {items.map((item) => (
        <span key={item.label} className={`${item.color} text-xs font-semibold px-2.5 py-1 rounded-full`}>
          {item.label} = {item.meaning}
        </span>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Level badge                                                        */
/* ------------------------------------------------------------------ */
function LevelBadge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`${color} text-xs font-semibold px-2.5 py-1 rounded-full`}>{label}</span>
  )
}

/* ------------------------------------------------------------------ */
/*  Standard assessment table                                          */
/* ------------------------------------------------------------------ */
function AssessmentTable({
  headers,
  rows,
  caption,
}: {
  headers: string[]
  rows: string[][]
  caption?: string
}) {
  return (
    <div className="overflow-x-auto">
      {caption && <p className="text-xs text-text-muted mb-2 font-semibold uppercase tracking-wider">{caption}</p>}
      <table className="w-full text-sm border-collapse print:text-xs">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                className="bg-forest text-white font-semibold text-left px-3 py-2 first:rounded-tl-lg last:rounded-tr-lg text-xs uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-cream-deep/40'}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-3 py-2 border-b border-border text-warm-gray">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Summary table with mastery level columns                           */
/* ------------------------------------------------------------------ */
function SummaryTable({
  headers,
  rows,
}: {
  headers: string[]
  rows: string[][]
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse print:text-xs">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                className="bg-forest text-white font-semibold text-left px-3 py-2 first:rounded-tl-lg last:rounded-tr-lg text-xs uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-cream-deep/40'}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className={`px-3 py-2 border-b border-border ${ci === 0 ? 'font-semibold text-text' : 'text-warm-gray'}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Two-column word table (for consonants, CVC, etc.)                  */
/* ------------------------------------------------------------------ */
function TwoColWordTable({
  headers,
  leftItems,
  rightItems,
}: {
  headers: [string, string, string, string, string, string]
  leftItems: string[]
  rightItems: string[]
}) {
  const maxLen = Math.max(leftItems.length, rightItems.length)
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse print:text-xs">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                className={`bg-forest text-white font-semibold text-left px-3 py-2 text-xs uppercase tracking-wider ${i === 0 ? 'rounded-tl-lg' : ''} ${i === headers.length - 1 ? 'rounded-tr-lg' : ''} ${i === 3 ? 'border-l-2 border-white/20' : ''}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: maxLen }, (_, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-cream-deep/40'}>
              <td className="px-3 py-2 border-b border-border font-semibold text-text">{leftItems[ri] || ''}</td>
              <td className="px-3 py-2 border-b border-border text-warm-gray"></td>
              <td className="px-3 py-2 border-b border-border text-warm-gray"></td>
              <td className="px-3 py-2 border-b border-border border-l-2 border-l-border font-semibold text-text">{rightItems[ri] || ''}</td>
              <td className="px-3 py-2 border-b border-border text-warm-gray"></td>
              <td className="px-3 py-2 border-b border-border text-warm-gray"></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Rubric table (4-point scale)                                       */
/* ------------------------------------------------------------------ */
function RubricTable({ rows }: { rows: { score: string; description: string }[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse print:text-xs">
        <thead>
          <tr>
            <th className="bg-forest text-white font-semibold text-left px-3 py-2 rounded-tl-lg text-xs uppercase tracking-wider w-20">Score</th>
            <th className="bg-forest text-white font-semibold text-left px-3 py-2 rounded-tr-lg text-xs uppercase tracking-wider">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-cream-deep/40'}>
              <td className="px-3 py-2 border-b border-border font-bold text-forest text-center">{row.score}</td>
              <td className="px-3 py-2 border-b border-border text-warm-gray">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Checklist item                                                     */
/* ------------------------------------------------------------------ */
function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm text-warm-gray">
      <span className="w-4 h-4 rounded border-2 border-forest-light/40 shrink-0 mt-0.5" />
      {children}
    </li>
  )
}

/* ================================================================== */
/*  MAIN PAGE                                                          */
/* ================================================================== */
export default function PreAssessmentPage() {
  return (
    <div className="print:p-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-text-muted mb-6 print:hidden">
        <Link href="/admin/curriculum" className="hover:text-forest transition-colors">
          Curriculum
        </Link>
        <span>/</span>
        <span className="text-text font-semibold">Pre-Assessment Battery</span>
      </div>

      {/* Header Banner */}
      <div className="bg-forest rounded-2xl p-6 md:p-8 mb-8 text-white print:bg-gray-800 print:rounded-none">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">&#x1F4CB;</span>
          <div>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">
              Summer 2026 &middot; Grades 3&ndash;4
            </p>
            <h1 className="font-display text-2xl md:text-3xl font-bold">Pre-Assessment Battery</h1>
          </div>
        </div>
        <p className="text-white/70 text-sm mt-1">Administered Week 1, Day 1</p>

        {/* Admin notes */}
        <div className="mt-4 bg-white/10 rounded-xl px-4 py-3 text-sm text-white/80 space-y-1">
          <p className="font-semibold text-white/90 mb-1">Administration Notes</p>
          <ul className="list-disc list-inside space-y-0.5 text-white/70 text-xs leading-relaxed">
            <li>Administer in a quiet, distraction-free setting</li>
            <li>Allow breaks between sections as needed</li>
            <li>Takes approximately 60&ndash;90 minutes; may be split across Day 1 and Day 2</li>
            <li>Record all observations (behavior, strategies used, self-corrections, frustration points)</li>
            <li>Results determine OG entry point, flexible groupings, and baseline data for CSE-ready final report</li>
          </ul>
        </div>
      </div>

      {/* Student Info Card */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-6 print:break-inside-avoid">
        <h2 className="font-display font-bold text-base text-text mb-4">Student Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          {[
            'Assessor',
            'Date',
            'Student Name',
            'Age',
            'Rising Grade',
            'Parent/Guardian',
          ].map((label) => (
            <div key={label}>
              <p className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
              <div className="border-b-2 border-dashed border-border h-6" />
            </div>
          ))}
          <div className="sm:col-span-2 lg:col-span-3 flex gap-6">
            <div className="flex items-center gap-2 text-sm text-warm-gray">
              <span className="w-4 h-4 rounded border-2 border-forest-light/40" /> IEP on File
            </div>
            <div className="flex items-center gap-2 text-sm text-warm-gray">
              <span className="w-4 h-4 rounded border-2 border-forest-light/40" /> 504 on File
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4">

        {/* ============================================================ */}
        {/*  SECTION 1: Phonics Screener                                  */}
        {/* ============================================================ */}
        <Section title="Section 1: Phonics Screener" icon="&#x1F524;" defaultOpen>
          <div className="bg-cream-deep/60 rounded-xl px-4 py-3 text-sm text-warm-gray space-y-1">
            <p><span className="font-semibold text-text">Purpose:</span> Identify mastery vs. instructional need across the OG phonics continuum</p>
            <p><span className="font-semibold text-text">Administration:</span> Student reads across each row. Mark each item.</p>
            <p><span className="font-semibold text-text">Discontinue Rule:</span> If student misses 4+ items in a row within a skill area, stop that section and move to the next.</p>
          </div>

          <ScoringKey
            items={[
              { label: '+', meaning: 'Correct, automatic', color: 'bg-sage-pale text-forest' },
              { label: 'SC', meaning: 'Self-corrected', color: 'bg-amber-light text-amber' },
              { label: '\u2014', meaning: 'Incorrect / no response', color: 'bg-red-50 text-red-700' },
            ]}
          />

          {/* 1A: Consonant Sounds */}
          <div>
            <SubHeader>1A. Consonant Sounds (Isolation)</SubHeader>
            <Prompt>Say: &ldquo;Tell me the sound each letter makes.&rdquo;</Prompt>
            <div className="mt-3">
              <TwoColWordTable
                headers={['Letter', 'Response', '+/SC/\u2014', 'Letter', 'Response', '+/SC/\u2014']}
                leftItems={['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm']}
                rightItems={['n', 'p', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z']}
              />
            </div>
            <div className="mt-3 text-right"><ScoreBadge label="Score: ___ / 20" /></div>
          </div>

          {/* 1B: Short Vowels */}
          <div>
            <SubHeader>1B. Short Vowel Sounds (Isolation)</SubHeader>
            <Prompt>Say: &ldquo;Tell me the short sound of each vowel.&rdquo;</Prompt>
            <div className="mt-3">
              <AssessmentTable
                headers={['Vowel', 'Response', '+/SC/\u2014']}
                rows={[
                  ['a (as in apple)', '', ''],
                  ['e (as in egg)', '', ''],
                  ['i (as in itch)', '', ''],
                  ['o (as in octopus)', '', ''],
                  ['u (as in umbrella)', '', ''],
                ]}
              />
            </div>
            <div className="mt-3 text-right"><ScoreBadge label="Score: ___ / 5" /></div>
          </div>

          {/* 1C: CVC Words */}
          <div>
            <SubHeader>1C. CVC Words (Closed Syllable &mdash; Short Vowels)</SubHeader>
            <Prompt>Say: &ldquo;Read each word aloud.&rdquo;</Prompt>
            <div className="mt-3">
              <TwoColWordTable
                headers={['Word', 'Response', '+/SC/\u2014', 'Word', 'Response', '+/SC/\u2014']}
                leftItems={['cat', 'pin', 'job', 'fun', 'map']}
                rightItems={['beg', 'hum', 'wet', 'lid', 'cot']}
              />
            </div>
            <div className="mt-3 text-right"><ScoreBadge label="Score: ___ / 10" /></div>
          </div>

          {/* 1D: Consonant Blends */}
          <div>
            <SubHeader>1D. Consonant Blends</SubHeader>
            <Prompt>Say: &ldquo;Read each word aloud.&rdquo;</Prompt>
            <div className="mt-3">
              <AssessmentTable
                headers={['Word', 'Blend Tested', 'Response', '+/SC/\u2014']}
                rows={[
                  ['trip', 'tr- (initial)', '', ''],
                  ['blast', 'bl- (initial)', '', ''],
                  ['stamp', 'st- (initial)', '', ''],
                  ['crust', 'cr- (initial)', '', ''],
                  ['spent', 'sp- (initial)', '', ''],
                  ['drift', '-ft (final)', '', ''],
                  ['brand', 'br- (initial)', '', ''],
                  ['clamp', 'cl- (initial)', '', ''],
                  ['frost', 'fr- (initial)', '', ''],
                  ['yelp', '-lp (final)', '', ''],
                ]}
              />
            </div>
            <div className="mt-3 text-right"><ScoreBadge label="Score: ___ / 10" /></div>
          </div>

          {/* 1E: Consonant Digraphs */}
          <div>
            <SubHeader>1E. Consonant Digraphs</SubHeader>
            <Prompt>Say: &ldquo;Read each word aloud.&rdquo;</Prompt>
            <div className="mt-3">
              <AssessmentTable
                headers={['Word', 'Digraph Tested', 'Response', '+/SC/\u2014']}
                rows={[
                  ['ship', 'sh', '', ''],
                  ['chin', 'ch', '', ''],
                  ['thin', 'th (unvoiced)', '', ''],
                  ['whip', 'wh', '', ''],
                  ['duck', 'ck', '', ''],
                  ['batch', 'tch', '', ''],
                  ['the', 'th (voiced)', '', ''],
                  ['graph', 'ph', '', ''],
                ]}
              />
            </div>
            <div className="mt-3 text-right"><ScoreBadge label="Score: ___ / 8" /></div>
          </div>

          {/* 1F: Silent-e */}
          <div>
            <SubHeader>1F. Silent-e (VCe) Words</SubHeader>
            <Prompt>Say: &ldquo;Read each word aloud.&rdquo;</Prompt>
            <div className="mt-3">
              <AssessmentTable
                headers={['Word', 'Response', '+/SC/\u2014']}
                rows={[
                  ['cake', '', ''],
                  ['bike', '', ''],
                  ['rope', '', ''],
                  ['mute', '', ''],
                  ['these', '', ''],
                  ['flame', '', ''],
                  ['stripe', '', ''],
                  ['quote', '', ''],
                ]}
              />
            </div>
            <div className="mt-3 text-right"><ScoreBadge label="Score: ___ / 8" /></div>
          </div>

          {/* 1G: Vowel Teams */}
          <div>
            <SubHeader>1G. Vowel Teams</SubHeader>
            <Prompt>Say: &ldquo;Read each word aloud.&rdquo;</Prompt>
            <div className="mt-3">
              <AssessmentTable
                headers={['Word', 'Vowel Team', 'Response', '+/SC/\u2014']}
                rows={[
                  ['rain', 'ai', '', ''],
                  ['play', 'ay', '', ''],
                  ['seed', 'ee', '', ''],
                  ['beach', 'ea', '', ''],
                  ['boat', 'oa', '', ''],
                  ['snow', 'ow (long o)', '', ''],
                  ['coin', 'oi', '', ''],
                  ['toy', 'oy', '', ''],
                  ['cloud', 'ou', '', ''],
                  ['paw', 'aw', '', ''],
                ]}
              />
            </div>
            <div className="mt-3 text-right"><ScoreBadge label="Score: ___ / 10" /></div>
          </div>

          {/* 1H: R-Controlled Vowels */}
          <div>
            <SubHeader>1H. R-Controlled Vowels</SubHeader>
            <Prompt>Say: &ldquo;Read each word aloud.&rdquo;</Prompt>
            <div className="mt-3">
              <AssessmentTable
                headers={['Word', 'Pattern', 'Response', '+/SC/\u2014']}
                rows={[
                  ['shark', 'ar', '', ''],
                  ['storm', 'or', '', ''],
                  ['fern', 'er', '', ''],
                  ['bird', 'ir', '', ''],
                  ['church', 'ur', '', ''],
                  ['market', 'ar (multisyllabic)', '', ''],
                  ['border', 'or + er', '', ''],
                  ['thirsty', 'ir (multisyllabic)', '', ''],
                ]}
              />
            </div>
            <div className="mt-3 text-right"><ScoreBadge label="Score: ___ / 8" /></div>
          </div>

          {/* 1I: Multisyllabic Words */}
          <div>
            <SubHeader>1I. Multisyllabic Words</SubHeader>
            <Prompt>Say: &ldquo;Read each word aloud. Take your time &mdash; you can break the word into parts if that helps.&rdquo;</Prompt>
            <div className="mt-3">
              <AssessmentTable
                headers={['Word', 'Syllable Types', 'Response', '+/SC/\u2014']}
                rows={[
                  ['rabbit', 'VCCV (closed + closed)', '', ''],
                  ['napkin', 'VCCV (closed + closed)', '', ''],
                  ['open', 'VCV (open + closed)', '', ''],
                  ['basket', 'VCCV (closed + closed)', '', ''],
                  ['sunrise', 'compound (closed + VCe)', '', ''],
                  ['table', 'consonant-le', '', ''],
                  ['reptile', 'closed + VCe', '', ''],
                  ['important', '3 syllables', '', ''],
                  ['understand', '3 syllables', '', ''],
                  ['impossible', '4 syllables (prefix)', '', ''],
                ]}
              />
            </div>
            <div className="mt-3 text-right"><ScoreBadge label="Score: ___ / 10" /></div>
          </div>

          {/* 1J: Morphology */}
          <div>
            <SubHeader>1J. Morphology (Prefixes &amp; Suffixes)</SubHeader>
            <Prompt>Say: &ldquo;Read each word. Then tell me what it means.&rdquo;</Prompt>
            <div className="mt-3">
              <AssessmentTable
                headers={['Word', 'Affix', 'Read +/\u2014', 'Meaning +/\u2014']}
                rows={[
                  ['unhappy', 'un-', '', ''],
                  ['redo', 're-', '', ''],
                  ['helpful', '-ful', '', ''],
                  ['careless', '-less', '', ''],
                  ['quickly', '-ly', '', ''],
                  ['dislike', 'dis-', '', ''],
                  ['preview', 'pre-', '', ''],
                  ['kindness', '-ness', '', ''],
                ]}
              />
            </div>
            <div className="mt-3 flex justify-end gap-3">
              <ScoreBadge label="Reading: ___ / 8" />
              <ScoreBadge label="Meaning: ___ / 8" />
            </div>
          </div>

          {/* Phonics Screener Summary */}
          <div className="border-t-2 border-forest/10 pt-6">
            <SubHeader>Phonics Screener Summary</SubHeader>
            <SummaryTable
              headers={['Skill Area', 'Score', 'Mastery (80%+)', 'Instructional', 'Frustration']}
              rows={[
                ['Consonant Sounds', '/20', '', '', ''],
                ['Short Vowels', '/5', '', '', ''],
                ['CVC Words', '/10', '', '', ''],
                ['Blends', '/10', '', '', ''],
                ['Digraphs', '/8', '', '', ''],
                ['Silent-e (VCe)', '/8', '', '', ''],
                ['Vowel Teams', '/10', '', '', ''],
                ['R-Controlled', '/8', '', '', ''],
                ['Multisyllabic', '/10', '', '', ''],
                ['Morphology (Reading)', '/8', '', '', ''],
                ['Morphology (Meaning)', '/8', '', '', ''],
              ]}
            />
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-1">OG Entry Point Recommendation</p>
                <div className="border-b-2 border-dashed border-border h-6" />
              </div>
              <div>
                <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-1">Notes / Observations</p>
                <div className="border-b-2 border-dashed border-border h-6 mb-2" />
                <div className="border-b-2 border-dashed border-border h-6" />
              </div>
            </div>
          </div>
        </Section>

        {/* ============================================================ */}
        {/*  SECTION 2: Oral Reading Fluency (ORF)                        */}
        {/* ============================================================ */}
        <Section title="Section 2: Oral Reading Fluency (ORF)" icon="&#x1F4D6;">
          <div className="bg-cream-deep/60 rounded-xl px-4 py-3 text-sm text-warm-gray space-y-1">
            <p><span className="font-semibold text-text">Purpose:</span> Establish baseline WCPM (words correct per minute) and accuracy rate</p>
            <p><span className="font-semibold text-text">Materials:</span> Grade-level passage, timer, recording sheet</p>
          </div>

          <div className="bg-cream-deep/60 rounded-xl px-4 py-3 text-sm text-warm-gray">
            <p className="font-semibold text-text mb-2">Administration:</p>
            <ol className="list-decimal list-inside space-y-1 text-xs leading-relaxed">
              <li>Provide the student with a clean copy of the passage (no markings)</li>
              <li>Say: &ldquo;I&rsquo;d like you to read this story aloud. Read it the best you can. If you come to a word you don&rsquo;t know, try your best and then keep going. Ready? Begin.&rdquo;</li>
              <li>Start the timer when the student reads the first word</li>
              <li>Follow along on your copy &mdash; mark errors using standard conventions</li>
              <li>At 1 minute, mark the last word read with a bracket</li>
              <li>Allow the student to finish the passage for comprehension assessment</li>
            </ol>
          </div>

          {/* Error Marking Key */}
          <div>
            <SubHeader>Error Marking Key</SubHeader>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Line through word', meaning: 'Substitution', color: 'bg-red-50 text-red-700' },
                { label: 'Circle', meaning: 'Omission', color: 'bg-amber-light text-amber' },
                { label: 'Caret (^)', meaning: 'Insertion', color: 'bg-blue-50 text-blue-700' },
                { label: 'SC', meaning: 'Self-correction (NOT an error)', color: 'bg-sage-pale text-forest' },
                { label: 'T', meaning: 'Teacher-provided (3-sec wait)', color: 'bg-purple-50 text-purple-700' },
              ].map((item) => (
                <span key={item.label} className={`${item.color} text-xs font-semibold px-2.5 py-1 rounded-full`}>
                  {item.label} = {item.meaning}
                </span>
              ))}
            </div>
          </div>

          {/* Passage */}
          <div>
            <SubHeader>ORF Passage A &mdash; Grade 3 Level: &ldquo;The Garden Project&rdquo;</SubHeader>
            <div className="bg-white border border-border rounded-xl p-5 text-sm text-text leading-relaxed space-y-3 print:border-2">
              <p>Last spring, our class decided to build a garden behind the school. Our teacher, Ms. Ruiz, said it would be a great way to learn about plants and science. Everyone was excited, but nobody knew where to start.</p>
              <p>First, we had to pick the right spot. We walked around the school and found a sunny patch of dirt near the fence. Then we measured the area with a long tape. It was twelve feet wide and eight feet long.</p>
              <p>The next week, we planted seeds for tomatoes, peppers, and sunflowers. Each student got to plant three seeds in a small cup. We watered them every day and put them by the window where they could get light.</p>
              <p>After two weeks, tiny green sprouts began to push through the soil. It felt like magic. We moved the strongest plants outside into the garden. By June, the sunflowers were almost as tall as we were.</p>
              <p>On the last day of school, we picked the first ripe tomato. Ms. Ruiz cut it into slices so everyone could taste it. It was the best tomato any of us had ever eaten. We couldn&rsquo;t wait to check on the garden when we came back in the fall.</p>
            </div>
            <p className="text-xs text-text-muted mt-2 font-semibold">Total words in passage: 196</p>
          </div>

          {/* ORF Recording Sheet */}
          <div>
            <SubHeader>ORF Recording Sheet</SubHeader>
            <AssessmentTable
              headers={['Metric', 'Value']}
              rows={[
                ['Total Words Read in 1 Minute', ''],
                ['Total Errors in 1 Minute', ''],
                ['Words Correct Per Minute (WCPM)', 'Total Words \u2014 Errors = ___'],
                ['Accuracy Rate', '(WCPM / Total Words Read) x 100 = ___%'],
              ]}
            />
          </div>

          {/* Fluency Benchmarks */}
          <div>
            <SubHeader>Fluency Benchmarks (Grade 3, Spring/Summer)</SubHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse print:text-xs">
                <thead>
                  <tr>
                    <th className="bg-forest text-white font-semibold text-left px-3 py-2 rounded-tl-lg text-xs uppercase tracking-wider">Level</th>
                    <th className="bg-forest text-white font-semibold text-left px-3 py-2 text-xs uppercase tracking-wider">WCPM Range</th>
                    <th className="bg-forest text-white font-semibold text-left px-3 py-2 rounded-tr-lg text-xs uppercase tracking-wider">Accuracy</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { level: 'Above Benchmark', wcpm: '120+', accuracy: '97%+', color: 'bg-sage-pale text-forest' },
                    { level: 'Benchmark', wcpm: '90\u2013119', accuracy: '95%+', color: 'bg-sage-pale/50 text-forest' },
                    { level: 'Below Benchmark', wcpm: '60\u201389', accuracy: '90\u201394%', color: 'bg-amber-light text-amber' },
                    { level: 'Well Below', wcpm: '<60', accuracy: '<90%', color: 'bg-red-50 text-red-700' },
                  ].map((row, ri) => (
                    <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-cream-deep/40'}>
                      <td className="px-3 py-2 border-b border-border">
                        <LevelBadge label={row.level} color={row.color} />
                      </td>
                      <td className="px-3 py-2 border-b border-border font-semibold text-text">{row.wcpm}</td>
                      <td className="px-3 py-2 border-b border-border text-warm-gray">{row.accuracy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* NAEP Prosody Scale */}
          <div>
            <SubHeader>NAEP Oral Reading Fluency Scale (Prosody)</SubHeader>
            <RubricTable
              rows={[
                { score: '4', description: 'Reads primarily in larger, meaningful phrase groups. Reads with expression and appropriate phrasing. Pace is consistent and conversational.' },
                { score: '3', description: 'Reads primarily in 3- or 4-word phrase groups. Some expression. Mostly appropriate phrasing with occasional mid-sentence pauses.' },
                { score: '2', description: 'Reads primarily in 2-word phrases with some 3- or 4-word groups. Little expression. Frequent pauses and word-by-word reading in places.' },
                { score: '1', description: 'Reads primarily word-by-word. Occasional 2-word phrases. No expression. Frequent extended pauses, sound-outs, and hesitations.' },
              ]}
            />
            <div className="mt-3 text-right"><ScoreBadge label="Prosody: ___ / 4" /></div>
          </div>

          {/* Retelling Rubric */}
          <div>
            <SubHeader>Retelling Rubric</SubHeader>
            <Prompt>After the student finishes reading the entire passage, say: &ldquo;Tell me about what you just read. Start from the beginning.&rdquo;</Prompt>
            <div className="mt-3">
              <AssessmentTable
                headers={['Element', '0 \u2014 Not Present', '1 \u2014 Partial', '2 \u2014 Complete']}
                rows={[
                  ['Characters (class, Ms. Ruiz)', '', '', ''],
                  ['Setting (school, garden)', '', '', ''],
                  ['Key Events in Sequence', '', '', ''],
                  ['Details (types of plants, measurements, etc.)', '', '', ''],
                  ['Conclusion/Ending', '', '', ''],
                ]}
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex gap-3">
                <LevelBadge label="Independent (8\u201310)" color="bg-sage-pale text-forest" />
                <LevelBadge label="Instructional (5\u20137)" color="bg-amber-light text-amber" />
                <LevelBadge label="Frustration (0\u20134)" color="bg-red-50 text-red-700" />
              </div>
              <ScoreBadge label="Retelling: ___ / 10" />
            </div>
          </div>
        </Section>

        {/* ============================================================ */}
        {/*  SECTION 3: Sight Word Inventory                              */}
        {/* ============================================================ */}
        <Section title="Section 3: Sight Word Inventory" icon="&#x1F441;">
          <div className="bg-cream-deep/60 rounded-xl px-4 py-3 text-sm text-warm-gray space-y-1">
            <p><span className="font-semibold text-text">Purpose:</span> Assess automatic recognition of high-frequency words across tiers</p>
            <p><span className="font-semibold text-text">Administration:</span> Show each word for 3 seconds. Mark <strong>+</strong> if read automatically and correctly. Mark <strong>&mdash;</strong> if hesitant (&gt;3 seconds), sounded out, or incorrect.</p>
          </div>

          {/* Tier 1 */}
          <div>
            <SubHeader>Tier 1 &mdash; Fry Words 1&ndash;100 (Most Frequent)</SubHeader>
            <p className="text-xs text-text-muted italic mb-3">These should be automatic by Grade 2. Missing words indicate foundational gaps.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse print:text-xs">
                <thead>
                  <tr>
                    {['Word', '+/\u2014', 'Word', '+/\u2014', 'Word', '+/\u2014', 'Word', '+/\u2014'].map((h, i) => (
                      <th key={i} className={`bg-forest text-white font-semibold text-left px-3 py-2 text-xs uppercase tracking-wider ${i === 0 ? 'rounded-tl-lg' : ''} ${i === 7 ? 'rounded-tr-lg' : ''} ${i % 2 === 0 ? 'border-l border-white/10' : ''}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['the', 'said', 'many', 'about'],
                    ['was', 'have', 'then', 'would'],
                    ['are', 'from', 'them', 'could'],
                    ['were', 'some', 'these', 'should'],
                    ['they', 'come', 'other', 'people'],
                    ['what', 'been', 'water', 'again'],
                    ['there', 'their', 'which', 'because'],
                    ['where', 'does', 'first', 'through'],
                    ['one', 'gone', 'your', 'thought'],
                    ['two', 'only', 'know', 'enough'],
                  ].map((row, ri) => (
                    <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-cream-deep/40'}>
                      {row.map((word, ci) => (
                        <>
                          <td key={`w${ci}`} className="px-3 py-2 border-b border-border font-semibold text-text">{word}</td>
                          <td key={`s${ci}`} className="px-3 py-2 border-b border-border text-warm-gray w-12"></td>
                        </>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 text-right"><ScoreBadge label="Score: ___ / 40" /></div>
          </div>

          {/* Tier 2 */}
          <div>
            <SubHeader>Tier 2 &mdash; OG Red Words (Irregular Patterns)</SubHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse print:text-xs">
                <thead>
                  <tr>
                    {['Word', '+/\u2014', 'Word', '+/\u2014', 'Word', '+/\u2014'].map((h, i) => (
                      <th key={i} className={`bg-forest text-white font-semibold text-left px-3 py-2 text-xs uppercase tracking-wider ${i === 0 ? 'rounded-tl-lg' : ''} ${i === 5 ? 'rounded-tr-lg' : ''}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['laugh', 'island', 'beautiful'],
                    ['caught', 'science', 'different'],
                    ['bought', 'special', 'important'],
                    ['answer', 'listen', 'probably'],
                    ['often', 'friend', 'suddenly'],
                  ].map((row, ri) => (
                    <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-cream-deep/40'}>
                      {row.map((word, ci) => (
                        <>
                          <td key={`w${ci}`} className="px-3 py-2 border-b border-border font-semibold text-text">{word}</td>
                          <td key={`s${ci}`} className="px-3 py-2 border-b border-border text-warm-gray w-12"></td>
                        </>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 text-right"><ScoreBadge label="Score: ___ / 15" /></div>
          </div>

          {/* Tier 3 */}
          <div>
            <SubHeader>Tier 3 &mdash; Grade 3&ndash;4 Academic Vocabulary</SubHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse print:text-xs">
                <thead>
                  <tr>
                    {['Word', '+/\u2014', 'Word', '+/\u2014', 'Word', '+/\u2014'].map((h, i) => (
                      <th key={i} className={`bg-forest text-white font-semibold text-left px-3 py-2 text-xs uppercase tracking-wider ${i === 0 ? 'rounded-tl-lg' : ''} ${i === 5 ? 'rounded-tr-lg' : ''}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['paragraph', 'information', 'character'],
                    ['direction', 'temperature', 'experience'],
                    ['imagine', 'multiply', 'example'],
                    ['describe', 'fraction', 'separate'],
                    ['question', 'measure', 'remember'],
                  ].map((row, ri) => (
                    <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-cream-deep/40'}>
                      {row.map((word, ci) => (
                        <>
                          <td key={`w${ci}`} className="px-3 py-2 border-b border-border font-semibold text-text">{word}</td>
                          <td key={`s${ci}`} className="px-3 py-2 border-b border-border text-warm-gray w-12"></td>
                        </>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 text-right"><ScoreBadge label="Score: ___ / 15" /></div>
          </div>

          {/* Sight Word Summary */}
          <div className="border-t-2 border-forest/10 pt-6">
            <SubHeader>Sight Word Summary</SubHeader>
            <SummaryTable
              headers={['Tier', 'Score', 'Mastery (90%+)', 'Developing (70\u201389%)', 'Needs Instruction (<70%)']}
              rows={[
                ['Tier 1 (Fry 1\u2013100)', '/40', '', '', ''],
                ['Tier 2 (OG Red Words)', '/15', '', '', ''],
                ['Tier 3 (Academic Vocab)', '/15', '', '', ''],
                ['Total', '/70', '', '', ''],
              ]}
            />
          </div>
        </Section>

        {/* ============================================================ */}
        {/*  SECTION 4: Writing Prompt + Rubric                           */}
        {/* ============================================================ */}
        <Section title="Section 4: Writing Prompt + Rubric" icon="&#x270F;&#xFE0F;">
          <div className="bg-cream-deep/60 rounded-xl px-4 py-3 text-sm text-warm-gray space-y-1">
            <p><span className="font-semibold text-text">Purpose:</span> Establish baseline for written expression &mdash; ideas, organization, conventions, sentence structure</p>
            <p><span className="font-semibold text-text">Administration:</span> Read the prompt aloud. Student may plan on scratch paper before writing. Allow 20 minutes. Do not provide spelling assistance.</p>
          </div>

          {/* Writing Prompt */}
          <div>
            <SubHeader>Writing Prompt</SubHeader>
            <Prompt>
              Say: &ldquo;I&rsquo;d like you to write about something that happened to you. Think of a time you tried something new or did something you were proud of. Tell me the story &mdash; what happened, how you felt, and why it mattered to you. Try your best with spelling and punctuation. You have 20 minutes.&rdquo;
            </Prompt>
            <p className="text-xs text-text-muted mt-2">Provide: lined paper, pencil, scratch paper for planning</p>
          </div>

          {/* Writing Sample Analysis */}
          <div>
            <SubHeader>Writing Sample Analysis</SubHeader>
            <AssessmentTable
              headers={['Feature', 'Tally / Notes']}
              rows={[
                ['Total words written', ''],
                ['Total sentences', ''],
                ['Average words per sentence', ''],
                ['Spelling errors (list below)', ''],
                ['Capitalization errors', ''],
                ['Punctuation errors', ''],
                ['Evidence of planning (yes/no)', ''],
              ]}
            />
          </div>

          {/* Spelling Error Analysis */}
          <div>
            <SubHeader>Spelling Error Analysis</SubHeader>
            <AssessmentTable
              headers={['Misspelled Word', 'Student Spelling', 'Error Pattern']}
              rows={[
                ['', '', ''],
                ['', '', ''],
                ['', '', ''],
                ['', '', ''],
                ['', '', ''],
              ]}
            />
          </div>

          {/* Ideas & Content */}
          <div>
            <SubHeader>Ideas &amp; Content</SubHeader>
            <RubricTable
              rows={[
                { score: '4', description: 'Clear, focused topic. Relevant details that bring the story to life. Reader can picture the events.' },
                { score: '3', description: 'Clear topic with some supporting details. Mostly makes sense but could use more description.' },
                { score: '2', description: 'Topic is present but unclear. Few details. Hard to follow in places.' },
                { score: '1', description: 'No clear topic. Random or disconnected ideas. Very little content.' },
              ]}
            />
            <div className="mt-3 text-right"><ScoreBadge label="Ideas: ___ / 4" /></div>
          </div>

          {/* Organization */}
          <div>
            <SubHeader>Organization</SubHeader>
            <RubricTable
              rows={[
                { score: '4', description: 'Clear beginning, middle, and end. Events in logical order. Transition words used (first, then, next, finally).' },
                { score: '3', description: 'Has a beginning and ending. Mostly in order. Some transition words.' },
                { score: '2', description: 'Attempts order but events are jumbled. No clear beginning or ending.' },
                { score: '1', description: 'No organizational structure. Events are random.' },
              ]}
            />
            <div className="mt-3 text-right"><ScoreBadge label="Organization: ___ / 4" /></div>
          </div>

          {/* Conventions */}
          <div>
            <SubHeader>Conventions (Spelling, Punctuation, Capitalization)</SubHeader>
            <RubricTable
              rows={[
                { score: '4', description: 'Few errors. Correct end punctuation, capitals at sentence start, most grade-level words spelled correctly.' },
                { score: '3', description: 'Some errors but they don\'t interfere with reading. Inconsistent capitalization or punctuation.' },
                { score: '2', description: 'Frequent errors that sometimes interfere with reading. Many spelling errors, missing punctuation.' },
                { score: '1', description: 'Errors throughout that make the writing very difficult to read.' },
              ]}
            />
            <div className="mt-3 text-right"><ScoreBadge label="Conventions: ___ / 4" /></div>
          </div>

          {/* Sentence Structure */}
          <div>
            <SubHeader>Sentence Structure</SubHeader>
            <RubricTable
              rows={[
                { score: '4', description: 'Varied sentence types (simple and compound). Complete sentences. Reads smoothly.' },
                { score: '3', description: 'Mostly complete sentences. Some variety. Occasional run-ons or fragments.' },
                { score: '2', description: 'Many simple sentences (subject-verb). Several run-ons or fragments. Repetitive structure.' },
                { score: '1', description: 'Incomplete thoughts. Hard to identify sentence boundaries. Very limited.' },
              ]}
            />
            <div className="mt-3 text-right"><ScoreBadge label="Sentence Structure: ___ / 4" /></div>
          </div>

          {/* Writing Totals */}
          <div className="border-t-2 border-forest/10 pt-6 flex items-center justify-between flex-wrap gap-3">
            <ScoreBadge label="Total Writing Score: ___ / 16" />
            <div className="flex gap-3">
              <LevelBadge label="Proficient (13\u201316)" color="bg-sage-pale text-forest" />
              <LevelBadge label="Developing (9\u201312)" color="bg-amber-light text-amber" />
              <LevelBadge label="Emerging (5\u20138)" color="bg-orange-50 text-orange-700" />
              <LevelBadge label="Beginning (4)" color="bg-red-50 text-red-700" />
            </div>
          </div>
        </Section>

        {/* ============================================================ */}
        {/*  SECTION 5: Math Diagnostic                                   */}
        {/* ============================================================ */}
        <Section title="Section 5: Math Diagnostic" icon="&#x1F522;">
          <div className="bg-cream-deep/60 rounded-xl px-4 py-3 text-sm text-warm-gray space-y-1">
            <p><span className="font-semibold text-text">Purpose:</span> Identify strengths and gaps across Grade 3&ndash;4 math domains</p>
            <p><span className="font-semibold text-text">Administration:</span> Read word problems aloud if needed. Provide scratch paper. No time limit on Sections A&ndash;D. Section E is timed (2 minutes).</p>
          </div>

          {/* 5A: Place Value */}
          <div>
            <SubHeader>5A. Place Value</SubHeader>
            <Prompt>Say: &ldquo;Let&rsquo;s work on some number problems.&rdquo;</Prompt>
            <div className="mt-3 space-y-4">
              {[
                { num: '1', q: 'Write the number four thousand, three hundred and twelve in standard form.' },
                { num: '2', q: 'In the number 5,847, what is the value of the 8?' },
                { num: '3', q: 'Round 3,672 to the nearest hundred.' },
                { num: '4', q: 'Write these numbers in order from least to greatest: 4,209 \u2014 4,290 \u2014 4,029 \u2014 4,920' },
                { num: '5', q: 'What number is 1,000 more than 6,385?' },
              ].map((item) => (
                <div key={item.num} className="flex items-start gap-3 bg-white border border-border rounded-xl px-4 py-3">
                  <span className="bg-forest text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">{item.num}</span>
                  <div className="flex-1">
                    <p className="text-sm text-text">{item.q}</p>
                    <div className="border-b-2 border-dashed border-border h-6 mt-2" />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-right"><ScoreBadge label="Score: ___ / 5" /></div>
          </div>

          {/* 5B: Computation */}
          <div>
            <SubHeader>5B. Computation</SubHeader>

            <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-2">Addition &amp; Subtraction</p>
            <AssessmentTable
              headers={['Problem', 'Student Answer', 'Correct?', 'Work Shown?']}
              rows={[
                ['347 + 285 =', '', '', ''],
                ['1,504 + 2,378 =', '', '', ''],
                ['603 \u2014 247 =', '', '', ''],
                ['5,010 \u2014 1,836 =', '', '', ''],
              ]}
            />
            <div className="mt-3 text-right"><ScoreBadge label="Score: ___ / 4" /></div>

            <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-2 mt-6">Multiplication</p>
            <AssessmentTable
              headers={['Problem', 'Student Answer', 'Correct?', 'Work Shown?']}
              rows={[
                ['6 x 7 =', '', '', ''],
                ['8 x 4 =', '', '', ''],
                ['9 x 3 =', '', '', ''],
                ['12 x 5 =', '', '', ''],
                ['23 x 4 =', '', '', ''],
              ]}
            />
            <div className="mt-3 text-right"><ScoreBadge label="Score: ___ / 5" /></div>

            <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-2 mt-6">Division</p>
            <AssessmentTable
              headers={['Problem', 'Student Answer', 'Correct?', 'Work Shown?']}
              rows={[
                ['36 \u00f7 6 =', '', '', ''],
                ['45 \u00f7 9 =', '', '', ''],
                ['56 \u00f7 8 =', '', '', ''],
                ['72 \u00f7 4 =', '', '', ''],
              ]}
            />
            <div className="mt-3 text-right"><ScoreBadge label="Score: ___ / 4" /></div>
          </div>

          {/* 5C: Fractions */}
          <div>
            <SubHeader>5C. Fractions</SubHeader>
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-white border border-border rounded-xl px-4 py-3">
                <span className="bg-forest text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">1</span>
                <div className="flex-1">
                  <p className="text-sm text-text">What fraction of this shape is shaded?</p>
                  <div className="flex gap-1 mt-2 mb-2">
                    {[true, true, true, false].map((shaded, i) => (
                      <div key={i} className={`w-12 h-8 border-2 border-forest rounded ${shaded ? 'bg-sage' : 'bg-white'}`} />
                    ))}
                  </div>
                  <div className="border-b-2 border-dashed border-border h-6" />
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white border border-border rounded-xl px-4 py-3">
                <span className="bg-forest text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">2</span>
                <div className="flex-1">
                  <p className="text-sm text-text">Place the fraction 1/2 on this number line.</p>
                  <div className="flex items-center gap-2 mt-2 mb-2">
                    <span className="text-xs font-semibold text-text">0</span>
                    <div className="flex-1 h-0.5 bg-forest relative">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-forest rounded-full" />
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-forest rounded-full" />
                    </div>
                    <span className="text-xs font-semibold text-text">1</span>
                  </div>
                </div>
              </div>

              {[
                { num: '3', q: 'Which is greater: 2/4 or 3/4? Explain how you know.' },
                { num: '4', q: 'Name two fractions that are equal to 1/2.' },
                { num: '5', q: 'Circle the larger fraction: 1/3 or 1/6. How do you know?' },
              ].map((item) => (
                <div key={item.num} className="flex items-start gap-3 bg-white border border-border rounded-xl px-4 py-3">
                  <span className="bg-forest text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">{item.num}</span>
                  <div className="flex-1">
                    <p className="text-sm text-text">{item.q}</p>
                    <div className="border-b-2 border-dashed border-border h-6 mt-2" />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-right"><ScoreBadge label="Score: ___ / 5" /></div>
          </div>

          {/* 5D: Word Problems */}
          <div>
            <SubHeader>5D. Word Problems</SubHeader>
            <div className="space-y-4">
              {[
                { num: '1', q: 'Maria has 248 stickers. She gives 75 stickers to her friend. Then she buys 120 more stickers at the store. How many stickers does Maria have now?' },
                { num: '2', q: 'A classroom has 6 rows of desks. Each row has 5 desks. How many desks are in the classroom?' },
                { num: '3', q: 'Mr. Chen has 36 pencils. He wants to divide them equally among 4 students. How many pencils does each student get?' },
                { num: '4', q: 'Sofia is reading a book with 312 pages. She has read 187 pages so far. How many pages does she have left?' },
                { num: '5', q: 'A recipe needs 3/4 cup of flour. Tyler says he needs more flour than if the recipe said 3/8 cup. Is Tyler correct? Explain.' },
              ].map((item) => (
                <div key={item.num} className="flex items-start gap-3 bg-white border border-border rounded-xl px-4 py-3">
                  <span className="bg-forest text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">{item.num}</span>
                  <div className="flex-1">
                    <p className="text-sm text-text">{item.q}</p>
                    <div className="border-b-2 border-dashed border-border h-6 mt-2" />
                    <p className="text-xs text-text-muted mt-1">Work:</p>
                    <div className="border-b-2 border-dashed border-border h-10" />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-right"><ScoreBadge label="Score: ___ / 5" /></div>
          </div>

          {/* 5E: Computation Fluency Probe */}
          <div>
            <SubHeader>5E. Computation Fluency Probe (2 Minutes)</SubHeader>
            <Prompt>Say: &ldquo;I&rsquo;m going to give you a sheet of math problems. You will have 2 minutes to answer as many as you can. Start at the top and work across each row. If you get stuck, skip it and move on. Ready? Begin.&rdquo;</Prompt>
            <div className="mt-3">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse print:text-xs">
                  <tbody>
                    {[
                      ['7 + 8 =', '15 \u2014 9 =', '6 x 3 =', '24 \u00f7 6 =', '14 + 7 ='],
                      ['12 \u2014 5 =', '4 x 8 =', '35 \u00f7 5 =', '9 + 6 =', '20 \u2014 13 ='],
                      ['7 x 9 =', '42 \u00f7 7 =', '8 + 9 =', '16 \u2014 8 =', '5 x 5 ='],
                      ['48 \u00f7 8 =', '11 + 12 =', '23 \u2014 7 =', '3 x 7 =', '54 \u00f7 9 ='],
                    ].map((row, ri) => (
                      <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-cream-deep/40'}>
                        {row.map((cell, ci) => (
                          <td key={ci} className="px-4 py-3 border border-border text-center font-semibold text-text">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-3 flex justify-end gap-3">
              <ScoreBadge label="Attempted: ___ / 20" />
              <ScoreBadge label="Correct: ___ / 20" />
            </div>
          </div>

          {/* Math Diagnostic Summary */}
          <div className="border-t-2 border-forest/10 pt-6">
            <SubHeader>Math Diagnostic Summary</SubHeader>
            <SummaryTable
              headers={['Domain', 'Score', 'Mastery (80%+)', 'Developing (60\u201379%)', 'Needs Instruction (<60%)']}
              rows={[
                ['Place Value', '/5', '', '', ''],
                ['Addition/Subtraction', '/4', '', '', ''],
                ['Multiplication', '/5', '', '', ''],
                ['Division', '/4', '', '', ''],
                ['Fractions', '/5', '', '', ''],
                ['Word Problems', '/5', '', '', ''],
                ['Computation Fluency', '/20', '', '', ''],
              ]}
            />
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-1">Math Strengths</p>
                <div className="border-b-2 border-dashed border-border h-6" />
              </div>
              <div>
                <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-1">Priority Instructional Areas</p>
                <div className="border-b-2 border-dashed border-border h-6" />
              </div>
            </div>
          </div>
        </Section>

        {/* ============================================================ */}
        {/*  SECTION 6: Student Interest Survey                           */}
        {/* ============================================================ */}
        <Section title="Section 6: Student Interest Survey" icon="&#x1F31F;">
          <div className="bg-cream-deep/60 rounded-xl px-4 py-3 text-sm text-warm-gray space-y-1">
            <p><span className="font-semibold text-text">Purpose:</span> Build rapport, identify learning preferences, and set goals together</p>
            <p><span className="font-semibold text-text">Administration:</span> Read questions aloud if needed. Student may write or dictate responses.</p>
          </div>

          {/* About Me */}
          <div>
            <SubHeader>About Me</SubHeader>
            <div className="space-y-3">
              {[
                'My name is:',
                'My favorite thing to do outside of school is:',
                'If I could learn about anything this summer, I\'d want to learn about:',
              ].map((label) => (
                <div key={label}>
                  <p className="text-sm text-text font-semibold mb-1">{label}</p>
                  <div className="border-b-2 border-dashed border-border h-6" />
                </div>
              ))}
            </div>
          </div>

          {/* School & Learning */}
          <div>
            <SubHeader>School &amp; Learning</SubHeader>
            <div className="space-y-4">
              {[
                { num: '1', q: 'My favorite subject in school is:' },
                { num: '2', q: 'The subject I find hardest is:' },
                { num: '3', q: 'When I\'m reading and I get stuck on a word, I usually:' },
              ].map((item) => (
                <div key={item.num} className="flex items-start gap-3">
                  <span className="bg-forest-light text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">{item.num}</span>
                  <div className="flex-1">
                    <p className="text-sm text-text">{item.q}</p>
                    <div className="border-b-2 border-dashed border-border h-6 mt-1" />
                  </div>
                </div>
              ))}

              {/* Q4: Book preferences */}
              <div className="flex items-start gap-3">
                <span className="bg-forest-light text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">4</span>
                <div className="flex-1">
                  <p className="text-sm text-text mb-2">The kind of books I like best are (circle all that apply):</p>
                  <div className="flex flex-wrap gap-2">
                    {['Funny books', 'Adventure/action', 'Animals/nature', 'Sports', 'Graphic novels/comics', 'Science/space', 'History', 'Mystery', 'Fantasy/magic', 'True stories about real people'].map((opt) => (
                      <span key={opt} className="bg-sage-pale text-forest text-xs font-semibold px-3 py-1.5 rounded-full">{opt}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Q5: Writing feelings */}
              <div className="flex items-start gap-3">
                <span className="bg-forest-light text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">5</span>
                <div className="flex-1">
                  <p className="text-sm text-text mb-2">When I have to write, I feel: (circle one)</p>
                  <div className="flex flex-wrap gap-2">
                    {['Great!', 'Okay', 'Not so great', 'I really don\'t like it'].map((opt) => (
                      <span key={opt} className="bg-cream-deep text-text text-xs font-semibold px-3 py-1.5 rounded-full border border-border">{opt}</span>
                    ))}
                  </div>
                </div>
              </div>

              {[
                { num: '6', q: 'The hardest part about writing for me is:' },
                { num: '7', q: 'In math, I feel most confident when I\'m doing:' },
                { num: '8', q: 'In math, I feel least confident when I\'m doing:' },
              ].map((item) => (
                <div key={item.num} className="flex items-start gap-3">
                  <span className="bg-forest-light text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">{item.num}</span>
                  <div className="flex-1">
                    <p className="text-sm text-text">{item.q}</p>
                    <div className="border-b-2 border-dashed border-border h-6 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How I Learn Best */}
          <div>
            <SubHeader>How I Learn Best</SubHeader>
            <div className="space-y-4">
              {/* Q9 */}
              <div className="flex items-start gap-3">
                <span className="bg-forest-light text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">9</span>
                <div className="flex-1">
                  <p className="text-sm text-text mb-2">I learn best when: (circle all that apply)</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'I can see pictures or videos',
                      'Someone explains it to me out loud',
                      'I can touch or move things around',
                      'I work with a partner',
                      'I work by myself',
                      'I can draw it',
                      'I can talk about it with someone',
                    ].map((opt) => (
                      <span key={opt} className="bg-sage-pale text-forest text-xs font-semibold px-3 py-1.5 rounded-full">{opt}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Q10 */}
              <div className="flex items-start gap-3">
                <span className="bg-forest-light text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">10</span>
                <div className="flex-1">
                  <p className="text-sm text-text mb-2">When something is hard, I usually: (circle one)</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Keep trying on my own',
                      'Ask for help right away',
                      'Get frustrated and want to stop',
                      'Take a break and come back to it',
                    ].map((opt) => (
                      <span key={opt} className="bg-cream-deep text-text text-xs font-semibold px-3 py-1.5 rounded-full border border-border">{opt}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Q11 */}
              <div className="flex items-start gap-3">
                <span className="bg-forest-light text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">11</span>
                <div className="flex-1">
                  <p className="text-sm text-text mb-2">I work best when the room is: (circle one)</p>
                  <div className="flex flex-wrap gap-2">
                    {['Quiet', 'A little noise is okay', 'I don\'t mind noise'].map((opt) => (
                      <span key={opt} className="bg-cream-deep text-text text-xs font-semibold px-3 py-1.5 rounded-full border border-border">{opt}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* My Goals */}
          <div>
            <SubHeader>My Goals</SubHeader>
            <div className="space-y-4">
              {[
                { num: '12', q: 'One thing I want to get better at this summer is:' },
                { num: '13', q: 'By the end of this program, I\'ll feel proud if I can:' },
                { num: '14', q: 'Something I want my teacher to know about me is:' },
              ].map((item) => (
                <div key={item.num} className="flex items-start gap-3">
                  <span className="bg-forest-light text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">{item.num}</span>
                  <div className="flex-1">
                    <p className="text-sm text-text">{item.q}</p>
                    <div className="border-b-2 border-dashed border-border h-8 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ============================================================ */}
        {/*  PRE-ASSESSMENT SUMMARY SHEET                                 */}
        {/* ============================================================ */}
        <Section title="Pre-Assessment Summary Sheet" icon="&#x1F4CA;" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-1">Student</p>
              <div className="border-b-2 border-dashed border-border h-6" />
            </div>
            <div>
              <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-1">Date</p>
              <div className="border-b-2 border-dashed border-border h-6" />
            </div>
          </div>

          <SummaryTable
            headers={['Domain', 'Score', 'Level', 'Notes / OG Entry Point']}
            rows={[
              ['Phonics \u2014 Consonant Sounds', '/20', '', ''],
              ['Phonics \u2014 Short Vowels', '/5', '', ''],
              ['Phonics \u2014 CVC', '/10', '', ''],
              ['Phonics \u2014 Blends', '/10', '', ''],
              ['Phonics \u2014 Digraphs', '/8', '', ''],
              ['Phonics \u2014 VCe', '/8', '', ''],
              ['Phonics \u2014 Vowel Teams', '/10', '', ''],
              ['Phonics \u2014 R-Controlled', '/8', '', ''],
              ['Phonics \u2014 Multisyllabic', '/10', '', ''],
              ['Phonics \u2014 Morphology', '/8 (read) + /8 (meaning)', '', ''],
              ['ORF \u2014 WCPM', '', '', ''],
              ['ORF \u2014 Accuracy %', '', '', ''],
              ['ORF \u2014 Prosody', '/4', '', ''],
              ['ORF \u2014 Retelling', '/10', '', ''],
              ['Sight Words \u2014 Tier 1', '/40', '', ''],
              ['Sight Words \u2014 Tier 2', '/15', '', ''],
              ['Sight Words \u2014 Tier 3', '/15', '', ''],
              ['Writing \u2014 Total', '/16', '', ''],
              ['Math \u2014 Place Value', '/5', '', ''],
              ['Math \u2014 Add/Sub', '/4', '', ''],
              ['Math \u2014 Multiplication', '/5', '', ''],
              ['Math \u2014 Division', '/4', '', ''],
              ['Math \u2014 Fractions', '/5', '', ''],
              ['Math \u2014 Word Problems', '/5', '', ''],
              ['Math \u2014 Fluency Probe', '/20', '', ''],
            ]}
          />

          {/* Recommended OG Starting Point */}
          <div className="mt-6">
            <SubHeader>Recommended OG Starting Point</SubHeader>
            <ul className="space-y-2">
              {[
                'Closed Syllable (CVC, blends, digraphs) \u2014 Review/reinforcement',
                'VCe (Silent-e) \u2014 Instruction needed',
                'Vowel Teams \u2014 Instruction needed',
                'R-Controlled Vowels \u2014 Instruction needed',
                'Syllable Division / Multisyllabic \u2014 Instruction needed',
                'Morphology (Prefixes/Suffixes) \u2014 Instruction needed',
              ].map((item) => (
                <CheckItem key={item}>{item}</CheckItem>
              ))}
            </ul>
          </div>

          {/* Recommended Math Entry Focus */}
          <div>
            <SubHeader>Recommended Math Entry Focus</SubHeader>
            <ul className="space-y-2">
              {[
                'Place value & number sense',
                'Addition/subtraction with regrouping',
                'Multiplication concepts & fact fluency',
                'Division concepts',
                'Fractions',
                'Word problem strategies',
              ].map((item) => (
                <CheckItem key={item}>{item}</CheckItem>
              ))}
            </ul>
          </div>

          {/* Flexible Grouping */}
          <div className="space-y-3">
            <SubHeader>Flexible Grouping Recommendation</SubHeader>
            <div>
              <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-1">Reading Group Level</p>
              <div className="border-b-2 border-dashed border-border h-6" />
            </div>
            <div>
              <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-1">Math Group Level</p>
              <div className="border-b-2 border-dashed border-border h-6" />
            </div>
            <div>
              <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-1">IEP Goals Addressed (from student&rsquo;s IEP on file)</p>
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-text-muted font-semibold">{n}.</span>
                  <div className="flex-1 border-b-2 border-dashed border-border h-6" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-1">Assessor Signature</p>
                <div className="border-b-2 border-dashed border-border h-6" />
              </div>
              <div>
                <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-1">Date</p>
                <div className="border-b-2 border-dashed border-border h-6" />
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* Footer note */}
      <div className="mt-8 text-center text-xs text-text-muted italic px-4 print:mt-4">
        This pre-assessment battery is a component of the IEP &amp; Thrive Summer 2026 assessment system. Results should be compared directly to the parallel Post-Assessment Battery administered in Week 6 to measure growth. All data contributes to the CSE-ready final report.
      </div>
    </div>
  )
}
