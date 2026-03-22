'use client'

import { useState } from 'react'
import Link from 'next/link'

interface CollapsibleSectionProps {
  icon: string
  title: string
  subtitle: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function CollapsibleSection({ icon, title, subtitle, children, defaultOpen = false }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-6 py-5 flex items-center justify-between cursor-pointer hover:bg-cream-deep/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h2 className="font-display font-bold text-base text-text">{title}</h2>
            <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-6 pb-6 border-t border-border pt-5">{children}</div>}
    </div>
  )
}

function ProbeTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border border-border rounded-xl overflow-hidden">
        <thead>
          <tr className="bg-cream-deep">
            {headers.map((h, i) => (
              <th key={i} className="text-left px-3 py-2.5 font-semibold text-text text-xs uppercase tracking-wider border-b border-border">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 1 ? 'bg-sage-pale/20' : 'bg-white'}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-3 py-2 text-warm-gray border-b border-border whitespace-nowrap">
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

function TrackingGrid({ title, headers, rowCount = 6 }: { title: string; headers: string[]; rowCount?: number }) {
  return (
    <div className="mt-5">
      <h4 className="font-display font-bold text-sm text-text mb-3">{title}</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-border rounded-xl overflow-hidden">
          <thead>
            <tr className="bg-cream-deep">
              {headers.map((h, i) => (
                <th key={i} className="text-left px-3 py-2.5 font-semibold text-text text-xs uppercase tracking-wider border-b border-border">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rowCount }).map((_, ri) => (
              <tr key={ri} className={ri % 2 === 1 ? 'bg-sage-pale/20' : 'bg-white'}>
                <td className="px-3 py-2 text-warm-gray border-b border-border font-medium">{ri + 1}.</td>
                {headers.slice(1).map((_, ci) => (
                  <td key={ci} className="px-3 py-2 text-text-muted border-b border-border">
                    <div className="w-12 h-5 border border-border rounded bg-cream-deep/30" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PassageBlock({ title, gradeInfo, text }: { title: string; gradeInfo: string; text: string }) {
  return (
    <div className="mt-5">
      <div className="flex items-center gap-2 mb-2">
        <h4 className="font-display font-bold text-sm text-text">{title}</h4>
        <span className="text-[10px] font-semibold uppercase tracking-wider bg-sage-pale text-forest px-2.5 py-0.5 rounded-full">
          {gradeInfo}
        </span>
      </div>
      <div className="bg-cream-deep rounded-xl p-5 text-sm text-warm-gray leading-relaxed italic border-l-4 border-forest-light">
        {text}
      </div>
    </div>
  )
}

export default function WeeklyProbeTemplatesPage() {
  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-text-muted mb-6">
        <Link href="/admin/curriculum" className="hover:text-forest transition-colors">
          Curriculum
        </Link>
        <span>/</span>
        <span className="text-text font-semibold">Weekly Probe Templates</span>
      </div>

      {/* Header Banner */}
      <div className="bg-forest-mid rounded-2xl p-6 md:p-8 mb-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">📝</span>
          <div>
            <h1 className="font-display text-2xl font-bold">Weekly Progress Monitoring Probes</h1>
            <p className="text-white/70 text-sm mt-1">Administered Every Friday</p>
          </div>
        </div>
        <div className="mt-4 bg-white/10 rounded-xl px-4 py-3 text-sm text-white/80 space-y-1">
          <p><span className="font-semibold">Administration time:</span> ~15-20 minutes per student</p>
          <p><span className="font-semibold">Frequency:</span> Every Friday during the assessment block</p>
          <p><span className="font-semibold">Data use:</span> Feeds directly into the weekly parent report</p>
        </div>
      </div>

      {/* Administration Guidelines */}
      <div className="bg-sage-pale/40 rounded-2xl border border-border p-5 mb-6">
        <h3 className="font-display font-bold text-sm text-text mb-3 flex items-center gap-2">
          <span className="text-base">📋</span> Administration Guidelines
        </h3>
        <ul className="space-y-2">
          {[
            'Administer all probes on Fridays during the assessment block',
            'Total administration time: approximately 15-20 minutes per student',
            'Keep conditions consistent week to week (same time, same setting)',
            'Data from these probes feeds directly into the weekly parent report',
            'File completed probes in the student\'s portfolio folder',
            'Transfer scores to the Data Recording Grid (Section 6) after each administration',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-warm-gray">
              <svg className="w-4 h-4 text-forest-light shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Sections */}
      <div className="space-y-4">

        {/* Section 1: ORF Probe */}
        <CollapsibleSection
          icon="📖"
          title="Section 1: Oral Reading Fluency (ORF) Probe"
          subtitle="1-minute timed reading + retelling | Track WCPM and accuracy trend"
          defaultOpen
        >
          <div className="space-y-6">
            {/* Passage Info */}
            <div>
              <h3 className="font-display font-bold text-sm text-text mb-3">Passage Information</h3>
              <ProbeTable
                headers={['Field', 'Details']}
                rows={[
                  ['Passage Title', '(Record for each administration)'],
                  ['Source / Level', '(Grade-level passage from ORF bank)'],
                  ['Total Words in Passage', '(Count before administering)'],
                ]}
              />
            </div>

            {/* Error Marking Key */}
            <div>
              <h3 className="font-display font-bold text-sm text-text mb-3">Error Marking Key</h3>
              <ProbeTable
                headers={['Mark', 'Meaning']}
                rows={[
                  ['Line through word', 'Substitution (write what student said above)'],
                  ['Circle', 'Omission'],
                  ['Caret (^)', 'Insertion'],
                  ['SC', 'Self-correction (NOT counted as error)'],
                  ['T', 'Teacher-provided (after 3-second wait)'],
                ]}
              />
            </div>

            {/* ORF Recording */}
            <div>
              <h3 className="font-display font-bold text-sm text-text mb-3">ORF Recording</h3>
              <ProbeTable
                headers={['Metric', 'This Week', 'Last Week', 'Trend']}
                rows={[
                  ['Total Words Read (1 min)', '', '', ''],
                  ['Errors', '', '', ''],
                  ['WCPM', '', '', 'Up / Down / Stable'],
                  ['Accuracy %', '', '', ''],
                  ['Prosody (1-4)', '', '', ''],
                ]}
              />
            </div>

            {/* Quick Comprehension Check */}
            <div>
              <h3 className="font-display font-bold text-sm text-text mb-3">Quick Comprehension Check</h3>
              <p className="text-xs text-text-muted mb-3 italic">Ask 3 questions about the passage: 1 literal, 1 inferential, 1 vocabulary.</p>
              <ProbeTable
                headers={['#', 'Question', 'Response', 'Correct?']}
                rows={[
                  ['1 (Literal)', '(Write question)', '', ''],
                  ['2 (Inferential)', '(Write question)', '', ''],
                  ['3 (Vocabulary)', '(Write question)', '', ''],
                ]}
              />
              <p className="text-sm font-semibold text-text mt-3">Comprehension: ___ / 3</p>
            </div>

            {/* ORF Passage Bank */}
            <div>
              <h3 className="font-display font-bold text-sm text-text mb-2 flex items-center gap-2">
                <span className="text-amber">&#9733;</span> ORF Passage Bank
              </h3>
              <p className="text-xs text-text-muted mb-4">Rotate passages weekly. Do not reuse passages within the same student.</p>

              <PassageBlock
                title="Week 2: &quot;The Art Contest&quot;"
                gradeInfo="Grade 3 | 168 words"
                text="Every year, the community center holds an art contest for kids. This year, Leo decided to enter. He spent two weeks painting a picture of his dog, Biscuit, sleeping on the couch. He mixed the colors carefully to get Biscuit's brown and white fur just right. On the day of the contest, Leo carried his painting to the center. The room was full of art from other kids. Some had drawn their families. Others had made sculptures from clay. Leo felt nervous when he saw how good they were. The judges walked around slowly, looking at each piece. They wrote notes on their clipboards. When they got to Leo's painting, one of them smiled. At the end, they called out the winners. Leo didn't win first place, but he got a special ribbon for &quot;Best Use of Color.&quot; He was so happy he almost cried. Biscuit didn't care about the ribbon, but he licked Leo's face when he got home."
              />

              <PassageBlock
                title="Week 3: &quot;Storm at the Beach&quot;"
                gradeInfo="Grade 3 | 172 words"
                text="Anika and her grandmother went to the beach every Sunday. They packed sandwiches, lemonade, and a big striped blanket. Anika loved to look for shells while her grandmother read under the umbrella. One Sunday, the sky turned dark before they even finished eating. Thunder rumbled in the distance. Grandmother said they should pack up quickly. Anika grabbed the blanket, but the wind snatched it from her hands and blew it across the sand. They ran to the car just as the first big drops of rain began to fall. Inside the car, they watched the storm from behind the windows. Lightning flashed over the water. The waves grew tall and crashed hard against the rocks. When the storm passed, a rainbow stretched across the sky. Anika asked if they could go back to the sand. Her grandmother smiled and said yes. The beach looked different now. The rain had washed up dozens of new shells. Anika found a perfect pink one and put it in her pocket."
              />

              <PassageBlock
                title="Week 4: &quot;The Library Surprise&quot;"
                gradeInfo="Grade 3-4 | 175 words"
                text="Deshawn went to the library every Wednesday after school. He liked the quiet and the smell of old books. His favorite spot was the blue armchair near the window where he could read and watch the birds outside. One Wednesday, the librarian, Mrs. Foster, told him the library was starting a new program. Any kid who read twenty books by the end of the month would earn a special prize. Deshawn already loved to read, so he signed up right away. He started reading every chance he got. He read on the bus, during lunch, and before bed. He picked books about space, animals, and famous inventors. Each time he finished one, Mrs. Foster stamped his reading card. By the last Wednesday of the month, Deshawn had finished all twenty books. Mrs. Foster handed him a gold certificate and a brand-new book of his choice. He picked one about the ocean. As he sat in his blue armchair and opened the first page, he already knew it would be his favorite."
              />

              <PassageBlock
                title="Week 5: &quot;The Science Fair&quot;"
                gradeInfo="Grade 3-4 | 178 words"
                text="For the science fair, Priya wanted to find out which type of soil helped plants grow the fastest. She set up three pots on her windowsill. One had sand, one had garden soil, and one had clay. She planted the same bean seeds in each pot and watered them the same amount every day. After one week, the garden soil pot had a tiny green sprout. The sand pot had nothing yet. The clay pot had a small crack in the dirt where something was trying to push through. Priya measured each plant with a ruler and wrote the numbers in her notebook. By the third week, the garden soil plant was six inches tall. The sand plant was only two inches, and the clay plant was somewhere in between. Priya made a bar graph to show her results. At the fair, she stood next to her display and explained her experiment to the judges. They asked her why she thought garden soil worked best. She said it holds water and has nutrients that plants need. They nodded and wrote something down."
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Section 2: Phonics Sort Probe */}
        <CollapsibleSection
          icon="🔤"
          title="Section 2: Phonics Pattern Word List"
          subtitle="Assess mastery of weekly phonics patterns | 80% = mastery"
        >
          <div className="space-y-6">
            <div>
              <p className="text-sm text-warm-gray mb-1"><span className="font-semibold text-text">Purpose:</span> Assess mastery of the phonics pattern(s) taught this week</p>
              <p className="text-sm text-warm-gray mb-1"><span className="font-semibold text-text">Administration:</span> Present words one at a time. Student reads aloud. Mark correct (+) or incorrect (-) with error noted.</p>
              <p className="text-sm text-warm-gray mb-4"><span className="font-semibold text-text">Standard:</span> 8/10 correct (80%) = mastery of the pattern</p>
            </div>

            {/* Blank template */}
            <div>
              <h3 className="font-display font-bold text-sm text-text mb-3">Recording Template</h3>
              <ProbeTable
                headers={['#', 'Word', 'Correct (+) / Incorrect (-)', 'Error (if any)']}
                rows={Array.from({ length: 10 }).map((_, i) => [
                  `${i + 1}`, '(Customize weekly)', '', '',
                ])}
              />
              <p className="text-sm font-semibold text-text mt-3">Score: ___ / 10 | Mastery (80%+)? Yes / No</p>
            </div>

            {/* Week 2 */}
            <div>
              <h3 className="font-display font-bold text-sm text-text mb-1">Week 2 -- Vowel Teams (ai/ay, ee/ea, oa/ow)</h3>
              <ProbeTable
                headers={['#', 'Word', 'Pattern']}
                rows={[
                  ['1', 'chain', 'ai'],
                  ['2', 'spray', 'ay'],
                  ['3', 'sweep', 'ee'],
                  ['4', 'stream', 'ea'],
                  ['5', 'toast', 'oa'],
                  ['6', 'pillow', 'ow (long o)'],
                  ['7', 'display', 'ay'],
                  ['8', 'sneeze', 'ee'],
                  ['9', 'rainfall', 'ai'],
                  ['10', 'below', 'ow (long o)'],
                ]}
              />
            </div>

            {/* Week 3 */}
            <div>
              <h3 className="font-display font-bold text-sm text-text mb-1">Week 3 -- Vowel Teams (oi/oy, ou/ow, au/aw) + R-Controlled</h3>
              <ProbeTable
                headers={['#', 'Word', 'Pattern']}
                rows={[
                  ['1', 'broil', 'oi'],
                  ['2', 'destroy', 'oy'],
                  ['3', 'amount', 'ou'],
                  ['4', 'frown', 'ow (ou sound)'],
                  ['5', 'launch', 'au'],
                  ['6', 'shawl', 'aw'],
                  ['7', 'target', 'ar'],
                  ['8', 'morning', 'or'],
                  ['9', 'certain', 'er'],
                  ['10', 'swirl', 'ir'],
                ]}
              />
            </div>

            {/* Week 4 */}
            <div>
              <h3 className="font-display font-bold text-sm text-text mb-1">Week 4 -- Multisyllabic Words (VCCV, VCV, C+le)</h3>
              <ProbeTable
                headers={['#', 'Word', 'Pattern']}
                rows={[
                  ['1', 'blanket', 'VCCV'],
                  ['2', 'problem', 'VCCV'],
                  ['3', 'silent', 'VCV (open)'],
                  ['4', 'river', 'VCV (closed)'],
                  ['5', 'popcorn', 'compound'],
                  ['6', 'simple', 'C+le'],
                  ['7', 'gentle', 'C+le'],
                  ['8', 'adventure', '3 syllables'],
                  ['9', 'insect', 'VCCV'],
                  ['10', 'bottle', 'C+le'],
                ]}
              />
            </div>

            {/* Week 5 */}
            <div>
              <h3 className="font-display font-bold text-sm text-text mb-1">Week 5 -- Morphology (Prefixes & Suffixes)</h3>
              <ProbeTable
                headers={['#', 'Word', 'Pattern']}
                rows={[
                  ['1', 'unhappy', 'un-'],
                  ['2', 'replay', 're-'],
                  ['3', 'preview', 'pre-'],
                  ['4', 'disappear', 'dis-'],
                  ['5', 'peaceful', '-ful'],
                  ['6', 'fearless', '-less'],
                  ['7', 'darkness', '-ness'],
                  ['8', 'gently', '-ly'],
                  ['9', 'rebuild', 're-'],
                  ['10', 'uncomfortable', 'un- + -able'],
                ]}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Section 3: Math Computation Probe */}
        <CollapsibleSection
          icon="🔢"
          title="Section 3: Math Computation Probe (2-Minute Timed)"
          subtitle="Track computation fluency growth | 20 problems, 2-minute limit"
        >
          <div className="space-y-6">
            <div>
              <p className="text-sm text-warm-gray mb-1"><span className="font-semibold text-text">Purpose:</span> Track computation fluency growth across the program</p>
              <p className="text-sm text-warm-gray mb-1"><span className="font-semibold text-text">Administration:</span> Student has exactly 2 minutes. Work left to right, top to bottom. Skip and move on if stuck.</p>
              <p className="text-sm text-warm-gray mb-4"><span className="font-semibold text-text">Note:</span> Customize operations to match the week&apos;s math focus.</p>
            </div>

            {/* Scoring template */}
            <div className="bg-cream-deep rounded-xl p-4 text-sm text-warm-gray space-y-1">
              <p><span className="font-semibold text-text">Problems Attempted:</span> ___ / 20</p>
              <p><span className="font-semibold text-text">Problems Correct:</span> ___ / 20</p>
              <p><span className="font-semibold text-text">Digits Correct</span> (optional, for finer measurement): ___</p>
            </div>

            {/* Week 2 */}
            <div>
              <h3 className="font-display font-bold text-sm text-text mb-1">Week 2 -- Multiplication Focus (x0, x1, x2, x5, x10)</h3>
              <ProbeTable
                headers={['Row', 'Problem 1', 'Problem 2', 'Problem 3', 'Problem 4', 'Problem 5']}
                rows={[
                  ['A', '5 x 3 =', '2 x 8 =', '10 x 4 =', '1 x 9 =', '5 x 7 ='],
                  ['B', '2 x 6 =', '10 x 7 =', '5 x 5 =', '0 x 8 =', '2 x 9 ='],
                  ['C', '10 x 3 =', '5 x 8 =', '2 x 7 =', '1 x 4 =', '10 x 6 ='],
                  ['D', '5 x 9 =', '0 x 5 =', '2 x 4 =', '10 x 8 =', '5 x 6 ='],
                ]}
              />
            </div>

            {/* Week 3 */}
            <div>
              <h3 className="font-display font-bold text-sm text-text mb-1">Week 3 -- Multiplication & Division</h3>
              <ProbeTable
                headers={['Row', 'Problem 1', 'Problem 2', 'Problem 3', 'Problem 4', 'Problem 5']}
                rows={[
                  ['A', '6 x 4 =', '21 / 3 =', '7 x 5 =', '48 / 8 =', '3 x 9 ='],
                  ['B', '30 / 5 =', '8 x 3 =', '42 / 6 =', '4 x 7 =', '18 / 3 ='],
                  ['C', '9 x 5 =', '36 / 4 =', '6 x 6 =', '54 / 9 =', '7 x 3 ='],
                  ['D', '40 / 8 =', '8 x 7 =', '27 / 3 =', '5 x 8 =', '72 / 9 ='],
                ]}
              />
            </div>

            {/* Week 4 */}
            <div>
              <h3 className="font-display font-bold text-sm text-text mb-1">Week 4 -- Mixed Operations + Fractions Introduction</h3>
              <ProbeTable
                headers={['Row', 'Problem 1', 'Problem 2', 'Problem 3', 'Problem 4', 'Problem 5']}
                rows={[
                  ['A', '456 + 278 =', '7 x 6 =', '803 - 465 =', '63 / 9 =', '1/4 + 1/4 ='],
                  ['B', '8 x 9 =', '1,205 + 897 =', '48 / 6 =', '3/8 + 2/8 =', '600 - 243 ='],
                  ['C', '32 / 4 =', '356 + 167 =', '9 x 7 =', '5/6 - 2/6 =', '2,000 - 548 ='],
                  ['D', '6 x 8 =', '72 / 8 =', '4/5 - 1/5 =', '524 + 389 =', '56 / 7 ='],
                ]}
              />
            </div>

            {/* Week 5 */}
            <div>
              <h3 className="font-display font-bold text-sm text-text mb-1">Week 5 -- Cumulative (All Operations + Fractions)</h3>
              <ProbeTable
                headers={['Row', 'Problem 1', 'Problem 2', 'Problem 3', 'Problem 4', 'Problem 5']}
                rows={[
                  ['A', '9 x 8 =', '4/6 + 1/6 =', '5,034 - 2,567 =', '63 / 7 =', '487 + 356 ='],
                  ['B', '7/10 - 3/10 =', '7 x 7 =', '901 - 458 =', '3/4 + 1/4 =', '54 / 6 ='],
                  ['C', '2,468 + 1,375 =', '48 / 8 =', '6 x 9 =', '5/8 - 3/8 =', '703 - 289 ='],
                  ['D', '81 / 9 =', '3/5 + 1/5 =', '8 x 6 =', '1,600 - 874 =', '42 / 7 ='],
                ]}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Section 4: Comprehension Check */}
        <CollapsibleSection
          icon="📚"
          title="Section 4: Comprehension Check (5 Questions)"
          subtitle="Assess comprehension of a short grade-level passage"
        >
          <div className="space-y-6">
            <div>
              <p className="text-sm text-warm-gray mb-4"><span className="font-semibold text-text">Administration:</span> Student reads the passage silently (or aloud if preferred). Then answers 5 questions without looking back (unless accommodation allows).</p>
            </div>

            {/* Sample Passage */}
            <div>
              <h3 className="font-display font-bold text-sm text-text mb-2">Sample Comprehension Passage -- &quot;The Bee Problem&quot;</h3>
              <div className="bg-cream-deep rounded-xl p-5 text-sm text-warm-gray leading-relaxed italic border-l-4 border-amber">
                <p className="mb-3">Every summer, Mr. Torres notices fewer bees in his garden. Ten years ago, he would see hundreds of bees buzzing around his flowers and vegetable plants. Now he is lucky to spot a dozen in an afternoon.</p>
                <p className="mb-3">Mr. Torres read that bees are important because they pollinate plants. Without bees, many fruits and vegetables would not grow. He learned that bees are disappearing because of pesticides, loss of wildflowers, and diseases.</p>
                <p className="mb-3">He decided to help. First, he stopped using chemicals on his garden. Then he planted wildflowers along the fence -- lavender, clover, and sunflowers. He also built two wooden bee houses and placed them in sunny spots.</p>
                <p>By the end of the summer, Mr. Torres counted more bees than he had seen in years. His tomato plants grew bigger, and he had more peppers than he could eat. He shared the extra vegetables with his neighbors and told them about his bee project. Three of them decided to build bee houses too.</p>
              </div>
            </div>

            {/* Comprehension Questions */}
            <div>
              <h3 className="font-display font-bold text-sm text-text mb-3">Comprehension Questions</h3>
              <ProbeTable
                headers={['#', 'Type', 'Question', 'Student Response', 'Correct?']}
                rows={[
                  ['1', 'Literal', 'What did Mr. Torres notice happening in his garden every summer?', '', ''],
                  ['2', 'Literal', 'Name two things Mr. Torres did to help the bees.', '', ''],
                  ['3', 'Inferential', 'Why do you think Mr. Torres\'s tomato plants grew bigger after more bees came?', '', ''],
                  ['4', 'Inferential', 'What might happen if Mr. Torres\'s neighbors also build bee houses?', '', ''],
                  ['5', 'Vocabulary', 'What does the word "pollinate" mean in this passage?', '', ''],
                ]}
              />
              <p className="text-sm font-semibold text-text mt-3">Comprehension Score: ___ / 5</p>
            </div>

            {/* Additional Passage Suggestions */}
            <div className="bg-sage-pale/40 rounded-xl p-4">
              <h4 className="font-display font-bold text-xs text-text mb-2 uppercase tracking-wider">Additional Passage Suggestions (Rotate Weekly)</h4>
              <ul className="space-y-2 text-sm text-warm-gray">
                <li><span className="font-semibold text-forest">Week 3:</span> An informational passage about bridge building (ties to &quot;Building & Construction&quot; enrichment theme)</li>
                <li><span className="font-semibold text-forest">Week 4:</span> A passage about how machines are taken apart and fixed (ties to &quot;Taking Things Apart&quot; enrichment theme)</li>
                <li><span className="font-semibold text-forest">Week 5:</span> A passage about a kid solving a real-world problem in their community (ties to &quot;Real-World Problem Solvers&quot; theme)</li>
              </ul>
            </div>
          </div>
        </CollapsibleSection>

        {/* Section 5: Weekly Probe Summary */}
        <CollapsibleSection
          icon="📊"
          title="Section 5: Weekly Probe Summary"
          subtitle="Complete after administering all probes | Transfers to parent weekly report"
        >
          <div className="space-y-6">
            <ProbeTable
              headers={['Domain', 'Score', 'Benchmark', 'On Track?', 'Notes']}
              rows={[
                ['ORF (WCPM)', '', 'Grade 3: 90+ / Grade 4: 110+', '', ''],
                ['ORF Accuracy', '', '95%+', '', ''],
                ['Prosody', '/4', '3+', '', ''],
                ['Phonics Pattern', '/10', '8+ (80%)', '', ''],
                ['Math Computation', '/20', '16+ (80%)', '', ''],
                ['Comprehension', '/5', '4+ (80%)', '', ''],
              ]}
            />

            <div className="space-y-4">
              <div className="bg-cream-deep rounded-xl p-4">
                <p className="font-semibold text-sm text-text mb-2">Strengths Observed This Week:</p>
                <div className="w-full h-8 border border-border rounded-lg bg-white" />
              </div>
              <div className="bg-cream-deep rounded-xl p-4">
                <p className="font-semibold text-sm text-text mb-2">Areas for Targeted Practice Next Week:</p>
                <div className="w-full h-8 border border-border rounded-lg bg-white" />
              </div>
              <div className="bg-cream-deep rounded-xl p-4">
                <p className="font-semibold text-sm text-text mb-2">Home Practice Recommendation (15 min/night):</p>
                <div className="w-full h-8 border border-border rounded-lg bg-white" />
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Section 6: Data Recording Grid */}
        <CollapsibleSection
          icon="📈"
          title="Section 6: Data Recording Grid (Class-Wide Tracking)"
          subtitle="Transfer scores after each Friday administration"
        >
          <div className="space-y-6">
            <TrackingGrid
              title="ORF -- Words Correct Per Minute (WCPM)"
              headers={['Student', 'Pre (Wk 1)', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Post (Wk 6)', 'Total Growth']}
            />

            <TrackingGrid
              title="ORF -- Accuracy Percentage"
              headers={['Student', 'Pre (Wk 1)', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Post (Wk 6)', 'Change']}
            />

            <TrackingGrid
              title="Phonics Pattern Mastery (Score out of 10)"
              headers={['Student', 'Wk 2 (Vowel Teams 1)', 'Wk 3 (VT2 + R-Ctrl)', 'Wk 4 (Multisyllabic)', 'Wk 5 (Morphology)']}
            />

            <TrackingGrid
              title="Math Computation Probe (Correct out of 20)"
              headers={['Student', 'Pre (Wk 1)', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Post (Wk 6)', 'Total Growth']}
            />

            <TrackingGrid
              title="Comprehension (Score out of 5)"
              headers={['Student', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Trend']}
            />

            <TrackingGrid
              title="Writing Rubric Scores (Bi-Weekly, Score out of 16)"
              headers={['Student', 'Pre (Wk 1)', 'Wk 3 (Narrative)', 'Wk 5 (Opinion)', 'Post (Wk 6)', 'Growth']}
            />

            {/* Trend Analysis Guide */}
            <div className="mt-6">
              <h3 className="font-display font-bold text-sm text-text mb-3">Trend Analysis Guide</h3>
              <ProbeTable
                headers={['Code', 'Meaning', 'Action']}
                rows={[
                  ['^^', 'Strong upward trend (3+ consecutive increases)', 'Maintain current instruction; consider advancing'],
                  ['^', 'Upward trend (improving)', 'Maintain current instruction'],
                  ['--', 'Stable (no significant change)', 'Review instructional approach; may need adjustment'],
                  ['v', 'Downward trend (declining)', 'Immediate intervention needed; adjust grouping or approach'],
                  ['M', 'Mastery reached (80%+ for 2 consecutive weeks)', 'Move to maintenance; introduce next skill'],
                ]}
              />
            </div>
          </div>
        </CollapsibleSection>
      </div>

      {/* Footer note */}
      <div className="mt-8 bg-sage-pale/30 rounded-xl p-4 text-xs text-text-muted italic text-center">
        This template should be printed or copied fresh for each student for each week. Completed probes are filed in the student&apos;s assessment folder and data is transferred to the class-wide tracking grid. Weekly probe data is the primary source for Friday parent reports.
      </div>
    </div>
  )
}
