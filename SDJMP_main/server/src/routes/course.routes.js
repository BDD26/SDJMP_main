import express from 'express'
import { validate } from '../middlewares/validate.middleware.js'
import { requireAuth } from '../middlewares/auth.middleware.js'
import {asyncHandler} from '../utils/async-handler.js'
import {
  getCourseBySlug,
  getCourseProgress,
  updateProgress,
  updateLastAccessed,
  addVideoNote,
  getAllCourses
} from '../controllers/course.controller.js'
import {
  courseSlugSchema,
  courseIdSchema,
  progressUpdateSchema,
  noteSchema,
  lastAccessedSchema
} from '../validations/course.validation.js'

const router = express.Router()

// Public routes
router.get('/', asyncHandler(getAllCourses))
router.get('/:slug', 
  validate({ params: courseSlugSchema }),
  asyncHandler(getCourseBySlug)
)

// Protected routes - require authentication
router.get('/progress/:courseId',
  requireAuth,
  validate({ params: courseIdSchema }),
  asyncHandler(getCourseProgress)
)

router.patch('/progress/update',
  requireAuth,
  validate({ body: progressUpdateSchema }),
  asyncHandler(updateProgress)
)

router.patch('/progress/last-accessed',
  requireAuth,
  validate({ body: lastAccessedSchema }),
  asyncHandler(updateLastAccessed)
)

router.post('/progress/:courseId/notes',
  requireAuth,
  validate({ 
    params: courseIdSchema,
    body: noteSchema
  }),
  asyncHandler(addVideoNote)
)

export default router;
