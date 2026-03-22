import mongoose from 'mongoose'

const assessmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      default: '',
    },
    durationMinutes: {
      type: Number,
      default: 30,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    category: {
      type: String,
      default: 'General',
    },
    questions: [
      {
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctAnswer: { type: Number, required: true },
        points: { type: Number, default: 1 },
      }
    ],
  },
  {
    timestamps: true,
  }
)

const Assessment =
  mongoose.models.Assessment || mongoose.model('Assessment', assessmentSchema)

export default Assessment
