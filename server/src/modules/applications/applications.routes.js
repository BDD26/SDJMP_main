import { Router } from 'express'
import { requireAuth, requireRole } from '../../middlewares/auth.middleware.js'
import { validate } from '../../middlewares/validate.middleware.js'
import { asyncHandler } from '../../utils/async-handler.js'
import {
  createApplication,
  getApplicationsForJob,
  getMyApplications,
  updateApplicationStatus,
  withdrawApplication,
} from './applications.controller.js'
import {
  createApplicationSchema,
  updateApplicationStatusSchema,
} from './applications.validation.js'

const applicationsRouter = Router()

applicationsRouter.use(requireAuth)
applicationsRouter.get('/my', requireRole(['student']), asyncHandler(getMyApplications))
applicationsRouter.get(
  '/job/:jobId',
  requireRole(['employer', 'super_admin']),
  asyncHandler(getApplicationsForJob)
)
applicationsRouter.post(
  '/',
  requireRole(['student']),
  validate(createApplicationSchema),
  asyncHandler(createApplication)
)
applicationsRouter.delete(
  '/:applicationId',
  requireRole(['student']),
  asyncHandler(withdrawApplication)
)
applicationsRouter.put(
  '/:applicationId/status',
  requireRole(['employer', 'super_admin']),
  validate(updateApplicationStatusSchema),
  asyncHandler(updateApplicationStatus)
)

export default applicationsRouter
