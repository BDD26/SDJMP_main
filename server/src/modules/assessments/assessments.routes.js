import { Router } from 'express'
import { requireAuth } from '../../middlewares/auth.middleware.js'
import {
  completeAssessment,
  getAllAssessments,
  getAssessmentById,
  getAssessmentResults,
  getMyAssessmentResults,
  startAssessment,
  submitAssessmentAnswer,
} from './assessments.controller.js'

const assessmentsRouter = Router()

assessmentsRouter.get('/', getAllAssessments)
assessmentsRouter.get('/my-results', requireAuth, getMyAssessmentResults)
assessmentsRouter.get('/:assessmentId', getAssessmentById)
assessmentsRouter.post('/:assessmentId/start', requireAuth, startAssessment)
assessmentsRouter.post('/:assessmentId/answer', requireAuth, submitAssessmentAnswer)
assessmentsRouter.post('/:assessmentId/complete', requireAuth, completeAssessment)
assessmentsRouter.get('/:assessmentId/results', requireAuth, getAssessmentResults)

export default assessmentsRouter
