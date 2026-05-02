'use client'

import Link from "next/link"
import AssessmentBatteryView from "@/components/admin/AssessmentBatteryView"

export default function AssessmentStudentClient({ studentId }: { studentId: string }) {
  if (!studentId) {
    return <div className="text-text-muted text-sm py-8">Missing student id.</div>
  }
  return (
    <div>
      <div className="mb-4">
        <Link href="/admin/assessments" className="text-sm font-body text-forest underline">
          &larr; All assessments
        </Link>
      </div>
      <AssessmentBatteryView studentId={studentId} />
    </div>
  )
}
