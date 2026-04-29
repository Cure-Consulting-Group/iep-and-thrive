import { Suspense } from 'react'
import AttendanceView from './AttendanceView'

export default function AttendancePage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-text-muted text-sm">Loading attendance…</div>}>
      <AttendanceView />
    </Suspense>
  )
}
