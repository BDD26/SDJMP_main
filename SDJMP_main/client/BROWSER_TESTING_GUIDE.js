/**
 * Browser Console Testing Guide for Student Profile
 * 
 * This script can be pasted into the browser console (F12 -> Console tab)
 * while on the student profile page to help verify the implementation.
 * 
 * Test the profile pipeline end-to-end with these functions.
 */

// ============================================
// PROFILE PIPELINE TESTING FUNCTIONS
// ============================================

// 1. Display current profile data from context
function displayProfileData() {
  console.group('📋 Current Profile Data');
  
  // Try to get user from window if available (depends on your app structure)
  if (window.__PROFILE_DATA__) {
    console.log('Profile Data:', window.__PROFILE_DATA__);
  } else {
    console.log('Note: Profile data not directly accessible from window.');
    console.log('To view profile data:');
    console.log('1. Check React DevTools (Components tab) -> AuthProvider');
    console.log('2. Look for "user" prop in AuthContext');
    console.log('3. Expand user.profile to see all fields');
  }
  
  console.groupEnd();
}

// 2. Test adding a skill through the UI
function testAddSkill(skillData = {}) {
  const defaultSkill = {
    name: 'Test Skill ' + new Date().getTime(),
    level: 'intermediate',
    years: 2
  };
  
  const skill = { ...defaultSkill, ...skillData };
  
  console.group('🔧 Test: Adding Skill');
  console.log('Skill to add:', skill);
  console.log('Next steps:');
  console.log('1. Click the "+" button in Skills Inventory');
  console.log('2. Enter:', `Name: ${skill.name}, Level: ${skill.level}, Years: ${skill.years}`);
  console.log('3. Click Save and monitor the Network tab for /users/profile request');
  console.groupEnd();
}

// 3. Monitor API calls for profile updates
function monitorProfileAPI() {
  console.group('📡 API Monitoring Setup');
  
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const [resource, config] = args;
    
    if (resource.includes('/users/profile')) {
      console.group(`API Call: ${config?.method || 'GET'} /users/profile`);
      console.log('Request:', {
        method: config?.method,
        body: config?.body ? JSON.parse(config.body) : null,
      });
      
      return originalFetch.apply(this, args)
        .then(response => {
          const clonedResponse = response.clone();
          clonedResponse.json().then(data => {
            console.log('Response:', {
              status: response.status,
              data: data,
            });
            
            // Validate skill structure
            if (data.user?.profile?.skills) {
              console.group('✓ SKILL VALIDATION');
              data.user.profile.skills.forEach((skill, index) => {
                const isValid = skill.name && skill.level && skill.years !== undefined;
                console.log(`Skill ${index}: ${skill.name}`, isValid ? '✓' : '❌', {
                  name: skill.name,
                  level: skill.level,
                  years: skill.years,
                });
              });
              console.groupEnd();
            }
          }).catch(err => console.error('Error parsing response:', err));
          
          console.groupEnd();
          return response;
        });
    }
    
    return originalFetch.apply(this, args);
  };
  
  console.log('✓ API monitoring enabled');
  console.log('Now perform profile updates and watch the console for API details');
  console.groupEnd();
}

// 4. Validate profile data structure
function validateProfileStructure(userObject) {
  console.group('🔍 Profile Structure Validation');
  
  const profile = userObject?.profile || {};
  const requiredFields = ['bio', 'location', 'skills', 'education', 'projects', 'certifications', 'preferences'];
  
  requiredFields.forEach(field => {
    const exists = field in profile;
    const isEmpty = Array.isArray(profile[field]) ? profile[field].length === 0 : !profile[field];
    
    console.log(`${field}:`, {
      exists: exists ? '✓' : '❌',
      empty: isEmpty ? '(empty)' : '(has data)',
      value: profile[field],
    });
  });
  
  // Validate skills specifically
  console.group('📌 Skills Detailed Validation');
  if (Array.isArray(profile.skills)) {
    profile.skills.forEach((skill, index) => {
      const isValid = skill.name && skill.level && (skill.years !== undefined);
      const icon = isValid ? '✓' : '❌';
      console.log(`${icon} Skill ${index}:`, {
        name: skill.name || '(missing)',
        level: skill.level || '(missing)',
        years: skill.years !== undefined ? skill.years : '(missing)',
        valid: isValid,
      });
    });
  } else {
    console.log('❌ Skills is not an array:', profile.skills);
  }
  console.groupEnd();
  
  console.groupEnd();
}

// 5. Check local storage for any frontend-only data
function checkLocalStorage() {
  console.group('💾 Local Storage Check');
  
  const keys = Object.keys(localStorage);
  const profileRelated = keys.filter(k => 
    k.includes('profile') || 
    k.includes('user') || 
    k.includes('student') ||
    k.includes('auth')
  );
  
  if (profileRelated.length === 0) {
    console.log('No profile-related data in localStorage (Good!)');
  } else {
    console.log('Found profile-related localStorage entries:');
    profileRelated.forEach(key => {
      const value = localStorage.getItem(key);
      console.log(`  ${key}:`, {
        size: value.length + ' bytes',
        preview: value.substring(0, 100) + '...',
      });
    });
  }
  
  console.groupEnd();
}

// 6. Clear local storage (if needed for testing)
function clearProfileLocalStorage() {
  console.group('🗑️ Clear Profile Storage');
  
  const keys = Object.keys(localStorage);
  const profileRelated = keys.filter(k => 
    k.includes('profile') || 
    k.includes('auth') ||
    k.includes('session')
  );
  
  console.warn('About to delete', profileRelated.length, 'localStorage entries:');
  profileRelated.forEach(key => {
    console.log('  -', key);
    localStorage.removeItem(key);
  });
  
  console.log('✓ Cache cleared. Refresh page to reload data from server.');
  console.groupEnd();
}

// 7. Simulate a profile save and verify database persistence
function testPersistence() {
  console.group('⚙️ Database Persistence Test');
  
  console.log('Test Plan:');
  console.log('1. Add a skill with unique name: "TEST-' + Date.now() + '"');
  console.log('2. Save the profile');
  console.log('3. Open MongoDB Atlas and verify the skill is in the database');
  console.log('4. Refresh the page');
  console.log('5. Verify the skill still appears (proves data came from DB)');
  console.log('');
  console.log('MongoDB Query to verify:');
  console.log(`db.users.findOne({ _id: ObjectId("USER_ID") }, { "profile.skills": 1 })`);
  
  console.groupEnd();
}

// 8. Performance check for profile operations
function checkPerformance() {
  console.group('⚡ Performance Metrics');
  
  // Check time to first update
  const startTime = performance.now();
  
  console.log('Profile update response time measurement:');
  console.log('1. Open DevTools Network tab');
  console.log('2. Make a profile change');
  console.log('3. Look for /users/profile request');
  console.log('4. Check the time column (should be < 500ms for good UX)');
  
  console.groupEnd();
}

// 9. Debug: Show all transformations
function debugTransformations() {
  console.group('🔄 Transformation Debug');
  
  const exampleSkill = {
    name: 'React',
    level: 'advanced',
    years: 3
  };
  
  console.log('Frontend to Backend transformation:');
  console.log('Input:', exampleSkill);
  console.log('Expected output:', exampleSkill, '(no change - both use same structure)');
  
  console.log('');
  console.log('Backend to Frontend transformation:');
  console.log('Input:', exampleSkill);
  console.log('Expected output:', exampleSkill, '(no change - both use same structure)');
  
  console.groupEnd();
}

// 10. Comprehensive test report
function generateTestReport() {
  console.group('📊 Comprehensive Test Report');
  
  console.log(`
╔════════════════════════════════════════════════════╗
║     PROFILE PIPELINE - COMPREHENSIVE TEST REPORT   ║
╚════════════════════════════════════════════════════╝

QUICK TESTS:
─────────────
1. Check Profile Data:
   » displayProfileData()

2. Setup API Monitoring:
   » monitorProfileAPI()
   
3. Check Local Storage:
   » checkLocalStorage()

4. Validate Profile Structure:
   » validateProfileStructure(USER_OBJECT)

5. Test Persistence:
   » testPersistence()

MANUAL TEST STEPS:
──────────────────
1. Add a Skill:
   ✓ Click "+" button in Skills Inventory
   ✓ Fill in all fields (name, level, years)
   ✓ Click Save
   ✓ Check Network tab for successful /users/profile request
   ✓ Verify response contains full skill object (not just name)

2. Refresh and Verify:
   ✓ Press F5 to refresh the page
   ✓ Observe if skill still appears
   ✓ Open browser DevTools → Storage → Cookies
   ✓ Verify session token exists

3. Database Verification:
   ✓ Open MongoDB Atlas
   ✓ Navigate to the user collection
   ✓ Search for your user ID
   ✓ Verify profile.skills is array of objects (not strings)

EXPECTED RESULTS:
─────────────────
✓ Skills stored as objects: { name, level, years }
✓ Data persists after page refresh
✓ API response includes complete skill data
✓ Database shows no string-based skills
✓ Profile completion % updates correctly

ISSUES TO CHECK:
────────────────
❌ Skills appear as strings → Update user model in DB
❌ Data lost on refresh → Check session token
❌ Validation errors → Check validation schema
❌ API 500 error → Check server logs
❌ CORS issues → Check API configuration
  `);
  
  console.log('\n📞 For support, check:');
  console.log('   • Browser Console (F12)');
  console.log('   • Server Logs');
  console.log('   • MongoDBAtlas dashboard');
  console.log('   • Network tab (DevTools → Network)');
  
  console.groupEnd();
}

// ============================================
// RUN COMPREHENSIVE TEST
// ============================================

console.log(`
%c╔════════════════════════════════════════════════════╗
║  Student Profile Pipeline - Testing Guide        ║
║  Run: generateTestReport() for full test info     ║
╚════════════════════════════════════════════════════╝`, 
`color: #4CAF50; font-weight: bold; font-size: 14px;`);

console.log('%cAvailable Test Functions:', 'color: #2196F3; font-weight: bold; font-size: 12px;');
console.log(`
  1. displayProfileData()              - Show current profile state
  2. testAddSkill()                    - Guide for adding a test skill
  3. monitorProfileAPI()               - Enable API monitoring
  4. validateProfileStructure()        - Validate profile data structure
  5. checkLocalStorage()               - Check browser storage
  6. clearProfileLocalStorage()        - Clear profile cache
  7. testPersistence()                 - Test database persistence
  8. checkPerformance()                - Check performance metrics
  9. debugTransformations()            - Debug data transformations
  10. generateTestReport()             - Full test report
`);

console.log('%cStart with: generateTestReport()', 'color: #FF9800; font-weight: bold;');
