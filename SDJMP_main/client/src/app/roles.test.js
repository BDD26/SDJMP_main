import { describe, expect, it } from 'vitest'
import { APP_ROLES, getDashboardPath } from '@/app/roles'

describe('getDashboardPath', () => {
  it('returns the student dashboard path', () => {
    expect(getDashboardPath(APP_ROLES.STUDENT)).toBe('/student/dashboard')
  })

  it('returns the employer dashboard path', () => {
    expect(getDashboardPath(APP_ROLES.EMPLOYER)).toBe('/employer/dashboard')
  })

  it('returns the admin dashboard path', () => {
    expect(getDashboardPath(APP_ROLES.SUPER_ADMIN)).toBe('/admin/dashboard')
  })
})
