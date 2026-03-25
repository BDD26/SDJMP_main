import Job from './job.model.js'
import User from '../users/user.model.js'
import { calculateMatchScore } from './matching.service.js'
import { createUserNotification } from '../notifications/notification-dispatch.service.js'

export function buildCombinedJobRequirements(job = {}) {
  return [
    ...((job.skills || []).map((skill) => ({ name: skill, weight: 10 }))),
    ...(job.skillRequirements || []),
  ]
}

export function computeStudentJobMatchScore(student = {}, job = {}) {
  const userProfile = student.profile || {}
  const userSkills = Array.isArray(userProfile.skills) ? userProfile.skills : []
  const preferredLocations = (userProfile.preferences?.locations || [])
    .map((location) => (typeof location === 'string' ? location.toLowerCase() : ''))
    .filter(Boolean)
  const preferredJobTypes = (userProfile.preferences?.jobTypes || [])
    .map((type) => (typeof type === 'string' ? type.toLowerCase() : ''))
    .filter(Boolean)

  const skillMatchScore = calculateMatchScore(userSkills, buildCombinedJobRequirements(job))
  let matchScore = skillMatchScore * 0.7

  if (preferredLocations.length > 0 && job.location) {
    const normalizedJobLocation = job.location.toLowerCase()
    const locationMatch = preferredLocations.some(
      (location) =>
        normalizedJobLocation.includes(location) ||
        (location.includes('remote') && normalizedJobLocation.includes('remote'))
    )

    if (locationMatch) {
      matchScore += 15
    }
  } else if (preferredLocations.length === 0) {
    matchScore += 10
  }

  if (preferredJobTypes.length > 0 && job.type) {
    if (preferredJobTypes.includes(job.type.toLowerCase())) {
      matchScore += 15
    }
  } else if (preferredJobTypes.length === 0) {
    matchScore += 10
  }

  return Math.min(100, Math.round(matchScore))
}

export function computeStudentMatches(student = {}, jobs = []) {
  return jobs
    .map((job) => ({
      job,
      matchScore: computeStudentJobMatchScore(student, job),
    }))
    .sort((a, b) => b.matchScore - a.matchScore)
}

export async function notifyStudentAboutMatchingJobs(student, jobs = [], minimumScore = 50) {
  if (!student?._id) {
    return []
  }

  const matches = computeStudentMatches(student, jobs).filter((entry) => entry.matchScore >= minimumScore)
  const createdNotifications = []

  for (const { job, matchScore } of matches) {
    const notification = await createUserNotification({
      userId: student._id,
      type: 'job',
      title: 'New Recommended Job',
      message: `${job.title} at ${job.companyName} matches your skills with a ${matchScore}% score.`,
      dedupeKey: `job-match:${student._id}:${job._id}`,
      metadata: {
        jobId: String(job._id),
        matchScore,
      },
    })

    createdNotifications.push(notification)
  }

  return createdNotifications
}

export async function notifyStudentsForJob(job, minimumScore = 50) {
  if (!job?._id || job.status !== 'published') {
    return []
  }

  const students = await User.find({ role: 'student' }).lean()
  const createdNotifications = []

  for (const student of students) {
    const [notification] = await notifyStudentAboutMatchingJobs(student, [job], minimumScore)
    if (notification) {
      createdNotifications.push(notification)
    }
  }

  return createdNotifications
}

export async function notifyStudentForAllPublishedJobs(studentId, minimumScore = 50) {
  const [student, jobs] = await Promise.all([
    User.findById(studentId).lean(),
    Job.find({ status: 'published' }).lean(),
  ])

  if (!student || student.role !== 'student') {
    return []
  }

  return notifyStudentAboutMatchingJobs(student, jobs, minimumScore)
}
