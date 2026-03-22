import { z } from 'zod'

export const upsertSkillSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1),
    category: z.string().trim().default('general'),
    description: z.string().trim().default(''),
    popularity: z.number().int().nonnegative().default(0),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
  cookies: z.object({}).optional(),
})
