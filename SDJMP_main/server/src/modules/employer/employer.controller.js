import Application from '../applications/application.model.js'
import Job from '../jobs/job.model.js'
import User from '../users/user.model.js'
import { createHttpError } from '../../utils/http-error.js'
import { serializeApplication } from '../applications/applications.service.js'

// ─── Company Profile ────────────────────────────────────────────────────────

export async function getEmployerCompanyProfile(req, res) {
  const user = await User.findById(req.user._id).lean()
  if (!user) throw createHttpError(404, 'User not found')
  res.status(200).json({
    name:        user.company?.name || '',
    industry:    user.company?.industry || '',
    description: user.company?.description || '',
    culture:     user.company?.culture || '',
    foundedYear: user.company?.foundedYear || '',
    size:        user.company?.size || '',
    location:    user.company?.location || '',
    website:     user.company?.website || '',
    email:       user.company?.email || '',
    phone:       user.company?.phone || '',
    benefits:    user.company?.benefits || [],
    logo:        user.company?.logo || '',
  })
}

export async function updateEmployerCompanyProfile(req, res) {
  const user = await User.findById(req.user._id)
  if (!user) throw createHttpError(404, 'User not found')
  user.company = { ...(user.company || {}), ...req.body }
  await user.save()
  res.status(200).json({
    message: 'Company profile updated',
    company: user.company
  })
}

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

export async function getEmployerStats(req, res) {
  const employerId = req.user._id

  const [activeJobs, allApplications] = await Promise.all([
    Job.countDocuments({ employerId, status: 'published' }),
    Application.find({ employerId })
      .populate('jobId', 'title')
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 })
      .lean(),
  ])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const newApplications = allApplications.filter(
    (a) => new Date(a.createdAt) >= today,
  ).length

  const scheduledInterviews = allApplications.filter(
    (a) => a.status === 'interview',
  ).length

  // Build weekly trend (last 4 weeks Mon→Sun buckets)
  const weeklyTrend = []
  for (let w = 3; w >= 0; w--) {
    const start = new Date()
    start.setDate(start.getDate() - start.getDay() - w * 7)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    end.setHours(23, 59, 59, 999)

    const applications = allApplications.filter((a) => {
      const d = new Date(a.createdAt)
      return d >= start && d <= end
    }).length

    const interviews = allApplications.filter((a) => {
      const d = new Date(a.updatedAt)
      return d >= start && d <= end && a.status === 'interview'
    }).length

    weeklyTrend.push({ week: `Week ${4 - w}`, applications, interviews })
  }

  // Recent 5 applications
  const recentApplications = allApplications.slice(0, 5).map((a) => ({
    id: String(a._id),
    candidate: a.studentId?.name || 'Unknown',
    position: a.jobId?.title || 'Unknown Position',
    status: a.status,
    date: formatRelative(a.createdAt),
  }))

  res.status(200).json({
    activeJobs,
    totalApplicants: allApplications.length,
    newApplications,
    scheduledInterviews,
    weeklyTrend,
    recentApplications,
  })
}

export function formatRelative(dateInput) {
  const now = new Date()
  const date = new Date(dateInput)
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  return `${diffDays} days ago`
}

// ─── Applicants (by job or all) ──────────────────────────────────────────────

export async function getEmployerApplicants(req, res) {
  const employerId = req.user._id
  const { jobId } = req.params

  const filter = { employerId }
  if (jobId && jobId !== 'all') {
    const job = await Job.findById(jobId)
    if (!job) throw createHttpError(404, 'Job not found')
    if (String(job.employerId) !== String(employerId)) {
      throw createHttpError(403, 'You do not have access to this job')
    }
    filter.jobId = jobId
  }

  const applications = await Application.find(filter)
    .populate('jobId')
    .populate('studentId', 'name email avatar profile')
    .sort({ createdAt: -1 })
    .lean()

  const result = applications.map((app) => {
    const matchData = computeMatchScore(app)
    return {
      id: String(app._id),
      name: app.studentId?.name || 'Unknown',
      email: app.studentId?.email || '',
      avatar: app.studentId?.avatar || '',
      position: app.jobId?.title || 'Unknown Position',
      status: app.status,
      appliedDate: formatRelative(app.createdAt),
      notes: app.notes || '',
      interview: app.interview || null,
      coverLetter: app.coverLetter || '',
      matchScore: matchData.score,
      matchedSkills: matchData.matchedSkills,
      missingSkills: matchData.missingSkills,
      jobId: String(app.jobId?._id || app.jobId),
    }
  })

  res.status(200).json(result)
}

export function computeMatchScore(application) {
  const job = application.jobId
  const student = application.studentId

  const studentSkills = ((student?.profile?.skills) || [])
    .map((s) => (typeof s === 'string' ? s : s?.name || ''))
    .map((s) => s.toLowerCase().trim())
    .filter(Boolean)

  if (job?.skillRequirements && job.skillRequirements.length > 0) {
    let totalWeight = 0
    let matchedWeight = 0
    const matchedSkills = []
    const missingSkills = []

    for (const req of job.skillRequirements) {
      const w = req.weight || 10
      totalWeight += w
      if (studentSkills.includes(req.name.toLowerCase().trim())) {
        matchedWeight += w
        matchedSkills.push(req.name)
      } else {
        missingSkills.push(req.name)
      }
    }
    
    // Fallback just in case sum of weights is 0 somehow
    if (totalWeight === 0) return { score: 50, matchedSkills: [], missingSkills: [] }
    
    const score = Math.round((matchedWeight / totalWeight) * 100)
    return { score, matchedSkills, missingSkills }
  }

  // Fallback to plain skills array if skillRequirements is empty
  const jobSkills = ((job?.skills) || []).map((s) => s.toLowerCase().trim())
  if (jobSkills.length === 0) {
    return { score: 50, matchedSkills: [], missingSkills: [] }
  }

  const matchedSkills = jobSkills.filter((js) => studentSkills.includes(js))
  const missingSkills = jobSkills.filter((js) => !studentSkills.includes(js))
  const score = Math.round((matchedSkills.length / jobSkills.length) * 100)

  return { score, matchedSkills, missingSkills }
}

// ─── Schedule Interview ──────────────────────────────────────────────────────

export async function scheduleEmployerInterview(req, res) {
  const { applicationId } = req.params
  const { method, link, location, date, time, notes } = req.body

  if (!method || !['online', 'offline'].includes(method)) {
    throw createHttpError(400, 'Interview method must be "online" or "offline"')
  }
  if (!date || !time) {
    throw createHttpError(400, 'Date and time are required')
  }
  if (method === 'online' && !link) {
    throw createHttpError(400, 'A meeting link is required for online interviews')
  }
  if (method === 'offline' && !location) {
    throw createHttpError(400, 'A location is required for offline interviews')
  }

  const application = await Application.findById(applicationId)
  if (!application) throw createHttpError(404, 'Application not found')
  if (String(application.employerId) !== String(req.user._id)) {
    throw createHttpError(403, 'You do not have access to this application')
  }

  application.status = 'interview'
  application.interview = { method, link: link || '', location: location || '', date, time, notes: notes || '' }
  await application.save()

  const populated = await Application.findById(application._id)
    .populate('jobId')
    .populate('studentId', 'name email avatar profile')
  res.status(200).json(serializeApplication(populated))
}

// ─── Interviews Listing ───────────────────────────────────────────────────────

export async function getEmployerInterviews(req, res) {
  const employerId = req.user._id

  const applications = await Application.find({ employerId, status: 'interview' })
    .populate('jobId', 'title')
    .populate('studentId', 'name email avatar')
    .sort({ updatedAt: -1 })
    .lean()

  const interviews = applications.map((app) => ({
    id: String(app._id),
    candidate: app.studentId?.name || 'Unknown',
    email: app.studentId?.email || '',
    role: app.jobId?.title || 'Unknown Position',
    jobId: String(app.jobId?._id || app.jobId),
    method: app.interview?.method || 'online',
    link: app.interview?.link || '',
    location: app.interview?.location || '',
    date: app.interview?.date || '',
    time: app.interview?.time || '',
    notes: app.interview?.notes || '',
    status: app.interview?.status || 'scheduled',
  }))

  res.status(200).json(interviews)
}
