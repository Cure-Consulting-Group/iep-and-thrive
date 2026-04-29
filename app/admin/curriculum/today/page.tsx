import { loadAllLessons } from '@/lib/curriculum-lessons'
import TodayView from './TodayView'

export default function TodayPage() {
  const lessons = loadAllLessons()
  return <TodayView lessons={lessons} />
}
