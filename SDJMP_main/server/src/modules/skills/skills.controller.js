import User from '../users/user.model.js'
import { createHttpError } from '../../utils/http-error.js'
import { mergeSkillsIntoUserProfile, normalizeSkillPayload } from './skill-inventory.service.js'
import { notifyStudentForAllPublishedJobs } from '../jobs/job-match.pipeline.js'

export async function getAllSkills(req, res) {
  const users = await User.find({ role: 'student' }).select('profile.skills').lean()
  const names = new Set()

  for (const user of users) {
    for (const skill of user.profile?.skills || []) {
      const name = String(skill?.name || '').trim()
      if (name) names.add(name)
    }
  }

  const skills = Array.from(names)
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({ name, category: 'user-profile' }))

  res.status(200).json(skills)
}

export async function getPopularSkills(req, res) {
  const rows = await User.aggregate([
    { $unwind: { path: '$profile.skills', preserveNullAndEmptyArrays: false } },
    { $match: { 'profile.skills.name': { $type: 'string', $ne: '' } } },
    { $group: { _id: { $toLower: '$profile.skills.name' }, count: { $sum: 1 }, sample: { $first: '$profile.skills.name' } } },
    { $sort: { count: -1, sample: 1 } },
    { $limit: 12 },
  ])

  const skills = rows.map((row) => ({
    name: row.sample,
    popularity: row.count,
    category: 'user-profile',
  }))

  res.status(200).json(skills)
}

export async function addSkillToProfile(req, res) {
  if (req.user.role !== 'student') {
    throw createHttpError(403, 'Only students can manage profile skills')
  }

  const user = await User.findById(req.user._id)
  if (!user) {
    throw createHttpError(404, 'User not found')
  }

  const skill = normalizeSkillPayload(req.body, { verified: false })
  const result = await mergeSkillsIntoUserProfile(user, [skill], {
    category: req.body.category || 'manual',
    verified: false,
  })

  await notifyStudentForAllPublishedJobs(user._id)

  res.status(200).json({
    message: 'Skill added to profile',
    addedSkills: result.addedSkills,
    updatedSkills: result.updatedSkills,
    skills: user.profile.skills,
  })
}

export async function updateSkillLevel(req, res) {
  if (req.user.role !== 'student') {
    throw createHttpError(403, 'Only students can manage profile skills')
  }

  const user = await User.findById(req.user._id)
  if (!user) {
    throw createHttpError(404, 'User not found')
  }

  const skillName = req.params.skillId
  const currentSkill = (user.profile?.skills || []).find(
    (skill) => String(skill.name || '').toLowerCase() === String(skillName || '').toLowerCase()
  )

  if (!currentSkill) {
    throw createHttpError(404, 'Skill not found in user profile')
  }

  const result = await mergeSkillsIntoUserProfile(
    user,
    [
      {
        name: currentSkill.name,
        level: req.body.level || currentSkill.level,
        years: req.body.years ?? currentSkill.years,
        verified: req.body.verified ?? currentSkill.verified,
      },
    ],
    {
      category: 'manual',
    }
  )

  await notifyStudentForAllPublishedJobs(user._id)

  res.status(200).json({
    message: 'Skill updated',
    updatedSkills: result.updatedSkills,
    skills: user.profile.skills,
  })
}

export async function removeSkillFromProfile(req, res) {
  if (req.user.role !== 'student') {
    throw createHttpError(403, 'Only students can manage profile skills')
  }

  const user = await User.findById(req.user._id)
  if (!user) {
    throw createHttpError(404, 'User not found')
  }

  const nextSkills = (user.profile?.skills || []).filter(
    (skill) => String(skill.name || '').toLowerCase() !== String(req.params.skillId || '').toLowerCase()
  )

  if (nextSkills.length === (user.profile?.skills || []).length) {
    throw createHttpError(404, 'Skill not found in user profile')
  }

  user.profile = user.profile || {}
  user.profile.skills = nextSkills
  user.markModified('profile.skills')
  await user.save()

  res.status(200).json({
    message: 'Skill removed from profile',
    skills: user.profile.skills,
  })
}
