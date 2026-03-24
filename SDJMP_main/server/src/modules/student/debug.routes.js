import { Router } from 'express'
import { requireAuth, requireRole } from '../../middlewares/auth.middleware.js'
import { asyncHandler } from '../../utils/async-handler.js'
import { debugGetUserProfile, debugListAllUsers } from './debug.controller.js'

const debugRouter = Router()

debugRouter.use(requireAuth)

debugRouter.get('/my-profile', asyncHandler(debugGetUserProfile))
debugRouter.get('/all-users', requireRole(['super_admin']), asyncHandler(debugListAllUsers))

export default debugRouter
