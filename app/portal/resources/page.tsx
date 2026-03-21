'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getAllResources, incrementDownloadCount, Resource } from '@/lib/resource-service'

const CATEGORY_LABELS: Record<string, string> = {
  handbook: 'Handbook',
  worksheet: 'Worksheet',
  form: 'Form',
  other: 'Other',
}

const CATEGORY_ICONS: Record<string, string> = {
  handbook: '📘',
  worksheet: '📝',
  form: '📋',
  other: '📄',
}

export default function PortalResourcesPage() {
  const { profile } = useAuth()
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAllResources()
      // Filter by visibility
      const visible = data.filter((r) => {
        if (r.visibility === 'all') return true
        if (r.visibility === 'enrolled' && profile?.role === 'parent') return true
        return false
      })
      setResources(visible)
    } catch (err) {
      console.error('Failed to load resources:', err)
    }
    setLoading(false)
  }, [profile])

  useEffect(() => { load() }, [load])

  const handleDownload = async (resource: Resource) => {
    try {
      await incrementDownloadCount(resource.id)
      window.open(resource.fileUrl, '_blank')
    } catch (err) {
      console.error('Download tracking failed:', err)
      window.open(resource.fileUrl, '_blank')
    }
  }

  const categories = ['all', ...Array.from(new Set(resources.map((r) => r.category)))]
  const filtered = activeCategory === 'all' ? resources : resources.filter((r) => r.category === activeCategory)

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-forest mb-2">Resources</h1>
      <p className="text-text-muted font-body text-sm mb-8">
        Download program materials, handbooks, and worksheets.
      </p>

      {/* Category Tabs */}
      {resources.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-body font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-forest text-white'
                  : 'bg-white border border-border text-text-muted hover:bg-sage/10'
              }`}
            >
              {cat === 'all' ? 'All' : CATEGORY_LABELS[cat] || cat}
              <span className="ml-1.5 opacity-70">
                ({cat === 'all' ? resources.length : resources.filter((r) => r.category === cat).length})
              </span>
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-border p-6 animate-pulse">
              <div className="h-10 w-10 bg-gray-200 rounded-lg mb-3" />
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-full" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <span className="text-4xl mb-4 block">📁</span>
          <h2 className="font-display text-lg font-semibold text-forest mb-2">No Resources Available</h2>
          <p className="text-text-muted font-body text-sm max-w-sm mx-auto">
            Program resources will be available here once enrollment is confirmed. Check back soon.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((res) => (
            <div key={res.id} className="bg-white rounded-2xl border border-border p-6 hover:border-sage transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-sage/20 flex items-center justify-center shrink-0">
                  <span className="text-xl">{CATEGORY_ICONS[res.category] || '📄'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-body font-semibold text-text mb-1">{res.title}</h3>
                  {res.description && (
                    <p className="text-sm text-text-muted font-body line-clamp-2 mb-3">{res.description}</p>
                  )}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-body bg-sage/20 text-forest px-2 py-0.5 rounded-full">
                      {CATEGORY_LABELS[res.category]}
                    </span>
                    <span className="text-xs font-body text-text-muted">
                      {formatFileSize(res.fileSize)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDownload(res)}
                className="w-full mt-4 bg-forest/10 text-forest font-body text-sm font-semibold py-2.5 rounded-xl hover:bg-forest/20 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
