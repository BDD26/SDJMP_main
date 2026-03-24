import User from '../users/user.model.js'
import { createHttpError } from '../../utils/http-error.js'

export async function debugGetUserProfile(req, res) {
  if (req.user.role !== 'student') {
    throw createHttpError(403, 'Only students can access this debug endpoint')
  }

  const user = await User.findById(req.user._id).select('-password')
  
  if (!user) {
    throw createHttpError(404, 'User not found')
  }

  res.status(200).json({
    message: 'Profile data from MongoDB Atlas',
    userId: user._id,
    email: user.email,
    name: user.name,
    profile: user.profile,
    updatedAt: user.updatedAt,
    createdAt: user.createdAt
  })
}

export async function debugListAllUsers(req, res) {
  // For admin/debug purposes only
  const users = await User.find({}).select('-password').limit(10)
  
  res.status(200).json({
    count: users.length,
    users: users.map(u => ({
      id: u._id,
      email: u.email,
      name: u.name,
      role: u.role,
      hasProfile: !!u.profile,
      profileFields: u.profile ? Object.keys(u.profile.toObject()) : [],
      updatedAt: u.updatedAt
    }))
  })
}
