import mongoose from 'mongoose'

const userProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true
  },
  completedVideos: [{
    youtubeId: {
      type: String,
      required: true,
      trim: true,
      minlength: 11,
      maxlength: 11,
      match: /^[A-Za-z0-9_-]{11}$/
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  lastAccessedVideo: {
    youtubeId: {
      type: String,
      trim: true,
      minlength: 11,
      maxlength: 11,
      match: /^[A-Za-z0-9_-]{11}$/
    },
    accessedAt: {
      type: Date,
      default: Date.now
    }
  },
  completionPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  timeSpent: {
    type: Number, // in minutes
    default: 0
  },
  notes: [{
    videoId: {
      type: String,
      required: true,
      trim: true,
      minlength: 11,
      maxlength: 11,
      match: /^[A-Za-z0-9_-]{11}$/
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    timestamp: {
      type: Number, // video timestamp in seconds
      min: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Compound index for unique user-course combination
userProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true })

// Index for performance
userProgressSchema.index({ userId: 1, 'completedVideos.youtubeId': 1 })
userProgressSchema.index({ courseId: 1, completionPercentage: 1 })

// Virtual for completion count
userProgressSchema.virtual('completedCount').get(function() {
  return this.completedVideos.length
})

// Pre-save middleware to update completion percentage
userProgressSchema.pre('save', async function(next) {
  try {
    // Get the course to find total video count
    const Course = mongoose.model('Course')
    const course = await Course.findById(this.courseId).lean()
    
    if (course) {
      const totalVideos = course.modules.reduce((total, module) => total + module.videos.length, 0)
      const completedCount = this.completedVideos.length
      
      this.completionPercentage = totalVideos > 0 ? Math.round((completedCount / totalVideos) * 100) : 0
      
      // Mark as completed if 100% done
      if (this.completionPercentage === 100 && !this.isCompleted) {
        this.isCompleted = true
        this.completedAt = new Date()
      }
    }
    
    next()
  } catch (error) {
    next(error)
  }
})

// Static method to find or create progress
userProgressSchema.statics.findOrCreate = async function(userId, courseId) {
  try {
    let progress = await this.findOne({ userId, courseId })
    
    if (!progress) {
      progress = await this.create({
        userId,
        courseId,
        completedVideos: [],
        lastAccessed: new Date()
      })
    }
    
    return progress
  } catch (error) {
    throw new Error(`Failed to find or create progress: ${error.message}`)
  }
}

// Instance method to mark video as completed
userProgressSchema.methods.markVideoCompleted = async function(youtubeId) {
  try {
    // Validate youtubeId
    if (!youtubeId || !/^[A-Za-z0-9_-]{11}$/.test(youtubeId)) {
      throw new Error('Invalid YouTube ID format')
    }
    
    // Check if video is already completed
    const isAlreadyCompleted = this.completedVideos.some(
      video => video.youtubeId === youtubeId
    )
    
    if (!isAlreadyCompleted) {
      this.completedVideos.push({
        youtubeId,
        completedAt: new Date()
      })
      this.lastAccessed = new Date()
      this.lastAccessedVideo = {
        youtubeId,
        accessedAt: new Date()
      }
      
      await this.save()
      return true // Marked as completed
    }
    
    return false // Already completed
  } catch (error) {
    throw new Error(`Failed to mark video as completed: ${error.message}`)
  }
}

// Instance method to update last accessed video
userProgressSchema.methods.updateLastAccessed = async function(youtubeId) {
  try {
    if (youtubeId && /^[A-Za-z0-9_-]{11}$/.test(youtubeId)) {
      this.lastAccessed = new Date()
      this.lastAccessedVideo = {
        youtubeId,
        accessedAt: new Date()
      }
      await this.save()
    }
  } catch (error) {
    throw new Error(`Failed to update last accessed: ${error.message}`)
  }
}

export default mongoose.model('UserProgress', userProgressSchema)
