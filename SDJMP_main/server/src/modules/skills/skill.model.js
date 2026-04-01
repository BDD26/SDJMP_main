import mongoose from 'mongoose'

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    category: {
      type: String,
      default: 'general',
      trim: true,
    },
    categoryLabel: {
      type: String,
      default: '',
      trim: true,
    },
    categoryDescription: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    popularity: {
      type: Number,
      default: 0,
    },
    demand: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    jobs: {
      type: Number,
      default: 0,
      min: 0,
    },
    growth: {
      type: Number,
      default: 0,
    },
    tracks: {
      type: [
        {
          title: {
            type: String,
            trim: true,
            required: true,
          },
          type: {
            type: String,
            trim: true,
            default: 'Guide',
          },
          platform: {
            type: String,
            trim: true,
            default: 'Official',
          },
          link: {
            type: String,
            trim: true,
            default: '#',
          },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

const Skill = mongoose.models.Skill || mongoose.model('Skill', skillSchema)

export default Skill
