// Simple test to check if course API works
console.log('🧪 Testing Course API...');

// Test fetch API
fetch('http://localhost:5000/api/courses/mern-stack-mastery')
  .then(response => {
    console.log('📡 Response status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('📦 Response data:', data);
    
    if (data.success && data.data) {
      const course = data.data;
      console.log('✅ Course found:', course.title);
      
      if (course.modules && course.modules.length > 0) {
        const firstModule = course.modules[0];
        console.log('📚 First module:', firstModule.moduleTitle);
        
        if (firstModule.videos && firstModule.videos.length > 0) {
          const firstVideo = firstModule.videos[0];
          console.log('🎬 First video:', firstVideo.title);
          console.log('🆔 YouTube ID:', firstVideo.youtubeId);
          console.log('⏱️ Duration:', firstVideo.duration);
          console.log('🎉 Videos should be visible in frontend!');
        } else {
          console.log('❌ No videos found in first module');
        }
      } else {
        console.log('❌ No modules found in course');
      }
    } else {
      console.log('❌ No course data found');
    }
  })
  .catch(error => {
    console.error('❌ API Error:', error.message);
    console.log('💡 Make sure the backend server is running:');
    console.log('   cd server');
    console.log('   npm run dev');
    console.log('   npm run seed:courses');
  });
