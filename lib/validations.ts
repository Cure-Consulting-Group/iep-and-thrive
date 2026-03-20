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
