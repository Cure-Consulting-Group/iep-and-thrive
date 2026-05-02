'use client'

import { useCallback, useEffect, useMemo, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  MaterialsCategory,
  MaterialsManifest,
} from "@/lib/materials-parser"
import {
  MaterialsChecklistDoc,
  getMaterialsChecklist,
  mergeManifest,
  saveMaterialsChecklist,
  toggleMaterialsItem,
  setCategoryDone,
} from "@/lib/admin-tasks-service"

interface Props {
  weekNumber: number
  initialManifest: MaterialsManifest
}

export default function MaterialsChecklistView({ weekNumber, initialManifest }: Props) {
  const { user } = useAuth()
  const [doc_, setDoc] = useState<MaterialsChecklistDoc | null>(null)
  const [loading, setLoading] = useState(true)
  const [regenerating, setRegenerating] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const persisted = await getMaterialsChecklist(weekNumber)
      if (persisted) {
        setDoc(persisted)
      } else {
        const merged = mergeManifest(initialManifest, null)
        await saveMaterialsChecklist(merged)
        setDoc(merged)
      }
    } catch (err) {
      console.error("Failed to load checklist:", err)
    } finally {
      setLoading(false)
    }
  }, [weekNumber, initialManifest])

  useEffect(() => { refresh() }, [refresh])

  const handleToggle = async (itemId: string, next: boolean) => {
    if (!user || !doc_) return
    setDoc({
      ...doc_,
      items: doc_.items.map((it) =>
        it.id === itemId ? { ...it, done: next } : it
      ),
    })
    try {
      const updated = await toggleMaterialsItem(weekNumber, itemId, next, user.uid)
      setDoc(updated)
    } catch (err) {
      console.error("Failed to toggle item:", err)
      refresh()
    }
  }

  const handleCategoryDone = async (category: MaterialsCategory) => {
    if (!user || !doc_) return
    const allDone = doc_.items.filter((it) => it.category === category).every((it) => it.done)
    const next = !allDone
    setDoc({
      ...doc_,
      items: doc_.items.map((it) => (it.category === category ? { ...it, done: next } : it)),
    })
    try {
      const updated = await setCategoryDone(weekNumber, category, next, user.uid)
      setDoc(updated)
    } catch (err) {
      console.error("Failed to mark category:", err)
      refresh()
    }
  }

  const handleRegenerate = async () => {
    if (!doc_) return
    setRegenerating(true)
    try {
      const merged = mergeManifest(initialManifest, doc_)
      await saveMaterialsChecklist(merged)
      setDoc(merged)
    } catch (err) {
      console.error("Failed to regenerate:", err)
    } finally {
      setRegenerating(false)
    }
  }

  const grouped = useMemo(() => {
    if (!doc_) return null
    const map: Record<MaterialsCategory, typeof doc_.items> = {
      literacy: [], math: [], general: [], enrichment: [],
    }
    for (const it of doc_.items) map[it.category].push(it)
    return map
  }, [doc_])

  const totals = useMemo(() => {
    if (!doc_) return { total: 0, done: 0 }
    return {
      total: doc_.items.length,
      done: doc_.items.filter((it) => it.done).length,
    }
  }, [doc_])

  if (loading || !doc_ || !grouped) {
    return <div className="text-text-muted text-sm py-8">Loading checklist...</div>
  }

  const stale = doc_.parserVersion !== initialManifest.parserVersion ||
    doc_.items.length !== initialManifest.items.length ||
    doc_.items.some((it, i) => initialManifest.items[i]?.id !== it.id)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h2 className="font-display text-xl font-bold text-forest">
            Week {weekNumber} Materials Prep
          </h2>
          <p className="text-sm text-text-muted font-body">
            {totals.done} of {totals.total} items ready
            {stale && <span className="ml-2 text-amber">- curriculum changed - regenerate</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="px-3 py-1.5 rounded-full text-sm font-body bg-white border border-border hover:bg-sage/10 transition-colors"
          >
            {regenerating ? "Regenerating..." : "Regenerate from markdown"}
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-full text-sm font-body bg-forest text-white hover:bg-forest-mid transition-colors"
          >
            Print
          </button>
        </div>
      </div>

      <div className="hidden print:block">
        <h1 className="font-display text-2xl font-bold text-forest">
          Week {weekNumber} - Materials Prep Checklist
        </h1>
        <p className="text-sm text-text-muted font-body mt-1">
          IEP &amp; Thrive - Cohort 1 - Generated {new Date(doc_.generatedAt).toLocaleDateString()}
        </p>
      </div>

      <div className="h-2 bg-sage-pale rounded-full overflow-hidden print:hidden">
        <div
          className="h-full bg-forest-light transition-all duration-300"
          style={{ width: `${totals.total ? (totals.done / totals.total) * 100 : 0}%` }}
        />
      </div>

      <div className="space-y-5">
        {CATEGORY_ORDER.map((category) => {
          const items = grouped[category]
          if (items.length === 0) return null
          const allDone = items.every((it) => it.done)
          return (
            <section key={category} className="bg-white rounded-2xl border border-border overflow-hidden">
              <header className="flex items-center justify-between px-5 py-3 bg-sage/10 border-b border-border">
                <h3 className="font-display text-base font-semibold text-forest">
                  {CATEGORY_LABELS[category]} <span className="text-text-muted font-body text-xs ml-1">({items.filter((i) => i.done).length}/{items.length})</span>
                </h3>
                <button
                  onClick={() => handleCategoryDone(category)}
                  className="text-xs font-body text-forest underline print:hidden"
                >
                  {allDone ? "Uncheck all" : "Mark all done"}
                </button>
              </header>
              <ul className="divide-y divide-border">
                {items.map((item) => (
                  <li key={item.id} className="flex items-start gap-3 px-5 py-3">
                    <input
                      type="checkbox"
                      id={item.id}
                      checked={item.done}
                      onChange={(e) => handleToggle(item.id, e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-border accent-forest"
                    />
                    <label htmlFor={item.id} className="flex-1 text-sm font-body cursor-pointer">
                      <span className={item.done ? "line-through text-text-muted" : "text-text"}>
                        {item.name}
                      </span>
                      {item.sources.length > 0 && (
                        <span className="block text-[10px] uppercase tracking-wider text-text-muted font-body mt-0.5 print:hidden">
                          {item.sources.join(" - ")}
                        </span>
                      )}
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>
    </div>
  )
}
