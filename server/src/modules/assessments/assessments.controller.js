import { notImplemented } from '../../utils/not-implemented.js'

export function getAllAssessments(req, res) {
  return notImplemented(res, 'assessments', 'GET /api/assessments')
}

export function getAssessmentById(req, res) {
  return notImplemented(res, 'assessments', 'GET /api/assessments/:assessmentId')
}

export function startAssessment(req, res) {
  return notImplemented(res, 'assessments', 'POST /api/assessments/:assessmentId/start')
}

export function submitAssessmentAnswer(req, res) {
  return notImplemented(res, 'assessments', 'POST /api/assessments/:assessmentId/answer')
}

export function completeAssessment(req, res) {
  return notImplemented(res, 'assessments', 'POST /api/assessments/:assessmentId/complete')
}

export function getAssessmentResults(req, res) {
  return notImplemented(res, 'assessments', 'GET /api/assessments/:assessmentId/results')
}

export function getMyAssessmentResults(req, res) {
  return notImplemented(res, 'assessments', 'GET /api/assessments/my-results')
}
