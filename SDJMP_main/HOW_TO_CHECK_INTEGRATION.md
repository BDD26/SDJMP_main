# 🔍 How to Check Integration

## 🧪 **Quick Integration Test**

### **Method 1: Automated Test Script**
```bash
# Run from project root
node check-integration.js
```

This script will test:
- ✅ Backend server (port 5000)
- ✅ Frontend server (port 3000) 
- ✅ Course API response
- ✅ Database connection
- ✅ Frontend route access
- ✅ CORS configuration

### **Method 2: Manual Browser Test**

1. **Check Backend API:**
   ```
   http://localhost:5000/api/courses/mern-stack-mastery
   ```
   Should return JSON with course data and videos

2. **Check Frontend:**
   ```
   http://localhost:3000/course/mern-stack-mastery
   ```
   Should show course player with video

3. **Check Browser Console:**
   - Open DevTools (F12)
   - Look for API errors
   - Check Network tab for failed requests

### **Method 3: Step-by-Step Verification**

#### **Step 1: Backend Verification**
```bash
# Terminal 1 - Start backend
cd server
npm run seed:courses
npm run dev

# Should see: "SkillMatch API listening on http://localhost:5000"
```

#### **Step 2: Frontend Verification**
```bash
# Terminal 2 - Start frontend  
cd client
npm run dev

# Should see: "Local: http://localhost:3000"
```

#### **Step 3: Integration Verification**
- Open browser to: http://localhost:3000/course/mern-stack-mastery
- Check for:
  - Course title displays
  - YouTube video player loads
  - Sidebar shows video list
  - Progress tracking works

## 🎯 **Expected Results**

### **Working Integration Should Show:**
```
🎉 ALL TESTS PASSED - Integration is Working!

📱 You can now access:
   Frontend: http://localhost:3000/course/mern-stack-mastery
   API: http://localhost:5000/api/courses/mern-stack-mastery

🎬 Videos should be visible in the frontend!
```

### **API Response Should Look Like:**
```json
{
  "success": true,
  "data": {
    "title": "MERN Stack Mastery 2026",
    "slug": "mern-stack-mastery",
    "modules": [
      {
        "moduleTitle": "Backend Foundation",
        "videos": [
          {
            "title": "Node.js & Express Setup",
            "youtubeId": "7S_zhv857ZE",
            "duration": "15:20"
          }
        ]
      }
    ]
  }
}
```

### **Frontend Should Show:**
- ✅ Course header with title
- ✅ YouTube video player (iframe)
- ✅ Sidebar with video list
- ✅ Progress tracking
- ✅ Mobile responsive menu

## 🐛 **Common Issues & Fixes**

### **Issue: "Cannot GET /api/courses/mern-stack-mastery"**
**Fix:** Ensure backend is running on port 5000

### **Issue: "Course Not Found"**
**Fix:** Run `npm run seed:courses` to populate database

### **Issue: CORS errors in browser**
**Fix:** Check CORS settings in server/app.js

### **Issue: YouTube video not loading**
**Fix:** Check if `youtubeId` exists in API response

### **Issue: Frontend shows loading forever**
**Fix:** Check browser console for API errors

## 📊 **Integration Checklist**

- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 3000
- [ ] Database seeded with course data
- [ ] API returns course data with videos
- [ ] Frontend loads course page
- [ ] YouTube video player displays
- [ ] Sidebar shows video list
- [ ] Progress tracking works
- [ ] No CORS errors
- [ ] Mobile responsive

## 🚀 **Success Indicators**

When integration is working, you'll see:

1. **Backend Console:** `SkillMatch API listening on http://localhost:5000`
2. **Frontend Console:** No API errors
3. **Browser:** Course page loads with video player
4. **Network Tab:** Successful API calls to `/api/courses/mern-stack-mastery`
5. **Video Player:** YouTube video loads and plays
6. **Progress Bar:** Shows completion percentage

Run the test script to get instant feedback on your integration status!
