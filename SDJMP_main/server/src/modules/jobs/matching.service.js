/**
 * Skill Matcher Service
 * Calculates the compatibility percentage between a user's skills and a job's requirements.
 */

/**
 * Compare an array of user skills to an array of job skill requirements.
 * Returns a score between 0 and 100 representing the match percentage.
 * 
 * @param {Array} userSkills - Array of objects like { name: 'React', level: 'intermediate' }
 * @param {Array} jobRequirements - Array of objects like { name: 'React', weight: 10 }
 * @returns {Number} Matching percentage 0-100
 */
export function calculateMatchScore(userSkills = [], jobRequirements = []) {
  if (!jobRequirements || jobRequirements.length === 0) {
    return 100; // If job has no requirements, it's a 100% match technically, or maybe 0. Let's return 100.
  }

  if (!userSkills || userSkills.length === 0) {
    return 0; // User has no skills
  }

  // Normalize user skills for easy lookup
  const userSkillMap = new Map()
  userSkills.forEach(skill => {
    if (skill.name) {
      userSkillMap.set(skill.name.toLowerCase().trim(), skill)
    }
  })

  let totalWeight = 0;
  let earnedScore = 0;

  for (const req of jobRequirements) {
    if (!req.name) continue;
    
    const reqName = req.name.toLowerCase().trim();
    // Use default weight of 10 if not specified
    const weight = typeof req.weight === 'number' ? req.weight : 10;
    
    totalWeight += weight;

    // Check if user has this skill
    const userHasSkill = userSkillMap.has(reqName);
    
    if (userHasSkill) {
      // Basic match gets full weight of the requirement
      // If the skill is verified, give it a 1.5x boost
      const skillData = userSkillMap.get(reqName);
      if (skillData && skillData.verified) {
        earnedScore += weight * 1.5;
      } else {
        earnedScore += weight;
      }
    }
  }

  // Prevent divide by zero
  if (totalWeight === 0) return 100;

  const percentage = Math.round((earnedScore / totalWeight) * 100);
  
  // Cap at 100 just in case
  return Math.min(percentage, 100);
}
