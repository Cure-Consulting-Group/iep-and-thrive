import EnrollmentForm from '@/components/sections/EnrollmentForm'

export const metadata = {
  title: 'Enroll | IEP & Thrive',
  description: 'Reserve your child\'s spot in the IEP & Thrive SPED summer intensive. Cohorts limited to 6 students. Submit your enrollment inquiry today.',
}

export default function EnrollPage() {
  return (
    <main id="main">
      <EnrollmentForm />
    </main>
  )
}
