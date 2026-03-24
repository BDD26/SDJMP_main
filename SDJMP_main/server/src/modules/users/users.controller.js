import User from './user.model.js'
import Resume from './resume.model.js'
import { createHttpError } from '../../utils/http-error.js'
import { comparePassword, hashPassword, sanitizeUser } from '../auth/auth.service.js'
import { destroyCloudinaryRawAsset } from '../../utils/cloudinary.js'

export async function getProfile(req, res) {
  res.status(200).json({
    user: sanitizeUser(req.user),
  })
}

export async function updateProfile(req, res) {
  const { body } = req.validated

  if (body.name !== undefined) {
    req.user.name = body.name
  }

  if (body.avatar !== undefined) {
    req.user.avatar = body.avatar
  }

  if (body.profile !== undefined) {
    req.user.profile = {
      ...(req.user.profile || {}),
      ...body.profile,
    }
  }

  if (body.company !== undefined) {
    req.user.company = {
      ...(req.user.company || {}),
      ...body.company,
    }
  }

  await req.user.save()

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
