'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import {
  getNotificationsForParent,
  markAllRead,
  NotificationDoc,
} from '@/lib/notification-service'

const FLAG_BADGE: Record<string, { bg: string; emoji: string }> = {
  'needs-parent-fyi': { bg: 'bg-amber-100 text-amber-800', emoji: '📣' },
  illness: { bg: 'bg-amber-100 text-amber-800', emoji: '🤒' },
  injury: { bg: 'bg-red-100 text-red-700', emoji: '🩹' },
}

function formatDate(value: NotificationDoc['createdAt'] | null | undefined): string {
  if (!value) return ''
  // Firestore Timestamp has .toDate(); some fallback paths might be a JS Date.
  const date =
    typeof (value as { toDate?: () => Date }).toDate === 'function'
      ? (value as { toDate: () => Date }).toDate()
      : (value as unknown as Date)
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function PortalNotificationsPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<NotificationDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [marked, setMarked] = useState(false)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getNotificationsForParent(user.uid)
      setItems(data)
      // Mark unread as read on view (one-shot per page mount)
      if (!marked) {
        await markAllRead(data)
        setMarked(true)
      }
    } catch (err) {
      console.error('Failed to load notifications:', err)
    }
    setLoading(false)
  }, [user, marked])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-forest">Notifications</h1>
        <p className="text-text-muted font-body text-sm mt-1">
          Real-time updates from your child&apos;s instructor.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-border p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <span className="text-4xl mb-4 block">🌿</span>
          <h2 className="font-display text-lg font-semibold text-forest mb-2">
            No notifications yet
          </h2>
          <p className="text-text-muted font-body text-sm max-w-sm mx-auto">
            When the instructor flags something during the program day, you&apos;ll see it here
            and we&apos;ll send you an email.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((n) => {
            const badge = FLAG_BADGE[n.flag ?? ''] ?? {
              bg: 'bg-sage/30 text-forest',
              emoji: '✉️',
            }
            return (
              <li
                key={n.id}
                className={`bg-white rounded-2xl border p-5 transition-colors ${
                  n.read ? 'border-border' : 'border-forest/40 bg-sage/10'
                }`}
              >
                <div className="flex items-start gap-4">
                  <span
                    className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${badge.bg}`}
                    aria-hidden
                  >
                    <span className="text-lg">{badge.emoji}</span>
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <p className="font-body font-semibold text-text">
                        {n.studentName || 'Your student'}
                      </p>
                      <span className="text-xs font-body text-text-muted">
                        {n.flagDisplay || n.flag || 'Update'}
                      </span>
                      {!n.read && (
                        <span className="text-[10px] font-body font-semibold uppercase tracking-wider text-forest bg-sage/40 px-2 py-0.5 rounded-full">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-body text-text-muted mt-0.5">
                      {n.date ? `${n.date} · ` : ''}
                      {formatDate(n.createdAt)}
                    </p>
                    {n.parentVisibleNote && (
                      <p className="font-body text-sm text-text mt-3 leading-relaxed">
                        {n.parentVisibleNote}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
