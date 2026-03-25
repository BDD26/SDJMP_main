import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

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
    console.log('[Resume Parser] Starting PDF extraction, buffer size:', buffer?.length)
    const data = await pdfParse(buffer)
    console.log('[Resume Parser] PDF extraction successful, text length:', data?.text?.length)
    return data.text
  } catch (error) {
    console.error('[Resume Parser] CRITICAL PDF parsing error:', error)
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
  if (!text || typeof text !== 'string') return []

  const normalizedText = text.toLowerCase().replace(/[^a-z0-9+#.\- ]/g, ' ')

  let jobSkillNames = new Set()
  
  try {
    const activeJobs = await Job.find({ status: 'published' }).select('skills skillRequirements').lean()
    
    for (const job of activeJobs) {
      // Extract from simple skills array
      if (Array.isArray(job.skills)) {
        for (const skill of job.skills) {
          if (typeof skill === 'string' && skill.trim()) {
            jobSkillNames.add(skill.trim())
          }
        }
      }
      
      // Extract from detailed skillRequirements array
      if (Array.isArray(job.skillRequirements)) {
        for (const requirement of job.skillRequirements) {
          const requirementName = String(requirement?.name || '').trim()
          if (requirementName) {
            jobSkillNames.add(requirementName)
          }
        }
      }
    }
  } catch (error) {
    console.error('[Resume Parser] Error fetching job skills:', error.message)
    // Continue with fallback skills only
  }

  // Build complete skill dictionary
  const allKnownSkillNames = new Set([
    ...FALLBACK_SKILLS.map((skill) => skill.toLowerCase()),
    ...Array.from(jobSkillNames).map((skill) => skill.toLowerCase()),
  ])

  const foundSkillNames = new Set()
  const caseMap = new Map()

  // Build case mapping for original casing
  FALLBACK_SKILLS.forEach((skill) => caseMap.set(skill.toLowerCase(), skill))
  Array.from(jobSkillNames).forEach((skill) => caseMap.set(skill.toLowerCase(), skill))

  // Search for skills by word boundary
  for (const skillNameLower of allKnownSkillNames) {
    // Escape special regex characters
    const escapedSkillName = skillNameLower.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
    const regex = new RegExp(`\\b${escapedSkillName}\\b`, 'i')
    
    if (regex.test(normalizedText)) {
      foundSkillNames.add(skillNameLower)
    }
  }

  // Format found skills with original casing and defaults
  const formattedFoundSkills = []
  for (const lowerCaseSkill of foundSkillNames) {
    const originalCase = caseMap.get(lowerCaseSkill)
    if (!originalCase) continue

    formattedFoundSkills.push({
      name: originalCase,
      level: 'intermediate',
      years: 0,
      verified: false
    })
  }

  return formattedFoundSkills
}

/**
 * Main routine: Downloads a resume, parses text, extracts skills,
 * and appends them to the user's profile if they don't already exist.
 */
export async function processResumeForUser(userId, fileUrl, fileType) {
  // Validate inputs — accept both string IDs and MongoDB ObjectIds
  const userIdStr = userId ? String(userId) : ''
  if (!userIdStr) {
    console.warn('[Resume Parser] Invalid userId provided')
    return
  }

  if (!fileUrl || typeof fileUrl !== 'string') {
    console.warn(`[Resume Parser] Invalid fileUrl for user ${userIdStr}`)
    return
  }

  // Default to PDF if fileType is missing/empty (built resumes don't always pass it)
  const resolvedFileType = (fileType && typeof fileType === 'string' && fileType.trim())
    ? fileType.trim()
    : 'application/pdf'

  // Only process PDFs for now
  if (!resolvedFileType.toLowerCase().includes('pdf')) {
    console.info(`[Resume Parser] Skipping non-PDF file (${resolvedFileType}) for user ${userIdStr}`)
    return
  }

  try {
    // Download and parse PDF
    const pdfBuffer = await getPdfBufferFromUrl(fileUrl)
    if (!pdfBuffer) {
      console.warn(`[Resume Parser] Failed to download PDF from ${fileUrl}`)
      return
    }

    const extractedText = await extractTextFromPdf(pdfBuffer)
    if (!extractedText || extractedText.length < 10) {
      console.info(`[Resume Parser] No meaningful text extracted from resume for user ${userId}`)
      return
    }

    // Identify skills from text
    const matchedSkills = await identifySkillsFromText(extractedText)
    if (matchedSkills.length === 0) {
      console.info(`[Resume Parser] No skills identified in resume for user ${userId}`)
      return
    }

    // Get user and merge skills
    const user = await User.findById(userId)
    if (!user) {
      console.warn(`[Resume Parser] User ${userId} not found`)
      return
    }

    const { addedSkills } = await mergeSkillsIntoUserProfile(user, matchedSkills, {
      category: 'extracted',
      verified: false,
    })

    if (addedSkills.length === 0) {
      console.info(`[Resume Parser] No new skills added for user ${userId} (duplicates skipped)`)
      return
    }

    console.log(`[Resume Parser] Successfully added ${addedSkills.length} skills to user ${userId}`)

    // Notify user about discovered skills
    const skillNames = addedSkills.map((skill) => skill.name).join(', ')

    try {
      await createUserNotification({
        userId: user._id,
        type: 'skill_discovery',
        title: 'Skills Detected in Your Resume',
        message: `We found ${addedSkills.length} skill(s) in your resume: ${skillNames}. Review them and take assessments to verify and earn badges.`,
        dedupeKey: `resume-skill-discovery:${user._id}:${addedSkills
          .map((skill) => skill.name.toLowerCase())
          .sort()
          .join('|')}`,
        metadata: {
          source: 'resume_parser',
          resumeUrl: fileUrl,
          skillCount: addedSkills.length,
          skills: addedSkills.map((skill) => ({
            name: skill.name,
            level: skill.level
          })),
        },
      })
    } catch (notifError) {
      console.error(`[Resume Parser] Failed to create notification for user ${userId}:`, notifError.message)
    }

    // Trigger job re-matching for this user
    try {
      await notifyStudentForAllPublishedJobs(user._id)
    } catch (matchError) {
      console.error(`[Resume Parser] Failed to re-match jobs for user ${userId}:`, matchError.message)
    }

  } catch (error) {
    console.error(`[Resume Parser] Error processing resume for user ${userId}:`, error.message)
  }
}
