import { z } from 'zod'

const jobBodySchema = z.object({
  title: z.string().trim().min(2),
  companyName: z.string().trim().min(2),
  location: z.string().trim().default(''),
  type: z.enum(['full-time', 'part-time', 'internship', 'contract']).default('full-time'),
  salary: z.string().trim().default(''),
  description: z.string().trim().default(''),
  skills: z.array(z.string().trim()).default([]),
  requirements: z.array(z.string().trim()).default([]),
  deadline: z.string().datetime().or(z.literal('')).optional(),
  status: z.enum(['draft', 'published', 'closed']).default('published'),
})

export const createJobSchema = z.object({
  body: jobBodySchema,
  params: z.object({}).optional(),
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
})

export const updateJobSchema = z.object({
  body: jobBodySchema.partial(),
  params: z.object({
    jobId: z.string().min(1),
  }),
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
})
