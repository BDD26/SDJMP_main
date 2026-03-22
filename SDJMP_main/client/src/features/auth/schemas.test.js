import { describe, expect, it } from 'vitest'
import { normalizeSessionUser } from '@/features/auth/schemas'

describe('normalizeSessionUser', () => {
  it('normalizes nested auth payloads', () => {
    const user = normalizeSessionUser({
      data: {
        user: {
          id: 42,
          name: 'Alex Johnson',
          email: 'alex@example.com',
          role: 'student',
        },
      },
    })

    expect(user).toMatchObject({
      id: '42',
      name: 'Alex Johnson',
      email: 'alex@example.com',
      role: 'student',
    })
  })
})
