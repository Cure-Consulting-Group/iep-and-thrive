'use client'

import { ReactNode } from 'react'

// Minimal markdown -> React renderer for curriculum content.
// Handles: H3/H4 headers, paragraphs, ul/ol lists, tables, inline bold/italic/code.
// No external dependency. Sufficient for the curriculum file shape.

interface Token {
  type: 'h4' | 'h5' | 'p' | 'ul' | 'ol' | 'table' | 'hr' | 'blockquote' | 'pre'
  content: string[]
}

function tokenize(md: string): Token[] {
  const lines = md.split('\n')
  const tokens: Token[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (/^#{4}\s+/.test(line)) {
      tokens.push({ type: 'h4', content: [line.replace(/^####\s+/, '').trim()] })
      i++
      continue
    }
    if (/^#{5}\s+/.test(line)) {
      tokens.push({ type: 'h5', content: [line.replace(/^#####\s+/, '').trim()] })
      i++
      continue
    }
    if (/^---\s*$/.test(line)) {
      tokens.push({ type: 'hr', content: [] })
      i++
      continue
    }
    if (/^\|/.test(line)) {
      const rows: string[] = []
      while (i < lines.length && /^\|/.test(lines[i])) {
        rows.push(lines[i])
        i++
      }
      tokens.push({ type: 'table', content: rows })
      continue
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && (/^\s*[-*]\s+/.test(lines[i]) || /^\s{2,}/.test(lines[i]))) {
        items.push(lines[i])
        i++
      }
      tokens.push({ type: 'ul', content: items })
      continue
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && (/^\s*\d+\.\s+/.test(lines[i]) || /^\s{2,}/.test(lines[i]))) {
        items.push(lines[i])
        i++
      }
      tokens.push({ type: 'ol', content: items })
      continue
    }
    if (/^>\s+/.test(line)) {
      const quote: string[] = []
      while (i < lines.length && /^>\s+/.test(lines[i])) {
        quote.push(lines[i].replace(/^>\s+/, ''))
        i++
      }
      tokens.push({ type: 'blockquote', content: quote })
      continue
    }
    if (line.trim() === '') {
      i++
      continue
    }
    // Paragraph — accumulate until blank line
    const para: string[] = []
    while (i < lines.length && lines[i].trim() !== '' && !/^[#>|]/.test(lines[i]) && !/^\s*[-*\d]/.test(lines[i])) {
      para.push(lines[i])
      i++
    }
    if (para.length) tokens.push({ type: 'p', content: para })
  }

  return tokens
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = []
  // Order matters: process **bold**, *italic*, `code`
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g
  const parts = text.split(pattern)
  parts.forEach((part, idx) => {
    if (!part) return
    const k = `${keyPrefix}-${idx}`
    if (part.startsWith('**') && part.endsWith('**')) {
      out.push(<strong key={k} className="font-semibold text-text">{part.slice(2, -2)}</strong>)
    } else if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      out.push(<em key={k} className="italic">{part.slice(1, -1)}</em>)
    } else if (part.startsWith('`') && part.endsWith('`')) {
      out.push(<code key={k} className="bg-cream-deep px-1 py-0.5 rounded text-[0.85em] font-mono">{part.slice(1, -1)}</code>)
    } else {
      out.push(part)
    }
  })
  return out
}

function renderListItems(lines: string[], ordered: boolean): ReactNode {
  // Top-level items + nested children. Detect nesting by indentation (2+ spaces).
  type Item = { text: string; children: string[] }
  const items: Item[] = []
  for (const line of lines) {
    const topMatch = ordered ? /^\s*\d+\.\s+(.+)$/.exec(line) : /^\s*[-*]\s+(.+)$/.exec(line)
    if (topMatch && !/^\s{2,}/.test(line)) {
      items.push({ text: topMatch[1], children: [] })
    } else if (items.length > 0) {
      items[items.length - 1].children.push(line.trim().replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, ''))
    }
  }

  const Tag = ordered ? 'ol' : 'ul'
  const listClass = ordered ? 'list-decimal pl-6 space-y-1.5 text-sm text-text leading-relaxed' : 'list-disc pl-6 space-y-1.5 text-sm text-text leading-relaxed'

  return (
    <Tag className={listClass}>
      {items.map((item, i) => (
        <li key={i}>
          {renderInline(item.text, `li-${i}`)}
          {item.children.length > 0 && (
            <ul className="list-disc pl-5 mt-1.5 space-y-1 text-text-muted">
              {item.children.map((c, j) => (
                <li key={j}>{renderInline(c, `li-${i}-${j}`)}</li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </Tag>
  )
}

function renderTable(rows: string[], keyPrefix: string): ReactNode {
  // First row = headers. Second row = separator (|---|---|). Rest = body.
  const parsed = rows.map((r) =>
    r.replace(/^\||\|$/g, '').split('|').map((c) => c.trim())
  )
  const headers = parsed[0]
  const body = parsed.slice(2)

  return (
    <div className="overflow-x-auto -mx-2 my-3" key={keyPrefix}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {headers.map((h, i) => (
              <th key={i} className="text-left font-semibold text-forest text-xs uppercase tracking-wider px-3 py-2">
                {renderInline(h, `th-${i}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, ri) => (
            <tr key={ri} className="border-b border-border/50">
              {row.map((cell, ci) => (
                <td key={ci} className="px-3 py-2 text-text align-top">
                  {renderInline(cell, `td-${ri}-${ci}`)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

interface MarkdownViewProps {
  markdown: string
  className?: string
}

export default function MarkdownView({ markdown, className = '' }: MarkdownViewProps) {
  const tokens = tokenize(markdown)

  return (
    <div className={`markdown-view space-y-3 ${className}`}>
      {tokens.map((tok, i) => {
        const k = `tok-${i}`
        switch (tok.type) {
          case 'h4':
            return (
              <h4 key={k} className="font-display font-bold text-forest text-base mt-5 mb-1">
                {renderInline(tok.content[0], k)}
              </h4>
            )
          case 'h5':
            return (
              <h5 key={k} className="font-body font-semibold text-text text-sm mt-3 mb-1 uppercase tracking-wider">
                {renderInline(tok.content[0], k)}
              </h5>
            )
          case 'hr':
            return <hr key={k} className="border-border my-4" />
          case 'p':
            return (
              <p key={k} className="text-sm text-text leading-relaxed">
                {renderInline(tok.content.join(' '), k)}
              </p>
            )
          case 'ul':
            return <div key={k}>{renderListItems(tok.content, false)}</div>
          case 'ol':
            return <div key={k}>{renderListItems(tok.content, true)}</div>
          case 'table':
            return renderTable(tok.content, k)
          case 'blockquote':
            return (
              <blockquote key={k} className="border-l-4 border-forest-light bg-sage-pale/40 px-4 py-2 italic text-sm text-text">
                {renderInline(tok.content.join(' '), k)}
              </blockquote>
            )
          default:
            return null
        }
      })}
    </div>
  )
}
