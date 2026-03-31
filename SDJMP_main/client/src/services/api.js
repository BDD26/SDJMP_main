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
      : String(rawSalary || '').trim()

  const skills = [...(sourceJob.skills || []), ...(sourceJob.skillRequirements || [])]
    .map(normalizeSkillName)
    .filter(Boolean)
  const uniqueSkills = [...new Set(skills)]

  return {
    id: sourceJob.id || job.id,
    title: sourceJob.title || job.title || '',
    description: sourceJob.description || job.description || '',
    company: sourceJob.company || job.company || '',
    location: sourceJob.location || job.location || '',
    type: sourceJob.type || job.type || '',
    salary,
    skills: uniqueSkills,
    requirements: Array.isArray(sourceJob.requirements) ? sourceJob.requirements : [],
    benefits: Array.isArray(sourceJob.benefits) ? sourceJob.benefits : [],
    postedAt: sourceJob.postedAt || job.postedAt || new Date().toISOString(),
    deadline: sourceJob.deadline || job.deadline || '',
    status: sourceJob.status || job.status || 'active',
    employer: sourceJob.employer || job.employer || {},
  }
}

function normalizeApplication(application) {
  if (!application) {
    return null
  }

  const sourceApp = application.application || application

  return {
    id: sourceApp.id || application.id,
    jobId: sourceApp.jobId || application.jobId,
    job: normalizeJob(sourceApp.job || application.job),
    applicant: sourceApp.applicant || application.applicant || {},
    status: sourceApp.status || application.status || 'pending',
    appliedAt: sourceApp.appliedAt || application.appliedAt || new Date().toISOString(),
    coverLetter: sourceApp.coverLetter || application.coverLetter || '',
    resume: sourceApp.resume || application.resume || {},
    notes: sourceApp.notes || application.notes || '',
  }
}

function normalizeAssessment(assessment) {
  if (!assessment) {
    return null
  }

  const sourceAssessment = assessment.assessment || assessment

  return {
    id: sourceAssessment.id || assessment.id,
    title: sourceAssessment.title || assessment.title || '',
    description: sourceAssessment.description || assessment.description || '',
    type: sourceAssessment.type || assessment.type || 'skill',
    questions: Array.isArray(sourceAssessment.questions) ? sourceAssessment.questions : [],
    duration: sourceAssessment.duration || assessment.duration || 30,
    difficulty: sourceAssessment.difficulty || assessment.difficulty || 'medium',
    skills: Array.isArray(sourceAssessment.skills) ? sourceAssessment.skills : [],
    passingScore: sourceAssessment.passingScore || assessment.passingScore || 70,
    createdAt: sourceAssessment.createdAt || assessment.createdAt || new Date().toISOString(),
    isActive: sourceAssessment.isActive !== undefined ? sourceAssessment.isActive : (assessment.isActive !== undefined ? assessment.isActive : true),
  }
}

function normalizeSkill(skill) {
  if (!skill) {
    return null
  }

  const sourceSkill = skill.skill || skill

  return {
    id: sourceSkill.id || skill.id,
    name: normalizeSkillName(sourceSkill.name || skill.name || ''),
    category: sourceSkill.category || skill.category || '',
    description: sourceSkill.description || skill.description || '',
    level: sourceSkill.level || skill.level || '',
    demand: sourceSkill.demand || skill.demand || 'medium',
    growth: sourceSkill.growth || skill.growth || 'stable',
    avgSalary: sourceSkill.avgSalary || skill.avgSalary || '',
    learningResources: Array.isArray(sourceSkill.learningResources) ? sourceSkill.learningResources : [],
    relatedJobs: Array.isArray(sourceSkill.relatedJobs) ? sourceSkill.relatedJobs : [],
    prerequisites: Array.isArray(sourceSkill.prerequisites) ? sourceSkill.prerequisites : [],
    certifications: Array.isArray(sourceSkill.certifications) ? sourceSkill.certifications : [],
  }
}

function normalizeCourse(course) {
  if (!course) {
    return null
  }

  return {
    id: course._id || course.id,
    title: course.title || '',
    slug: course.slug || '',
    description: course.description || '',
    instructor: course.instructor || {},
    level: course.level || '',
    category: course.category || '',
    duration: course.duration || '',
    rating: course.rating || 0,
    studentsEnrolled: course.studentsEnrolled || 0,
    modules: Array.isArray(course.modules) ? course.modules.map(module => ({
      moduleTitle: module.moduleTitle || '',
      description: module.description || '',
      videos: Array.isArray(module.videos) ? module.videos.map(video => ({
        title: video.title || '',
        youtubeId: video.youtubeId || '',
        duration: video.duration || '',
        description: video.description || '',
        order: video.order || 0
      })) : [],
      order: module.order || 0
    })) : [],
    totalVideos: course.totalVideos || 0,
    lastUpdated: course.lastUpdated || new Date().toISOString(),
    isActive: course.isActive !== undefined ? course.isActive : true
  }
}

function normalizeUserProgress(progress) {
  if (!progress) {
    return null
  }

  return {
    courseId: progress.courseId || '',
    completedVideos: Array.isArray(progress.completedVideos) ? progress.completedVideos : [],
    completedCount: progress.completedCount || 0,
    totalVideos: progress.totalVideos || 0,
    completionPercentage: progress.completionPercentage || 0,
    isCompleted: progress.isCompleted || false,
    lastAccessed: progress.lastAccessed || new Date().toISOString(),
    lastAccessedVideo: progress.lastAccessedVideo || {},
    timeSpent: progress.timeSpent || 0,
    notes: Array.isArray(progress.notes) ? progress.notes : [],
    currentModule: progress.currentModule || '',
    currentVideoIndex: progress.currentVideoIndex || 0,
    nextVideo: progress.nextVideo || null,
    courseStats: progress.courseStats || {}
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
  getMyForJob: async (jobId) => {
    const payload = await apiRequest(`/applications/job/${jobId}/my`)
    return {
      applied: Boolean(payload?.applied),
      application: payload?.application ? normalizeApplication(payload.application) : null,
    }
  },
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

export const coursesAPI = {
  getAll: async (params = {}) => {
    const payload = await apiRequest(`/courses${buildQueryString(params)}`)
    return {
      courses: (Array.isArray(payload?.courses) ? payload.courses : []).map(normalizeCourse).filter(Boolean),
      pagination: payload?.pagination || {}
    }
  },
  getBySlug: async (slug) => normalizeCourse(await apiRequest(`/courses/${slug}`)),
  getProgress: async (courseId) => normalizeUserProgress(await apiRequest(`/courses/progress/${courseId}`)),
  updateProgress: (courseId, videoId, timeSpent) =>
    apiRequest('/courses/progress/update', {
      method: 'patch',
      body: { courseId, videoId, timeSpent }
    }),
  updateLastAccessed: (courseId, videoId) =>
    apiRequest('/courses/progress/last-accessed', {
      method: 'patch',
      body: { courseId, videoId }
    }),
  addNote: (courseId, videoId, content, timestamp) =>
    apiRequest(`/courses/progress/${courseId}/notes`, {
      method: 'post',
      body: { videoId, content, timestamp }
    })
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
  courses: coursesAPI,
  employer: employerAPI,
  admin: adminAPI,
  notifications: notificationsAPI,
  dashboard: dashboardAPI,
}
