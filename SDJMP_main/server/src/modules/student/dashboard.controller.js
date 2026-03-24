import Job from '../jobs/job.model.js'
import Application from '../applications/application.model.js'
import { createHttpError } from '../../utils/http-error.js'

export async function getDashboardStats(req, res) {
  if (req.user.role !== 'student') {
    throw createHttpError(403, 'Only students can access dashboard stats')
  }

  // Get job matches
  const matchesResponse = await fetch(`${req.protocol}://${req.get('host')}/api/jobs/student/matches`, {
    headers: {
      'Authorization': req.headers.authorization,
      'Content-Type': 'application/json'
    }
  })
  const matches = matchesResponse.ok ? await matchesResponse.json() : []
  
  // Get applications
  const applications = await Application.find({ studentId: req.user._id })
  
  // Count interviews (applications with scheduled interviews)
  const interviews = applications.filter(app => app.interview && app.interview.date).length
  
  // Calculate profile completion
  const profile = req.user.profile || {}
  const completionFields = {
    bio: !!profile.bio,
    location: !!profile.location,
    skills: Array.isArray(profile.skills) && profile.skills.length > 0,
    education: Array.isArray(profile.education) && profile.education.length > 0,
    projects: Array.isArray(profile.projects) && profile.projects.length > 0,
    certifications: Array.isArray(profile.certifications) && profile.certifications.length > 0,
    preferences: !!profile.preferences && (
      (Array.isArray(profile.preferences.locations) && profile.preferences.locations.length > 0) ||
      !!profile.preferences.minSalary ||
      (Array.isArray(profile.preferences.jobTypes) && profile.preferences.jobTypes.length > 0)
    )
  }
  
  const completedFields = Object.values(completionFields).filter(Boolean).length
  const totalFields = Object.keys(completionFields).length
  const profileCompletion = Math.round((completedFields / totalFields) * 100)

  res.status(200).json({
    jobMatches: matches.length,
    activeApplications: applications.filter(app => !['withdrawn', 'rejected'].includes(app.status)).length,
    scheduledInterviews: interviews,
    profileCompletion,
    recentApplications: applications.slice(0, 5).map(app => ({
      id: app._id,
      company: app.jobId?.companyName || 'Unknown Company',
      position: app.jobId?.title || 'Unknown Position',
      status: app.status,
      date: formatRelativeTime(app.createdAt),
      interviewDate: app.interview?.date ? new Date(app.interview.date).toLocaleDateString() : null
    }))
  })
}

export async function getChartData(req, res) {
  if (req.user.role !== 'student') {
    throw createHttpError(403, 'Only students can access dashboard chart data')
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  
  const chartData = []
  
  // Get all applications for the student
  const allApplications = await Application.find({
    studentId: req.user._id,
    createdAt: { $gte: new Date(currentYear - 1, currentMonth + 1, 1) }
  }).sort({ createdAt: 1 })
  
  // Get all jobs to calculate matches
  const jobs = await Job.find({ status: 'published' }).sort({ createdAt: -1 })
  const userProfile = req.user.profile || {}
  const userSkills = (userProfile.skills || []).map(s => typeof s === 'string' ? s.toLowerCase() : s.name?.toLowerCase()).filter(Boolean)
  
  for (let i = 5; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12
    const monthYear = monthIndex > currentMonth ? currentYear - 1 : currentYear
    const monthStart = new Date(monthYear, monthIndex, 1)
    const monthEnd = new Date(monthYear, monthIndex + 1, 0, 23, 59, 59)
    
    // Count applications for this month
    const monthApplications = allApplications.filter(app => {
      const appDate = new Date(app.createdAt)
      return appDate >= monthStart && appDate <= monthEnd
    })
    
    // Count jobs posted this month that match user skills
    const monthMatches = jobs.filter(job => {
      const jobDate = new Date(job.createdAt)
      const isInMonth = jobDate >= monthStart && jobDate <= monthEnd
      if (!isInMonth) return false
      
      // Calculate match score based on skills
      const jobSkills = (job.skills || []).map(s => s.toLowerCase())
      if (jobSkills.length === 0 || userSkills.length === 0) return false
      
      const overlap = jobSkills.filter(js => userSkills.includes(js)).length
      const matchScore = overlap > 0 ? Math.round((overlap / jobSkills.length) * 100) : 0
      
      return matchScore >= 50 // Only count as match if 50%+ skill match
    }).length
    
    chartData.push({
      month: months[monthIndex],
      matches: monthMatches,
      applications: monthApplications.length
    })
  }

  res.status(200).json(chartData)
}

export async function getRecentApplications(req, res) {
  if (req.user.role !== 'student') {
    throw createHttpError(403, 'Only students can access recent applications')
  }

  const applications = await Application.find({ studentId: req.user._id })
    .populate('jobId')
    .sort({ createdAt: -1 })
    .limit(10)

  const formattedApplications = applications.map(app => ({
    id: app._id,
    company: app.jobId?.companyName || 'Unknown Company',
    position: app.jobId?.title || 'Unknown Position',
    status: app.status,
    date: formatRelativeTime(app.createdAt),
    interviewDate: app.interview?.date ? new Date(app.interview.date).toLocaleDateString() : null
  }))

  res.status(200).json(formattedApplications)
}

function formatRelativeTime(date) {
  const now = new Date()
  const diff = now - new Date(date)
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`
  return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`
}
