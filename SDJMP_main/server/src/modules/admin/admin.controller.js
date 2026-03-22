import { notImplemented } from '../../utils/not-implemented.js'

export function getAdminStats(req, res) {
  return notImplemented(res, 'admin', 'GET /api/admin/stats')
}

export function getAdminUsers(req, res) {
  return notImplemented(res, 'admin', 'GET /api/admin/users')
}

export function updateAdminUserStatus(req, res) {
  return notImplemented(res, 'admin', 'PUT /api/admin/users/:userId/status')
}

export function deleteAdminUser(req, res) {
  return notImplemented(res, 'admin', 'DELETE /api/admin/users/:userId')
}

export function getPendingEmployers(req, res) {
  return notImplemented(res, 'admin', 'GET /api/admin/employers/pending')
}

export function approveEmployer(req, res) {
  return notImplemented(res, 'admin', 'POST /api/admin/employers/:employerId/approve')
}

export function rejectEmployer(req, res) {
  return notImplemented(res, 'admin', 'POST /api/admin/employers/:employerId/reject')
}

export function getPendingJobs(req, res) {
  return notImplemented(res, 'admin', 'GET /api/admin/jobs/pending')
}

export function approveJob(req, res) {
  return notImplemented(res, 'admin', 'POST /api/admin/jobs/:jobId/approve')
}

export function rejectJob(req, res) {
  return notImplemented(res, 'admin', 'POST /api/admin/jobs/:jobId/reject')
}

export function getAdminAnalytics(req, res) {
  return notImplemented(res, 'admin', 'GET /api/admin/analytics')
}
