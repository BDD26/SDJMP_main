import env from '@/shared/config/env'
import { APP_ROLES } from '@/app/roles'

const DEV_SESSION_KEY = 'skillmatch_dev_session'

export const DEV_CREDENTIALS = [
  {
    email: 'student@skillmatch.dev',
    password: 'Student@123',
    user: {
      id: 'DEV-STUDENT-001',
      name: 'Aarav Sharma',
      email: 'student@skillmatch.dev',
      role: APP_ROLES.STUDENT,
      avatar: '',
      profile: {
        bio: 'Frontend-focused student testing the SkillMatch platform.',
        location: 'Bengaluru, India',
        education: 'B.Tech Computer Science',
        institution: 'State Technical University',
        graduationYear: 2026,
        profileCompletion: 88,
      },
    },
  },
  {
    email: 'employer@skillmatch.dev',
    password: 'Employer@123',
    user: {
      id: 'DEV-EMPLOYER-001',
      name: 'Riya Mehta',
      email: 'employer@skillmatch.dev',
      role: APP_ROLES.EMPLOYER,
      avatar: '',
      company: {
        name: 'NovaStack Labs',
        industry: 'Software',
        size: '51-200',
        location: 'Pune, India',
      },
    },
  },
  {
    email: 'admin@skillmatch.dev',
    password: 'Admin@123',
    user: {
      id: 'DEV-ADMIN-001',
      name: 'Dev Admin',
      email: 'admin@skillmatch.dev',
      role: APP_ROLES.SUPER_ADMIN,
      avatar: '',
    },
  },
]

export function isDevAuthEnabled() {
  return env.isDevelopment && import.meta.env.VITE_ENABLE_DEV_AUTH !== 'false'
}

export function getDevCredentialsByEmail(email) {
  return DEV_CREDENTIALS.find((credential) => credential.email === email) || null
}

export function readDevSession() {
  if (!isDevAuthEnabled()) {
    return null
  }

  try {
    const raw = window.localStorage.getItem(DEV_SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function writeDevSession(user) {
  if (!isDevAuthEnabled()) {
    return
  }

  window.localStorage.setItem(DEV_SESSION_KEY, JSON.stringify(user))
}

export function clearDevSession() {
  if (!isDevAuthEnabled()) {
    return
  }

  window.localStorage.removeItem(DEV_SESSION_KEY)
}

export function createDevUserRegistration(userData) {
  return {
    id: `DEV-${Date.now()}`,
    name: userData.name,
    email: userData.email,
    role: userData.role,
    avatar: '',
    ...(userData.role === APP_ROLES.EMPLOYER
      ? {
          company: {
            name: `${userData.name} Company`,
            industry: 'Technology',
            size: '1-10',
            location: 'Remote',
          },
        }
      : {
          profile: {
            bio: '',
            location: '',
            education: '',
            institution: '',
            graduationYear: new Date().getFullYear(),
            profileCompletion: 30,
          },
        }),
  }
}
