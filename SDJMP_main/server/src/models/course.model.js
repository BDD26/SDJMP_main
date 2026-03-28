import mongoose from 'mongoose'

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  youtubeId: {
    type: String,
    required: true,
    trim: true,
    minlength: 11,
    maxlength: 11,
    match: /^[A-Za-z0-9_-]{11}$/,
    // index: true
  },
  duration: {
    type: String,
    required: true,
    trim: true,
    match: /^\d{1,3}:\d{2}$/, // Format: "MM:SS" or "H:MM:SS"
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  order: {
    type: Number,
    default: 0
  }
}, { _id: false })

const moduleSchema = new mongoose.Schema({
  moduleTitle: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 300
  },
  videos: [videoSchema],
  order: {
    type: Number,
    default: 0
  }
}, { _id: false })

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[a-z0-9-]+$/,
    index: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  modules: [moduleSchema],
  instructor: {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500
    },
    avatar: {
      type: String,
      trim: true
    }
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 50
  },
  duration: {
    type: String,
    required: true,
    trim: true,
    match: /^\d{1,3}h \d{1,3}m$/ // Format: "8h 45m"
  },
  totalVideos: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  studentsEnrolled: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Virtual for total video count
courseSchema.virtual('videoCount').get(function() {
  return this.modules.reduce((total, module) => total + module.videos.length, 0)
})

// Static method to find course by slug with lean
courseSchema.statics.findBySlugLean = function(slug) {
  return this.findOne({ slug, isActive: true })
    .lean()
    .select('title slug description modules instructor level category duration totalVideos rating studentsEnrolled lastUpdated')
}

// Pre-save middleware to update totalVideos
courseSchema.pre('save', function(next) {
  this.totalVideos = this.modules.reduce((total, module) => total + module.videos.length, 0)
  this.lastUpdated = new Date()
  next()
})

// Index for performance
courseSchema.index({ slug: 1, isActive: 1 })
courseSchema.index({ category: 1, level: 1 })
courseSchema.index({ 'modules.videos.youtubeId': 1 })

export default mongoose.model('Course', courseSchema)
