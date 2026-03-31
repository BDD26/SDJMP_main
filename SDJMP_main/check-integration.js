#!/usr/bin/env node

// Complete Integration Test Script
// Tests frontend-backend integration for Course Player

import { execSync } from 'child_process';
import http from 'http';

console.log('🧪 Starting Complete Integration Test...\n');

// Test 1: Check if servers are running
async function testServers() {
  console.log('📡 Testing Server Connectivity...');
  
  // Test backend server
  const backendTest = await new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET',
      timeout: 3000
    }, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => resolve(false));
    req.end();
  });

  // Test frontend server
  const frontendTest = await new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET',
      timeout: 3000
    }, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => resolve(false));
    req.end();
  });

  console.log(`   Backend Server (port 5000): ${backendTest ? '✅ Running' : '❌ Not Running'}`);
  console.log(`   Frontend Server (port 3000): ${frontendTest ? '✅ Running' : '❌ Not Running'}`);
  
  return { backend: backendTest, frontend: frontendTest };
}

// Test 2: Check Course API
async function testCourseAPI() {
  console.log('\n🎬 Testing Course API...');
  
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
          
          if (response.success && response.data) {
            const course = response.data;
            console.log(`   ✅ Course Found: ${course.title}`);
            console.log(`   ✅ Slug: ${course.slug}`);
            
            if (course.modules && course.modules.length > 0) {
              const firstModule = course.modules[0];
              console.log(`   ✅ Modules: ${course.modules.length}`);
              
              if (firstModule.videos && firstModule.videos.length > 0) {
                const firstVideo = firstModule.videos[0];
                console.log(`   ✅ Videos Found: ${firstVideo.title}`);
                console.log(`   ✅ YouTube ID: ${firstVideo.youtubeId}`);
                console.log(`   ✅ Duration: ${firstVideo.duration}`);
                resolve(true);
              } else {
                console.log('   ❌ No videos found in modules');
                resolve(false);
              }
            } else {
              console.log('   ❌ No modules found');
              resolve(false);
            }
          } else {
            console.log('   ❌ Invalid API response');
            resolve(false);
          }
        } catch (err) {
          console.log('   ❌ JSON Parse Error:', err.message);
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.log('   ❌ API Error:', err.message);
      resolve(false);
    });
    req.end();
  });
}

// Test 3: Check Database Connection
async function testDatabase() {
  console.log('\n💾 Testing Database Connection...');
  
  try {
    // This would require importing the database config
    // For now, we'll check if we can access course data
    const dbTest = await testCourseAPI();
    console.log(`   Database: ${dbTest ? '✅ Connected' : '❌ Not Connected'}`);
    return dbTest;
  } catch (err) {
    console.log('   Database: ❌ Connection Failed');
    return false;
  }
}

// Test 4: Check Frontend Integration
async function testFrontendIntegration() {
  console.log('\n🌐 Testing Frontend Integration...');
  
  // Test if frontend can access the course route
  const frontendTest = await new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/course/mern-stack-mastery',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => resolve(false));
    req.end();
  });

  console.log(`   Frontend Route: ${frontendTest ? '✅ Accessible' : '❌ Not Accessible'}`);
  return frontendTest;
}

// Test 5: Check CORS
async function testCORS() {
  console.log('\n🔒 Testing CORS Configuration...');
  
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/courses/mern-stack-mastery',
      method: 'OPTIONS',
      timeout: 3000,
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    }, (res) => {
      const corsHeaders = {
        'Access-Control-Allow-Origin': res.headers['access-control-allow-origin'],
        'Access-Control-Allow-Methods': res.headers['access-control-allow-methods'],
        'Access-Control-Allow-Headers': res.headers['access-control-allow-headers']
      };
      
      console.log(`   CORS Origin: ${corsHeaders['Access-Control-Allow-Origin'] || '❌ Not Set'}`);
      console.log(`   CORS Methods: ${corsHeaders['Access-Control-Allow-Methods'] || '❌ Not Set'}`);
      
      const corsWorking = corsHeaders['Access-Control-Allow-Origin'] === 'http://localhost:3000';
      console.log(`   CORS Status: ${corsWorking ? '✅ Configured' : '❌ Not Configured'}`);
      
      resolve(corsWorking);
    }).on('error', () => {
      console.log('   CORS Status: ❌ Test Failed');
      resolve(false);
    });
    req.end();
  });
}

// Main test runner
async function runIntegrationTest() {
  const results = {
    servers: await testServers(),
    api: await testCourseAPI(),
    database: await testDatabase(),
    frontend: await testFrontendIntegration(),
    cors: await testCORS()
  };

  console.log('\n📊 Integration Test Results:');
  console.log('================================');
  console.log(`Backend Server: ${results.servers.backend ? '✅' : '❌'}`);
  console.log(`Frontend Server: ${results.servers.frontend ? '✅' : '❌'}`);
  console.log(`Course API: ${results.api ? '✅' : '❌'}`);
  console.log(`Database: ${results.database ? '✅' : '❌'}`);
  console.log(`Frontend Integration: ${results.frontend ? '✅' : '❌'}`);
  console.log(`CORS: ${results.cors ? '✅' : '❌'}`);

  const allPassed = Object.values(results).every(result => result === true);
  
  console.log('\n🎯 Overall Status:');
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED - Integration is Working!');
    console.log('\n📱 You can now access:');
    console.log('   Frontend: http://localhost:3000/course/mern-stack-mastery');
    console.log('   API: http://localhost:5000/api/courses/mern-stack-mastery');
    console.log('\n🎬 Videos should be visible in the frontend!');
  } else {
    console.log('❌ Some tests failed - Check the issues above');
    console.log('\n🔧 Quick Fixes:');
    
    if (!results.servers.backend) {
      console.log('   • Run: cd server && npm run dev');
    }
    if (!results.servers.frontend) {
      console.log('   • Run: cd client && npm run dev');
    }
    if (!results.api) {
      console.log('   • Run: cd server && npm run seed:courses');
    }
    if (!results.cors) {
      console.log('   • Check CORS configuration in server/app.js');
    }
  }
  
  console.log('\n' + '='.repeat(50));
}

// Run the test
runIntegrationTest().catch(console.error);
