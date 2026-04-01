export function serializeSkill(skillDocument) {
  const skill = skillDocument.toObject ? skillDocument.toObject() : skillDocument

  return {
    id: String(skill._id || skill.id),
    name: skill.name,
    category: skill.category,
    categoryLabel: skill.categoryLabel || '',
    categoryDescription: skill.categoryDescription || '',
    description: skill.description || '',
    popularity: skill.popularity || 0,
    demand: Math.max(0, Number(skill.demand) || 0),
    jobs: Math.max(0, Number(skill.jobs) || 0),
    growth: `+${Math.max(0, Number(skill.growth) || 0)}%`,
    growthValue: Math.max(0, Number(skill.growth) || 0),
    tracks: Array.isArray(skill.tracks) ? skill.tracks : [],
    createdAt: skill.createdAt,
    updatedAt: skill.updatedAt,
  }
}
