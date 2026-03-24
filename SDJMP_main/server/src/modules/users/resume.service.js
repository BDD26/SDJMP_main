import pdf from 'pdf-parse/lib/pdf-parse.js'
import fetch from 'node-fetch'
import Skill from '../skills/skill.model.js'
import User from '../users/user.model.js'

/**
 * Downloads the PDF buffer from a given URL
 */
async function getPdfBufferFromUrl(url) {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.statusText}`)
    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch (error) {
    console.error('Error fetching PDF from URL:', error)
    return null
  }
}

/**
 * Extracts raw text from a PDF buffer
 */
export async function extractTextFromPdf(buffer) {
  try {
    const data = await pdf(buffer)
    return data.text
  } catch (error) {
    console.error('PDF parsing error:', error)
    return ''
  }
}

/**
 * Analyzes text against our global Skill dictionary to find matches.
 * Returns an array of skill objects ready to be added to the user's profile.
 */
const FALLBACK_SKILLS = [
  'JavaScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'PHP', 'Swift', 'Go', 'Rust', 'TypeScript', 'HTML', 'CSS',
  'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'Laravel', 'ASP.NET', 'Next.js', 'Nuxt.js',
  'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Cassandra', 'Oracle', 'SQLite',
  'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform', 'Ansible', 'Git', 'GitHub', 'GitLab',
  'Machine Learning', 'Data Science', 'Deep Learning', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision',
  'Agile', 'Scrum', 'Jira', 'Trello', 'Confluence',
  'Linux', 'Unix', 'Windows Server', 'Bash', 'PowerShell',
  'UI/UX', 'Figma', 'Adobe XD', 'Sketch',
  'REST API', 'GraphQL', 'SOAP', 'Microservices', 'System Design'
]

export async function identifySkillsFromText(text) {
  if (!text) return []

  const normalizedText = text.toLowerCase().replace(/[^a-z0-9+#.\- ]/g, ' ')
  
  // Get all globally known skills from the DB
  const dbSkills = await Skill.find({}).lean()
  const dbSkillNamesLower = new Set(dbSkills.map(s => s.name.toLowerCase()))
  
  // Merge DB skills with fallback dictionary
  const allKnownSkillNames = new Set([...dbSkillNamesLower, ...FALLBACK_SKILLS.map(s => s.toLowerCase())])
  
  const foundSkillNames = new Set()

  for (const skillNameLower of allKnownSkillNames) {
    const escapedSkillName = skillNameLower.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
    const regex = new RegExp(`\\b${escapedSkillName}\\b`, 'i')
    
    if (regex.test(normalizedText)) {
      foundSkillNames.add(skillNameLower)
    }
  }

  // Formatting found skills back to Original case via a map
  const caseMap = new Map()
  dbSkills.forEach(s => caseMap.set(s.name.toLowerCase(), s.name))
  FALLBACK_SKILLS.forEach(s => caseMap.set(s.toLowerCase(), s))

  const formattedFoundSkills = []
  
  for (const lowerCaseSkill of foundSkillNames) {
    const originalCase = caseMap.get(lowerCaseSkill)
    formattedFoundSkills.push({
      name: originalCase,
      level: 'intermediate',
      years: 0
    })

    // If this skill wasn't in the global DB, add it to the skill inventory
    if (!dbSkillNamesLower.has(lowerCaseSkill)) {
      try {
        await Skill.create({
          name: originalCase,
          category: 'extracted',
          popularity: 1
        })
        dbSkillNamesLower.add(lowerCaseSkill) // Add to prevent duplicate creations in this loop
      } catch (err) {
        // Ignore duplicate key errors if another async process already inserted it
      }
    } else {
      // If it exists in DB, bump its popularity
      await Skill.updateOne(
        { name: new RegExp(`^${originalCase}$`, 'i') },
        { $inc: { popularity: 1 } }
      ).catch(() => {})
    }
  }

  return formattedFoundSkills
}

/**
 * Main routine: Downloads a resume, parses text, extracts skills,
 * and appends them to the user's profile if they don't already exist.
 */
export async function processResumeForUser(userId, fileUrl, fileType) {
  // We only parse uploaded PDFs
  if (!fileUrl || !fileType.includes('pdf')) return

  try {
    const pdfBuffer = await getPdfBufferFromUrl(fileUrl)
    if (!pdfBuffer) return

    const extractedText = await extractTextFromPdf(pdfBuffer)
    const matchedSkills = await identifySkillsFromText(extractedText)

    if (matchedSkills.length === 0) return

    const user = await User.findById(userId)
    if (!user) return

    // Ensure user.profile and skills array exist
    if (!user.profile) user.profile = {}
    if (!user.profile.skills) user.profile.skills = []

    const currentSkillNames = user.profile.skills.map(s => s.name.toLowerCase())
    let addedNew = false

    // Add newly found skills to user profile
    for (const newSkill of matchedSkills) {
      if (!currentSkillNames.includes(newSkill.name.toLowerCase())) {
        user.profile.skills.push(newSkill)
        addedNew = true
      }
    }

    if (addedNew) {
      // Mark as changed so mongoose saves the mixed subdocument cleanly
      user.markModified('profile.skills')
      await user.save()
      console.log(`[Resume Parser] Added ${matchedSkills.length} skills to user ${userId}`)

      // Generate a comma separated string of new skills
      const skillNames = matchedSkills.map(s => s.name).join(', ')
      
      // Dispatch a notification to the user to take an assessment
      const Notification = (await import('../notifications/notification.model.js')).default;
      await Notification.create({
        userId: user._id,
        type: 'assessment',
        title: 'Verify Your New Skills!',
        message: `We found new skills in your resume (${skillNames}). Take an assessment test to earn a verified badge and boost your job match score!`
      })
    }

  } catch (error) {
    console.error(`[Resume Parser] Error processing resume for user ${userId}:`, error)
  }
}
