import Job from './job.model.js'
import User from '../users/user.model.js'
import { calculateMatchScore } from './matching.service.js'
import { createUserNotification } from '../notifications/notification-dispatch.service.js'

export function buildCombinedJobRequirements(job = {}) {
  return [
    ...((job.skills || []).map((skill) => ({ name: skill, weight: 10 }))),
    ...((job.skillRequirements || []).map((requirement) => ({
      name: requirement?.name || requirement?.skill || requirement?.label || '',
      weight: typeof requirement?.weight === 'number' ? requirement.weight : (typeof requirement?.score === 'number' ? requirement.score : 10),
      level: requirement?.level,
    })).filter((requirement) => requirement.name)),
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
    console.warn('[Job Matcher] Invalid student object provided')
    return []
  }

  if (!jobs || jobs.length === 0) {
    return []
  }

  const matches = computeStudentMatches(student, jobs).filter((entry) => entry.matchScore >= minimumScore)
  
  if (matches.length === 0) {
    return []
  }

  const createdNotifications = []

  for (const { job, matchScore } of matches) {
    try {
      const notification = await createUserNotification({
        userId: student._id,
        type: 'job',
        title: 'New Recommended Job',
        message: `${job.title} at ${job.companyName} matches your skills with a ${matchScore}% score.`,
        dedupeKey: `job-match:${student._id}:${job._id}`,
        metadata: {
          jobId: String(job._id),
          jobTitle: job.title,
          company: job.companyName,
          matchScore,
          location: job.location || 'Not specified',
          type: job.type || 'Not specified',
        },
      })

      if (notification) {
        createdNotifications.push(notification)
      }
    } catch (error) {
      console.error(
        `[Job Matcher] Error creating notification for student ${student._id} and job ${job._id}:`,
        error.message
      )
      // Continue with next job if one fails
    }
  }

  return createdNotifications
}

export async function notifyStudentsForJob(job, minimumScore = 50) {
  if (!job?._id) {
    console.warn('[Job Matcher] Invalid job object provided')
    return []
  }

  if (job.status !== 'published') {
    console.info(`[Job Matcher] Job ${job._id} is not published, skipping notifications`)
    return []
  }

  let students = []
  try {
    students = await User.find({ role: 'student' }).lean()
  } catch (error) {
    console.error('[Job Matcher] Error fetching students:', error.message)
    return []
  }

  if (!students || students.length === 0) {
    console.info('[Job Matcher] No students found to notify')
    return []
  }

  const createdNotifications = []
  let processedCount = 0
  let notificationCount = 0

  for (const student of students) {
    try {
      const notifications = await notifyStudentAboutMatchingJobs(student, [job], minimumScore)
      if (notifications && notifications.length > 0) {
        createdNotifications.push(...notifications)
        notificationCount += notifications.length
      }
      processedCount++
    } catch (error) {
      console.error(
        `[Job Matcher] Error notifying student ${student._id} about job ${job._id}:`,
        error.message
      )
      // Continue with next student
    }
  }

  console.log(
    `[Job Matcher] Notified ${processedCount}/${students.length} students about job ${job._id}. Created ${notificationCount} notifications.`
  )

  return createdNotifications
}

export async function notifyStudentForAllPublishedJobs(studentId, minimumScore = 50) {
  if (!studentId) {
    console.warn('[Job Matcher] Invalid studentId provided')
    return []
  }

  try {
    const [student, jobs] = await Promise.all([
      User.findById(studentId).lean(),
      Job.find({ status: 'published' }).lean(),
    ])

    if (!student) {
      console.warn(`[Job Matcher] Student ${studentId} not found`)
      return []
    }

    if (student.role !== 'student') {
      console.info(`[Job Matcher] User ${studentId} is not a student, skipping job matching`)
      return []
    }

    if (!jobs || jobs.length === 0) {
      console.info(`[Job Matcher] No published jobs found for student ${studentId}`)
      return []
    }

    const notifications = await notifyStudentAboutMatchingJobs(student, jobs, minimumScore)
    
    if (notifications && notifications.length > 0) {
      console.log(
        `[Job Matcher] Created ${notifications.length} new job recommendations for student ${studentId}`
      )
    }

    return notifications
  } catch (error) {
    console.error(
      `[Job Matcher] Error notifying student ${studentId} of all published jobs:`,
      error.message
    )
    return []
  }
}
