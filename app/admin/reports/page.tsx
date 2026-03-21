'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  uploadReport,
  getAllReports,
  deleteReport,
  ProgressReport,
} from '@/lib/report-service'
import { getAllStudents, Student } from '@/lib/student-service'

const WEEK_OPTIONS = [
  { value: 1, label: 'Week 1' },
  { value: 2, label: 'Week 2' },
  { value: 3, label: 'Week 3' },
  { value: 4, label: 'Week 4' },
  { value: 5, label: 'Week 5' },
  { value: 6, label: 'Week 6' },
  { value: 7, label: 'Final Report' },
]

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ProgressReport[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Form state
  const [studentId, setStudentId] = useState('')
  const [weekNumber, setWeekNumber] = useState(1)
  const [goalsTargeted, setGoalsTargeted] = useState('')
  const [accuracyPercentage, setAccuracyPercentage] = useState(0)
  const [engagementNotes, setEngagementNotes] = useState('')
  const [homePractice, setHomePractice] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [reps, studs] = await Promise.all([getAllReports(), getAllStudents()])
      setReports(reps)
      setStudents(studs)
    } catch (err) {
      console.error('Failed to load data:', err)
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const selectedStudent = students.find((s) => s.id === studentId)

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile || !studentId || !selectedStudent) return

    // Check for duplicate
    const exists = reports.find((r) => r.studentId === studentId && r.weekNumber === weekNumber)
    if (exists && !confirm(`A report for ${selectedStudent.name} — ${weekNumber === 7 ? 'Final' : `Week ${weekNumber}`} already exists. Replace it?`)) {
      return
    }

    setUploading(true)
    setUploadProgress(0)
    try {
      await uploadReport(
        selectedFile,
        {
          studentId,
          studentName: selectedStudent.name,
          parentId: selectedStudent.parentId,
          weekNumber,
          goalsTargeted,
          accuracyPercentage,
          engagementNotes,
          homePractice,
        },
        (pct) => setUploadProgress(pct)
      )
      // Reset
      setStudentId('')
      setWeekNumber(1)
      setGoalsTargeted('')
      setAccuracyPercentage(0)
      setEngagementNotes('')
      setHomePractice('')
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

  const handleDelete = async (report: ProgressReport) => {
    if (!confirm(`Delete the ${report.weekNumber === 7 ? 'Final' : `Week ${report.weekNumber}`} report for ${report.studentName}?`)) return
    try {
      await deleteReport(report.id)
      setReports((prev) => prev.filter((r) => r.id !== report.id))
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-forest">Progress Reports</h1>
          <p className="text-text-muted font-body text-sm mt-1">
            Upload weekly and final progress reports for students.
          </p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="bg-forest text-white font-body text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-forest/90 transition-colors"
        >
          {showUpload ? 'Cancel' : '+ Upload Report'}
        </button>
      </div>

      {/* Upload Form */}
      {showUpload && (
        <form onSubmit={handleUpload} className="bg-white rounded-2xl border border-border p-6 mb-6">
          <h2 className="font-display text-lg font-semibold text-forest mb-4">Upload Progress Report</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-body text-sm font-semibold text-text mb-1">Student *</label>
              <select value={studentId} onChange={(e) => setStudentId(e.target.value)} required className="form-input">
                <option value="">Select a student...</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.parentName})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-body text-sm font-semibold text-text mb-1">Report Period *</label>
              <select value={weekNumber} onChange={(e) => setWeekNumber(Number(e.target.value))} className="form-input">
                {WEEK_OPTIONS.map((w) => (
                  <option key={w.value} value={w.value}>{w.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-body text-sm font-semibold text-text mb-1">IEP Goals Targeted *</label>
              <textarea value={goalsTargeted} onChange={(e) => setGoalsTargeted(e.target.value)} required className="form-input" rows={2} placeholder="e.g., Phonemic awareness, letter-sound correspondence..." />
            </div>
            <div>
              <label className="block font-body text-sm font-semibold text-text mb-1">Accuracy Percentage *</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={accuracyPercentage}
                  onChange={(e) => setAccuracyPercentage(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="font-body font-bold text-forest text-lg w-12 text-right">{accuracyPercentage}%</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-body text-sm font-semibold text-text mb-1">Engagement Notes</label>
              <textarea value={engagementNotes} onChange={(e) => setEngagementNotes(e.target.value)} className="form-input" rows={2} placeholder="How the student engaged during sessions..." />
            </div>
            <div>
              <label className="block font-body text-sm font-semibold text-text mb-1">Home Practice Recommendations</label>
              <textarea value={homePractice} onChange={(e) => setHomePractice(e.target.value)} className="form-input" rows={2} placeholder="Suggested activities for home..." />
            </div>
          </div>
          <div className="mb-4">
            <label className="block font-body text-sm font-semibold text-text mb-1">Report PDF *</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              required
              className="form-input"
            />
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
            disabled={uploading || !selectedFile || !studentId || !goalsTargeted}
            className="bg-forest text-white font-body text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-forest/90 disabled:opacity-50 transition-colors"
          >
            {uploading ? 'Uploading...' : 'Publish Report'}
          </button>
        </form>
      )}

      {/* Reports List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-border p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <span className="text-4xl mb-4 block">📈</span>
          <h2 className="font-display text-lg font-semibold text-forest mb-2">No Reports Yet</h2>
          <p className="text-text-muted font-body text-sm max-w-sm mx-auto">
            Upload weekly progress reports for enrolled students. Reports will be visible to parents in their portal.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report.id} className="bg-white rounded-xl border border-border p-5 flex items-start gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                report.weekNumber === 7 ? 'bg-amber/20' : 'bg-sage/20'
              }`}>
                <span className="text-sm font-bold font-display text-forest">
                  {report.weekNumber === 7 ? '🏆' : `W${report.weekNumber}`}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-body font-semibold text-text">
                  {report.studentName} — {report.weekNumber === 7 ? 'Final Report' : `Week ${report.weekNumber}`}
                </h3>
                <p className="text-sm text-text-muted font-body mt-0.5 line-clamp-1">
                  Goals: {report.goalsTargeted}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className={`text-xs font-body font-semibold px-2 py-0.5 rounded-full ${
                    report.accuracyPercentage >= 80
                      ? 'bg-green-100 text-green-700'
                      : report.accuracyPercentage >= 60
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {report.accuracyPercentage}% accuracy
                  </span>
                  <span className="text-xs font-body text-text-muted">
                    {report.viewedAt ? '✅ Viewed by parent' : '👁️ Not yet viewed'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={report.reportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-forest hover:text-forest/70 text-sm font-body underline"
                >
                  View PDF
                </a>
                <button
                  onClick={() => handleDelete(report)}
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
