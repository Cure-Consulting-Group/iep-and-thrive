import Link from "next/link"
import { CATEGORY_LABELS, CATEGORY_ORDER, summarizeWeek } from "@/lib/materials-parser"

export const dynamic = "force-static"

export default function MaterialsIndexPage() {
  const weeks = [1, 2, 3, 4, 5, 6].map((w) => summarizeWeek(w))

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-forest">Materials Prep</h1>
        <p className="text-text-muted font-body text-sm mt-1">
          Per-week checklists generated from the curriculum markdown. Items persist across logins.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {weeks.map((w) => (
          <Link
            key={w.weekNumber}
            href={`/admin/materials/${w.weekNumber}`}
            className="block bg-white rounded-2xl border border-border p-5 hover:border-forest transition-colors"
          >
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-lg font-semibold text-forest">Week {w.weekNumber}</h2>
              <span className="text-xs font-body text-text-muted">{w.itemCount} items</span>
            </div>
            <div className="mt-3 space-y-1">
              {CATEGORY_ORDER.map((c) => (
                <div key={c} className="flex items-center justify-between text-xs font-body">
                  <span className="text-text-muted">{CATEGORY_LABELS[c]}</span>
                  <span className="text-text">{w.byCategory[c]}</span>
                </div>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
