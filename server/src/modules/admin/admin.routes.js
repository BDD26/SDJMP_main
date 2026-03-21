import { Router } from 'express'
import { requireAuth, requireRole } from '../../middlewares/auth.middleware.js'
import {
  approveEmployer,
  approveJob,
  deleteAdminUser,
  getAdminAnalytics,
  getAdminStats,
  getAdminUsers,
  getPendingEmployers,
  getPendingJobs,
  rejectEmployer,
  rejectJob,
  updateAdminUserStatus,
} from './admin.controller.js'

const adminRouter = Router()

adminRouter.use(requireAuth, requireRole(['super_admin']))
adminRouter.get('/stats', getAdminStats)
adminRouter.get('/users', getAdminUsers)
adminRouter.put('/users/:userId/status', updateAdminUserStatus)
adminRouter.delete('/users/:userId', deleteAdminUser)
adminRouter.get('/employers/pending', getPendingEmployers)
adminRouter.post('/employers/:employerId/approve', approveEmployer)
adminRouter.post('/employers/:employerId/reject', rejectEmployer)
adminRouter.get('/jobs/pending', getPendingJobs)
adminRouter.post('/jobs/:jobId/approve', approveJob)
adminRouter.post('/jobs/:jobId/reject', rejectJob)
adminRouter.get('/analytics', getAdminAnalytics)

export default adminRouter
