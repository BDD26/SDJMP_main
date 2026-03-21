export function serializeApplication(applicationDocument) {
  const application = applicationDocument.toObject
    ? applicationDocument.toObject()
    : applicationDocument

  const student = application.studentId
  const job = application.jobId

  return {
    id: String(application._id || application.id),
    jobId: typeof job === 'object' && job?._id ? String(job._id) : String(application.jobId),
    studentId:
      typeof student === 'object' && student?._id
        ? String(student._id)
        : String(application.studentId),
    employerId: String(application.employerId),
    status: application.status,
    coverLetter: application.coverLetter || '',
    resumeId: application.resumeId || '',
    notes: application.notes || '',
    interview: application.interview || null,
    createdAt: application.createdAt,
    updatedAt: application.updatedAt,
    ...(job
      ? {
          job: {
            id: String(job._id || application.jobId),
            title: job.title,
            company: job.companyName,
            location: job.location,
            type: job.type,
            salary: job.salary,
            status: job.status,
          },
        }
      : {}),
    ...(student
      ? {
          student: {
            id: String(student._id || application.studentId),
            name: student.name,
            email: student.email,
            avatar: student.avatar || '',
            profile: student.profile || {},
          },
        }
      : {}),
  }
}
