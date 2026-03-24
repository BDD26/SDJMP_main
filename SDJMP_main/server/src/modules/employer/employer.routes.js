import { Router } from 'express'
import { requireAuth, requireRole } from '../../middlewares/auth.middleware.js'
import {
  getEmployerApplicants,
  getEmployerCompanyProfile,
  getEmployerInterviews,
  getEmployerStats,
  scheduleEmployerInterview,
  updateEmployerCompanyProfile,
} from './employer.controller.js'

const employerRouter = Router()

employerRouter.use(requireAuth, requireRole(['employer', 'super_admin']))
employerRouter.get('/company', getEmployerCompanyProfile)
employerRouter.put('/company', updateEmployerCompanyProfile)
employerRouter.get('/stats', getEmployerStats)
employerRouter.get('/applicants/:jobId', getEmployerApplicants)
employerRouter.get('/interviews', getEmployerInterviews)
employerRouter.post('/interview/:applicationId', scheduleEmployerInterview)

export default employerRouter
