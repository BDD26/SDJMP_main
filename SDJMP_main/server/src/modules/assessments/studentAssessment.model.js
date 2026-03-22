import mongoose from 'mongoose'

const studentAssessmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'in_progress',
    },
    progress: {
      type: Number,
      default: 0,
    },
    score: {
      type: Number,
      default: null,
    },
    answers: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

studentAssessmentSchema.index({ studentId: 1, assessmentId: 1 }, { unique: true })

const StudentAssessment =
  mongoose.models.StudentAssessment || mongoose.model('StudentAssessment', studentAssessmentSchema)

export default StudentAssessment
