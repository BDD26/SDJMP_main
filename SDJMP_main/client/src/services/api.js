import { normalizeSessionUser } from '@/features/auth/schemas'
import { normalizeNotifications } from '@/features/notifications/schemas'
import { request } from '@/shared/api/http'

function buildQueryString(params = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return
    }

    if (Array.isArray(value)) {
      value.forEach((item) => searchParams.append(key, item))
      return
    }

    searchParams.append(key, value)
  })

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

async function apiRequest(endpoint, options = {}) {
  return request({
    url: endpoint,
    method: options.method || 'get',
    data: options.body,
    params: options.params,
    headers: options.headers,
  })
}

export const authAPI = {
  getSession: async () => {
    const payload = await apiRequest('/auth/session')
    return normalizeSessionUser(payload)
  },

  login: (credentials) =>
    apiRequest('/auth/login', {
      method: 'post',
      body: credentials,
    }),

  register: (userData) =>
    apiRequest('/auth/register', {
      method: 'post',
      body: userData,
    }),

  logout: () => apiRequest('/auth/logout', { method: 'post' }),

  forgotPassword: (email) =>
    apiRequest('/auth/forgot-password', {
      method: 'post',
      body: { email },
    }),

  resetPassword: (token, newPassword) =>
    apiRequest('/auth/reset-password', {
      method: 'post',
      body: { token, newPassword },
    }),

  verifyToken: () => apiRequest('/auth/verify'),
  refreshToken: () => apiRequest('/auth/refresh', { method: 'post' }),
}

export const userAPI = {
  getProfile: () => apiRequest('/users/profile'),

  updateProfile: (data) =>
    apiRequest('/users/profile', {
      method: 'put',
      body: data,
    }),

  uploadAvatar: (formData) =>
    apiRequest('/users/avatar', {
      method: 'post',
      body: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getResumes: () => apiRequest('/users/resumes'),
  createResume: (data) => apiRequest('/users/resumes', { method: 'post', body: data }),
  updateResume: (id, data) => apiRequest(`/users/resumes/${id}`, { method: 'put', body: data }),
  deleteResume: (id) => apiRequest(`/users/resumes/${id}`, { method: 'delete' }),

  changePassword: (currentPassword, newPassword) =>
    apiRequest('/users/change-password', {
      method: 'put',
      body: { currentPassword, newPassword },
    }),

  deleteAccount: () => apiRequest('/users/account', { method: 'delete' }),
}

export const jobsAPI = {
  getAll: (params = {}) => apiRequest(`/jobs${buildQueryString(params)}`),
  getById: (id) => apiRequest(`/jobs/${id}`),
  create: (jobData) => apiRequest('/jobs', { method: 'post', body: jobData }),
  update: (id, jobData) => apiRequest(`/jobs/${id}`, { method: 'put', body: jobData }),
  delete: (id) => apiRequest(`/jobs/${id}`, { method: 'delete' }),
  getRecommended: () => apiRequest('/jobs/recommended'),
  getStudentMatches: () => apiRequest('/jobs/student/matches'),
  search: (query) => apiRequest(`/jobs/search${buildQueryString({ q: query })}`),
}

export const applicationsAPI = {
  getMyApplications: () => apiRequest('/applications/my'),
  getForJob: (jobId) => apiRequest(`/applications/job/${jobId}`),
  apply: (jobId, applicationData) =>
    apiRequest('/applications', {
      method: 'post',
      body: { jobId, ...applicationData },
    }),
  withdraw: (applicationId) => apiRequest(`/applications/${applicationId}`, { method: 'delete' }),
  updateStatus: (applicationId, status, notes = '') =>
    apiRequest(`/applications/${applicationId}/status`, {
      method: 'put',
      body: { status, notes },
    }),
}

export const skillsAPI = {
  getAll: () => apiRequest('/skills'),
  getPopular: () => apiRequest('/skills/popular'),
  addToProfile: (skillId, level) =>
    apiRequest('/skills/user', {
      method: 'post',
      body: { skillId, level },
    }),
  updateLevel: (skillId, level) =>
    apiRequest(`/skills/user/${skillId}`, {
      method: 'put',
      body: { level },
    }),
  removeFromProfile: (skillId) => apiRequest(`/skills/user/${skillId}`, { method: 'delete' }),
}

export const assessmentsAPI = {
  getAll: () => apiRequest('/assessments'),
  getById: (id) => apiRequest(`/assessments/${id}`),
  startAssessment: (id) => apiRequest(`/assessments/${id}/start`, { method: 'post' }),
  submitAnswer: (assessmentId, questionId, answer) =>
    apiRequest(`/assessments/${assessmentId}/answer`, {
      method: 'post',
      body: { questionId, answer },
    }),
  completeAssessment: (id) => apiRequest(`/assessments/${id}/complete`, { method: 'post' }),
  getResults: (id) => apiRequest(`/assessments/${id}/results`),
  getMyResults: () => apiRequest('/assessments/my-results'),
}

export const employerAPI = {
  getCompanyProfile: () => apiRequest('/employer/company'),
  updateCompanyProfile: (data) =>
    apiRequest('/employer/company', {
      method: 'put',
      body: data,
    }),
  getStats: () => apiRequest('/employer/stats'),
  getApplicants: (jobId) => apiRequest(`/employer/applicants/${jobId}`),
  scheduleInterview: (applicationId, interviewData) =>
    apiRequest(`/employer/interview/${applicationId}`, {
      method: 'post',
      body: interviewData,
    }),
}

export const adminAPI = {
  getStats: () => apiRequest('/admin/stats'),
  getUsers: (params = {}) => apiRequest(`/admin/users${buildQueryString(params)}`),
  updateUserStatus: (userId, status) =>
    apiRequest(`/admin/users/${userId}/status`, {
      method: 'put',
      body: { status },
    }),
  deleteUser: (userId) => apiRequest(`/admin/users/${userId}`, { method: 'delete' }),
  getPendingEmployers: () => apiRequest('/admin/employers/pending'),
  approveEmployer: (employerId) =>
    apiRequest(`/admin/employers/${employerId}/approve`, { method: 'post' }),
  rejectEmployer: (employerId, reason) =>
    apiRequest(`/admin/employers/${employerId}/reject`, {
      method: 'post',
      body: { reason },
    }),
  getPendingJobs: () => apiRequest('/admin/jobs/pending'),
  approveJob: (jobId) => apiRequest(`/admin/jobs/${jobId}/approve`, { method: 'post' }),
  rejectJob: (jobId, reason) =>
    apiRequest(`/admin/jobs/${jobId}/reject`, {
      method: 'post',
      body: { reason },
    }),
  getAnalytics: (dateRange) => apiRequest(`/admin/analytics${buildQueryString({ range: dateRange })}`),
}

export const notificationsAPI = {
  getAll: async () => {
    const payload = await apiRequest('/notifications')
    return normalizeNotifications(payload)
  },
  markAsRead: (id) => apiRequest(`/notifications/${id}/read`, { method: 'put' }),
  markAllAsRead: () => apiRequest('/notifications/read-all', { method: 'put' }),
  delete: (id) => apiRequest(`/notifications/${id}`, { method: 'delete' }),
  getPreferences: () => apiRequest('/notifications/preferences'),
  updatePreferences: (prefs) =>
    apiRequest('/notifications/preferences', {
      method: 'put',
      body: prefs,
    }),
}

export default {
  auth: authAPI,
  user: userAPI,
  jobs: jobsAPI,
  applications: applicationsAPI,
  skills: skillsAPI,
  assessments: assessmentsAPI,
  employer: employerAPI,
  admin: adminAPI,
  notifications: notificationsAPI,
}
