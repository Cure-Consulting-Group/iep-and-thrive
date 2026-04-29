'use client'

/**
 * D10: Admin Email Log Viewer
 *
 * Reads from `emailLog/` (existing collection — see functions/src/email-service.ts
 * `logEmail`). Lists recent transactional sends so the founder can audit what was
 * sent, to whom, when, and whether anything failed.
 *
 * ─── Canonical emailLog/{id} shape (as written by logEmail) ───
 *
 *   to:                  string
 *   subject:             string
 *   templateType:        EmailTemplateType (kind, e.g. 'attendance_flag_notification')
 *   status:              'sent' | 'skipped' | 'failed'
 *   sentAt:              Firestore Timestamp
 *   credentialsConfigured: boolean
 *   bodyHtmlPreview?:    first 500 chars of HTML body (audit only)
 *   messageId?:          Gmail upstream id (when status === 'sent')
 *   error?:              error message (when status === 'failed')
 *   meta?:               kind-specific extras (e.g. {studentId, flag, ...})
 *
 * Older entries (pre this expansion) only have to/subject/templateType/status/sentAt/
 * credentialsConfigured. We normalize at read time — missing optional fields
 * just render as "—".
 *
 * Read-only in v1. Resend support is a future enhancement (would require an
 * admin-callable Cloud Function with re-auth + rate-limit).
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  collection,
  query,
  orderBy,
  limit as fsLimit,
  startAfter,
  getDocs,
  QueryDocumentSnapshot,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

type EmailStatus = 'sent' | 'skipped' | 'failed' | 'unknown'

interface EmailLogEntry {
  id: string
  to: string
  subject: string
  templateType: string
  status: EmailStatus
  sentAt: Date | null
  credentialsConfigured?: boolean
  bodyHtmlPreview?: string
  messageId?: string | null
  error?: string
  meta?: Record<string, unknown>
}

const STATUS_BADGE: Record<EmailStatus, string> = {
  sent: 'bg-green-100 text-green-700',
  skipped: 'bg-amber-100 text-amber-700',
  failed: 'bg-red-100 text-red-700',
  unknown: 'bg-gray-100 text-gray-700',
}

const PAGE_SIZE = 100

// Normalize a Firestore doc into our typed entry. Older docs may be missing
// some fields — coerce gracefully rather than letting `undefined` propagate.
function normalize(
  docId: string,
  raw: Record<string, unknown>
): EmailLogEntry {
  const sentAtRaw = raw.sentAt
  let sentAt: Date | null = null
  if (sentAtRaw instanceof Timestamp) {
    sentAt = sentAtRaw.toDate()
  } else if (
    sentAtRaw &&
    typeof (sentAtRaw as { toDate?: () => Date }).toDate === 'function'
  ) {
    sentAt = (sentAtRaw as { toDate: () => Date }).toDate()
  }

  const rawStatus = (raw.status as string | undefined) ?? 'unknown'
  const status: EmailStatus =
    rawStatus === 'sent' || rawStatus === 'skipped' || rawStatus === 'failed'
      ? rawStatus
      : 'unknown'

  return {
    id: docId,
    to: (raw.to as string | undefined) ?? '',
    subject: (raw.subject as string | undefined) ?? '(no subject)',
    templateType: (raw.templateType as string | undefined) ?? 'unknown',
    status,
    sentAt,
    credentialsConfigured: raw.credentialsConfigured as boolean | undefined,
    bodyHtmlPreview: raw.bodyHtmlPreview as string | undefined,
    messageId: (raw.messageId as string | undefined) ?? null,
    error: raw.error as string | undefined,
    meta: raw.meta as Record<string, unknown> | undefined,
  }
}

function formatDateTime(d: Date | null): string {
  if (!d) return '—'
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  })
}

export default function AdminEmailLogPage() {
  const [entries, setEntries] = useState<EmailLogEntry[]>([])
  const [cursor, setCursor] = useState<QueryDocumentSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [filterKind, setFilterKind] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Initial page
  const loadInitial = useCallback(async () => {
    setLoading(true)
    try {
      // Order by sentAt desc. Some older entries might be missing sentAt entirely
      // (rare — only if logEmail itself failed mid-write). They'd be excluded by
      // the orderBy clause; that's acceptable for an audit view.
      const q = query(
        collection(db, 'emailLog'),
        orderBy('sentAt', 'desc'),
        fsLimit(PAGE_SIZE)
      )
      const snap = await getDocs(q)
      const next = snap.docs.map((d) => normalize(d.id, d.data()))
      setEntries(next)
      setCursor(snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null)
      setHasMore(snap.docs.length === PAGE_SIZE)
    } catch (err) {
      console.error('Failed to load emailLog:', err)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadInitial()
  }, [loadInitial])

  const loadMore = useCallback(async () => {
    if (!cursor || loadingMore) return
    setLoadingMore(true)
    try {
      const q = query(
        collection(db, 'emailLog'),
        orderBy('sentAt', 'desc'),
        startAfter(cursor),
        fsLimit(PAGE_SIZE)
      )
      const snap = await getDocs(q)
      const more = snap.docs.map((d) => normalize(d.id, d.data()))
      setEntries((prev) => [...prev, ...more])
      setCursor(snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : cursor)
      setHasMore(snap.docs.length === PAGE_SIZE)
    } catch (err) {
      console.error('Failed to load more emailLog entries:', err)
    }
    setLoadingMore(false)
  }, [cursor, loadingMore])

  // Distinct kinds in current dataset (for filter dropdown)
  const kinds = useMemo(() => {
    const set = new Set<string>()
    for (const e of entries) set.add(e.templateType)
    return Array.from(set).sort()
  }, [entries])

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const matchKind = filterKind === 'all' || e.templateType === filterKind
      const matchStatus = filterStatus === 'all' || e.status === filterStatus
      return matchKind && matchStatus
    })
  }, [entries, filterKind, filterStatus])

  // Summary counters
  const counts = useMemo(() => {
    let sent = 0,
      failed = 0,
      skipped = 0
    for (const e of entries) {
      if (e.status === 'sent') sent++
      else if (e.status === 'failed') failed++
      else if (e.status === 'skipped') skipped++
    }
    return { sent, failed, skipped, total: entries.length }
  }, [entries])

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-forest">Email Log</h1>
          <p className="text-text-muted font-body text-sm mt-1">
            Audit trail of transactional emails sent by IEP &amp; Thrive.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadInitial}
            className="text-sm font-body font-semibold text-forest hover:text-forest-mid transition-colors"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <div className="text-xl font-display font-bold text-forest">
            {counts.total}
          </div>
          <div className="text-xs font-body text-text-muted">Loaded</div>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <div className="text-xl font-display font-bold text-green-700">
            {counts.sent}
          </div>
          <div className="text-xs font-body text-text-muted">Sent</div>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <div className="text-xl font-display font-bold text-amber">
            {counts.skipped}
          </div>
          <div className="text-xs font-body text-text-muted">Skipped</div>
        </div>
        <div className="rounded-xl border border-border bg-white p-3 text-center">
          <div className="text-xl font-display font-bold text-red-700">
            {counts.failed}
          </div>
          <div className="text-xs font-body text-text-muted">Failed</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={filterKind}
          onChange={(e) => setFilterKind(e.target.value)}
          className="form-input w-auto text-sm"
          aria-label="Filter by kind"
        >
          <option value="all">All Kinds</option>
          {kinds.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="form-input w-auto text-sm"
          aria-label="Filter by status"
        >
          <option value="all">All Statuses</option>
          <option value="sent">Sent</option>
          <option value="skipped">Skipped</option>
          <option value="failed">Failed</option>
          <option value="unknown">Unknown</option>
        </select>
        {(filterKind !== 'all' || filterStatus !== 'all') && (
          <button
            onClick={() => {
              setFilterKind('all')
              setFilterStatus('all')
            }}
            className="text-sm font-body text-text-muted hover:text-forest transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-border p-3 animate-pulse"
            >
              <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <span className="text-4xl mb-4 block">📭</span>
          <h2 className="font-display text-lg font-semibold text-forest mb-2">
            {entries.length === 0 ? 'No emails logged yet' : 'No matching entries'}
          </h2>
          <p className="text-text-muted font-body text-sm max-w-sm mx-auto">
            {entries.length === 0
              ? 'Email entries appear here as the system sends transactional mail.'
              : 'Try adjusting your filters.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          {/* Header row */}
          <div className="hidden md:grid grid-cols-[200px_1fr_180px_140px_90px] gap-3 px-4 py-3 border-b border-border bg-cream-deep text-[11px] font-body font-semibold uppercase tracking-wider text-text-muted">
            <div>Timestamp</div>
            <div>Subject / Recipient</div>
            <div>Kind</div>
            <div>Status</div>
            <div className="text-right">Detail</div>
          </div>

          <ul className="divide-y divide-border/60">
            {filtered.map((e) => {
              const expanded = expandedId === e.id
              return (
                <li key={e.id}>
                  <button
                    onClick={() => setExpandedId(expanded ? null : e.id)}
                    className="w-full text-left hover:bg-sage/5 transition-colors"
                    aria-expanded={expanded}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_180px_140px_90px] gap-2 md:gap-3 px-4 py-3 items-center">
                      <div className="text-xs font-body text-text-muted">
                        {formatDateTime(e.sentAt)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-body text-sm font-semibold text-text truncate">
                          {e.subject}
                        </p>
                        <p className="text-xs font-body text-text-muted truncate">
                          to {e.to || '—'}
                        </p>
                      </div>
                      <div className="text-xs font-body text-text-muted truncate">
                        {e.templateType}
                      </div>
                      <div>
                        <span
                          className={`inline-block text-[11px] font-body font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_BADGE[e.status]}`}
                        >
                          {e.status}
                        </span>
                      </div>
                      <div className="text-xs font-body text-text-muted text-right">
                        {expanded ? '▴ Hide' : '▾ View'}
                      </div>
                    </div>
                  </button>

                  {expanded && (
                    <div className="px-4 pb-4 pt-0 bg-cream-deep/50">
                      <dl className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-x-4 gap-y-2 text-sm font-body mb-3">
                        <dt className="text-text-muted">Recipient</dt>
                        <dd className="text-text break-all">{e.to || '—'}</dd>

                        <dt className="text-text-muted">Subject</dt>
                        <dd className="text-text">{e.subject}</dd>

                        <dt className="text-text-muted">Kind</dt>
                        <dd className="text-text">{e.templateType}</dd>

                        <dt className="text-text-muted">Status</dt>
                        <dd className="text-text">{e.status}</dd>

                        <dt className="text-text-muted">Sent At</dt>
                        <dd className="text-text">{formatDateTime(e.sentAt)}</dd>

                        {e.messageId && (
                          <>
                            <dt className="text-text-muted">Gmail Message Id</dt>
                            <dd className="text-text break-all text-xs">
                              {e.messageId}
                            </dd>
                          </>
                        )}

                        {typeof e.credentialsConfigured === 'boolean' && (
                          <>
                            <dt className="text-text-muted">Credentials Configured</dt>
                            <dd className="text-text">
                              {e.credentialsConfigured ? 'Yes' : 'No'}
                            </dd>
                          </>
                        )}

                        <dt className="text-text-muted">Doc Id</dt>
                        <dd className="text-text break-all text-xs">{e.id}</dd>
                      </dl>

                      {e.error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3 mb-3">
                          <p className="text-[11px] font-body font-semibold uppercase tracking-wider text-red-700 mb-1">
                            Error
                          </p>
                          <pre className="text-xs font-mono text-red-900 whitespace-pre-wrap break-words">
                            {e.error}
                          </pre>
                        </div>
                      )}

                      {e.meta && Object.keys(e.meta).length > 0 && (
                        <div className="rounded-lg border border-border bg-white p-3 mb-3">
                          <p className="text-[11px] font-body font-semibold uppercase tracking-wider text-text-muted mb-2">
                            Metadata
                          </p>
                          <pre className="text-xs font-mono text-text whitespace-pre-wrap break-words">
                            {JSON.stringify(e.meta, null, 2)}
                          </pre>
                        </div>
                      )}

                      {e.bodyHtmlPreview ? (
                        <div className="rounded-lg border border-border bg-white p-3">
                          <p className="text-[11px] font-body font-semibold uppercase tracking-wider text-text-muted mb-2">
                            Body Preview (first 500 chars)
                          </p>
                          <pre className="text-xs font-mono text-text whitespace-pre-wrap break-words">
                            {e.bodyHtmlPreview}
                          </pre>
                        </div>
                      ) : (
                        <p className="text-xs font-body text-text-muted italic">
                          No body preview captured for this entry. (Older entries
                          predate body-preview logging.)
                        </p>
                      )}

                      <p className="text-[11px] font-body text-text-muted italic mt-3">
                        Read-only. Resend is a future enhancement.
                      </p>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {!loading && hasMore && filtered.length > 0 && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="rounded-full bg-forest text-white font-body font-semibold text-sm px-6 py-2.5 hover:bg-forest-mid transition-colors disabled:opacity-60"
          >
            {loadingMore ? 'Loading…' : 'Load 100 more'}
          </button>
        </div>
      )}

      {!loading && !hasMore && entries.length > 0 && (
        <p className="text-center text-xs text-text-muted font-body mt-6">
          End of log · {entries.length} {entries.length === 1 ? 'entry' : 'entries'} loaded
        </p>
      )}
    </div>
  )
}
