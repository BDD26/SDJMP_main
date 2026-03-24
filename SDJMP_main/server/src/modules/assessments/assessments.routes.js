import { Router } from 'express'
import { requireAuth, requireRole } from '../../middlewares/auth.middleware.js'
import {
  completeAssessment,
  getAllAssessments,
  getAssessmentById,
  getAssessmentQuestions,
  getAssessmentResults,
  getMyAssessmentResults,
  startAssessment,
  submitAssessmentAnswer,
} from './assessments.controller.js'
import { asyncHandler } from '../../utils/async-handler.js'

const assessmentsRouter = Router()

assessmentsRouter.get('/', asyncHandler(getAllAssessments))
assessmentsRouter.get('/my-results', requireAuth, requireRole(['student']), asyncHandler(getMyAssessmentResults))
assessmentsRouter.get('/:assessmentId', asyncHandler(getAssessmentById))
assessmentsRouter.get('/:assessmentId/questions', requireAuth, requireRole(['student']), asyncHandler(getAssessmentQuestions))
assessmentsRouter.post('/:assessmentId/start', requireAuth, requireRole(['student']), asyncHandler(startAssessment))
assessmentsRouter.post('/:assessmentId/answer', requireAuth, requireRole(['student']), asyncHandler(submitAssessmentAnswer))
assessmentsRouter.post('/:assessmentId/complete', requireAuth, requireRole(['student']), asyncHandler(completeAssessment))
assessmentsRouter.get('/:assessmentId/results', requireAuth, requireRole(['student']), asyncHandler(getAssessmentResults))

export default assessmentsRouter
