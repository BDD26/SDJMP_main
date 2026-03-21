import Job from './job.model.js'
import { serializeJob } from './jobs.service.js'
import { createHttpError } from '../../utils/http-error.js'

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
    deadline: body.deadline ? new Date(body.deadline) : null,
    employerId: req.user._id,
  })

  res.status(201).json(serializeJob(job))
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
    if (key === 'deadline') {
      job.deadline = value ? new Date(value) : null
      return
    }

    job[key] = value
  })

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

  await job.deleteOne()

  res.status(200).json({
    message: 'Job deleted successfully',
  })
}
