import User from './user.model.js'
import { createHttpError } from '../../utils/http-error.js'
import { comparePassword, hashPassword, sanitizeUser } from '../auth/auth.service.js'

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
