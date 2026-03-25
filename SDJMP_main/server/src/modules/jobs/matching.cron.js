import cron from 'node-cron'
import Job from './job.model.js'
import User from '../users/user.model.js'
import { notifyStudentAboutMatchingJobs } from './job-match.pipeline.js'

const BATCH_SIZE = 100 // Process students in batches of 100
const MAX_CONCURRENT_BATCHES = 3 // Process up to 3 batches in parallel

/**
 * Process a batch of students and match them against jobs
 */
async function processBatch(students, jobs) {
  if (!students || students.length === 0 || !jobs || jobs.length === 0) {
    return 0
  }

  let notificationsCreated = 0

  for (const student of students) {
    // Skip students with no skills (they won't match anything)
    const userSkills = student.profile?.skills || []
    if (userSkills.length === 0) {
      continue
    }

    try {
      const notifications = await notifyStudentAboutMatchingJobs(student, jobs, 50)
      const validNotifications = notifications.filter(Boolean)
      notificationsCreated += validNotifications.length
    } catch (error) {
      console.error(`[Job Matcher] Error matching jobs for student ${student._id}:`, error.message)
      // Continue with next student if one fails
    }
  }

  return notificationsCreated
}

/**
 * Runs the matching algorithm for all active students against all published jobs.
 * Creates notifications for any matches >= 50%.
 * Uses pagination to handle large datasets efficiently.
 */
export async function runDailyJobMatching() {
  console.log('[Job Matcher] Starting daily job matching routine...')
  const startTime = Date.now()

  try {
    // 1. Fetch all published jobs
    let activeJobs = []
    try {
      activeJobs = await Job.find({ status: 'published' }).lean()
    } catch (error) {
      console.error('[Job Matcher] Error fetching jobs:', error.message)
      return
    }

    if (!activeJobs || activeJobs.length === 0) {
      console.log('[Job Matcher] No active jobs found. Exiting.')
      return
    }

    console.log(`[Job Matcher] Found ${activeJobs.length} active jobs`)

    // 2. Count total students
    let totalStudents = 0
    try {
      totalStudents = await User.countDocuments({ role: 'student' })
    } catch (error) {
      console.error('[Job Matcher] Error counting students:', error.message)
      return
    }

    if (totalStudents === 0) {
      console.log('[Job Matcher] No students found. Exiting.')
      return
    }

    console.log(`[Job Matcher] Processing ${totalStudents} students in batches of ${BATCH_SIZE}`)

    // 3. Process students in batches with pagination
    let totalNotificationsCreated = 0
    const totalBatches = Math.ceil(totalStudents / BATCH_SIZE)

    for (let batch = 0; batch < totalBatches; batch += MAX_CONCURRENT_BATCHES) {
      // Prepare up to MAX_CONCURRENT_BATCHES in parallel
      const batchPromises = []

      for (let i = 0; i < MAX_CONCURRENT_BATCHES && batch + i < totalBatches; i++) {
        const skip = (batch + i) * BATCH_SIZE
        const limit = BATCH_SIZE

        // Fetch batch in parallel
        const batchPromise = User.find({ role: 'student' })
          .skip(skip)
          .limit(limit)
          .lean()
          .then((students) => processBatch(students, activeJobs))
          .catch((error) => {
            console.error(
              `[Job Matcher] Error processing batch ${batch + i}:`,
              error.message
            )
            return 0
          })

        batchPromises.push(batchPromise)
      }

      // Wait for all batches in this group to complete
      const batchResults = await Promise.all(batchPromises)
      totalNotificationsCreated += batchResults.reduce((sum, count) => sum + count, 0)

      const completedBatches = Math.min(batch + MAX_CONCURRENT_BATCHES, totalBatches)
      console.log(
        `[Job Matcher] Processed ${completedBatches}/${totalBatches} batches (${totalNotificationsCreated} notifications created so far)`
      )
    }

    const duration = Date.now() - startTime
    console.log(
      `[Job Matcher] Routine complete in ${duration}ms. Created ${totalNotificationsCreated} total notifications.`
    )
  } catch (error) {
    console.error('[Job Matcher] Fatal error during daily matching routine:', error.message)
  }
}

/**
 * Initializes the cron schedule
 */
export function initJobMatchingCron() {
  // Run every day at 08:00 AM server time
  cron.schedule('0 8 * * *', () => {
    // Run in background, don't wait
    runDailyJobMatching().catch((error) => {
      console.error('[Job Matcher] Uncaught error in cron job:', error.message)
    })
  })

  console.log('[Job Matcher] Daily cron job scheduled for 08:00 AM')
}
