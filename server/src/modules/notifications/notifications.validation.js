import { z } from 'zod'

export const notificationIdParamsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    notificationId: z.string().min(1),
  }),
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
})
