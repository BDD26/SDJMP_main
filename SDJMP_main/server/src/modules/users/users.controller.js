import User from './user.model.js'
import Resume from './resume.model.js'
import { createHttpError } from '../../utils/http-error.js'
import { comparePassword, hashPassword, sanitizeUser } from '../auth/auth.service.js'
import { destroyCloudinaryRawAsset } from '../../utils/cloudinary.js'
import { notifyStudentForAllPublishedJobs } from '../jobs/job-match.pipeline.js'
import { mergeSkillsIntoUserProfile } from '../skills/skill-inventory.service.js'
import { createUserNotification } from '../notifications/notification-dispatch.service.js'

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeStringArray(values = []) {
  const source = Array.isArray(values) ? values : [values]

  return source
    .flat(Infinity)
    .map((value) => (typeof value === 'string' ? value.trim() : String(value || '').trim()))
    .filter(Boolean)
}

function normalizeProfile(profile = {}) {
  return {
    bio: normalizeString(profile.bio),
    location: normalizeString(profile.location),
    skills: Array.isArray(profile.skills)
      ? profile.skills
          .map((skill) => ({
            name: normalizeString(skill?.name),
            level: skill?.level || 'intermediate',
            years: Number.isFinite(Number(skill?.years)) ? Number(skill.years) : 0,
            verified: Boolean(skill?.verified),
          }))
          .filter((skill) => skill.name)
      : [],
    education: Array.isArray(profile.education)
      ? profile.education
          .map((item, index) => ({
            id: item?.id ? String(item.id) : `edu-${Date.now()}-${index}`,
            degree: normalizeString(item?.degree),
            institution: normalizeString(item?.institution),
            year: normalizeString(item?.year),
          }))
          .filter((item) => item.degree || item.institution || item.year)
      : [],
    projects: Array.isArray(profile.projects)
      ? profile.projects
          .map((item, index) => ({
            id: item?.id ? String(item.id) : `project-${Date.now()}-${index}`,
            title: normalizeString(item?.title),
            description: normalizeString(item?.description),
            link: normalizeString(item?.link),
          }))
          .filter((item) => item.title || item.description || item.link)
      : [],
    certifications: Array.isArray(profile.certifications)
      ? profile.certifications
          .map((item) => ({
            name: normalizeString(item?.name),
            issuer: normalizeString(item?.issuer),
            year: normalizeString(item?.year),
          }))
          .filter((item) => item.name || item.issuer || item.year)
      : [],
    preferences: {
      jobTypes: normalizeStringArray(profile.preferences?.jobTypes),
      locations: normalizeStringArray(profile.preferences?.locations),
      minSalary: normalizeString(profile.preferences?.minSalary),
    },
  }
}

export async function getProfile(req, res) {
  res.status(200).json({
    user: sanitizeUser(req.user),
  })
}

export async function updateProfile(req, res) {
  const { body } = req.validated
  let shouldRefreshMatches = false

  if (body.name !== undefined) {
    req.user.name = body.name
  }

  if (body.avatar !== undefined) {
    req.user.avatar = body.avatar
  }

  if (body.profile !== undefined) {
    const existingProfile = normalizeProfile(req.user.profile || {})
    const incomingProfile = body.profile

    let nextSkills = existingProfile.skills
    if (incomingProfile.skills !== undefined) {
      const incomingSkills = normalizeProfile({ skills: incomingProfile.skills }).skills
      const existingVerifiedMap = new Map(
        existingProfile.skills.map((skill) => [String(skill.name || '').toLowerCase(), Boolean(skill.verified)])
      )

      nextSkills = incomingSkills.map((skill) => ({
        ...skill,
        verified:
          skill.verified !== undefined
            ? Boolean(skill.verified)
            : Boolean(existingVerifiedMap.get(String(skill.name || '').toLowerCase())),
      }))
      shouldRefreshMatches = req.user.role === 'student'
    }

    req.user.profile = {
      bio: incomingProfile.bio !== undefined ? normalizeString(incomingProfile.bio) : existingProfile.bio,
      location: incomingProfile.location !== undefined ? normalizeString(incomingProfile.location) : existingProfile.location,
      skills: nextSkills,
      education: incomingProfile.education !== undefined ? normalizeProfile({ education: incomingProfile.education }).education : existingProfile.education,
      projects: incomingProfile.projects !== undefined ? normalizeProfile({ projects: incomingProfile.projects }).projects : existingProfile.projects,
      certifications: incomingProfile.certifications !== undefined ? normalizeProfile({ certifications: incomingProfile.certifications }).certifications : existingProfile.certifications,
      preferences: incomingProfile.preferences !== undefined
        ? {
            jobTypes: incomingProfile.preferences.jobTypes !== undefined
              ? normalizeStringArray(incomingProfile.preferences.jobTypes)
              : existingProfile.preferences.jobTypes,
            locations: incomingProfile.preferences.locations !== undefined
              ? normalizeStringArray(incomingProfile.preferences.locations)
              : existingProfile.preferences.locations,
            minSalary: incomingProfile.preferences.minSalary !== undefined
              ? normalizeString(incomingProfile.preferences.minSalary)
              : existingProfile.preferences.minSalary,
          }
        : existingProfile.preferences,
    }
  }

  if (body.company !== undefined) {
    req.user.company = {
      ...(req.user.company || {}),
      ...body.company,
    }
  }

  await req.user.save()

  if (shouldRefreshMatches) {
    await notifyStudentForAllPublishedJobs(req.user._id)
  }

  res.status(200).json({
    user: sanitizeUser(req.user),
  })
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.validated.body
  const userWithPassword = await User.findById(req.user._id)

  if (!userWithPassword) {
    throw createHttpError(404, 'User not found')
  }

  const isPasswordValid = await comparePassword(currentPassword, userWithPassword.password)
  if (!isPasswordValid) {
    throw createHttpError(400, 'Current password is incorrect')
  }

  userWithPassword.password = await hashPassword(newPassword)
  await userWithPassword.save()

  res.status(200).json({
    message: 'Password updated successfully',
  })
}

export async function deleteAccount(req, res) {
  await User.findByIdAndDelete(req.user._id)

  res.status(200).json({
    message: 'Account deleted successfully',
  })
}

export async function getResumes(req, res) {
  const resumes = await Resume.find({ studentId: req.user._id }).sort({ createdAt: -1 })
  res.status(200).json({ resumes })
}

export async function createResume(req, res) {
  const {
    name,
    type,
    fileUrl,
    filePublicId,
    storageProvider,
    data,
  } = req.validated.body
  
  const existingCount = await Resume.countDocuments({ studentId: req.user._id })
  const isPrimary = existingCount === 0

  const newResume = await Resume.create({
    studentId: req.user._id,
    name,
    type,
    fileUrl,
    filePublicId,
    storageProvider: storageProvider || (fileUrl ? 'cloudinary' : 'none'),
    data,
    isPrimary,
    status: type === 'built' ? 'verified' : 'pending',
    atsScore: type === 'built' ? 85 : 0
  })

  // Uploaded resume: extract skills from document text.
  // We await this so the frontend can immediately fetch the updated profile skills.
  if (type === 'uploaded' && fileUrl) {
    try {
      const { processResumeForUser } = await import('./resume.service.js')
      await processResumeForUser(req.user._id, fileUrl, data?.mimeType || 'application/pdf')
    } catch (err) {
      console.error('Failed to load resume service or parse document', err)
    }
  }

  // Built resume: use the provided builder skills directly.
  if (type === 'built' && Array.isArray(data?.skills) && data.skills.length > 0) {
    try {
      const user = await User.findById(req.user._id)
      if (user) {
        const extractedSkills = data.skills
          .map((skill) => String(skill || '').trim())
          .filter(Boolean)
          .map((name) => ({ name, level: 'intermediate', years: 0, verified: false }))

        const { addedSkills } = await mergeSkillsIntoUserProfile(user, extractedSkills, {
          verified: false,
          category: 'resume-builder',
        })

        if (addedSkills.length > 0) {
          await createUserNotification({
            userId: user._id,
            type: 'assessment',
            title: 'Skills Added From Resume Builder',
            message: `We added ${addedSkills.length} skill(s) from your built resume. Take assessments to verify them.`,
            dedupeKey: `resume-builder-skills:${user._id}:${newResume._id}`,
            metadata: {
              source: 'resume-builder',
              resumeId: String(newResume._id),
              skills: addedSkills.map((skill) => skill.name),
            },
          })

          await notifyStudentForAllPublishedJobs(user._id)
        }
      }
    } catch (error) {
      console.error('Failed to process built resume skills', error)
    }
  }

  res.status(201).json({ resume: newResume })
}

export async function updateResume(req, res) {
  const { id } = req.validated.params
  const { name, isPrimary } = req.validated.body

  const resume = await Resume.findOne({ _id: id, studentId: req.user._id })
  if (!resume) throw createHttpError(404, 'Resume not found')

  if (name !== undefined) resume.name = name
  
  if (isPrimary && !resume.isPrimary) {
    await Resume.updateMany({ studentId: req.user._id }, { isPrimary: false })
    resume.isPrimary = true
  }

  await resume.save()
  res.status(200).json({ resume })
}

export async function deleteResume(req, res) {
  const { id } = req.params

  const resume = await Resume.findOneAndDelete({ _id: id, studentId: req.user._id })
  if (!resume) throw createHttpError(404, 'Resume not found')

  if (resume.filePublicId && resume.storageProvider === 'cloudinary') {
    try {
      await destroyCloudinaryRawAsset(resume.filePublicId)
    } catch (error) {
      console.warn('Failed to delete Cloudinary resume asset', error)
    }
  }

  if (resume.isPrimary) {
    const nextResume = await Resume.findOne({ studentId: req.user._id }).sort({ createdAt: -1 })
    if (nextResume) {
      nextResume.isPrimary = true
      await nextResume.save()
    }
  }

  res.status(200).json({ message: 'Resume deleted successfully' })
}
