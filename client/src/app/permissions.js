import { APP_ROLES, getDashboardPath } from '@/app/roles'

export function isKnownRole(role) {
  return Object.values(APP_ROLES).includes(role)
}

export function hasRoleAccess(userRole, allowedRoles = []) {
  if (!allowedRoles.length) {
    return true
  }

  return allowedRoles.includes(userRole)
}

export function getSafeRedirectForRole(role) {
  return getDashboardPath(role) || '/'
}
