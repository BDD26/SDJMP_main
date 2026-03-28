import { createBrowserRouter, Navigate, useRouteError } from 'react-router-dom'
import App from '@/App'
import RouteGuard from '@/app/route-guard'
import { APP_ROLES } from '@/app/roles'
import DashboardLayout from '@/layouts/DashboardLayout'
import PublicLayout from '@/layouts/PublicLayout'
import ErrorState from '@/shared/components/error-state'
import LoadingState from '@/shared/components/loading-state'

function AppErrorBoundary() {
  const error = useRouteError()

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-xl">
        <ErrorState
          title="Something went wrong"
          description={error?.message || 'The page could not be loaded.'}
        />
      </div>
    </div>
  )
}

function lazyComponent(importer) {
  return async () => {
    const module = await importer()
    return { Component: module.default }
  }
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <AppErrorBoundary />,
    hydrateFallbackElement: <LoadingState fullScreen title="Loading SkillMatch" />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { index: true, lazy: lazyComponent(() => import('@/pages/public/LandingPage')) },
          { path: 'jobs', lazy: lazyComponent(() => import('@/pages/public/JobBrowserPage')) },
          { path: 'jobs/:id', lazy: lazyComponent(() => import('@/pages/public/JobDetailPage')) },
          { path: 'skills', lazy: lazyComponent(() => import('@/pages/public/SkillsLibraryPage')) },
          { path: 'course/:skill', lazy: lazyComponent(() => import('@/pages/public/CoursePlayerPage')) },
          { path: 'about', lazy: lazyComponent(() => import('@/pages/public/AboutPage')) },
        ],
      },
      { path: 'login', lazy: lazyComponent(() => import('@/pages/auth/LoginPage')) },
      { path: 'register', lazy: lazyComponent(() => import('@/pages/auth/RegisterPage')) },
      { path: 'forgot-password', lazy: lazyComponent(() => import('@/pages/auth/ForgotPasswordPage')) },
      { path: 'reset-password/:token', lazy: lazyComponent(() => import('@/pages/auth/ResetPasswordPage')) },
      {
        path: 'student',
        element: (
          <RouteGuard allowedRoles={[APP_ROLES.STUDENT]}>
            <DashboardLayout role={APP_ROLES.STUDENT} />
          </RouteGuard>
        ),
        children: [
          { index: true, element: <Navigate to="/student/dashboard" replace /> },
          { path: 'dashboard', lazy: lazyComponent(() => import('@/pages/student/StudentDashboard')) },
          { path: 'jobs', lazy: lazyComponent(() => import('@/pages/student/StudentJobSearch')) },
          { path: 'assessments', lazy: lazyComponent(() => import('@/pages/student/StudentAssessments')) },
          { path: 'applications', lazy: lazyComponent(() => import('@/pages/student/StudentApplications')) },
          { path: 'profile', lazy: lazyComponent(() => import('@/pages/student/StudentProfile')) },
          { path: 'resumes', lazy: lazyComponent(() => import('@/pages/student/StudentResumeManager')) },
          { path: 'notifications', lazy: lazyComponent(() => import('@/pages/student/StudentNotifications')) },
        ],
      },
      {
        path: 'employer',
        element: (
          <RouteGuard allowedRoles={[APP_ROLES.EMPLOYER]}>
            <DashboardLayout role={APP_ROLES.EMPLOYER} />
          </RouteGuard>
        ),
        children: [
          { index: true, element: <Navigate to="/employer/dashboard" replace /> },
          { path: 'dashboard', lazy: lazyComponent(() => import('@/pages/employer/EmployerDashboard')) },
          { path: 'jobs', lazy: lazyComponent(() => import('@/pages/employer/EmployerJobManagement')) },
          { path: 'jobs/new', lazy: lazyComponent(() => import('@/pages/employer/JobPostForm')) },
          { path: 'jobs/:id/edit', lazy: lazyComponent(() => import('@/pages/employer/JobPostForm')) },
          { path: 'jobs/:id/applicants', lazy: lazyComponent(() => import('@/pages/employer/EmployerApplicants')) },
          { path: 'applicants', lazy: lazyComponent(() => import('@/pages/employer/EmployerApplicants')) },
          { path: 'interviews', lazy: lazyComponent(() => import('@/pages/employer/InterviewsPage')) },
          { path: 'company', lazy: lazyComponent(() => import('@/pages/employer/EmployerCompanyProfile')) },
        ],
      },
      {
        path: 'admin',
        element: (
          <RouteGuard allowedRoles={[APP_ROLES.SUPER_ADMIN]}>
            <DashboardLayout role={APP_ROLES.SUPER_ADMIN} />
          </RouteGuard>
        ),
        children: [
          { index: true, element: <Navigate to="/admin/dashboard" replace /> },
          { path: 'dashboard', lazy: lazyComponent(() => import('@/pages/admin/AdminDashboard')) },
          { path: 'users', lazy: lazyComponent(() => import('@/pages/admin/AdminUserManagement')) },
          { path: 'jobs', lazy: lazyComponent(() => import('@/pages/admin/AdminJobModeration')) },
          { path: 'employers', lazy: lazyComponent(() => import('@/pages/admin/EmployerVerification')) },
          { path: 'analytics', lazy: lazyComponent(() => import('@/pages/admin/AdminAnalytics')) },
          { path: 'exports', lazy: lazyComponent(() => import('@/pages/admin/ExportPage')) },
        ],
      },
      { path: 'super-admin/*', element: <Navigate to="/admin/dashboard" replace /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
