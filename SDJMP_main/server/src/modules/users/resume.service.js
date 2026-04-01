import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParseModule = require('pdf-parse')
const PDFParse = pdfParseModule?.PDFParse || pdfParseModule?.default?.PDFParse
import fs from 'node:fs/promises'
import path from 'node:path'
import http from 'node:http'
import https from 'node:https'
import { fileURLToPath } from 'node:url'

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
    if (typeof url !== 'string' || !url.trim()) {
      throw new Error('Missing URL')
    }

    const trimmedUrl = url.trim()

    if (trimmedUrl.startsWith('data:')) {
      const commaIndex = trimmedUrl.indexOf(',')
      if (commaIndex === -1) {
        throw new Error('Invalid data URL')
      }

      const header = trimmedUrl.slice(0, commaIndex)
      const payload = trimmedUrl.slice(commaIndex + 1)

      if (!/application\/pdf/i.test(header)) {
        throw new Error('Unsupported data URL mime type')
      }

      const isBase64 = /;base64/i.test(header)
      const buffer = isBase64 ? Buffer.from(payload, 'base64') : Buffer.from(decodeURIComponent(payload), 'utf8')

      // Guardrail: avoid reading huge PDFs from inline data URLs.
      if (buffer.length > 15 * 1024 * 1024) {
        throw new Error('Data URL PDF too large')
      }

      return buffer
    }

    if (trimmedUrl.startsWith('file://')) {
      const filePath = fileURLToPath(trimmedUrl)
      return await fs.readFile(filePath)
    }

    // Treat non-http(s) values as local filesystem paths (useful for local upload fallback)
    if (!/^https?:\/\//i.test(trimmedUrl)) {
      const cwd = process.cwd()
      const normalized = trimmedUrl.replaceAll('\\', '/')

      // If this is a URL-ish path like `/uploads/resumes/x.pdf`, read from the local `uploads/` folder.
      if (normalized.startsWith('/')) {
        return await fs.readFile(path.join(cwd, normalized.slice(1)))
      }

      // Support relative paths like `uploads/resumes/x.pdf`
      if (!path.isAbsolute(trimmedUrl)) {
        return await fs.readFile(path.resolve(cwd, trimmedUrl))
      }

      return await fs.readFile(trimmedUrl)
    }

    const parsed = new URL(trimmedUrl)

    // If the URL points to our own local uploads, read directly from disk so parsing doesn't depend on the server being up.
    if (
      (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') &&
      (parsed.pathname.startsWith('/uploads/') || parsed.pathname.startsWith('/api/uploads/'))
    ) {
      const cwd = process.cwd()
      const diskPath = parsed.pathname.startsWith('/api/uploads/')
        ? parsed.pathname.replace('/api/uploads/', '/uploads/')
        : parsed.pathname

      return await fs.readFile(path.join(cwd, diskPath.replace(/^\//, '')))
    }

    const normalizedHttpUrl = trimmedUrl.replace('/api/uploads/', '/uploads/')

    if (typeof globalThis.fetch === 'function') {
      const response = await fetch(normalizedHttpUrl)
      if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`)
      const arrayBuffer = await response.arrayBuffer()
      return Buffer.from(arrayBuffer)
    }

    return await downloadHttpBuffer(normalizedHttpUrl)
  } catch (error) {
    console.error('Error fetching PDF from URL:', error)
    return null
  }
}

function downloadHttpBuffer(url, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) {
      reject(new Error('Too many redirects while downloading PDF'))
      return
    }

    let parsedUrl
    try {
      parsedUrl = new URL(url)
    } catch (error) {
      reject(error)
      return
    }

    const requester = parsedUrl.protocol === 'https:' ? https : http

    const req = requester.get(
      url,
      {
        headers: {
          'User-Agent': 'SkillMatch-Resume-Parser/1.0',
          Accept: 'application/pdf,*/*;q=0.8',
        },
      },
      (res) => {
        const status = Number(res.statusCode) || 0

        if ([301, 302, 303, 307, 308].includes(status) && res.headers.location) {
          const nextUrl = new URL(res.headers.location, parsedUrl).toString()
          res.resume()
          downloadHttpBuffer(nextUrl, redirectCount + 1).then(resolve, reject)
          return
        }

        if (status < 200 || status >= 300) {
          res.resume()
          reject(new Error(`Failed to fetch PDF: ${status}`))
          return
        }

        const chunks = []
        res.on('data', (chunk) => chunks.push(chunk))
        res.on('end', () => resolve(Buffer.concat(chunks)))
      }
    )

    req.on('error', reject)
    req.setTimeout(15000, () => {
      req.destroy(new Error('Timeout fetching PDF'))
    })
  })
}

/**
 * Extracts raw text from a PDF buffer
 */
export async function extractTextFromPdf(buffer) {
  try {
    if (!buffer || !(buffer instanceof Buffer) || buffer.length === 0) {
      return ''
    }

    if (typeof PDFParse !== 'function') {
      throw new TypeError('pdf-parse did not export PDFParse')
    }

    console.log('[Resume Parser] Starting PDF extraction, buffer size:', buffer?.length)
    const parser = new PDFParse({ data: buffer })
    const data = await parser.getText()
    console.log('[Resume Parser] PDF extraction successful, text length:', data?.text?.length)
    return data?.text || ''
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

function buildSkillVariants(skillName = '') {
  const base = String(skillName || '').trim().toLowerCase()
  if (!base) return []

  const variants = new Set([base])

  if (base.includes('.')) {
    variants.add(base.replaceAll('.', ''))
  }

  // Common aliases that show up in resumes.
  if (base === 'c++') variants.add('cpp')
  if (base === 'c#') variants.add('csharp')
  if (base === 'node.js') variants.add('nodejs')
  if (base === 'next.js') variants.add('nextjs')
  if (base === 'nuxt.js') variants.add('nuxtjs')
  if (base === 'asp.net') variants.add('aspnet')

  return Array.from(variants)
}

function buildSkillRegex(skillLower) {
  const escaped = String(skillLower || '').replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
  const spaced = escaped.replace(/\s+/g, '\\s+')
  // Use non-alphanumeric separators so skills like `c++` / `c#` match reliably.
  return new RegExp(`(?:^|[^a-z0-9])${spaced}(?:$|[^a-z0-9])`, 'i')
}

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

  const foundSkillNames = new Set()
  const caseMap = new Map()

  // Build complete skill dictionary (with variants) + casing map
  const allKnownSkillNames = new Set()

  const registerSkill = (skill) => {
    const original = String(skill || '').trim()
    if (!original) return

    const variants = buildSkillVariants(original)
    for (const variant of variants) {
      allKnownSkillNames.add(variant)
      if (!caseMap.has(variant)) {
        caseMap.set(variant, original)
      }
    }
  }

  FALLBACK_SKILLS.forEach(registerSkill)
  Array.from(jobSkillNames).forEach(registerSkill)

  // Search for skills by word boundary
  for (const skillNameLower of allKnownSkillNames) {
    const regex = buildSkillRegex(skillNameLower)
    
    if (regex.test(normalizedText)) {
      foundSkillNames.add(skillNameLower)
    }
  }

  // Format found skills with original casing and defaults
  const formattedFoundSkills = []
  const formattedKeys = new Set()
  for (const lowerCaseSkill of foundSkillNames) {
    const originalCase = caseMap.get(lowerCaseSkill)
    if (!originalCase) continue

    const key = String(originalCase).toLowerCase()
    if (formattedKeys.has(key)) continue
    formattedKeys.add(key)

    formattedFoundSkills.push({
      name: originalCase,
      level: 'intermediate',
      years: 0,
      verified: false
    })
  }

  return formattedFoundSkills
}

export async function analyzeResumeSkills(fileUrl, fileType = 'application/pdf') {
  const result = {
    textLength: 0,
    matchedSkills: [],
    matchedSkillsCount: 0,
    error: null,
  }

  if (!fileUrl || typeof fileUrl !== 'string') {
    result.error = 'invalid_file_url'
    return result
  }

  const resolvedFileType = (fileType && typeof fileType === 'string' && fileType.trim())
    ? fileType.trim()
    : 'application/pdf'

  if (!resolvedFileType.toLowerCase().includes('pdf')) {
    result.error = 'unsupported_file_type'
    return result
  }

  try {
    const pdfBuffer = await getPdfBufferFromUrl(fileUrl)
    if (!pdfBuffer) {
      result.error = 'download_failed'
      return result
    }

    const extractedText = await extractTextFromPdf(pdfBuffer)
    if (!extractedText || extractedText.length < 10) {
      result.error = 'no_text_extracted'
      return result
    }

    const matchedSkills = await identifySkillsFromText(extractedText)

    result.textLength = extractedText.length
    result.matchedSkills = matchedSkills
    result.matchedSkillsCount = matchedSkills.length
    return result
  } catch (error) {
    result.error = error?.message || 'analysis_failed'
    return result
  }
}

/**
 * Main routine: Downloads a resume, parses text, extracts skills,
 * and appends them to the user's profile if they don't already exist.
 */
export async function processResumeForUser(userId, fileUrl, fileType, options = {}) {
  const result = {
    parsed: false,
    textLength: 0,
    matchedSkills: [],
    matchedSkillsCount: 0,
    addedSkills: [],
    addedSkillsCount: 0,
    error: null,
  }

  // Validate inputs — accept both string IDs and MongoDB ObjectIds
  const userIdStr = userId ? String(userId) : ''
  const resumeId = options?.resumeId ? String(options.resumeId) : ''
  const sourceCategory = String(options?.sourceCategory || 'resume-parser').trim() || 'resume-parser'
  if (!userIdStr) {
    console.warn('[Resume Parser] Invalid userId provided')
    result.error = 'invalid_user_id'
    return result
  }

  if (!fileUrl || typeof fileUrl !== 'string') {
    console.warn(`[Resume Parser] Invalid fileUrl for user ${userIdStr}`)
    result.error = 'invalid_file_url'
    return result
  }

  // Default to PDF if fileType is missing/empty (built resumes don't always pass it)
  const resolvedFileType = (fileType && typeof fileType === 'string' && fileType.trim())
    ? fileType.trim()
    : 'application/pdf'

  // Only process PDFs for now
  if (!resolvedFileType.toLowerCase().includes('pdf')) {
    console.info(`[Resume Parser] Skipping non-PDF file (${resolvedFileType}) for user ${userIdStr}`)
    result.error = 'unsupported_file_type'
    return result
  }

  try {
    // Download and parse PDF
    let pdfBuffer = null
    try {
      pdfBuffer = await getPdfBufferFromUrl(fileUrl)
    } catch (downloadError) {
      console.error('[Resume Parser] Download failed:', downloadError)
    }

    if (!pdfBuffer) {
      console.warn(`[Resume Parser] Failed to download PDF from ${fileUrl}`)
      // Include the URL prefix so we can quickly tell if it's local/cloudinary without leaking full URLs in logs.
      const urlPrefix = String(fileUrl || '').slice(0, 80)
      result.error = `download_failed:${urlPrefix}`
      return result
    }

    const extractedText = await extractTextFromPdf(pdfBuffer)
    if (!extractedText || extractedText.length < 10) {
      console.info(`[Resume Parser] No meaningful text extracted from resume for user ${userId}`)
      result.error = 'no_text_extracted'
      return result
    }

    result.parsed = true
    result.textLength = extractedText.length

    // Identify skills from text
    const matchedSkills = await identifySkillsFromText(extractedText)
    result.matchedSkills = matchedSkills
    result.matchedSkillsCount = matchedSkills.length

    // Get user and merge skills
    const user = await User.findById(userId)
    if (!user) {
      console.warn(`[Resume Parser] User ${userId} not found`)
      result.error = 'user_not_found'
      return result
    }

    let addedSkills = []
    if (matchedSkills.length > 0) {
      const mergeResult = await mergeSkillsIntoUserProfile(user, matchedSkills, {
        category: 'extracted',
        verified: false,
        ...(resumeId
          ? {
              source: {
                type: 'resume',
                sourceId: resumeId,
                category: sourceCategory,
              },
            }
          : {}),
      })
      addedSkills = mergeResult.addedSkills || []
    }

    result.addedSkills = addedSkills
    result.addedSkillsCount = addedSkills.length

    if (addedSkills.length > 0) {
      console.log(`[Resume Parser] Successfully added ${addedSkills.length} skills to user ${userId}`)

      // Notify user about discovered skills
      const skillNames = addedSkills.map((skill) => skill.name).join(', ')

      try {
        await createUserNotification({
          userId: user._id,
          type: 'system',
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
    } else if (matchedSkills.length > 0) {
      console.info(`[Resume Parser] Skills identified but no new skills added for user ${userId} (duplicates skipped)`)
    } else {
      console.info(`[Resume Parser] No skills identified in resume for user ${userId}`)
    }

    return result

  } catch (error) {
    console.error(`[Resume Parser] Error processing resume for user ${userId}:`, error.message)
    result.error = error?.message || 'unknown_error'
    return result
  }
}
