import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['student', 'employer', 'super_admin'],
      default: 'student',
    },
    avatar: {
      type: String,
      default: '',
    },
    profile: {
      bio: { type: String, default: '' },
      location: { type: String, default: '' },
      education: [
        {
          id: { type: String, default: () => Date.now().toString() },
          degree: String,
          institution: String,
          year: String,
        },
      ],
      skills: [
        {
          name: String,
          level: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced', 'expert'],
            default: 'intermediate'
          },
          years: { type: Number, default: 0 },
          verified: { type: Boolean, default: false },
          sources: [
            {
              type: { type: String, default: 'manual' },
              sourceId: { type: String, default: '' },
              category: { type: String, default: '' },
            },
          ],
        },
      ],
      projects: [
        {
          id: { type: String, default: () => Date.now().toString() },
          title: String,
          description: String,
          link: String,
        },
      ],
      certifications: [
        {
          name: String,
          issuer: String,
          year: String,
        },
      ],
      preferences: {
        jobTypes: [String],
        locations: [String],
        minSalary: String,
      },
    },
    company: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    passwordResetToken: {
      type: String,
      default: null,
      select: false,
    },
    passwordResetExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
  }
)

const User = mongoose.models.User || mongoose.model('User', userSchema)

export default User
