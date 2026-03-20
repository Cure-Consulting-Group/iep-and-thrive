import ProgramCards from '@/components/sections/ProgramCards'
import HowItWorks from '@/components/sections/HowItWorks'

export const metadata = {
  title: 'Program Details | IEP & Thrive',
  description: 'Explore our IEP-aligned summer intensive programs: Reading & Language, Full Academic, and Math & Numeracy. Small groups, evidence-based methods, 6 weeks.',
}

export default function ProgramPage() {
  return (
    <main id="main">
      <ProgramCards />
      <HowItWorks />
    </main>
  )
}
