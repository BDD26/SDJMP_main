import mongoose from 'mongoose'

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    type: {
      type: String,
      enum: ['full-time', 'part-time', 'internship', 'contract'],
      default: 'full-time',
    },
    salary: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    skillRequirements: [
      {
        name: { type: String, required: true },
        weight: { type: Number, default: 10 },
        level: { type: String, default: 'Intermediate' }
      }
    ],
    requirements: {
      type: [String],
      default: [],
    },
    deadline: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'closed'],
      default: 'published',
    },
  },
  {
    timestamps: true,
  }
)

jobSchema.index({
  title: 'text',
  companyName: 'text',
  location: 'text',
  skills: 'text',
})

const Job = mongoose.models.Job || mongoose.model('Job', jobSchema)

export default Job
