import { createContext, useCallback, useContext, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import { notificationsAPI } from '@/services/api'
import { normalizeApiError } from '@/shared/api/api-error'

const NotificationContext = createContext(null)
const NOTIFICATIONS_QUERY_KEY = ['notifications']

export function NotificationProvider({ children }) {
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuth()

  const notificationsQuery = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: async () => {
      try {
        return await notificationsAPI.getAll()
      } catch (queryError) {
        if (queryError?.status === 401 || queryError?.status === 404) {
          return []
        }

        throw queryError
      }
    },
    enabled: isAuthenticated,
    staleTime: 30_000,
  })

  const notifications = useMemo(
    () => (isAuthenticated ? notificationsQuery.data || [] : []),
    [isAuthenticated, notificationsQuery.data]
  )
  const unreadCount = notifications.filter((notification) => !notification.read).length

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId) => notificationsAPI.markAsRead(notificationId),
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsAPI.markAllAsRead(),
  })

  const removeNotificationMutation = useMutation({
    mutationFn: (notificationId) => notificationsAPI.delete(notificationId),
  })

  const addNotification = useCallback(
    (notification) => {
      const newNotification = {
        id: `local-${Date.now()}`,
        timestamp: new Date().toISOString(),
        read: false,
        type: 'system',
        ...notification,
      }

      queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, (current = []) => [
        newNotification,
        ...current,
      ])

      return newNotification
    },
    [queryClient]
  )

  const markAsRead = useCallback(
    async (notificationId) => {
      queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, (current = []) =>
        current.map((notification) =>
          notification.id === notificationId ? { ...notification, read: true } : notification
        )
      )

      try {
        await markAsReadMutation.mutateAsync(notificationId)
      } catch {
        queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
      }
    },
    [markAsReadMutation, queryClient]
  )

  const markAllAsRead = useCallback(
    async () => {
      queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, (current = []) =>
        current.map((notification) => ({ ...notification, read: true }))
      )

      try {
        await markAllAsReadMutation.mutateAsync()
      } catch {
        queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
      }
    },
    [markAllAsReadMutation, queryClient]
  )

  const removeNotification = useCallback(
    async (notificationId) => {
      queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, (current = []) =>
        current.filter((notification) => notification.id !== notificationId)
      )

      try {
        await removeNotificationMutation.mutateAsync(notificationId)
      } catch {
        queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
      }
    },
    [removeNotificationMutation, queryClient]
  )

  const clearAll = useCallback(() => {
    queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, [])
  }, [queryClient])

  const formatRelativeTime = useCallback((timestamp) => {
    const now = new Date()
    const date = new Date(timestamp)
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }, [])

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading: notificationsQuery.isLoading,
      error: notificationsQuery.error ? normalizeApiError(notificationsQuery.error) : null,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAll,
      refreshNotifications: notificationsQuery.refetch,
      formatRelativeTime,
    }),
    [
      notifications,
      unreadCount,
      notificationsQuery.isLoading,
      notificationsQuery.error,
      notificationsQuery.refetch,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAll,
      formatRelativeTime,
    ]
  )
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

export default NotificationContext
