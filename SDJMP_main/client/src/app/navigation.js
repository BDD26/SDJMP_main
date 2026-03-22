import {
  BarChart3,
  Bell,
  Briefcase,
  Building2,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Search,
  Shield,
  User,
  Users,
} from 'lucide-react'
import { APP_ROLES, getDashboardPath } from '@/app/roles'

export const publicNavigation = [
  { path: '/', label: 'Home' },
  { path: '/jobs', label: 'Browse Jobs' },
  { path: '/skills', label: 'Skills Library' },
  { path: '/about', label: 'About' },
]

export const dashboardNavigation = {
  [APP_ROLES.STUDENT]: [
    { path: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/student/jobs', label: 'Job Search', icon: Search },
    { path: '/student/assessments', label: 'Assessments', icon: ClipboardList },
    { path: '/student/applications', label: 'My Applications', icon: FileText },
    { path: '/student/resumes', label: 'Resumes', icon: FileText },
    { path: '/student/profile', label: 'Profile', icon: User },
    { path: '/student/notifications', label: 'Notifications', icon: Bell },
  ],
  [APP_ROLES.EMPLOYER]: [
    { path: '/employer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/employer/jobs', label: 'Manage Jobs', icon: Briefcase },
    { path: '/employer/applicants', label: 'Applicants', icon: Users },
    { path: '/employer/company', label: 'Company Profile', icon: Building2 },
    { path: '/employer/interviews', label: 'Interviews', icon: ClipboardList },
  ],
  [APP_ROLES.SUPER_ADMIN]: [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/users', label: 'User Management', icon: Users },
    { path: '/admin/jobs', label: 'Job Moderation', icon: Briefcase },
    { path: '/admin/employers', label: 'Employer Verification', icon: Shield },
    { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/admin/exports', label: 'Exports', icon: FileText },
  ],
}

export const roleIcons = {
  [APP_ROLES.STUDENT]: GraduationCap,
  [APP_ROLES.EMPLOYER]: Building2,
  [APP_ROLES.SUPER_ADMIN]: Shield,
}

export const roleColors = {
  [APP_ROLES.STUDENT]: 'bg-blue-500',
  [APP_ROLES.EMPLOYER]: 'bg-emerald-500',
  [APP_ROLES.SUPER_ADMIN]: 'bg-indigo-600',
}

export function getNavItemsForRole(role) {
  return dashboardNavigation[role] || []
}

export function getNotificationDestination(role) {
  if (role === APP_ROLES.STUDENT) {
    return '/student/notifications'
  }

  return getDashboardPath(role)
}
