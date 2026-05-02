'use client'

import { useEffect, useState } from "react"
import { ProbeResult, ProbeType, getProbesByStudent } from "@/lib/probe-service"

interface Props {
  studentId: string
}

const WEEKS = [1, 2, 3, 4, 5, 6]

function buildSeries(probes: ProbeResult[], type: ProbeType): (number | null)[] {
  const map: Record<number, number> = {}
  for (const p of probes) if (p.type === type) map[p.week] = p.score
  return WEEKS.map((w) => (w in map ? map[w] : null))
}

function Sparkline({ values, max }: { values: (number | null)[]; max: number }) {
  const W = 240, H = 60, PAD = 6
  const stepX = (W - PAD * 2) / (values.length - 1)
  const points: { x: number; y: number; v: number }[] = []
  values.forEach((v, i) => {
    if (v === null) return
    const x = PAD + i * stepX
    const y = H - PAD - ((v / max) * (H - PAD * 2))
    points.push({ x, y, v })
  })
  if (points.length === 0) {
    return <div className="text-xs text-text-muted italic">No data</div>
  }
  const path = points.map((p, i) => (i === 0 ? "M" : "L") + p.x.toFixed(1) + "," + p.y.toFixed(1)).join(" ")
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-xs h-12">
      <path d={path} fill="none" stroke="#1B4332" strokeWidth={2} />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="#1B4332" />
      ))}
    </svg>
  )
}

export default function ProbeTrendList({ studentId }: Props) {
  const [probes, setProbes] = useState<ProbeResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getProbesByStudent(studentId)
      .then((p) => { if (!cancelled) setProbes(p) })
      .catch((e) => console.error("trend fetch failed", e))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [studentId])

  if (loading) return <div className="text-sm text-text-muted py-2">Loading trend...</div>

  const phonics = buildSeries(probes, "phonics")
  const orf = buildSeries(probes, "orf")
  const orfMax = Math.max(120, ...orf.filter((v): v is number => v !== null))

  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-baseline justify-between">
          <h4 className="font-body text-xs font-semibold text-text-muted uppercase">Phonics %</h4>
          <span className="text-xs font-body text-text-muted">scale 0-100</span>
        </div>
        <Sparkline values={phonics} max={100} />
        <div className="grid grid-cols-6 gap-1 mt-1 text-[10px] font-body text-text-muted text-center">
          {phonics.map((v, i) => (
            <span key={i}>W{i + 1}<br/><span className="text-text">{v ?? "-"}</span></span>
          ))}
        </div>
      </div>
      <div>
        <div className="flex items-baseline justify-between">
          <h4 className="font-body text-xs font-semibold text-text-muted uppercase">ORF wpm</h4>
          <span className="text-xs font-body text-text-muted">scale 0-{orfMax}</span>
        </div>
        <Sparkline values={orf} max={orfMax} />
        <div className="grid grid-cols-6 gap-1 mt-1 text-[10px] font-body text-text-muted text-center">
          {orf.map((v, i) => (
            <span key={i}>W{i + 1}<br/><span className="text-text">{v ?? "-"}</span></span>
          ))}
        </div>
      </div>
    </div>
  )
}
