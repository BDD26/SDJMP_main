import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import env from '../../config/env.js'

export function sanitizeUser(userDocument) {
  const user = userDocument.toObject ? userDocument.toObject() : userDocument

  return {
    id: String(user._id || user.id),
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar || '',
    ...(user.profile ? { profile: user.profile } : {}),
    ...(user.company ? { company: user.company } : {}),
  }
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword)
}

export function createSessionToken(userId, role) {
  return jwt.sign({ sub: String(userId), role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  })
}

export function sessionCookieOptions() {
  const isHttpsClient = env.clientUrl.startsWith('https://')
  const useSecureCookie = env.isProduction || (env.cookieSecure && isHttpsClient)

  return {
    httpOnly: true,
    secure: useSecureCookie,
    sameSite: useSecureCookie ? 'none' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  }
}

export function createPasswordResetToken() {
  return crypto.randomBytes(24).toString('hex')
}

export async function hashPasswordResetToken(token) {
  return bcrypt.hash(token, 12)
}

export async function comparePasswordResetToken(token, hashedToken) {
  return bcrypt.compare(token, hashedToken)
}
