import { z } from 'zod'

export const assessmentIdParamsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    assessmentId: z.string().min(1),
  }),
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
})
