import { z } from 'zod'

export const adminUserStatusSchema = z.object({
  body: z.object({
    status: z.string().trim().min(1),
  }),
  params: z.object({
    userId: z.string().min(1),
  }),
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
})

export const adminReasonSchema = z.object({
  body: z.object({
    reason: z.string().trim().default(''),
  }),
  params: z.object({
    targetId: z.string().min(1),
  }),
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
})
