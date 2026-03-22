import Notification from './notification.model.js'
import { createHttpError } from '../../utils/http-error.js'

export async function getNotifications(req, res) {
  const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 })
  
  const formatted = notifications.map(n => ({
    id: n._id,
    title: n.title,
    message: n.message,
    type: n.type,
    timestamp: n.createdAt,
    read: n.read
  }))

  res.status(200).json(formatted)
}

export async function markNotificationAsRead(req, res) {
  const notification = await Notification.findOne({
    _id: req.params.notificationId,
    userId: req.user._id
  })

  if (!notification) throw createHttpError(404, 'Notification not found')

  notification.read = true
  await notification.save()

  res.status(200).json({ message: 'Marked as read' })
}

export async function markAllNotificationsAsRead(req, res) {
  await Notification.updateMany({ userId: req.user._id, read: false }, { read: true })
  res.status(200).json({ message: 'All marked as read' })
}

export async function deleteNotification(req, res) {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.notificationId,
    userId: req.user._id
  })

  if (!notification) throw createHttpError(404, 'Notification not found')

  res.status(200).json({ message: 'Notification deleted' })
}

export async function getNotificationPreferences(req, res) {
  res.status(200).json({ email: true, push: true })
}

export async function updateNotificationPreferences(req, res) {
  res.status(200).json({ message: 'Preferences updated' })
}
