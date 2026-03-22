'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

/* ──────────────────────────── Types ──────────────────────────── */

type Track = 'reading' | 'math' | 'full'
type Trend = 'improving' | 'stable' | 'declined'
type SkillStatus = 'mastered' | 'progressing' | 'emerging' | 'not-targeted'

interface IEPGoal {
  id: string
  goalText: string
  baselineAccuracy: number
  finalAccuracy: number
  trend: Trend
  notes: string
}

interface Assessment {
  id: string
  toolName: string
  preScore: string
  postScore: string
  standardScoreEquivalent: string
  notes: string
}

interface Skill {
  name: string
  status: SkillStatus
}

/* ──────────────────────────── Helpers ──────────────────────────── */

let idCounter = 0
const uid = () => `id-${++idCounter}-${Date.now()}`

const TRACK_LABELS: Record<Track, string> = {
  reading: 'Reading & Language Intensive',
  math: 'Math & Numeracy Intensive',
  full: 'Full Academic Intensive',
}

const READING_SKILLS = [
  'Phonemic Awareness',
  'Phonics / Decoding',
  'Fluency',
  'Vocabulary',
  'Comprehension',
  'Written Expression',
]

const MATH_SKILLS = [
  'Number Sense',
  'Operations',
  'Word Problems',
  'Measurement',
  'Data / Graphing',
  'Math Fluency',
]

const FULL_EXTRA = ['Executive Function', 'Social-Emotional']

function skillsForTrack(track: Track): string[] {
  if (track === 'reading') return READING_SKILLS
  if (track === 'math') return MATH_SKILLS
  return [...READING_SKILLS, ...MATH_SKILLS, ...FULL_EXTRA]
}

function trendSymbol(t: Trend) {
  if (t === 'improving') return { symbol: '↑', color: 'text-green-600', label: 'Improving' }
  if (t === 'stable') return { symbol: '→', color: 'text-amber', label: 'Stable' }
  return { symbol: '↓', color: 'text-red-600', label: 'Declined' }
}

function statusDot(s: SkillStatus) {
  const map: Record<SkillStatus, { bg: string; label: string }> = {
    mastered: { bg: 'bg-forest', label: 'Mastered' },
    progressing: { bg: 'bg-sage', label: 'Progressing' },
    emerging: { bg: 'bg-amber', label: 'Emerging' },
    'not-targeted': { bg: 'bg-gray-300', label: 'Not Targeted' },
  }
  return map[s]
}

const STATUS_OPTIONS: SkillStatus[] = ['mastered', 'progressing', 'emerging', 'not-targeted']

/* ──────────────────────────── Component ──────────────────────────── */

export default function FinalReportTemplatePage() {
  const searchParams = useSearchParams()

  /* ── Cover fields ── */
  const [studentName, setStudentName] = useState(searchParams.get('student') || '')
  const [track, setTrack] = useState<Track>((searchParams.get('track') as Track) || 'full')
  const [instructorName, setInstructorName] = useState('')

  /* ── Program summary ── */
  const [daysPresent, setDaysPresent] = useState(24)
  const [totalHours, setTotalHours] = useState('96')
  const [cohortSize, setCohortSize] = useState('6')
  const [programNotes, setProgramNotes] = useState('')

  /* ── IEP Goals (section 3) ── */
  const [goals, setGoals] = useState<IEPGoal[]>([
    { id: uid(), goalText: '', baselineAccuracy: 0, finalAccuracy: 0, trend: 'improving', notes: '' },
  ])

  /* ── Assessments (section 4) ── */
  const [assessments, setAssessments] = useState<Assessment[]>([
    { id: uid(), toolName: '', preScore: '', postScore: '', standardScoreEquivalent: '', notes: '' },
  ])

  /* ── Skills inventory (section 5) ── */
  const [skills, setSkills] = useState<Skill[]>([])

  /* ── Narrative sections ── */
  const [instructionalMethods, setInstructionalMethods] = useState('')
  const [behavioralSummary, setBehavioralSummary] = useState('')
  const [homePractice, setHomePractice] = useState('')
  const [recommendedGoalLanguage, setRecommendedGoalLanguage] = useState('')

  /* ── Signature ── */
  const [sigName, setSigName] = useState('')
  const [sigCredentials, setSigCredentials] = useState(
    'NYS Certified Special Education Teacher\nSPED Interventionist, NYC DOE\nOrton-Gillingham Trained Practitioner'
  )
  const [sigDate, setSigDate] = useState(new Date().toISOString().slice(0, 10))

  /* Re-initialize skills when track changes */
  useEffect(() => {
    setSkills(skillsForTrack(track).map((name) => ({ name, status: 'not-targeted' as SkillStatus })))
  }, [track])

  /* ── Goal helpers ── */
  const addGoal = () => {
    if (goals.length >= 6) return
    setGoals((prev) => [
      ...prev,
      { id: uid(), goalText: '', baselineAccuracy: 0, finalAccuracy: 0, trend: 'improving', notes: '' },
    ])
  }

  const removeGoal = (id: string) => {
    if (goals.length <= 1) return
    setGoals((prev) => prev.filter((g) => g.id !== id))
  }

  const updateGoal = (id: string, field: keyof IEPGoal, value: string | number) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g
        const updated = { ...g, [field]: value }
        // Auto-set trend based on growth
        if (field === 'baselineAccuracy' || field === 'finalAccuracy') {
          const diff = updated.finalAccuracy - updated.baselineAccuracy
          updated.trend = diff > 0 ? 'improving' : diff === 0 ? 'stable' : 'declined'
        }
        return updated
      })
    )
  }

  /* ── Assessment helpers ── */
  const addAssessment = () => {
    if (assessments.length >= 3) return
    setAssessments((prev) => [
      ...prev,
      { id: uid(), toolName: '', preScore: '', postScore: '', standardScoreEquivalent: '', notes: '' },
    ])
  }

  const removeAssessment = (id: string) => {
    if (assessments.length <= 1) return
    setAssessments((prev) => prev.filter((a) => a.id !== id))
  }

  const updateAssessment = (id: string, field: keyof Assessment, value: string) => {
    setAssessments((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)))
  }

  /* ── Skills helper ── */
  const cycleStatus = (idx: number) => {
    setSkills((prev) => {
      const copy = [...prev]
      const current = STATUS_OPTIONS.indexOf(copy[idx].status)
      copy[idx] = { ...copy[idx], status: STATUS_OPTIONS[(current + 1) % STATUS_OPTIONS.length] }
      return copy
    })
  }

  /* ── Print ── */
  const handlePrint = () => window.print()

  /* ──────────── Shared input classes ──────────── */
  const inputCls =
    'w-full rounded-xl border border-border bg-white px-3 py-2 font-body text-sm text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest transition-colors'
  const textareaCls = `${inputCls} resize-y`
  const selectCls = `${inputCls} appearance-none cursor-pointer`
  const labelCls = 'block font-body text-xs font-semibold text-text mb-1 tracking-wide uppercase'

  /* ════════════════════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════════════════════ */
  return (
    <>
      {/* ── Print stylesheet ── */}
      <style jsx global>{`
        @media print {
          /* Hide admin chrome */
          header,
          aside,
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          main {
            padding: 0 !important;
          }
          .print-cover {
            display: flex !important;
            break-after: page;
          }
          .print-section {
            padding: 2rem 2.5rem;
          }
          .print-page-break {
            break-before: page;
          }
          .print-section-header {
            font-family: var(--font-display);
            font-size: 1.1rem;
            font-weight: 700;
            color: #1B4332;
            border-bottom: 3px solid #B7E4C7;
            padding-bottom: 0.35rem;
            margin-bottom: 1rem;
          }
          table {
            border-collapse: collapse;
            width: 100%;
          }
          table th,
          table td {
            border: 1px solid #d0d0d0;
            padding: 6px 10px;
            font-size: 11px;
          }
          table tr:nth-child(even) {
            background-color: #f7f7f5;
          }
          @page {
            margin: 0.6in 0.5in;
            @bottom-center {
              content: "IEP & Thrive · Confidential · Summer 2026";
              font-family: "DM Sans", sans-serif;
              font-size: 8px;
              color: #78716C;
            }
          }
          .skill-dot-print {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            display: inline-block;
          }
          /* Signature section */
          .sig-line {
            border-bottom: 1px solid #1C1917;
            width: 250px;
            margin-top: 2rem;
          }
        }
        @media not print {
          .print-cover {
            display: none !important;
          }
        }
      `}</style>

      {/* ═══════════════════════════════════════════════════════════
          PRINT-ONLY COVER PAGE
          ═══════════════════════════════════════════════════════════ */}
      <div className="print-cover flex-col items-center justify-center min-h-screen bg-forest text-white text-center p-12">
        <p className="font-display text-4xl font-bold mb-1">
          IEP <span className="text-amber">&</span> Thrive
        </p>
        <p className="font-body text-sm tracking-[0.15em] uppercase text-white/60 mb-12">
          SPED Summer Intensive · Long Island, NY
        </p>
        <p className="font-body text-xs tracking-[0.12em] uppercase text-sage mb-4">
          Comprehensive Final Report
        </p>
        <p className="font-display text-3xl font-bold mb-2">{studentName || 'Student Name'}</p>
        <p className="font-body text-base text-white/70 mb-8">{TRACK_LABELS[track]}</p>
        <p className="font-body text-sm text-white/50">July 7 – August 14, 2026</p>
        {instructorName && (
          <p className="font-body text-sm text-white/50 mt-1">Prepared by {instructorName}</p>
        )}
        <div className="mt-16 font-body text-xs text-white/30">
          A program of IEP & Thrive, powered by Cure Consulting Group · Confidential
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SCREEN UI — TOOLBAR
          ═══════════════════════════════════════════════════════════ */}
      <div className="no-print mb-6 flex items-center justify-between">
        <Link
          href="/admin/reports"
          className="flex items-center gap-2 font-body text-sm text-forest hover:text-forest-mid transition-colors"
        >
          <span>←</span> Back to Reports
        </Link>
        <button
          onClick={handlePrint}
          className="bg-forest text-white font-body text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-forest-mid transition-colors"
        >
          Print Report
        </button>
      </div>

      <div className="no-print mb-4">
        <h1 className="font-display text-2xl font-bold text-forest">
          CSE-Ready Final Comprehensive Report
        </h1>
        <p className="font-body text-sm text-text-muted mt-1">
          Fill in each section below. Use "Print Report" to generate the formatted PDF.
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 1 — COVER INFO (screen entry)
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white rounded-2xl border border-border p-6 mb-4 print-section">
        <h2 className="font-display text-lg font-bold text-forest mb-4 print-section-header">
          1. Cover Page Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Student Name</label>
            <input
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className={inputCls}
              placeholder="First Last"
            />
          </div>
          <div>
            <label className={labelCls}>Program Track</label>
            <select
              value={track}
              onChange={(e) => setTrack(e.target.value as Track)}
              className={selectCls}
            >
              <option value="reading">Reading & Language Intensive</option>
              <option value="math">Math & Numeracy Intensive</option>
              <option value="full">Full Academic Intensive</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Instructor Name</label>
            <input
              value={instructorName}
              onChange={(e) => setInstructorName(e.target.value)}
              className={inputCls}
              placeholder="Instructor name"
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 2 — PROGRAM SUMMARY
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white rounded-2xl border border-border p-6 mb-4 print-section">
        <h2 className="font-display text-lg font-bold text-forest mb-4 print-section-header">
          2. Program Summary
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div>
            <label className={labelCls}>Days Present</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={0}
                max={24}
                value={daysPresent}
                onChange={(e) => setDaysPresent(Number(e.target.value))}
                className={`${inputCls} w-20`}
              />
              <span className="font-body text-sm text-text-muted">/ 24</span>
            </div>
          </div>
          <div>
            <label className={labelCls}>Total Instructional Hours</label>
            <input
              value={totalHours}
              onChange={(e) => setTotalHours(e.target.value)}
              className={inputCls}
              placeholder="96"
            />
          </div>
          <div>
            <label className={labelCls}>Cohort Size</label>
            <input
              value={cohortSize}
              onChange={(e) => setCohortSize(e.target.value)}
              className={inputCls}
              placeholder="6"
            />
          </div>
          <div>
            <label className={labelCls}>Attendance Rate</label>
            <div className="font-body text-lg font-bold text-forest mt-1">
              {daysPresent > 0 ? Math.round((daysPresent / 24) * 100) : 0}%
            </div>
          </div>
        </div>
        <div>
          <label className={labelCls}>Program Track Description</label>
          <textarea
            value={programNotes}
            onChange={(e) => setProgramNotes(e.target.value)}
            rows={3}
            className={textareaCls}
            placeholder={`Describe the ${TRACK_LABELS[track]} program structure, schedule, and focus areas for this student...`}
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 3 — IEP GOAL PROGRESS  (page break in print)
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white rounded-2xl border border-border p-6 mb-4 print-section print-page-break">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-forest print-section-header">
            3. IEP Goal Progress
          </h2>
          <button
            onClick={addGoal}
            disabled={goals.length >= 6}
            className="no-print bg-sage-pale text-forest font-body text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-sage transition-colors disabled:opacity-40"
          >
            + Add Goal ({goals.length}/6)
          </button>
        </div>

        <div className="space-y-4">
          {goals.map((goal, idx) => {
            const growth = goal.finalAccuracy - goal.baselineAccuracy
            const t = trendSymbol(goal.trend)
            return (
              <div
                key={goal.id}
                className="border border-border rounded-xl p-4 relative"
              >
                {goals.length > 1 && (
                  <button
                    onClick={() => removeGoal(goal.id)}
                    className="no-print absolute top-3 right-3 text-red-400 hover:text-red-600 text-xs font-body"
                  >
                    Remove
                  </button>
                )}
                <p className="font-body text-xs font-semibold text-forest-light mb-3 uppercase tracking-wider">
                  Goal {idx + 1}
                </p>

                <div className="mb-3">
                  <label className={labelCls}>IEP Goal Text</label>
                  <textarea
                    value={goal.goalText}
                    onChange={(e) => updateGoal(goal.id, 'goalText', e.target.value)}
                    rows={2}
                    className={textareaCls}
                    placeholder="e.g., Student will decode CVC words with 80% accuracy across 3 consecutive data points..."
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div>
                    <label className={labelCls}>Baseline %</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={goal.baselineAccuracy}
                      onChange={(e) =>
                        updateGoal(goal.id, 'baselineAccuracy', Number(e.target.value))
                      }
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Final %</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={goal.finalAccuracy}
                      onChange={(e) =>
                        updateGoal(goal.id, 'finalAccuracy', Number(e.target.value))
                      }
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Growth</label>
                    <div
                      className={`font-body text-lg font-bold mt-1 ${
                        growth > 0
                          ? 'text-green-600'
                          : growth < 0
                          ? 'text-red-600'
                          : 'text-amber'
                      }`}
                    >
                      {growth > 0 ? '+' : ''}
                      {growth}%
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Trend</label>
                    <div className={`font-body text-lg font-bold mt-1 ${t.color}`}>
                      {t.symbol} {t.label}
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Trend Override</label>
                    <select
                      value={goal.trend}
                      onChange={(e) => updateGoal(goal.id, 'trend', e.target.value)}
                      className={selectCls}
                    >
                      <option value="improving">↑ Improving</option>
                      <option value="stable">→ Stable</option>
                      <option value="declined">↓ Declined</option>
                    </select>
                  </div>
                </div>

                <div className="mt-3">
                  <label className={labelCls}>Narrative Notes</label>
                  <textarea
                    value={goal.notes}
                    onChange={(e) => updateGoal(goal.id, 'notes', e.target.value)}
                    rows={2}
                    className={textareaCls}
                    placeholder="Describe progress, strategies used, and recommendations..."
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 4 — PRE / POST ASSESSMENT
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white rounded-2xl border border-border p-6 mb-4 print-section">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-forest print-section-header">
            4. Pre / Post Assessment Data
          </h2>
          <button
            onClick={addAssessment}
            disabled={assessments.length >= 3}
            className="no-print bg-sage-pale text-forest font-body text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-sage transition-colors disabled:opacity-40"
          >
            + Add Assessment ({assessments.length}/3)
          </button>
        </div>

        <div className="space-y-4">
          {assessments.map((a, idx) => (
            <div key={a.id} className="border border-border rounded-xl p-4 relative">
              {assessments.length > 1 && (
                <button
                  onClick={() => removeAssessment(a.id)}
                  className="no-print absolute top-3 right-3 text-red-400 hover:text-red-600 text-xs font-body"
                >
                  Remove
                </button>
              )}
              <p className="font-body text-xs font-semibold text-forest-light mb-3 uppercase tracking-wider">
                Assessment {idx + 1}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Assessment Tool</label>
                  <input
                    value={a.toolName}
                    onChange={(e) => updateAssessment(a.id, 'toolName', e.target.value)}
                    className={inputCls}
                    placeholder="e.g., DIBELS, TOWRE-2, KeyMath-3..."
                  />
                </div>
                <div>
                  <label className={labelCls}>Pre-Score</label>
                  <input
                    value={a.preScore}
                    onChange={(e) => updateAssessment(a.id, 'preScore', e.target.value)}
                    className={inputCls}
                    placeholder="Score"
                  />
                </div>
                <div>
                  <label className={labelCls}>Post-Score</label>
                  <input
                    value={a.postScore}
                    onChange={(e) => updateAssessment(a.id, 'postScore', e.target.value)}
                    className={inputCls}
                    placeholder="Score"
                  />
                </div>
                <div>
                  <label className={labelCls}>Standard Score Equiv.</label>
                  <input
                    value={a.standardScoreEquivalent}
                    onChange={(e) =>
                      updateAssessment(a.id, 'standardScoreEquivalent', e.target.value)
                    }
                    className={inputCls}
                    placeholder="e.g., SS 85"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className={labelCls}>Notes</label>
                <textarea
                  value={a.notes}
                  onChange={(e) => updateAssessment(a.id, 'notes', e.target.value)}
                  rows={2}
                  className={textareaCls}
                  placeholder="Interpretation, context, comparison to norms..."
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 5 — SKILLS INVENTORY  (page break in print)
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white rounded-2xl border border-border p-6 mb-4 print-section print-page-break">
        <h2 className="font-display text-lg font-bold text-forest mb-2 print-section-header">
          5. Skills Inventory
        </h2>
        <p className="font-body text-xs text-text-muted mb-4 no-print">
          Click a skill to cycle its status: Not Targeted → Mastered → Progressing → Emerging
        </p>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4 text-xs font-body text-text-muted">
          {STATUS_OPTIONS.map((s) => {
            const d = statusDot(s)
            return (
              <span key={s} className="flex items-center gap-1.5">
                <span className={`inline-block w-3 h-3 rounded-full ${d.bg} skill-dot-print`} />
                {d.label}
              </span>
            )
          })}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {skills.map((skill, idx) => {
            const d = statusDot(skill.status)
            return (
              <button
                key={skill.name}
                type="button"
                onClick={() => cycleStatus(idx)}
                className="flex items-center gap-2.5 rounded-xl border border-border px-3 py-2.5 text-left hover:bg-cream-deep/50 transition-colors no-print-button"
              >
                <span className={`inline-block w-3.5 h-3.5 rounded-full shrink-0 ${d.bg} skill-dot-print`} />
                <span className="font-body text-sm text-text">{skill.name}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 6 — INSTRUCTIONAL METHODS
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white rounded-2xl border border-border p-6 mb-4 print-section">
        <h2 className="font-display text-lg font-bold text-forest mb-4 print-section-header">
          6. Instructional Methods & Frameworks
        </h2>
        <textarea
          value={instructionalMethods}
          onChange={(e) => setInstructionalMethods(e.target.value)}
          rows={5}
          className={textareaCls}
          placeholder="Describe the instructional frameworks, curricula, and evidence-based methods used (e.g., Orton-Gillingham, Wilson Reading, Concrete-Representational-Abstract, Leveled Literacy Intervention). Include how methods were adapted for this student's specific learning profile..."
        />
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 7 — BEHAVIORAL & ENGAGEMENT  (page break in print)
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white rounded-2xl border border-border p-6 mb-4 print-section print-page-break">
        <h2 className="font-display text-lg font-bold text-forest mb-4 print-section-header">
          7. Behavioral & Engagement Summary
        </h2>
        <textarea
          value={behavioralSummary}
          onChange={(e) => setBehavioralSummary(e.target.value)}
          rows={5}
          className={textareaCls}
          placeholder="Describe the student's participation, self-regulation, peer interaction, engagement trends over the 6 weeks, and any behavioral strategies that were effective..."
        />
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 8 — HOME PRACTICE RECOMMENDATIONS
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white rounded-2xl border border-border p-6 mb-4 print-section">
        <h2 className="font-display text-lg font-bold text-forest mb-4 print-section-header">
          8. Home Practice Recommendations
        </h2>
        <textarea
          value={homePractice}
          onChange={(e) => setHomePractice(e.target.value)}
          rows={5}
          className={textareaCls}
          placeholder="Provide specific, actionable activities families can continue at home (15 min/night). Include materials, apps, strategies, and frequency recommendations..."
        />
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 9 — RECOMMENDED IEP GOAL LANGUAGE  (page break in print)
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white rounded-2xl border border-border p-6 mb-4 print-section print-page-break relative overflow-hidden">
        {/* Prominent left accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-forest rounded-l-2xl" />

        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-amber/15 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-amber text-sm font-bold">★</span>
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-forest print-section-header">
              9. Recommended IEP Goal Language for September CSE
            </h2>
            <p className="font-body text-xs text-text-muted mt-0.5">
              High-value section — provide suggested goal text, benchmarks, and measurement criteria that the family can bring to their September CSE meeting.
            </p>
          </div>
        </div>

        <div className="bg-amber-light/40 border border-amber/20 rounded-xl p-3 mb-4 no-print">
          <p className="font-body text-xs text-amber font-semibold">
            Tip: Write goals in measurable terms using the format: "Given [condition], [student] will [behavior] with [accuracy] as measured by [method] by [date]."
          </p>
        </div>

        <textarea
          value={recommendedGoalLanguage}
          onChange={(e) => setRecommendedGoalLanguage(e.target.value)}
          rows={8}
          className={`${textareaCls} border-forest/20`}
          placeholder={`Example:\n\nGiven grade-level decodable text, the student will accurately decode multisyllabic words containing common syllable patterns (closed, open, VCe, vowel team) with 80% accuracy across 3 consecutive data collection points, as measured by weekly oral reading records.\n\nGiven a set of 20 grade-level math word problems, the student will identify the operation, set up the equation, and solve with 75% accuracy as measured by curriculum-based assessment by June 2027.`}
        />
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 10 — INSTRUCTOR SIGNATURE
          ═══════════════════════════════════════════════════════════ */}
      <section className="bg-white rounded-2xl border border-border p-6 mb-4 print-section">
        <h2 className="font-display text-lg font-bold text-forest mb-4 print-section-header">
          10. Instructor Signature
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className={labelCls}>Name</label>
            <input
              value={sigName}
              onChange={(e) => setSigName(e.target.value)}
              className={inputCls}
              placeholder="Instructor full name"
            />
          </div>
          <div>
            <label className={labelCls}>Date</label>
            <input
              type="date"
              value={sigDate}
              onChange={(e) => setSigDate(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>Credentials</label>
          <textarea
            value={sigCredentials}
            onChange={(e) => setSigCredentials(e.target.value)}
            rows={3}
            className={textareaCls}
            placeholder="List credentials, one per line"
          />
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex flex-col sm:flex-row sm:items-end gap-8">
            <div className="flex-1">
              <p className="font-body text-xs text-text-muted mb-1 uppercase tracking-wider font-semibold">
                Signature
              </p>
              <div className="border-b-2 border-text h-8 sig-line" />
              <p className="font-body text-sm text-text mt-1 font-semibold">
                {sigName || 'Instructor Name'}
              </p>
              {sigCredentials.split('\n').filter(Boolean).map((cred, i) => (
                <p key={i} className="font-body text-xs text-text-muted">
                  {cred}
                </p>
              ))}
            </div>
            <div>
              <p className="font-body text-xs text-text-muted mb-1 uppercase tracking-wider font-semibold">
                Date
              </p>
              <div className="border-b-2 border-text h-8 w-40 sig-line" />
              <p className="font-body text-sm text-text mt-1">{sigDate}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Print footer info (visible in print only via CSS @page) */}
      <div className="no-print mt-6 mb-12 text-center">
        <button
          onClick={handlePrint}
          className="bg-forest text-white font-body text-sm font-semibold px-8 py-3 rounded-full hover:bg-forest-mid transition-colors"
        >
          Print Report
        </button>
        <p className="font-body text-xs text-text-muted mt-3">
          The printed version will include the cover page, formatted tables, and page breaks for a professional 3-4 page document.
        </p>
      </div>
    </>
  )
}
