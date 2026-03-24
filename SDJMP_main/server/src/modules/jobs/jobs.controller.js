import Job from './job.model.js'
import Application from '../applications/application.model.js'
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
    companyName: body.companyName || req.user.company?.name || req.user.name || 'Unknown Company',
    deadline: body.deadline ? new Date(body.deadline) : null,
    employerId: req.user._id,
  })

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
  const jobs = await Job.find({ status: 'published' }).sort({ createdAt: -1 })
  
  const userProfile = req.user.profile || {}
  const userSkills = (userProfile.skills || []).map(s => {
    if (typeof s === 'string') return s.toLowerCase()
    return s.name ? s.name.toLowerCase() : ''
  }).filter(Boolean)

  const preferredLocations = (userProfile.preferences?.locations || []).map(l => {
    if (typeof l === 'string') return l.toLowerCase()
    return ''
  }).filter(Boolean)
  
  const preferredJobTypes = (userProfile.preferences?.jobTypes || []).map(t => {
     if (typeof t === 'string') return t.toLowerCase()
     return ''
  }).filter(Boolean)

  const matches = jobs.map(job => {
    const jobSkills = (job.skills || []).map(s => s.toLowerCase())
    
    let skillMatchScore = 0
    if (jobSkills.length > 0) {
      const overlap = jobSkills.filter(js => userSkills.includes(js)).length
      skillMatchScore = Math.round((overlap / jobSkills.length) * 100)
    } else {
      skillMatchScore = 50 
    }

    let matchScore = skillMatchScore * 0.7

    if (preferredLocations.length > 0 && job.location) {
      const jobLoc = job.location.toLowerCase()
      const locMatch = preferredLocations.some(l => jobLoc.includes(l) || (l.includes('remote') && jobLoc.includes('remote')))
      if (locMatch) matchScore += 15
    } else {
      matchScore += 10
    }

    if (preferredJobTypes.length > 0 && job.type) {
      const typeMatch = preferredJobTypes.includes(job.type.toLowerCase())
      if (typeMatch) matchScore += 15
    } else {
      matchScore += 10
    }

    matchScore = Math.min(100, Math.round(matchScore))

    return {
      ...serializeJob(job),
      matchScore,
    }
  })

  matches.sort((a, b) => b.matchScore - a.matchScore)

  res.status(200).json(matches)
}
