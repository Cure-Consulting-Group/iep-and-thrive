'use client'

import { useCallback, useEffect, useMemo, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { getAllStudents, Student } from "@/lib/student-service"
import {
  AssessmentResult,
  AssessmentType,
  SubtestResult,
  getAssessment,
  upsertAssessment,
} from "@/lib/assessment-service"
import { ASSESSMENT_PRESETS, getPreset } from "@/lib/assessment-presets"

interface Props { studentId: string }

interface FormState {
  instrument: string
  presetKey: string
  subtests: SubtestResult[]
  notes: string
}

const EMPTY_FORM: FormState = {
  instrument: "",
  presetKey: "custom",
  subtests: [{ name: "Subtest 1" }],
  notes: "",
}

function fromAssessment(a: AssessmentResult | null): FormState {
  if (!a) return { ...EMPTY_FORM, subtests: EMPTY_FORM.subtests.map((s) => ({ ...s })) }
  return {
    instrument: a.instrument,
    presetKey: "custom",
    subtests: a.subtests.map((s) => ({ ...s })),
    notes: a.notes ?? "",
  }
}

function delta(a?: number, b?: number): string {
  if (a === undefined || b === undefined) return "-"
  const d = b - a
  const sign = d > 0 ? "+" : ""
  return sign + d.toString()
}

export default function AssessmentBatteryView({ studentId }: Props) {
  const { user } = useAuth()
  const [student, setStudent] = useState<Student | null>(null)
  const [pre, setPre] = useState<AssessmentResult | null>(null)
  const [post, setPost] = useState<AssessmentResult | null>(null)
  const [preForm, setPreForm] = useState<FormState>(EMPTY_FORM)
  const [postForm, setPostForm] = useState<FormState>(EMPTY_FORM)
  const [loading, setLoading] = useState(true)
  const [savingType, setSavingType] = useState<AssessmentType | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [allStu, preDoc, postDoc] = await Promise.all([
        getAllStudents(),
        getAssessment("pre", studentId),
        getAssessment("post", studentId),
      ])
      const s = allStu.find((x) => x.id === studentId) ?? null
      setStudent(s)
      setPre(preDoc); setPost(postDoc)
      setPreForm(fromAssessment(preDoc)); setPostForm(fromAssessment(postDoc))
    } finally {
      setLoading(false)
    }
  }, [studentId])

  useEffect(() => { refresh() }, [refresh])

  const applyPreset = (which: AssessmentType, key: string) => {
    const preset = getPreset(key)
    const subtests = preset && preset.key !== "custom"
      ? preset.subtests.map((name) => ({ name }))
      : [{ name: "Subtest 1" }]
    const update = (prev: FormState): FormState => ({
      ...prev,
      presetKey: key,
      instrument: preset && preset.key !== "custom" ? preset.label.split(" ")[0] : prev.instrument,
      subtests,
    })
    if (which === "pre") setPreForm(update); else setPostForm(update)
  }

  const setForm = (which: AssessmentType, patch: Partial<FormState>) => {
    if (which === "pre") setPreForm((p) => ({ ...p, ...patch }))
    else setPostForm((p) => ({ ...p, ...patch }))
  }

  const updateSubtest = (which: AssessmentType, idx: number, patch: Partial<SubtestResult>) => {
    const upd = (form: FormState): FormState => ({
      ...form,
      subtests: form.subtests.map((s, i) => (i === idx ? { ...s, ...patch } : s)),
    })
    if (which === "pre") setPreForm(upd); else setPostForm(upd)
  }

  const addSubtest = (which: AssessmentType) => {
    const upd = (form: FormState): FormState => ({
      ...form,
      subtests: [...form.subtests, { name: `Subtest ${form.subtests.length + 1}` }],
    })
    if (which === "pre") setPreForm(upd); else setPostForm(upd)
  }

  const removeSubtest = (which: AssessmentType, idx: number) => {
    const upd = (form: FormState): FormState => ({
      ...form,
      subtests: form.subtests.filter((_, i) => i !== idx),
    })
    if (which === "pre") setPreForm(upd); else setPostForm(upd)
  }

  const save = async (which: AssessmentType) => {
    if (!user || !student) return
    const form = which === "pre" ? preForm : postForm
    setSavingType(which)
    try {
      const res = await upsertAssessment({
        type: which,
        studentId: student.id,
        studentName: student.name,
        parentId: student.parentId,
        instrument: form.instrument || "Custom",
        subtests: form.subtests.filter((s) => s.name && s.name.trim() !== ""),
        administeredBy: user.uid,
        notes: form.notes,
      })
      if (which === "pre") setPre(res); else setPost(res)
    } catch (err) {
      console.error("save failed", err)
      alert("Could not save. Try again.")
    } finally {
      setSavingType(null)
    }
  }

  const comparisonRows = useMemo(() => {
    if (!pre && !post) return []
    const names = new Set<string>()
    pre?.subtests.forEach((s) => names.add(s.name))
    post?.subtests.forEach((s) => names.add(s.name))
    return Array.from(names).map((name) => {
      const a = pre?.subtests.find((s) => s.name === name)
      const b = post?.subtests.find((s) => s.name === name)
      return { name, pre: a, post: b }
    })
  }, [pre, post])

  if (loading) return <div className="text-sm text-text-muted py-8">Loading...</div>
  if (!student) return <div className="text-sm text-text-muted py-8">Student not found.</div>

  const renderForm = (which: AssessmentType, form: FormState) => (
    <section className="bg-white rounded-2xl border border-border p-5">
      <header className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-semibold text-forest">
          {which === "pre" ? "Pre-program" : "Post-program"}
        </h2>
        <button
          onClick={() => save(which)}
          disabled={savingType === which}
          className="px-3 py-1.5 rounded-full text-sm font-body bg-forest text-white hover:bg-forest-mid transition-colors"
        >
          {savingType === which ? "Saving..." : "Save"}
        </button>
      </header>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs font-body font-semibold text-text-muted uppercase mb-1">Preset</label>
          <select
            value={form.presetKey}
            onChange={(e) => applyPreset(which, e.target.value)}
            className="form-input w-full text-sm"
          >
            {ASSESSMENT_PRESETS.map((p) => (
              <option key={p.key} value={p.key}>{p.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-body font-semibold text-text-muted uppercase mb-1">Instrument</label>
          <input
            type="text"
            value={form.instrument}
            onChange={(e) => setForm(which, { instrument: e.target.value })}
            className="form-input w-full text-sm"
            placeholder="e.g. WIST"
          />
        </div>
      </div>

      <table className="w-full text-sm font-body">
        <thead className="text-xs uppercase font-body text-text-muted">
          <tr>
            <th className="text-left py-2">Subtest</th>
            <th className="text-left py-2 px-2">Raw</th>
            <th className="text-left py-2 px-2">Std</th>
            <th className="text-left py-2 px-2">%ile</th>
            <th></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {form.subtests.map((s, i) => (
            <tr key={i}>
              <td className="py-2 pr-2">
                <input
                  type="text"
                  value={s.name}
                  onChange={(e) => updateSubtest(which, i, { name: e.target.value })}
                  className="form-input w-full text-sm"
                />
              </td>
              <td className="py-2 px-2">
                <input
                  type="number"
                  value={s.rawScore ?? ""}
                  onChange={(e) => updateSubtest(which, i, { rawScore: e.target.value === "" ? undefined : Number(e.target.value) })}
                  className="form-input w-20 text-sm"
                />
              </td>
              <td className="py-2 px-2">
                <input
                  type="number"
                  value={s.standardScore ?? ""}
                  onChange={(e) => updateSubtest(which, i, { standardScore: e.target.value === "" ? undefined : Number(e.target.value) })}
                  className="form-input w-20 text-sm"
                />
              </td>
              <td className="py-2 px-2">
                <input
                  type="number"
                  value={s.percentile ?? ""}
                  onChange={(e) => updateSubtest(which, i, { percentile: e.target.value === "" ? undefined : Number(e.target.value) })}
                  className="form-input w-20 text-sm"
                />
              </td>
              <td className="py-2 pl-2 text-right">
                <button
                  onClick={() => removeSubtest(which, i)}
                  className="text-text-muted hover:text-red-600"
                  aria-label="Remove subtest"
                >
                  &times;
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={() => addSubtest(which)}
        className="mt-3 text-sm font-body text-forest underline"
      >
        + Add subtest
      </button>

      <div className="mt-4">
        <label className="block text-xs font-body font-semibold text-text-muted uppercase mb-1">Notes (instructor private)</label>
        <textarea
          rows={2}
          value={form.notes}
          onChange={(e) => setForm(which, { notes: e.target.value })}
          className="form-input w-full text-sm"
        />
      </div>
    </section>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-forest">{student.name}</h1>
        <p className="text-sm font-body text-text-muted">Grade {student.grade} - {student.parentName}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {renderForm("pre", preForm)}
        {renderForm("post", postForm)}
      </div>

      <section className="bg-cream-deep rounded-2xl border border-border p-5">
        <h2 className="font-display text-lg font-semibold text-forest mb-4">Comparison</h2>
        {comparisonRows.length === 0 ? (
          <p className="text-sm text-text-muted">No subtests entered yet.</p>
        ) : (
          <table className="w-full text-sm font-body">
            <thead className="text-xs uppercase font-body text-text-muted">
              <tr>
                <th className="text-left py-2">Subtest</th>
                <th className="text-left py-2 px-2">Pre raw</th>
                <th className="text-left py-2 px-2">Post raw</th>
                <th className="text-left py-2 px-2">delta raw</th>
                <th className="text-left py-2 px-2">Pre std</th>
                <th className="text-left py-2 px-2">Post std</th>
                <th className="text-left py-2 px-2">delta std</th>
                <th className="text-left py-2 px-2">Pre %ile</th>
                <th className="text-left py-2 px-2">Post %ile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {comparisonRows.map((r) => (
                <tr key={r.name}>
                  <td className="py-2 pr-2 font-semibold">{r.name}</td>
                  <td className="py-2 px-2">{r.pre?.rawScore ?? "-"}</td>
                  <td className="py-2 px-2">{r.post?.rawScore ?? "-"}</td>
                  <td className="py-2 px-2">{delta(r.pre?.rawScore, r.post?.rawScore)}</td>
                  <td className="py-2 px-2">{r.pre?.standardScore ?? "-"}</td>
                  <td className="py-2 px-2">{r.post?.standardScore ?? "-"}</td>
                  <td className="py-2 px-2">{delta(r.pre?.standardScore, r.post?.standardScore)}</td>
                  <td className="py-2 px-2">{r.pre?.percentile ?? "-"}</td>
                  <td className="py-2 px-2">{r.post?.percentile ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
