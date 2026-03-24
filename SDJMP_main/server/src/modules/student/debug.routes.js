import { Router } from 'express'
import { requireAuth, requireRole } from '../../middlewares/auth.middleware.js'
import { asyncHandler } from '../../utils/async-handler.js'
import { debugGetUserProfile, debugListAllUsers } from './debug.controller.js'

const debugRouter = Router()

debugRouter.use(requireAuth)

debugRouter.get('/my-profile', asyncHandler(debugGetUserProfile))
debugRouter.get('/all-users', asyncHandler(debugListAllUsers))

// Test Cloudinary configuration
debugRouter.get('/cloudinary-config', asyncHandler(async (req, res) => {
  const env = await import('../../config/env.js')
  res.status(200).json({
    hasCloudinaryConfig: Boolean(
      env.default.cloudinaryCloudName &&
      env.default.cloudinaryApiKey &&
      env.default.cloudinaryApiSecret
    ),
    cloudName: env.default.cloudinaryCloudName ? '***configured***' : 'missing',
    apiKey: env.default.cloudinaryApiKey ? '***configured***' : 'missing',
    apiSecret: env.default.cloudinaryApiSecret ? '***configured***' : 'missing'
  })
}))

export default debugRouter
