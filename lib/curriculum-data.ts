/**
 * Curriculum data structure for the admin curriculum browser.
 * Maps the /curriculum/ markdown files into navigable modules.
 */

export interface DailyLesson {
  day: string
  title: string
  theme: string
  blocks: {
    name: string
    time: string
    focus: string
  }[]
}

export interface WeekModule {
  week: number
  title: string
  theme: string
  dates: string
  color: string
  icon: string
  phonicsSkills: string[]
  mathSkills: string[]
  writingFocus: string
  enrichmentTheme: string
  enrichmentDays: { day: string; activity: string; icon: string }[]
  assessmentNote?: string
  days: DailyLesson[]
}

export interface CurriculumResource {
  title: string
  description: string
  href: string
  icon: string
  category: 'assessment' | 'portfolio' | 'communication' | 'reference'
}

export const curriculumResources: CurriculumResource[] = [
  {
    title: 'Scope & Sequence',
    description: '6-week master overview — OG phonics, CRA math, writing, enrichment integration',
    href: '/admin/curriculum/scope-and-sequence',
    icon: '🗺️',
    category: 'reference',
  },
  {
    title: 'Pre-Assessment Battery',
    description: 'Phonics screener, ORF, sight words, writing rubric, math diagnostic',
    href: '/admin/curriculum/assessments/pre',
    icon: '📋',
    category: 'assessment',
  },
  {
    title: 'Post-Assessment Battery',
    description: 'Parallel forms for growth measurement + CSE-ready comparison',
    href: '/admin/curriculum/assessments/post',
    icon: '📊',
    category: 'assessment',
  },
  {
    title: 'Weekly Probe Templates',
    description: 'ORF passages, phonics sorts, math probes, comprehension checks',
    href: '/admin/curriculum/assessments/probes',
    icon: '📝',
    category: 'assessment',
  },
  {
    title: 'Student Portfolio Guide',
    description: 'Portfolio structure, self-assessment rubrics, showcase checklist',
    href: '/admin/curriculum/portfolio',
    icon: '📂',
    category: 'portfolio',
  },
  {
    title: 'Parent Communications',
    description: 'Welcome letter, weekly updates, mid-program summary, final report, showcase invite',
    href: '/admin/curriculum/communications',
    icon: '✉️',
    category: 'communication',
  },
]

export const weekModules: WeekModule[] = [
  {
    week: 1,
    title: 'Foundations & Assessment',
    theme: 'Who We Are as Learners',
    dates: 'July 7–11',
    color: 'bg-forest',
    icon: '🏗️',
    phonicsSkills: ['CVC review', 'Consonant blends', 'Digraphs (sh, ch, th, wh, ck)', 'Closed syllable review'],
    mathSkills: ['Place value to 10,000/100,000', 'Rounding & estimation', 'Number line comparison', 'Add/subtract fluency diagnostic'],
    writingFocus: 'Baseline writing sample + journal setup + sentence structure review',
    enrichmentTheme: 'Getting to Know Our World',
    enrichmentDays: [
      { day: 'Monday', activity: 'Nature walk + observation journal', icon: '🌿' },
      { day: 'Tuesday', activity: '"All About Me" museum of artifacts', icon: '🏛️' },
      { day: 'Wednesday', activity: 'Build a structure that represents you', icon: '🔬' },
      { day: 'Thursday', activity: 'Classroom economy introduction', icon: '🛒' },
      { day: 'Friday', activity: 'Self-portrait + goal-setting art', icon: '🎨' },
    ],
    assessmentNote: 'Pre-Assessment Battery: phonics screener, ORF baseline, sight word inventory, writing sample, math diagnostic',
    days: [
      { day: 'Monday', title: 'Welcome & Routines', theme: 'First day setup, community building, phonics screener part 1, place value diagnostic', blocks: [{ name: 'Math', time: '9:20–10:20', focus: 'Place value — building numbers with base-ten blocks' }, { name: 'Reading', time: '10:30–11:30', focus: 'OG introduction, phonogram card drill, phonics screener pulls' }, { name: 'Enrichment', time: '12:00–1:00', focus: 'Nature walk & observation journal' }] },
      { day: 'Tuesday', title: 'Getting to Know Each Other', theme: 'Phonics screener part 2, ORF baseline, rounding', blocks: [{ name: 'Math', time: '9:20–10:20', focus: 'Rounding to nearest 10, 100, 1000 with number lines' }, { name: 'Reading', time: '10:30–11:30', focus: 'Red words (the, was, is, are, have), ORF baseline pulls' }, { name: 'Enrichment', time: '12:00–1:00', focus: '"All About Me" personal museum' }] },
      { day: 'Wednesday', title: 'Our Learning Tools', theme: 'Writing baseline, math computation probe, comprehension intro', blocks: [{ name: 'Math', time: '9:20–10:20', focus: 'Estimation strategies, computation probe (add/sub)' }, { name: 'Reading', time: '10:30–11:30', focus: 'Writing baseline (personal narrative), prediction strategies' }, { name: 'Enrichment', time: '12:00–1:00', focus: 'STEM: Build a structure that represents you' }] },
      { day: 'Thursday', title: 'Setting Goals', theme: 'Sight word inventory, comprehension baseline, comparison', blocks: [{ name: 'Math', time: '9:20–10:20', focus: 'Comparing numbers with >, <, = using place value understanding' }, { name: 'Reading', time: '10:30–11:30', focus: 'Sight word inventory, red words (come, some, one), retelling' }, { name: 'Enrichment', time: '12:00–1:00', focus: 'Classroom economy — setting up jobs & currency' }] },
      { day: 'Friday', title: 'Reflect & Plan', theme: 'Data compilation, goal-setting, community celebration', blocks: [{ name: 'Math', time: '9:20–10:20', focus: 'Number sense games & review, CUBES problem-solving intro' }, { name: 'Reading', time: '10:30–11:30', focus: 'Cumulative OG review, reading response journal, goal-setting' }, { name: 'Enrichment', time: '12:00–1:00', focus: 'Self-portrait art + "My Summer Goals" display' }] },
    ],
  },
  {
    week: 2,
    title: 'Patterns & Connections',
    theme: 'Patterns in Language and Numbers',
    dates: 'July 14–18',
    color: 'bg-forest-mid',
    icon: '🔄',
    phonicsSkills: ['Vowel teams: ai/ay', 'Vowel teams: ee/ea', 'Vowel teams: oa/ow', 'Open syllables (CV)'],
    mathSkills: ['Equal groups (concrete)', 'Arrays: building & drawing', 'Skip counting → multiplication', 'Facts: x0, x1, x2, x5, x10'],
    writingFocus: 'Paragraph structure — topic sentence, detail sentences, closing sentence',
    enrichmentTheme: 'Patterns Everywhere',
    enrichmentDays: [
      { day: 'Monday', activity: 'Nature patterns — symmetry in leaves & spirals', icon: '🌿' },
      { day: 'Tuesday', activity: 'Patterns in art & architecture', icon: '🏛️' },
      { day: 'Wednesday', activity: 'Pattern-based coding challenge', icon: '🔬' },
      { day: 'Thursday', activity: 'Recipe patterns — doubling/halving', icon: '🛒' },
      { day: 'Friday', activity: 'Tessellation art + pattern poetry', icon: '🎨' },
    ],
    assessmentNote: 'Weekly Probe #1: ORF, vowel team sort, multiplication facts timed probe',
    days: [
      { day: 'Monday', title: 'Sound Patterns', theme: 'Vowel teams ai/ay, equal groups intro', blocks: [{ name: 'Math', time: '9:20–10:20', focus: 'Equal groups with counters — "groups of" language' }, { name: 'Reading', time: '10:30–11:30', focus: 'OG: vowel team ai/ay, multisensory drill, decodable text' }, { name: 'Enrichment', time: '12:00–1:00', focus: 'Nature symmetry walk — finding patterns outdoors' }] },
      { day: 'Tuesday', title: 'Seeing Patterns', theme: 'Vowel teams ee/ea, arrays', blocks: [{ name: 'Math', time: '9:20–10:20', focus: 'Arrays — building with tiles, rows × columns' }, { name: 'Reading', time: '10:30–11:30', focus: 'OG: vowel team ee/ea, main idea introduction' }, { name: 'Enrichment', time: '12:00–1:00', focus: 'Architecture patterns — arches, columns, symmetry' }] },
      { day: 'Wednesday', title: 'Repeating & Growing', theme: 'Vowel teams oa/ow, skip counting', blocks: [{ name: 'Math', time: '9:20–10:20', focus: 'Skip counting on number lines → multiplication connection' }, { name: 'Reading', time: '10:30–11:30', focus: 'OG: vowel team oa/ow, paragraph structure intro' }, { name: 'Enrichment', time: '12:00–1:00', focus: 'Pattern-based coding/logic challenges' }] },
      { day: 'Thursday', title: 'Patterns in Practice', theme: 'Open syllables, x0/x1/x2/x5/x10 facts', blocks: [{ name: 'Math', time: '9:20–10:20', focus: 'Multiplication facts strategies: x0, x1, x2, x5, x10' }, { name: 'Reading', time: '10:30–11:30', focus: 'OG: open syllable review, supporting details practice' }, { name: 'Enrichment', time: '12:00–1:00', focus: 'Recipe math — doubling and halving ingredients' }] },
      { day: 'Friday', title: 'Pattern Showcase', theme: 'Weekly review, probe #1, pattern celebration', blocks: [{ name: 'Math', time: '9:20–10:20', focus: 'Multiplication review games, computation probe' }, { name: 'Reading', time: '10:30–11:30', focus: 'Cumulative OG review, ORF probe, pattern paragraph' }, { name: 'Enrichment', time: '12:00–1:00', focus: 'Tessellation art + pattern poetry showcase' }] },
    ],
  },
  {
    week: 3,
    title: 'Building Blocks',
    theme: 'How Things Are Built — Words, Numbers, Structures',
    dates: 'July 21–25',
    color: 'bg-forest-light',
    icon: '🧱',
    phonicsSkills: ['Vowel teams: oi/oy, ou/ow, au/aw', 'R-controlled: ar, or', 'R-controlled: er/ir/ur', 'Syllable type review (5 types)'],
    mathSkills: ['Division as sharing & grouping', 'Multiplication ↔ division relationship', 'Fact families', 'Word problem schemas'],
    writingFocus: 'Narrative writing — character, setting, problem, strong openings, dialogue',
    enrichmentTheme: 'Building & Construction',
    enrichmentDays: [
      { day: 'Monday', activity: 'Build a nature shelter (outdoor engineering)', icon: '🌿' },
      { day: 'Tuesday', activity: 'Architecture — how buildings tell stories', icon: '🏛️' },
      { day: 'Wednesday', activity: 'Bridge-building STEM challenge (load testing)', icon: '🔬' },
      { day: 'Thursday', activity: 'Budget a building project', icon: '🛒' },
      { day: 'Friday', activity: 'Collaborative mural — building a community', icon: '🎨' },
    ],
    assessmentNote: 'Weekly Probe #2 + Mid-Cycle Check #1 — adjust groupings based on 2-week data',
    days: [
      { day: 'Monday', title: 'Building Words', theme: 'Diphthongs oi/oy + ou/ow, division intro', blocks: [{ name: 'Math', time: '9:20–10:20', focus: 'Division as fair sharing — counters on division mats' }, { name: 'Reading', time: '10:30–11:30', focus: 'OG: oi/oy, ou/ow diphthongs, story elements intro' }, { name: 'Enrichment', time: '12:00–1:00', focus: 'Nature shelter building — outdoor engineering' }] },
      { day: 'Tuesday', title: 'Building Sentences', theme: 'Vowel teams au/aw, division as grouping', blocks: [{ name: 'Math', time: '9:20–10:20', focus: 'Division as grouping — "How many groups of...?"' }, { name: 'Reading', time: '10:30–11:30', focus: 'OG: au/aw, narrative planning (character, setting, problem)' }, { name: 'Enrichment', time: '12:00–1:00', focus: 'Architecture study — how buildings tell stories' }] },
      { day: 'Wednesday', title: 'Building Stories', theme: 'R-controlled ar/or, fact families', blocks: [{ name: 'Math', time: '9:20–10:20', focus: 'Fact families — multiplication ↔ division triangles' }, { name: 'Reading', time: '10:30–11:30', focus: 'OG: r-controlled ar, or, writing strong story openings' }, { name: 'Enrichment', time: '12:00–1:00', focus: 'Bridge-building STEM challenge' }] },
      { day: 'Thursday', title: 'Building Understanding', theme: 'R-controlled er/ir/ur, word problems', blocks: [{ name: 'Math', time: '9:20–10:20', focus: 'Word problem schemas: equal groups, comparison' }, { name: 'Reading', time: '10:30–11:30', focus: 'OG: r-controlled er/ir/ur, dialogue in writing' }, { name: 'Enrichment', time: '12:00–1:00', focus: 'Budget a building project — real-world math' }] },
      { day: 'Friday', title: 'Building Together', theme: 'Review, mid-cycle check, collaborative work', blocks: [{ name: 'Math', time: '9:20–10:20', focus: 'Review: multiplication/division games, probe #2' }, { name: 'Reading', time: '10:30–11:30', focus: 'Syllable type review, ORF probe, mid-cycle check' }, { name: 'Enrichment', time: '12:00–1:00', focus: 'Collaborative mural — building a community' }] },
    ],
  },
  {
    week: 4,
    title: 'Breaking It Down',
    theme: 'Taking Things Apart to Understand Them',
    dates: 'July 28 – Aug 1',
    color: 'bg-amber',
    icon: '🔍',
    phonicsSkills: ['VCCV syllable division', 'VCV syllable division', 'Compound words', 'Consonant-le syllable'],
    mathSkills: ['Unit fractions on number lines', 'Naming & representing fractions', 'Equivalent fractions (manipulatives)', 'Comparing fractions'],
    writingFocus: 'Narrative middle/end + informational writing intro ("How Things Work")',
    enrichmentTheme: 'Taking Things Apart',
    enrichmentDays: [
      { day: 'Monday', activity: 'Dissecting plants — parts and functions', icon: '🌿' },
      { day: 'Tuesday', activity: 'How museums preserve artifacts', icon: '🏛️' },
      { day: 'Wednesday', activity: 'Take apart electronics (safe disassembly)', icon: '🔬' },
      { day: 'Thursday', activity: 'Deconstructing a recipe — ingredient roles', icon: '🛒' },
      { day: 'Friday', activity: 'Collage art — deconstructing & reconstructing', icon: '🎨' },
    ],
    assessmentNote: 'Weekly Probe #3 + Mid-Cycle Check #2 — adjust pacing for final 2 weeks',
    days: [
      { day: 'Monday', title: 'Word Parts', theme: 'VCCV syllable division, unit fractions', blocks: [{ name: 'Math', time: '9:20–10:20', focus: 'Unit fractions — fraction strips on number lines' }, { name: 'Reading', time: '10:30–11:30', focus: 'OG: VCCV division (rab-bit, nap-kin), inference intro' }, { name: 'Enrichment', time: '12:00–1:00', focus: 'Plant dissection — naming parts and functions' }] },
      { day: 'Tuesday', title: 'Number Parts', theme: 'VCV division, naming fractions', blocks: [{ name: 'Math', time: '9:20–10:20', focus: 'Naming fractions — area models with pattern blocks' }, { name: 'Reading', time: '10:30–11:30', focus: 'OG: VCV division (o-pen, riv-er), text evidence practice' }, { name: 'Enrichment', time: '12:00–1:00', focus: 'Museum conservation — preserving artifacts' }] },
      { day: 'Wednesday', title: 'Compound Parts', theme: 'Compound words, equivalent fractions', blocks: [{ name: 'Math', time: '9:20–10:20', focus: 'Equivalent fractions with fraction strips & circles' }, { name: 'Reading', time: '10:30–11:30', focus: 'OG: compound words, narrative writing (middle & end)' }, { name: 'Enrichment', time: '12:00–1:00', focus: 'Electronics disassembly — safe STEM exploration' }] },
      { day: 'Thursday', title: 'Putting It Back Together', theme: 'Consonant-le, comparing fractions', blocks: [{ name: 'Math', time: '9:20–10:20', focus: 'Comparing fractions — same numerator, same denominator' }, { name: 'Reading', time: '10:30–11:30', focus: 'OG: consonant-le (ta-ble, puz-zle), "How Things Work" writing' }, { name: 'Enrichment', time: '12:00–1:00', focus: 'Recipe deconstruction — what each ingredient does' }] },
      { day: 'Friday', title: 'Analysis Day', theme: 'Review, mid-cycle check #2, collage art', blocks: [{ name: 'Math', time: '9:20–10:20', focus: 'Fraction review, probe #3, mid-cycle check' }, { name: 'Reading', time: '10:30–11:30', focus: 'Multisyllabic word review, ORF probe, grouping review' }, { name: 'Enrichment', time: '12:00–1:00', focus: 'Collage art — deconstructing & reconstructing images' }] },
    ],
  },
  {
    week: 5,
    title: 'Real-World Applications',
    theme: 'Using What We Know in the Real World',
    dates: 'Aug 4–8',
    color: 'bg-forest',
    icon: '🌍',
    phonicsSkills: ['Prefixes: un-, re-, pre-, dis-', 'Suffixes: -ful, -less, -ness, -ly', 'Doubling/drop-e/change-y rules', 'Word webs: base → derived forms'],
    mathSkills: ['Comparing fractions (benchmarks)', 'Add/subtract like denominators (4th)', 'Time, money, measurement', 'Data: bar graphs, line plots'],
    writingFocus: 'Opinion/persuasive writing — claims with reasons, transition words, persuasive letter',
    enrichmentTheme: 'Real-World Problem Solvers',
    enrichmentDays: [
      { day: 'Monday', activity: 'Environmental stewardship — measuring a garden', icon: '🌿' },
      { day: 'Tuesday', activity: 'Community helpers — interview & research', icon: '🏛️' },
      { day: 'Wednesday', activity: 'Design a solution to a real problem', icon: '🔬' },
      { day: 'Thursday', activity: 'Grocery store math — budgeting a meal', icon: '🛒' },
      { day: 'Friday', activity: 'Persuasive poster/presentation creation', icon: '🎨' },
    ],
    assessmentNote: 'Weekly Probe #4: ORF, morphology assessment, fraction comparison, opinion writing rubric',
    days: [
      { day: 'Monday', title: 'Word Power', theme: 'Prefixes un-/re-, fraction benchmarks', blocks: [{ name: 'Math', time: '9:20–10:20', focus: 'Comparing fractions using 0, 1/2, 1 benchmarks' }, { name: 'Reading', time: '10:30–11:30', focus: 'OG: prefixes un-, re-, author\'s purpose (PIE)' }, { name: 'Enrichment', time: '12:00–1:00', focus: 'Environmental stewardship — measuring garden plots' }] },
      { day: 'Tuesday', title: 'Building Arguments', theme: 'Prefixes pre-/dis-, add/sub fractions', blocks: [{ name: 'Math', time: '9:20–10:20', focus: 'Adding fractions with like denominators (fraction strips)' }, { name: 'Reading', time: '10:30–11:30', focus: 'OG: prefixes pre-, dis-, opinion writing introduction' }, { name: 'Enrichment', time: '12:00–1:00', focus: 'Community helpers interview & research project' }] },
      { day: 'Wednesday', title: 'Making Change', theme: 'Suffixes -ful/-less, money & time', blocks: [{ name: 'Math', time: '9:20–10:20', focus: 'Time and money — real-world measurement problems' }, { name: 'Reading', time: '10:30–11:30', focus: 'OG: suffixes -ful, -less, persuasive letter drafting' }, { name: 'Enrichment', time: '12:00–1:00', focus: 'Design a solution to a real-world problem (STEM)' }] },
      { day: 'Thursday', title: 'Data & Evidence', theme: 'Suffixes -ness/-ly, data & graphs', blocks: [{ name: 'Math', time: '9:20–10:20', focus: 'Data collection, bar graphs, line plots' }, { name: 'Reading', time: '10:30–11:30', focus: 'OG: suffixes -ness, -ly, spelling rules, text features' }, { name: 'Enrichment', time: '12:00–1:00', focus: 'Grocery budgeting — real-world math application' }] },
      { day: 'Friday', title: 'Persuade & Present', theme: 'Review, probe #4, presentations', blocks: [{ name: 'Math', time: '9:20–10:20', focus: 'Measurement review, probe #4' }, { name: 'Reading', time: '10:30–11:30', focus: 'Morphology review, ORF probe, opinion writing rubric' }, { name: 'Enrichment', time: '12:00–1:00', focus: 'Persuasive poster presentations' }] },
    ],
  },
  {
    week: 6,
    title: 'Showcase & Celebrate',
    theme: 'Showing What We\'ve Learned',
    dates: 'Aug 11–15',
    color: 'bg-amber',
    icon: '🎉',
    phonicsSkills: ['Soft c/g patterns', 'Silent letters (kn, wr, gn, mb)', 'Homophones & homographs', 'Cumulative OG review + fluency'],
    mathSkills: ['Multi-step word problems', 'Strategy toolkit review', 'Math portfolio assembly', 'Showcase: "My Math Growth Story"'],
    writingFocus: 'Portfolio assembly, revision/editing, reflective writing, showcase preparation',
    enrichmentTheme: 'Celebration of Learning',
    enrichmentDays: [
      { day: 'Monday', activity: 'Nature reflection — compare to Week 1', icon: '🌿' },
      { day: 'Tuesday', activity: 'Create a mini-museum of summer learning', icon: '🏛️' },
      { day: 'Wednesday', activity: 'Final STEM challenge — combine all skills', icon: '🔬' },
      { day: 'Thursday', activity: 'Plan and host a celebration', icon: '🛒' },
      { day: 'Friday', activity: 'END-OF-PROGRAM SHOWCASE for families', icon: '🎨' },
    ],
    assessmentNote: 'Post-Assessment Battery (Wed/Thu) — mirrors pre-assessment. Friday: Family Showcase Event.',
    days: [
      { day: 'Monday', title: 'Tricky Patterns', theme: 'Soft c/g, multi-step problems', blocks: [{ name: 'Math', time: '9:20–10:20', focus: 'Multi-step word problems — strategy toolkit review' }, { name: 'Reading', time: '10:30–11:30', focus: 'OG: soft c/g patterns, reading across texts (synthesis)' }, { name: 'Enrichment', time: '12:00–1:00', focus: 'Nature reflection walk — compare to Week 1 journal' }] },
      { day: 'Tuesday', title: 'Silent & Sneaky', theme: 'Silent letters, portfolio work', blocks: [{ name: 'Math', time: '9:20–10:20', focus: 'Math portfolio assembly — selecting best work' }, { name: 'Reading', time: '10:30–11:30', focus: 'OG: silent letters (kn, wr, gn, mb), portfolio revision' }, { name: 'Enrichment', time: '12:00–1:00', focus: 'Create a mini-museum exhibit of summer learning' }] },
      { day: 'Wednesday', title: 'Assessment Day', theme: 'Post-assessment (reading & writing), final STEM', blocks: [{ name: 'Math', time: '9:20–10:20', focus: 'Post-assessment: math diagnostic (mirrors pre-assessment)' }, { name: 'Reading', time: '10:30–11:30', focus: 'Post-assessment: phonics, ORF, writing sample' }, { name: 'Enrichment', time: '12:00–1:00', focus: 'Final STEM challenge — combine all skills learned' }] },
      { day: 'Thursday', title: 'Rehearsal Day', theme: 'Post-assessment wrap-up, showcase rehearsal', blocks: [{ name: 'Math', time: '9:20–10:20', focus: 'Post-assessment: remaining items, showcase prep' }, { name: 'Reading', time: '10:30–11:30', focus: '"Letter to My Future Self," showcase script practice' }, { name: 'Enrichment', time: '12:00–1:00', focus: 'Plan and set up the celebration space' }] },
      { day: 'Friday', title: 'Family Showcase', theme: 'END-OF-PROGRAM CELEBRATION', blocks: [{ name: 'Math', time: '9:20–10:20', focus: 'Final warm-up games, student awards preparation' }, { name: 'Reading', time: '10:30–11:30', focus: 'Showcase rehearsal, portfolio finalization' }, { name: 'Enrichment', time: '12:00–1:00', focus: 'FAMILY SHOWCASE — student presentations & celebration' }] },
    ],
  },
]
