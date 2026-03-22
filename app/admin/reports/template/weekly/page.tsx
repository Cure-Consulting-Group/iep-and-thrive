'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface IEPGoal {
  skillArea: string
  targetDescription: string
  accuracyPercent: number
  trend: 'Improving' | 'Stable' | 'Emerging'
}

const PROGRAM_OPTIONS = [
  'Reading & Language',
  'Full Academic',
  'Math & Numeracy',
]

const STRATEGIES = [
  'OG Phonics',
  'Guided Reading',
  'CRA Math',
  'Executive Function Coaching',
  'SEL Intervention',
  'Other',
]

function emptyGoal(): IEPGoal {
  return { skillArea: '', targetDescription: '', accuracyPercent: 0, trend: 'Emerging' }
}

function accuracyColorClass(pct: number): string {
  if (pct >= 80) return 'text-forest-light'
  if (pct >= 60) return 'text-amber'
  return 'text-red-600'
}

export default function WeeklyReportTemplatePage() {
  const searchParams = useSearchParams()

  // --- Form State ---
  const [studentName, setStudentName] = useState('')
  const [programTrack, setProgramTrack] = useState(PROGRAM_OPTIONS[0])
  const [weekNumber, setWeekNumber] = useState('1')
  const [dateRange, setDateRange] = useState('')
  const [instructorName, setInstructorName] = useState('')
  const [goals, setGoals] = useState<IEPGoal[]>([emptyGoal()])
  const [strategies, setStrategies] = useState<Record<string, boolean>>(
    Object.fromEntries(STRATEGIES.map((s) => [s, false]))
  )
  const [engagementNotes, setEngagementNotes] = useState('')
  const [homePractice, setHomePractice] = useState('')
  const [signatureName, setSignatureName] = useState('')
  const [dateSigned, setDateSigned] = useState('')

  // Pre-fill from query params
  useEffect(() => {
    const student = searchParams.get('student')
    const week = searchParams.get('week')
    if (student) setStudentName(student)
    if (week && Number(week) >= 1 && Number(week) <= 6) setWeekNumber(week)
  }, [searchParams])

  // --- Goal helpers ---
  const addGoal = () => {
    if (goals.length < 4) setGoals([...goals, emptyGoal()])
  }

  const updateGoal = (index: number, field: keyof IEPGoal, value: string | number) => {
    setGoals((prev) =>
      prev.map((g, i) => (i === index ? { ...g, [field]: value } : g))
    )
  }

  const removeGoal = (index: number) => {
    if (goals.length > 1) setGoals((prev) => prev.filter((_, i) => i !== index))
  }

  const toggleStrategy = (name: string) => {
    setStrategies((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  const activeStrategies = Object.entries(strategies)
    .filter(([, v]) => v)
    .map(([k]) => k)

  return (
    <>
      {/* Print-only styles */}
      <style>{`
        @media print {
          /* Hide admin chrome */
          header, aside, nav,
          .no-print {
            display: none !important;
          }
          /* Let main take full width */
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          main > div {
            max-width: 100% !important;
          }
          body, html {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-report {
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
          }
          /* Inputs become text */
          .print-report input,
          .print-report select,
          .print-report textarea {
            border: none !important;
            background: transparent !important;
            padding: 0 !important;
            box-shadow: none !important;
            -webkit-appearance: none;
            appearance: none;
            resize: none;
            outline: none;
            font-size: 11px !important;
          }
          .print-report textarea {
            height: auto !important;
            overflow: visible !important;
          }
          /* Show print header */
          .print-header {
            display: flex !important;
          }
          .print-footer {
            display: block !important;
          }
          /* Hide screen-only elements */
          .screen-only {
            display: none !important;
          }
          /* Page sizing */
          @page {
            size: letter;
            margin: 0.5in;
          }
          .print-report {
            font-size: 11px !important;
            line-height: 1.4 !important;
          }
          .print-report h2 {
            font-size: 14px !important;
            margin-bottom: 6px !important;
          }
          .print-report h3 {
            font-size: 12px !important;
          }
          .print-section {
            margin-bottom: 10px !important;
            padding-bottom: 8px !important;
          }
          .goal-table th,
          .goal-table td {
            padding: 4px 8px !important;
            font-size: 10px !important;
          }
        }
      `}</style>

      <div>
        {/* Screen toolbar */}
        <div className="no-print flex items-center justify-between mb-6">
          <Link
            href="/admin/reports"
            className="text-sm font-body text-forest hover:text-forest-mid transition-colors flex items-center gap-1"
          >
            &larr; Back to Reports
          </Link>
          <button
            onClick={() => window.print()}
            className="bg-forest text-white font-body text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-forest-mid transition-colors"
          >
            Print Report
          </button>
        </div>

        {/* Report Card */}
        <div className="print-report bg-white rounded-2xl border border-border shadow-sm p-8">
          {/* Print Header (hidden on screen) */}
          <div className="print-header hidden items-center justify-between bg-forest text-white px-6 py-3 rounded-lg mb-4" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
            <span className="font-display font-bold text-base">
              IEP &amp; Thrive &middot; Weekly Progress Report
            </span>
            <span className="bg-sage-pale text-forest text-xs font-body font-semibold px-3 py-1 rounded-full">
              Week {weekNumber}
            </span>
          </div>

          {/* Section: Student Information */}
          <div className="print-section mb-8">
            <h2 className="font-display text-xl font-bold text-forest mb-4 pb-2 border-b-2 border-sage-pale">
              Student Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block font-body text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter student name"
                  className="w-full rounded-xl border border-border bg-white px-3 py-2 font-body text-sm text-text focus:outline-none focus:ring-2 focus:ring-forest/30"
                />
              </div>
              <div>
                <label className="block font-body text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">
                  Program Track
                </label>
                <select
                  value={programTrack}
                  onChange={(e) => setProgramTrack(e.target.value)}
                  className="w-full rounded-xl border border-border bg-white px-3 py-2 font-body text-sm text-text focus:outline-none focus:ring-2 focus:ring-forest/30"
                >
                  {PROGRAM_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-body text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">
                  Week Number
                </label>
                <select
                  value={weekNumber}
                  onChange={(e) => setWeekNumber(e.target.value)}
                  className="w-full rounded-xl border border-border bg-white px-3 py-2 font-body text-sm text-text focus:outline-none focus:ring-2 focus:ring-forest/30"
                >
                  {[1, 2, 3, 4, 5, 6].map((w) => (
                    <option key={w} value={String(w)}>Week {w}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-body text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">
                  Date Range
                </label>
                <input
                  type="text"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  placeholder="e.g., July 7–10, 2026"
                  className="w-full rounded-xl border border-border bg-white px-3 py-2 font-body text-sm text-text focus:outline-none focus:ring-2 focus:ring-forest/30"
                />
              </div>
              <div>
                <label className="block font-body text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">
                  Instructor Name
                </label>
                <input
                  type="text"
                  value={instructorName}
                  onChange={(e) => setInstructorName(e.target.value)}
                  placeholder="Enter instructor name"
                  className="w-full rounded-xl border border-border bg-white px-3 py-2 font-body text-sm text-text focus:outline-none focus:ring-2 focus:ring-forest/30"
                />
              </div>
            </div>
          </div>

          {/* Section: IEP Goals */}
          <div className="print-section mb-8">
            <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-sage-pale">
              <h2 className="font-display text-xl font-bold text-forest">
                IEP Goals &amp; Progress
              </h2>
              {goals.length < 4 && (
                <button
                  onClick={addGoal}
                  className="screen-only text-sm font-body font-semibold text-forest hover:text-forest-mid transition-colors"
                >
                  + Add Goal
                </button>
              )}
            </div>

            {/* Screen: card-style goals */}
            <div className="space-y-4 sm:hidden-print">
              {goals.map((goal, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl border border-border p-4 ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-cream'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-body text-xs font-semibold text-text-muted uppercase tracking-wide">
                      Goal {idx + 1}
                    </span>
                    {goals.length > 1 && (
                      <button
                        onClick={() => removeGoal(idx)}
                        className="screen-only text-xs font-body text-red-500 hover:text-red-700 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-body text-xs text-text-muted mb-1">
                        Goal / Skill Area
                      </label>
                      <input
                        type="text"
                        value={goal.skillArea}
                        onChange={(e) => updateGoal(idx, 'skillArea', e.target.value)}
                        placeholder="e.g., Phonemic Awareness"
                        className="w-full rounded-xl border border-border bg-white px-3 py-2 font-body text-sm text-text focus:outline-none focus:ring-2 focus:ring-forest/30"
                      />
                    </div>
                    <div>
                      <label className="block font-body text-xs text-text-muted mb-1">
                        Target Description
                      </label>
                      <input
                        type="text"
                        value={goal.targetDescription}
                        onChange={(e) => updateGoal(idx, 'targetDescription', e.target.value)}
                        placeholder="e.g., Blend CVC words with 80% accuracy"
                        className="w-full rounded-xl border border-border bg-white px-3 py-2 font-body text-sm text-text focus:outline-none focus:ring-2 focus:ring-forest/30"
                      />
                    </div>
                    <div>
                      <label className="block font-body text-xs text-text-muted mb-1">
                        Current Accuracy %
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={goal.accuracyPercent}
                          onChange={(e) =>
                            updateGoal(idx, 'accuracyPercent', Math.min(100, Math.max(0, Number(e.target.value))))
                          }
                          className={`w-20 rounded-xl border border-border bg-white px-3 py-2 font-body text-sm font-bold focus:outline-none focus:ring-2 focus:ring-forest/30 ${accuracyColorClass(goal.accuracyPercent)}`}
                        />
                        <span className={`font-body text-sm font-bold ${accuracyColorClass(goal.accuracyPercent)}`}>
                          %
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block font-body text-xs text-text-muted mb-1">
                        Trend
                      </label>
                      <select
                        value={goal.trend}
                        onChange={(e) => updateGoal(idx, 'trend', e.target.value)}
                        className="w-full rounded-xl border border-border bg-white px-3 py-2 font-body text-sm text-text focus:outline-none focus:ring-2 focus:ring-forest/30"
                      >
                        <option value="Improving">Improving</option>
                        <option value="Stable">Stable</option>
                        <option value="Emerging">Emerging</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Print: table-style goals (hidden on screen, shown in print via CSS) */}
            <table className="goal-table hidden w-full border-collapse mt-2" style={{ display: 'none' }}>
              <thead>
                <tr className="bg-cream-deep">
                  <th className="text-left font-body text-xs font-semibold text-forest px-3 py-2 border border-border">
                    Goal / Skill Area
                  </th>
                  <th className="text-left font-body text-xs font-semibold text-forest px-3 py-2 border border-border">
                    Target Description
                  </th>
                  <th className="text-center font-body text-xs font-semibold text-forest px-3 py-2 border border-border">
                    Accuracy
                  </th>
                  <th className="text-center font-body text-xs font-semibold text-forest px-3 py-2 border border-border">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody>
                {goals.map((goal, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-cream'}>
                    <td className="font-body text-xs px-3 py-2 border border-border text-text">
                      {goal.skillArea || '---'}
                    </td>
                    <td className="font-body text-xs px-3 py-2 border border-border text-text">
                      {goal.targetDescription || '---'}
                    </td>
                    <td className={`font-body text-xs font-bold px-3 py-2 border border-border text-center ${accuracyColorClass(goal.accuracyPercent)}`}>
                      {goal.accuracyPercent}%
                    </td>
                    <td className="font-body text-xs px-3 py-2 border border-border text-center text-text">
                      {goal.trend}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section: Instructional Strategies */}
          <div className="print-section mb-8">
            <h2 className="font-display text-xl font-bold text-forest mb-4 pb-2 border-b-2 border-sage-pale">
              Instructional Strategies Used
            </h2>
            <div className="flex flex-wrap gap-3">
              {STRATEGIES.map((strategy) => (
                <label
                  key={strategy}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-colors font-body text-sm ${
                    strategies[strategy]
                      ? 'border-forest bg-sage-pale text-forest font-semibold'
                      : 'border-border bg-white text-text-muted hover:border-forest/30'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={strategies[strategy]}
                    onChange={() => toggleStrategy(strategy)}
                    className="screen-only accent-forest w-4 h-4"
                  />
                  {/* Print: show checkmark */}
                  <span className="hidden print-check" style={{ display: 'none' }}>
                    {strategies[strategy] ? '\u2713' : '\u2717'}
                  </span>
                  {strategy}
                </label>
              ))}
            </div>
            {/* Print-only: simple list */}
            <div className="print-strategies-list hidden mt-2" style={{ display: 'none' }}>
              <p className="font-body text-xs text-text">
                {activeStrategies.length > 0 ? activeStrategies.join(', ') : 'None selected'}
              </p>
            </div>
          </div>

          {/* Section: Engagement & Behavior */}
          <div className="print-section mb-8">
            <h2 className="font-display text-xl font-bold text-forest mb-4 pb-2 border-b-2 border-sage-pale">
              Engagement &amp; Behavior Notes
            </h2>
            <textarea
              value={engagementNotes}
              onChange={(e) => setEngagementNotes(e.target.value)}
              rows={4}
              placeholder="Describe the student's engagement level, participation, behavioral observations, and any notable moments during sessions this week..."
              className="w-full rounded-xl border border-border bg-white px-4 py-3 font-body text-sm text-text focus:outline-none focus:ring-2 focus:ring-forest/30 resize-y"
            />
          </div>

          {/* Section: Home Practice */}
          <div className="print-section mb-8">
            <h2 className="font-display text-xl font-bold text-forest mb-4 pb-2 border-b-2 border-sage-pale">
              Home Practice Recommendations
            </h2>
            <textarea
              value={homePractice}
              onChange={(e) => setHomePractice(e.target.value)}
              rows={3}
              placeholder="Recommended at-home activities and practice (approx. 15 min/night)..."
              className="w-full rounded-xl border border-border bg-white px-4 py-3 font-body text-sm text-text focus:outline-none focus:ring-2 focus:ring-forest/30 resize-y"
            />
          </div>

          {/* Section: Signature */}
          <div className="print-section mb-4">
            <h2 className="font-display text-xl font-bold text-forest mb-4 pb-2 border-b-2 border-sage-pale">
              Instructor Signature
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-body text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">
                  Instructor Signature
                </label>
                <input
                  type="text"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  placeholder="Type full name as signature"
                  className="w-full rounded-xl border-b-2 border-t-0 border-l-0 border-r-0 border-border bg-white px-3 py-2 font-display text-lg italic text-text focus:outline-none focus:ring-0 focus:border-forest"
                />
              </div>
              <div>
                <label className="block font-body text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">
                  Date Signed
                </label>
                <input
                  type="text"
                  value={dateSigned}
                  onChange={(e) => setDateSigned(e.target.value)}
                  placeholder="e.g., July 11, 2026"
                  className="w-full rounded-xl border border-border bg-white px-3 py-2 font-body text-sm text-text focus:outline-none focus:ring-2 focus:ring-forest/30"
                />
              </div>
            </div>
          </div>

          {/* Print Footer (hidden on screen) */}
          <div className="print-footer hidden text-center pt-4 mt-4 border-t border-border" style={{ display: 'none' }}>
            <p className="font-body text-text-muted" style={{ fontSize: '11px' }}>
              IEP &amp; Thrive &middot; Summer 2026 &middot; Confidential
            </p>
          </div>
        </div>
      </div>

      {/* Print-specific overrides to show/hide elements */}
      <style>{`
        @media print {
          .goal-table {
            display: table !important;
          }
          .sm\\:hidden-print > div {
            display: none !important;
          }
          .print-check {
            display: inline !important;
          }
          .print-strategies-list {
            display: block !important;
          }
          .print-footer {
            display: block !important;
          }
          /* Hide checkbox inputs in print */
          .print-section label input[type="checkbox"] {
            display: none !important;
          }
          /* Strategy labels in print: only show checked ones */
          .print-section .flex.flex-wrap {
            display: none !important;
          }
        }
      `}</style>
    </>
  )
}
