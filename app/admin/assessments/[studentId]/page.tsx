'use client'

import { useParams } from "next/navigation"
import Link from "next/link"
import AssessmentBatteryView from "@/components/admin/AssessmentBatteryView"

export default function AssessmentStudentPage() {
  const params = useParams()
  const studentId = (params?.studentId as string) || ""
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
