import { notImplemented } from '../../utils/not-implemented.js'

export function getNotifications(req, res) {
  return notImplemented(res, 'notifications', 'GET /api/notifications')
}

export function markNotificationAsRead(req, res) {
  return notImplemented(res, 'notifications', 'PUT /api/notifications/:notificationId/read')
}

export function markAllNotificationsAsRead(req, res) {
  return notImplemented(res, 'notifications', 'PUT /api/notifications/read-all')
}

export function deleteNotification(req, res) {
  return notImplemented(res, 'notifications', 'DELETE /api/notifications/:notificationId')
}

export function getNotificationPreferences(req, res) {
  return notImplemented(res, 'notifications', 'GET /api/notifications/preferences')
}

export function updateNotificationPreferences(req, res) {
  return notImplemented(res, 'notifications', 'PUT /api/notifications/preferences')
}
