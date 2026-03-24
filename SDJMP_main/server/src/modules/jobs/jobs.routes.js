import { Router } from 'express'
import { requireAuth, requireRole } from '../../middlewares/auth.middleware.js'
import { validate } from '../../middlewares/validate.middleware.js'
import { asyncHandler } from '../../utils/async-handler.js'
import {
  createJob,
  deleteJob,
  getJobById,
  getRecommendedJobs,
  getEmployerJobs,
  listJobs,
  searchJobs,
  updateJob,
  getStudentMatches,
} from './jobs.controller.js'
import { createJobSchema, updateJobSchema } from './jobs.validation.js'

const jobsRouter = Router()

jobsRouter.get('/', asyncHandler(listJobs))
jobsRouter.get('/recommended', asyncHandler(getRecommendedJobs))
jobsRouter.get('/search', asyncHandler(searchJobs))
jobsRouter.get(
  '/my',
  requireAuth,
  requireRole(['employer', 'super_admin']),
  asyncHandler(getEmployerJobs)
)

jobsRouter.get(
  '/student/matches',
  requireAuth,
  requireRole(['student']),
  asyncHandler(getStudentMatches)
)

jobsRouter.get('/:jobId', asyncHandler(getJobById))

jobsRouter.post(
  '/',
  requireAuth,
  requireRole(['employer', 'super_admin']),
  validate(createJobSchema),
  asyncHandler(createJob)
)
jobsRouter.put(
  '/:jobId',
  requireAuth,
  requireRole(['employer', 'super_admin']),
  validate(updateJobSchema),
  asyncHandler(updateJob)
)
jobsRouter.delete(
  '/:jobId',
  requireAuth,
  requireRole(['employer', 'super_admin']),
  asyncHandler(deleteJob)
)

export default jobsRouter
