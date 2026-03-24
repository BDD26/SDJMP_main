import Application from './application.model.js'
import Job from '../jobs/job.model.js'
import Resume from '../users/resume.model.js'
import { createHttpError } from '../../utils/http-error.js'
import { serializeApplication } from './applications.service.js'
import { computeMatchScore, formatRelative } from '../employer/employer.controller.js'

function canManageApplication(application, user) {
  if (user.role === 'super_admin') {
    return true
  }

  if (user.role === 'employer' && String(application.employerId) === String(user._id)) {
    return true
  }

  if (user.role === 'student' && String(application.studentId) === String(user._id)) {
    return true
  }

  return false
}

export async function createApplication(req, res) {
  if (req.user.role !== 'student') {
    throw createHttpError(403, 'Only students can apply to jobs')
  }

  const { jobId, coverLetter, resumeId, notes } = req.validated.body
  const job = await Job.findById(jobId)

  if (!job) {
    throw createHttpError(404, 'Job not found')
  }

  if (job.status !== 'published') {
    throw createHttpError(400, 'This job is not accepting applications')
  }

  const existingApplication = await Application.findOne({
    jobId: job._id,
    studentId: req.user._id,
  })

  if (existingApplication) {
    throw createHttpError(409, 'You have already applied to this job')
  }

  let finalResumeId = null
  if (resumeId) {
    const resume = await Resume.findOne({ _id: resumeId, studentId: req.user._id })
    if (!resume) {
      throw createHttpError(400, 'Invalid or unauthorized resume selected')
    }
    finalResumeId = resume._id
  }

  const application = await Application.create({
    jobId: job._id,
    studentId: req.user._id,
    employerId: job.employerId,
    coverLetter,
    resumeId: finalResumeId,
    notes,
  })

  const populatedApplication = await Application.findById(application._id)
    .populate('jobId')
    .populate('studentId', 'name email avatar profile')
    .populate('resumeId')

  res.status(201).json(serializeApplication(populatedApplication))
}

export async function getMyApplications(req, res) {
  if (req.user.role !== 'student') {
    throw createHttpError(403, 'Only students can access personal applications')
  }

  const applications = await Application.find({ studentId: req.user._id })
    .populate('jobId')
    .populate('resumeId')
    .sort({ createdAt: -1 })

  // Transform strictly for the frontend specific expectation
  const formattedApplications = applications.map(app => {
    const serialized = serializeApplication(app)
    
    return {
      ...serialized,
      position: app.jobId?.title || 'Unknown Position',
      company: app.jobId?.companyName || 'Unknown Company',
      location: app.jobId?.location || 'Remote',
      appliedDate: app.createdAt,
      nextStep: app.interview ? `Interview - ${new Date(app.interview.date).toLocaleDateString()}` : 'Awaiting review'
    }
  })

  res.status(200).json(formattedApplications)
}

export async function getApplicationsForJob(req, res) {
  const job = await Job.findById(req.params.jobId)

  if (!job) {
    throw createHttpError(404, 'Job not found')
  }

  if (
    req.user.role !== 'super_admin' &&
    !(req.user.role === 'employer' && String(job.employerId) === String(req.user._id))
  ) {
    throw createHttpError(403, 'You do not have access to this job')
  }

  const applications = await Application.find({ jobId: req.params.jobId })
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
      position: job.title || 'Unknown Position',
      status: app.status,
      appliedDate: formatRelative(app.createdAt),
      notes: app.notes || '',
      interview: app.interview || null,
      coverLetter: app.coverLetter || '',
      matchScore: matchData.score,
      matchedSkills: matchData.matchedSkills,
      missingSkills: matchData.missingSkills,
      jobId: String(job._id),
    }
  })

  res.status(200).json(result)
}

export async function updateInterviewStatus(req, res) {
  const application = await Application.findById(req.params.applicationId)

  if (!application) {
    throw createHttpError(404, 'Application not found')
  }

  if (req.user.role === 'student' || String(application.employerId) !== String(req.user._id)) {
    throw createHttpError(403, 'You do not have access to this application')
  }

  const { status } = req.body
  if (!['scheduled', 'completed', 'cancelled'].includes(status)) {
    throw createHttpError(400, 'Invalid interview status')
  }

  if (!application.interview) {
    throw createHttpError(400, 'No interview scheduled for this application')
  }

  application.interview.status = status
  await application.save()

  const populated = await Application.findById(application._id)
    .populate('jobId')
    .populate('studentId', 'name email avatar profile')
  res.status(200).json(serializeApplication(populated))
}

export async function withdrawApplication(req, res) {
  const application = await Application.findById(req.params.applicationId)

  if (!application) {
    throw createHttpError(404, 'Application not found')
  }

  if (!canManageApplication(application, req.user) || req.user.role !== 'student') {
    throw createHttpError(403, 'You do not have access to this application')
  }

  application.status = 'withdrawn'
  await application.save()

  res.status(200).json({
    message: 'Application withdrawn successfully',
  })
}

export async function updateApplicationStatus(req, res) {
  const application = await Application.findById(req.params.applicationId)

  if (!application) {
    throw createHttpError(404, 'Application not found')
  }

  if (!canManageApplication(application, req.user) || req.user.role === 'student') {
    throw createHttpError(403, 'You do not have access to update this application')
  }

  application.status = req.validated.body.status
  application.notes = req.validated.body.notes

  if (req.validated.body.interview) {
    application.interview = {
      ...(application.interview || {}),
      ...req.validated.body.interview,
    }
  }

  await application.save()

  const populatedApplication = await Application.findById(application._id)
    .populate('jobId')
    .populate('studentId', 'name email avatar profile')

  res.status(200).json(serializeApplication(populatedApplication))
}
