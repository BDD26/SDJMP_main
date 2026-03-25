import pdf from 'pdf-parse'
import User from '../users/user.model.js'
import Job from '../jobs/job.model.js'
import { createUserNotification } from '../notifications/notification-dispatch.service.js'
import { notifyStudentForAllPublishedJobs } from '../jobs/job-match.pipeline.js'
import { mergeSkillsIntoUserProfile } from '../skills/skill-inventory.service.js'

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
 * Analyzes text against a dynamic dictionary to find skills.
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

  const activeJobs = await Job.find({ status: 'published' }).select('skills skillRequirements').lean()
  const jobSkillNames = new Set()
  for (const job of activeJobs) {
    for (const skill of job.skills || []) {
      if (typeof skill === 'string' && skill.trim()) {
        jobSkillNames.add(skill.trim())
      }
    }
    for (const requirement of job.skillRequirements || []) {
      const requirementName = String(requirement?.name || '').trim()
      if (requirementName) {
        jobSkillNames.add(requirementName)
      }
    }
  }

  const allKnownSkillNames = new Set([
    ...FALLBACK_SKILLS.map((skill) => skill.toLowerCase()),
    ...Array.from(jobSkillNames).map((skill) => skill.toLowerCase()),
  ])

  const foundSkillNames = new Set()

  debugger;
  for (const skillNameLower of allKnownSkillNames) {
    const escapedSkillName = skillNameLower.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
    const regex = new RegExp(`\\b${escapedSkillName}\\b`, 'i')
    
    if (regex.test(normalizedText)) {
      foundSkillNames.add(skillNameLower)
    }
  }

  const caseMap = new Map()
  FALLBACK_SKILLS.forEach((skill) => caseMap.set(skill.toLowerCase(), skill))
  Array.from(jobSkillNames).forEach((skill) => caseMap.set(skill.toLowerCase(), skill))

  const formattedFoundSkills = []

  for (const lowerCaseSkill of foundSkillNames) {
    const originalCase = caseMap.get(lowerCaseSkill)
    if (!originalCase) continue

    formattedFoundSkills.push({
      name: originalCase,
      level: 'intermediate',
      years: 0
    })
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

    const { addedSkills } = await mergeSkillsIntoUserProfile(user, matchedSkills, {
      category: 'extracted',
      verified: false,
    })

    if (addedSkills.length > 0) {
      console.log(`[Resume Parser] Added ${addedSkills.length} skills to user ${userId}`)

      const skillNames = addedSkills.map((skill) => skill.name).join(', ')

      await createUserNotification({
        userId: user._id,
        type: 'assessment',
        title: 'Verify Your New Skills',
        message: `We found new skills in your resume (${skillNames}). Take an assessment to earn verified badges and improve matching.`,
        dedupeKey: `resume-skill-discovery:${user._id}:${addedSkills
          .map((skill) => skill.name.toLowerCase())
          .sort()
          .join('|')}`,
        metadata: {
          source: 'resume',
          skills: addedSkills.map((skill) => skill.name),
        },
      })

      await notifyStudentForAllPublishedJobs(user._id)
    }

  } catch (error) {
    console.error(`[Resume Parser] Error processing resume for user ${userId}:`, error)
  }
}
