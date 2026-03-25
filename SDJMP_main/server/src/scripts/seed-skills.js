import mongoose from 'mongoose'
import { connectDatabase } from '../config/database.js'
import Skill from '../modules/skills/skill.model.js'
import { defaultSkillLibrary } from '../modules/skills/default-skill-library.js'

async function seedSkills() {
  try {
    await connectDatabase()

    const result = await Skill.bulkWrite(
      defaultSkillLibrary.map((skill) => ({
        updateOne: {
          filter: { name: skill.name },
          update: { $setOnInsert: skill },
          upsert: true,
        },
      })),
      { ordered: false }
    )

    const insertedCount = result.upsertedCount || 0
    const totalCount = await Skill.countDocuments()

    console.warn(`[seed-skills] Inserted ${insertedCount} new skills.`)
    console.warn(`[seed-skills] Skills in collection: ${totalCount}`)
    process.exit(0)
  } catch (error) {
    console.error('[seed-skills] Failed to seed skills', error)
    process.exit(1)
  } finally {
    await mongoose.connection.close()
  }
}

seedSkills()
