import mongoose from 'mongoose'
import env from './env.js'

let isConnected = false

export async function connectDatabase() {
  if (isConnected) {
    return mongoose.connection
  }

  await mongoose.connect(env.mongoUri)
  isConnected = true
  return mongoose.connection
}
