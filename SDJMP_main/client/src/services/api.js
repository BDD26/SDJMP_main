import { normalizeSessionUser } from '@/features/auth/schemas'
import { normalizeNotifications } from '@/features/notifications/schemas'
import { request } from '@/shared/api/http'

function unwrapPayload(payload, key) {
  if (key && Array.isArray(payload?.[key])) {
    return payload[key]
  }

  if (key && payload?.[key] && typeof payload[key] === 'object') {
    return payload[key]
  }

  if (payload?.data?.[key] !== undefined) {
    return payload.data[key]
  }

  return payload
}

function normalizeSkillName(skill) {
  if (typeof skill === 'string') {
    return skill.trim()
  }

  if (skill && typeof skill === 'object') {
    return String(skill.name || skill.label || '').trim()
  }

  return ''
}

function normalizeJob(job) {
  if (!job) {
    return null
  }

  const sourceJob = job.job && typeof job.job === 'object' ? job.job : job
  const rawSalary = sourceJob.salary ?? job.salary ?? ''
  const salary =
    rawSalary && typeof rawSalary === 'object'
      ? {
          min: Number(rawSalary.min) || 0,
          max: Number(rawSalary.max) || 0,
          currency: rawSalary.currency || '',
          label: rawSalary.label || (
            [rawSalary.min, rawSalary.max].some((value) => Number(value) > 0)
              ? [
                  rawSalary.min ? `$${Number(rawSalary.min).toLocaleString()}` : '',
                  rawSalary.max ? `$${Number(rawSalary.max).toLocaleString()}` : '',
                ]
                  .filter(Boolean)
                  .join(' - ')
              : ''
          ),
        }
      : rawSalary

  const skills = [...(sourceJob.skills || []), ...(sourceJob.skillRequirements || [])]
    .map(normalizeSkillName)
    .filter(Boolean)
  const uniqueSkills = [...new Set(skills)]

  return {
    ...job,
    ...sourceJob,
    id: String(sourceJob.id || sourceJob._id || job.id || job._id || ''),
    company: sourceJob.company || sourceJob.companyName || job.company || job.companyName || 'Unknown Company',
    companyName: sourceJob.companyName || sourceJob.company || job.companyName || job.company || 'Unknown Company',
    location: sourceJob.location || sourceJob.locationType || job.location || 'Remote',
    salary,
    skills: uniqueSkills,
    matchScore: Number(job.matchScore) || 0,
  }
}

function normalizeApplication(application) {
  if (!application) {
    return null
  }

  const job = normalizeJob(application.job || application.jobId || {})

  return {
    ...application,
    id: String(application.id || application._id || ''),
    jobId:
      typeof application.jobId === 'string'
        ? application.jobId
        : String(application.jobId?.id || application.jobId?._id || job?.id || ''),
    job,
    position: application.position || job?.title || 'Unknown Role',
    company: application.company || job?.company || 'Unknown Company',
    location: application.location || job?.location || 'Remote',
    appliedDate: application.appliedDate || application.createdAt || null,
    status: application.status || 'pending',
  }
}

function normalizeResume(resume) {
  if (!resume) {
    return null
  }

  return {
    ...resume,
    _id: String(resume._id || resume.id || ''),
    id: String(resume.id || resume._id || ''),
    name: resume.name || 'Untitled Resume',
    type: resume.type || 'uploaded',
    fileUrl: resume.fileUrl || '',
    filePublicId: resume.filePublicId || '',
    status: resume.status || 'pending',
    isPrimary: Boolean(resume.isPrimary),
    data: resume.data || null,
  }
}

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

  getResumes: async () => {
    const payload = await apiRequest('/users/resumes')
    return {
      ...payload,
      resumes: (unwrapPayload(payload, 'resumes') || []).map(normalizeResume).filter(Boolean),
    }
  },
  createResume: async (data) => {
    const payload = await apiRequest('/users/resumes', { method: 'post', body: data })
    return {
      ...payload,
      resume: normalizeResume(unwrapPayload(payload, 'resume')),
    }
  },
  updateResume: async (id, data) => {
    const payload = await apiRequest(`/users/resumes/${id}`, { method: 'put', body: data })
    return {
      ...payload,
      resume: normalizeResume(unwrapPayload(payload, 'resume')),
    }
  },
  deleteResume: (id) => apiRequest(`/users/resumes/${id}`, { method: 'delete' }),

  changePassword: (currentPassword, newPassword) =>
    apiRequest('/users/change-password', {
      method: 'put',
      body: { currentPassword, newPassword },
    }),

  deleteAccount: () => apiRequest('/users/account', { method: 'delete' }),
}

export const jobsAPI = {
  getAll: async (params = {}) => {
    const payload = await apiRequest(`/jobs${buildQueryString(params)}`)
    return (Array.isArray(payload) ? payload : []).map(normalizeJob).filter(Boolean)
  },
  getById: async (id) => normalizeJob(await apiRequest(`/jobs/${id}`)),
  getMyJobs: () => apiRequest('/jobs/my'),
  create: (jobData) => apiRequest('/jobs', { method: 'post', body: jobData }),
  update: (id, jobData) => apiRequest(`/jobs/${id}`, { method: 'put', body: jobData }),
  delete: (id) => apiRequest(`/jobs/${id}`, { method: 'delete' }),
  getRecommended: async () => {
    const payload = await apiRequest('/jobs/recommended')
    return (Array.isArray(payload) ? payload : []).map(normalizeJob).filter(Boolean)
  },
  getStudentMatches: async () => {
    const payload = await apiRequest('/jobs/student/matches')
    return (Array.isArray(payload) ? payload : []).map(normalizeJob).filter(Boolean)
  },
  search: async (query) => {
    const payload = await apiRequest(`/jobs/search${buildQueryString({ q: query })}`)
    return (Array.isArray(payload) ? payload : []).map(normalizeJob).filter(Boolean)
  },
}

export const applicationsAPI = {
  getMyApplications: async () => {
    const payload = await apiRequest('/applications/my')
    return (Array.isArray(payload) ? payload : []).map(normalizeApplication).filter(Boolean)
  },
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
  getQuestions: (id) => apiRequest(`/assessments/${id}/questions`),
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
  getApplicants: (jobId) => apiRequest(`/employer/applicants/${jobId || 'all'}`),
  getAllApplicants: () => apiRequest('/employer/applicants/all'),
  getInterviews: () => apiRequest('/employer/interviews'),
  scheduleInterview: (applicationId, interviewData) =>
    apiRequest(`/employer/interview/${applicationId}`, {
      method: 'post',
      body: interviewData,
    }),
  updateInterviewStatus: (applicationId, status) =>
    apiRequest(`/applications/${applicationId}/interview-status`, {
      method: 'put',
      body: { status },
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

export const dashboardAPI = {
  getStats: () => apiRequest('/student/dashboard/stats'),
  getChartData: () => apiRequest('/student/dashboard/chart-data'),
  getRecentApplications: () => apiRequest('/student/dashboard/recent-applications'),
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
  dashboard: dashboardAPI,
}
