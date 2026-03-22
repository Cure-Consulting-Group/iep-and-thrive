'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

interface GoalRow {
  id: string
  goalText: string
  programBlocks: string
  methods: string
}

function createGoalRow(): GoalRow {
  return {
    id: crypto.randomUUID(),
    goalText: '',
    programBlocks: '',
    methods: '',
  }
}

const PROGRAM_TRACKS = [
  { value: 'reading', label: 'Reading & Language Intensive' },
  { value: 'full', label: 'Full Academic Intensive' },
  { value: 'math', label: 'Math & Numeracy Intensive' },
]

function trackLabel(value: string): string {
  return PROGRAM_TRACKS.find((t) => t.value === value)?.label ?? value
}

export default function AlignmentTemplatePage() {
  const searchParams = useSearchParams()

  const [studentName, setStudentName] = useState('')
  const [programTrack, setProgramTrack] = useState('full')
  const [cohort, setCohort] = useState('')
  const [startDate, setStartDate] = useState('July 7, 2026')
  const [goals, setGoals] = useState<GoalRow[]>([createGoalRow()])
  const [additionalFocus, setAdditionalFocus] = useState('')
  const [instructorNotes, setInstructorNotes] = useState('')

  // Pre-fill from query params
  useEffect(() => {
    const student = searchParams.get('student')
    const track = searchParams.get('track')
    if (student) setStudentName(student)
    if (track && PROGRAM_TRACKS.some((t) => t.value === track)) setProgramTrack(track)
  }, [searchParams])

  const addGoal = () => {
    if (goals.length >= 6) return
    setGoals([...goals, createGoalRow()])
  }

  const removeGoal = (id: string) => {
    if (goals.length <= 1) return
    setGoals(goals.filter((g) => g.id !== id))
  }

  const updateGoal = (id: string, field: keyof GoalRow, value: string) => {
    setGoals(goals.map((g) => (g.id === id ? { ...g, [field]: value } : g)))
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-cream">
        {/* Screen-only toolbar */}
        <div className="print:hidden sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-border">
          <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
            <Link
              href="/admin/reports"
              className="font-body text-sm text-forest hover:text-forest-mid transition-colors flex items-center gap-1.5"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to Reports
            </Link>
            <button
              onClick={() => window.print()}
              className="bg-forest text-white font-body text-sm font-semibold px-5 py-2 rounded-full hover:bg-forest-mid transition-colors"
            >
              Print Summary
            </button>
          </div>
        </div>

        {/* Print header */}
        <div className="hidden print:block bg-forest text-white px-8 py-4">
          <div className="flex items-center justify-between">
            <span className="font-display text-lg font-bold">
              IEP &amp; Thrive &middot; Program Alignment Summary
            </span>
            <span className="font-body text-xs opacity-70">Summer 2026</span>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-4xl mx-auto px-6 py-8 print:px-8 print:py-6 print:max-w-none">
          {/* Screen title */}
          <div className="print:hidden mb-6">
            <h1 className="font-display text-2xl font-bold text-forest">Program Alignment Summary</h1>
            <p className="font-body text-sm text-text-muted mt-1">
              Map a student&apos;s IEP goals to their summer program blocks. Fill in all fields and print or save as PDF.
            </p>
          </div>

          <div className="bg-white rounded-[20px] border border-border p-8 print:border-none print:shadow-none print:p-0 print:rounded-none">
            {/* Student Info */}
            <section className="mb-8 print:mb-6">
              <h2 className="font-display text-lg font-bold text-forest mb-4 print:text-base">
                Student Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:grid-cols-4 print:gap-3">
                <div>
                  <label className="block font-body text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                    Student Name
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Full name"
                    className="w-full font-body text-sm border border-border rounded-xl px-3 py-2.5 text-text focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest print:border-none print:p-0 print:font-semibold print:text-base"
                  />
                </div>
                <div>
                  <label className="block font-body text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                    Program Track
                  </label>
                  <select
                    value={programTrack}
                    onChange={(e) => setProgramTrack(e.target.value)}
                    className="w-full font-body text-sm border border-border rounded-xl px-3 py-2.5 text-text bg-white focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest print:border-none print:p-0 print:font-semibold print:text-base print:appearance-none"
                  >
                    {PROGRAM_TRACKS.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-body text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                    Cohort
                  </label>
                  <input
                    type="text"
                    value={cohort}
                    onChange={(e) => setCohort(e.target.value)}
                    placeholder="e.g., Cohort A"
                    className="w-full font-body text-sm border border-border rounded-xl px-3 py-2.5 text-text focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest print:border-none print:p-0 print:font-semibold print:text-base"
                  />
                </div>
                <div>
                  <label className="block font-body text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                    Start Date
                  </label>
                  <input
                    type="text"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="July 7, 2026"
                    className="w-full font-body text-sm border border-border rounded-xl px-3 py-2.5 text-text focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest print:border-none print:p-0 print:font-semibold print:text-base"
                  />
                </div>
              </div>
            </section>

            {/* Divider */}
            <hr className="border-border mb-8 print:mb-6" />

            {/* IEP Goal Mapping */}
            <section className="mb-8 print:mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-bold text-forest print:text-base">
                  IEP Goal Mapping
                </h2>
                {goals.length < 6 && (
                  <button
                    onClick={addGoal}
                    className="print:hidden font-body text-sm font-semibold text-forest hover:text-forest-mid transition-colors flex items-center gap-1"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    Add Goal
                  </button>
                )}
              </div>

              {/* Table header — visible on print and larger screens */}
              <div className="hidden sm:grid grid-cols-[48px_1fr_1fr_1fr] gap-3 mb-2 px-1">
                <span className="font-body text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                  Goal #
                </span>
                <span className="font-body text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                  IEP Goal Text
                </span>
                <span className="font-body text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                  Program Block(s) Addressed
                </span>
                <span className="font-body text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                  Methods / Frameworks
                </span>
              </div>

              {/* Goal rows */}
              <div className="space-y-3 print:space-y-0">
                {goals.map((goal, index) => (
                  <div
                    key={goal.id}
                    className={`sm:grid sm:grid-cols-[48px_1fr_1fr_1fr] gap-3 p-3 rounded-xl border border-border print:border-0 print:border-b print:border-border print:rounded-none print:px-1 print:py-2 ${
                      index % 2 === 0 ? 'print:bg-sage-pale' : 'print:bg-white'
                    }`}
                  >
                    {/* Goal number */}
                    <div className="flex items-start justify-between sm:justify-start mb-2 sm:mb-0">
                      <span className="font-display text-lg font-bold text-forest-light print:text-sm">
                        {index + 1}
                      </span>
                      {goals.length > 1 && (
                        <button
                          onClick={() => removeGoal(goal.id)}
                          className="print:hidden sm:hidden text-red-400 hover:text-red-600 text-xs font-body"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    {/* Goal text */}
                    <div className="mb-2 sm:mb-0">
                      <label className="sm:hidden font-body text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1 block">
                        IEP Goal Text
                      </label>
                      <textarea
                        value={goal.goalText}
                        onChange={(e) => updateGoal(goal.id, 'goalText', e.target.value)}
                        rows={3}
                        placeholder="Paste the IEP goal text here..."
                        className="w-full font-body text-sm border border-border rounded-lg px-3 py-2 text-text resize-y focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest print:border-none print:p-0 print:resize-none print:text-xs print:leading-snug"
                      />
                    </div>

                    {/* Program blocks */}
                    <div className="mb-2 sm:mb-0">
                      <label className="sm:hidden font-body text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1 block">
                        Program Block(s)
                      </label>
                      <textarea
                        value={goal.programBlocks}
                        onChange={(e) => updateGoal(goal.id, 'programBlocks', e.target.value)}
                        rows={3}
                        placeholder="e.g., Structured Literacy Block 1 & 2"
                        className="w-full font-body text-sm border border-border rounded-lg px-3 py-2 text-text resize-y focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest print:border-none print:p-0 print:resize-none print:text-xs print:leading-snug"
                      />
                    </div>

                    {/* Methods */}
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <label className="sm:hidden font-body text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1 block">
                          Methods / Frameworks
                        </label>
                        <textarea
                          value={goal.methods}
                          onChange={(e) => updateGoal(goal.id, 'methods', e.target.value)}
                          rows={3}
                          placeholder="e.g., Orton-Gillingham phonics sequence"
                          className="w-full font-body text-sm border border-border rounded-lg px-3 py-2 text-text resize-y focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest print:border-none print:p-0 print:resize-none print:text-xs print:leading-snug"
                        />
                      </div>
                      {goals.length > 1 && (
                        <button
                          onClick={() => removeGoal(goal.id)}
                          className="print:hidden hidden sm:block mt-2 text-red-400 hover:text-red-600 transition-colors"
                          title="Remove goal"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {goals.length < 6 && (
                <button
                  onClick={addGoal}
                  className="print:hidden mt-3 w-full py-2.5 border-2 border-dashed border-border rounded-xl font-body text-sm text-text-muted hover:border-forest/30 hover:text-forest transition-colors"
                >
                  + Add another goal (up to 6)
                </button>
              )}
            </section>

            {/* Divider */}
            <hr className="border-border mb-8 print:mb-6" />

            {/* Additional Focus Areas */}
            <section className="mb-8 print:mb-6">
              <h2 className="font-display text-lg font-bold text-forest mb-2 print:text-base">
                Additional Focus Areas
              </h2>
              <p className="font-body text-xs text-text-muted mb-3 print:hidden">
                Areas not in the formal IEP goals but that will be addressed during the program.
              </p>
              <textarea
                value={additionalFocus}
                onChange={(e) => setAdditionalFocus(e.target.value)}
                rows={3}
                placeholder="e.g., Self-regulation strategies, peer interaction support, test-taking confidence..."
                className="w-full font-body text-sm border border-border rounded-xl px-4 py-3 text-text resize-y focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest print:border-none print:p-0 print:resize-none print:text-xs"
              />
            </section>

            {/* Instructor Notes */}
            <section>
              <h2 className="font-display text-lg font-bold text-forest mb-2 print:text-base">
                Instructor Notes
              </h2>
              <p className="font-body text-xs text-text-muted mb-3 print:hidden">
                Internal notes about the student, accommodations, or session planning considerations.
              </p>
              <textarea
                value={instructorNotes}
                onChange={(e) => setInstructorNotes(e.target.value)}
                rows={3}
                placeholder="Any relevant notes for the instructional team..."
                className="w-full font-body text-sm border border-border rounded-xl px-4 py-3 text-text resize-y focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest print:border-none print:p-0 print:resize-none print:text-xs"
              />
            </section>
          </div>

          {/* Print footer */}
          <div className="hidden print:block mt-8 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="font-body text-[10px] text-text-muted">
                IEP &amp; Thrive &middot; Summer 2026 &middot; Confidential
              </span>
              <span className="font-body text-[10px] text-text-muted">
                {studentName ? `Prepared for ${studentName}` : 'Program Alignment Summary'} &middot; {trackLabel(programTrack)}
              </span>
            </div>
          </div>
        </div>

        {/* Print-specific styles */}
        <style jsx global>{`
          @media print {
            @page {
              size: auto;
              margin: 0.5in;
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .print\\:bg-sage-pale {
              background-color: #D8F3DC !important;
            }
          }
        `}</style>
      </div>
    </ProtectedRoute>
  )
}
