import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { normalizeSessionUser } from '@/features/auth/schemas'
import { authAPI, userAPI } from '@/services/api'
import { normalizeApiError } from '@/shared/api/api-error'

const AuthContext = createContext(null)
const SESSION_QUERY_KEY = ['auth', 'session']

export function AuthProvider({ children }) {
  const queryClient = useQueryClient()
  const [error, setError] = useState(null)

  const sessionQuery = useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: async () => {
      try {
        return await authAPI.getSession()
      } catch (queryError) {
        if (queryError?.status === 401) {
          return null
        }

        throw queryError
      }
    },
    staleTime: 60_000,
    retry(failureCount, queryError) {
      return queryError?.status >= 500 && failureCount < 2
    },
  })

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }) => {
      const payload = await authAPI.login({ email, password })
      return normalizeSessionUser(payload)
    },
    onSuccess(user) {
      queryClient.setQueryData(SESSION_QUERY_KEY, user)
      setError(null)
    },
    onError(mutationError) {
      setError(normalizeApiError(mutationError).message)
    },
  })

  const registerMutation = useMutation({
    mutationFn: async (userData) => {
      const payload = await authAPI.register(userData)
      return normalizeSessionUser(payload)
    },
    onSuccess(user) {
      queryClient.setQueryData(SESSION_QUERY_KEY, user)
      setError(null)
    },
    onError(mutationError) {
      setError(normalizeApiError(mutationError).message)
    },
  })

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData) => {
      const payload = await userAPI.updateProfile(profileData)
      return normalizeSessionUser(payload)
    },
    onSuccess(user) {
      if (user) {
        queryClient.setQueryData(SESSION_QUERY_KEY, user)
      }
      setError(null)
    },
    onError(mutationError) {
      setError(normalizeApiError(mutationError).message)
    },
  })

  const forgotPasswordMutation = useMutation({
    mutationFn: (payload) => authAPI.forgotPassword(payload),
    onSuccess() {
      setError(null)
    },
    onError(mutationError) {
      setError(normalizeApiError(mutationError).message)
    },
  })

  const resetPasswordMutation = useMutation({
    mutationFn: ({ token, password }) => authAPI.resetPassword(token, password),
    onSuccess() {
      setError(null)
    },
    onError(mutationError) {
      setError(normalizeApiError(mutationError).message)
    },
  })

  const user = sessionQuery.data ?? null

  const login = useCallback(async (email, password) => {
    try {
      const authenticatedUser = await loginMutation.mutateAsync({ email, password })
      return { success: true, user: authenticatedUser }
    } catch (mutationError) {
      return { success: false, error: normalizeApiError(mutationError).message }
    }
  }, [loginMutation])

  const register = useCallback(async (userData) => {
    try {
      const registeredUser = await registerMutation.mutateAsync(userData)
      return { success: true, user: registeredUser }
    } catch (mutationError) {
      return { success: false, error: normalizeApiError(mutationError).message }
    }
  }, [registerMutation])

  const logout = useCallback(async () => {
    try {
      await authAPI.logout()
    } catch {
      // ignore logout errors
    } finally {
      queryClient.setQueryData(SESSION_QUERY_KEY, null)
      queryClient.removeQueries({ queryKey: ['notifications'] })
    }
  }, [queryClient])

  const updateProfile = useCallback(async (profileData) => {
    try {
      const updatedUser = await updateProfileMutation.mutateAsync(profileData)

      if (!updatedUser && user) {
        queryClient.setQueryData(SESSION_QUERY_KEY, {
          ...user,
          profile: profileData,
        })
      }

      return { success: true, user: updatedUser ?? user }
    } catch (mutationError) {
      return { success: false, error: normalizeApiError(mutationError).message }
    }
  }, [queryClient, updateProfileMutation, user])

  const requestPasswordReset = useCallback(async (payload) => {
    try {
      const body = typeof payload === 'string' ? { email: payload } : payload
      await forgotPasswordMutation.mutateAsync(body)
      return { success: true }
    } catch (mutationError) {
      return { success: false, error: normalizeApiError(mutationError).message }
    }
  }, [forgotPasswordMutation])

  const resetPassword = useCallback(async (token, password) => {
    try {
      await resetPasswordMutation.mutateAsync({ token, password })
      return { success: true }
    } catch (mutationError) {
      return { success: false, error: normalizeApiError(mutationError).message }
    }
  }, [resetPasswordMutation])

  const loading =
    sessionQuery.isLoading ||
    loginMutation.isPending ||
    registerMutation.isPending ||
    updateProfileMutation.isPending

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      updateProfile,
      requestPasswordReset,
      resetPassword,
      refreshSession: sessionQuery.refetch,
      clearError: () => setError(null),
    }),
    [
      user,
      loading,
      error,
      login,
      register,
      logout,
      updateProfile,
      requestPasswordReset,
      resetPassword,
      sessionQuery.refetch,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
