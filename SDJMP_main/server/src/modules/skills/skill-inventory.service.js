const LEVEL_ORDER = ['beginner', 'intermediate', 'advanced', 'expert']

function normalizeSkillName(value) {
  return String(value || '').trim()
}

function levelRank(level) {
  const normalizedLevel = String(level || '').toLowerCase()
  const index = LEVEL_ORDER.indexOf(normalizedLevel)
  return index >= 0 ? index : 1
}

function mergeSkillLevels(currentLevel, nextLevel) {
  return levelRank(nextLevel) > levelRank(currentLevel) ? nextLevel : currentLevel
}

export function normalizeSkillPayload(skill, defaults = {}) {
  if (typeof skill === 'string') {
    return {
      name: normalizeSkillName(skill),
      level: defaults.level || 'intermediate',
      years: Number(defaults.years) || 0,
      verified: Boolean(defaults.verified),
    }
  }

  return {
    name: normalizeSkillName(skill?.name),
    level: skill?.level || defaults.level || 'intermediate',
    years: Number(skill?.years ?? defaults.years ?? 0) || 0,
    verified: Boolean(skill?.verified ?? defaults.verified),
  }
}

export async function mergeSkillsIntoUserProfile(user, skills = [], defaults = {}) {
  if (!user) {
    return { addedSkills: [], updatedSkills: [], allSkills: [] }
  }

  if (!user.profile) {
    user.profile = {}
  }

  if (!Array.isArray(user.profile.skills)) {
    user.profile.skills = []
  }

  const normalizedSkills = skills
    .map((skill) => normalizeSkillPayload(skill, defaults))
    .filter((skill) => skill.name)

  if (normalizedSkills.length === 0) {
    return { addedSkills: [], updatedSkills: [], allSkills: user.profile.skills }
  }

  const existingSkillMap = new Map(
    user.profile.skills.map((skill, index) => [normalizeSkillName(skill?.name).toLowerCase(), { skill, index }])
  )

  const addedSkills = []
  const updatedSkills = []

  for (const incomingSkill of normalizedSkills) {
    const key = incomingSkill.name.toLowerCase()
    const existing = existingSkillMap.get(key)

    if (!existing) {
      const nextSkill = {
        name: incomingSkill.name,
        level: incomingSkill.level || 'intermediate',
        years: Number(incomingSkill.years) || 0,
        verified: Boolean(incomingSkill.verified),
      }
      user.profile.skills.push(nextSkill)
      existingSkillMap.set(key, { skill: nextSkill, index: user.profile.skills.length - 1 })
      addedSkills.push(nextSkill)
      continue
    }

    const currentSkill = existing.skill
    const nextLevel = mergeSkillLevels(currentSkill.level || 'intermediate', incomingSkill.level || currentSkill.level)
    const nextYears = Math.max(Number(currentSkill.years) || 0, Number(incomingSkill.years) || 0)
    const nextVerified = Boolean(currentSkill.verified || incomingSkill.verified)

    const changed =
      currentSkill.level !== nextLevel ||
      Number(currentSkill.years) !== nextYears ||
      Boolean(currentSkill.verified) !== nextVerified

    if (changed) {
      currentSkill.level = nextLevel
      currentSkill.years = nextYears
      currentSkill.verified = nextVerified
      updatedSkills.push(currentSkill)
    }
  }

  if (addedSkills.length > 0 || updatedSkills.length > 0) {
    user.markModified('profile.skills')
    await user.save()
  }

  return {
    addedSkills,
    updatedSkills,
    allSkills: user.profile.skills,
  }
}
