import { loadMaterialsForWeek } from '@/lib/curriculum-lessons'
import { weekModules } from '@/lib/curriculum-data'
import MaterialsView from './MaterialsView'

export function generateStaticParams() {
  return [1, 2, 3, 4, 5, 6].map((n) => ({ weekNumber: String(n) }))
}

export default function MaterialsPage({ params }: { params: { weekNumber: string } }) {
  const weekNumber = parseInt(params.weekNumber, 10)
  const materials = loadMaterialsForWeek(weekNumber)
  const weekMeta = weekModules.find((w) => w.week === weekNumber) ?? null

  return (
    <MaterialsView
      weekNumber={weekNumber}
      materials={materials}
      weekTitle={weekMeta?.title ?? `Week ${weekNumber}`}
      weekDates={weekMeta?.dates ?? ''}
      weekTheme={weekMeta?.theme ?? ''}
    />
  )
}
