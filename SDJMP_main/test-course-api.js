// Test course API endpoints
import http from 'http';

// Test if server is running
const testServer = () => {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/courses/mern-stack-mastery',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ Server Response:', response);
          resolve(response);
        } catch (err) {
          console.log('❌ Invalid JSON response:', data);
          resolve(null);
        }
      });
    });

    req.on('error', (err) => {
      console.log('❌ Server Error:', err.message);
      resolve(null);
    });

    req.on('timeout', () => {
      console.log('❌ Server timeout');
      req.destroy();
      resolve(null);
    });

    req.end();
  });
};

// Run test
console.log('🧪 Testing Course API...');
console.log('📍 Checking: http://localhost:5000/api/courses/mern-stack-mastery');

testServer().then(result => {
  if (result) {
    console.log('🎉 API is working! Videos should be visible in frontend.');
    
    if (result.data?.modules?.[0]?.videos?.[0]?.youtubeId) {
      console.log('📹 YouTube Video ID found:', result.data.modules[0].videos[0].youtubeId);
      console.log('🎬 Video should display in frontend!');
    } else {
      console.log('⚠️ No video data found in response');
    }
  } else {
    console.log('❌ Server not responding. Please start the backend server:');
    console.log('   cd server && npm run dev');
  }
});
