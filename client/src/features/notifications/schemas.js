import { z } from 'zod'

export const notificationSchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform(String),
    title: z.string().default('Notification'),
    message: z.string().default(''),
    type: z.enum(['job', 'assessment', 'system']).catch('system'),
    timestamp: z.string().default(() => new Date().toISOString()),
    read: z.boolean().catch(false),
  })
  .passthrough()

export function normalizeNotifications(payload) {
  const items =
    payload?.notifications ??
    payload?.items ??
    payload?.data?.notifications ??
    payload?.data?.items ??
    payload?.data ??
    payload ??
    []

  return z.array(notificationSchema).parse(Array.isArray(items) ? items : [])
}
