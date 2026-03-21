import { z } from 'zod'

export const createApplicationSchema = z.object({
  body: z.object({
    jobId: z.string().min(1),
    coverLetter: z.string().trim().default(''),
    resumeId: z.string().trim().default(''),
    notes: z.string().trim().default(''),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
})

export const updateApplicationStatusSchema = z.object({
  body: z.object({
    status: z.enum(['shortlisted', 'interview', 'rejected', 'hired', 'applied']),
    notes: z.string().trim().default(''),
    interview: z
      .object({
        date: z.string().optional(),
        time: z.string().optional(),
        location: z.string().optional(),
        type: z.string().optional(),
        notes: z.string().optional(),
      })
      .partial()
      .optional(),
  }),
  params: z.object({
    applicationId: z.string().min(1),
  }),
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
})
