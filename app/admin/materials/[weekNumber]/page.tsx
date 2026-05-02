import { notFound } from "next/navigation"
import Link from "next/link"
import MaterialsChecklistView from "@/components/admin/MaterialsChecklistView"
import { parseWeekMaterials } from "@/lib/materials-parser"

export function generateStaticParams() {
  return [1, 2, 3, 4, 5, 6].map((w) => ({ weekNumber: String(w) }))
}

export default function MaterialsWeekPage({ params }: { params: { weekNumber: string } }) {
  const weekNumber = Number(params.weekNumber)
  if (!Number.isInteger(weekNumber) || weekNumber < 1 || weekNumber > 6) {
    notFound()
  }

  const manifest = parseWeekMaterials(weekNumber)

  return (
    <div>
      <div className="mb-4 print:hidden">
        <Link href="/admin/materials" className="text-sm font-body text-forest underline">
          &larr; All weeks
        </Link>
      </div>
      <MaterialsChecklistView weekNumber={weekNumber} initialManifest={manifest} />
    </div>
  )
}
