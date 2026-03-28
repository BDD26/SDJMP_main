import { z } from 'zod'

// Validation schemas for course-related operations
const courseSlugSchema = z.object({
  slug: z.string()
    .min(1, 'Course slug is required')
    .max(50, 'Course slug too long')
    .regex(/^[a-z0-9-]+$/, 'Invalid slug format')
})

const courseIdSchema = z.object({
  courseId: z.string()
    .min(1, 'Course ID is required')
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid course ID format')
})

const progressUpdateSchema = z.object({
  courseId: z.string()
    .min(1, 'Course ID is required')
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid course ID format'),
  videoId: z.string()
    .min(11, 'Video ID must be 11 characters')
    .max(11, 'Video ID must be 11 characters')
    .regex(/^[A-Za-z0-9_-]{11}$/, 'Invalid YouTube ID format'),
  timeSpent: z.number()
    .min(0, 'Time spent must be positive')
    .max(999, 'Time spent seems unrealistic')
    .optional()
})

const noteSchema = z.object({
  videoId: z.string()
    .min(11, 'Video ID must be 11 characters')
    .max(11, 'Video ID must be 11 characters')
    .regex(/^[A-Za-z0-9_-]{11}$/, 'Invalid YouTube ID format'),
  content: z.string()
    .min(1, 'Note content is required')
    .max(1000, 'Note content too long')
    .trim(),
  timestamp: z.number()
    .min(0, 'Timestamp must be positive')
    .max(99999, 'Timestamp seems unrealistic')
    .optional()
})

const lastAccessedSchema = z.object({
  courseId: z.string()
    .min(1, 'Course ID is required')
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid course ID format'),
  videoId: z.string()
    .min(11, 'Video ID must be 11 characters')
    .max(11, 'Video ID must be 11 characters')
    .regex(/^[A-Za-z0-9_-]{11}$/, 'Invalid YouTube ID format')
})

export {
  courseSlugSchema,
  courseIdSchema,
  progressUpdateSchema,
  noteSchema,
  lastAccessedSchema
}
