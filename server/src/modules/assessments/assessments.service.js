export function serializeAssessment(assessmentDocument) {
  const assessment = assessmentDocument.toObject
    ? assessmentDocument.toObject()
    : assessmentDocument

  return {
    id: String(assessment._id || assessment.id),
    title: assessment.title,
    slug: assessment.slug,
    description: assessment.description || '',
    durationMinutes: assessment.durationMinutes || 30,
    status: assessment.status,
    createdAt: assessment.createdAt,
    updatedAt: assessment.updatedAt,
  }
}
