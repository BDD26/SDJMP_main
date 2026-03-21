import { connectDatabase } from '../config/database.js'
import env from '../config/env.js'
import User from '../modules/users/user.model.js'
import { hashPassword } from '../modules/auth/auth.service.js'

const defaultSeeds = [
  {
    name: 'Aarav Sharma',
    email: env.seedStudentEmail || 'student@skillmatch.dev',
    password: env.seedStudentPassword || 'Student@123',
    role: 'student',
    profile: {
      bio: 'Seeded student account',
      location: 'Bengaluru, India',
      education: 'B.Tech Computer Science',
      institution: 'State Technical University',
      graduationYear: 2026,
    },
  },
  {
    name: 'Riya Mehta',
    email: env.seedEmployerEmail || 'employer@skillmatch.dev',
    password: env.seedEmployerPassword || 'Employer@123',
    role: 'employer',
    company: {
      name: 'NovaStack Labs',
      industry: 'Software',
      size: '51-200',
      location: 'Pune, India',
    },
  },
  {
    name: 'Dev Admin',
    email: env.seedAdminEmail || 'admin@skillmatch.dev',
    password: env.seedAdminPassword || 'Admin@123',
    role: 'super_admin',
  },
]

async function upsertSeedUser(seed) {
  const password = await hashPassword(seed.password)

  await User.findOneAndUpdate(
    { email: seed.email },
    {
      name: seed.name,
      email: seed.email,
      password,
      role: seed.role,
      avatar: '',
      profile: seed.profile || {},
      company: seed.company || {},
    },
    {
      upsert: true,
      returnDocument: 'after',
      setDefaultsOnInsert: true,
    }
  )
}

async function seedUsers() {
  try {
    await connectDatabase()

    for (const seed of defaultSeeds) {
      await upsertSeedUser(seed)
    }

    console.warn('Seeded student, employer, and super_admin users.')
    process.exit(0)
  } catch (error) {
    console.error('Failed to seed users', error)
    process.exit(1)
  }
}

seedUsers()
