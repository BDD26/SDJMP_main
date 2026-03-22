export const APP_ROLES = {
  STUDENT: 'student',
  EMPLOYER: 'employer',
  SUPER_ADMIN: 'super_admin',
}

export function getDashboardPath(role) {
  switch (role) {
    case APP_ROLES.STUDENT:
      return '/student/dashboard'
    case APP_ROLES.EMPLOYER:
      return '/employer/dashboard'
    case APP_ROLES.SUPER_ADMIN:
      return '/admin/dashboard'
    default:
      return '/'
  }
}
