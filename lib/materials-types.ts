// Materials prep checklist types + constants — safe for client bundles.
//
// Split out of `lib/materials-parser.ts` so client components can pull in
// the type/constant surface without webpack trying to resolve `fs` (which
// the parser uses for filesystem access at build time).
//
// The parser re-imports from here, so this is the source of truth.

export const PARSER_VERSION = 1

export type MaterialsCategory = 'literacy' | 'math' | 'general' | 'enrichment'

export const CATEGORY_LABELS: Record<MaterialsCategory, string> = {
  literacy: 'Literacy',
  math: 'Math',
  general: 'General',
  enrichment: 'Enrichment',
}

export const CATEGORY_ORDER: MaterialsCategory[] = ['literacy', 'math', 'general', 'enrichment']

export interface MaterialsItem {
  id: string
  name: string
  category: MaterialsCategory
  sources: string[]
}

export interface MaterialsManifest {
  weekNumber: number
  parserVersion: number
  generatedAt: string
  items: MaterialsItem[]
}

function normalizeName(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[–—]/g, '-')
    .replace(/[^a-z0-9\s\-/]+/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function slugify(raw: string): string {
  const n = normalizeName(raw)
  return n.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 80) || 'item'
}
