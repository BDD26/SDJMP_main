import { Router } from 'express'
import { requireAuth } from '../../middlewares/auth.middleware.js'
import { asyncHandler } from '../../utils/async-handler.js'
import multer from 'multer'
import path from 'path'
import { createResume } from '../users/users.controller.js'
import { createResumeSchema } from '../users/users.validation.js'

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/resumes/')
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
    const resumeData = {
      name: req.body.name || req.file.originalname,
      type: 'uploaded',
      fileUrl: `/uploads/resumes/${req.file.filename}`,
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

    const result = await createResume({ 
      validated: { body: resumeData }, 
      user: req.user 
    }, res)

    // `createResume` writes the response to `res` directly.
    return result
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}))

export default uploadRouter
