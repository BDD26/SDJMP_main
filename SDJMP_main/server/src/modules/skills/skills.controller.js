import { notImplemented } from '../../utils/not-implemented.js'

export function getAllSkills(req, res) {
  return notImplemented(res, 'skills', 'GET /api/skills')
}

export function getPopularSkills(req, res) {
  return notImplemented(res, 'skills', 'GET /api/skills/popular')
}

export function addSkillToProfile(req, res) {
  return notImplemented(res, 'skills', 'POST /api/skills/user')
}

export function updateSkillLevel(req, res) {
  return notImplemented(res, 'skills', 'PUT /api/skills/user/:skillId')
}

export function removeSkillFromProfile(req, res) {
  return notImplemented(res, 'skills', 'DELETE /api/skills/user/:skillId')
}
