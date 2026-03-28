// Test script to verify all LMS imports work correctly
console.log('Testing LMS imports...')

try {
  // Test models
  const Course = await import('./src/models/course.model.js')
  console.log('✅ Course model imported successfully')
  
  const UserProgress = await import('./src/models/userProgress.model.js')
  console.log('✅ UserProgress model imported successfully')
  
  // Test validations
  const validation = await import('./src/validations/course.validation.js')
  console.log('✅ Validation schemas imported successfully')
  
  // Test controllers
  const controller = await import('./src/controllers/course.controller.js')
  console.log('✅ Course controller imported successfully')
  
  // Test routes
  const routes = await import('./src/routes/course.routes.js')
  console.log('✅ Course routes imported successfully')
  
  // Test middlewares
  const validate = await import('./src/middlewares/validate.middleware.js')
  console.log('✅ Validate middleware imported successfully')
  
  const auth = await import('./src/middlewares/auth.middleware.js')
  console.log('✅ Auth middleware imported successfully')
  
  // Test utils
  const asyncHandler = await import('./src/utils/async-handler.js')
  console.log('✅ Async handler imported successfully')
  
  const httpError = await import('./src/utils/http-error.js')
  console.log('✅ HTTP error utility imported successfully')
  
  console.log('\n🎉 All LMS imports successful!')
  console.log('The server should start without errors.')
  
} catch (error) {
  console.error('❌ Import test failed:', error.message)
  console.error('Stack:', error.stack)
}

// Test with dynamic imports to avoid module resolution issues
import('./src/models/course.model.js')
  .then(() => console.log('✅ Course model loaded'))
  .catch(err => console.error('❌ Course model error:', err.message))

import('./src/controllers/course.controller.js')
  .then(() => console.log('✅ Course controller loaded'))
  .catch(err => console.error('❌ Course controller error:', err.message))
