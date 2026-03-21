import User from '../users/user.model.js'
import { createHttpError } from '../../utils/http-error.js'
import {
  comparePassword,
  createPasswordResetToken,
  createSessionToken,
  hashPassword,
  sanitizeUser,
  sessionCookieOptions,
} from './auth.service.js'
import env from '../../config/env.js'

export async function register(req, res) {
  const { name, email, password, role } = req.validated.body

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw createHttpError(409, 'An account with this email already exists')
  }

  const hashedPassword = await hashPassword(password)

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
  })

  const token = createSessionToken(user._id)
  res.cookie(env.cookieName, token, sessionCookieOptions())

  res.status(201).json({
    user: sanitizeUser(user),
  })
}

export async function login(req, res) {
  const { email, password } = req.validated.body

  const user = await User.findOne({ email })
  if (!user) {
    throw createHttpError(401, 'Invalid email or password')
  }

  const isPasswordValid = await comparePassword(password, user.password)
  if (!isPasswordValid) {
    throw createHttpError(401, 'Invalid email or password')
  }

  const token = createSessionToken(user._id)
  res.cookie(env.cookieName, token, sessionCookieOptions())

  res.status(200).json({
    user: sanitizeUser(user),
  })
}

export async function logout(req, res) {
  res.clearCookie(env.cookieName, {
    ...sessionCookieOptions(),
    maxAge: undefined,
  })

  res.status(200).json({
    message: 'Logged out successfully',
  })
}

export async function getSession(req, res) {
  res.status(200).json({
    user: sanitizeUser(req.user),
  })
}

export async function verifySession(req, res) {
  res.status(200).json({
    valid: true,
    user: sanitizeUser(req.user),
  })
}

export async function refreshSession(req, res) {
  const token = createSessionToken(req.user._id)
  res.cookie(env.cookieName, token, sessionCookieOptions())

  res.status(200).json({
    user: sanitizeUser(req.user),
  })
}

export async function forgotPassword(req, res) {
  const { email } = req.validated.body
  const user = await User.findOne({ email }).select('+passwordResetToken +passwordResetExpiresAt')

  if (!user) {
    res.status(200).json({
      message: 'If an account exists for this email, a reset link has been generated.',
    })
    return
  }

  const resetToken = createPasswordResetToken()
  user.passwordResetToken = resetToken
  user.passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000)
  await user.save()

  res.status(200).json({
    message: 'Password reset token generated.',
    ...(env.nodeEnv !== 'production' ? { resetToken } : {}),
  })
}

export async function resetPassword(req, res) {
  const { token, newPassword } = req.validated.body
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpiresAt: { $gt: new Date() },
  }).select('+passwordResetToken +passwordResetExpiresAt')

  if (!user) {
    throw createHttpError(400, 'Reset token is invalid or expired')
  }

  user.password = await hashPassword(newPassword)
  user.passwordResetToken = null
  user.passwordResetExpiresAt = null
  await user.save()

  res.status(200).json({
    message: 'Password reset successfully',
  })
}
