const LEVEL_ORDER = ['beginner', 'intermediate', 'advanced', 'expert']

/**
 * Normalize a skill name to a clean string
 */
function normalizeSkillName(value) {
  const cleaned = String(value || '').trim()
  return cleaned.length > 0 ? cleaned : null
}

/**
 * Get numeric rank for a skill level
 */
function levelRank(level) {
  const normalizedLevel = String(level || '').toLowerCase()
  const index = LEVEL_ORDER.indexOf(normalizedLevel)
  return index >= 0 ? index : 1 // Default to 'intermediate' (index 1)
}

/**
 * Merge two skill levels, keeping the higher one
 */
function mergeSkillLevels(currentLevel, nextLevel) {
  return levelRank(nextLevel) > levelRank(currentLevel) ? nextLevel : currentLevel
}

/**
 * Normalize a skill object to ensure consistent structure
 */
export function normalizeSkillPayload(skill, defaults = {}) {
  if (typeof skill === 'string') {
    const name = normalizeSkillName(skill)
    if (!name) return null

    return {
      name,
      level: defaults.level || 'intermediate',
      years: Math.max(0, Number(defaults.years) || 0),
      verified: Boolean(defaults.verified),
    }
  }

  if (!skill || typeof skill !== 'object') {
    return null
  }

  const name = normalizeSkillName(skill.name)
  if (!name) return null

  return {
    name,
    level: skill.level || defaults.level || 'intermediate',
    years: Math.max(0, Number(skill.years ?? defaults.years ?? 0)),
    verified: Boolean(skill.verified ?? defaults.verified),
  }
}

/**
 * Merge skills into user profile intelligently
 * - Deduplicates by name (case-insensitive)
 * - Upgrades to higher skill levels
 * - Preserves verified status
 * - Returns added and updated skills
 */
export async function mergeSkillsIntoUserProfile(user, skills = [], defaults = {}) {
  // Validate user
  if (!user || typeof user !== 'object') {
    console.warn('[Skill Inventory] Invalid user object provided')
    return { addedSkills: [], updatedSkills: [], allSkills: [] }
  }

  // Initialize user profile structure if needed
  if (!user.profile) {
    user.profile = {}
  }

  if (!Array.isArray(user.profile.skills)) {
    user.profile.skills = []
  }

  // Normalize and validate incoming skills
  const normalizedSkills = skills
    .map((skill) => normalizeSkillPayload(skill, defaults))
    .filter((skill) => skill !== null)

  if (normalizedSkills.length === 0) {
    return {
      addedSkills: [],
      updatedSkills: [],
      allSkills: user.profile.skills,
    }
  }

  // Build map of existing skills by lowercase name
  const existingSkillMap = new Map()
  user.profile.skills.forEach((skill, index) => {
    const skillName = normalizeSkillName(skill?.name)
    if (skillName) {
      existingSkillMap.set(skillName.toLowerCase(), { skill, index })
    }
  })

  const addedSkills = []
  const updatedSkills = []

  // Process each incoming skill
  for (const incomingSkill of normalizedSkills) {
    const keyLower = incomingSkill.name.toLowerCase()
    const existing = existingSkillMap.get(keyLower)

    if (!existing) {
      // New skill - add it
      const newSkill = {
        name: incomingSkill.name,
        level: incomingSkill.level,
        years: incomingSkill.years,
        verified: incomingSkill.verified,
      }
      user.profile.skills.push(newSkill)
      addedSkills.push(newSkill)
      continue
    }

    // Existing skill - merge intelligently
    const currentSkill = existing.skill
    const newLevel = mergeSkillLevels(currentSkill.level || 'intermediate', incomingSkill.level)
    const newYears = Math.max(Number(currentSkill.years) || 0, incomingSkill.years)
    const newVerified = Boolean(currentSkill.verified || incomingSkill.verified)

    // Check if any field changed
    const levelChanged = currentSkill.level !== newLevel
    const yearsChanged = Number(currentSkill.years) !== newYears
    const verifiedChanged = Boolean(currentSkill.verified) !== newVerified

    if (levelChanged || yearsChanged || verifiedChanged) {
      // Update existing skill
      currentSkill.level = newLevel
      currentSkill.years = newYears
      currentSkill.verified = newVerified
      updatedSkills.push(currentSkill)
    }
  }

  // Save user if any changes were made
  if (addedSkills.length > 0 || updatedSkills.length > 0) {
    try {
      user.markModified('profile.skills')
      await user.save()
    } catch (error) {
      console.error(`[Skill Inventory] Error saving user ${user._id}:`, error.message)
      throw error
    }
  }

  return {
    addedSkills,
    updatedSkills,
    allSkills: user.profile.skills,
  }
}
