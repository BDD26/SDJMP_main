import { notImplemented } from '../../utils/not-implemented.js'

export function getEmployerCompanyProfile(req, res) {
  return notImplemented(res, 'employer', 'GET /api/employer/company')
}

export function updateEmployerCompanyProfile(req, res) {
  return notImplemented(res, 'employer', 'PUT /api/employer/company')
}

export function getEmployerStats(req, res) {
  return notImplemented(res, 'employer', 'GET /api/employer/stats')
}

export function getEmployerApplicants(req, res) {
  return notImplemented(res, 'employer', 'GET /api/employer/applicants/:jobId')
}

export function scheduleEmployerInterview(req, res) {
  return notImplemented(res, 'employer', 'POST /api/employer/interview/:applicationId')
}
