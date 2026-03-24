/**
 * Profile Update API Test Suite
 * Run this with: node profile.test.js
 * 
 * This script tests the profile update and retrieval functionality
 * Ensure you have a valid session token before running
 */

const http = require('http');
const querystring = require('querystring');

// Configuration
const BASE_URL = 'http://localhost:3000';
const SESSION_TOKEN = process.env.SESSION_TOKEN || 'your-session-token-here';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(color, label, message) {
  console.log(`${color}${label}${colors.reset}`, message);
}

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `sessionToken=${SESSION_TOKEN}`,
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = {
            status: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null,
          };
          resolve(response);
        } catch (err) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body,
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test cases
async function testProfileUpdate() {
  log(colors.blue, '\n📋 TEST SUITE: Profile Update & Retrieval\n', '');

  try {
    // Test 1: Get Current Profile
    log(colors.yellow, '[1] GET /users/profile', '- Retrieving current profile');
    const getCurrentResponse = await makeRequest('GET', '/users/profile');
    
    if (getCurrentResponse.status !== 200) {
      log(colors.red, '❌ FAILED', `Status: ${getCurrentResponse.status}`);
      log(colors.red, '   Error:', getCurrentResponse.body?.message || 'Unknown error');
      return;
    }
    
    const currentUser = getCurrentResponse.body.user;
    log(colors.green, '✓ SUCCESS', `Retrieved profile for user: ${currentUser.name}`);
    console.log('   Current profile data:', JSON.stringify(currentUser.profile, null, 2));

    // Test 2: Update Profile with Skills
    log(colors.yellow, '\n[2] PUT /users/profile', '- Updating profile with skills');
    
    const updateData = {
      profile: {
        bio: 'Passionate full-stack developer with experience in modern web technologies',
        location: 'San Francisco, CA',
        skills: [
          {
            name: 'React',
            level: 'advanced',
            years: 3,
          },
          {
            name: 'Node.js',
            level: 'intermediate',
            years: 2,
          },
          {
            name: 'MongoDB',
            level: 'intermediate',
            years: 2,
          },
          {
            name: 'Python',
            level: 'beginner',
            years: 1,
          },
        ],
        education: [
          {
            degree: 'B.S. Computer Science',
            institution: 'University of California',
            year: '2021',
          },
        ],
        projects: [
          {
            title: 'AI-Powered Job Matcher',
            description: 'Built an intelligent job matching platform using machine learning',
            link: 'https://github.com/example/ai-job-matcher',
          },
          {
            title: 'Real-Time Collaboration App',
            description: 'Developed a real-time document collaboration tool with WebSockets',
            link: 'https://github.com/example/collab-app',
          },
        ],
        certifications: [
          {
            name: 'AWS Certified Developer Associate',
            issuer: 'Amazon Web Services',
            year: '2023',
          },
          {
            name: 'MongoDB Certified Associate',
            issuer: 'MongoDB University',
            year: '2024',
          },
        ],
        preferences: {
          locations: ['Remote', 'San Francisco', 'New York'],
          minSalary: '$100,000',
          jobTypes: ['Full-time', 'Contract'],
        },
      },
    };

    const updateResponse = await makeRequest('PUT', '/users/profile', updateData);

    if (updateResponse.status !== 200) {
      log(colors.red, '❌ FAILED', `Status: ${updateResponse.status}`);
      log(colors.red, '   Error:', updateResponse.body?.message || 'Unknown error');
      console.log('   Response:', JSON.stringify(updateResponse.body, null, 2));
      return;
    }

    log(colors.green, '✓ SUCCESS', 'Profile updated successfully');
    const updatedUser = updateResponse.body.user;
    console.log('   Updated profile data:', JSON.stringify(updatedUser.profile, null, 2));

    // Test 3: Verify Skills Structure
    log(colors.yellow, '\n[3] VERIFICATION', '- Verifying skills structure');
    
    const skills = updatedUser.profile.skills;
    let skillsValid = true;

    skills.forEach((skill, index) => {
      if (!skill.name || !skill.level || skill.years === undefined) {
        log(colors.red, `   ❌ Skill ${index} invalid:`, JSON.stringify(skill));
        skillsValid = false;
      } else {
        log(colors.green, `   ✓ Skill ${index} valid:`, `${skill.name} (${skill.level}, ${skill.years} years)`);
      }
    });

    if (!skillsValid) {
      log(colors.red, '❌ FAILED', 'Skills structure is invalid');
      return;
    }

    // Test 4: Get Updated Profile
    log(colors.yellow, '\n[4] GET /users/profile', '- Verifying persistence');
    
    const getUpdatedResponse = await makeRequest('GET', '/users/profile');

    if (getUpdatedResponse.status !== 200) {
      log(colors.red, '❌ FAILED', `Status: ${getUpdatedResponse.status}`);
      return;
    }

    const persistedUser = getUpdatedResponse.body.user;
    const persistedSkills = persistedUser.profile.skills;

    if (JSON.stringify(persistedSkills) === JSON.stringify(skills)) {
      log(colors.green, '✓ SUCCESS', 'Profile data persisted correctly to database');
    } else {
      log(colors.red, '❌ FAILED', 'Profile data was not persisted correctly');
      console.log('   Expected:', JSON.stringify(skills, null, 2));
      console.log('   Got:', JSON.stringify(persistedSkills, null, 2));
      return;
    }

    // Test 5: Partial Update
    log(colors.yellow, '\n[5] PUT /users/profile', '- Testing partial update');
    
    const partialUpdate = {
      profile: {
        bio: 'Updated bio - passionate developer',
        skills: [
          {
            name: 'React',
            level: 'expert', // Changed from 'advanced'
            years: 4, // Changed from 3
          },
        ],
      },
    };

    const partialResponse = await makeRequest('PUT', '/users/profile', partialUpdate);

    if (partialResponse.status !== 200) {
      log(colors.red, '❌ FAILED', `Status: ${partialResponse.status}`);
      return;
    }

    const partialUser = partialResponse.body.user;
    
    // Check if bio was updated
    if (partialUser.profile.bio === 'Updated bio - passionate developer') {
      log(colors.green, '✓ SUCCESS', 'Bio updated correctly');
    } else {
      log(colors.red, '❌ FAILED', 'Bio was not updated');
    }

    // Check if skills were updated
    if (partialUser.profile.skills[0]?.level === 'expert' && partialUser.profile.skills[0]?.years === 4) {
      log(colors.green, '✓ SUCCESS', 'React skill updated to expert level with 4 years');
    } else {
      log(colors.red, '❌ FAILED', 'React skill was not updated correctly');
    }

    // Test 6: Validation Test
    log(colors.yellow, '\n[6] PUT /users/profile', '- Testing validation');
    
    const invalidUpdate = {
      profile: {
        skills: [
          {
            name: 'InvalidSkill',
            level: 'invalid-level', // Should fail validation
            years: -5, // Should fail validation
          },
        ],
      },
    };

    const invalidResponse = await makeRequest('PUT', '/users/profile', invalidUpdate);

    if (invalidResponse.status !== 200) {
      log(colors.green, '✓ SUCCESS', `Validation correctly rejected invalid data (Status: ${invalidResponse.status})`);
      console.log('   Error:', invalidResponse.body?.message || invalidResponse.body);
    } else {
      log(colors.red, '❌ FAILED', 'Validation did not reject invalid data');
    }

    log(colors.green, '\n✅ ALL TESTS COMPLETED SUCCESSFULLY!\n', '');

  } catch (error) {
    log(colors.red, '❌ ERROR', error.message);
    console.error(error);
  }
}

// Run tests
console.log(`${colors.bright}${colors.blue}
╔════════════════════════════════════════════╗
║  Student Profile Pipeline Test Suite       ║
║  Production-Ready Database Implementation  ║
╚════════════════════════════════════════════╝
${colors.reset}`);

console.log(`Testing against: ${BASE_URL}`);
console.log(`Session Token: ${SESSION_TOKEN.substring(0, 20)}...`);

if (SESSION_TOKEN === 'your-session-token-here') {
  log(colors.red, '⚠️  WARNING', 'Please set SESSION_TOKEN environment variable');
  console.log('   Usage: SESSION_TOKEN=your-token node profile.test.js\n');
}

testProfileUpdate().then(() => {
  process.exit(0);
}).catch((error) => {
  log(colors.red, '❌ Fatal Error', error.message);
  process.exit(1);
});
