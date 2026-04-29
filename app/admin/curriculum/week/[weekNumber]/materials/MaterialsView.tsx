'use client'

import Link from 'next/link'
import MarkdownView from '@/components/admin/MarkdownView'

interface MaterialFile {
  fileName: string
  content: string
}

interface MaterialsViewProps {
  weekNumber: number
  weekTitle: string
  weekDates: string
  weekTheme: string
  materials: MaterialFile[]
}

function prettifyName(fileName: string): string {
  return fileName
    .replace(/\.md$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function MaterialsView({
  weekNumber,
  weekTitle,
  weekDates,
  weekTheme,
  materials,
}: MaterialsViewProps) {
  return (
    <div className="max-w-3xl mx-auto pb-20 print:max-w-none">
      {/* Breadcrumb (hidden in print) */}
      <div className="flex items-center gap-2 text-xs text-text-muted mb-4 print:hidden">
        <Link href="/admin/curriculum" className="hover:text-forest transition-colors">Curriculum</Link>
        <span>/</span>
        <Link href={`/admin/curriculum/week/${weekNumber}`} className="hover:text-forest transition-colors">
          Week {weekNumber}
        </Link>
        <span>/</span>
        <span className="text-text font-semibold">Materials</span>
      </div>

      {/* Print button */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div>
          <p className="text-xs uppercase tracking-wider text-forest-light font-semibold">
            Week {weekNumber} · {weekDates}
          </p>
          <h1 className="font-display font-bold text-forest text-2xl mt-1">
            Materials prep — {weekTitle}
          </h1>
          {weekTheme && <p className="text-text-muted text-sm italic mt-1">{weekTheme}</p>}
        </div>
        <button
          onClick={() => window.print()}
          className="h-11 px-4 rounded-xl bg-forest text-white text-sm font-body font-semibold hover:bg-forest-mid"
        >
          🖨 Print
        </button>
      </div>

      {/* Print-only header */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold">Week {weekNumber} Materials — {weekTitle}</h1>
        <p className="text-sm">{weekDates} · {weekTheme}</p>
      </div>

      {materials.length === 0 ? (
        <div className="bg-amber-light/40 border border-amber/30 rounded-2xl p-6 text-text print:bg-white print:border-black/30">
          <p className="font-display font-bold text-base mb-2">No materials uploaded yet.</p>
          <p className="text-sm text-text-muted">
            Drop markdown files into <code className="bg-cream-deep px-1.5 py-0.5 rounded font-mono text-xs">curriculum/week-{weekNumber}/materials/</code>{' '}
            and they'll show up here at next build. Use one file per material list, prep checklist,
            or printable. Filenames become section headings.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {materials.map((m) => (
            <article
              key={m.fileName}
              className="bg-white rounded-2xl border border-border p-5 print:border-black/30 print:break-inside-avoid"
            >
              <h2 className="font-display font-bold text-forest text-xl mb-3">{prettifyName(m.fileName)}</h2>
              <MarkdownView markdown={m.content} />
            </article>
          ))}
        </div>
      )}

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .markdown-view { font-size: 11pt; line-height: 1.45; }
          .markdown-view h4 { font-size: 13pt; margin-top: 12pt; }
          aside, header, nav, footer { display: none !important; }
          @page { margin: 0.5in; }
        }
      `}</style>
    </div>
  )
}
