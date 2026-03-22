'use client'

import { useState } from 'react'
import Link from 'next/link'

interface SectionProps {
  title: string
  icon: string
  children: React.ReactNode
  defaultOpen?: boolean
  badge?: string
}

function CollapsibleSection({ title, icon, children, defaultOpen = false, badge }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left cursor-pointer hover:bg-cream-deep/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <h3 className="font-display font-bold text-text">{title}</h3>
          {badge && (
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-sage-pale text-forest px-2.5 py-1 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-6 pb-6 border-t border-border pt-4">{children}</div>}
    </div>
  )
}

function ScoreRow({ label, total, preLabel }: { label: string; total: string; preLabel?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <span className="text-sm text-text font-medium">{label}</span>
      <div className="flex items-center gap-4">
        <span className="text-sm font-bold text-forest">_____ / {total}</span>
        <div className="bg-amber-light/60 rounded-lg px-3 py-1">
          <span className="text-xs font-semibold text-amber">Pre: _____ / {total}</span>
        </div>
      </div>
    </div>
  )
}

function AssessmentTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {headers.map((h, i) => (
              <th key={i} className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border/40 last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="py-2 px-3 text-sm text-warm-gray">
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

function SummaryComparisonRow({ domain, preMax, postMax }: { domain: string; preMax: string; postMax: string }) {
  return (
    <tr className="border-b border-border/40 last:border-0">
      <td className="py-2 px-3 text-sm text-text font-medium">{domain}</td>
      <td className="py-2 px-3 text-sm text-text-muted text-center">/{preMax}</td>
      <td className="py-2 px-3 text-sm text-forest font-semibold text-center">/{postMax}</td>
      <td className="py-2 px-3 text-sm text-text-muted text-center"></td>
      <td className="py-2 px-3 text-sm text-text-muted text-center"></td>
    </tr>
  )
}

function SubInstruction({ text }: { text: string }) {
  return (
    <p className="text-sm text-warm-gray italic mb-4 bg-cream-deep/50 rounded-xl px-4 py-3">{text}</p>
  )
}

export default function PostAssessmentPage() {
  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-text-muted mb-6">
        <Link href="/admin/curriculum" className="hover:text-forest transition-colors">
          Curriculum
        </Link>
        <span>/</span>
        <span className="text-text font-semibold">Post-Assessment Battery</span>
      </div>

      {/* Header Banner */}
      <div className="bg-forest rounded-2xl p-6 md:p-8 mb-8 text-white">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">📊</span>
              <div>
                <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">
                  Summer 2026 · Grades 3-4
                </p>
                <h1 className="font-display text-2xl font-bold">Post-Assessment Battery</h1>
              </div>
            </div>
            <p className="text-white/70 text-sm italic mt-1">
              Administered Week 6, Day 4 — Parallel forms for growth measurement
            </p>
          </div>
          <Link
            href="/admin/curriculum/assessments/pre"
            className="text-white/60 hover:text-white text-sm transition-colors"
          >
            &larr; Pre-Assessment
          </Link>
        </div>

        {/* Student info fields */}
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Assessor', 'Date', 'Student Name', 'Pre-Assessment Date'].map((field) => (
            <div key={field} className="bg-white/10 rounded-xl px-4 py-2.5">
              <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider">{field}</p>
              <p className="text-white/80 text-sm mt-0.5">_______________</p>
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Age', 'Rising Grade'].map((field) => (
            <div key={field} className="bg-white/10 rounded-xl px-4 py-2.5">
              <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider">{field}</p>
              <p className="text-white/80 text-sm mt-0.5">_______</p>
            </div>
          ))}
        </div>
      </div>

      {/* Administration Notes */}
      <div className="bg-amber-light/40 border border-amber/20 rounded-2xl p-5 mb-6">
        <h3 className="font-display font-bold text-text text-sm mb-3 flex items-center gap-2">
          <span className="text-base">📋</span> Administration Notes
        </h3>
        <ul className="space-y-2">
          {[
            'This battery is the parallel form of the Pre-Assessment Battery administered on Week 1, Day 1',
            'Items test the same skills at the same difficulty level using different words, passages, and problems',
            'Administer in the same conditions as the pre-assessment (quiet setting, same time of day if possible)',
            'This battery takes approximately 60\u201390 minutes; it may be split across Day 4 and Day 5',
            'Results are compared directly to pre-assessment scores to measure growth for the CSE-ready final report',
            'Record all observations \u2014 note strategy use, confidence, and self-correction behaviors compared to pre-assessment',
          ].map((note, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-warm-gray">
              <svg className="w-4 h-4 text-amber shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z" />
              </svg>
              {note}
            </li>
          ))}
        </ul>
      </div>

      {/* Sections */}
      <div className="space-y-4">

        {/* Section 1: Phonics Screener */}
        <CollapsibleSection title="Section 1: Phonics Screener (Form B)" icon="📖" badge="Form B" defaultOpen>
          <div className="space-y-6">
            <SubInstruction text="Student reads across each row. Mark each item: + (correct, automatic) / SC (self-corrected) / \u2014 (incorrect/no response). Record substitution if incorrect. Discontinue if student misses 4+ items in a row within a skill area." />

            {/* 1A: Consonant Sounds */}
            <div>
              <h4 className="font-display font-bold text-sm text-text mb-1">1A. Consonant Sounds (Isolation)</h4>
              <p className="text-xs text-text-muted italic mb-3">Say: &ldquo;Tell me the sound each letter makes.&rdquo;</p>
              <AssessmentTable
                headers={['Letter', 'Response', '+/SC/\u2014', 'Letter', 'Response', '+/SC/\u2014']}
                rows={[
                  ['t', '', '', 'b', '', ''],
                  ['s', '', '', 'k', '', ''],
                  ['r', '', '', 'm', '', ''],
                  ['n', '', '', 'g', '', ''],
                  ['l', '', '', 'd', '', ''],
                  ['w', '', '', 'p', '', ''],
                  ['j', '', '', 'f', '', ''],
                  ['v', '', '', 'h', '', ''],
                  ['y', '', '', 'c', '', ''],
                  ['z', '', '', 'x', '', ''],
                ]}
              />
              <div className="mt-3"><ScoreRow label="Consonant Sounds" total="20" /></div>
            </div>

            {/* 1B: Short Vowel Sounds */}
            <div>
              <h4 className="font-display font-bold text-sm text-text mb-1">1B. Short Vowel Sounds (Isolation)</h4>
              <p className="text-xs text-text-muted italic mb-3">Say: &ldquo;Tell me the short sound of each vowel.&rdquo;</p>
              <AssessmentTable
                headers={['Vowel', 'Response', '+/SC/\u2014']}
                rows={[
                  ['e (as in edge)', '', ''],
                  ['o (as in olive)', '', ''],
                  ['a (as in ant)', '', ''],
                  ['u (as in up)', '', ''],
                  ['i (as in igloo)', '', ''],
                ]}
              />
              <div className="mt-3"><ScoreRow label="Short Vowels" total="5" /></div>
            </div>

            {/* 1C: CVC Words */}
            <div>
              <h4 className="font-display font-bold text-sm text-text mb-1">1C. CVC Words (Closed Syllable \u2014 Short Vowels)</h4>
              <AssessmentTable
                headers={['Word', 'Response', '+/SC/\u2014', 'Word', 'Response', '+/SC/\u2014']}
                rows={[
                  ['dog', '', '', 'hem', '', ''],
                  ['tub', '', '', 'fix', '', ''],
                  ['cap', '', '', 'jot', '', ''],
                  ['sit', '', '', 'rug', '', ''],
                  ['web', '', '', 'nap', '', ''],
                ]}
              />
              <div className="mt-3"><ScoreRow label="CVC Words" total="10" /></div>
            </div>

            {/* 1D: Consonant Blends */}
            <div>
              <h4 className="font-display font-bold text-sm text-text mb-1">1D. Consonant Blends</h4>
              <AssessmentTable
                headers={['Word', 'Blend Tested', 'Response', '+/SC/\u2014']}
                rows={[
                  ['drum', 'dr- (initial)', '', ''],
                  ['clamp', 'cl- (initial)', '', ''],
                  ['swept', 'sw- (initial)', '', ''],
                  ['grill', 'gr- (initial)', '', ''],
                  ['plank', 'pl- (initial)', '', ''],
                  ['shelf', '-lf (final)', '', ''],
                  ['track', 'tr- (initial)', '', ''],
                  ['blend', 'bl- (initial)', '', ''],
                  ['crisp', 'cr- (initial)', '', ''],
                  ['stomp', 'st- (initial)', '', ''],
                ]}
              />
              <div className="mt-3"><ScoreRow label="Consonant Blends" total="10" /></div>
            </div>

            {/* 1E: Consonant Digraphs */}
            <div>
              <h4 className="font-display font-bold text-sm text-text mb-1">1E. Consonant Digraphs</h4>
              <AssessmentTable
                headers={['Word', 'Digraph Tested', 'Response', '+/SC/\u2014']}
                rows={[
                  ['shop', 'sh', '', ''],
                  ['chop', 'ch', '', ''],
                  ['thick', 'th (unvoiced)', '', ''],
                  ['when', 'wh', '', ''],
                  ['truck', 'ck', '', ''],
                  ['match', 'tch', '', ''],
                  ['that', 'th (voiced)', '', ''],
                  ['phone', 'ph', '', ''],
                ]}
              />
              <div className="mt-3"><ScoreRow label="Consonant Digraphs" total="8" /></div>
            </div>

            {/* 1F: Silent-e (VCe) Words */}
            <div>
              <h4 className="font-display font-bold text-sm text-text mb-1">1F. Silent-e (VCe) Words</h4>
              <AssessmentTable
                headers={['Word', 'Response', '+/SC/\u2014']}
                rows={[
                  ['make', '', ''],
                  ['dime', '', ''],
                  ['bone', '', ''],
                  ['cute', '', ''],
                  ['theme', '', ''],
                  ['grade', '', ''],
                  ['prize', '', ''],
                  ['smoke', '', ''],
                ]}
              />
              <div className="mt-3"><ScoreRow label="Silent-e (VCe)" total="8" /></div>
            </div>

            {/* 1G: Vowel Teams */}
            <div>
              <h4 className="font-display font-bold text-sm text-text mb-1">1G. Vowel Teams</h4>
              <AssessmentTable
                headers={['Word', 'Vowel Team', 'Response', '+/SC/\u2014']}
                rows={[
                  ['train', 'ai', '', ''],
                  ['spray', 'ay', '', ''],
                  ['creek', 'ee', '', ''],
                  ['treat', 'ea', '', ''],
                  ['float', 'oa', '', ''],
                  ['throw', 'ow (long o)', '', ''],
                  ['point', 'oi', '', ''],
                  ['enjoy', 'oy', '', ''],
                  ['scout', 'ou', '', ''],
                  ['crawl', 'aw', '', ''],
                ]}
              />
              <div className="mt-3"><ScoreRow label="Vowel Teams" total="10" /></div>
            </div>

            {/* 1H: R-Controlled Vowels */}
            <div>
              <h4 className="font-display font-bold text-sm text-text mb-1">1H. R-Controlled Vowels</h4>
              <AssessmentTable
                headers={['Word', 'Pattern', 'Response', '+/SC/\u2014']}
                rows={[
                  ['charm', 'ar', '', ''],
                  ['sport', 'or', '', ''],
                  ['clerk', 'er', '', ''],
                  ['shirt', 'ir', '', ''],
                  ['nurse', 'ur', '', ''],
                  ['carpet', 'ar (multisyllabic)', '', ''],
                  ['corner', 'or + er', '', ''],
                  ['circle', 'ir (multisyllabic)', '', ''],
                ]}
              />
              <div className="mt-3"><ScoreRow label="R-Controlled Vowels" total="8" /></div>
            </div>

            {/* 1I: Multisyllabic Words */}
            <div>
              <h4 className="font-display font-bold text-sm text-text mb-1">1I. Multisyllabic Words</h4>
              <AssessmentTable
                headers={['Word', 'Syllable Types', 'Response', '+/SC/\u2014']}
                rows={[
                  ['kitten', 'VCCV (closed + closed)', '', ''],
                  ['helmet', 'VCCV (closed + closed)', '', ''],
                  ['frozen', 'VCV (open + closed)', '', ''],
                  ['pumpkin', 'VCCV (closed + closed)', '', ''],
                  ['cupcake', 'compound (closed + VCe)', '', ''],
                  ['candle', 'consonant-le', '', ''],
                  ['costume', 'closed + VCe', '', ''],
                  ['remember', '3 syllables', '', ''],
                  ['butterfly', '3 syllables', '', ''],
                  ['unfinished', '4 syllables (prefix)', '', ''],
                ]}
              />
              <div className="mt-3"><ScoreRow label="Multisyllabic Words" total="10" /></div>
            </div>

            {/* 1J: Morphology */}
            <div>
              <h4 className="font-display font-bold text-sm text-text mb-1">1J. Morphology (Prefixes & Suffixes)</h4>
              <AssessmentTable
                headers={['Word', 'Affix', 'Read +/\u2014', 'Meaning +/\u2014']}
                rows={[
                  ['unkind', 'un-', '', ''],
                  ['retell', 're-', '', ''],
                  ['thankful', '-ful', '', ''],
                  ['hopeless', '-less', '', ''],
                  ['softly', '-ly', '', ''],
                  ['disagree', 'dis-', '', ''],
                  ['prewash', 'pre-', '', ''],
                  ['sadness', '-ness', '', ''],
                ]}
              />
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-sm text-text font-medium">Reading Score</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-forest">_____ / 8</span>
                    <div className="bg-amber-light/60 rounded-lg px-3 py-1">
                      <span className="text-xs font-semibold text-amber">Pre Reading: _____ / 8</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-text font-medium">Meaning Score</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-forest">_____ / 8</span>
                    <div className="bg-amber-light/60 rounded-lg px-3 py-1">
                      <span className="text-xs font-semibold text-amber">Pre Meaning: _____ / 8</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Phonics Screener Summary */}
            <div className="bg-sage-pale/30 rounded-xl p-5 mt-4">
              <h4 className="font-display font-bold text-sm text-forest mb-3">Phonics Screener Summary \u2014 Form B (Pre/Post Comparison)</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-forest/20">
                      <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wider text-forest">Skill Area</th>
                      <th className="text-center py-2 px-3 text-xs font-semibold uppercase tracking-wider text-amber">Pre Score</th>
                      <th className="text-center py-2 px-3 text-xs font-semibold uppercase tracking-wider text-forest">Post Score</th>
                      <th className="text-center py-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Change</th>
                      <th className="text-center py-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Mastery?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Consonant Sounds', '20'],
                      ['Short Vowels', '5'],
                      ['CVC Words', '10'],
                      ['Blends', '10'],
                      ['Digraphs', '8'],
                      ['Silent-e (VCe)', '8'],
                      ['Vowel Teams', '10'],
                      ['R-Controlled', '8'],
                      ['Multisyllabic', '10'],
                      ['Morphology (Reading)', '8'],
                      ['Morphology (Meaning)', '8'],
                    ].map(([skill, max]) => (
                      <tr key={skill} className="border-b border-border/40 last:border-0">
                        <td className="py-2 px-3 text-sm text-text font-medium">{skill}</td>
                        <td className="py-2 px-3 text-sm text-amber text-center font-medium">/{max}</td>
                        <td className="py-2 px-3 text-sm text-forest text-center font-bold">/{max}</td>
                        <td className="py-2 px-3 text-sm text-text-muted text-center"></td>
                        <td className="py-2 px-3 text-sm text-text-muted text-center"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4">
                <p className="text-xs font-semibold text-forest mb-1">Notes / Observations:</p>
                <div className="bg-white rounded-lg p-3 min-h-[60px] border border-border/50"></div>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Section 2: Oral Reading Fluency */}
        <CollapsibleSection title="Section 2: Oral Reading Fluency (ORF)" icon="🗣️" badge="Passage B">
          <div className="space-y-6">
            <div>
              <h4 className="font-display font-bold text-sm text-text mb-2">ORF Passage B \u2014 Grade 3 Level: &ldquo;The Rainy Day Rescue&rdquo;</h4>
              <div className="bg-cream-deep rounded-xl p-5 text-sm text-warm-gray leading-relaxed space-y-3 italic border-l-4 border-forest">
                <p>On Saturday morning, Mia and her dad walked to the park to fly their new kite. The sky was blue and the wind was perfect. But before they could even get the kite unwrapped, dark clouds rolled in and rain started to fall.</p>
                <p>They ran under the big oak tree near the pond. Mia noticed something moving in the tall grass by the water. It was a small duck with a piece of string tangled around its leg. The duck was trying to walk but kept falling over.</p>
                <p>&ldquo;Dad, we have to help it,&rdquo; Mia said. Her dad agreed, but the duck was scared and kept waddling away. Mia had an idea. She tore a small piece of bread from her backpack snack and held it out. The duck came closer, and her dad gently untangled the string.</p>
                <p>Once the duck was free, it flapped its wings and waddled straight to the pond. Two other ducks swam over to meet it. Mia smiled and watched them glide across the water together.</p>
                <p>The rain stopped a few minutes later, but Mia and her dad decided they didn&rsquo;t need to fly the kite after all. They had already had the best adventure of the day.</p>
              </div>
              <p className="text-xs text-text-muted mt-2 font-semibold">Total words in passage: 195</p>
            </div>

            {/* ORF Recording Sheet */}
            <div>
              <h4 className="font-display font-bold text-sm text-text mb-3">ORF Recording Sheet</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Metric</th>
                      <th className="text-center py-2 px-3 text-xs font-semibold uppercase tracking-wider text-forest">Post-Assessment</th>
                      <th className="text-center py-2 px-3 text-xs font-semibold uppercase tracking-wider text-amber">Pre-Assessment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      'Total Words Read in 1 Minute',
                      'Total Errors in 1 Minute',
                      'WCPM',
                      'Accuracy Rate (%)',
                    ].map((metric) => (
                      <tr key={metric} className="border-b border-border/40 last:border-0">
                        <td className={`py-2 px-3 text-sm ${metric === 'WCPM' ? 'text-text font-bold' : 'text-text font-medium'}`}>{metric}</td>
                        <td className="py-2 px-3 text-sm text-forest text-center font-semibold"></td>
                        <td className="py-2 px-3 text-sm text-amber text-center font-medium"></td>
                      </tr>
                    ))}
                    <tr className="bg-sage-pale/30">
                      <td className="py-2 px-3 text-sm text-text font-bold">Change in WCPM</td>
                      <td className="py-2 px-3 text-sm text-forest text-center font-bold">+/\u2014 ______</td>
                      <td className="py-2 px-3 text-sm text-text-muted text-center">\u2014</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* NAEP Prosody Scale */}
            <div>
              <h4 className="font-display font-bold text-sm text-text mb-3">NAEP Oral Reading Fluency Scale (Prosody)</h4>
              <div className="space-y-2">
                {[
                  { score: '4', desc: 'Reads primarily in larger, meaningful phrase groups. Expression and appropriate phrasing. Consistent, conversational pace.' },
                  { score: '3', desc: 'Reads primarily in 3- or 4-word phrase groups. Some expression. Mostly appropriate phrasing.' },
                  { score: '2', desc: 'Reads primarily in 2-word phrases. Little expression. Frequent pauses, some word-by-word reading.' },
                  { score: '1', desc: 'Reads primarily word-by-word. No expression. Frequent extended pauses and hesitations.' },
                ].map((item) => (
                  <div key={item.score} className="flex items-start gap-3 bg-cream-deep/50 rounded-lg px-4 py-2.5">
                    <span className="font-display font-bold text-forest text-sm shrink-0 w-6 text-center">{item.score}</span>
                    <p className="text-sm text-warm-gray">{item.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3"><ScoreRow label="Prosody Score" total="4" /></div>
            </div>

            {/* Retelling Rubric */}
            <div>
              <h4 className="font-display font-bold text-sm text-text mb-1">Retelling Rubric</h4>
              <SubInstruction text='After the student finishes reading the entire passage, say: "Tell me about what you just read. Start from the beginning."' />
              <AssessmentTable
                headers={['Element', '0 \u2014 Not Present', '1 \u2014 Partial', '2 \u2014 Complete']}
                rows={[
                  ['Characters (Mia, her dad, the duck)', '', '', ''],
                  ['Setting (park, Saturday morning, rainy)', '', '', ''],
                  ['Key Events in Sequence (went to park, rain came, found duck tangled, used bread, freed duck)', '', '', ''],
                  ['Details (oak tree, string on leg, bread from backpack, two other ducks)', '', '', ''],
                  ['Conclusion/Ending (didn\'t need kite, best adventure)', '', '', ''],
                ]}
              />
              <div className="mt-3"><ScoreRow label="Retelling Score" total="10" /></div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Section 3: Sight Word Inventory */}
        <CollapsibleSection title="Section 3: Sight Word Inventory (Form B)" icon="👁️" badge="Form B">
          <div className="space-y-6">
            <SubInstruction text="Show each word for 3 seconds. Mark + if read automatically and correctly. Mark \u2014 if hesitant (more than 3 seconds), sounded out, or incorrect." />

            {/* Tier 1 */}
            <div>
              <h4 className="font-display font-bold text-sm text-text mb-3">Tier 1 \u2014 Fry Words 1\u2013100 (Parallel Selection)</h4>
              <AssessmentTable
                headers={['Word', '+/\u2014', 'Word', '+/\u2014', 'Word', '+/\u2014', 'Word', '+/\u2014']}
                rows={[
                  ['this', '', 'when', '', 'after', '', 'before', ''],
                  ['each', '', 'over', '', 'those', '', 'write', ''],
                  ['from', '', 'make', '', 'under', '', 'every', ''],
                  ['been', '', 'just', '', 'never', '', 'around', ''],
                  ['into', '', 'much', '', 'right', '', 'until', ''],
                  ['with', '', 'such', '', 'small', '', 'whole', ''],
                  ['also', '', 'work', '', 'still', '', 'guess', ''],
                  ['most', '', 'here', '', 'great', '', 'since', ''],
                  ['both', '', 'once', '', 'might', '', 'above', ''],
                  ['done', '', 'upon', '', 'while', '', 'early', ''],
                ]}
              />
              <div className="mt-3"><ScoreRow label="Tier 1 (Fry 1\u2013100)" total="40" /></div>
            </div>

            {/* Tier 2 */}
            <div>
              <h4 className="font-display font-bold text-sm text-text mb-3">Tier 2 \u2014 OG Red Words (Parallel Form)</h4>
              <AssessmentTable
                headers={['Word', '+/\u2014', 'Word', '+/\u2014', 'Word', '+/\u2014']}
                rows={[
                  ['weight', '', 'honest', '', 'impossible', ''],
                  ['daughter', '', 'foreign', '', 'especially', ''],
                  ['straight', '', 'calendar', '', 'interesting', ''],
                  ['rhythm', '', 'building', '', 'comfortable', ''],
                  ['although', '', 'separate', '', 'environment', ''],
                ]}
              />
              <div className="mt-3"><ScoreRow label="Tier 2 (OG Red Words)" total="15" /></div>
            </div>

            {/* Tier 3 */}
            <div>
              <h4 className="font-display font-bold text-sm text-text mb-3">Tier 3 \u2014 Grade 3\u20134 Academic Vocabulary (Parallel Form)</h4>
              <AssessmentTable
                headers={['Word', '+/\u2014', 'Word', '+/\u2014', 'Word', '+/\u2014']}
                rows={[
                  ['sentence', '', 'explanation', '', 'sequence', ''],
                  ['equation', '', 'summarize', '', 'decision', ''],
                  ['evidence', '', 'represent', '', 'accomplish', ''],
                  ['organize', '', 'calculate', '', 'community', ''],
                  ['compare', '', 'estimate', '', 'recommend', ''],
                ]}
              />
              <div className="mt-3"><ScoreRow label="Tier 3 (Academic Vocab)" total="15" /></div>
            </div>

            {/* Sight Word Summary */}
            <div className="bg-sage-pale/30 rounded-xl p-5">
              <h4 className="font-display font-bold text-sm text-forest mb-3">Sight Word Summary</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-forest/20">
                      <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wider text-forest">Tier</th>
                      <th className="text-center py-2 px-3 text-xs font-semibold uppercase tracking-wider text-amber">Pre Score</th>
                      <th className="text-center py-2 px-3 text-xs font-semibold uppercase tracking-wider text-forest">Post Score</th>
                      <th className="text-center py-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Tier 1 (Fry 1\u2013100)', '40'],
                      ['Tier 2 (OG Red Words)', '15'],
                      ['Tier 3 (Academic Vocab)', '15'],
                    ].map(([tier, max]) => (
                      <tr key={tier} className="border-b border-border/40 last:border-0">
                        <td className="py-2 px-3 text-sm text-text font-medium">{tier}</td>
                        <td className="py-2 px-3 text-sm text-amber text-center font-medium">/{max}</td>
                        <td className="py-2 px-3 text-sm text-forest text-center font-bold">/{max}</td>
                        <td className="py-2 px-3 text-sm text-text-muted text-center"></td>
                      </tr>
                    ))}
                    <tr className="bg-forest/5 font-bold">
                      <td className="py-2 px-3 text-sm text-text">Total</td>
                      <td className="py-2 px-3 text-sm text-amber text-center">/70</td>
                      <td className="py-2 px-3 text-sm text-forest text-center">/70</td>
                      <td className="py-2 px-3 text-sm text-text-muted text-center"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Section 4: Writing Prompt + Rubric */}
        <CollapsibleSection title="Section 4: Writing Prompt + Rubric (Form B)" icon="✏️" badge="Form B">
          <div className="space-y-6">
            {/* Writing Prompt */}
            <div>
              <h4 className="font-display font-bold text-sm text-text mb-2">Writing Prompt</h4>
              <SubInstruction text={"Say: \"I'd like you to write about something that happened this summer \u2014 something you learned, a challenge you faced, or a moment you're proud of. Tell me the story \u2014 what happened, how you felt, and why it mattered to you. Try your best with spelling and punctuation. You have 20 minutes.\""} />
            </div>

            {/* Writing Sample Analysis */}
            <div>
              <h4 className="font-display font-bold text-sm text-text mb-3">Writing Sample Analysis</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Feature</th>
                      <th className="text-center py-2 px-3 text-xs font-semibold uppercase tracking-wider text-forest">Post</th>
                      <th className="text-center py-2 px-3 text-xs font-semibold uppercase tracking-wider text-amber">Pre</th>
                      <th className="text-center py-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      'Total words written',
                      'Total sentences',
                      'Average words per sentence',
                      'Spelling errors',
                      'Capitalization errors',
                      'Punctuation errors',
                      'Evidence of planning (yes/no)',
                    ].map((feature) => (
                      <tr key={feature} className="border-b border-border/40 last:border-0">
                        <td className="py-2 px-3 text-sm text-text font-medium">{feature}</td>
                        <td className="py-2 px-3 text-sm text-forest text-center font-semibold"></td>
                        <td className="py-2 px-3 text-sm text-amber text-center font-medium"></td>
                        <td className="py-2 px-3 text-sm text-text-muted text-center"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Spelling Error Analysis */}
            <div>
              <h4 className="font-display font-bold text-sm text-text mb-3">Spelling Error Analysis</h4>
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

            {/* Writing Rubric - Ideas & Content */}
            <div>
              <h4 className="font-display font-bold text-sm text-text mb-3">Writing Rubric (4-Point Scale)</h4>

              <div className="space-y-5">
                {/* Ideas & Content */}
                <div className="bg-cream-deep/50 rounded-xl p-4">
                  <h5 className="font-display font-bold text-sm text-forest mb-2">Ideas & Content</h5>
                  <div className="space-y-1.5">
                    {[
                      { score: '4', desc: 'Clear, focused topic. Relevant details that bring the story to life. Reader can picture the events.' },
                      { score: '3', desc: 'Clear topic with some supporting details. Mostly makes sense but could use more description.' },
                      { score: '2', desc: 'Topic is present but unclear. Few details. Hard to follow in places.' },
                      { score: '1', desc: 'No clear topic. Random or disconnected ideas. Very little content.' },
                    ].map((item) => (
                      <div key={item.score} className="flex items-start gap-2.5">
                        <span className="font-display font-bold text-forest text-xs shrink-0 w-5 text-center bg-sage-pale rounded px-1 py-0.5">{item.score}</span>
                        <p className="text-xs text-warm-gray">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3"><ScoreRow label="Ideas & Content" total="4" /></div>
                </div>

                {/* Organization */}
                <div className="bg-cream-deep/50 rounded-xl p-4">
                  <h5 className="font-display font-bold text-sm text-forest mb-2">Organization</h5>
                  <div className="space-y-1.5">
                    {[
                      { score: '4', desc: 'Clear beginning, middle, and end. Events in logical order. Transition words used.' },
                      { score: '3', desc: 'Has a beginning and ending. Mostly in order. Some transition words.' },
                      { score: '2', desc: 'Attempts order but events are jumbled. No clear beginning or ending.' },
                      { score: '1', desc: 'No organizational structure. Events are random.' },
                    ].map((item) => (
                      <div key={item.score} className="flex items-start gap-2.5">
                        <span className="font-display font-bold text-forest text-xs shrink-0 w-5 text-center bg-sage-pale rounded px-1 py-0.5">{item.score}</span>
                        <p className="text-xs text-warm-gray">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3"><ScoreRow label="Organization" total="4" /></div>
                </div>

                {/* Conventions */}
                <div className="bg-cream-deep/50 rounded-xl p-4">
                  <h5 className="font-display font-bold text-sm text-forest mb-2">Conventions (Spelling, Punctuation, Capitalization)</h5>
                  <div className="space-y-1.5">
                    {[
                      { score: '4', desc: 'Few errors. Correct end punctuation, capitals at sentence start, most grade-level words spelled correctly.' },
                      { score: '3', desc: 'Some errors but don\'t interfere with reading. Inconsistent capitalization or punctuation.' },
                      { score: '2', desc: 'Frequent errors that sometimes interfere with reading.' },
                      { score: '1', desc: 'Errors throughout that make writing very difficult to read.' },
                    ].map((item) => (
                      <div key={item.score} className="flex items-start gap-2.5">
                        <span className="font-display font-bold text-forest text-xs shrink-0 w-5 text-center bg-sage-pale rounded px-1 py-0.5">{item.score}</span>
                        <p className="text-xs text-warm-gray">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3"><ScoreRow label="Conventions" total="4" /></div>
                </div>

                {/* Sentence Structure */}
                <div className="bg-cream-deep/50 rounded-xl p-4">
                  <h5 className="font-display font-bold text-sm text-forest mb-2">Sentence Structure</h5>
                  <div className="space-y-1.5">
                    {[
                      { score: '4', desc: 'Varied sentence types (simple and compound). Complete sentences. Reads smoothly.' },
                      { score: '3', desc: 'Mostly complete sentences. Some variety. Occasional run-ons or fragments.' },
                      { score: '2', desc: 'Many simple sentences. Several run-ons or fragments. Repetitive structure.' },
                      { score: '1', desc: 'Incomplete thoughts. Hard to identify sentence boundaries.' },
                    ].map((item) => (
                      <div key={item.score} className="flex items-start gap-2.5">
                        <span className="font-display font-bold text-forest text-xs shrink-0 w-5 text-center bg-sage-pale rounded px-1 py-0.5">{item.score}</span>
                        <p className="text-xs text-warm-gray">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3"><ScoreRow label="Sentence Structure" total="4" /></div>
                </div>
              </div>

              {/* Total Writing Score */}
              <div className="mt-4 bg-forest/5 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-text">Total Writing Score</span>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-forest font-display">_____ / 16</span>
                    <div className="bg-amber-light/60 rounded-lg px-3 py-1">
                      <span className="text-sm font-semibold text-amber">Pre: _____ / 16</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Section 5: Math Diagnostic */}
        <CollapsibleSection title="Section 5: Math Diagnostic (Form B)" icon="🔢" badge="Form B">
          <div className="space-y-6">

            {/* 5A: Place Value */}
            <div>
              <h4 className="font-display font-bold text-sm text-text mb-3">5A. Place Value</h4>
              <div className="space-y-3">
                {[
                  { num: '1', q: 'Write the number seven thousand, one hundred and fifty-six in standard form.' },
                  { num: '2', q: 'In the number 3,926, what is the value of the 9?' },
                  { num: '3', q: 'Round 4,538 to the nearest hundred.' },
                  { num: '4', q: 'Write these numbers in order from least to greatest: 7,801 \u2014 7,180 \u2014 7,810 \u2014 7,018' },
                  { num: '5', q: 'What number is 1,000 less than 8,247?' },
                ].map((item) => (
                  <div key={item.num} className="bg-cream-deep/50 rounded-lg px-4 py-3">
                    <p className="text-sm text-text"><span className="font-bold text-forest mr-2">{item.num}.</span>{item.q}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3"><ScoreRow label="Place Value" total="5" /></div>
            </div>

            {/* 5B: Computation */}
            <div>
              <h4 className="font-display font-bold text-sm text-text mb-3">5B. Computation</h4>

              {/* Addition & Subtraction */}
              <div className="mb-4">
                <h5 className="font-body font-semibold text-xs text-forest-light uppercase tracking-wider mb-2">Addition & Subtraction</h5>
                <AssessmentTable
                  headers={['Problem', 'Student Answer', 'Correct?']}
                  rows={[
                    ['456 + 378 =', '', ''],
                    ['2,617 + 1,495 =', '', ''],
                    ['802 \u2014 356 =', '', ''],
                    ['6,003 \u2014 2,748 =', '', ''],
                  ]}
                />
                <div className="mt-3"><ScoreRow label="Addition/Subtraction" total="4" /></div>
              </div>

              {/* Multiplication */}
              <div className="mb-4">
                <h5 className="font-body font-semibold text-xs text-forest-light uppercase tracking-wider mb-2">Multiplication</h5>
                <AssessmentTable
                  headers={['Problem', 'Student Answer', 'Correct?']}
                  rows={[
                    ['7 x 8 =', '', ''],
                    ['9 x 6 =', '', ''],
                    ['4 x 7 =', '', ''],
                    ['11 x 6 =', '', ''],
                    ['34 x 3 =', '', ''],
                  ]}
                />
                <div className="mt-3"><ScoreRow label="Multiplication" total="5" /></div>
              </div>

              {/* Division */}
              <div>
                <h5 className="font-body font-semibold text-xs text-forest-light uppercase tracking-wider mb-2">Division</h5>
                <AssessmentTable
                  headers={['Problem', 'Student Answer', 'Correct?']}
                  rows={[
                    ['48 / 6 =', '', ''],
                    ['63 / 7 =', '', ''],
                    ['32 / 8 =', '', ''],
                    ['84 / 4 =', '', ''],
                  ]}
                />
                <div className="mt-3"><ScoreRow label="Division" total="4" /></div>
              </div>
            </div>

            {/* 5C: Fractions */}
            <div>
              <h4 className="font-display font-bold text-sm text-text mb-3">5C. Fractions</h4>
              <div className="space-y-3">
                {[
                  { num: '1', q: 'What fraction of this shape is shaded? [Circle divided into 6 equal parts, 4 shaded]' },
                  { num: '2', q: 'Place the fraction 3/4 on this number line. [0 to 1]' },
                  { num: '3', q: 'Which is greater: 5/8 or 3/8? Explain how you know.' },
                  { num: '4', q: 'Name two fractions that are equal to 2/4.' },
                  { num: '5', q: 'Circle the larger fraction: 1/4 or 1/8. How do you know?' },
                ].map((item) => (
                  <div key={item.num} className="bg-cream-deep/50 rounded-lg px-4 py-3">
                    <p className="text-sm text-text"><span className="font-bold text-forest mr-2">{item.num}.</span>{item.q}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3"><ScoreRow label="Fractions" total="5" /></div>
            </div>

            {/* 5D: Word Problems */}
            <div>
              <h4 className="font-display font-bold text-sm text-text mb-3">5D. Word Problems</h4>
              <div className="space-y-3">
                {[
                  { num: '1', q: 'Jayden collected 315 baseball cards. He traded 89 cards with a friend. Then he got 145 more cards for his birthday. How many cards does Jayden have now?' },
                  { num: '2', q: 'A bakery makes 7 trays of muffins. Each tray holds 8 muffins. How many muffins did the bakery make?' },
                  { num: '3', q: 'Ms. Park has 48 markers. She wants to divide them equally among 6 tables. How many markers go on each table?' },
                  { num: '4', q: 'A swimming pool is 425 feet around. Kayla has swum 278 feet so far. How many more feet does she need to swim to go all the way around?' },
                  { num: '5', q: 'A pizza is cut into 8 equal slices. Emma ate 2/8 of the pizza and Liam ate 3/8. Who ate more pizza? How much pizza did they eat altogether?' },
                ].map((item) => (
                  <div key={item.num} className="bg-cream-deep/50 rounded-lg px-4 py-3">
                    <p className="text-sm text-text"><span className="font-bold text-forest mr-2">{item.num}.</span>{item.q}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3"><ScoreRow label="Word Problems" total="5" /></div>
            </div>

            {/* 5E: Computation Fluency Probe */}
            <div>
              <h4 className="font-display font-bold text-sm text-text mb-3">5E. Computation Fluency Probe (2 Minutes) \u2014 Form B</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      ['8 + 7 =', '14 \u2014 6 =', '5 x 4 =', '36 / 9 =', '13 + 8 ='],
                      ['11 \u2014 4 =', '6 x 7 =', '28 / 4 =', '7 + 9 =', '18 \u2014 9 ='],
                      ['8 x 8 =', '63 / 7 =', '6 + 8 =', '15 \u2014 7 =', '9 x 4 ='],
                      ['56 / 8 =', '12 + 9 =', '21 \u2014 8 =', '4 x 9 =', '45 / 5 ='],
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-border/40 last:border-0">
                        {row.map((cell, j) => (
                          <td key={j} className="py-3 px-3 text-sm text-text font-medium text-center">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-sm text-text font-medium">Post \u2014 Problems Attempted / Correct</span>
                  <span className="text-sm font-bold text-forest">_____ / 20 &nbsp;|&nbsp; _____ / 20</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-text font-medium">Pre \u2014 Problems Attempted / Correct</span>
                  <div className="bg-amber-light/60 rounded-lg px-3 py-1">
                    <span className="text-xs font-semibold text-amber">_____ / 20 &nbsp;|&nbsp; _____ / 20</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Math Diagnostic Summary */}
            <div className="bg-sage-pale/30 rounded-xl p-5">
              <h4 className="font-display font-bold text-sm text-forest mb-3">Math Diagnostic Summary \u2014 Pre/Post Comparison</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-forest/20">
                      <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wider text-forest">Domain</th>
                      <th className="text-center py-2 px-3 text-xs font-semibold uppercase tracking-wider text-amber">Pre Score</th>
                      <th className="text-center py-2 px-3 text-xs font-semibold uppercase tracking-wider text-forest">Post Score</th>
                      <th className="text-center py-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Change</th>
                      <th className="text-center py-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Growth Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Place Value', '5'],
                      ['Addition/Subtraction', '4'],
                      ['Multiplication', '5'],
                      ['Division', '4'],
                      ['Fractions', '5'],
                      ['Word Problems', '5'],
                      ['Computation Fluency', '20'],
                    ].map(([domain, max]) => (
                      <tr key={domain} className="border-b border-border/40 last:border-0">
                        <td className="py-2 px-3 text-sm text-text font-medium">{domain}</td>
                        <td className="py-2 px-3 text-sm text-amber text-center font-medium">/{max}</td>
                        <td className="py-2 px-3 text-sm text-forest text-center font-bold">/{max}</td>
                        <td className="py-2 px-3 text-sm text-text-muted text-center"></td>
                        <td className="py-2 px-3 text-sm text-text-muted text-center"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Section 6: Student Reflection Survey */}
        <CollapsibleSection title="Section 6: Student Reflection Survey (Post-Program)" icon="💭">
          <div className="space-y-6">
            <SubInstruction text="Purpose: Capture student's self-perception of growth and experience. Read questions aloud if needed. Student may write or dictate responses." />

            {/* My Summer at IEP & Thrive */}
            <div>
              <h4 className="font-display font-bold text-sm text-text mb-3">My Summer at IEP & Thrive</h4>
              <div className="space-y-3">
                {[
                  { num: '1', q: 'The thing I\'m most proud of from this summer is:' },
                  { num: '2', q: 'Something I can do now that I couldn\'t do before the program:' },
                  { num: '3', q: 'In reading, I got better at:' },
                  { num: '4', q: 'In writing, I got better at:' },
                  { num: '5', q: 'In math, I got better at:' },
                  { num: '6', q: 'A strategy I learned that really helps me is:' },
                ].map((item) => (
                  <div key={item.num} className="bg-cream-deep/50 rounded-lg px-4 py-3">
                    <p className="text-sm text-text"><span className="font-bold text-forest mr-2">{item.num}.</span>{item.q}</p>
                    <div className="mt-2 bg-white rounded-lg p-2 min-h-[32px] border border-border/50"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* How I Feel Now */}
            <div>
              <h4 className="font-display font-bold text-sm text-text mb-3">How I Feel Now</h4>
              <div className="space-y-3">
                {[
                  { num: '7', q: 'When I read now, I feel:', options: ['Really confident', 'More confident than before', 'About the same', 'Still worried'] },
                  { num: '8', q: 'When I write now, I feel:', options: ['Really confident', 'More confident than before', 'About the same', 'Still worried'] },
                  { num: '9', q: 'When I do math now, I feel:', options: ['Really confident', 'More confident than before', 'About the same', 'Still worried'] },
                ].map((item) => (
                  <div key={item.num} className="bg-cream-deep/50 rounded-lg px-4 py-3">
                    <p className="text-sm text-text mb-2"><span className="font-bold text-forest mr-2">{item.num}.</span>{item.q}</p>
                    <div className="flex flex-wrap gap-2">
                      {item.options.map((opt) => (
                        <span key={opt} className="text-xs bg-white border border-border rounded-full px-3 py-1.5 text-text-muted">
                          {opt}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

                {[
                  { num: '10', q: 'Something I want to keep working on in school this year:' },
                  { num: '11', q: 'If I could tell a kid starting this program next summer one thing, I\'d say:' },
                  { num: '12', q: 'My message to my teacher for this school year:' },
                ].map((item) => (
                  <div key={item.num} className="bg-cream-deep/50 rounded-lg px-4 py-3">
                    <p className="text-sm text-text"><span className="font-bold text-forest mr-2">{item.num}.</span>{item.q}</p>
                    <div className="mt-2 bg-white rounded-lg p-2 min-h-[32px] border border-border/50"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Growth Summary */}
        <CollapsibleSection title="Post-Assessment Summary Sheet" icon="📊" defaultOpen>
          <div className="space-y-6">
            {/* Student / Date fields */}
            <div className="flex flex-wrap gap-4">
              {['Student', 'Date', 'Pre-Assessment Date'].map((field) => (
                <div key={field} className="bg-cream-deep rounded-lg px-4 py-2.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">{field}:</span>
                  <span className="text-sm text-text ml-2">_______________</span>
                </div>
              ))}
            </div>

            {/* Growth Summary Table */}
            <div>
              <h4 className="font-display font-bold text-sm text-forest mb-3">Growth Summary Table</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-forest/30">
                      <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wider text-forest">Domain</th>
                      <th className="text-center py-2 px-3 text-xs font-semibold uppercase tracking-wider text-amber">Pre Score</th>
                      <th className="text-center py-2 px-3 text-xs font-semibold uppercase tracking-wider text-forest">Post Score</th>
                      <th className="text-center py-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Points Gained</th>
                      <th className="text-center py-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">% Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* READING */}
                    <tr className="bg-forest/5">
                      <td colSpan={5} className="py-2 px-3 text-xs font-bold uppercase tracking-wider text-forest">Reading</td>
                    </tr>
                    {[
                      ['Phonics \u2014 Consonant Sounds', '20'],
                      ['Phonics \u2014 Short Vowels', '5'],
                      ['Phonics \u2014 CVC', '10'],
                      ['Phonics \u2014 Blends', '10'],
                      ['Phonics \u2014 Digraphs', '8'],
                      ['Phonics \u2014 VCe', '8'],
                      ['Phonics \u2014 Vowel Teams', '10'],
                      ['Phonics \u2014 R-Controlled', '8'],
                      ['Phonics \u2014 Multisyllabic', '10'],
                      ['Phonics \u2014 Morphology (Read)', '8'],
                      ['Phonics \u2014 Morphology (Meaning)', '8'],
                    ].map(([domain, max]) => (
                      <SummaryComparisonRow key={domain} domain={domain} preMax={max} postMax={max} />
                    ))}
                    {['ORF \u2014 WCPM', 'ORF \u2014 Accuracy %'].map((domain) => (
                      <tr key={domain} className="border-b border-border/40">
                        <td className="py-2 px-3 text-sm text-text font-medium">{domain}</td>
                        <td className="py-2 px-3 text-sm text-amber text-center font-medium">___</td>
                        <td className="py-2 px-3 text-sm text-forest text-center font-bold">___</td>
                        <td className="py-2 px-3 text-sm text-text-muted text-center"></td>
                        <td className="py-2 px-3 text-sm text-text-muted text-center"></td>
                      </tr>
                    ))}
                    {[
                      ['ORF \u2014 Prosody', '4'],
                      ['ORF \u2014 Retelling', '10'],
                      ['Sight Words \u2014 Total', '70'],
                    ].map(([domain, max]) => (
                      <SummaryComparisonRow key={domain} domain={domain} preMax={max} postMax={max} />
                    ))}

                    {/* WRITING */}
                    <tr className="bg-forest/5">
                      <td colSpan={5} className="py-2 px-3 text-xs font-bold uppercase tracking-wider text-forest">Writing</td>
                    </tr>
                    {[
                      ['Ideas & Content', '4'],
                      ['Organization', '4'],
                      ['Conventions', '4'],
                      ['Sentence Structure', '4'],
                      ['Writing Total', '16'],
                    ].map(([domain, max]) => (
                      <SummaryComparisonRow key={domain} domain={domain} preMax={max} postMax={max} />
                    ))}

                    {/* MATH */}
                    <tr className="bg-forest/5">
                      <td colSpan={5} className="py-2 px-3 text-xs font-bold uppercase tracking-wider text-forest">Math</td>
                    </tr>
                    {[
                      ['Place Value', '5'],
                      ['Add/Sub', '4'],
                      ['Multiplication', '5'],
                      ['Division', '4'],
                      ['Fractions', '5'],
                      ['Word Problems', '5'],
                      ['Computation Fluency', '20'],
                    ].map(([domain, max]) => (
                      <SummaryComparisonRow key={domain} domain={domain} preMax={max} postMax={max} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* IEP Goal Progress Summary */}
            <div>
              <h4 className="font-display font-bold text-sm text-text mb-2">IEP Goal Progress Summary</h4>
              <p className="text-xs text-text-muted italic mb-3">For each IEP goal targeted during the program, document baseline and current performance.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">IEP Goal (Abbreviated)</th>
                      <th className="text-center py-2 px-3 text-xs font-semibold uppercase tracking-wider text-amber">Pre-Program Baseline</th>
                      <th className="text-center py-2 px-3 text-xs font-semibold uppercase tracking-wider text-forest">Post-Program Level</th>
                      <th className="text-center py-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Progress Toward Goal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4].map((num) => (
                      <tr key={num} className="border-b border-border/40">
                        <td className="py-3 px-3 text-sm text-text font-medium">{num}.</td>
                        <td className="py-3 px-3 text-sm text-text-muted text-center"></td>
                        <td className="py-3 px-3 text-sm text-text-muted text-center"></td>
                        <td className="py-3 px-3 text-sm text-text-muted text-center"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Narrative Summary */}
            <div>
              <h4 className="font-display font-bold text-sm text-text mb-3">Narrative Summary (for CSE-ready report)</h4>
              <div className="space-y-4">
                {[
                  'Areas of Significant Growth',
                  'Areas of Continued Need',
                  'Recommendations for Fall Instruction',
                ].map((label) => (
                  <div key={label}>
                    <p className="text-xs font-semibold text-forest mb-1.5">{label}:</p>
                    <div className="bg-cream-deep/50 rounded-lg p-3 min-h-[60px] border border-border/50"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assessor Signature */}
            <div className="flex items-center gap-8 pt-4 border-t border-border">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Assessor Signature</p>
                <p className="text-sm text-text mt-1">___________________________</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Date</p>
                <p className="text-sm text-text mt-1">_______________</p>
              </div>
            </div>

            {/* Footer note */}
            <div className="bg-amber-light/30 border border-amber/15 rounded-xl px-4 py-3 mt-4">
              <p className="text-xs text-warm-gray italic leading-relaxed">
                This post-assessment battery is the parallel form of the IEP & Thrive Pre-Assessment Battery. All data from this battery, combined with weekly progress monitoring probes, contributes to the CSE-ready final report provided to families at the end-of-program showcase. Growth data should be presented as both raw score changes and percentage changes for maximum impact at September CSE meetings.
              </p>
            </div>
          </div>
        </CollapsibleSection>

      </div>
    </div>
  )
}
