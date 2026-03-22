import Hero from '@/components/sections/Hero'
import ProblemStrip from '@/components/sections/ProblemStrip'
import WhySection from '@/components/sections/WhySection'
import ProgramCards from '@/components/sections/ProgramCards'
import HowItWorks from '@/components/sections/HowItWorks'
import Testimonials from '@/components/sections/Testimonials'
import AboutFounder from '@/components/sections/AboutFounder'
import FAQ from '@/components/sections/FAQ'
import EnrollmentForm from '@/components/sections/EnrollmentForm'

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'IEP & Thrive',
  description:
    'An evidence-based summer intensive for students with IEPs and learning differences on Long Island.',
  url: 'https://iepandthrive.com',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Long Island',
    addressRegion: 'NY',
  },
  parentOrganization: {
    '@type': 'Organization',
    name: 'Cure Consulting Group',
  },
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
    </>
  )
}
