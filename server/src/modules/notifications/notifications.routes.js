import { Router } from 'express'
import { requireAuth } from '../../middlewares/auth.middleware.js'
import {
  deleteNotification,
  getNotificationPreferences,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  updateNotificationPreferences,
} from './notifications.controller.js'

const notificationsRouter = Router()

notificationsRouter.use(requireAuth)
notificationsRouter.get('/', getNotifications)
notificationsRouter.put('/read-all', markAllNotificationsAsRead)
notificationsRouter.get('/preferences', getNotificationPreferences)
notificationsRouter.put('/preferences', updateNotificationPreferences)
notificationsRouter.put('/:notificationId/read', markNotificationAsRead)
notificationsRouter.delete('/:notificationId', deleteNotification)

export default notificationsRouter
