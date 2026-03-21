'use client'

import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  orderBy,
} from 'firebase/firestore'

// ─── Pipeline Stages ───

const PIPELINE_STAGES = [
  { key: 'inquiry', label: 'Inquiry', color: '#6B7280', bgColor: '#F9FAFB', icon: '📥' },
  { key: 'discovery', label: 'Discovery Call', color: '#3B82F6', bgColor: '#EFF6FF', icon: '📞' },
  { key: 'deposited', label: 'Deposited', color: '#D4860B', bgColor: '#FFF8EB', icon: '💳' },
  { key: 'enrolled', label: 'Enrolled', color: '#1B4332', bgColor: '#D8F3DC', icon: '✅' },
  { key: 'completed', label: 'Completed', color: '#6B21A8', bgColor: '#F5F3FF', icon: '🎓' },
] as const

type PipelineStage = (typeof PIPELINE_STAGES)[number]['key']

interface PipelineStudent {
  id: string
  childName: string
  parentName: string
  email: string
  phone?: string
  programInterest: string
  pipelineStage: PipelineStage
  childGrade?: string
  notes?: string
  updatedAt?: Date
}

export default function PipelinePage() {
  const [students, setStudents] = useState<PipelineStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [movingId, setMovingId] = useState<string | null>(null)

  // Real-time listener
  useEffect(() => {
    const q = query(
      collection(db, 'enrollmentInquiries'),
      orderBy('submittedAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: PipelineStudent[] = snapshot.docs.map((d) => {
        const raw = d.data()
        return {
          id: d.id,
          childName: raw.childName || raw.studentName || 'Student',
          parentName: raw.parentName || 'Parent',
          email: raw.email || '',
          phone: raw.phone,
          programInterest: raw.programInterest || 'Not specified',
          pipelineStage: raw.pipelineStage || 'inquiry',
          childGrade: raw.childGrade,
          notes: raw.notes,
          updatedAt: raw.updatedAt?.toDate?.(),
        }
      })
      setStudents(data)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Move student to a different stage
  const moveStudent = async (studentId: string, newStage: PipelineStage) => {
    setMovingId(studentId)
    try {
      await updateDoc(doc(db, 'enrollmentInquiries', studentId), {
        pipelineStage: newStage,
        updatedAt: new Date(),
      })
    } catch (error) {
      console.error('Error moving student:', error)
    } finally {
      setMovingId(null)
    }
  }

  // Group students by stage
  const studentsByStage = PIPELINE_STAGES.reduce(
    (acc, stage) => {
      acc[stage.key] = students.filter((s) => s.pipelineStage === stage.key)
      return acc
    },
    {} as Record<PipelineStage, PipelineStudent[]>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-text-muted font-body">Loading pipeline...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-text">Enrollment Pipeline</h1>
          <p className="text-sm text-text-muted font-body mt-1">
            {students.length} total inquirie{students.length !== 1 ? 's' : ''} · Track from inquiry to enrollment
          </p>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2" style={{ minHeight: '60vh' }}>
        {PIPELINE_STAGES.map((stage) => {
          const stageStudents = studentsByStage[stage.key] || []
          return (
            <div
              key={stage.key}
              className="flex-shrink-0 w-[280px] flex flex-col rounded-2xl"
              style={{ backgroundColor: stage.bgColor }}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
                <div className="flex items-center gap-2">
                  <span className="text-base">{stage.icon}</span>
                  <h3 className="font-body text-sm font-semibold" style={{ color: stage.color }}>
                    {stage.label}
                  </h3>
                </div>
                <span
                  className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: stage.color + '20',
                    color: stage.color,
                  }}
                >
                  {stageStudents.length}
                </span>
              </div>

              {/* Cards */}
              <div className="p-3 flex-1 space-y-3 overflow-y-auto">
                {stageStudents.length === 0 ? (
                  <div className="text-center py-8 text-text-muted text-xs font-body">
                    No students
                  </div>
                ) : (
                  stageStudents.map((student) => (
                    <StudentCard
                      key={student.id}
                      student={student}
                      currentStage={stage.key}
                      onMove={moveStudent}
                      isMoving={movingId === student.id}
                    />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Student Card ───

function StudentCard({
  student,
  currentStage,
  onMove,
  isMoving,
}: {
  student: PipelineStudent
  currentStage: PipelineStage
  onMove: (id: string, stage: PipelineStage) => void
  isMoving: boolean
}) {
  const [showMoveMenu, setShowMoveMenu] = useState(false)

  const programShort = student.programInterest.includes('Full')
    ? 'Full'
    : student.programInterest.includes('Reading')
      ? 'Reading'
      : student.programInterest.includes('Math')
        ? 'Math'
        : student.programInterest

  return (
    <div
      className={`bg-white rounded-xl p-4 border border-border/50 shadow-sm transition-all duration-200 hover:shadow-md ${
        isMoving ? 'opacity-50' : ''
      }`}
    >
      {/* Name and Program */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-body text-sm font-semibold text-text">{student.childName}</p>
          <p className="font-body text-xs text-text-muted">{student.parentName}</p>
        </div>
        <span className="text-xs bg-sage-pale text-forest px-2 py-0.5 rounded-full font-body font-medium">
          {programShort}
        </span>
      </div>

      {/* Details */}
      {student.childGrade && (
        <p className="text-xs text-text-muted font-body mb-1">
          Grade: {student.childGrade}
        </p>
      )}
      <p className="text-xs text-text-muted font-body truncate mb-3">{student.email}</p>

      {/* Move Button */}
      <div className="relative">
        <button
          onClick={() => setShowMoveMenu(!showMoveMenu)}
          className="w-full text-xs font-body font-medium text-forest bg-sage/30 hover:bg-sage/50 rounded-lg py-2 transition-colors cursor-pointer"
          disabled={isMoving}
        >
          {isMoving ? 'Moving...' : 'Move →'}
        </button>

        {showMoveMenu && (
          <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-border rounded-xl shadow-lg z-10 overflow-hidden">
            {PIPELINE_STAGES.filter((s) => s.key !== currentStage).map((stage) => (
              <button
                key={stage.key}
                onClick={() => {
                  onMove(student.id, stage.key)
                  setShowMoveMenu(false)
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-body text-text hover:bg-cream transition-colors cursor-pointer"
              >
                <span>{stage.icon}</span>
                {stage.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
