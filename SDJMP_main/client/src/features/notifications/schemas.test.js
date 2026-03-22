import { describe, expect, it } from 'vitest'
import { normalizeNotifications } from '@/features/notifications/schemas'

describe('normalizeNotifications', () => {
  it('normalizes notification collections from API payloads', () => {
    const notifications = normalizeNotifications({
      data: {
        notifications: [
          {
            id: 7,
            title: 'Application updated',
            message: 'Your application moved to review.',
            type: 'job',
            timestamp: '2026-03-21T10:00:00.000Z',
            read: false,
          },
        ],
      },
    })

    expect(notifications).toHaveLength(1)
    expect(notifications[0]).toMatchObject({
      id: '7',
      type: 'job',
      read: false,
    })
  })
})
