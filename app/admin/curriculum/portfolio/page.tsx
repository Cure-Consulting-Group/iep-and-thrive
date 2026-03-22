'use client'

import Link from 'next/link'

const portfolioSections = [
  { section: 'Cover Page', contents: 'Student-decorated cover with name, photo, and goals', tab: 'Front' },
  { section: 'Section 1: About Me', contents: 'Interest survey, learning goals, "About Me" page', tab: '' },
  { section: 'Section 2: Pre-Assessment Snapshot', contents: 'Pre-assessment summary (teacher-completed, 1 page)', tab: '' },
  { section: 'Section 3: Weekly Work Samples', contents: 'Dated work from each week (see weekly guide below)', tab: '' },
  { section: 'Section 4: Self-Assessments', contents: 'Weekly student self-assessment forms', tab: '' },
  { section: 'Section 5: Progress Data', contents: 'Weekly probe graphs (ORF, math, phonics)', tab: '' },
  { section: 'Section 6: Showcase Pieces', contents: 'Polished, revised final pieces selected by student', tab: '' },
  { section: 'Section 7: Post-Assessment & Reflection', contents: 'Post-assessment summary, student reflection, growth comparison', tab: '' },
  { section: 'Section 8: Final Report', contents: 'CSE-ready final report (teacher-completed)', tab: 'Back' },
]

const weeklyItems = [
  {
    week: 1,
    title: 'Foundations & Assessment',
    items: [
      { item: 'Completed interest survey', type: 'Section 1', notes: 'From pre-assessment' },
      { item: '"About Me" page (self-portrait + 3 facts)', type: 'Section 1', notes: 'Created during enrichment' },
      { item: 'My Goals sheet (student-written)', type: 'Section 1', notes: 'Set during goal-setting activity' },
      { item: 'Pre-assessment writing sample', type: 'Section 3', notes: 'Dated, unedited — this is the baseline' },
      { item: 'Pre-assessment summary (1-page teacher version)', type: 'Section 2', notes: 'Highlights strengths and areas of focus' },
      { item: 'Nature observation journal entry', type: 'Section 3', notes: 'First enrichment writing' },
      { item: 'Self-assessment #1', type: 'Section 4', notes: 'End of Week 1' },
    ],
  },
  {
    week: 2,
    title: 'Patterns & Connections',
    items: [
      { item: 'Phonics sort — vowel teams (ai/ay, ee/ea, oa/ow)', type: 'Section 3', notes: 'Completed sort, dated' },
      { item: '"Pattern I Discovered" paragraph', type: 'Section 3', notes: 'First formal paragraph (topic/detail/closing)' },
      { item: 'Multiplication array drawing', type: 'Section 3', notes: 'Concrete-to-representational transition' },
      { item: 'Reading response journal entry', type: 'Section 3', notes: 'Main idea + supporting details graphic organizer' },
      { item: 'Weekly probe data (graph started)', type: 'Section 5', notes: 'Teacher graphs ORF and math data' },
      { item: 'Self-assessment #2', type: 'Section 4', notes: 'End of Week 2' },
    ],
  },
  {
    week: 3,
    title: 'Building Blocks',
    items: [
      { item: 'R-controlled vowel word sort', type: 'Section 3', notes: 'Completed sort, dated' },
      { item: 'Narrative story draft (planning + first draft)', type: 'Section 3', notes: 'Story map + beginning of narrative' },
      { item: 'Division fact family worksheet', type: 'Section 3', notes: 'Shows concrete-to-abstract progression' },
      { item: 'Story elements graphic organizer', type: 'Section 3', notes: 'Character, setting, problem, solution' },
      { item: 'Bridge-building STEM reflection', type: 'Section 3', notes: 'Photo or drawing + written reflection' },
      { item: 'Weekly probe data (graph updated)', type: 'Section 5', notes: '' },
      { item: 'Self-assessment #3', type: 'Section 4', notes: 'End of Week 3' },
    ],
  },
  {
    week: 4,
    title: 'Taking Things Apart',
    items: [
      { item: 'Multisyllabic word "chunk it" practice sheet', type: 'Section 3', notes: 'Shows syllable division strategy' },
      { item: 'Revised narrative story (with descriptive details added)', type: 'Section 3', notes: 'Compare to Week 3 draft' },
      { item: 'Fraction representation work (area models + number lines)', type: 'Section 3', notes: 'Shows CRA progression' },
      { item: 'Inference evidence chart ("I read / I know / So I think")', type: 'Section 3', notes: 'Comprehension strategy application' },
      { item: '"How ___ Works" informational paragraph (optional)', type: 'Section 3', notes: 'If completed' },
      { item: 'Weekly probe data (graph updated)', type: 'Section 5', notes: 'Mid-cycle — note any grouping changes' },
      { item: 'Self-assessment #4', type: 'Section 4', notes: 'End of Week 4' },
    ],
  },
  {
    week: 5,
    title: 'Real-World Applications',
    items: [
      { item: 'Prefix/suffix word web', type: 'Section 3', notes: 'Base word with derived forms' },
      { item: '"Why ___ Matters" opinion essay', type: 'Section 3', notes: 'Full opinion piece with claim + reasons' },
      { item: 'Fraction comparison + operations work', type: 'Section 3', notes: '' },
      { item: 'Data collection project (bar graph or line plot)', type: 'Section 3', notes: 'Real-world measurement connection' },
      { item: 'Persuasive poster or presentation draft', type: 'Section 3', notes: 'Enrichment connection' },
      { item: 'Weekly probe data (graph updated)', type: 'Section 5', notes: '' },
      { item: 'Self-assessment #5', type: 'Section 4', notes: 'End of Week 5' },
    ],
  },
  {
    week: 6,
    title: 'Showcase & Celebrate',
    items: [
      { item: 'Post-assessment writing sample', type: 'Section 7', notes: 'Placed next to pre-assessment for comparison' },
      { item: '"Letter to My Future Self" or "Letter to My Teacher"', type: 'Section 6', notes: 'Showcase piece' },
      { item: 'Selected and revised showcase piece (student choice)', type: 'Section 6', notes: 'Student picks their best work to polish' },
      { item: '"My Math Growth Story" poster or page', type: 'Section 6', notes: 'Visual representation of math learning' },
      { item: 'Student reflection survey', type: 'Section 7', notes: 'Post-program self-assessment' },
      { item: 'Final probe data (graph completed)', type: 'Section 5', notes: 'Full 6-week trend visible' },
      { item: 'Growth comparison page (pre vs. post side by side)', type: 'Section 7', notes: 'Teacher-prepared' },
      { item: 'CSE-ready final report', type: 'Section 8', notes: 'Teacher-completed' },
      { item: 'Self-assessment #6 (final)', type: 'Section 4', notes: 'End of Week 6' },
    ],
  },
]

const rubricSubjects = [
  { subject: 'Reading', prompt: 'How did reading go for me this week?' },
  { subject: 'Writing', prompt: 'How did writing go for me this week?' },
  { subject: 'Math', prompt: 'How did math go for me this week?' },
]

const rubricLevels = [
  'I\'m just starting to learn this.',
  'I\'m getting better.',
  'I\'m doing well!',
  'I\'m really strong at this!',
]

const effortItems = [
  'Tried my best, even when things were hard',
  'Asked for help when I needed it',
  'Was kind to my classmates',
  'Stayed focused during work time',
  'Used the strategies my teacher taught me',
]

const showcaseSteps = [
  {
    step: 1,
    title: 'Choose Your Showcase Pieces',
    timing: 'Monday, Week 6',
    description: 'Select 3-4 pieces from your portfolio that you are most proud of. They should show what you learned this summer.',
    items: [
      'Reading piece: A passage I can read fluently, OR a comprehension response that shows my thinking',
      'Writing piece: My best revised writing (narrative, opinion, or informational)',
      'Math piece: Work that shows my growth (a problem set, fraction work, or my Math Growth Story)',
      'Wildcard: Any piece I\'m proud of (enrichment project, STEM reflection, art, journal entry)',
    ],
  },
  {
    step: 2,
    title: 'Revise and Polish',
    timing: 'Tuesday-Wednesday, Week 6',
    description: 'For each showcase piece:',
    items: [
      'Reread for meaning — Does it make sense?',
      'Check spelling — Circle words I\'m unsure of, try to fix them, ask for help',
      'Check punctuation — Periods, capitals, commas',
      'Check neatness — Is it readable? Should I rewrite a final copy?',
      'Add a title if it doesn\'t have one',
    ],
  },
  {
    step: 3,
    title: 'Write Your Presentation Notes',
    timing: 'Wednesday-Thursday, Week 6',
    description: 'For each piece, prepare to tell your family:',
    items: [
      'What the piece is about',
      'What skill it shows',
      'Why you chose it',
      'What you\'re proud of',
    ],
  },
  {
    step: 4,
    title: 'Set Up Your Display',
    timing: 'Friday morning, Week 6',
    description: '',
    items: [
      'Arrange pieces on the table/display board',
      'Place portfolio open to the growth comparison page',
      'Have your "Letter to My Future Self" or "Letter to My Teacher" ready to share',
      'Practice your presentation with a partner one more time',
    ],
  },
  {
    step: 5,
    title: 'Showcase!',
    timing: 'Friday afternoon, Week 6',
    description: '',
    items: [
      'Greet your family when they arrive',
      'Walk them through your portfolio and showcase pieces',
      'Share your growth data (ORF graph, math progress)',
      'Read them your letter or reflection',
      'Be proud — you earned this!',
    ],
  },
]

const sectionTypeColors: Record<string, string> = {
  'Section 1': 'bg-sage-pale text-forest',
  'Section 2': 'bg-amber-light text-amber',
  'Section 3': 'bg-white text-forest-mid border border-border',
  'Section 4': 'bg-sage-pale text-forest',
  'Section 5': 'bg-cream-deep text-text',
  'Section 6': 'bg-amber-light text-amber',
  'Section 7': 'bg-sage-pale text-forest-light',
  'Section 8': 'bg-forest/10 text-forest',
}

export default function PortfolioGuidePage() {
  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-text-muted mb-6">
        <Link href="/admin/curriculum" className="hover:text-forest transition-colors">
          Curriculum
        </Link>
        <span>/</span>
        <span className="text-text font-semibold">Student Portfolio Guide</span>
      </div>

      {/* Header Banner */}
      <div className="bg-forest-light rounded-2xl p-6 md:p-8 mb-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">&#x1F4C2;</span>
          <div>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wider font-body">
              Summer 2026 &middot; Grades 3&ndash;4
            </p>
            <h1 className="font-display text-2xl font-bold">Student Portfolio Guide</h1>
          </div>
        </div>
        <p className="text-white/70 text-sm italic mt-1 font-body">
          Documentation, reflection, and advocacy tool
        </p>
      </div>

      {/* Purpose Section */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-8">
        <h2 className="font-display text-lg font-bold text-text mb-4 flex items-center gap-2">
          <span className="text-base">&#x1F3AF;</span> Purpose
        </h2>
        <p className="text-sm text-warm-gray leading-relaxed mb-4 font-body">
          The student portfolio serves three goals:
        </p>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-forest text-white text-xs font-bold font-body shrink-0">1</span>
            <div>
              <p className="text-sm font-semibold text-text font-body">Document growth</p>
              <p className="text-sm text-warm-gray font-body">Tangible evidence of skill development from Week 1 through Week 6</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-forest text-white text-xs font-bold font-body shrink-0">2</span>
            <div>
              <p className="text-sm font-semibold text-text font-body">Empower students</p>
              <p className="text-sm text-warm-gray font-body">Give students ownership of their learning through self-assessment and reflection</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-forest text-white text-xs font-bold font-body shrink-0">3</span>
            <div>
              <p className="text-sm font-semibold text-text font-body">Support advocacy</p>
              <p className="text-sm text-warm-gray font-body">Provide families with organized, dated work samples to bring to September CSE meetings alongside the final report</p>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Structure (Table of Contents) */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-8">
        <h2 className="font-display text-lg font-bold text-text mb-2 flex items-center gap-2">
          <span className="text-base">&#x1F4D1;</span> Portfolio Structure
        </h2>
        <p className="text-sm text-text-muted mb-4 font-body">
          Each student receives a two-pocket folder with fasteners (or a 3-ring binder with dividers).
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wider text-forest-light">Section</th>
                <th className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wider text-forest-light">Contents</th>
                <th className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wider text-forest-light">Page/Tab</th>
              </tr>
            </thead>
            <tbody>
              {portfolioSections.map((s, i) => (
                <tr key={i} className={`border-b border-border/50 ${i % 2 === 0 ? 'bg-cream/50' : ''}`}>
                  <td className="py-2.5 px-3 font-semibold text-text">{s.section}</td>
                  <td className="py-2.5 px-3 text-warm-gray">{s.contents}</td>
                  <td className="py-2.5 px-3 text-text-muted">{s.tab || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* What Goes in Each Week */}
      <div className="mb-8">
        <h2 className="font-display text-lg font-bold text-text mb-4 flex items-center gap-2">
          <span className="text-base">&#x1F4C5;</span> What Goes in Each Week
        </h2>
        <div className="space-y-6">
          {weeklyItems.map((week) => (
            <div key={week.week} className="bg-white rounded-2xl border border-border overflow-hidden">
              <div className="bg-forest/5 border-b border-border px-5 py-3.5 flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-forest text-white text-sm font-bold font-display shrink-0">
                  {week.week}
                </span>
                <div>
                  <h3 className="font-display font-bold text-text text-sm">
                    Week {week.week} &mdash; &ldquo;{week.title}&rdquo;
                  </h3>
                  <p className="text-xs text-text-muted font-body">{week.items.length} items</p>
                </div>
              </div>
              <div className="p-5 space-y-2.5">
                {week.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <svg className="w-4 h-4 text-forest-light shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-text font-body">{item.item}</span>
                        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${sectionTypeColors[item.type] || 'bg-sage-pale text-forest'}`}>
                          {item.type}
                        </span>
                      </div>
                      {item.notes && (
                        <p className="text-xs text-text-muted mt-0.5 font-body">{item.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Self-Assessment Rubric */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-8">
        <h2 className="font-display text-lg font-bold text-text mb-2 flex items-center gap-2">
          <span className="text-base">&#x1F4CA;</span> Student Self-Assessment Rubric
        </h2>
        <p className="text-sm text-text-muted mb-6 font-body">
          Completed by the student each Friday. Designed to be kid-friendly while building metacognitive skills. Read aloud and model during Week 1.
        </p>

        {/* Subject rubric table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm font-body border border-border rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-forest text-white">
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider">Subject</th>
                {rubricLevels.map((level, i) => (
                  <th key={i} className="text-center py-3 px-3 text-xs font-semibold">
                    {level}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rubricSubjects.map((subject, i) => (
                <tr key={subject.subject} className={`border-b border-border/50 ${i % 2 === 0 ? 'bg-sage-pale/20' : 'bg-white'}`}>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-text">{subject.subject}</p>
                    <p className="text-xs text-text-muted mt-0.5">{subject.prompt}</p>
                  </td>
                  {rubricLevels.map((_, j) => (
                    <td key={j} className="text-center py-3 px-3">
                      <span className={`inline-block w-5 h-5 rounded-full border-2 ${
                        j === 0 ? 'border-amber/40' :
                        j === 1 ? 'border-amber' :
                        j === 2 ? 'border-forest-light' :
                        'border-forest'
                      }`} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Follow-up prompts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-cream-deep rounded-xl p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-forest-light mb-2 font-body">For each subject</p>
            <ul className="space-y-1.5 text-sm text-warm-gray font-body">
              <li>&ldquo;One thing I did well this week:&rdquo; ___</li>
              <li>&ldquo;Something I want to keep working on:&rdquo; ___</li>
            </ul>
          </div>
          <div className="bg-cream-deep rounded-xl p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-forest-light mb-2 font-body">Goal setting</p>
            <ul className="space-y-1.5 text-sm text-warm-gray font-body">
              <li>&ldquo;My favorite moment this week was:&rdquo; ___</li>
              <li>&ldquo;Next week, I want to work on:&rdquo; ___</li>
            </ul>
          </div>
        </div>

        {/* Effort & Attitude */}
        <div className="bg-sage-pale/30 rounded-xl p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-forest mb-3 font-body">My Effort &amp; Attitude &mdash; &ldquo;This week, I:&rdquo;</p>
          <div className="space-y-2">
            {effortItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="inline-flex items-center justify-center w-4.5 h-4.5 rounded border-2 border-forest-light/40 shrink-0">
                  <span className="w-2 h-2" />
                </span>
                <span className="text-sm text-warm-gray font-body">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Showcase Checklist */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-8">
        <h2 className="font-display text-lg font-bold text-text mb-2 flex items-center gap-2">
          <span className="text-base">&#x1F3C6;</span> Showcase Preparation Checklist
        </h2>
        <p className="text-sm text-text-muted mb-6 font-body">
          Used during Week 6 to prepare for the End-of-Program Family Showcase on Friday, August 15.
        </p>

        <div className="space-y-6">
          {showcaseSteps.map((step) => (
            <div key={step.step} className="relative pl-10">
              {/* Step number */}
              <span className="absolute left-0 top-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber text-white text-xs font-bold font-body">
                {step.step}
              </span>

              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-display font-bold text-sm text-text">{step.title}</h3>
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-amber-light text-amber px-2 py-0.5 rounded-full font-body">
                    {step.timing}
                  </span>
                </div>
                {step.description && (
                  <p className="text-xs text-text-muted mb-2 font-body">{step.description}</p>
                )}
                <div className="space-y-1.5">
                  {step.items.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded border-2 border-forest-light/50 shrink-0 mt-0.5">
                        <span className="w-2 h-2" />
                      </span>
                      <span className="text-sm text-warm-gray font-body">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connector line */}
              {step.step < 5 && (
                <div className="absolute left-3.5 top-8 w-px h-[calc(100%-8px)] bg-border" />
              )}
            </div>
          ))}
        </div>

        {/* Presentation sentence starters */}
        <div className="mt-6 bg-sage-pale/30 rounded-xl p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-forest mb-3 font-body">
            Presentation Sentence Starters
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              '"I chose this piece because..."',
              '"This shows that I learned how to..."',
              '"I\'m proud of this because..."',
              '"At the beginning of the summer, I couldn\'t... but now I can..."',
            ].map((starter, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-forest-light text-sm mt-px shrink-0">&bull;</span>
                <span className="text-sm text-warm-gray italic font-body">{starter}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Teacher Notes */}
      <div className="bg-cream-deep rounded-2xl border border-border p-6 mb-8">
        <h2 className="font-display text-lg font-bold text-text mb-4 flex items-center gap-2">
          <span className="text-base">&#x1F4DD;</span> Teacher Notes: Portfolio Management
        </h2>

        {/* Weekly routine */}
        <div className="bg-white rounded-xl p-4 mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-forest-light mb-3 font-body">Weekly Routine</p>
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-forest text-white px-2 py-0.5 rounded-full font-body shrink-0 mt-0.5">Mon</span>
              <span className="text-sm text-warm-gray font-body">File previous week&apos;s self-assessment; place new work in portfolio</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-amber text-white px-2 py-0.5 rounded-full font-body shrink-0 mt-0.5">Fri</span>
              <span className="text-sm text-warm-gray font-body">Student completes self-assessment; teacher updates probe data graphs</span>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-white rounded-xl p-4 mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-forest-light mb-3 font-body">Tips</p>
          <ul className="space-y-2">
            {[
              'Date every piece of student work as it goes into the portfolio',
              'Use sticky notes to add brief teacher observations to notable pieces (e.g., "First time using dialogue correctly!" or "Applied chunk-it strategy independently")',
              'Keep pre-assessment writing sample in a page protector so it stays in good condition for the side-by-side comparison',
              'For the ORF and math data graphs, use simple bar charts that students can color in themselves — this builds ownership',
              'During Week 6 revision, help students see their growth by physically placing early and late work side by side',
              'Photograph any 3D projects (STEM builds, art) to include a printed photo in the portfolio',
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-warm-gray font-body">
                <svg className="w-4 h-4 text-forest-light shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Portfolio as CSE Evidence */}
        <div className="bg-white rounded-xl p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-forest-light mb-3 font-body">Portfolio as CSE Evidence</p>
          <p className="text-sm text-warm-gray mb-3 font-body">
            The completed portfolio, combined with the final report, provides families with:
          </p>
          <ul className="space-y-2">
            {[
              { label: 'Dated work samples', desc: 'showing progression across 6 weeks' },
              { label: 'Quantitative data', desc: '(ORF WCPM trend, math probe scores, phonics mastery percentages)' },
              { label: 'Qualitative evidence', desc: '(writing quality improvement, strategy use, self-assessment growth)' },
              { label: 'Student voice', desc: '(self-assessments, reflections, goal-setting)' },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm font-body">
                <svg className="w-4 h-4 text-amber shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>
                  <strong className="text-text">{item.label}</strong>{' '}
                  <span className="text-warm-gray">{item.desc}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-warm-gray mt-3 font-body">
            Parents should be encouraged to bring the portfolio and final report to their child&apos;s September CSE or parent-teacher meeting. The combination of data and work samples creates a compelling case for continued services, adjusted goals, or program recommendations.
          </p>
        </div>
      </div>

      {/* Footer note */}
      <div className="text-center py-4">
        <p className="text-xs text-text-muted italic font-body">
          This portfolio guide is part of the IEP &amp; Thrive Summer 2026 assessment and documentation system. The portfolio is the student&apos;s property and goes home with the family at the end of the program.
        </p>
      </div>
    </div>
  )
}
