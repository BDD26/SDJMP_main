// Simple test to verify course routes are working
const mongoose = require('mongoose')

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...')
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillmatch')
    console.log('✅ MongoDB connection successful')
    
    // Test course model import
    const Course = require('../models/course.model')
    console.log('✅ Course model imported successfully')
    
    // Test progress model import
    const UserProgress = require('../models/userProgress.model')
    console.log('✅ UserProgress model imported successfully')
    
    // Test validation import
    const validation = require('../validations/course.validation')
    console.log('✅ Validation schemas imported successfully')
    
    // Test controller import
    const controller = require('../controllers/course.controller')
    console.log('✅ Course controller imported successfully')
    
    // Test routes import
    const routes = require('../routes/course.routes')
    console.log('✅ Course routes imported successfully')
    
    console.log('\n🎉 All LMS modules imported successfully!')
    console.log('The server should now start without errors.')
    
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  }
}

testConnection()
