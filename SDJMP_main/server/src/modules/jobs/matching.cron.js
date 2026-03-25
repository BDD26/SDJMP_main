import cron from 'node-cron'
import Job from './job.model.js'
import User from '../users/user.model.js'
import { notifyStudentAboutMatchingJobs } from './job-match.pipeline.js'

/**
 * Runs the matching algorithm for all active students against all published jobs.
 * Creates notifications for any matches >= 50%.
 * This is designed to be run daily via cron.
 */
export async function runDailyJobMatching() {
  console.log('[Job Matcher] Starting daily job matching routine...')
  try {
    // 1. Get all published jobs
    const activeJobs = await Job.find({ status: 'published' }).lean()
    if (!activeJobs.length) {
      console.log('[Job Matcher] No active jobs found. Exiting.')
      return
    }

    // 2. Get all students
    // To scale this in production, this should be paginated or streamed
    const students = await User.find({ role: 'student' }).lean()
    
    let notificationsCreated = 0

    // 3. For each student, find matches
    for (const student of students) {
      const userSkills = student.profile?.skills || []
      if (!userSkills.length) continue

      const notifications = await notifyStudentAboutMatchingJobs(student, activeJobs, 50)
      notificationsCreated += notifications.filter(Boolean).length
    }

    console.log(`[Job Matcher] Routine complete. Created ${notificationsCreated} new notifications.`)
  } catch (error) {
    console.error('[Job Matcher] Error during daily matching routine:', error)
  }
}

/**
 * Initializes the cron schedule
 */
export function initJobMatchingCron() {
  // Run every day at 08:00 AM server time
  cron.schedule('0 8 * * *', () => {
    runDailyJobMatching()
  })
  
  console.log('[Job Matcher] Daily cron job scheduled for 08:00 AM')
}
