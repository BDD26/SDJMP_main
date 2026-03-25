import User from '../users/user.model.js'
import { createHttpError } from '../../utils/http-error.js'
import { mergeSkillsIntoUserProfile, normalizeSkillPayload } from './skill-inventory.service.js'
import { notifyStudentForAllPublishedJobs } from '../jobs/job-match.pipeline.js'
import Skill from './skill.model.js'
import { serializeSkill } from './skills.service.js'
import { defaultSkillLibrary } from './default-skill-library.js'

async function ensureDefaultSkillLibrary() {
  await Skill.bulkWrite(
    defaultSkillLibrary.map((skill) => ({
      updateOne: {
        filter: { name: skill.name },
        update: { $setOnInsert: skill },
        upsert: true,
      },
    })),
    { ordered: false }
  )
}

export async function getAllSkills(req, res) {
  await ensureDefaultSkillLibrary()

  const skills = await Skill.find({})
    .sort({ category: 1, name: 1 })
    .lean()

  res.status(200).json(skills.map(serializeSkill))
}

export async function getPopularSkills(req, res) {
  await ensureDefaultSkillLibrary()

  const skills = await Skill.find({})
    .sort({ growth: -1, demand: -1, popularity: -1, name: 1 })
    .limit(12)
    .lean()

  res.status(200).json(
    skills.map((skill) => ({
      id: String(skill._id),
      name: skill.name,
      growth: `+${Math.max(0, Number(skill.growth) || 0)}%`,
      growthValue: Math.max(0, Number(skill.growth) || 0),
      category: skill.category || 'general',
      popularity: skill.popularity || 0,
    }))
  )
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
