/**
 * Skill Matcher Service
 * Calculates the compatibility percentage between a user's skills and a job's requirements.
 */

const LEVEL_RANK = {
  'beginner': 1,
  'intermediate': 2,
  'advanced': 3,
  'expert': 4,
}

function getLevelRank(level) {
  const normalized = String(level || '').toLowerCase()
  return LEVEL_RANK[normalized] || 2 // Default to intermediate
}

/**
 * Compare an array of user skills to an array of job skill requirements.
 * Returns a score between 0 and 100 representing the match percentage.
 * 
 * Scoring:
 * - Skill match: +weight points
 * - Verified skill: +weight × 1.5 points (bonus for badge holders)
 * - Level match bonus: +weight × 0.5 if user level >= required level
 * - Level mismatch penalty: skill still counts but only partial weight
 * 
 * @param {Array} userSkills - Array of objects like { name: 'React', level: 'intermediate', verified: true }
 * @param {Array} jobRequirements - Array of objects like { name: 'React', weight: 10, level: 'intermediate' }
 * @returns {Number} Matching percentage 0-100
 */
export function calculateMatchScore(userSkills = [], jobRequirements = []) {
  // Edge case: job has no skill requirements
  if (!jobRequirements || jobRequirements.length === 0) {
    return 0 // No skills required = we can't match on skills (return 0, let other factors decide)
  }

  // Edge case: user has no skills
  if (!userSkills || userSkills.length === 0) {
    return 0
  }

  // Build map of user skills for efficient lookup
  const userSkillMap = new Map()
  for (const skill of userSkills) {
    if (!skill) continue

    // Handle both string and object formats
    const skillName = typeof skill === 'string' ? skill : skill.name
    if (!skillName) continue

    const normalized = String(skillName).toLowerCase().trim()
    userSkillMap.set(normalized, {
      name: skillName,
      level: skill.level || 'intermediate',
      verified: Boolean(skill.verified),
      years: Number(skill.years) || 0,
    })
  }

  let totalWeight = 0
  let earnedScore = 0

  // Score each job requirement
  for (const req of jobRequirements) {
    if (!req || !req.name) continue

    const reqName = String(req.name).toLowerCase().trim()
    const weight = typeof req.weight === 'number' && req.weight > 0 ? req.weight : 10
    const requiredLevel = req.level ? getLevelRank(req.level) : 2 // Default to intermediate

    totalWeight += weight

    const userSkill = userSkillMap.get(reqName)

    if (!userSkill) {
      // User doesn't have this skill - no points
      continue
    }

    // User has the skill - award base points
    let points = weight

    // Bonus for verified skills (badge holders get 1.5x)
    if (userSkill.verified) {
      points = weight * 1.5
    }

    // Bonus for meeting or exceeding required level
    const userLevel = getLevelRank(userSkill.level)
    if (userLevel >= requiredLevel) {
      // User meets or exceeds required level
      points += weight * 0.5
    } else {
      // User's level is below requirement - still count but reduce points
      const levelGap = requiredLevel - userLevel
      points = weight * (1 - levelGap * 0.2) // 20% penalty per level gap
    }

    earnedScore += points
  }

  // Prevent divide by zero
  if (totalWeight === 0) return 0

  const percentage = Math.round((earnedScore / totalWeight) * 100)

  // Cap at 100%
  return Math.min(percentage, 100)
}
