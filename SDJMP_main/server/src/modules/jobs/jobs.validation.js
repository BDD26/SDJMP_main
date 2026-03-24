import { z } from 'zod'

const deadlineSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === '' || /^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isNaN(Date.parse(value)),
    'Invalid deadline format'
  )

const jobBodySchema = z.object({
  title: z.string().trim().min(2),
  companyName: z.string().trim().min(2).optional(),
  location: z.string().trim().default(''),
  type: z.enum(['full-time', 'part-time', 'internship', 'contract']).default('full-time'),
  salary: z.string().trim().default(''),
  description: z.string().trim().default(''),
  skills: z.array(z.string().trim()).default([]),
  skillRequirements: z.array(
    z.object({
      name: z.string().trim(),
      weight: z.number().min(0).max(100).default(10),
      level: z.string().trim().default('Intermediate')
    })
  ).default([]),
  requirements: z.array(z.string().trim()).default([]),
  deadline: deadlineSchema.optional(),
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
