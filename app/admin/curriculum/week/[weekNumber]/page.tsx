import WeekDetail from './WeekDetail'

export function generateStaticParams() {
  return [1, 2, 3, 4, 5, 6].map((n) => ({ weekNumber: String(n) }))
}

export default function WeekPage() {
  return <WeekDetail />
}
