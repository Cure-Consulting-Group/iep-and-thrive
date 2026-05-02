import { z } from 'zod'

export const enrollmentSchema = z.object({
  parentName: z
    .string()
    .min(2, 'Name must be at least 2 characters'),
  email: z
    .string()
    .email('Please enter a valid email address'),
  phone: z
    .string()
    .min(10, 'Please enter a valid phone number'),
  childGrade: z
    .string()
    .min(1, 'Please select a grade'),
  programInterest: z
    .string()
    .min(1, 'Please select a program'),
  learningChallenge: z
    .string()
    .min(1, 'Please select a learning challenge'),
  notes: z
    .string()
    .optional(),
})

export type EnrollmentFormData = z.infer<typeof enrollmentSchema>

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters'),
  email: z
    .string()
    .email('Please enter a valid email address'),
  phone: z
    .string()
    .optional(),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters'),
  type: z.enum(['general', 'iep-review', 'discovery-call']),
})

export type ContactFormData = z.infer<typeof contactSchema>

// E3 — Enrollment Agreement e-signature submission.
// Mirrors functions/src/e-signature/index.ts request body validation.
export const signedAgreementSchema = z.object({
  inquiryId: z.string().min(1),
  documentVersion: z.string().min(1),
  documentHash: z.string().regex(/^[a-f0-9]{64}$/i, "documentHash must be sha256 hex"),
  documentText: z.string().min(50),
  signatureDataUrl: z
    .string()
    .regex(/^data:image\/png;base64,/i, "signatureDataUrl must be a base64 PNG data URL"),
  typedName: z.string().min(2, "Please type your full printed name"),
  electronicConsent: z.literal(true, { message: "You must consent to do business electronically." }),
  parentName: z.string().min(2),
  studentName: z.string().optional(),
  programTrack: z.enum(["full", "reading", "math"]),
})

export type SignedAgreementFormData = z.infer<typeof signedAgreementSchema>
