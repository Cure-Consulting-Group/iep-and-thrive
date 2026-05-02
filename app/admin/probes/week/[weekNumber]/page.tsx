import { notFound } from "next/navigation"
import Link from "next/link"
import ProbeBatchView from "@/components/admin/ProbeBatchView"

export default function ProbeWeekPage({ params }: { params: { weekNumber: string } }) {
  const weekNumber = Number(params.weekNumber)
  if (!Number.isInteger(weekNumber) || weekNumber < 1 || weekNumber > 6) {
    notFound()
  }
  return (
    <div>
      <div className="mb-4">
        <Link href="/admin/probes" className="text-sm font-body text-forest underline">
          &larr; All weeks
        </Link>
      </div>
      <ProbeBatchView weekNumber={weekNumber} />
    </div>
  )
}
