import Hero from '@/components/sections/Hero'
import ProblemStrip from '@/components/sections/ProblemStrip'
import WhySection from '@/components/sections/WhySection'
import ProgramCards from '@/components/sections/ProgramCards'
import HowItWorks from '@/components/sections/HowItWorks'
import Testimonials from '@/components/sections/Testimonials'
import AboutFounder from '@/components/sections/AboutFounder'
import FAQ from '@/components/sections/FAQ'
import EnrollmentForm from '@/components/sections/EnrollmentForm'

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <ProblemStrip />
      <WhySection />
      <ProgramCards />
      <HowItWorks />
      <Testimonials />
      <AboutFounder />
      <FAQ />
      <EnrollmentForm />
    </main>
  )
}
