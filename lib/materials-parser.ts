// Server-side parser for the per-week materials prep checklist (C2).
//
// Reads two sources from each `curriculum/week-{n}` directory and merges them:
//   1. The "## Materials Needed This Week" section in `overview.md`, including
//      its `### Literacy / ### Math / ### General / ### Enrichment` subheadings
//      which we treat as authoritative category overrides.
//   2. Every `**Materials**:` block in `monday..friday.md`. These are bullet
//      lists scoped to a single block (math, reading, etc.).
//
// We dedupe across the two sources via a normalized lookup key (lowercased,
// parenthetical fragments stripped, hyphens to spaces, internal whitespace
// collapsed). The display name is taken from whichever occurrence we saw
// first — overview entries sort first so they win when present.
//
// Categorization:
//   - Items inside an overview subheading inherit that heading’s category.
//   - Items from daily files are categorized by keyword match against the
//     normalized name. Falls back to "general".
//
// PARSER_VERSION is bumped if we materially change extraction or
// categorization so the admin UI can offer a "stale — regenerate" hint.

import fs from "fs"
import path from "path"
import {
  PARSER_VERSION,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  slugify,
  type MaterialsCategory,
  type MaterialsItem,
  type MaterialsManifest,
} from "@/lib/materials-types"

// Re-export types and constants for back-compat with existing consumers.
export {
  PARSER_VERSION,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  slugify,
}
export type { MaterialsCategory, MaterialsItem, MaterialsManifest }

const CURRICULUM_DIR = path.join(process.cwd(), "curriculum")

const DAY_FILES = ["monday", "tuesday", "wednesday", "thursday", "friday"] as const

function normalizeName(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[–—]/g, "-")
    .replace(/[^a-z0-9\s\-/]+/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

const CATEGORY_KEYWORDS: { category: MaterialsCategory; patterns: RegExp[] }[] = [
  {
    category: "literacy",
    patterns: [
      /phon(ic|ogram)/, /\bog\b/, /orton/, /decoding/, /decodable/, /\bsight\b/,
      /\bred word/, /sand tray|salt tray/, /\bblevin/, /\borf\b/, /fluency/,
      /spelling/, /comprehension/, /reading/, /writing/, /journal entry/, /vowel team/,
      /sentence/, /\bword/, /letter\b/, /sound\b/, /rime/, /onset/, /literacy/,
      /paragraph/, /text/, /story/, /retell/, /\bnarrative/,
    ],
  },
  {
    category: "math",
    patterns: [
      /\bmath/, /place value/, /base[- ]ten/, /place value disc/, /number line/,
      /multiplication/, /division/, /addition|subtraction/, /\bcra\b/,
      /computation/, /numeracy/, /fraction/, /array/, /equation/,
      /counters?\b/, /play money/, /coin/, /dice\b/, /tape measure/,
    ],
  },
  {
    category: "enrichment",
    patterns: [
      /nature/, /magnify/, /enrichment/, /craft/, /art\b/, /portrait/,
      /pastel/, /paint/, /sketch/, /seed/, /garden/, /science kit/, /\bplant/,
      /microscope/, /classroom economy/, /hike/, /walk\b/, /scavenger/,
      /\bbuilding material/, /pattern block/, /cardboard/, /craft stick/,
    ],
  },
  {
    category: "general",
    patterns: [
      /chart paper/, /folder/, /name tent/, /visual schedule/, /sticker/,
      /reward/, /timer\b/, /clipboard/, /pencil/, /eraser/, /marker/,
      /dry[- ]erase/, /tape\b/, /glue\b/, /\bbin\b/, /label\b/,
      /\bagenda/, /handout/, /worksheet/,
    ],
  },
]

function categorizeByKeyword(rawName: string): MaterialsCategory {
  const n = normalizeName(rawName)
  for (const group of CATEGORY_KEYWORDS) {
    if (group.patterns.some((re) => re.test(n))) return group.category
  }
  return "general"
}

function readMarkdown(weekNumber: number, name: string): string | null {
  const p = path.join(CURRICULUM_DIR, `week-${weekNumber}`, `${name}.md`)
  if (!fs.existsSync(p)) return null
  return fs.readFileSync(p, "utf8")
}

function stripBulletPrefix(line: string): string | null {
  const m = /^\s*[-*+]\s+(.*)$/.exec(line)
  if (!m) return null
  return m[1].trim()
}

function cleanItemText(text: string): string {
  return text
    .replace(/\*\*/g, "")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

interface RawHit {
  name: string
  categoryHint?: MaterialsCategory
  source: string
}

function parseOverviewMaterials(weekNumber: number): RawHit[] {
  const md = readMarkdown(weekNumber, "overview")
  if (!md) return []
  const lines = md.split(/\r?\n/)
  const hits: RawHit[] = []
  let inSection = false
  let currentCategory: MaterialsCategory | undefined

  for (const line of lines) {
    const h2 = /^##\s+(.+?)\s*$/.exec(line)
    if (h2) {
      const heading = h2[1].toLowerCase()
      inSection = /materials\s+needed\s+this\s+week/.test(heading)
      currentCategory = undefined
      continue
    }
    if (!inSection) continue

    const h3 = /^###\s+(.+?)\s*$/.exec(line)
    if (h3) {
      const sub = h3[1].toLowerCase()
      if (sub.includes("literacy")) currentCategory = "literacy"
      else if (sub.includes("math")) currentCategory = "math"
      else if (sub.includes("general")) currentCategory = "general"
      else if (sub.includes("enrichment")) currentCategory = "enrichment"
      else currentCategory = undefined
      continue
    }

    const bullet = stripBulletPrefix(line)
    if (!bullet) continue
    const cleaned = cleanItemText(bullet)
    if (!cleaned) continue
    hits.push({ name: cleaned, categoryHint: currentCategory, source: "overview" })
  }
  return hits
}

function parseDayMaterials(weekNumber: number, dayKey: string): RawHit[] {
  const md = readMarkdown(weekNumber, dayKey)
  if (!md) return []
  const lines = md.split(/\r?\n/)
  const hits: RawHit[] = []
  let blockLabel = ""
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const h3 = /^###\s+(.+?)\s*$/.exec(line)
    if (h3) blockLabel = h3[1].trim().toLowerCase()

    if (/^\s*\*\*Materials\*\*\s*:?/.test(line)) {
      let j = i + 1
      while (j < lines.length) {
        const l = lines[j]
        if (/^\s*$/.test(l)) break
        if (/^#{1,6}\s+/.test(l)) break
        if (/^\s*\*\*[A-Z][^*]+\*\*\s*:?/.test(l)) break
        const bullet = stripBulletPrefix(l)
        if (bullet) {
          const cleaned = cleanItemText(bullet)
          if (cleaned) {
            hits.push({
              name: cleaned,
              source: blockLabel ? `${dayKey}:${blockLabel.split(" ")[0]}` : dayKey,
            })
          }
        }
        j++
      }
      i = j
      continue
    }
    i++
  }
  return hits
}

export function parseWeekMaterials(weekNumber: number): MaterialsManifest {
  const overviewHits = parseOverviewMaterials(weekNumber)
  const dayHits: RawHit[] = []
  for (const day of DAY_FILES) dayHits.push(...parseDayMaterials(weekNumber, day))

  const merged = new Map<string, MaterialsItem>()
  for (const hit of [...overviewHits, ...dayHits]) {
    const key = normalizeName(hit.name)
    if (!key) continue
    const existing = merged.get(key)
    if (existing) {
      if (!existing.sources.includes(hit.source)) existing.sources.push(hit.source)
      if (hit.categoryHint && !existing.sources.includes("overview")) {
        existing.category = hit.categoryHint
      }
      continue
    }
    const category = hit.categoryHint ?? categorizeByKeyword(hit.name)
    merged.set(key, {
      id: slugify(hit.name),
      name: hit.name,
      category,
      sources: [hit.source],
    })
  }

  const used = new Set<string>()
  const items: MaterialsItem[] = []
  merged.forEach((item) => {
    let id = item.id
    let n = 2
    while (used.has(id)) id = `${item.id}-${n++}`
    used.add(id)
    items.push({ ...item, id })
  })

  items.sort((a, b) => {
    const ca = CATEGORY_ORDER.indexOf(a.category)
    const cb = CATEGORY_ORDER.indexOf(b.category)
    if (ca !== cb) return ca - cb
    return a.name.localeCompare(b.name)
  })

  return {
    weekNumber,
    parserVersion: PARSER_VERSION,
    generatedAt: new Date().toISOString(),
    items,
  }
}

export function summarizeWeek(weekNumber: number): { weekNumber: number; itemCount: number; byCategory: Record<MaterialsCategory, number> } {
  const m = parseWeekMaterials(weekNumber)
  const byCategory: Record<MaterialsCategory, number> = {
    literacy: 0, math: 0, general: 0, enrichment: 0,
  }
  for (const i of m.items) byCategory[i.category]++
  return { weekNumber, itemCount: m.items.length, byCategory }
}
