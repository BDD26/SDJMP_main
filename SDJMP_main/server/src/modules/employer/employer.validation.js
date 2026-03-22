import { z } from 'zod'

export const employerCompanySchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).optional(),
    industry: z.string().trim().optional(),
    size: z.string().trim().optional(),
    location: z.string().trim().optional(),
    website: z.string().trim().optional(),
    description: z.string().trim().optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
})

export const employerApplicantParamsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    jobId: z.string().min(1),
  }),
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
})
