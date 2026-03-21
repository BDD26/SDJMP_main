import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { getSafeRedirectForRole, hasRoleAccess } from '@/app/permissions'
import LoadingState from '@/shared/components/loading-state'

export default function RouteGuard({ children, allowedRoles = [] }) {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) {
    return <LoadingState fullScreen title="Loading your workspace" />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!hasRoleAccess(user?.role, allowedRoles)) {
    return <Navigate to={getSafeRedirectForRole(user?.role)} replace />
  }

  return children
}
