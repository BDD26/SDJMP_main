import User from '../users/user.model.js'
import { createHttpError } from '../../utils/http-error.js'
import {
  comparePassword,
  comparePasswordResetToken,
  createPasswordResetToken,
  createSessionToken,
  hashPassword,
  hashPasswordResetToken,
  sanitizeUser,
  sessionCookieOptions,
} from './auth.service.js'
import emailService from '../../services/email.service.js'
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

  const token = createSessionToken(user._id, user.role)
  res.cookie(env.cookieName, token, sessionCookieOptions(req))

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

  const token = createSessionToken(user._id, user.role)
  res.cookie(env.cookieName, token, sessionCookieOptions(req))

  res.status(200).json({
    user: sanitizeUser(user),
  })
}

export async function logout(req, res) {
  res.clearCookie(env.cookieName, {
    ...sessionCookieOptions(req),
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
  const token = createSessionToken(req.user._id, req.user.role)
  res.cookie(env.cookieName, token, sessionCookieOptions(req))

  res.status(200).json({
    user: sanitizeUser(req.user),
  })
}

export async function forgotPassword(req, res) {
  const { email, sendToEmail } = req.validated.body
  const user = await User.findOne({ email }).select('+passwordResetToken +passwordResetExpiresAt')

  if (!user) {
    res.status(200).json({
      message: 'If an account exists for this email, a reset link has been sent.',
    })
    return
  }

  const resetToken = createPasswordResetToken()
  const hashedResetToken = await hashPasswordResetToken(resetToken)
  
  user.passwordResetToken = hashedResetToken
  user.passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000)
  await user.save()

  const deliveryEmail = sendToEmail || email

  try {
    await emailService.sendPasswordResetEmail(deliveryEmail, resetToken, user.name)
    
    res.status(200).json({
      message: 'Password reset link sent to your email.',
      ...(env.nodeEnv !== 'production' ? { resetToken } : {}),
    })
  } catch (emailError) {
    console.error('Failed to send password reset email:', emailError)
    
    user.passwordResetToken = null
    user.passwordResetExpiresAt = null
    await user.save()
    
    throw createHttpError(500, 'Failed to send password reset email')
  }
}

export async function resetPassword(req, res) {
  const { token, newPassword } = req.validated.body
  const normalizedToken = String(token || '').trim()

  if (!normalizedToken) {
    throw createHttpError(400, 'Reset token is invalid or missing')
  }

  const users = await User.find({
    passwordResetToken: { $exists: true, $ne: null },
    passwordResetExpiresAt: { $gt: new Date() },
  }).select('+passwordResetToken +passwordResetExpiresAt')

  let validUser = null
  for (const user of users) {
    if (!user.passwordResetToken) {
      continue
    }

    let isMatch = false
    try {
      isMatch = await comparePasswordResetToken(normalizedToken, user.passwordResetToken)
    } catch (compareError) {
      console.warn('Password reset token compare failed for user', user.email, compareError.message)
      continue
    }

    if (isMatch) {
      validUser = user
      break
    }
  }

  if (!validUser) {
    throw createHttpError(400, 'Reset token is invalid or expired')
  }

  validUser.password = await hashPassword(newPassword)
  validUser.passwordResetToken = null
  validUser.passwordResetExpiresAt = null
  await validUser.save()

  res.status(200).json({
    message: 'Password reset successfully',
  })
}

export async function verifyEmailConnection(req, res) {
  try {
    const result = await emailService.verifyConnection()
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message,
        configured: true
      })
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
        configured: false,
        hint: 'Please configure SMTP settings in your .env file'
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Email service verification failed',
      error: error.message
    })
  }
}
