export function serializeNotification(notificationDocument) {
  const notification = notificationDocument.toObject
    ? notificationDocument.toObject()
    : notificationDocument

  return {
    id: String(notification._id || notification.id),
    title: notification.title,
    message: notification.message || '',
    type: notification.type || 'system',
    read: Boolean(notification.read),
    timestamp: notification.createdAt || new Date().toISOString(),
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
  }
}
