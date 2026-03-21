import { Router } from 'express'
import { requireAuth } from '../../middlewares/auth.middleware.js'
import { validate } from '../../middlewares/validate.middleware.js'
import { asyncHandler } from '../../utils/async-handler.js'
import {
  changePassword,
  deleteAccount,
  getProfile,
  updateProfile,
} from './users.controller.js'
import { changePasswordSchema, updateProfileSchema } from './users.validation.js'

const usersRouter = Router()

usersRouter.use(requireAuth)
usersRouter.get('/profile', asyncHandler(getProfile))
usersRouter.put('/profile', validate(updateProfileSchema), asyncHandler(updateProfile))
usersRouter.put('/change-password', validate(changePasswordSchema), asyncHandler(changePassword))
usersRouter.delete('/account', asyncHandler(deleteAccount))

export default usersRouter
