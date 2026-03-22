import mongoose from 'mongoose'

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['applied', 'shortlisted', 'interview', 'rejected', 'withdrawn', 'hired'],
      default: 'applied',
      index: true,
    },
    coverLetter: {
      type: String,
      default: '',
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      default: null,
      index: true,
    },
    notes: {
      type: String,
      default: '',
    },
    interview: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

applicationSchema.index({ jobId: 1, studentId: 1 }, { unique: true })

const Application =
  mongoose.models.Application || mongoose.model('Application', applicationSchema)

export default Application
