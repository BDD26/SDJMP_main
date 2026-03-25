# Fixing 403 Forbidden Errors

## Problem Analysis:
The 403 errors indicate that:
1. User is not authenticated (no valid JWT token)
2. User doesn't have the 'student' role
3. JWT token is not being sent in cookies

## Solutions:

### 1. **Fix AlertCircle Import** ✅ FIXED
- Added missing `AlertCircle` import to StudentAssessments.jsx

### 2. **Check Authentication Status**
The user needs to be logged in with a student account to access these endpoints.

### 3. **Development Authentication Options:**

#### Option A: Use Dev Credentials (Recommended for testing)
```javascript
// Use these credentials in your frontend login:
Email: student@skillmatch.dev
Password: Student@123
```

#### Option B: Create a Real Student Account
1. Go to `/register` in your frontend
2. Register as a student
3. Login with the new account

### 4. **Test Authentication Flow:**

#### Step 1: Check if user is logged in
```bash
# Open browser dev tools and check cookies for:
# skillmatch_session cookie should exist
```

#### Step 2: Verify JWT token
```bash
curl -X GET http://localhost:5000/api/auth/session \
  -H "Cookie: skillmatch_session=your-token-here"
```

#### Step 3: Test student endpoints
```bash
curl -X GET http://localhost:5000/api/student/dashboard/stats \
  -H "Cookie: skillmatch_session=your-token-here"
```

### 5. **Debug Steps:**

#### Check Browser Console:
```javascript
// In browser console, check:
document.cookie // Should show skillmatch_session
localStorage.getItem('skillmatch_dev_session') // If using dev auth
```

#### Check Server Logs:
Look for these messages in server console:
- "Authentication required" (401 error)
- "Only students can access..." (403 error)

### 6. **Frontend Debug:**

#### In StudentDashboard.jsx, add debugging:
```javascript
// Add this to see current user:
console.log('Current user:', user)
console.log('User role:', user?.role)
```

### 7. **Common Issues & Fixes:**

#### Issue: No JWT cookie
**Fix**: Login first, then check browser cookies

#### Issue: Wrong user role
**Fix**: Ensure you're logged in as a student, not employer/admin

#### Issue: Expired token
**Fix**: Logout and login again

#### Issue: Dev auth not working
**Fix**: Check if dev auth is enabled in environment

### 8. **Quick Test:**

1. **Login with dev credentials:**
   - Email: `student@skillmatch.dev`
   - Password: `Student@123`

2. **Check if dashboard loads:**
   - Go to student dashboard
   - Should not show 403 errors

3. **If still getting 403:**
   - Clear browser cookies
   - Login again
   - Check browser network tab for request headers

### 9. **Server-Side Verification:**

The middleware correctly checks:
```javascript
// requireAuth middleware checks JWT token
// requireRole(['student']) checks user role
```

Both are working correctly - the issue is likely authentication state.

## Immediate Action Required:

1. **Login with student credentials** (use dev credentials for testing)
2. **Check browser cookies** for `skillmatch_session`
3. **Verify user role** is 'student' in frontend
4. **Clear cache/cookies** if issues persist

The authentication system is working correctly - you just need to be properly authenticated as a student.
