import { createHttpError } from '../utils/http-error.js'
import Course from '../models/course.model.js'
import UserProgress from '../models/userProgress.model.js'
import { 
  courseSlugSchema, 
  courseIdSchema, 
  progressUpdateSchema, 
  noteSchema,
  lastAccessedSchema 
} from '../validations/course.validation.js'

// GET /api/courses/:slug - Retrieve full course details by slug
async function getCourseBySlug(req, res) {
  try {
    const { slug } = req.validated.params
    
    // Find course with lean for performance
    const course = await Course.findBySlugLean(slug)
    
    if (!course) {
      throw createHttpError(404, 'Course not found')
    }
    
    // Add computed fields
    const courseWithStats = {
      ...course,
      videoCount: course.modules.reduce((total, module) => total + module.videos.length, 0),
      totalDuration: course.duration,
      formattedModules: course.modules.map(module => ({
        ...module,
        videoCount: module.videos.length,
        totalModuleDuration: module.videos.reduce((total, video) => {
          const [minutes, seconds] = video.duration.split(':').map(Number)
          return total + minutes + (seconds / 60)
        }, 0)
      }))
    }
    
    res.status(200).json({
      success: true,
      data: courseWithStats,
      message: 'Course retrieved successfully'
    })
    
  } catch (error) {
    if (error.name === 'ValidationError') {
      throw createHttpError(400, error.message)
    }
    throw error
  }
}

// GET /api/progress/:courseId - Get user progress for a specific course
async function getCourseProgress(req, res) {
  try {
    const { courseId } = req.validated.params
    const userId = req.user.id
    
    // Find or create progress record
    const progress = await UserProgress.findOrCreate(userId, courseId)
    
    // Get course details for completion calculation
    const course = await Course.findById(courseId).lean()
    
    if (!course) {
      throw createHttpError(404, 'Course not found')
    }
    
    // Calculate detailed progress
    const totalVideos = course.modules.reduce((total, module) => total + module.videos.length, 0)
    const completedVideos = progress.completedVideos.length
    const completionPercentage = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0
    
    // Find current module and video
    let currentModule = null
    let currentVideoIndex = 0
    let nextVideo = null
    
    for (let i = 0; i < course.modules.length; i++) {
      const module = course.modules[i]
      for (let j = 0; j < module.videos.length; j++) {
        const video = module.videos[j]
        const isCompleted = progress.completedVideos.some(cv => cv.youtubeId === video.youtubeId)
        
        if (!isCompleted && !nextVideo) {
          nextVideo = {
            ...video,
            moduleTitle: module.moduleTitle,
            moduleIndex: i,
            videoIndex: j
          }
          currentModule = module.moduleTitle
          currentVideoIndex = j
          break
        }
      }
      if (nextVideo) break
    }
    
    const progressData = {
      courseId: progress.courseId,
      completedVideos: progress.completedVideos,
      completedCount: completedVideos,
      totalVideos,
      completionPercentage,
      isCompleted: completionPercentage === 100,
      lastAccessed: progress.lastAccessed,
      lastAccessedVideo: progress.lastAccessedVideo,
      timeSpent: progress.timeSpent,
      notes: progress.notes,
      currentModule,
      currentVideoIndex,
      nextVideo,
      courseStats: {
        title: course.title,
        slug: course.slug,
        level: course.level,
        category: course.category,
        duration: course.duration,
        instructor: course.instructor
      }
    }
    
    res.status(200).json({
      success: true,
      data: progressData,
      message: 'Progress retrieved successfully'
    })
    
  } catch (error) {
    if (error.name === 'ValidationError') {
      throw createHttpError(400, error.message)
    }
    throw error
  }
}

// PATCH /api/progress/update - Update user progress (mark video as completed)
async function updateProgress(req, res) {
  try {
    const { courseId, videoId, timeSpent } = req.validated.body
    const userId = req.user.id
    
    // Find or create progress record
    const progress = await UserProgress.findOrCreate(userId, courseId)
    
    // Mark video as completed
    const wasCompleted = await progress.markVideoCompleted(videoId)
    
    // Update time spent if provided
    if (timeSpent && timeSpent > 0) {
      progress.timeSpent += timeSpent
      await progress.save()
    }
    
    // Get updated stats
    const course = await Course.findById(courseId).lean()
    const totalVideos = course.modules.reduce((total, module) => total + module.videos.length, 0)
    const completionPercentage = Math.round((progress.completedVideos.length / totalVideos) * 100)
    
    res.status(200).json({
      success: true,
      data: {
        wasCompleted,
        completedCount: progress.completedVideos.length,
        totalVideos,
        completionPercentage,
        isCompleted: completionPercentage === 100,
        timeSpent: progress.timeSpent,
        lastAccessed: progress.lastAccessed
      },
      message: wasCompleted ? 'Video marked as completed' : 'Video was already completed'
    })
    
  } catch (error) {
    if (error.name === 'ValidationError') {
      throw createHttpError(400, error.message)
    }
    throw error
  }
}

// PATCH /api/progress/last-accessed - Update last accessed video
async function updateLastAccessed(req, res) {
  try {
    const { courseId, videoId } = req.validated.body
    const userId = req.user.id
    
    const progress = await UserProgress.findOrCreate(userId, courseId)
    await progress.updateLastAccessed(videoId)
    
    res.status(200).json({
      success: true,
      data: {
        lastAccessed: progress.lastAccessed,
        lastAccessedVideo: progress.lastAccessedVideo
      },
      message: 'Last accessed video updated'
    })
    
  } catch (error) {
    if (error.name === 'ValidationError') {
      throw createHttpError(400, error.message)
    }
    throw error
  }
}

// POST /api/progress/notes - Add a note for a video
async function addVideoNote(req, res) {
  try {
    const { videoId, content, timestamp } = req.validated.body
    const { courseId } = req.validated.params
    const userId = req.user.id
    
    const progress = await UserProgress.findOrCreate(userId, courseId)
    
    // Add note
    progress.notes.push({
      videoId,
      content,
      timestamp: timestamp || 0,
      createdAt: new Date()
    })
    
    await progress.save()
    
    res.status(201).json({
      success: true,
      data: {
        noteId: progress.notes[progress.notes.length - 1]._id,
        videoId,
        content,
        timestamp,
        createdAt: progress.notes[progress.notes.length - 1].createdAt
      },
      message: 'Note added successfully'
    })
    
  } catch (error) {
    if (error.name === 'ValidationError') {
      throw createHttpError(400, error.message)
    }
    throw error
  }
}

// GET /api/courses - Get all courses (for discovery)
async function getAllCourses(req, res) {
  try {
    const { category, level, page = 1, limit = 10 } = req.query
    
    // Build filter
    const filter = { isActive: true }
    if (category) filter.category = category
    if (level) filter.level = level
    
    const skip = (page - 1) * limit
    
    const courses = await Course.find(filter)
      .select('title slug description instructor level category duration totalVideos rating studentsEnrolled lastUpdated')
      .sort({ studentsEnrolled: -1, rating: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean()
    
    const total = await Course.countDocuments(filter)
    
    res.status(200).json({
      success: true,
      data: {
        courses,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: total
        }
      },
      message: 'Courses retrieved successfully'
    })
    
  } catch (error) {
    throw error
  }
}

export {
  getCourseBySlug,
  getCourseProgress,
  updateProgress,
  updateLastAccessed,
  addVideoNote,
  getAllCourses
}
