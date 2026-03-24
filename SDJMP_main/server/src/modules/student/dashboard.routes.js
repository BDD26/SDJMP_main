import { Router } from 'express'
import { requireAuth } from '../../middlewares/auth.middleware.js'
import { getDashboardStats, getChartData, getRecentApplications } from './dashboard.controller.js'

const router = Router()

router.use(requireAuth)

router.get('/stats', getDashboardStats)
router.get('/chart-data', getChartData)
router.get('/recent-applications', getRecentApplications)

export default router
