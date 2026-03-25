import Job from './job.model.js'
import Application from '../applications/application.model.js'
import { serializeJob } from './jobs.service.js'
import { createHttpError } from '../../utils/http-error.js'
import { computeStudentMatches, notifyStudentsForJob } from './job-match.pipeline.js'

function buildPublicJobFilter(query = {}) {
  const filter = {
    status: 'published',
  }

  if (query.q) {
    filter.$text = { $search: query.q }
  }

  if (query.type) {
    filter.type = query.type
  }

  if (query.location) {
    filter.location = { $regex: query.location, $options: 'i' }
  }

  return filter
}

function canManageJob(job, user) {
  if (user.role === 'super_admin') {
    return true
  }

  return String(job.employerId) === String(user._id)
}

export async function listJobs(req, res) {
  const jobs = await Job.find(buildPublicJobFilter(req.query)).sort({ createdAt: -1 })

  res.status(200).json(jobs.map(serializeJob))
}

export async function getJobById(req, res) {
  const job = await Job.findById(req.params.jobId)

  if (!job) {
    throw createHttpError(404, 'Job not found')
  }

  res.status(200).json(serializeJob(job))
}

export async function searchJobs(req, res) {
  const jobs = await Job.find(buildPublicJobFilter(req.query)).sort({ createdAt: -1 })

  res.status(200).json(jobs.map(serializeJob))
}

export async function getRecommendedJobs(req, res) {
  const jobs = await Job.find({ status: 'published' }).sort({ createdAt: -1 }).limit(6)

  res.status(200).json(jobs.map(serializeJob))
}

export async function createJob(req, res) {
  const { body } = req.validated

  const job = await Job.create({
    ...body,
    companyName: body.companyName || req.user.company?.name || req.user.name || 'Unknown Company',
    deadline: body.deadline ? new Date(body.deadline) : null,
    employerId: req.user._id,
  })

  if (job.status === 'published') {
    await notifyStudentsForJob(job.toObject ? job.toObject() : job)
  }

  res.status(201).json(serializeJob(job))
}

export async function getEmployerJobs(req, res) {
  const jobs = await Job.find({ employerId: req.user._id }).sort({ createdAt: -1 }).lean()

  if (!jobs.length) {
    return res.status(200).json([])
  }

  const jobIds = jobs.map((j) => j._id)

  // Aggregate applicant and interview counts per job in one query
  const aggregation = await Application.aggregate([
    { $match: { jobId: { $in: jobIds } } },
    {
      $group: {
        _id: '$jobId',
        applicants: { $sum: 1 },
        interviews: {
          $sum: { $cond: [{ $eq: ['$status', 'interview'] }, 1, 0] },
        },
      },
    },
  ])

  const countsMap = {}
  aggregation.forEach((row) => {
    countsMap[String(row._id)] = { applicants: row.applicants, interviews: row.interviews }
  })

  const result = jobs.map((job) => {
    const serialized = serializeJob({ ...job, toObject: () => job })
    const counts = countsMap[String(job._id)] || { applicants: 0, interviews: 0 }
    return { ...serialized, applicants: counts.applicants, interviews: counts.interviews }
  })

  res.status(200).json(result)
}

export async function updateJob(req, res) {
  const job = await Job.findById(req.params.jobId)

  if (!job) {
    throw createHttpError(404, 'Job not found')
  }

  if (!canManageJob(job, req.user)) {
    throw createHttpError(403, 'You do not have access to this job')
  }

  const updates = req.validated.body
  Object.entries(updates).forEach(([key, value]) => {
    if (key === 'companyName') {
      return
    }

    if (key === 'deadline') {
      job.deadline = value ? new Date(value) : null
      return
    }

    job[key] = value
  })

  job.companyName = req.user.company?.name || req.user.name || job.companyName

  await job.save()

  res.status(200).json(serializeJob(job))
}

export async function deleteJob(req, res) {
  const job = await Job.findById(req.params.jobId)

  if (!job) {
    throw createHttpError(404, 'Job not found')
  }

  if (!canManageJob(job, req.user)) {
    throw createHttpError(403, 'You do not have access to this job')
  }

  await Application.deleteMany({ jobId: job._id })
  await job.deleteOne()

  res.status(200).json({
    message: 'Job deleted successfully',
  })
}

export async function getStudentMatches(req, res) {
  const jobs = await Job.find({ status: 'published' }).sort({ createdAt: -1 }).lean()
  const matches = computeStudentMatches(req.user, jobs).map(({ job, matchScore }) => ({
    ...serializeJob(job),
    matchScore,
  }))

  res.status(200).json(matches)
}
