# 🎬 Make Videos Visible in Frontend - Complete Guide

## 🔧 **Step-by-Step Solution**

### **1. Start Backend Server**
```bash
# Open terminal in server directory
cd server

# Seed the database with course data
npm run seed:courses

# Start the development server
npm run dev
```

### **2. Verify Backend is Working**
Open in browser: http://localhost:5000/api/courses/mern-stack-mastery

You should see JSON response like:
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

### **3. Start Frontend**
```bash
# Open new terminal in client directory
cd client

# Start React development server
npm run dev
```

### **4. Access Course Player**
Open in browser: http://localhost:3000/course/mern-stack-mastery

## 🐛 **Troubleshooting**

### **Issue: No Videos Showing**
**Check these:**

1. **Backend Server Running?**
   - Terminal should show: `SkillMatch API listening on http://localhost:5000`
   - If not, run: `cd server && npm run dev`

2. **Database Seeded?**
   - Run: `cd server && npm run seed:courses`
   - Should see: "Courses seeded successfully!"

3. **API Accessible?**
   - Test: http://localhost:5000/api/courses/mern-stack-mastery
   - Should return JSON with course data

4. **Frontend API URL Correct?**
   - Check: `client/src/shared/config/env.js`
   - Should be: `apiBaseUrl: 'http://localhost:5000/api'`

### **Issue: CORS Errors**
**Solution:** Backend CORS should allow frontend
- Backend configured for: `http://localhost:3000`
- Frontend runs on: `http://localhost:3000`

### **Issue: Course Not Found**
**Check slug matching:**
- URL: `/course/mern-stack-mastery`
- Seed data slug: `"mern-stack-mastery"`
- Must match exactly!

## 🎯 **Expected Result**

When working correctly, you should see:

1. **Course Header** with title and description
2. **YouTube Video Player** with first video loaded
3. **Sidebar** with course modules and videos
4. **Progress Tracking** showing completion status
5. **Mobile Responsive** slide-out sidebar

## 📱 **Testing on Mobile**

1. Open browser dev tools
2. Switch to mobile view
3. Click menu button to open sidebar
4. Click videos to switch content

## 🔍 **Debug Commands**

### **Test API Directly**
```bash
# Test course endpoint
curl http://localhost:5000/api/courses/mern-stack-mastery

# Test all courses
curl http://localhost:5000/api/courses
```

### **Check Database**
```bash
# Connect to MongoDB
mongosh

# Check courses collection
use skillmatch
db.courses.find().pretty()
```

### **Frontend Debug**
Open browser dev tools:
1. **Network Tab** - Check API calls
2. **Console Tab** - Look for errors
3. **Elements Tab** - Check DOM structure

## ⚡ **Quick Fix Checklist**

- [ ] Backend server running on port 5000
- [ ] Database seeded with courses
- [ ] Frontend server running on port 3000
- [ ] API responding at http://localhost:5000/api/courses/mern-stack-mastery
- [ ] No CORS errors in browser console
- [ ] YouTube video ID present in API response
- [ ] Course slug matches URL parameter

## 🎉 **Success Indicators**

✅ Backend console shows server started  
✅ API returns course data with videos  
✅ Frontend loads course page  
✅ YouTube video player displays  
✅ Sidebar shows video list  
✅ Progress tracking works  
✅ Mobile responsive design  

If all these are working, videos are successfully visible in the frontend!
