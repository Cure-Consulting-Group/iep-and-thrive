'use client'

import { useState } from 'react'
import Link from 'next/link'

const weekOverviews = [
  {
    week: 1,
    title: 'Foundations & Assessment',
    theme: 'Who We Are as Learners',
    blocks: [
      { name: 'Reading/Phonics', focus: 'Review & Diagnostic', details: 'Short vowels (CVC), consonant blends, digraphs (sh, ch, th, wh, ck); Closed syllable review; High-frequency red words assessment; OG entry point established per student' },
      { name: 'Comprehension', focus: 'Active Reading Strategies', details: 'Making predictions, monitoring comprehension, retelling (beginning/middle/end); Introduction of reading response journals' },
      { name: 'Writing', focus: 'Baseline Writing Sample + Journal Setup', details: 'Personal narrative prompt (diagnostic); Set up "My Summer Learning Journal"; Sentence structure review (subject/predicate)' },
      { name: 'Math', focus: 'Number Sense Foundation', details: 'Place value to 10,000 (3rd) / 100,000 (4th); Rounding and estimation; Number line placement and comparison; Addition/subtraction fact fluency diagnostic' },
      { name: 'Enrichment', focus: 'Getting to Know Our World', details: 'Mon: Nature walk + observation journal; Tue: "All About Me" museum of personal artifacts; Wed: Build a structure that represents you (STEM); Thu: Classroom economy introduction (life skills); Fri: Self-portrait + goal-setting art' },
      { name: 'Assessment', focus: 'Pre-Assessment Battery', details: 'ORF (oral reading fluency), phonics screener, sight word inventory, math computation probe, writing sample' },
    ],
    iepGoals: 'Decoding, fluency, number sense, written expression',
  },
  {
    week: 2,
    title: 'Patterns & Connections',
    theme: 'Patterns in Language and Numbers',
    blocks: [
      { name: 'Reading/Phonics', focus: 'Vowel Teams (Part 1)', details: 'Vowel teams: ai/ay, ee/ea, oa/ow; Multisensory drill: sky writing, sand trays, phonogram cards; Decodable text practice with target patterns; Red words: said, they, were, could, would' },
      { name: 'Comprehension', focus: 'Main Idea & Supporting Details', details: 'Identifying topic vs. main idea; Finding supporting details in informational text; Graphic organizer: main idea web' },
      { name: 'Writing', focus: 'Paragraph Structure', details: 'Topic sentence, detail sentences, closing sentence; Modeled \u2192 shared \u2192 guided \u2192 independent writing progression; Paragraph about a pattern observed in nature (enrichment connection)' },
      { name: 'Math', focus: 'Multiplication Concepts (Part 1)', details: 'Equal groups with manipulatives (concrete); Arrays: building and drawing; Skip counting connection to multiplication; Fact strategies: x0, x1, x2, x5, x10' },
      { name: 'Enrichment', focus: 'Patterns Everywhere', details: 'Mon: Nature patterns \u2014 symmetry in leaves, spirals in shells; Tue: Patterns in art & architecture (museum/virtual); Wed: Pattern-based coding challenge (STEM); Thu: Recipe patterns \u2014 doubling/halving ingredients; Fri: Tessellation art + pattern poetry' },
      { name: 'Assessment', focus: 'Weekly Probe #1', details: 'ORF passage, phonics pattern sort (vowel teams), multiplication facts timed probe' },
    ],
    iepGoals: 'Decoding (vowel teams), comprehension (main idea), math computation (multiplication)',
  },
  {
    week: 3,
    title: 'Building Blocks',
    theme: 'How Things Are Built \u2014 Words, Numbers, Structures',
    blocks: [
      { name: 'Reading/Phonics', focus: 'Vowel Teams (Part 2) + R-Controlled Vowels', details: 'Vowel teams: oi/oy, ou/ow, au/aw; R-controlled vowels: ar, or, er/ir/ur; Syllable type review: closed, open, VCe, vowel team, r-controlled; Multisensory: arm tapping for syllable division' },
      { name: 'Comprehension', focus: 'Story Elements & Sequencing', details: 'Characters, setting, problem, solution; Sequencing with transition words (first, next, then, finally); Comparing across two texts' },
      { name: 'Writing', focus: 'Narrative Writing (Beginning)', details: 'Story planning: character, setting, problem; Writing strong openings (hooks); Dialogue introduction \u2014 punctuation and purpose; Connection to enrichment: write a story set in a museum/building' },
      { name: 'Math', focus: 'Multiplication & Division Concepts', details: 'Division as sharing and grouping (concrete with counters); Relationship between multiplication and division; Fact families; Word problem schemas: equal groups, comparison' },
      { name: 'Enrichment', focus: 'Building & Construction', details: 'Mon: Build a nature shelter (outdoor engineering); Tue: Architecture \u2014 how buildings tell stories (cultural); Wed: Bridge-building STEM challenge (load testing); Thu: Budget a building project (life skills math); Fri: Collaborative mural \u2014 building a community' },
      { name: 'Assessment', focus: 'Weekly Probe #2 + Mid-Cycle Check #1', details: 'ORF, r-controlled vowel sort, multiplication/division probe; Adjust groupings based on 2-week data' },
    ],
    iepGoals: 'Decoding (r-controlled), comprehension (story elements), written expression (narrative), math computation (multiplication/division)',
  },
  {
    week: 4,
    title: 'Breaking It Down',
    theme: 'Taking Things Apart to Understand Them',
    blocks: [
      { name: 'Reading/Phonics', focus: 'Syllable Division + Multisyllabic Words', details: 'VCCV division: rab-bit, nap-kin, bas-ket; VCV division: o-pen, riv-er, mo-ment; Compound words: breaking apart and combining; Consonant-le syllable: ta-ble, sim-ple, puz-zle; Strategy: "chunk it" approach to big words' },
      { name: 'Comprehension', focus: 'Inference & Text Evidence', details: '"I read\u2026 I know\u2026 So I think\u2026" framework; Finding evidence to support answers; Asking and answering questions about text; Informational text features (headings, captions, diagrams)' },
      { name: 'Writing', focus: 'Narrative Writing (Continued) + Informational', details: 'Narrative: writing the middle and end; Adding descriptive details (show, don\'t tell); Introduction to informational writing: "How Things Work" paragraph; Connection to enrichment: explain how something is built/made' },
      { name: 'Math', focus: 'Fractions (Part 1)', details: 'Unit fractions on number lines (concrete: fraction strips); Naming and representing fractions (area models); Equivalent fractions with manipulatives; Comparing fractions: same numerator, same denominator' },
      { name: 'Enrichment', focus: 'Taking Things Apart', details: 'Mon: Dissecting plants \u2014 parts and functions; Tue: How museums preserve artifacts (conservation); Wed: Take apart electronics (safe disassembly + STEM); Thu: Deconstructing a recipe \u2014 what does each ingredient do?; Fri: Collage art \u2014 deconstructing and reconstructing images' },
      { name: 'Assessment', focus: 'Weekly Probe #3 + Mid-Cycle Check #2', details: 'ORF, multisyllabic word reading list, fraction identification probe; Adjust pacing for final 2 weeks' },
    ],
    iepGoals: 'Decoding (multisyllabic), comprehension (inference), written expression (descriptive detail), math concepts (fractions)',
  },
  {
    week: 5,
    title: 'Real-World Applications',
    theme: 'Using What We Know in the Real World',
    blocks: [
      { name: 'Reading/Phonics', focus: 'Morphology \u2014 Prefixes & Suffixes', details: 'Inflectional endings: -s, -es, -ed, -ing, -er, -est; Spelling rules: doubling, drop-e, change-y; Common prefixes: un-, re-, pre-, dis-; Common suffixes: -ful, -less, -ness, -ly; Word webs: base word \u2192 derived forms' },
      { name: 'Comprehension', focus: "Author's Purpose & Text Features", details: 'Persuade, inform, entertain; Using text features to locate information; Summarizing informational text; Connecting reading to real-world contexts' },
      { name: 'Writing', focus: 'Opinion/Persuasive Writing', details: 'Stating a claim with reasons; Using transition words (first, also, because, finally); Persuasive letter: convince someone to visit a place or try something; Portfolio piece: "Why ___ Matters" essay' },
      { name: 'Math', focus: 'Fractions (Part 2) + Measurement', details: 'Comparing fractions with benchmarks (0, 1/2, 1); Adding/subtracting fractions with like denominators (4th grade); Time, money, and measurement in real-world contexts; Data collection, bar graphs, line plots' },
      { name: 'Enrichment', focus: 'Real-World Problem Solvers', details: 'Mon: Environmental stewardship \u2014 measuring a garden plot; Tue: Community helpers \u2014 interview + research project; Wed: Design a solution to a real problem (STEM); Thu: Grocery store math \u2014 budgeting a meal; Fri: Persuasive poster/presentation creation' },
      { name: 'Assessment', focus: 'Weekly Probe #4', details: 'ORF, morphology assessment (prefix/suffix meanings), fraction comparison probe, writing rubric (opinion piece)' },
    ],
    iepGoals: 'Decoding (morphology), comprehension (author\'s purpose), written expression (opinion), math concepts (fractions, measurement)',
  },
  {
    week: 6,
    title: 'Showcase & Celebrate',
    theme: 'Showing What We\'ve Learned',
    blocks: [
      { name: 'Reading/Phonics', focus: 'Advanced Patterns + Fluency Focus', details: 'Soft c/g patterns (city, gem); Silent letter patterns (kn, wr, gn, mb); Homophones and homographs; Fluency building: repeated reading, phrase reading, prosody; Cumulative OG review \u2014 all patterns taught' },
      { name: 'Comprehension', focus: 'Synthesis & Reflection', details: 'Connecting ideas across texts; "How has my thinking changed?"; Reading response: favorite book/text from the summer; Metacognitive reflection: "What reading strategies help me most?"' },
      { name: 'Writing', focus: 'Portfolio Assembly + Showcase Preparation', details: 'Revising and editing selected pieces for portfolio; Writing a "Letter to My Future Self" or "Letter to My Teacher"; Showcase script/presentation notes; Reflective writing: "What I learned this summer"' },
      { name: 'Math', focus: 'Problem Solving + Review + Showcase', details: 'Multi-step word problems (cumulative); Strategy toolkit review (draw a picture, make a table, work backward); Math portfolio assembly; Showcase preparation: "My Math Growth Story" poster' },
      { name: 'Enrichment', focus: 'Celebration of Learning', details: 'Mon: Nature reflection walk \u2014 compare to Week 1 observations; Tue: Create a mini-museum exhibit of summer learning; Wed: Final STEM challenge \u2014 combine all skills; Thu: Plan and "host" a celebration (life skills); Fri: END-OF-PROGRAM SHOWCASE for families' },
      { name: 'Assessment', focus: 'Post-Assessment + Portfolio Review', details: 'Post-assessment battery (mirrors pre-assessment); Portfolio completion and self-assessment; CSE-ready final report data compilation' },
    ],
    iepGoals: 'All domains \u2014 cumulative review and demonstration of growth',
  },
]

const phonicsProgression = [
  { week: 1, focus: 'Review: CVC, blends, digraphs', syllableTypes: 'Closed', redWords: 'the, was, is, are, have, come, some, one, said, they' },
  { week: 2, focus: 'Vowel teams: ai/ay, ee/ea, oa/ow', syllableTypes: 'Closed, Open, VCe, Vowel Team', redWords: 'could, would, should, again, because, people, friend' },
  { week: 3, focus: 'Vowel teams: oi/oy, ou/ow, au/aw; R-controlled: ar, or, er/ir/ur', syllableTypes: '+ R-Controlled', redWords: 'thought, through, enough, laugh, bought, caught' },
  { week: 4, focus: 'Syllable division: VCCV, VCV; Compound words; C+le', syllableTypes: '+ Consonant-le', redWords: 'answer, listen, often, island, science, special' },
  { week: 5, focus: 'Morphology: prefixes (un-, re-, pre-, dis-), suffixes (-ful, -less, -ness, -ly); Spelling rules', syllableTypes: 'All types in multisyllabic', redWords: 'beautiful, different, important, probably, suddenly' },
  { week: 6, focus: 'Soft c/g, silent letters, homophones; Cumulative review & fluency', syllableTypes: 'All types \u2014 cumulative', redWords: 'Review all + student-specific words from writing' },
]

const mathProgression = [
  { week: 1, focus: 'Place value, rounding, estimation, fact fluency', concrete: 'Base-ten blocks, place value discs, number lines', representational: 'Place value charts, number line drawings', abstract: 'Standard notation, rounding rules' },
  { week: 2, focus: 'Multiplication: equal groups, arrays, x0/x1/x2/x5/x10', concrete: 'Counters, tiles, snap cubes', representational: 'Array drawings, equal group circles', abstract: 'Multiplication equations, fact practice' },
  { week: 3, focus: 'Division: sharing/grouping, fact families, word problems', concrete: 'Counters for sharing, division mats', representational: 'Grouping diagrams, bar models', abstract: 'Division equations, fact families' },
  { week: 4, focus: 'Fractions: unit fractions, naming, equivalence, comparing', concrete: 'Fraction strips, pattern blocks, fraction circles', representational: 'Area models, number line diagrams', abstract: 'Fraction notation, comparison symbols' },
  { week: 5, focus: 'Fractions (cont.), time, money, measurement, data', concrete: 'Clocks, coins, rulers, measuring tools', representational: 'Bar graphs, line plots, measurement drawings', abstract: 'Computation with measurement units' },
  { week: 6, focus: 'Multi-step problems, strategy review, portfolio', concrete: 'All manipulatives available as choice', representational: 'Student-selected models', abstract: 'Cumulative problem sets' },
]

const writingProgression = [
  { week: 1, focus: 'Baseline sample; Sentence structure review; Journal setup', mentorText: 'Personal narrative models', portfolio: 'Diagnostic writing sample (kept for comparison)' },
  { week: 2, focus: 'Paragraph structure (topic/detail/closing)', mentorText: 'Informational paragraphs', portfolio: '"Pattern I Discovered" paragraph' },
  { week: 3, focus: 'Narrative: planning, openings, dialogue', mentorText: "Published children's narratives", portfolio: 'Narrative story (drafting)' },
  { week: 4, focus: 'Narrative: middle/end, descriptive detail; Informational intro', mentorText: '"How Things Work" texts', portfolio: 'Narrative story (revised) OR "How ___ Works" piece' },
  { week: 5, focus: 'Opinion/persuasive writing with reasons', mentorText: 'Persuasive letters, reviews', portfolio: '"Why ___ Matters" opinion essay' },
  { week: 6, focus: 'Revision, editing, portfolio assembly; Reflective writing', mentorText: "Student's own previous drafts", portfolio: '"Letter to My Future Self" + portfolio reflection' },
]

const materialsData = {
  literacy: [
    'OG phonogram card deck (consonants, vowels, digraphs, blends, vowel teams)',
    'Red word card set (high-frequency irregular words)',
    'Sand trays or salt trays (multisensory letter formation)',
    'Magnetic letter tiles',
    'Dry-erase boards + markers (individual student boards)',
    'Decodable text sets (OG-aligned, leveled for grades 2\u20134)',
    'Guided reading book sets (Levels J\u2013P, fiction and informational)',
    'Composition notebooks (student journals)',
    'Graphic organizer templates (main idea web, story map, Venn diagram, opinion frame)',
    'Sentence strips',
    'Highlighters (3 colors per student)',
    'Reading fluency passages (grade-level + instructional level)',
  ],
  math: [
    'Base-ten blocks (units, rods, flats, cubes)',
    'Place value discs (ones through ten-thousands)',
    'Snap cubes / unifix cubes',
    'Counters (two-color)',
    'Fraction strips / fraction circles',
    'Pattern blocks',
    'Number lines (desktop-size, 0\u2013100 and 0\u20132 for fractions)',
    'Analog clocks (student-size)',
    'Play money (coins and bills)',
    'Rulers (inches and centimeters)',
    'Graph paper',
    'Dice (6-sided and 10-sided)',
    'Multiplication/division flash cards',
  ],
  general: [
    'Chart paper and easel',
    'Markers (teacher set + student sets)',
    'Colored pencils',
    'Scissors, glue sticks, tape',
    'Construction paper',
    'Folders (student portfolio folders \u2014 1 per student)',
    'Sticky notes (3x3 and flag size)',
    'Timer (visual countdown timer)',
    'Self-monitoring checklists (laminated, reusable)',
    'Sticker charts / reward system materials',
    'Name tents / table labels',
    'Visual daily schedule cards',
  ],
  enrichment: [
    'Nature journals (blank sketch + lined pages)',
    'Magnifying glasses',
    'Building materials: craft sticks, cardboard, tape, straws, marshmallows',
    'Basic cooking supplies: measuring cups/spoons, mixing bowls, aprons',
    'Art supplies: watercolors, pastels, collage materials',
    'Science supplies: baking soda, vinegar, food coloring, magnets, simple circuits',
    'Old electronics for safe disassembly (keyboards, calculators, clocks)',
  ],
}

const iepGoalBank = [
  {
    domain: 'Reading \u2014 Decoding',
    goals: [
      'Given a list of grade-level words containing [vowel teams / r-controlled vowels / multisyllabic words], [student] will decode with \u226580% accuracy as measured by teacher-created assessments.',
      'When presented with multisyllabic words, [student] will apply syllable division strategies to decode with \u226575% accuracy across 3 consecutive probes.',
    ],
  },
  {
    domain: 'Reading \u2014 Fluency',
    goals: [
      '[Student] will read a grade-level passage at \u2265[X] words correct per minute with \u226595% accuracy as measured by weekly ORF probes.',
      '[Student] will read aloud with appropriate prosody (expression, phrasing, pace) scoring \u22653/4 on the NAEP fluency rubric.',
    ],
  },
  {
    domain: 'Reading \u2014 Comprehension',
    goals: [
      'After reading a grade-level passage, [student] will identify the main idea and 2 supporting details with \u226580% accuracy.',
      '[Student] will make inferences using text evidence, answering inferential questions with \u226575% accuracy across fiction and informational text.',
      'Given a narrative text, [student] will identify story elements (character, setting, problem, solution) with \u226580% accuracy.',
    ],
  },
  {
    domain: 'Written Expression',
    goals: [
      '[Student] will write a [narrative/opinion/informational] paragraph with a topic sentence, 3+ supporting details, and a closing sentence, scoring \u22653/4 on a grade-level rubric.',
      '[Student] will apply grade-level spelling patterns in written work with \u226580% accuracy as measured by weekly writing samples.',
    ],
  },
  {
    domain: 'Math \u2014 Computation',
    goals: [
      '[Student] will solve [multiplication/division] problems within 100 with \u226585% accuracy as measured by weekly computation probes.',
      '[Student] will identify, compare, and order fractions using models and number lines with \u226580% accuracy.',
    ],
  },
  {
    domain: 'Math \u2014 Problem Solving',
    goals: [
      '[Student] will solve 1- and 2-step word problems involving [operations] with \u226575% accuracy, showing work using a model or diagram.',
    ],
  },
  {
    domain: 'Executive Function (Cross-Curricular)',
    goals: [
      '[Student] will independently use a self-monitoring checklist to complete multi-step tasks with \u226580% independence across 3 consecutive observations.',
      '[Student] will demonstrate on-task behavior for \u2265[X] minutes during independent work as measured by interval recording.',
    ],
  },
]

const assessmentCheckpoints = [
  { timing: 'Week 1 Day 1', assessment: 'Pre-Assessment (Reading + Math)', purpose: 'Establish baselines, determine OG entry point, form flexible groups' },
  { timing: 'End of Week 2', assessment: 'Mid-Cycle Check #1', purpose: 'Adjust groupings and pacing' },
  { timing: 'End of Week 4', assessment: 'Mid-Cycle Check #2', purpose: 'Verify progress trajectory, adjust final 2 weeks' },
  { timing: 'Week 6 Day 4', assessment: 'Post-Assessment (Reading + Math)', purpose: 'Measure growth, generate CSE-ready data' },
  { timing: 'Weekly (Fridays)', assessment: 'Progress Monitoring Probes', purpose: 'CBM probes (ORF, maze, computation) for parent reports' },
]

const programParameters = [
  { param: 'Duration', detail: '6 Weeks (July 7 \u2013 August 15, 2026)' },
  { param: 'Schedule', detail: 'Monday \u2013 Friday, 9:00 AM \u2013 1:00 PM' },
  { param: 'Group Size', detail: '8\u201310 students' },
  { param: 'Grades', detail: 'Rising 3rd\u20134th' },
  { param: 'Literacy Framework', detail: 'Orton-Gillingham (multisensory, systematic, explicit)' },
  { param: 'Math Framework', detail: 'Concrete-Representational-Abstract (CRA)' },
  { param: 'Assessment', detail: 'Pre/post diagnostic + weekly progress monitoring' },
  { param: 'Deliverables', detail: 'Weekly parent updates, student portfolio, CSE-ready final report' },
]

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-5 h-5 text-forest-light transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-forest-light shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

export default function ScopeAndSequencePage() {
  const [openWeeks, setOpenWeeks] = useState<Record<number, boolean>>({})

  const toggleWeek = (week: number) => {
    setOpenWeeks((prev) => ({ ...prev, [week]: !prev[week] }))
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-text-muted mb-6">
        <Link href="/admin/curriculum" className="hover:text-forest transition-colors">
          Curriculum
        </Link>
        <span>/</span>
        <span className="text-text font-semibold">Scope & Sequence</span>
      </div>

      {/* Header */}
      <div className="bg-forest rounded-2xl p-6 md:p-8 mb-8 text-white">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-1">
              6-Week Curriculum Overview
            </p>
            <h1 className="font-display text-2xl md:text-3xl font-bold">
              Scope & Sequence
            </h1>
            <p className="text-white/70 text-sm mt-2 max-w-2xl">
              Grades 3&ndash;4 &middot; Orton-Gillingham Framework &middot; CRA Math &middot; NYS CCLS Aligned
            </p>
          </div>
        </div>
        <div className="mt-4 bg-white/10 rounded-xl px-4 py-2.5 text-sm text-white/80">
          <span className="font-semibold">IEP Goal Domains:</span> Reading Fluency, Decoding, Comprehension, Written Expression, Math Computation, Math Problem-Solving, Executive Function
        </div>
      </div>

      {/* Program Parameters */}
      <section className="mb-10">
        <h2 className="font-display text-xl font-bold text-text mb-4">Program Parameters</h2>
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-cream-deep">
                <th className="text-left px-5 py-3 font-semibold text-forest text-xs uppercase tracking-wider">Parameter</th>
                <th className="text-left px-5 py-3 font-semibold text-forest text-xs uppercase tracking-wider">Detail</th>
              </tr>
            </thead>
            <tbody>
              {programParameters.map((row, i) => (
                <tr key={row.param} className={i < programParameters.length - 1 ? 'border-b border-border' : ''}>
                  <td className="px-5 py-3 font-semibold text-text">{row.param}</td>
                  <td className="px-5 py-3 text-warm-gray">{row.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Assessment Checkpoints */}
      <section className="mb-10">
        <h2 className="font-display text-xl font-bold text-text mb-4">Assessment Checkpoints</h2>
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-cream-deep">
                <th className="text-left px-5 py-3 font-semibold text-forest text-xs uppercase tracking-wider">Timing</th>
                <th className="text-left px-5 py-3 font-semibold text-forest text-xs uppercase tracking-wider">Assessment</th>
                <th className="text-left px-5 py-3 font-semibold text-forest text-xs uppercase tracking-wider">Purpose</th>
              </tr>
            </thead>
            <tbody>
              {assessmentCheckpoints.map((row, i) => (
                <tr key={row.timing} className={i < assessmentCheckpoints.length - 1 ? 'border-b border-border' : ''}>
                  <td className="px-5 py-3 font-semibold text-text whitespace-nowrap">{row.timing}</td>
                  <td className="px-5 py-3 text-text">{row.assessment}</td>
                  <td className="px-5 py-3 text-warm-gray">{row.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 6-Week Overview Grid */}
      <section className="mb-10">
        <h2 className="font-display text-xl font-bold text-text mb-4">6-Week Overview</h2>
        <div className="space-y-3">
          {weekOverviews.map((week) => {
            const isOpen = openWeeks[week.week] || false
            return (
              <div key={week.week} className="bg-white rounded-2xl border border-border overflow-hidden">
                <button
                  onClick={() => toggleWeek(week.week)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-cream-deep/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-display text-lg font-bold text-forest w-16 shrink-0">
                      Week {week.week}
                    </span>
                    <div>
                      <p className="font-display font-bold text-text text-sm">{week.title}</p>
                      <p className="text-xs text-text-muted italic">{week.theme}</p>
                    </div>
                  </div>
                  <ChevronIcon open={isOpen} />
                </button>

                {isOpen && (
                  <div className="border-t border-border">
                    <div className="divide-y divide-border">
                      {week.blocks.map((block) => (
                        <div key={block.name} className="px-5 py-4">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[10px] font-semibold uppercase tracking-wider bg-sage-pale text-forest px-2.5 py-0.5 rounded-full">
                              {block.name}
                            </span>
                            <span className="font-semibold text-sm text-text">{block.focus}</span>
                          </div>
                          <p className="text-sm text-warm-gray leading-relaxed pl-0">{block.details}</p>
                        </div>
                      ))}
                    </div>
                    <div className="px-5 py-3 bg-sage-pale/30 border-t border-border">
                      <p className="text-xs text-forest">
                        <span className="font-semibold">IEP Goals Addressed:</span> {week.iepGoals}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* OG Phonics Progression */}
      <section className="mb-10">
        <h2 className="font-display text-xl font-bold text-text mb-4">OG Phonics Progression</h2>
        <div className="bg-white rounded-2xl border border-border overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-cream-deep">
                <th className="text-left px-5 py-3 font-semibold text-forest text-xs uppercase tracking-wider w-16">Week</th>
                <th className="text-left px-5 py-3 font-semibold text-forest text-xs uppercase tracking-wider">Phonics Focus</th>
                <th className="text-left px-5 py-3 font-semibold text-forest text-xs uppercase tracking-wider">Syllable Types</th>
                <th className="text-left px-5 py-3 font-semibold text-forest text-xs uppercase tracking-wider">Red Words</th>
              </tr>
            </thead>
            <tbody>
              {phonicsProgression.map((row, i) => (
                <tr key={row.week} className={i < phonicsProgression.length - 1 ? 'border-b border-border' : ''}>
                  <td className="px-5 py-3 font-display font-bold text-forest">{row.week}</td>
                  <td className="px-5 py-3 text-text">{row.focus}</td>
                  <td className="px-5 py-3 text-warm-gray">{row.syllableTypes}</td>
                  <td className="px-5 py-3 text-warm-gray text-xs">{row.redWords}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CRA Math Progression */}
      <section className="mb-10">
        <h2 className="font-display text-xl font-bold text-text mb-4">CRA Math Progression</h2>
        <div className="bg-white rounded-2xl border border-border overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-border bg-cream-deep">
                <th className="text-left px-5 py-3 font-semibold text-forest text-xs uppercase tracking-wider w-16">Week</th>
                <th className="text-left px-5 py-3 font-semibold text-forest text-xs uppercase tracking-wider">Math Focus</th>
                <th className="text-left px-5 py-3 font-semibold text-forest text-xs uppercase tracking-wider">Concrete</th>
                <th className="text-left px-5 py-3 font-semibold text-forest text-xs uppercase tracking-wider">Representational</th>
                <th className="text-left px-5 py-3 font-semibold text-forest text-xs uppercase tracking-wider">Abstract</th>
              </tr>
            </thead>
            <tbody>
              {mathProgression.map((row, i) => (
                <tr key={row.week} className={i < mathProgression.length - 1 ? 'border-b border-border' : ''}>
                  <td className="px-5 py-3 font-display font-bold text-forest">{row.week}</td>
                  <td className="px-5 py-3 text-text">{row.focus}</td>
                  <td className="px-5 py-3 text-warm-gray text-xs">{row.concrete}</td>
                  <td className="px-5 py-3 text-warm-gray text-xs">{row.representational}</td>
                  <td className="px-5 py-3 text-warm-gray text-xs">{row.abstract}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Writing Scope & Sequence */}
      <section className="mb-10">
        <h2 className="font-display text-xl font-bold text-text mb-4">Writing Scope & Sequence</h2>
        <div className="bg-white rounded-2xl border border-border overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-cream-deep">
                <th className="text-left px-5 py-3 font-semibold text-forest text-xs uppercase tracking-wider w-16">Week</th>
                <th className="text-left px-5 py-3 font-semibold text-forest text-xs uppercase tracking-wider">Writing Focus</th>
                <th className="text-left px-5 py-3 font-semibold text-forest text-xs uppercase tracking-wider">Mentor Text Type</th>
                <th className="text-left px-5 py-3 font-semibold text-forest text-xs uppercase tracking-wider">Portfolio Piece</th>
              </tr>
            </thead>
            <tbody>
              {writingProgression.map((row, i) => (
                <tr key={row.week} className={i < writingProgression.length - 1 ? 'border-b border-border' : ''}>
                  <td className="px-5 py-3 font-display font-bold text-forest">{row.week}</td>
                  <td className="px-5 py-3 text-text">{row.focus}</td>
                  <td className="px-5 py-3 text-warm-gray">{row.mentorText}</td>
                  <td className="px-5 py-3 text-warm-gray">{row.portfolio}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Materials List */}
      <section className="mb-10">
        <h2 className="font-display text-xl font-bold text-text mb-4">Materials & Supplies</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'Literacy Materials', icon: '\uD83D\uDCD6', items: materialsData.literacy },
            { title: 'Math Materials', icon: '\uD83D\uDD22', items: materialsData.math },
            { title: 'General Supplies', icon: '\uD83D\uDCE6', items: materialsData.general },
            { title: 'Enrichment-Specific', icon: '\uD83C\uDF1F', items: materialsData.enrichment },
          ].map((category) => (
            <div key={category.title} className="bg-white rounded-2xl border border-border p-5">
              <h3 className="font-display font-bold text-sm text-text mb-3 flex items-center gap-2">
                <span className="text-base">{category.icon}</span>
                {category.title}
              </h3>
              <ul className="space-y-1.5">
                {category.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-warm-gray">
                    <CheckIcon />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* IEP Goal Alignment Bank */}
      <section className="mb-10">
        <h2 className="font-display text-xl font-bold text-text mb-4">IEP Goal Alignment Bank</h2>
        <p className="text-sm text-text-muted mb-4">Common 3rd&ndash;4th grade IEP goals this program addresses:</p>
        <div className="space-y-4">
          {iepGoalBank.map((domain) => (
            <div key={domain.domain} className="bg-white rounded-2xl border border-border p-5">
              <h3 className="font-display font-bold text-sm text-forest mb-3">{domain.domain}</h3>
              <ul className="space-y-3">
                {domain.goals.map((goal, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-warm-gray leading-relaxed">
                    <span className="text-[10px] font-semibold bg-sage-pale text-forest rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="italic">&ldquo;{goal}&rdquo;</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Footer note */}
      <div className="bg-cream-deep rounded-2xl border border-border p-5 mb-4">
        <p className="text-sm text-warm-gray italic leading-relaxed">
          This scope and sequence is designed to be responsive. Entry points, pacing, and groupings will be adjusted based on pre-assessment data and ongoing progress monitoring. The Orton-Gillingham framework ensures that instruction is diagnostic and prescriptive &mdash; we teach to the student, not just the curriculum.
        </p>
      </div>
    </div>
  )
}
