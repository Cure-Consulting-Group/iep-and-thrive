'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { weekModules } from '@/lib/curriculum-data'

const dayColors: Record<string, string> = {
  Monday: 'bg-forest',
  Tuesday: 'bg-forest-mid',
  Wednesday: 'bg-forest-light',
  Thursday: 'bg-amber',
  Friday: 'bg-forest',
}

export default function WeekDetail() {
  const params = useParams()
  const weekNum = parseInt(params.weekNumber as string, 10)
  const week = weekModules.find((w) => w.week === weekNum)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  if (!week) {
    return (
      <div className="text-center py-20">
        <p className="text-text-muted">Week not found.</p>
        <Link href="/admin/curriculum" className="text-forest font-semibold text-sm mt-2 inline-block hover:underline">
          Back to Curriculum
        </Link>
      </div>
    )
  }

  const activeDay = selectedDay ? week.days.find((d) => d.day === selectedDay) : null

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-text-muted mb-6">
        <Link href="/admin/curriculum" className="hover:text-forest transition-colors">
          Curriculum
        </Link>
        <span>/</span>
        <span className="text-text font-semibold">Week {week.week}</span>
      </div>

      {/* Header */}
      <div className={`${week.color} rounded-2xl p-6 md:p-8 mb-8 text-white`}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{week.icon}</span>
              <div>
                <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">
                  Week {week.week} · {week.dates}
                </p>
                <h1 className="font-display text-2xl font-bold">{week.title}</h1>
              </div>
            </div>
            <p className="text-white/70 text-sm italic mt-1">{week.theme}</p>
          </div>

          {/* Week nav */}
          <div className="flex gap-4">
            {week.week > 1 && (
              <Link
                href={`/admin/curriculum/week/${week.week - 1}`}
                className="text-white/60 hover:text-white text-sm transition-colors"
              >
                &larr; Week {week.week - 1}
              </Link>
            )}
            {week.week < 6 && (
              <Link
                href={`/admin/curriculum/week/${week.week + 1}`}
                className="text-white/60 hover:text-white text-sm transition-colors"
              >
                Week {week.week + 1} &rarr;
              </Link>
            )}
          </div>
        </div>

        {/* Assessment note */}
        {week.assessmentNote && (
          <div className="mt-4 bg-white/10 rounded-xl px-4 py-2.5 text-sm text-white/80">
            <span className="font-semibold">Assessment:</span> {week.assessmentNote}
          </div>
        )}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Skills overview */}
        <div className="lg:col-span-1 space-y-6">
          {/* Phonics */}
          <div className="bg-white rounded-2xl border border-border p-5">
            <h3 className="font-display font-bold text-sm text-text mb-3 flex items-center gap-2">
              <span className="text-base">📖</span> Phonics / OG Skills
            </h3>
            <ul className="space-y-2">
              {week.phonicsSkills.map((skill) => (
                <li key={skill} className="flex items-start gap-2 text-sm text-warm-gray">
                  <svg className="w-4 h-4 text-forest-light shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {skill}
                </li>
              ))}
            </ul>
          </div>

          {/* Math */}
          <div className="bg-white rounded-2xl border border-border p-5">
            <h3 className="font-display font-bold text-sm text-text mb-3 flex items-center gap-2">
              <span className="text-base">🔢</span> Math Skills
            </h3>
            <ul className="space-y-2">
              {week.mathSkills.map((skill) => (
                <li key={skill} className="flex items-start gap-2 text-sm text-warm-gray">
                  <svg className="w-4 h-4 text-forest-light shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {skill}
                </li>
              ))}
            </ul>
          </div>

          {/* Writing */}
          <div className="bg-white rounded-2xl border border-border p-5">
            <h3 className="font-display font-bold text-sm text-text mb-3 flex items-center gap-2">
              <span className="text-base">✏️</span> Writing Focus
            </h3>
            <p className="text-sm text-warm-gray leading-relaxed">{week.writingFocus}</p>
          </div>

          {/* Enrichment */}
          <div className="bg-cream-deep rounded-2xl border border-border p-5">
            <h3 className="font-display font-bold text-sm text-text mb-3 flex items-center gap-2">
              <span className="text-base">🌍</span> Enrichment: {week.enrichmentTheme}
            </h3>
            <ul className="space-y-2.5">
              {week.enrichmentDays.map((d) => (
                <li key={d.day} className="flex items-start gap-2.5 text-sm">
                  <span className="text-base shrink-0">{d.icon}</span>
                  <div>
                    <span className="font-semibold text-text text-xs">{d.day}</span>
                    <p className="text-warm-gray">{d.activity}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Daily plans */}
        <div className="lg:col-span-2">
          <h2 className="font-display text-lg font-bold text-text mb-4">Daily Plans</h2>

          {/* Day tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {week.days.map((day) => (
              <button
                key={day.day}
                onClick={() => setSelectedDay(selectedDay === day.day ? null : day.day)}
                className={`px-4 py-2 rounded-full text-sm font-semibold font-body transition-all duration-200 cursor-pointer ${
                  selectedDay === day.day
                    ? 'bg-forest text-white'
                    : 'bg-white border border-border text-text-muted hover:border-forest hover:text-forest'
                }`}
              >
                {day.day}
              </button>
            ))}
          </div>

          {/* Day detail view */}
          {selectedDay && activeDay ? (
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              <div className={`${dayColors[activeDay.day] || 'bg-forest'} px-6 py-4`}>
                <p className="text-white/60 text-xs font-semibold uppercase tracking-wider">
                  {activeDay.day} · Week {week.week}
                </p>
                <h3 className="font-display text-xl font-bold text-white">{activeDay.title}</h3>
                <p className="text-white/70 text-sm mt-1">{activeDay.theme}</p>
              </div>

              <div className="p-6 space-y-4">
                {/* Morning warm-up */}
                <div className="flex items-center gap-3 bg-sage-pale/50 rounded-xl px-4 py-3">
                  <span className="text-lg">☀️</span>
                  <div>
                    <p className="font-semibold text-xs text-forest">9:00 – 9:20 · Morning Warm-Up</p>
                    <p className="text-sm text-warm-gray">Community check-in, brain games, movement</p>
                  </div>
                </div>

                {/* Instructional blocks */}
                {activeDay.blocks.map((block, i) => {
                  // Skip the last block (enrichment) — rendered separately below
                  if (i === activeDay.blocks.length - 1) return null
                  return (
                    <div key={block.name} className="border-l-4 border-forest pl-4 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-forest-light uppercase tracking-wider">
                          {block.time}
                        </span>
                        <span className="text-xs text-text-muted">·</span>
                        <span className="font-display font-bold text-sm text-text">
                          {block.name} Block
                        </span>
                      </div>
                      <p className="text-sm text-warm-gray leading-relaxed">{block.focus}</p>
                    </div>
                  )
                })}

                {/* Snack break */}
                <div className="flex items-center gap-3 bg-cream-deep/50 rounded-xl px-4 py-2">
                  <span className="text-sm">🍪</span>
                  <p className="font-semibold text-xs text-text-muted">10:20 – 10:30 · Snack & Break</p>
                </div>

                {/* Lunch */}
                <div className="flex items-center gap-3 bg-cream-deep rounded-xl px-4 py-3">
                  <span className="text-lg">🍎</span>
                  <p className="font-semibold text-xs text-text-muted">11:30 – 12:00 · Lunch & Social Time</p>
                </div>

                {/* Enrichment block */}
                {activeDay.blocks.length > 0 && (
                  <div className="bg-sage-pale/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">
                        {week.enrichmentDays.find((e) => e.day === activeDay.day)?.icon || '🌍'}
                      </span>
                      <p className="font-semibold text-xs text-forest">
                        12:00 – 1:00 · Exploration & Enrichment
                      </p>
                    </div>
                    <p className="text-sm text-warm-gray">
                      {activeDay.blocks[activeDay.blocks.length - 1].focus}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* All days overview */
            <div className="space-y-3">
              {week.days.map((day) => (
                <button
                  key={day.day}
                  onClick={() => setSelectedDay(day.day)}
                  className="w-full text-left bg-white rounded-2xl border border-border p-5 hover:shadow-md hover:-translate-y-[1px] transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`inline-block w-2 h-2 rounded-full ${dayColors[day.day] || 'bg-forest'}`} />
                        <p className="font-display font-bold text-sm text-text">{day.day}</p>
                        <span className="text-xs text-text-muted">·</span>
                        <p className="font-body text-sm text-forest-mid font-semibold">{day.title}</p>
                      </div>
                      <p className="text-xs text-warm-gray ml-5">{day.theme}</p>
                    </div>
                    <span className="text-text-muted text-xs shrink-0 ml-4">View &rarr;</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3 ml-5">
                    {day.blocks.map((block) => (
                      <span
                        key={block.name}
                        className="text-[10px] font-semibold uppercase tracking-wider bg-sage-pale text-forest px-2.5 py-1 rounded-full"
                      >
                        {block.name}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
