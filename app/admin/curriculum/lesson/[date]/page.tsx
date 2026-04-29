import { notFound } from 'next/navigation'
import { loadLessonByDate, PROGRAM_SCHEDULE } from '@/lib/curriculum-lessons'
import LessonDayView from './LessonDayView'

export function generateStaticParams() {
  return PROGRAM_SCHEDULE.map((m) => ({ date: m.date }))
}

export default function LessonPage({ params }: { params: { date: string } }) {
  const lesson = loadLessonByDate(params.date)
  if (!lesson) notFound()
  return <LessonDayView lesson={lesson} />
}
