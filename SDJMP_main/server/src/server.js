import app from './app.js'
import env from './config/env.js'
import { connectDatabase } from './config/database.js'
import { initJobMatchingCron } from './modules/jobs/matching.cron.js'

async function startServer() {
  try {
    await connectDatabase()

    app.listen(env.port, () => {
      console.warn(`SkillMatch API listening on http://localhost:${env.port}`)
      initJobMatchingCron()
    })
  } catch (error) {
    console.error('Failed to start server', error)
    process.exit(1)
  }
}

startServer()
