import { Router } from 'express'
import { requireAuth } from '../../middlewares/auth.middleware.js'
import { asyncHandler } from '../../utils/async-handler.js'
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
notificationsRouter.get('/', asyncHandler(getNotifications))
notificationsRouter.put('/read-all', asyncHandler(markAllNotificationsAsRead))
notificationsRouter.get('/preferences', asyncHandler(getNotificationPreferences))
notificationsRouter.put('/preferences', asyncHandler(updateNotificationPreferences))
notificationsRouter.put('/:notificationId/read', asyncHandler(markNotificationAsRead))
notificationsRouter.delete('/:notificationId', asyncHandler(deleteNotification))

export default notificationsRouter
