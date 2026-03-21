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
    description: {
      type: String,
      default: '',
    },
    popularity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

const Skill = mongoose.models.Skill || mongoose.model('Skill', skillSchema)

export default Skill
