const LEVEL_ORDER = ['beginner', 'intermediate', 'advanced', 'expert']

function buildSkillSourceKey(source = {}) {
  return [
    String(source.type || '').toLowerCase(),
    String(source.sourceId || '').trim().toLowerCase(),
    String(source.category || '').trim().toLowerCase(),
  ].join('|')
}

/**
 * Normalize a skill name to a clean string
 */
function normalizeSkillName(value) {
  const cleaned = String(value || '').trim()
  return cleaned.length > 0 ? cleaned : null
}

/**
 * Normalize a skill source entry for provenance tracking.
 */
export function normalizeSkillSource(source, defaults = {}) {
  if (!source || typeof source !== 'object') {
    const fallbackType = normalizeSkillName(defaults.type || defaults.category || '')
    if (!fallbackType) {
      return null
    }

    return {
      type: String(fallbackType).toLowerCase(),
      sourceId: String(defaults.sourceId || '').trim(),
      category: String(defaults.category || '').trim(),
    }
  }

  const type = normalizeSkillName(source.type || defaults.type || defaults.category || '')
  const sourceId = String(source.sourceId ?? defaults.sourceId ?? '').trim()
  const category = String(source.category ?? defaults.category ?? '').trim()

  if (!type && !sourceId && !category) {
    return null
  }

  return {
    type: String(type || 'manual').toLowerCase(),
    sourceId,
    category,
  }
}

export function normalizeSkillSources(sources = [], defaults = {}) {
  const sourceList = Array.isArray(sources) ? sources : [sources]
  const normalizedSources = sourceList
    .map((source) => normalizeSkillSource(source, defaults))
    .filter(Boolean)

  const deduped = []
  const seen = new Set()

  normalizedSources.forEach((source) => {
    const key = buildSkillSourceKey(source)
    if (!seen.has(key)) {
      seen.add(key)
      deduped.push(source)
    }
  })

  return deduped
}

export function collectNormalizedSkillNames(values = []) {
  const source = Array.isArray(values) ? values.flat(Infinity) : [values]
  const names = new Set()

  source.forEach((value) => {
    if (typeof value === 'string') {
      const normalized = normalizeSkillName(value)
      if (normalized) {
        names.add(normalized.toLowerCase())
      }
      return
    }

    if (value && typeof value === 'object') {
      const normalized = normalizeSkillName(value.name || value.label || '')
      if (normalized) {
        names.add(normalized.toLowerCase())
      }
    }
  })

  return names
}

function mergeSkillSources(currentSources = [], incomingSources = []) {
  return normalizeSkillSources([...currentSources, ...incomingSources])
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
      sources: normalizeSkillSources(defaults.sources || defaults.source || []),
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
    sources: normalizeSkillSources(skill.sources || defaults.sources || defaults.source || []),
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
        sources: normalizeSkillSources(incomingSkill.sources),
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
    const newSources = mergeSkillSources(currentSkill.sources || [], incomingSkill.sources || [])

    // Check if any field changed
    const levelChanged = currentSkill.level !== newLevel
    const yearsChanged = Number(currentSkill.years) !== newYears
    const verifiedChanged = Boolean(currentSkill.verified) !== newVerified
    const sourcesChanged =
      JSON.stringify(normalizeSkillSources(currentSkill.sources || [])) !== JSON.stringify(newSources)

    if (levelChanged || yearsChanged || verifiedChanged || sourcesChanged) {
      // Update existing skill
      currentSkill.level = newLevel
      currentSkill.years = newYears
      currentSkill.verified = newVerified
      currentSkill.sources = newSources
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

export async function removeSkillSourceFromUserProfile(
  user,
  {
    sourceType = '',
    sourceId = '',
    fallbackSkillNames = [],
    preserveFallbackSkillNames = [],
  } = {}
) {
  if (!user || typeof user !== 'object') {
    return { changed: false, removedSkills: [], allSkills: [] }
  }

  if (!user.profile) {
    user.profile = {}
  }

  if (!Array.isArray(user.profile.skills)) {
    user.profile.skills = []
  }

  const normalizedSourceType = String(sourceType || '').trim().toLowerCase()
  const normalizedSourceId = String(sourceId || '').trim()
  const fallbackSet = collectNormalizedSkillNames(fallbackSkillNames)
  const preserveSet = collectNormalizedSkillNames(preserveFallbackSkillNames)
  const removedSkills = []
  let changed = false

  const nextSkills = []

  for (const skill of user.profile.skills) {
    const skillName = normalizeSkillName(skill?.name)
    if (!skillName) {
      changed = true
      continue
    }

    const normalizedSources = normalizeSkillSources(skill.sources || [])
    let nextSources = normalizedSources
    let removedMatchingSource = false

    if (normalizedSourceType || normalizedSourceId) {
      nextSources = normalizedSources.filter((source) => {
        const typeMatches = normalizedSourceType
          ? String(source.type || '').toLowerCase() === normalizedSourceType
          : true
        const sourceIdMatches = normalizedSourceId
          ? String(source.sourceId || '') === normalizedSourceId
          : true
        const shouldRemove = typeMatches && sourceIdMatches
        if (shouldRemove) {
          removedMatchingSource = true
        }
        return !shouldRemove
      })
    }

    const normalizedSkillName = skillName.toLowerCase()
    const isLegacyResumeSkill =
      normalizedSources.length === 0 &&
      fallbackSet.has(normalizedSkillName) &&
      !preserveSet.has(normalizedSkillName) &&
      !Boolean(skill.verified) &&
      (Number(skill.years) || 0) === 0

    const shouldRemoveSkill =
      isLegacyResumeSkill ||
      (removedMatchingSource &&
        nextSources.length === 0 &&
        !Boolean(skill.verified) &&
        (Number(skill.years) || 0) === 0)

    if (shouldRemoveSkill) {
      removedSkills.push(skill.name)
      changed = true
      continue
    }

    if (removedMatchingSource) {
      skill.sources = nextSources
      changed = true
    } else if (JSON.stringify(skill.sources || []) !== JSON.stringify(normalizedSources)) {
      skill.sources = normalizedSources
      changed = true
    }

    nextSkills.push(skill)
  }

  if (changed) {
    user.profile.skills = nextSkills
    user.markModified('profile.skills')
    await user.save()
  }

  return {
    changed,
    removedSkills,
    allSkills: user.profile.skills,
  }
}
