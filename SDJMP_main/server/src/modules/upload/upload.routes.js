import { Router } from 'express'
import { requireAuth } from '../../middlewares/auth.middleware.js'
import { asyncHandler } from '../../utils/async-handler.js'
import fs from 'fs'
import multer from 'multer'
import path from 'path'

const uploadDirectory = path.resolve('uploads/resumes')
fs.mkdirSync(uploadDirectory, { recursive: true })

function getRequestOrigin(req) {
  const forwardedProto = String(req.get('x-forwarded-proto') || req.protocol || 'http')
    .split(',')[0]
    .trim()
  const forwardedHost = String(req.get('x-forwarded-host') || req.get('host') || '')
    .split(',')[0]
    .trim()

  return `${forwardedProto}://${forwardedHost}`
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDirectory)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only PDF and Word documents are allowed'), false)
    }
  }
})

const uploadRouter = Router()

uploadRouter.use(requireAuth)

uploadRouter.post('/resume', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }

  try {
    const relativeFileUrl = `/uploads/resumes/${req.file.filename}`
    const fileUrl = new URL(relativeFileUrl, `${getRequestOrigin(req)}/`).toString()

    return res.status(201).json({
      asset: {
        fileUrl,
        relativeFileUrl,
        filePublicId: `local_${req.file.filename}`,
        storageProvider: 'local',
        data: {
          mimeType: req.file.mimetype,
          originalName: req.file.originalname,
          size: req.file.size,
          resourceType: 'raw',
          storageProvider: 'local'
        }
      }
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}))

export default uploadRouter
