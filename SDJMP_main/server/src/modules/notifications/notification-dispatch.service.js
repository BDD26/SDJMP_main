import Notification from './notification.model.js'

export async function createUserNotification({
  userId,
  type = 'system',
  title,
  message = '',
  metadata = {},
  dedupeKey = '',
}) {
  if (!userId || !title) {
    return null
  }

  if (dedupeKey) {
    const existingNotification = await Notification.findOne({
      userId,
      'metadata.dedupeKey': dedupeKey,
    })

    if (existingNotification) {
      return existingNotification
    }
  }

  return Notification.create({
    userId,
    type,
    title,
    message,
    metadata: {
      ...metadata,
      dedupeKey: dedupeKey || metadata.dedupeKey || '',
    },
  })
}
