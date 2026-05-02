import Link from "next/link"

const WEEKS = [1, 2, 3, 4, 5, 6]

export default function ProbesIndexPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-forest">OG Probes</h1>
        <p className="text-text-muted font-body text-sm mt-1">
          Weekly Orton-Gillingham probes: phonics accuracy % and ORF words-per-minute. Choose a week to enter scores for the cohort.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {WEEKS.map((w) => (
          <Link
            key={w}
            href={`/admin/probes/week/${w}`}
            className="block bg-white rounded-2xl border border-border p-6 hover:border-forest transition-colors text-center"
          >
            <div className="font-display text-3xl font-bold text-forest">W{w}</div>
            <div className="text-xs font-body text-text-muted uppercase tracking-wider mt-1">Week {w}</div>
            <div className="text-sm font-body text-text mt-3">Phonics + ORF</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
