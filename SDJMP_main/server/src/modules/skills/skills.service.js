export function serializeSkill(skillDocument) {
  const skill = skillDocument.toObject ? skillDocument.toObject() : skillDocument

  return {
    id: String(skill._id || skill.id),
    name: skill.name,
    category: skill.category,
    description: skill.description || '',
    popularity: skill.popularity || 0,
    createdAt: skill.createdAt,
    updatedAt: skill.updatedAt,
  }
}
