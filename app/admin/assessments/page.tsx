'use client'

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { getAllStudents, Student } from "@/lib/student-service"
import { getAssessmentsByType, AssessmentResult } from "@/lib/assessment-service"

export default function AssessmentsIndexPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [byKey, setByKey] = useState<Record<string, AssessmentResult>>({})
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [stu, pre, post] = await Promise.all([
        getAllStudents(),
        getAssessmentsByType("pre"),
        getAssessmentsByType("post"),
      ])
      const enrolled = stu.filter((s) => s.enrollmentStatus === "deposited" || s.enrollmentStatus === "enrolled")
      setStudents(enrolled)
      const m: Record<string, AssessmentResult> = {}
      for (const a of [...pre, ...post]) m[a.type + "_" + a.studentId] = a
      setByKey(m)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="text-sm text-text-muted py-8">Loading roster...</div>

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-forest">Pre/Post Assessments</h1>
        <p className="text-text-muted font-body text-sm mt-1">
          Digital capture for the pre-program and post-program assessment battery. Click a student to enter scores.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-sage/10 text-xs uppercase font-body text-text-muted">
            <tr>
              <th className="text-left px-4 py-3">Student</th>
              <th className="text-left px-3 py-3">Pre</th>
              <th className="text-left px-3 py-3">Post</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {students.map((s) => {
              const pre = byKey["pre_" + s.id]
              const post = byKey["post_" + s.id]
              return (
                <tr key={s.id} className="text-sm font-body">
                  <td className="px-4 py-3 font-semibold text-text">{s.name}<div className="text-[10px] uppercase tracking-wider text-text-muted">Grade {s.grade}</div></td>
                  <td className="px-3 py-3">
                    {pre ? (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-sage-pale text-forest">Entered ({pre.subtests.length})</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-text-muted">Not entered</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    {post ? (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-sage-pale text-forest">Entered ({post.subtests.length})</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-text-muted">Not entered</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/assessments/${s.id}`} className="text-sm font-body text-forest underline">
                      Open
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
