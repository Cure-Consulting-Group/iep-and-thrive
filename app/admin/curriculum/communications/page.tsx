'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Template {
  id: string
  icon: string
  title: string
  timing: string
  subject: string
  sections: TemplateSection[]
}

interface TemplateSection {
  type: 'greeting' | 'paragraph' | 'heading' | 'table' | 'list' | 'signature' | 'note' | 'divider' | 'schedule'
  content?: string
  items?: string[]
  rows?: string[][]
  headers?: string[]
}

function Placeholder({ children }: { children: string }) {
  return (
    <span className="bg-sage-pale text-forest font-semibold px-1.5 py-0.5 rounded text-sm">
      {children}
    </span>
  )
}

function renderText(text: string) {
  const parts = text.split(/(\[.*?\])/)
  return parts.map((part, i) => {
    if (part.startsWith('[') && part.endsWith(']')) {
      return <Placeholder key={i}>{part}</Placeholder>
    }
    return <span key={i}>{part}</span>
  })
}

const templates: Template[] = [
  {
    id: 'welcome',
    icon: '👋',
    title: 'Welcome Letter',
    timing: 'Week 0 — Sent Before Program Starts',
    subject: 'Welcome to IEP & Thrive — Everything You Need for Day 1',
    sections: [
      { type: 'greeting', content: 'Dear [Parent/Guardian Name],' },
      { type: 'paragraph', content: 'We are thrilled to welcome [Student Name] to IEP & Thrive\'s Summer 2026 Intensive Program! We have reviewed [Student Name]\'s IEP and learning profile, and we are genuinely excited to work with your child this summer.' },
      { type: 'paragraph', content: 'Here is everything you need to know before our first day on Monday, July 7.' },
      { type: 'heading', content: 'Program Details' },
      { type: 'table', headers: ['Detail', 'Information'], rows: [
        ['Dates', 'July 7 \u2013 August 15, 2026 (6 weeks)'],
        ['Schedule', 'Monday \u2013 Thursday, 9:00 AM \u2013 1:00 PM'],
        ['Location', '[Address \u2014 provided upon enrollment]'],
        ['Drop-off', '8:50 \u2013 9:00 AM (front entrance)'],
        ['Pickup', '1:00 PM (front entrance \u2014 brief daily parent debrief available)'],
        ['Cohort', '[Program Track: Full Academic / Reading & Language / Math & Numeracy]'],
        ['Group Size', 'Maximum 6 students'],
      ]},
      { type: 'heading', content: 'What to Bring Daily' },
      { type: 'list', items: [
        'A water bottle (labeled with name)',
        'A healthy snack',
        'A folder or backpack for take-home materials',
        'Comfortable clothing appropriate for both indoor and outdoor activities',
        'Any assistive tools your child currently uses (fidgets, noise-canceling headphones, etc.)',
      ]},
      { type: 'heading', content: 'What We Provide' },
      { type: 'list', items: [
        'All curriculum materials, workbooks, and supplies',
        'A student portfolio folder',
        'Weekly progress reports (emailed every Friday)',
        'A comprehensive CSE-ready final report at program end',
      ]},
      { type: 'heading', content: 'First Week Overview' },
      { type: 'paragraph', content: 'Week 1 is "Foundations & Assessment." Here is what to expect:' },
      { type: 'list', items: [
        'Day 1: Pre-assessment battery (reading, writing, math) \u2014 this establishes baselines and helps us tailor instruction to your child\'s exact needs',
        'Days 2\u20134: Instruction begins while we finalize flexible groupings based on assessment data',
        'Friday: First weekly progress monitoring probes and your first weekly update email',
      ]},
      { type: 'paragraph', content: 'Please note that the pre-assessment is not a test your child needs to study for. It is a diagnostic tool that tells us where to begin instruction. There are no grades and no pressure.' },
      { type: 'heading', content: 'Communication' },
      { type: 'list', items: [
        'Weekly updates will be emailed every Friday by 6:00 PM',
        'Daily debriefs are available at pickup (1:00 PM) \u2014 even a quick 2-minute conversation helps us stay aligned',
        'Questions or concerns at any time: [Instructor Email] or [Instructor Phone]',
        'Mid-program conference will be scheduled around Week 3 for any family who would like one',
      ]},
      { type: 'heading', content: 'A Note from Your Child\'s Instructor' },
      { type: 'paragraph', content: 'I have spent 8+ years as a Special Education Interventionist with the NYC Department of Education. I have reviewed [Student Name]\'s IEP, and I have mapped their annual goals to our summer curriculum. Every session this summer is designed to move the needle on the skills that matter most for [Student Name]\'s success in September.' },
      { type: 'paragraph', content: 'I don\'t do generic tutoring. I don\'t teach from a workbook. Every decision I make \u2014 from the phonics patterns we drill to the math manipulatives we use \u2014 is driven by your child\'s actual IEP goals and assessment data. That is my promise.' },
      { type: 'paragraph', content: 'I look forward to meeting you and [Student Name] on July 7.' },
      { type: 'signature', content: '[Instructor Name]\nIEP & Thrive \u2014 Summer 2026 Intensive\nA program of Cure Consulting Group\n[Email] | [Phone]' },
    ],
  },
  {
    id: 'weekly',
    icon: '📊',
    title: 'Weekly Update Email',
    timing: 'Sent Every Friday by 6:00 PM',
    subject: '[Student Name] — Week [#] Progress Update | IEP & Thrive',
    sections: [
      { type: 'greeting', content: 'Dear [Parent/Guardian Name],' },
      { type: 'paragraph', content: 'Here is [Student Name]\'s progress update for Week [#]: [Theme Name] (dates: [Monday date] \u2013 [Thursday date]).' },
      { type: 'heading', content: 'This Week\'s Focus Areas' },
      { type: 'table', headers: ['Domain', 'Skills Taught'], rows: [
        ['Reading/Phonics', '[e.g., Vowel teams: ai/ay, ee/ea, oa/ow; multisensory drill with phonogram cards and sand trays]'],
        ['Comprehension', '[e.g., Main idea and supporting details; graphic organizer practice with informational text]'],
        ['Writing', '[e.g., Paragraph structure \u2014 topic sentence, detail sentences, closing sentence]'],
        ['Math', '[e.g., Multiplication concepts \u2014 equal groups, arrays, fact strategies for x0, x1, x2, x5, x10]'],
        ['Enrichment', '[e.g., "Patterns Everywhere" \u2014 symmetry in nature, tessellation art, recipe math]'],
      ]},
      { type: 'heading', content: 'Progress Monitoring Data' },
      { type: 'note', content: 'Probes administered Friday, [date].' },
      { type: 'table', headers: ['Measure', 'This Week', 'Last Week', 'Trend', 'Benchmark'], rows: [
        ['Oral Reading Fluency (WCPM)', '[score]', '[score or "baseline"]', '[up/down/stable]', 'Grade 3: 90+ / Grade 4: 110+'],
        ['ORF Accuracy', '[%]', '[%]', '', '95%+'],
        ['Phonics Pattern ([pattern])', '[#]/10', '[#]/10 or N/A', '', '8/10 (80%)'],
        ['Math Computation Probe', '[#]/20', '[#]/20', '', '16/20 (80%)'],
        ['Comprehension Check', '[#]/5', '[#]/5 or N/A', '', '4/5 (80%)'],
      ]},
      { type: 'heading', content: 'Strengths Observed' },
      { type: 'list', items: [
        '[Specific, positive observation. Example: "[Student Name] applied the \'chunk-it\' strategy to break apart the word \'important\' independently for the first time this week."]',
        '[Example: "During the multiplication array activity, [Student Name] was able to explain to a peer why 3 rows of 5 is the same as 5 rows of 3."]',
        '[Example: "[Student Name] wrote a complete paragraph with a clear topic sentence without any prompting \u2014 a significant step forward from last week."]',
      ]},
      { type: 'heading', content: 'Areas for Continued Practice' },
      { type: 'list', items: [
        '[Specific area. Example: "Vowel team ea is still inconsistent \u2014 [Student Name] sometimes reads \'ea\' as short e (as in \'bread\') when it should be long e (as in \'beach\'). This is normal and we will continue drilling this pattern."]',
        '[Example: "Multiplication facts for x3 and x4 are not yet automatic. Fluency will improve with repeated practice."]',
      ]},
      { type: 'heading', content: 'IEP Goal Alignment' },
      { type: 'note', content: 'This section maps this week\'s instruction to [Student Name]\'s active IEP goals.' },
      { type: 'table', headers: ['IEP Goal (Abbreviated)', 'How It Was Addressed This Week', 'Current Data'], rows: [
        ['[e.g., "Decode vowel team words with 80% accuracy"]', '[e.g., "Direct instruction on ai/ay, ee/ea, oa/ow with multisensory OG method; decodable text practice"]', '[e.g., "6/10 on vowel team word list \u2014 approaching target"]'],
        ['[e.g., "Read grade-level passage at 95 WCPM"]', '[e.g., "Daily fluency building \u2014 repeated reading, phrase reading"]', '[e.g., "78 WCPM \u2014 up from 71 baseline"]'],
        ['[e.g., "Solve multiplication problems within 100 with 85% accuracy"]', '[e.g., "Arrays, equal groups, fact strategy drill (x0, x1, x2, x5, x10)"]', '[e.g., "14/20 on computation probe \u2014 progressing"]'],
      ]},
      { type: 'heading', content: 'Home Practice Suggestion (15 minutes/night)' },
      { type: 'paragraph', content: 'Reading (5\u20137 min): [e.g., "Have [Student Name] read aloud to you for 5 minutes from any book they enjoy. When they get stuck on a word, encourage them to \'look for the vowel team\' before sounding out. Praise self-corrections."]' },
      { type: 'paragraph', content: 'Math (5\u20137 min): [e.g., "Practice multiplication facts for x2, x5, and x10 using flashcards or a free app like \'Multiplication Flashcard Match.\' Aim for speed \u2014 we\'re building automaticity."]' },
      { type: 'paragraph', content: 'Writing (optional, 3\u20135 min): [e.g., "Ask [Student Name] to write 3 sentences about their favorite part of the day. Encourage them to start with a capital and end with punctuation."]' },
      { type: 'heading', content: 'Preview of Next Week' },
      { type: 'paragraph', content: 'Week [#+1]: "[Theme Name]"' },
      { type: 'list', items: [
        'Reading/Phonics: [brief preview]',
        'Math: [brief preview]',
        'Enrichment: [brief preview]',
      ]},
      { type: 'heading', content: 'Notes / Questions' },
      { type: 'paragraph', content: '[Space for any individual notes \u2014 attendance, behavior, supplies needed, scheduling, etc.]' },
      { type: 'divider' },
      { type: 'paragraph', content: 'Thank you for your partnership. Please don\'t hesitate to reach out with any questions.' },
      { type: 'signature', content: '[Instructor Name]\nIEP & Thrive | [Email] | [Phone]' },
    ],
  },
  {
    id: 'midprogram',
    icon: '📈',
    title: 'Mid-Program Progress Summary',
    timing: 'End of Week 3',
    subject: '[Student Name] — Mid-Program Progress Summary | IEP & Thrive',
    sections: [
      { type: 'greeting', content: 'Dear [Parent/Guardian Name],' },
      { type: 'paragraph', content: 'We have reached the midpoint of our summer program, and I want to share a comprehensive update on [Student Name]\'s progress over the first three weeks.' },
      { type: 'heading', content: 'Assessment Data Summary: Weeks 1\u20133' },
      { type: 'note', content: 'Reading' },
      { type: 'table', headers: ['Measure', 'Pre-Assessment (Wk 1)', 'Week 2', 'Week 3', 'Growth', 'Notes'], rows: [
        ['ORF (WCPM)', '', '', '', '+[#]', ''],
        ['Accuracy %', '', '', '', '', ''],
        ['Prosody (1\u20134)', '', '', '', '', ''],
        ['Retelling (0\u201310)', '\u2014', '\u2014', '', '', ''],
      ]},
      { type: 'note', content: 'Phonics Mastery' },
      { type: 'table', headers: ['Skill Area', 'Pre-Assessment', 'Current Status'], rows: [
        ['CVC / Blends / Digraphs', '[Mastery / Developing / Needs Instruction]', '[Updated status]'],
        ['Silent-e (VCe)', '', ''],
        ['Vowel Teams', '', ''],
        ['R-Controlled Vowels', '', ''],
        ['Multisyllabic Words', '', ''],
      ]},
      { type: 'note', content: 'Writing' },
      { type: 'table', headers: ['Trait', 'Pre-Assessment (Wk 1)', 'Week 3 Score', 'Change'], rows: [
        ['Ideas & Content', '/4', '/4', ''],
        ['Organization', '/4', '/4', ''],
        ['Conventions', '/4', '/4', ''],
        ['Sentence Structure', '/4', '/4', ''],
        ['Total', '/16', '/16', ''],
      ]},
      { type: 'note', content: 'Math' },
      { type: 'table', headers: ['Measure', 'Pre-Assessment (Wk 1)', 'Week 2', 'Week 3', 'Growth'], rows: [
        ['Computation Probe (/20)', '', '', '', ''],
        ['Place Value', '[Mastery / Developing / Needs Instruction]', '\u2014', '\u2014', ''],
        ['Multiplication', '', '\u2014', '[Updated]', ''],
        ['Division', '', '\u2014', '[Updated]', ''],
      ]},
      { type: 'heading', content: 'What\'s Working' },
      { type: 'list', items: [
        '[Describe 2\u20133 specific instructional strategies that are producing results for this student]',
        '[Example: "The multisensory vowel team drill (sky writing + phonogram cards) is helping [Student Name] internalize the ai/ay pattern. They self-corrected \'rain\' twice this week after initially reading it as \'ran.\'"]',
        '[Example: "Using concrete manipulatives (counters) for division is bridging the gap \u2014 [Student Name] can now solve division problems with objects and is beginning to draw models independently."]',
      ]},
      { type: 'heading', content: 'Where We\'re Focusing for Weeks 4\u20136' },
      { type: 'paragraph', content: 'Based on three weeks of data, here are the priority areas for the second half of the program:' },
      { type: 'list', items: [
        'Priority 1: [Description and plan]',
        'Priority 2: [Description and plan]',
        'Priority 3: [Description and plan]',
      ]},
      { type: 'heading', content: 'Grouping Adjustments' },
      { type: 'paragraph', content: '[If applicable: "Based on our mid-cycle assessment, we have adjusted [Student Name]\'s reading group to [description]. This change reflects their growth in [area] and will provide [benefit]."]' },
      { type: 'paragraph', content: '[If no change: "[Student Name]\'s current grouping continues to be a strong fit. No changes are needed at this time."]' },
      { type: 'heading', content: 'IEP Goal Progress Tracker' },
      { type: 'table', headers: ['IEP Goal', 'Baseline (Pre-Assessment)', 'Current Performance', 'Trajectory', 'On Track?'], rows: [
        ['1. [Goal]', '[Data]', '[Data]', '[Improving / Stable / Needs attention]', 'Yes / Watch / No'],
        ['2. [Goal]', '[Data]', '[Data]', '', ''],
        ['3. [Goal]', '[Data]', '[Data]', '', ''],
        ['4. [Goal]', '[Data]', '[Data]', '', ''],
      ]},
      { type: 'heading', content: 'Looking Ahead: Weeks 4\u20136' },
      { type: 'table', headers: ['Week', 'Theme', 'Key Focus Areas'], rows: [
        ['Week 4', '"Breaking It Down"', 'Multisyllabic words, inference, fractions'],
        ['Week 5', '"Real-World Applications"', 'Morphology, opinion writing, measurement & data'],
        ['Week 6', '"Showcase & Celebrate"', 'Cumulative review, portfolio assembly, post-assessment, Family Showcase'],
      ]},
      { type: 'paragraph', content: 'Family Showcase: Friday, August 15, [time TBD] \u2014 Your child will present their portfolio and showcase pieces to you. More details coming in Week 5.' },
      { type: 'heading', content: 'Your Questions & Input' },
      { type: 'paragraph', content: 'I welcome any questions, observations from home, or priorities you would like me to focus on in the remaining three weeks. This program works best when we are aligned.' },
      { type: 'paragraph', content: 'Would you like to schedule a brief phone or in-person check-in this week? I have availability on [dates/times].' },
      { type: 'signature', content: '[Instructor Name]\nIEP & Thrive | [Email] | [Phone]' },
    ],
  },
  {
    id: 'final-report',
    icon: '📋',
    title: 'Final Report (CSE-Ready)',
    timing: 'Week 6 — Showcase Day',
    subject: 'IEP & THRIVE \u2014 SUMMER 2026 INTENSIVE PROGRAM \u2014 End-of-Program Progress Report',
    sections: [
      { type: 'note', content: 'This report is designed to be shared with school districts, CSE teams, and related service providers.' },
      { type: 'heading', content: 'Student Information' },
      { type: 'table', headers: ['Field', 'Details'], rows: [
        ['Student Name', ''],
        ['Date of Birth', ''],
        ['Grade (Fall 2026)', ''],
        ['School District', ''],
        ['Dates of Service', 'July 7 \u2013 August 15, 2026'],
        ['Program Track', '[Full Academic / Reading & Language / Math & Numeracy]'],
        ['Total Hours of Instruction', '120 hours (4 hrs/day x 5 days/wk x 6 wks)'],
        ['Group Size', '[#] students'],
        ['Instructor', '[Name], [Credentials]'],
        ['IEP on File', 'Yes / No (Date of IEP: ___)'],
      ]},
      { type: 'heading', content: 'Program Description' },
      { type: 'paragraph', content: 'IEP & Thrive is a 6-week evidence-based summer intensive for students with IEPs and learning differences, serving grades 3\u20134. Instruction follows the Orton-Gillingham (structured literacy) framework for reading and the Concrete-Representational-Abstract (CRA) model for math. All instruction is aligned to the student\'s active IEP goals and New York State Common Core Learning Standards for ELA and Mathematics.' },
      { type: 'heading', content: 'IEP Goals Addressed' },
      { type: 'note', content: 'List each IEP goal targeted during the program, with baseline and outcome data.' },
      { type: 'paragraph', content: 'Goal 1: [Full IEP goal language]' },
      { type: 'table', headers: ['', ''], rows: [
        ['Domain', '[Reading \u2014 Decoding / Fluency / Comprehension / Written Expression / Math Computation / Math Problem-Solving]'],
        ['Baseline (Pre-Assessment, July 7)', '[Specific data point]'],
        ['Mid-Program (Week 3)', '[Specific data point]'],
        ['End-of-Program (Post-Assessment, August 15)', '[Specific data point]'],
        ['Progress', '[Met / Progressing / Emerging / Not Yet Addressed]'],
        ['Evidence', '[Brief description of data sources]'],
      ]},
      { type: 'paragraph', content: 'Goal 2: [Repeat format]' },
      { type: 'paragraph', content: 'Goal 3: [Repeat format]' },
      { type: 'paragraph', content: 'Goal 4: [Repeat format]' },
      { type: 'heading', content: 'Assessment Data \u2014 Pre/Post Comparison' },
      { type: 'note', content: 'Reading' },
      { type: 'table', headers: ['Measure', 'Pre-Assessment', 'Post-Assessment', 'Growth'], rows: [
        ['Oral Reading Fluency (WCPM)', '', '', '+[#] words'],
        ['ORF Accuracy', '', '', ''],
        ['Prosody (NAEP Scale, 1\u20134)', '', '', ''],
        ['Retelling Score (/10)', '', '', ''],
        ['Phonics Screener \u2014 CVC/Blends/Digraphs', '/28', '/28', ''],
        ['Phonics Screener \u2014 VCe', '/8', '/8', ''],
        ['Phonics Screener \u2014 Vowel Teams', '/10', '/10', ''],
        ['Phonics Screener \u2014 R-Controlled', '/8', '/8', ''],
        ['Phonics Screener \u2014 Multisyllabic', '/10', '/10', ''],
        ['Phonics Screener \u2014 Morphology', '/8', '/8', ''],
        ['Sight Word Inventory', '/70', '/70', ''],
      ]},
      { type: 'note', content: 'Writing' },
      { type: 'table', headers: ['Trait', 'Pre-Assessment', 'Post-Assessment', 'Growth'], rows: [
        ['Ideas & Content', '/4', '/4', ''],
        ['Organization', '/4', '/4', ''],
        ['Conventions', '/4', '/4', ''],
        ['Sentence Structure', '/4', '/4', ''],
        ['Total', '/16', '/16', ''],
        ['Word Count', '', '', ''],
      ]},
      { type: 'note', content: 'Math' },
      { type: 'table', headers: ['Measure', 'Pre-Assessment', 'Post-Assessment', 'Growth'], rows: [
        ['Place Value', '/5', '/5', ''],
        ['Addition/Subtraction', '/4', '/4', ''],
        ['Multiplication', '/5', '/5', ''],
        ['Division', '/4', '/4', ''],
        ['Fractions', '/5', '/5', ''],
        ['Word Problems', '/5', '/5', ''],
        ['Computation Fluency Probe (/20, 2 min)', '', '', ''],
      ]},
      { type: 'heading', content: 'Weekly Progress Monitoring Trends' },
      { type: 'note', content: 'Include trend line graphs or data tables for key progress monitoring measures.' },
      { type: 'paragraph', content: 'Oral Reading Fluency \u2014 Weekly WCPM' },
      { type: 'table', headers: ['', 'Pre', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Post'], rows: [
        ['WCPM', '', '', '', '', '', ''],
        ['Accuracy', '', '', '', '', '', ''],
      ]},
      { type: 'paragraph', content: 'Math Computation Probe \u2014 Weekly Score (/20)' },
      { type: 'table', headers: ['', 'Pre', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Post'], rows: [
        ['Correct', '', '', '', '', '', ''],
        ['Attempted', '', '', '', '', '', ''],
      ]},
      { type: 'paragraph', content: 'Phonics Pattern Mastery \u2014 Weekly Score (/10)' },
      { type: 'table', headers: ['', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5'], rows: [
        ['Score', '', '', '', ''],
        ['Pattern', '[VT1]', '[VT2/RC]', '[Multisyl]', '[Morph]'],
      ]},
      { type: 'heading', content: 'Instructional Methods & Approaches' },
      { type: 'table', headers: ['Area', 'Method', 'Description'], rows: [
        ['Phonics/Decoding', 'Orton-Gillingham (Structured Literacy)', 'Multisensory, systematic, explicit phonics instruction following the OG continuum. Techniques included phonogram card drill, sky writing, sand tray practice, arm tapping for syllable division, and decodable text reading.'],
        ['Fluency', 'Repeated Reading + Prosody Modeling', 'Timed readings with self-charting, phrase reading practice, and modeled fluency with expression.'],
        ['Comprehension', 'Explicit Strategy Instruction', 'Taught and practiced: predicting, main idea identification, sequencing, inferencing with text evidence, summarizing, and author\'s purpose analysis.'],
        ['Writing', 'Process Writing with Scaffolds', 'Gradual release model (modeled, shared, guided, independent). Graphic organizers for planning. Explicit instruction in paragraph structure, narrative elements, and opinion writing.'],
        ['Math', 'Concrete-Representational-Abstract (CRA)', 'Began with hands-on manipulatives (base-ten blocks, counters, fraction strips), transitioned to representational models (drawings, diagrams), then to abstract notation.'],
        ['Executive Function', 'Self-Monitoring Checklists', 'Visual schedules, task checklists, and self-regulation strategies embedded across all content areas.'],
      ]},
      { type: 'heading', content: 'Narrative Summary' },
      { type: 'note', content: 'Areas of Growth' },
      { type: 'paragraph', content: '[2\u20133 paragraphs describing the student\'s most significant areas of growth. Use specific data points and behavioral observations. Be concrete \u2014 this section should help a CSE team or teacher understand what changed.]' },
      { type: 'note', content: 'Areas of Continued Need' },
      { type: 'paragraph', content: '[1\u20132 paragraphs describing skills that remain below benchmark or that need continued support. Be honest but constructive. Frame as "areas for continued instruction" rather than deficits.]' },
      { type: 'note', content: 'Behavioral & Social-Emotional Observations' },
      { type: 'paragraph', content: '[1 paragraph on the student\'s engagement, effort, self-regulation, peer interactions, and response to instruction. Note any strategies that were particularly effective.]' },
      { type: 'heading', content: 'Recommendations for Fall 2026' },
      { type: 'note', content: 'These recommendations are intended to support the student\'s educational team in planning for the upcoming school year.' },
      { type: 'list', items: [
        'Reading: [Specific recommendation. Example: "Continue structured literacy instruction with focus on r-controlled vowels and multisyllabic word decoding. Student benefits from multisensory practice (sky writing, arm tapping) and should have access to decodable texts at their instructional level."]',
        'Writing: [Specific recommendation.]',
        'Math: [Specific recommendation.]',
        'Accommodations/Supports: [Specific recommendation. Example: "Extended time on reading assessments continues to be appropriate. Student benefits from a visual task checklist for multi-step assignments."]',
        'IEP Considerations: [Specific recommendation. Example: "Based on summer data, the decoding goal in the current IEP may need to be updated to reflect mastery of closed syllable patterns. Consider advancing the goal to include vowel team accuracy at 80% across 3 consecutive probes."]',
      ]},
      { type: 'heading', content: 'Attached Documentation' },
      { type: 'list', items: [
        'Pre-assessment summary (1 page)',
        'Post-assessment summary (1 page)',
        'Weekly progress monitoring data (6 weeks)',
        'Pre/post writing samples',
        'Student portfolio (provided to family at showcase)',
      ]},
      { type: 'divider' },
      { type: 'signature', content: 'Report Prepared By:\n[Instructor Name]\n[Credentials: e.g., NYS Certified Special Education Teacher, Orton-Gillingham Trained]\nIEP & Thrive \u2014 Summer 2026 Intensive Program\nA program of Cure Consulting Group\n\nDate: _______________\nContact: [Email] | [Phone]' },
      { type: 'note', content: 'This report contains educational assessment data and is intended for use by the student\'s family and educational team. It may be shared with the student\'s school district, CSE committee, or related service providers at the family\'s discretion.' },
    ],
  },
  {
    id: 'showcase',
    icon: '🎉',
    title: 'Showcase Invitation',
    timing: 'Sent Week 5',
    subject: "You're Invited! IEP & Thrive End-of-Program Family Showcase \u2014 Friday, August 15",
    sections: [
      { type: 'greeting', content: 'Dear [Parent/Guardian Name],' },
      { type: 'paragraph', content: 'You are warmly invited to celebrate [Student Name]\'s summer of growth!' },
      { type: 'heading', content: 'End-of-Program Family Showcase' },
      { type: 'table', headers: ['Detail', 'Information'], rows: [
        ['Date', 'Friday, August 15, 2026'],
        ['Time', '12:00 PM \u2013 1:30 PM'],
        ['Location', '[Program address]'],
      ]},
      { type: 'heading', content: 'What to Expect' },
      { type: 'paragraph', content: 'This is [Student Name]\'s moment to shine. Here is what the showcase will include:' },
      { type: 'schedule', content: '12:00 \u2013 12:15 PM \u2014 Welcome & Group Celebration' },
      { type: 'list', items: [
        'Brief overview of the program and what the cohort accomplished together',
        'Group photo',
      ]},
      { type: 'schedule', content: '12:15 \u2013 1:00 PM \u2014 Student Portfolio Presentations' },
      { type: 'list', items: [
        'Each student will walk their family through their portfolio',
        '[Student Name] will share their showcase pieces \u2014 work they selected, revised, and are most proud of',
        'You will see their growth data: reading fluency charts, math progress, writing samples (pre vs. post)',
      ]},
      { type: 'schedule', content: '1:00 \u2013 1:30 PM \u2014 Final Report Distribution & Closing' },
      { type: 'list', items: [
        'You will receive [Student Name]\'s CSE-ready final report',
        'Brief Q&A and individual conversations',
        'Distribution of completion certificates and portfolios',
      ]},
      { type: 'heading', content: 'Please Bring' },
      { type: 'list', items: [
        'Your pride (the biggest thing you need!)',
        'A camera or phone for photos',
        'Any questions you have about the final report or next steps for September',
        'Siblings and family members are welcome',
      ]},
      { type: 'heading', content: 'A Note About the Final Report' },
      { type: 'paragraph', content: 'The final report you will receive on August 15 is designed to be shared with [Student Name]\'s school. It includes:' },
      { type: 'list', items: [
        'Pre/post assessment data with measured growth',
        'Weekly progress monitoring trend data',
        'IEP goal progress tracking',
        'Specific recommendations for fall instruction',
        'A narrative summary of strengths and continued needs',
      ]},
      { type: 'paragraph', content: 'This document uses the same language and data formats that school districts use. It is designed to be understood and taken seriously by CSE teams, special education teachers, and related service providers. We encourage you to bring it to [Student Name]\'s September IEP meeting or first parent-teacher conference.' },
      { type: 'heading', content: 'RSVP' },
      { type: 'paragraph', content: 'Please let me know by [date, ~3 days before] how many family members will attend so we can prepare accordingly.' },
      { type: 'paragraph', content: 'Reply to this email or text [phone number]: "[Student Name] \u2014 [# attending]"' },
      { type: 'divider' },
      { type: 'paragraph', content: 'This has been an extraordinary summer, and [Student Name] has worked incredibly hard. I cannot wait for you to see what they have accomplished.' },
      { type: 'signature', content: '[Instructor Name]\nIEP & Thrive \u2014 Summer 2026 Intensive\nA program of Cure Consulting Group\n[Email] | [Phone]' },
    ],
  },
]

const communicationSchedule = [
  { when: 'Week 0 (before program)', what: 'Welcome Letter', format: 'Email (Template 1)' },
  { when: 'Every Friday', what: 'Weekly Progress Update', format: 'Email (Template 2)' },
  { when: 'End of Week 3', what: 'Mid-Program Summary', format: 'Email (Template 3)' },
  { when: 'Week 5', what: 'Showcase Invitation', format: 'Email (Template 5)' },
  { when: 'Week 6 (Showcase Day)', what: 'Final Report', format: 'Printed + PDF (Template 4)' },
  { when: 'Daily at pickup', what: 'Brief verbal debrief', format: 'In-person (1\u20132 minutes)' },
  { when: 'As needed', what: 'Phone/email for questions', format: 'Respond within 24 hours' },
]

function TemplateCard({ template }: { template: Template }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      {/* Collapsible header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-6 py-5 flex items-center justify-between hover:bg-cream transition-colors duration-200 cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <span className="text-2xl">{template.icon}</span>
          <div>
            <h3 className="font-display font-bold text-text text-lg">{template.title}</h3>
            <p className="text-text-muted text-sm font-body">{template.timing}</p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-text-muted transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      {isOpen && (
        <div className="px-6 pb-6">
          {/* Subject line banner */}
          <div className="bg-cream-deep rounded-xl px-4 py-3 mb-6 border border-border">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">Subject Line</p>
            <p className="text-sm font-body text-text font-semibold">{renderText(template.subject)}</p>
          </div>

          {/* Letter-style email template */}
          <div className="bg-white border border-border rounded-xl shadow-sm max-w-3xl mx-auto">
            {/* Email header bar */}
            <div className="border-b border-border px-6 py-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-300" />
              <div className="w-3 h-3 rounded-full bg-amber-300" />
              <div className="w-3 h-3 rounded-full bg-green-300" />
              <span className="ml-3 text-xs text-text-muted font-body">Email Preview</span>
            </div>

            {/* Email body */}
            <div className="px-8 py-8 space-y-4 font-body text-sm text-text leading-relaxed">
              {template.sections.map((section, i) => {
                switch (section.type) {
                  case 'greeting':
                    return (
                      <p key={i} className="text-text font-medium">
                        {renderText(section.content!)}
                      </p>
                    )

                  case 'paragraph':
                    return (
                      <p key={i} className="text-warm-gray leading-relaxed">
                        {renderText(section.content!)}
                      </p>
                    )

                  case 'heading':
                    return (
                      <h4
                        key={i}
                        className="font-display font-bold text-forest text-base pt-4 pb-1 border-b border-border"
                      >
                        {section.content}
                      </h4>
                    )

                  case 'table':
                    return (
                      <div key={i} className="overflow-x-auto -mx-2">
                        <table className="w-full text-sm border-collapse mx-2">
                          {section.headers && (
                            <thead>
                              <tr>
                                {section.headers.map((h, hi) => (
                                  <th
                                    key={hi}
                                    className="text-left px-3 py-2 bg-sage-pale/50 text-forest font-semibold text-xs uppercase tracking-wider border-b border-border"
                                  >
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                          )}
                          <tbody>
                            {section.rows?.map((row, ri) => (
                              <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-cream/50'}>
                                {row.map((cell, ci) => (
                                  <td
                                    key={ci}
                                    className={`px-3 py-2 border-b border-border text-warm-gray ${ci === 0 ? 'font-semibold text-text' : ''}`}
                                  >
                                    {renderText(cell)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )

                  case 'list':
                    return (
                      <ul key={i} className="space-y-2 pl-1">
                        {section.items?.map((item, li) => (
                          <li key={li} className="flex items-start gap-2.5 text-warm-gray">
                            <svg
                              className="w-4 h-4 text-forest-light shrink-0 mt-0.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2.5}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{renderText(item)}</span>
                          </li>
                        ))}
                      </ul>
                    )

                  case 'signature':
                    return (
                      <div key={i} className="pt-4 mt-4 border-t border-border">
                        <p className="text-text-muted text-sm italic mb-2">Warmly,</p>
                        {section.content!.split('\n').map((line, li) => (
                          <p key={li} className="text-text-muted text-sm leading-relaxed">
                            {renderText(line)}
                          </p>
                        ))}
                      </div>
                    )

                  case 'note':
                    return (
                      <div key={i} className="bg-sage-pale/30 rounded-lg px-4 py-2.5 text-sm text-forest italic border-l-4 border-forest-light">
                        {renderText(section.content!)}
                      </div>
                    )

                  case 'divider':
                    return <hr key={i} className="border-border my-4" />

                  case 'schedule':
                    return (
                      <div key={i} className="bg-forest/5 rounded-lg px-4 py-2.5 mt-4">
                        <p className="font-display font-bold text-forest text-sm">
                          {renderText(section.content!)}
                        </p>
                      </div>
                    )

                  default:
                    return null
                }
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ParentCommunicationsPage() {
  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-text-muted mb-6">
        <Link href="/admin/curriculum" className="hover:text-forest transition-colors">
          Curriculum
        </Link>
        <span>/</span>
        <span className="text-text font-semibold">Parent Communications</span>
      </div>

      {/* Header banner */}
      <div className="bg-amber rounded-2xl p-6 md:p-8 mb-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">&#9993;&#65039;</span>
          <div>
            <h1 className="font-display text-2xl font-bold">Parent Communication Templates</h1>
            <p className="text-white/80 text-sm font-body mt-1">
              Welcome letter, weekly updates, reports, and showcase invitation
            </p>
          </div>
        </div>
      </div>

      {/* Communication Schedule Overview */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-8">
        <h2 className="font-display font-bold text-text text-lg mb-4 flex items-center gap-2">
          <span className="text-base">&#128197;</span> Communication Schedule
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left px-3 py-2 bg-sage-pale/50 text-forest font-semibold text-xs uppercase tracking-wider border-b border-border">
                  When
                </th>
                <th className="text-left px-3 py-2 bg-sage-pale/50 text-forest font-semibold text-xs uppercase tracking-wider border-b border-border">
                  What
                </th>
                <th className="text-left px-3 py-2 bg-sage-pale/50 text-forest font-semibold text-xs uppercase tracking-wider border-b border-border">
                  Format
                </th>
              </tr>
            </thead>
            <tbody>
              {communicationSchedule.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-cream/50'}>
                  <td className="px-3 py-2.5 border-b border-border text-text font-semibold">{row.when}</td>
                  <td className="px-3 py-2.5 border-b border-border text-warm-gray">{row.what}</td>
                  <td className="px-3 py-2.5 border-b border-border text-text-muted">{row.format}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Best practices note */}
      <div className="bg-sage-pale/30 rounded-2xl border border-border p-5 mb-8">
        <p className="text-sm text-forest leading-relaxed italic">
          All parent communications should be warm, professional, and data-informed. Avoid educational
          jargon without explanation. When using terms like &ldquo;WCPM,&rdquo; &ldquo;OG,&rdquo; or
          &ldquo;CRA,&rdquo; include a brief definition the first time. The goal is for every family to
          leave every communication feeling informed, empowered, and confident in their child&apos;s progress.
        </p>
      </div>

      {/* Template cards */}
      <div className="space-y-4">
        {templates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  )
}
