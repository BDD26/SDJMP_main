import jwt from 'jsonwebtoken'
import env from '../config/env.js'
import User from '../modules/users/user.model.js'
import { createHttpError } from '../utils/http-error.js'
import { asyncHandler } from '../utils/async-handler.js'

export const requireAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.[env.cookieName]

  if (!token) {
    throw createHttpError(401, 'Authentication required')
  }

  const payload = jwt.verify(token, env.jwtSecret)
  const user = await User.findById(payload.sub).select('-password')

  if (!user) {
    throw createHttpError(401, 'Session is invalid')
  }

  req.user = user
  next()
})

export function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      next(createHttpError(403, 'You do not have access to this resource'))
      return
    }

    next()
  }
}
