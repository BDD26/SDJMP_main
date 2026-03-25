import { Router } from 'express'
import { requireAuth } from '../../middlewares/auth.middleware.js'
import { validate } from '../../middlewares/validate.middleware.js'
import { asyncHandler } from '../../utils/async-handler.js'
import {
  forgotPassword,
  getSession,
  login,
  logout,
  refreshSession,
  register,
  resetPassword,
  verifySession,
  verifyEmailConnection,
} from './auth.controller.js'
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from './auth.validation.js'

const authRouter = Router()

authRouter.post('/register', validate(registerSchema), asyncHandler(register))
authRouter.post('/login', validate(loginSchema), asyncHandler(login))
authRouter.post('/logout', asyncHandler(logout))
authRouter.post('/forgot-password', validate(forgotPasswordSchema), asyncHandler(forgotPassword))
authRouter.post('/reset-password', validate(resetPasswordSchema), asyncHandler(resetPassword))
authRouter.post('/refresh', requireAuth, asyncHandler(refreshSession))
authRouter.get('/verify', requireAuth, asyncHandler(verifySession))
authRouter.get('/session', requireAuth, asyncHandler(getSession))
authRouter.get('/verify-email', asyncHandler(verifyEmailConnection))

export default authRouter
