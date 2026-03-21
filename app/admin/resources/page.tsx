'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'
import {
  uploadResource,
  getAllResources,
  deleteResource,
  Resource,
} from '@/lib/resource-service'

const CATEGORY_LABELS: Record<string, string> = {
  handbook: 'Handbook',
  worksheet: 'Worksheet',
  form: 'Form',
  other: 'Other',
}

export default function AdminResourcesPage() {
  const { user } = useAuth()
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Upload form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<Resource['category']>('handbook')
  const [visibility, setVisibility] = useState<Resource['visibility']>('all')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAllResources()
      setResources(data)
    } catch (err) {
      console.error('Failed to load resources:', err)
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile || !user) return

    setUploading(true)
    setUploadProgress(0)
    try {
      await uploadResource(
        selectedFile,
        { title, description, category, visibility },
        user.uid,
        (pct) => setUploadProgress(pct)
      )
      // Reset form
      setTitle('')
      setDescription('')
      setCategory('handbook')
      setVisibility('all')
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      setShowUpload(false)
      await load()
    } catch (err) {
      console.error('Upload failed:', err)
      alert('Upload failed. Please try again.')
    }
    setUploading(false)
  }

  const handleDelete = async (resource: Resource) => {
    if (!confirm(`Delete "${resource.title}"? This cannot be undone.`)) return
    try {
      await deleteResource(resource.id)
      setResources((prev) => prev.filter((r) => r.id !== resource.id))
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-forest">Resources</h1>
          <p className="text-text-muted font-body text-sm mt-1">
            Upload and manage program resources for parents.
          </p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="bg-forest text-white font-body text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-forest/90 transition-colors"
        >
          {showUpload ? 'Cancel' : '+ Upload Resource'}
        </button>
      </div>

      {/* Upload Form */}
      {showUpload && (
        <form onSubmit={handleUpload} className="bg-white rounded-2xl border border-border p-6 mb-6">
          <h2 className="font-display text-lg font-semibold text-forest mb-4">Upload New Resource</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-body text-sm font-semibold text-text mb-1">Title *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="form-input" placeholder="Parent Handbook" />
            </div>
            <div>
              <label className="block font-body text-sm font-semibold text-text mb-1">Category *</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as Resource['category'])} className="form-input">
                {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block font-body text-sm font-semibold text-text mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="form-input" rows={2} placeholder="Brief description of this resource..." />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-body text-sm font-semibold text-text mb-1">Visibility</label>
              <select value={visibility} onChange={(e) => setVisibility(e.target.value as Resource['visibility'])} className="form-input">
                <option value="all">All Parents</option>
                <option value="enrolled">Enrolled Only</option>
              </select>
            </div>
            <div>
              <label className="block font-body text-sm font-semibold text-text mb-1">File * (Max 25MB)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.xlsx,.xls,.png,.jpg,.jpeg"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                required
                className="form-input"
              />
            </div>
          </div>
          {uploading && (
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-forest h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
              </div>
              <p className="text-xs text-text-muted font-body mt-1">{uploadProgress}% uploaded</p>
            </div>
          )}
          <button
            type="submit"
            disabled={uploading || !selectedFile || !title}
            className="bg-forest text-white font-body text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-forest/90 disabled:opacity-50 transition-colors"
          >
            {uploading ? 'Uploading...' : 'Upload Resource'}
          </button>
        </form>
      )}

      {/* Resources List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-border p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <span className="text-4xl mb-4 block">📁</span>
          <h2 className="font-display text-lg font-semibold text-forest mb-2">No Resources Yet</h2>
          <p className="text-text-muted font-body text-sm max-w-sm mx-auto">
            Upload program materials like handbooks, worksheets, and forms for parents to access.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {resources.map((res) => (
            <div key={res.id} className="bg-white rounded-xl border border-border p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-sage/20 flex items-center justify-center shrink-0">
                <span className="text-lg">
                  {res.category === 'handbook' ? '📘' : res.category === 'worksheet' ? '📝' : res.category === 'form' ? '📋' : '📄'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-body font-semibold text-text">{res.title}</h3>
                {res.description && (
                  <p className="text-sm text-text-muted font-body mt-0.5 line-clamp-1">{res.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-xs font-body bg-sage/20 text-forest px-2 py-0.5 rounded-full">
                    {CATEGORY_LABELS[res.category]}
                  </span>
                  <span className="text-xs font-body text-text-muted">
                    {formatFileSize(res.fileSize)}
                  </span>
                  <span className="text-xs font-body text-text-muted">
                    {res.downloadCount} downloads
                  </span>
                  <span className="text-xs font-body text-text-muted">
                    {res.visibility === 'enrolled' ? '🔒 Enrolled only' : '🌐 All parents'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={res.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-forest hover:text-forest/70 text-sm font-body underline"
                >
                  View
                </a>
                <button
                  onClick={() => handleDelete(res)}
                  className="text-red-500 hover:text-red-700 text-sm font-body"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
