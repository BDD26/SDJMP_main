# LMS Backend Architecture

A robust REST API for a Learning Management System (LMS) built with Node.js, Express, and MongoDB, specifically designed to support the Course Player functionality.

## 🏗️ Architecture Overview

### Database Models

#### Course Model
```javascript
{
  title: String,
  slug: String (unique),
  description: String,
  modules: [{
    moduleTitle: String,
    description: String,
    videos: [{
      title: String,
      youtubeId: String (11 chars),
      duration: String (MM:SS),
      description: String,
      order: Number
    }],
    order: Number
  }],
  instructor: {
    name: String,
    bio: String,
    avatar: String
  },
  level: ['Beginner', 'Intermediate', 'Advanced'],
  category: String,
  duration: String,
  rating: Number,
  studentsEnrolled: Number
}
```

#### UserProgress Model
```javascript
{
  userId: ObjectId (ref: User),
  courseId: ObjectId (ref: Course),
  completedVideos: [{
    youtubeId: String,
    completedAt: Date
  }],
  lastAccessed: Date,
  lastAccessedVideo: {
    youtubeId: String,
    accessedAt: Date
  },
  completionPercentage: Number,
  isCompleted: Boolean,
  timeSpent: Number,
  notes: [{
    videoId: String,
    content: String,
    timestamp: Number,
    createdAt: Date
  }]
}
```

## 🚀 API Endpoints

### Public Routes

#### `GET /api/courses`
Retrieve all courses with pagination and filtering.

**Query Parameters:**
- `category` (optional): Filter by category
- `level` (optional): Filter by level
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "courses": [...],
    "pagination": {
      "current": 1,
      "total": 5,
      "count": 50
    }
  }
}
```

#### `GET /api/courses/:slug`
Retrieve full course details by slug with all modules and videos.

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Python for Data Science",
    "slug": "python-for-data-science",
    "modules": [...],
    "videoCount": 15,
    "instructor": {...}
  }
}
```

### Protected Routes (JWT Required)

#### `GET /api/courses/progress/:courseId`
Get user's progress for a specific course.

**Response:**
```json
{
  "success": true,
  "data": {
    "completedVideos": [...],
    "completedCount": 5,
    "totalVideos": 15,
    "completionPercentage": 33,
    "isCompleted": false,
    "nextVideo": {...},
    "currentModule": "Python Fundamentals"
  }
}
```

#### `PATCH /api/courses/progress/update`
Mark a video as completed.

**Request Body:**
```json
{
  "courseId": "507f1f77bcf86cd799439011",
  "videoId": "rfscVS0vtbw",
  "timeSpent": 25
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "wasCompleted": true,
    "completedCount": 6,
    "completionPercentage": 40,
    "isCompleted": false
  }
}
```

#### `PATCH /api/courses/progress/last-accessed`
Update the last accessed video.

**Request Body:**
```json
{
  "courseId": "507f1f77bcf86cd799439011",
  "videoId": "kqtD5dpnvCw"
}
```

#### `POST /api/courses/progress/:courseId/notes`
Add a note for a specific video.

**Request Body:**
```json
{
  "videoId": "rfscVS0vtbw",
  "content": "Python is great for data science",
  "timestamp": 180
}
```

## 🔐 Security Features

### JWT Authentication
- All progress endpoints require valid JWT token
- User can only update their own progress
- Token verification using existing middleware

### Input Validation
- Zod schemas for all inputs
- YouTube ID format validation (11 characters)
- MongoDB ObjectId validation
- SQL injection prevention

### Rate Limiting
- 300 requests per 15 minutes per IP
- Protection against brute force attacks

## 📊 Performance Optimizations

### Database
- Lean queries for course retrieval
- Compound indexes on user-course combinations
- Virtual fields for computed values
- Pre-save middleware for data consistency

### Caching
- Static course data can be cached
- Progress data updated in real-time
- Efficient aggregation queries

## 🌱 Database Seeding

### Run Seeding Script
```bash
npm run seed:courses
```

### Sample Courses
1. **Python for Data Science** - 12.5 hours, 4 modules
2. **Advanced Node.js Development** - 15.75 hours, 5 modules  
3. **React Development Masterclass** - 18.33 hours, 3 modules

### Sample Progress Data
- Creates sample user progress for testing
- Includes completed videos and notes
- Realistic timestamps and time tracking

## 📱 Integration with Frontend

### Course Player Integration
1. Fetch course by slug: `GET /api/courses/:slug`
2. Get user progress: `GET /api/courses/progress/:courseId`
3. Update progress: `PATCH /api/courses/progress/update`
4. Track last accessed: `PATCH /api/courses/progress/last-accessed`

### Real-time Updates
- Progress calculated automatically
- Completion percentage updates
- Next video suggestions
- Time tracking

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas connection
- JWT secret configured

### Environment Variables
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:3000
```

### Installation
```bash
cd server
npm install
npm run seed:courses
npm run dev
```

## 📈 Monitoring & Analytics

### Progress Tracking
- Video completion rates
- Time spent per video
- Course completion statistics
- User engagement metrics

### Performance Metrics
- API response times
- Database query performance
- Error tracking and logging

## 🔧 Advanced Features

### Notes System
- Users can add timestamped notes
- Notes linked to specific videos
- Searchable note content

### Progress Calculation
- Automatic percentage calculation
- Completion status tracking
- Next video recommendations

### Data Integrity
- Unique user-course combinations
- Valid YouTube ID enforcement
- Consistent timestamp handling

## 🚀 Deployment Considerations

### MongoDB Atlas
- Scalable document database
- Global distribution
- Automatic backups
- Performance monitoring

### Production Optimizations
- Connection pooling
- Query optimization
- Error handling
- Logging and monitoring

## 📝 API Documentation

### Error Responses
```json
{
  "success": false,
  "error": {
    "message": "Course not found",
    "status": 404
  }
}
```

### Success Responses
All successful responses follow the format:
```json
{
  "success": true,
  "data": {...},
  "message": "Operation completed successfully"
}
```

## 🔍 Testing

### Sample API Calls
```bash
# Get all courses
curl http://localhost:5000/api/courses

# Get specific course
curl http://localhost:5000/api/courses/python-for-data-science

# Get user progress (requires JWT)
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/courses/progress/507f1f77bcf86cd799439011
```

## 🎯 Future Enhancements

### Planned Features
- Video bookmarks
- Quiz integration
- Certificate generation
- Social learning features
- Advanced analytics dashboard

### Scalability
- Microservices architecture
- Redis caching layer
- CDN integration
- Load balancing

---

This LMS backend provides a solid foundation for the Course Player functionality with robust security, performance optimization, and scalability considerations.
