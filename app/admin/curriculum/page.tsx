'use client'

import Link from 'next/link'
import { weekModules, curriculumResources } from '@/lib/curriculum-data'

const categoryLabels: Record<string, string> = {
  reference: 'Reference',
  assessment: 'Assessments',
  portfolio: 'Portfolio',
  communication: 'Parent Communication',
}

const categoryOrder = ['reference', 'assessment', 'portfolio', 'communication']

export default function CurriculumPage() {
  const grouped = categoryOrder.map((cat) => ({
    label: categoryLabels[cat],
    items: curriculumResources.filter((r) => r.category === cat),
  }))

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-text">Curriculum</h1>
        <p className="text-warm-gray text-sm mt-1">
          6-week summer intensive — Orton-Gillingham structured literacy + CRA math
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { value: '6', label: 'Weeks', icon: '📅' },
          { value: '30', label: 'Daily Plans', icon: '📝' },
          { value: '5', label: 'OG Units', icon: '📖' },
          { value: '5', label: 'Math Units', icon: '🔢' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{stat.icon}</span>
              <span className="font-display text-xl font-bold text-forest">{stat.value}</span>
            </div>
            <p className="text-xs text-text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Week Modules */}
      <h2 className="font-display text-lg font-bold text-text mb-4">Weekly Modules</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {weekModules.map((week) => (
          <Link
            key={week.week}
            href={`/admin/curriculum/week/${week.week}`}
            className="group bg-white rounded-2xl border border-border overflow-hidden hover:shadow-[0_8px_32px_rgba(27,67,50,0.10)] hover:-translate-y-[2px] transition-all duration-200"
          >
            {/* Color bar */}
            <div className={`${week.color} px-5 py-3 flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <span className="text-xl">{week.icon}</span>
                <span className="text-white font-display font-bold text-sm">
                  Week {week.week}
                </span>
              </div>
              <span className="text-white/70 text-xs font-body">{week.dates}</span>
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="font-display font-bold text-text text-[1rem] mb-1">
                {week.title}
              </h3>
              <p className="text-xs text-text-muted mb-3 italic">{week.theme}</p>

              {/* Skills preview */}
              <div className="space-y-2 mb-3">
                <div className="flex items-start gap-2">
                  <span className="text-xs text-forest-light font-semibold shrink-0 w-14">Phonics</span>
                  <p className="text-xs text-warm-gray leading-relaxed">
                    {week.phonicsSkills.slice(0, 2).join(', ')}
                    {week.phonicsSkills.length > 2 && ` +${week.phonicsSkills.length - 2} more`}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs text-forest-light font-semibold shrink-0 w-14">Math</span>
                  <p className="text-xs text-warm-gray leading-relaxed">
                    {week.mathSkills.slice(0, 2).join(', ')}
                    {week.mathSkills.length > 2 && ` +${week.mathSkills.length - 2} more`}
                  </p>
                </div>
              </div>

              {/* Enrichment days */}
              <div className="flex gap-1">
                {week.enrichmentDays.map((d) => (
                  <span
                    key={d.day}
                    className="text-sm"
                    title={`${d.day}: ${d.activity}`}
                  >
                    {d.icon}
                  </span>
                ))}
              </div>

              {/* Assessment note */}
              {week.assessmentNote && (
                <p className="mt-3 text-[10px] text-amber font-semibold uppercase tracking-wider">
                  {week.assessmentNote.split(':')[0]}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Resources & Tools */}
      <h2 className="font-display text-lg font-bold text-text mb-4">Resources & Tools</h2>
      <div className="space-y-6">
        {grouped.map((group) => (
          <div key={group.label}>
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              {group.label}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {group.items.map((resource) => (
                <Link
                  key={resource.href}
                  href={resource.href}
                  className="flex items-start gap-3 bg-white rounded-xl border border-border p-4 hover:shadow-md hover:-translate-y-[1px] transition-all duration-200"
                >
                  <span className="text-xl shrink-0">{resource.icon}</span>
                  <div>
                    <p className="font-body font-semibold text-sm text-text">
                      {resource.title}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                      {resource.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
