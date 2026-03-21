import { z } from 'zod'
import { APP_ROLES } from '@/app/roles'

const roleSchema = z.enum([
  APP_ROLES.STUDENT,
  APP_ROLES.EMPLOYER,
  APP_ROLES.SUPER_ADMIN,
])

export const sessionUserSchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform(String),
    name: z.string().min(1).catch('User'),
    email: z.string().optional().nullable().transform((value) => value || ''),
    role: roleSchema,
    avatar: z.string().optional().nullable().transform((value) => value || ''),
    profile: z.record(z.any()).optional(),
    company: z.record(z.any()).optional(),
  })
  .passthrough()

function unwrapUserPayload(payload) {
  return payload?.user ?? payload?.data?.user ?? payload?.data ?? payload ?? null
}

export function normalizeSessionUser(payload) {
  const user = unwrapUserPayload(payload)

  if (!user) {
    return null
  }

  return sessionUserSchema.parse(user)
}
