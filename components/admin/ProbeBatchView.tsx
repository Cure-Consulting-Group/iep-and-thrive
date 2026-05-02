'use client'

import { useCallback, useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { getAllStudents, Student } from "@/lib/student-service"
import { addProbeResult, getProbesByWeek, ProbeResult } from "@/lib/probe-service"

interface Props { weekNumber: number }

interface RowState {
  phonicsScore: string
  phonicsErrors: string
  orfScore: string
  orfErrors: string
  notes: string
}

const EMPTY: RowState = { phonicsScore: "", phonicsErrors: "", orfScore: "", orfErrors: "", notes: "" }

export default function ProbeBatchView({ weekNumber }: Props) {
  const { user } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [rows, setRows] = useState<Record<string, RowState>>({})
  const [savingId, setSavingId] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [stu, probes] = await Promise.all([getAllStudents(), getProbesByWeek(weekNumber)])
      const enrolled = stu.filter((s) => s.enrollmentStatus === "deposited" || s.enrollmentStatus === "enrolled")
      setStudents(enrolled)
      const byStudent: Record<string, RowState> = {}
      for (const s of enrolled) byStudent[s.id] = { ...EMPTY }
      for (const p of probes) {
        const r = byStudent[p.studentId] ?? { ...EMPTY }
        if (p.type === "phonics") {
          r.phonicsScore = String(p.score ?? "")
          r.phonicsErrors = String(p.errorCount ?? "")
        } else {
          r.orfScore = String(p.score ?? "")
          r.orfErrors = String(p.errorCount ?? "")
        }
        if (p.notes) r.notes = p.notes
        byStudent[p.studentId] = r
      }
      setRows(byStudent)
    } finally {
      setLoading(false)
    }
  }, [weekNumber])

  useEffect(() => { refresh() }, [refresh])

  const update = (id: string, patch: Partial<RowState>) => {
    setRows((prev) => ({ ...prev, [id]: { ...(prev[id] ?? EMPTY), ...patch } }))
  }

  const saveOne = async (s: Student) => {
    if (!user) return
    const r = rows[s.id]
    if (!r) return
    setSavingId(s.id)
    try {
      const writes: Promise<ProbeResult>[] = []
      if (r.phonicsScore.trim() !== "") {
        writes.push(addProbeResult({
          week: weekNumber,
          type: "phonics",
          studentId: s.id,
          studentName: s.name,
          parentId: s.parentId,
          score: Number(r.phonicsScore),
          errorCount: r.phonicsErrors.trim() === "" ? undefined : Number(r.phonicsErrors),
          notes: r.notes || undefined,
          capturedBy: user.uid,
        }))
      }
      if (r.orfScore.trim() !== "") {
        writes.push(addProbeResult({
          week: weekNumber,
          type: "orf",
          studentId: s.id,
          studentName: s.name,
          parentId: s.parentId,
          score: Number(r.orfScore),
          errorCount: r.orfErrors.trim() === "" ? undefined : Number(r.orfErrors),
          notes: r.notes || undefined,
          capturedBy: user.uid,
        }))
      }
      await Promise.all(writes)
      setSavedAt((prev) => ({ ...prev, [s.id]: Date.now() }))
    } catch (err) {
      console.error("Failed to save probe:", err)
      alert("Could not save. Check connection and try again.")
    } finally {
      setSavingId(null)
    }
  }

  const saveAll = async () => {
    for (const s of students) await saveOne(s)
  }

  if (loading) {
    return <div className="text-sm text-text-muted py-8">Loading roster...</div>
  }

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-border p-12 text-center">
        <h2 className="font-display text-lg font-semibold text-forest mb-2">No enrolled students</h2>
        <p className="text-text-muted font-body text-sm">Probes can be entered once students are deposited or enrolled.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-forest">Week {weekNumber} probes</h1>
          <p className="text-text-muted font-body text-sm">Enter phonics accuracy % and ORF words-per-minute per student.</p>
        </div>
        <button
          onClick={saveAll}
          disabled={savingId !== null}
          className="px-4 py-2 rounded-full bg-forest text-white text-sm font-body hover:bg-forest-mid transition-colors"
        >
          Save all
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-x-auto">
        <table className="w-full">
          <thead className="bg-sage/10 text-xs uppercase font-body text-text-muted">
            <tr>
              <th className="text-left px-4 py-3">Student</th>
              <th className="text-left px-3 py-3">Phonics %</th>
              <th className="text-left px-3 py-3">Errors</th>
              <th className="text-left px-3 py-3">ORF wpm</th>
              <th className="text-left px-3 py-3">Errors</th>
              <th className="text-left px-3 py-3">Notes</th>
              <th className="text-right px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {students.map((s) => {
              const r = rows[s.id] ?? EMPTY
              const justSaved = savedAt[s.id] && Date.now() - savedAt[s.id] < 3000
              return (
                <tr key={s.id} className="text-sm font-body">
                  <td className="px-4 py-2 font-semibold text-text">{s.name}<div className="text-[10px] uppercase tracking-wider text-text-muted">Grade {s.grade}</div></td>
                  <td className="px-3 py-2">
                    <input type="number" min={0} max={100} step={1}
                      value={r.phonicsScore}
                      onChange={(e) => update(s.id, { phonicsScore: e.target.value })}
                      className="w-20 form-input text-sm" placeholder="%" />
                  </td>
                  <td className="px-3 py-2">
                    <input type="number" min={0} step={1}
                      value={r.phonicsErrors}
                      onChange={(e) => update(s.id, { phonicsErrors: e.target.value })}
                      className="w-20 form-input text-sm" placeholder="#" />
                  </td>
                  <td className="px-3 py-2">
                    <input type="number" min={0} step={1}
                      value={r.orfScore}
                      onChange={(e) => update(s.id, { orfScore: e.target.value })}
                      className="w-20 form-input text-sm" placeholder="wpm" />
                  </td>
                  <td className="px-3 py-2">
                    <input type="number" min={0} step={1}
                      value={r.orfErrors}
                      onChange={(e) => update(s.id, { orfErrors: e.target.value })}
                      className="w-20 form-input text-sm" placeholder="#" />
                  </td>
                  <td className="px-3 py-2">
                    <input type="text"
                      value={r.notes}
                      onChange={(e) => update(s.id, { notes: e.target.value })}
                      className="w-full form-input text-sm" placeholder="optional" />
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => saveOne(s)}
                      disabled={savingId === s.id}
                      className="px-3 py-1.5 rounded-full text-xs font-body bg-white border border-forest text-forest hover:bg-sage/10 transition-colors"
                    >
                      {savingId === s.id ? "Saving..." : justSaved ? "Saved" : "Save"}
                    </button>
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
