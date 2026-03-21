'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getReportsByParent, markReportViewed, ProgressReport } from '@/lib/report-service'

export default function PortalReportsPage() {
  const { user } = useAuth()
  const [reports, setReports] = useState<ProgressReport[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getReportsByParent(user.uid)
      setReports(data)
    } catch (err) {
      console.error('Failed to load reports:', err)
    }
    setLoading(false)
  }, [user])

  useEffect(() => { load() }, [load])

  const handleView = async (report: ProgressReport) => {
    if (!report.viewedAt) {
      try {
        await markReportViewed(report.id)
        setReports((prev) =>
          prev.map((r) => (r.id === report.id ? { ...r, viewedAt: new Date() as unknown as ProgressReport['viewedAt'] } : r))
        )
      } catch (err) {
        console.error('Failed to mark viewed:', err)
      }
    }
    window.open(report.reportUrl, '_blank')
  }

  // Group by student
  const grouped = reports.reduce<Record<string, ProgressReport[]>>((acc, r) => {
    if (!acc[r.studentName]) acc[r.studentName] = []
    acc[r.studentName].push(r)
    return acc
  }, {})

  // Sort each group by week
  Object.values(grouped).forEach((arr) => arr.sort((a, b) => a.weekNumber - b.weekNumber))

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-forest mb-2">Progress Reports</h1>
      <p className="text-text-muted font-body text-sm mb-8">
        View and download your child&apos;s weekly and final progress reports.
      </p>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-border p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/4 mb-4" />
              <div className="space-y-3">
                <div className="h-16 bg-gray-200 rounded" />
                <div className="h-16 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <span className="text-4xl mb-4 block">📈</span>
          <h2 className="font-display text-lg font-semibold text-forest mb-2">No Reports Yet</h2>
          <p className="text-text-muted font-body text-sm max-w-sm mx-auto">
            Progress reports will be published here during the summer program. Weekly reports go out every Friday.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([studentName, studentReports]) => (
            <div key={studentName} className="bg-white rounded-2xl border border-border p-6">
              <h2 className="font-display text-lg font-semibold text-forest mb-4 flex items-center gap-2">
                🎓 {studentName}
              </h2>
              <div className="space-y-3">
                {studentReports.map((report) => (
                  <div
                    key={report.id}
                    className={`rounded-xl border p-4 flex items-start gap-4 transition-all ${
                      report.weekNumber === 7 ? 'border-amber bg-amber/5' : 'border-border'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      report.weekNumber === 7 ? 'bg-amber/20' : 'bg-sage/20'
                    }`}>
                      <span className="font-display font-bold text-forest text-sm">
                        {report.weekNumber === 7 ? '🏆' : `W${report.weekNumber}`}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-body font-semibold text-text">
                          {report.weekNumber === 7 ? 'Final Report' : `Week ${report.weekNumber}`}
                        </h3>
                        {!report.viewedAt && (
                          <span className="text-xs font-body font-semibold bg-forest text-white px-2 py-0.5 rounded-full">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-text-muted font-body mt-0.5">
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
                        {report.engagementNotes && (
                          <span className="text-xs font-body text-text-muted">
                            💬 {report.engagementNotes.substring(0, 60)}{report.engagementNotes.length > 60 ? '...' : ''}
                          </span>
                        )}
                      </div>
                      {report.homePractice && (
                        <div className="mt-3 p-3 rounded-lg bg-sage/10">
                          <p className="text-xs font-body font-semibold text-forest mb-1">🏠 Home Practice</p>
                          <p className="text-xs font-body text-text">{report.homePractice}</p>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleView(report)}
                      className="shrink-0 bg-forest/10 text-forest font-body text-xs font-semibold px-3 py-2 rounded-lg hover:bg-forest/20 transition-colors flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      PDF
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
