import mongoose from 'mongoose'
import env from './env.js'

let isConnected = false

export async function connectDatabase() {
  if (isConnected) {
    return mongoose.connection
  }

  const connectionOptions = {
    maxPoolSize: 10,
    minPoolSize: 1,
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4,
    autoIndex: false,
  }

  try {
    const connection = await mongoose.connect(env.mongoUri, connectionOptions)
    isConnected = true
    console.warn('MongoDB connected:', env.mongoUri.startsWith('mongodb+srv://') ? 'Atlas SRV' : env.mongoUri)
    return connection
  } catch (error) {
    console.error('MongoDB connection failed:', error.message)
    if (error.name === 'MongoServerSelectionError' || error.message.includes('ReplicaSetNoPrimary')) {
      console.error(
        'ReplicaSetNoPrimary detected. Confirm Atlas cluster has an active primary and your IP/network is allowed.'
      )
    }
    throw error
  }
}
