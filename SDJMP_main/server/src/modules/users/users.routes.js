import { Router } from 'express'
import { requireAuth, requireRole } from '../../middlewares/auth.middleware.js'
import { validate } from '../../middlewares/validate.middleware.js'
import { asyncHandler } from '../../utils/async-handler.js'
import {
  changePassword,
  deleteAccount,
  getProfile,
  updateProfile,
  getResumes,
  createResume,
  updateResume,
  deleteResume,
} from './users.controller.js'
import { changePasswordSchema, updateProfileSchema, createResumeSchema, updateResumeSchema } from './users.validation.js'

const usersRouter = Router()

usersRouter.use(requireAuth)
usersRouter.get('/profile', asyncHandler(getProfile))
usersRouter.put('/profile', validate(updateProfileSchema), asyncHandler(updateProfile))
usersRouter.put('/change-password', validate(changePasswordSchema), asyncHandler(changePassword))
usersRouter.delete('/account', asyncHandler(deleteAccount))

// Resume routes
usersRouter.get('/resumes', requireRole(['student']), asyncHandler(getResumes))
usersRouter.post('/resumes', requireRole(['student']), validate(createResumeSchema), asyncHandler(createResume))
usersRouter.put('/resumes/:id', requireRole(['student']), validate(updateResumeSchema), asyncHandler(updateResume))
usersRouter.delete('/resumes/:id', requireRole(['student']), asyncHandler(deleteResume))

export default usersRouter

