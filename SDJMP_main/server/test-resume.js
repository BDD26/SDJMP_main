import mongoose from 'mongoose'
import { processResumeForUser, extractTextFromPdf } from './src/modules/users/resume.service.js'
import env from './src/config/env.js'

console.log('Test script loaded')

  console.log('Connected to DB')

  // Find the student user
  const user = await mongoose.connection.db.collection('users').findOne({ role: 'student' })
  if (!user) {
    console.error('No student found in DB')
    process.exit(1)
  }

  // Find their resume
  const resume = await mongoose.connection.db.collection('resumes').findOne({ studentId: user._id })
  if (!resume) {
    console.error('No resume found for student')
    process.exit(1)
  }

  console.log(`Running processResumeForUser for user ${user._id} and resume ${resume.fileUrl}...`)
  
  await processResumeForUser(user._id, resume.fileUrl, 'application/pdf')
  
  console.log('Done.')
  process.exit(0)
}

runTest().catch(console.error)
