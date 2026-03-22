'use client'

import { useState } from 'react'
import Link from 'next/link'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface IntakeFormData {
  // Step 1 — Student Information
  studentLegalName: string
  preferredName: string
  dateOfBirth: string
  currentGrade: string
  schoolDistrict: string
  currentSchool: string
  primaryDiagnosis: string
  additionalDiagnoses: string

  // Step 2 — IEP & Services
  hasCurrentIEP: string
  iepFile: File | null
  iepClassification: string
  relatedServices: string[]
  esyHistory: string
  currentReadingLevel: string
  currentMathLevel: string

  // Step 3 — Learning Profile
  areasOfConcern: string[]
  whatHasWorked: string
  whatHasNotWorked: string
  sensoryConsiderations: string
  behavioralTriggers: string

  // Step 4 — Medical & Safety
  allergies: string
  medications: string
  medicalConditions: string
  emergencyContact1Name: string
  emergencyContact1Relationship: string
  emergencyContact1Phone: string
  emergencyContact2Name: string
  emergencyContact2Relationship: string
  emergencyContact2Phone: string
  authorizedPickup: string
  photoVideoRelease: string

  // Step 5 — Consents
  confirmAccurate: boolean
  consentIEPReview: boolean
}

const INITIAL_DATA: IntakeFormData = {
  studentLegalName: '',
  preferredName: '',
  dateOfBirth: '',
  currentGrade: '',
  schoolDistrict: '',
  currentSchool: '',
  primaryDiagnosis: '',
  additionalDiagnoses: '',
  hasCurrentIEP: '',
  iepFile: null,
  iepClassification: '',
  relatedServices: [],
  esyHistory: '',
  currentReadingLevel: '',
  currentMathLevel: '',
  areasOfConcern: [],
  whatHasWorked: '',
  whatHasNotWorked: '',
  sensoryConsiderations: '',
  behavioralTriggers: '',
  allergies: '',
  medications: '',
  medicalConditions: '',
  emergencyContact1Name: '',
  emergencyContact1Relationship: '',
  emergencyContact1Phone: '',
  emergencyContact2Name: '',
  emergencyContact2Relationship: '',
  emergencyContact2Phone: '',
  authorizedPickup: '',
  photoVideoRelease: '',
  confirmAccurate: false,
  consentIEPReview: false,
}

/* ------------------------------------------------------------------ */
/*  Option data                                                        */
/* ------------------------------------------------------------------ */

const GRADE_OPTIONS = [
  { value: 'K', label: 'Kindergarten' },
  { value: '1st', label: '1st Grade' },
  { value: '2nd', label: '2nd Grade' },
  { value: '3rd', label: '3rd Grade' },
  { value: '4th', label: '4th Grade' },
  { value: '5th', label: '5th Grade' },
  { value: '6th', label: '6th Grade' },
]

const DIAGNOSIS_OPTIONS = [
  'Learning Disability',
  'Autism',
  'ADHD',
  'Speech/Language Impairment',
  'Emotional Disability',
  'Multiple Disabilities',
  'Other',
]

const RELATED_SERVICES_OPTIONS = [
  'Speech Therapy',
  'Occupational Therapy',
  'Physical Therapy',
  'Counseling',
  'ABA',
  'None',
]

const ESY_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'denied', label: 'Applied but denied' },
]

const AREAS_OF_CONCERN = [
  'Reading/Decoding',
  'Reading Comprehension',
  'Written Expression',
  'Math Computation',
  'Math Reasoning',
  'Executive Function',
  'Attention/Focus',
  'Social Skills',
  'Behavior',
  'Other',
]

const STEP_LABELS = [
  'Student Info',
  'IEP & Services',
  'Learning Profile',
  'Medical & Safety',
  'Review',
]

/* ------------------------------------------------------------------ */
/*  Shared input class                                                 */
/* ------------------------------------------------------------------ */

const inputClass =
  'w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text placeholder:text-text-muted/50 outline-none focus:ring-2 focus:ring-forest-mid transition-all duration-200 font-body'

const selectClass =
  'w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text outline-none focus:ring-2 focus:ring-forest-mid transition-all duration-200 appearance-none font-body'

const textareaClass =
  'w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text placeholder:text-text-muted/50 outline-none focus:ring-2 focus:ring-forest-mid transition-all duration-200 resize-none font-body'

const labelClass =
  'block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider font-body'

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function IntakePage() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<IntakeFormData>(INITIAL_DATA)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  /* helpers */
  const set = <K extends keyof IntakeFormData>(key: K, value: IntakeFormData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }))
    // Clear error on change
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  const toggleArrayItem = (key: 'relatedServices' | 'areasOfConcern', item: string) => {
    setData((prev) => {
      const arr = prev[key]
      const next = arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item]
      return { ...prev, [key]: next }
    })
  }

  /* validation per step */
  const validateStep = (s: number): boolean => {
    const errs: Record<string, string> = {}

    if (s === 1) {
      if (!data.studentLegalName.trim()) errs.studentLegalName = 'Required'
      if (!data.dateOfBirth) errs.dateOfBirth = 'Required'
      if (!data.currentGrade) errs.currentGrade = 'Required'
      if (!data.schoolDistrict.trim()) errs.schoolDistrict = 'Required'
      if (!data.currentSchool.trim()) errs.currentSchool = 'Required'
      if (!data.primaryDiagnosis) errs.primaryDiagnosis = 'Required'
    }

    if (s === 2) {
      if (!data.hasCurrentIEP) errs.hasCurrentIEP = 'Required'
      if (!data.esyHistory) errs.esyHistory = 'Required'
    }

    if (s === 3) {
      if (!data.whatHasWorked.trim()) errs.whatHasWorked = 'Required'
      if (!data.whatHasNotWorked.trim()) errs.whatHasNotWorked = 'Required'
    }

    if (s === 4) {
      if (!data.emergencyContact1Name.trim()) errs.emergencyContact1Name = 'Required'
      if (!data.emergencyContact1Relationship.trim()) errs.emergencyContact1Relationship = 'Required'
      if (!data.emergencyContact1Phone.trim()) errs.emergencyContact1Phone = 'Required'
      if (!data.emergencyContact2Name.trim()) errs.emergencyContact2Name = 'Required'
      if (!data.emergencyContact2Relationship.trim()) errs.emergencyContact2Relationship = 'Required'
      if (!data.emergencyContact2Phone.trim()) errs.emergencyContact2Phone = 'Required'
      if (!data.photoVideoRelease) errs.photoVideoRelease = 'Required'
    }

    if (s === 5) {
      if (!data.confirmAccurate) errs.confirmAccurate = 'You must confirm'
      if (!data.consentIEPReview) errs.consentIEPReview = 'You must consent'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const goNext = () => {
    if (!validateStep(step)) return
    setStep((s) => Math.min(s + 1, 5))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goBack = () => {
    setStep((s) => Math.max(s - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = () => {
    if (!validateStep(5)) return
    console.log('Intake form submitted:', data)
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /* file helpers */
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  /* ---------------------------------------------------------------- */
  /*  Success state                                                    */
  /* ---------------------------------------------------------------- */

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-sage-pale rounded-[20px] p-8 md:p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-forest flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-display text-2xl font-bold text-forest mb-2">Intake form submitted!</h2>
          <p className="text-sm font-body text-text-muted leading-relaxed mb-6">
            Thank you for completing your child&rsquo;s intake form. Our team will review the information and
            reach out if we have any questions before the program begins.
          </p>
          <Link
            href="/portal"
            className="inline-flex items-center justify-center rounded-full bg-forest text-white px-6 py-3 text-sm font-semibold font-body hover:bg-forest-mid transition-colors duration-200"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  /* ---------------------------------------------------------------- */
  /*  Step Indicator                                                   */
  /* ---------------------------------------------------------------- */

  const StepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-center">
        {STEP_LABELS.map((label, i) => {
          const num = i + 1
          const isCompleted = num < step
          const isActive = num === step
          const isUpcoming = num > step
          return (
            <div key={num} className="flex items-center">
              <div className="flex flex-col items-center">
                {/* Circle */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold font-body transition-all duration-200 ${
                    isCompleted
                      ? 'bg-sage text-forest'
                      : isActive
                        ? 'bg-forest text-white'
                        : 'bg-cream-deep text-text-muted'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    num
                  )}
                </div>
                {/* Label — hidden on mobile */}
                <span
                  className={`hidden md:block mt-1.5 text-[11px] font-body font-medium whitespace-nowrap ${
                    isActive ? 'text-forest' : isCompleted ? 'text-forest-light' : 'text-text-muted'
                  }`}
                >
                  {label}
                </span>
              </div>
              {/* Connecting line */}
              {num < 5 && (
                <div
                  className={`w-10 sm:w-16 md:w-20 h-[2px] mx-1 sm:mx-2 ${
                    num < step ? 'bg-sage' : 'bg-cream-deep'
                  }`}
                  style={{ marginTop: isUpcoming || isActive || isCompleted ? '-0.75rem' : '-0.75rem' }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )

  /* ---------------------------------------------------------------- */
  /*  Error helper                                                     */
  /* ---------------------------------------------------------------- */

  const FieldError = ({ name }: { name: string }) =>
    errors[name] ? <p className="mt-1 text-xs text-red-600 font-body">{errors[name]}</p> : null

  /* ---------------------------------------------------------------- */
  /*  Step 1 — Student Information                                     */
  /* ---------------------------------------------------------------- */

  const Step1 = () => (
    <div className="space-y-5">
      <div>
        <h3 className="font-display text-lg font-bold text-text mb-1">Student Information</h3>
        <p className="text-sm font-body text-text-muted">Basic details about your child.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Student Full Legal Name *</label>
          <input
            type="text"
            className={inputClass}
            value={data.studentLegalName}
            onChange={(e) => set('studentLegalName', e.target.value)}
            placeholder="Full legal name"
          />
          <FieldError name="studentLegalName" />
        </div>
        <div>
          <label className={labelClass}>Preferred Name / Nickname</label>
          <input
            type="text"
            className={inputClass}
            value={data.preferredName}
            onChange={(e) => set('preferredName', e.target.value)}
            placeholder="What they like to be called"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Date of Birth *</label>
          <input
            type="date"
            className={inputClass}
            value={data.dateOfBirth}
            onChange={(e) => set('dateOfBirth', e.target.value)}
          />
          <FieldError name="dateOfBirth" />
        </div>
        <div>
          <label className={labelClass}>Current Grade *</label>
          <select
            className={selectClass}
            value={data.currentGrade}
            onChange={(e) => set('currentGrade', e.target.value)}
          >
            <option value="" disabled>Select grade</option>
            {GRADE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <FieldError name="currentGrade" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>School District *</label>
          <input
            type="text"
            className={inputClass}
            value={data.schoolDistrict}
            onChange={(e) => set('schoolDistrict', e.target.value)}
            placeholder="e.g., Bellmore-Merrick UFSD"
          />
          <FieldError name="schoolDistrict" />
        </div>
        <div>
          <label className={labelClass}>Current School Name *</label>
          <input
            type="text"
            className={inputClass}
            value={data.currentSchool}
            onChange={(e) => set('currentSchool', e.target.value)}
            placeholder="School name"
          />
          <FieldError name="currentSchool" />
        </div>
      </div>

      <div>
        <label className={labelClass}>Primary Diagnosis *</label>
        <select
          className={selectClass}
          value={data.primaryDiagnosis}
          onChange={(e) => set('primaryDiagnosis', e.target.value)}
        >
          <option value="" disabled>Select diagnosis</option>
          {DIAGNOSIS_OPTIONS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <FieldError name="primaryDiagnosis" />
      </div>

      <div>
        <label className={labelClass}>Additional Diagnoses</label>
        <textarea
          className={textareaClass}
          rows={3}
          value={data.additionalDiagnoses}
          onChange={(e) => set('additionalDiagnoses', e.target.value)}
          placeholder="List any additional diagnoses (optional)"
        />
      </div>
    </div>
  )

  /* ---------------------------------------------------------------- */
  /*  Step 2 — IEP & Services                                         */
  /* ---------------------------------------------------------------- */

  const Step2 = () => (
    <div className="space-y-5">
      <div>
        <h3 className="font-display text-lg font-bold text-text mb-1">IEP & Services</h3>
        <p className="text-sm font-body text-text-muted">Tell us about your child&rsquo;s current IEP and related services.</p>
      </div>

      {/* Has current IEP */}
      <div>
        <label className={labelClass}>Has Current IEP? *</label>
        <div className="flex gap-4 mt-1">
          {['Yes', 'No'].map((val) => (
            <label key={val} className="flex items-center gap-2 cursor-pointer font-body text-sm text-text">
              <input
                type="radio"
                name="hasCurrentIEP"
                value={val}
                checked={data.hasCurrentIEP === val}
                onChange={(e) => set('hasCurrentIEP', e.target.value)}
                className="w-4 h-4 text-forest accent-forest"
              />
              {val}
            </label>
          ))}
        </div>
        <FieldError name="hasCurrentIEP" />
      </div>

      {/* IEP upload — only if yes */}
      {data.hasCurrentIEP === 'Yes' && (
        <div>
          <label className={labelClass}>Upload IEP Document</label>
          <div className="mt-1">
            {data.iepFile ? (
              <div className="flex items-center gap-3 rounded-xl border border-sage bg-sage-pale/30 px-4 py-3">
                <svg className="w-5 h-5 text-forest-light flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body font-medium text-text truncate">{data.iepFile.name}</p>
                  <p className="text-xs font-body text-text-muted">{formatFileSize(data.iepFile.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => set('iepFile', null)}
                  className="text-text-muted hover:text-red-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border hover:border-forest-light px-4 py-6 cursor-pointer transition-colors duration-200">
                <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                </svg>
                <span className="text-sm font-body text-text-muted">Click to upload PDF (max 10MB)</span>
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      if (file.size > 10 * 1024 * 1024) {
                        alert('File must be under 10MB')
                        return
                      }
                      set('iepFile', file)
                    }
                  }}
                />
              </label>
            )}
          </div>
        </div>
      )}

      {/* Classification */}
      <div>
        <label className={labelClass}>Classification on IEP</label>
        <input
          type="text"
          className={inputClass}
          value={data.iepClassification}
          onChange={(e) => set('iepClassification', e.target.value)}
          placeholder="e.g., Learning Disability, Other Health Impairment"
        />
      </div>

      {/* Related services */}
      <div>
        <label className={labelClass}>Related Services</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
          {RELATED_SERVICES_OPTIONS.map((svc) => {
            const checked = data.relatedServices.includes(svc)
            return (
              <label
                key={svc}
                className="flex items-center gap-2 cursor-pointer font-body text-sm text-text"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleArrayItem('relatedServices', svc)}
                  className="w-4 h-4 rounded accent-forest text-forest"
                />
                {svc}
              </label>
            )
          })}
        </div>
      </div>

      {/* ESY History */}
      <div>
        <label className={labelClass}>Extended School Year (ESY) History *</label>
        <div className="flex flex-wrap gap-4 mt-1">
          {ESY_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer font-body text-sm text-text">
              <input
                type="radio"
                name="esyHistory"
                value={opt.value}
                checked={data.esyHistory === opt.value}
                onChange={(e) => set('esyHistory', e.target.value)}
                className="w-4 h-4 text-forest accent-forest"
              />
              {opt.label}
            </label>
          ))}
        </div>
        <FieldError name="esyHistory" />
      </div>

      {/* Academic levels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Current Reading Level</label>
          <input
            type="text"
            className={inputClass}
            value={data.currentReadingLevel}
            onChange={(e) => set('currentReadingLevel', e.target.value)}
            placeholder='e.g., "DRA 16" or "Grade 1"'
          />
        </div>
        <div>
          <label className={labelClass}>Current Math Level</label>
          <input
            type="text"
            className={inputClass}
            value={data.currentMathLevel}
            onChange={(e) => set('currentMathLevel', e.target.value)}
            placeholder='e.g., "Below grade level" or "Grade 2"'
          />
        </div>
      </div>
    </div>
  )

  /* ---------------------------------------------------------------- */
  /*  Step 3 — Learning Profile                                        */
  /* ---------------------------------------------------------------- */

  const Step3 = () => (
    <div className="space-y-5">
      <div>
        <h3 className="font-display text-lg font-bold text-text mb-1">Learning Profile</h3>
        <p className="text-sm font-body text-text-muted">Help us understand how your child learns best.</p>
      </div>

      {/* Areas of concern — pill selector */}
      <div>
        <label className={labelClass}>Areas of Concern</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {AREAS_OF_CONCERN.map((area) => {
            const selected = data.areasOfConcern.includes(area)
            return (
              <button
                key={area}
                type="button"
                onClick={() => toggleArrayItem('areasOfConcern', area)}
                className={`rounded-full px-4 py-2 text-sm font-body font-medium cursor-pointer transition-all duration-200 ${
                  selected
                    ? 'bg-forest text-white'
                    : 'bg-sage-pale text-text hover:bg-sage'
                }`}
              >
                {area}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label className={labelClass}>What has worked well? *</label>
        <textarea
          className={textareaClass}
          rows={4}
          value={data.whatHasWorked}
          onChange={(e) => set('whatHasWorked', e.target.value)}
          placeholder="Describe strategies, approaches, or environments where your child has thrived..."
        />
        <FieldError name="whatHasWorked" />
      </div>

      <div>
        <label className={labelClass}>What has NOT worked? *</label>
        <textarea
          className={textareaClass}
          rows={4}
          value={data.whatHasNotWorked}
          onChange={(e) => set('whatHasNotWorked', e.target.value)}
          placeholder="Describe approaches or environments that have been challenging..."
        />
        <FieldError name="whatHasNotWorked" />
      </div>

      <div>
        <label className={labelClass}>Sensory Considerations</label>
        <textarea
          className={textareaClass}
          rows={3}
          value={data.sensoryConsiderations}
          onChange={(e) => set('sensoryConsiderations', e.target.value)}
          placeholder="Any sensory sensitivities or needs we should be aware of (optional)"
        />
      </div>

      <div>
        <label className={labelClass}>Behavioral Triggers / De-escalation Strategies</label>
        <textarea
          className={textareaClass}
          rows={3}
          value={data.behavioralTriggers}
          onChange={(e) => set('behavioralTriggers', e.target.value)}
          placeholder="What triggers frustration? What helps calm your child? (optional)"
        />
      </div>
    </div>
  )

  /* ---------------------------------------------------------------- */
  /*  Step 4 — Medical & Safety                                        */
  /* ---------------------------------------------------------------- */

  const Step4 = () => (
    <div className="space-y-5">
      <div>
        <h3 className="font-display text-lg font-bold text-text mb-1">Medical & Safety</h3>
        <p className="text-sm font-body text-text-muted">Important health and emergency contact information.</p>
      </div>

      <div>
        <label className={labelClass}>Allergies</label>
        <textarea
          className={textareaClass}
          rows={2}
          value={data.allergies}
          onChange={(e) => set('allergies', e.target.value)}
          placeholder="List any allergies (food, environmental, medication) — or 'None'"
        />
      </div>

      <div>
        <label className={labelClass}>Medications During Program Hours</label>
        <textarea
          className={textareaClass}
          rows={2}
          value={data.medications}
          onChange={(e) => set('medications', e.target.value)}
          placeholder="List medications your child takes during program hours, including dosage and timing (optional)"
        />
      </div>

      <div>
        <label className={labelClass}>Medical Conditions</label>
        <textarea
          className={textareaClass}
          rows={2}
          value={data.medicalConditions}
          onChange={(e) => set('medicalConditions', e.target.value)}
          placeholder="Any medical conditions we should know about (optional)"
        />
      </div>

      {/* Divider */}
      <div className="border-t border-border pt-5">
        <h4 className="font-display text-base font-bold text-text mb-4">Emergency Contacts</h4>
      </div>

      {/* Emergency Contact 1 */}
      <div className="rounded-xl bg-cream-deep/50 p-4 space-y-4">
        <p className="text-xs font-semibold text-forest-light uppercase tracking-wider font-body">Emergency Contact 1</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Full Name *</label>
            <input
              type="text"
              className={inputClass}
              value={data.emergencyContact1Name}
              onChange={(e) => set('emergencyContact1Name', e.target.value)}
              placeholder="Full name"
            />
            <FieldError name="emergencyContact1Name" />
          </div>
          <div>
            <label className={labelClass}>Relationship *</label>
            <input
              type="text"
              className={inputClass}
              value={data.emergencyContact1Relationship}
              onChange={(e) => set('emergencyContact1Relationship', e.target.value)}
              placeholder="e.g., Mother, Father"
            />
            <FieldError name="emergencyContact1Relationship" />
          </div>
          <div>
            <label className={labelClass}>Phone *</label>
            <input
              type="tel"
              className={inputClass}
              value={data.emergencyContact1Phone}
              onChange={(e) => set('emergencyContact1Phone', e.target.value)}
              placeholder="(555) 000-0000"
            />
            <FieldError name="emergencyContact1Phone" />
          </div>
        </div>
      </div>

      {/* Emergency Contact 2 */}
      <div className="rounded-xl bg-cream-deep/50 p-4 space-y-4">
        <p className="text-xs font-semibold text-forest-light uppercase tracking-wider font-body">Emergency Contact 2</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Full Name *</label>
            <input
              type="text"
              className={inputClass}
              value={data.emergencyContact2Name}
              onChange={(e) => set('emergencyContact2Name', e.target.value)}
              placeholder="Full name"
            />
            <FieldError name="emergencyContact2Name" />
          </div>
          <div>
            <label className={labelClass}>Relationship *</label>
            <input
              type="text"
              className={inputClass}
              value={data.emergencyContact2Relationship}
              onChange={(e) => set('emergencyContact2Relationship', e.target.value)}
              placeholder="e.g., Grandmother, Aunt"
            />
            <FieldError name="emergencyContact2Relationship" />
          </div>
          <div>
            <label className={labelClass}>Phone *</label>
            <input
              type="tel"
              className={inputClass}
              value={data.emergencyContact2Phone}
              onChange={(e) => set('emergencyContact2Phone', e.target.value)}
              placeholder="(555) 000-0000"
            />
            <FieldError name="emergencyContact2Phone" />
          </div>
        </div>
      </div>

      {/* Authorized pickup */}
      <div>
        <label className={labelClass}>Authorized Pickup Persons</label>
        <textarea
          className={textareaClass}
          rows={2}
          value={data.authorizedPickup}
          onChange={(e) => set('authorizedPickup', e.target.value)}
          placeholder="List full names, separated by commas"
        />
      </div>

      {/* Photo/video release */}
      <div>
        <label className={labelClass}>Photo/Video Release *</label>
        <p className="text-xs font-body text-text-muted mb-2">
          Do you consent to your child being photographed or recorded for program use (e.g., progress documentation, social media)?
        </p>
        <div className="flex gap-4">
          {['Yes', 'No'].map((val) => (
            <label key={val} className="flex items-center gap-2 cursor-pointer font-body text-sm text-text">
              <input
                type="radio"
                name="photoVideoRelease"
                value={val}
                checked={data.photoVideoRelease === val}
                onChange={(e) => set('photoVideoRelease', e.target.value)}
                className="w-4 h-4 text-forest accent-forest"
              />
              {val}
            </label>
          ))}
        </div>
        <FieldError name="photoVideoRelease" />
      </div>
    </div>
  )

  /* ---------------------------------------------------------------- */
  /*  Step 5 — Review & Submit                                         */
  /* ---------------------------------------------------------------- */

  const ReviewField = ({ label, value }: { label: string; value: string | undefined }) => {
    if (!value) return null
    return (
      <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2">
        <span className="text-xs font-body font-semibold text-text-muted uppercase tracking-wider shrink-0 w-44">
          {label}
        </span>
        <span className="text-sm font-body text-text">{value}</span>
      </div>
    )
  }

  const Step5 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-lg font-bold text-text mb-1">Review & Submit</h3>
        <p className="text-sm font-body text-text-muted">Please review all information before submitting.</p>
      </div>

      {/* Student Info */}
      <div className="bg-cream-deep rounded-[16px] p-5 space-y-2.5">
        <h4 className="font-display text-sm font-bold text-forest mb-3">Student Information</h4>
        <ReviewField label="Legal Name" value={data.studentLegalName} />
        <ReviewField label="Preferred Name" value={data.preferredName} />
        <ReviewField label="Date of Birth" value={data.dateOfBirth} />
        <ReviewField label="Grade" value={GRADE_OPTIONS.find((g) => g.value === data.currentGrade)?.label} />
        <ReviewField label="School District" value={data.schoolDistrict} />
        <ReviewField label="School" value={data.currentSchool} />
        <ReviewField label="Primary Diagnosis" value={data.primaryDiagnosis} />
        <ReviewField label="Additional Diagnoses" value={data.additionalDiagnoses} />
      </div>

      {/* IEP & Services */}
      <div className="bg-cream-deep rounded-[16px] p-5 space-y-2.5">
        <h4 className="font-display text-sm font-bold text-forest mb-3">IEP & Services</h4>
        <ReviewField label="Has Current IEP" value={data.hasCurrentIEP} />
        {data.iepFile && (
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2">
            <span className="text-xs font-body font-semibold text-text-muted uppercase tracking-wider shrink-0 w-44">
              IEP Document
            </span>
            <span className="text-sm font-body text-text">
              {data.iepFile.name} ({formatFileSize(data.iepFile.size)})
            </span>
          </div>
        )}
        <ReviewField label="Classification" value={data.iepClassification} />
        {data.relatedServices.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2">
            <span className="text-xs font-body font-semibold text-text-muted uppercase tracking-wider shrink-0 w-44">
              Related Services
            </span>
            <span className="text-sm font-body text-text">{data.relatedServices.join(', ')}</span>
          </div>
        )}
        <ReviewField
          label="ESY History"
          value={ESY_OPTIONS.find((e) => e.value === data.esyHistory)?.label}
        />
        <ReviewField label="Reading Level" value={data.currentReadingLevel} />
        <ReviewField label="Math Level" value={data.currentMathLevel} />
      </div>

      {/* Learning Profile */}
      <div className="bg-cream-deep rounded-[16px] p-5 space-y-2.5">
        <h4 className="font-display text-sm font-bold text-forest mb-3">Learning Profile</h4>
        {data.areasOfConcern.length > 0 && (
          <div>
            <span className="text-xs font-body font-semibold text-text-muted uppercase tracking-wider block mb-1.5">
              Areas of Concern
            </span>
            <div className="flex flex-wrap gap-1.5">
              {data.areasOfConcern.map((area) => (
                <span
                  key={area}
                  className="bg-sage-pale text-text text-xs font-body font-medium rounded-full px-3 py-1"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}
        <ReviewField label="What Has Worked" value={data.whatHasWorked} />
        <ReviewField label="What Has Not Worked" value={data.whatHasNotWorked} />
        <ReviewField label="Sensory Considerations" value={data.sensoryConsiderations} />
        <ReviewField label="Behavioral Triggers" value={data.behavioralTriggers} />
      </div>

      {/* Medical & Safety */}
      <div className="bg-cream-deep rounded-[16px] p-5 space-y-2.5">
        <h4 className="font-display text-sm font-bold text-forest mb-3">Medical & Safety</h4>
        <ReviewField label="Allergies" value={data.allergies} />
        <ReviewField label="Medications" value={data.medications} />
        <ReviewField label="Medical Conditions" value={data.medicalConditions} />
        <ReviewField
          label="Emergency Contact 1"
          value={`${data.emergencyContact1Name} (${data.emergencyContact1Relationship}) — ${data.emergencyContact1Phone}`}
        />
        <ReviewField
          label="Emergency Contact 2"
          value={`${data.emergencyContact2Name} (${data.emergencyContact2Relationship}) — ${data.emergencyContact2Phone}`}
        />
        <ReviewField label="Authorized Pickup" value={data.authorizedPickup} />
        <ReviewField label="Photo/Video Release" value={data.photoVideoRelease} />
      </div>

      {/* Consent checkboxes */}
      <div className="space-y-3 pt-2">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.confirmAccurate}
            onChange={(e) => set('confirmAccurate', e.target.checked)}
            className="w-4 h-4 rounded accent-forest text-forest mt-0.5"
          />
          <span className="text-sm font-body text-text leading-relaxed">
            I confirm this information is accurate and complete.
          </span>
        </label>
        <FieldError name="confirmAccurate" />

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.consentIEPReview}
            onChange={(e) => set('consentIEPReview', e.target.checked)}
            className="w-4 h-4 rounded accent-forest text-forest mt-0.5"
          />
          <span className="text-sm font-body text-text leading-relaxed">
            I consent to IEP &amp; Thrive reviewing my child&rsquo;s IEP for program planning purposes.
          </span>
        </label>
        <FieldError name="consentIEPReview" />
      </div>
    </div>
  )

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  const renderStep = () => {
    switch (step) {
      case 1: return <Step1 />
      case 2: return <Step2 />
      case 3: return <Step3 />
      case 4: return <Step4 />
      case 5: return <Step5 />
      default: return null
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-2">
      {/* Page header */}
      <div className="mb-6">
        <Link href="/portal" className="text-sm font-body text-text-muted hover:text-forest transition-colors inline-flex items-center gap-1 mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
        <h1 className="font-display text-2xl font-bold text-forest">Parent Intake Form</h1>
        <p className="text-sm font-body text-text-muted mt-1">
          Complete this form before the program begins so we can best support your child.
        </p>
      </div>

      {/* Step indicator */}
      <StepIndicator />

      {/* Form card */}
      <div className="bg-white rounded-[20px] p-8 md:p-10 shadow-sm">
        {renderStep()}

        {/* Navigation buttons */}
        <div className={`flex ${step === 1 ? 'justify-end' : 'justify-between'} mt-8 pt-6 border-t border-border`}>
          {step > 1 && (
            <button
              type="button"
              onClick={goBack}
              className="rounded-full border-2 border-forest text-forest px-6 py-3 text-sm font-semibold font-body hover:bg-forest hover:text-white transition-all duration-200 cursor-pointer"
            >
              Back
            </button>
          )}
          {step < 5 ? (
            <button
              type="button"
              onClick={goNext}
              className="rounded-full bg-forest text-white px-6 py-3 text-sm font-semibold font-body hover:bg-forest-mid transition-colors duration-200 cursor-pointer"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-full bg-forest text-white px-6 py-3 text-sm font-semibold font-body hover:bg-forest-mid transition-colors duration-200 cursor-pointer"
            >
              Submit Intake Form &rarr;
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
