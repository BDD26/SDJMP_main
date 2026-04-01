import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, '../../../uploads/resumes')
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

export async function uploadResumeLocally(file, { publicId, fileName } = {}) {
  const timestamp = Date.now()
  const safeFileName = (fileName || file?.name || `resume_${timestamp}`).replace(/[^a-zA-Z0-9.-]/g, '_')
  const finalFileName = `${timestamp}_${safeFileName}`
  const filePath = path.join(UPLOADS_DIR, finalFileName)
  
  // Save file to disk
  const buffer = Buffer.from(await file.arrayBuffer())
  fs.writeFileSync(filePath, buffer)
  
  return {
    fileUrl: `/uploads/resumes/${finalFileName}`,
    filePublicId: publicId || `local_${timestamp}`,
    bytes: buffer.length,
    originalFilename: fileName || file?.name || 'resume',
    format: path.extname(fileName || file?.name).slice(1),
    resourceType: 'raw',
    storageProvider: 'local'
  }
}

export async function deleteLocalResumeFile(filePath) {
  try {
    let normalizedFilePath = typeof filePath === 'string' ? filePath.trim() : ''
    if (!normalizedFilePath) {
      return false
    }

    try {
      normalizedFilePath = new URL(normalizedFilePath).pathname
    } catch {
      normalizedFilePath = normalizedFilePath.replaceAll('\\', '/')
    }

    if (normalizedFilePath.startsWith('/api/uploads/')) {
      normalizedFilePath = normalizedFilePath.replace('/api/uploads/', '/uploads/')
    }

    if (normalizedFilePath.startsWith('/uploads/resumes/')) {
      const fullPath = path.join(__dirname, '../../../', normalizedFilePath.replace(/^\//, ''))
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath)
        return true
      }
    }
    return false
  } catch (error) {
    console.warn('Failed to delete local resume file:', error)
    return false
  }
}
