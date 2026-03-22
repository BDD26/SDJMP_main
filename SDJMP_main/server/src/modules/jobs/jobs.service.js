export function serializeJob(jobDocument) {
  const job = jobDocument.toObject ? jobDocument.toObject() : jobDocument

  return {
    id: String(job._id || job.id),
    title: job.title,
    company: job.companyName,
    companyName: job.companyName,
    employerId: String(job.employerId),
    location: job.location || '',
    type: job.type,
    salary: job.salary || '',
    description: job.description || '',
    skills: job.skills || [],
    requirements: job.requirements || [],
    deadline: job.deadline,
    status: job.status,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  }
}
