const mongoose = require('mongoose')
const Course = require('../models/course.model')
const UserProgress = require('../models/userProgress.model')

// Sample course data with real YouTube IDs
const courses = [
  {
    title: 'Python for Data Science',
    slug: 'python-for-data-science',
    description: 'Master Python programming for data science, machine learning, and data analysis. This comprehensive course covers everything from Python basics to advanced data science techniques.',
    instructor: {
      name: 'Dr. Sarah Chen',
      bio: 'Data Scientist with 10+ years of experience in machine learning and statistical analysis',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    level: 'Intermediate',
    category: 'data-science',
    duration: '12h 30m',
    rating: 4.8,
    studentsEnrolled: 15420,
    modules: [
      {
        moduleTitle: 'Python Fundamentals',
        description: 'Learn the basics of Python programming',
        order: 1,
        videos: [
          {
            title: 'Introduction to Python for Data Science',
            youtubeId: 'rfscVS0vtbw',
            duration: '18:45',
            description: 'Get started with Python and understand why it\'s popular in data science',
            order: 1
          },
          {
            title: 'Variables, Data Types, and Operations',
            youtubeId: 'RWGihwqW3wU',
            duration: '22:30',
            description: 'Understanding Python variables and basic operations',
            order: 2
          },
          {
            title: 'Control Flow and Functions',
            youtubeId: 'kqtD5dpnvCw',
            duration: '25:15',
            description: 'Learn about conditional statements and functions in Python',
            order: 3
          },
          {
            title: 'Working with Lists and Dictionaries',
            youtubeId: 'daefaLgNkw0',
            duration: '20:10',
            description: 'Master Python data structures for data manipulation',
            order: 4
          }
        ]
      },
      {
        moduleTitle: 'Data Analysis with NumPy and Pandas',
        description: 'Essential libraries for data manipulation',
        order: 2,
        videos: [
          {
            title: 'NumPy Arrays and Operations',
            youtubeId: 'QUT1VHiLmmI',
            duration: '28:20',
            description: 'Learn NumPy for efficient numerical computations',
            order: 1
          },
          {
            title: 'Pandas DataFrames Introduction',
            youtubeId: 'vmEHCJofslg',
            duration: '32:45',
            description: 'Get started with Pandas for data analysis',
            order: 2
          },
          {
            title: 'Data Cleaning and Preprocessing',
            youtubeId: 'Kz_W5vme-7w',
            duration: '35:30',
            description: 'Techniques for cleaning and preparing data',
            order: 3
          },
          {
            title: 'Data Aggregation and Grouping',
            youtubeId: 'txMdrV1Ut64',
            duration: '26:15',
            description: 'Aggregating and grouping data with Pandas',
            order: 4
          }
        ]
      },
      {
        moduleTitle: 'Data Visualization',
        description: 'Create compelling visualizations with Python',
        order: 3,
        videos: [
          {
            title: 'Matplotlib Basics',
            youtubeId: 'UO98lJQ3QGI',
            duration: '24:40',
            description: 'Introduction to Matplotlib for plotting',
            order: 1
          },
          {
            title: 'Seaborn for Statistical Visualization',
            youtubeId: '6GUZXUe2WpM',
            duration: '30:20',
            description: 'Advanced statistical plots with Seaborn',
            order: 2
          },
          {
            title: 'Interactive Plots with Plotly',
            youtubeId: 'Ggl7nU_yjtU',
            duration: '27:35',
            description: 'Create interactive visualizations',
            order: 3
          }
        ]
      },
      {
        moduleTitle: 'Machine Learning Fundamentals',
        description: 'Introduction to machine learning with scikit-learn',
        order: 4,
        videos: [
          {
            title: 'Introduction to Machine Learning',
            youtubeId: 'G2QI1Fo2W8I',
            duration: '31:20',
            description: 'Understanding the basics of machine learning',
            order: 1
          },
          {
            title: 'Supervised Learning: Regression',
            youtubeId: 'qSyp6K8_PGM',
            duration: '35:45',
            description: 'Linear and polynomial regression',
            order: 2
          },
          {
            title: 'Supervised Learning: Classification',
            youtubeId: '7AzZ0EDFA-s',
            duration: '38:30',
            description: 'Classification algorithms and evaluation',
            order: 3
          },
          {
            title: 'Unsupervised Learning: Clustering',
            youtubeId: 'XvL7RyYHq4Q',
            duration: '33:15',
            description: 'K-means and hierarchical clustering',
            order: 4
          }
        ]
      }
    ]
  },
  {
    title: 'Advanced Node.js Development',
    slug: 'advanced-nodejs',
    description: 'Master advanced Node.js concepts including microservices, performance optimization, and production deployment. Build scalable, enterprise-grade applications with Node.js.',
    instructor: {
      name: 'Michael Rodriguez',
      bio: 'Full-stack developer and Node.js expert with 8+ years of experience',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    level: 'Advanced',
    category: 'backend',
    duration: '15h 45m',
    rating: 4.9,
    studentsEnrolled: 12350,
    modules: [
      {
        moduleTitle: 'Advanced Node.js Concepts',
        description: 'Deep dive into Node.js internals and advanced patterns',
        order: 1,
        videos: [
          {
            title: 'Node.js Event Loop Deep Dive',
            youtubeId: 'P9csgXq3-3c',
            duration: '35:20',
            description: 'Understanding the Node.js event loop and concurrency model',
            order: 1
          },
          {
            title: 'Streams and Buffers',
            youtubeId: 'g1xLmUjAiW4',
            duration: '28:45',
            description: 'Working with streams for efficient data processing',
            order: 2
          },
          {
            title: 'Advanced Error Handling',
            youtubeId: '4oKO-LDKM-w',
            duration: '32:10',
            description: 'Robust error handling and debugging techniques',
            order: 3
          },
          {
            title: 'Memory Management and Performance',
            youtubeId: '1A-8j_dS8eU',
            duration: '40:30',
            description: 'Optimizing Node.js applications for performance',
            order: 4
          }
        ]
      },
      {
        moduleTitle: 'Microservices Architecture',
        description: 'Build and deploy microservices with Node.js',
        order: 2,
        videos: [
          {
            title: 'Introduction to Microservices',
            youtubeId: 'CZPTfCJBBog',
            duration: '30:15',
            description: 'Understanding microservices architecture principles',
            order: 1
          },
          {
            title: 'Building RESTful APIs with Express',
            youtubeId: 'L72fhGm1tfE',
            duration: '33:40',
            description: 'Advanced Express.js patterns and best practices',
            order: 2
          },
          {
            title: 'GraphQL with Node.js',
            youtubeId: 'Edsxc6y23DQ',
            duration: '38:25',
            description: 'Implementing GraphQL APIs with Apollo Server',
            order: 3
          },
          {
            title: 'Service Discovery and Load Balancing',
            youtubeId: '6e3bQ6VjP3s',
            duration: '35:50',
            description: 'Implementing service discovery and load balancing',
            order: 4
          }
        ]
      },
      {
        moduleTitle: 'Database Integration',
        description: 'Advanced database patterns and optimization',
        order: 3,
        videos: [
          {
            title: 'Advanced MongoDB with Mongoose',
            youtubeId: '9oS-Qq09yWg',
            duration: '42:20',
            description: 'Advanced MongoDB patterns and aggregation',
            order: 1
          },
          {
            title: 'Redis for Caching and Sessions',
            youtubeId: 'hOlwz3mP6rE',
            duration: '36:15',
            description: 'Implementing Redis for caching and session management',
            order: 2
          },
          {
            title: 'Database Connection Pooling',
            youtubeId: 'vQn8d4f3yKk',
            duration: '28:30',
            description: 'Optimizing database connections and pooling',
            order: 3
          },
          {
            title: 'Data Migration Strategies',
            youtubeId: 'bF9Qq7k3Z2s',
            duration: '31:45',
            description: 'Database migration and versioning strategies',
            order: 4
          }
        ]
      },
      {
        moduleTitle: 'Testing and Quality Assurance',
        description: 'Comprehensive testing strategies for Node.js applications',
        order: 4,
        videos: [
          {
            title: 'Unit Testing with Jest',
            youtubeId: '7rCA5ZB9-tM',
            duration: '34:20',
            description: 'Writing effective unit tests with Jest',
            order: 1
          },
          {
            title: 'Integration and End-to-End Testing',
            youtubeId: '9lGQ8B9-7tQ',
            duration: '38:45',
            description: 'Integration testing with supertest and E2E testing',
            order: 2
          },
          {
            title: 'Test-Driven Development',
            youtubeId: 'vQn8d4f3yKk',
            duration: '32:10',
            description: 'TDD practices and red-green-refactor cycle',
            order: 3
          },
          {
            title: 'Continuous Integration and Deployment',
            youtubeId: '7AzZ0EDFA-s',
            duration: '40:30',
            description: 'CI/CD pipelines for Node.js applications',
            order: 4
          }
        ]
      },
      {
        moduleTitle: 'Security and Authentication',
        description: 'Secure your Node.js applications',
        order: 5,
        videos: [
          {
            title: 'Authentication with JWT and OAuth',
            youtubeId: 'mbsmsi7lDK4',
            duration: '36:40',
            description: 'Implementing secure authentication systems',
            order: 1
          },
          {
            title: 'Security Best Practices',
            youtubeId: '9lGQ8B9-7tQ',
            duration: '33:20',
            description: 'Common security vulnerabilities and prevention',
            order: 2
          },
          {
            title: 'Rate Limiting and DDoS Protection',
            youtubeId: 'vQn8d4f3yKk',
            duration: '30:15',
            description: 'Implementing rate limiting and DDoS protection',
            order: 3
          }
        ]
      }
    ]
  },
  {
    title: 'React Development Masterclass',
    slug: 'react-development',
    description: 'Become a React expert from basics to advanced concepts. Learn hooks, state management, performance optimization, and build production-ready applications.',
    instructor: {
      name: 'Emma Thompson',
      bio: 'React specialist and frontend architect with 7+ years of experience',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    },
    level: 'Intermediate',
    category: 'frontend',
    duration: '18h 20m',
    rating: 4.7,
    studentsEnrolled: 18920,
    modules: [
      {
        moduleTitle: 'React Fundamentals',
        description: 'Master the basics of React',
        order: 1,
        videos: [
          {
            title: 'React Introduction and Setup',
            youtubeId: 'Ke90TjeGeVS',
            duration: '22:30',
            description: 'Getting started with React and development environment',
            order: 1
          },
          {
            title: 'Components and Props',
            youtubeId: 'IrHmgOSlDv0',
            duration: '28:45',
            description: 'Understanding React components and props',
            order: 2
          },
          {
            title: 'State and Lifecycle',
            youtubeId: 'TNhaISOUy6Q',
            duration: '35:20',
            description: 'Component state and lifecycle methods',
            order: 3
          },
          {
            title: 'Handling Events and Forms',
            youtubeId: 'B2JAj4F9k8Y',
            duration: '32:10',
            description: 'Event handling and form management in React',
            order: 4
          }
        ]
      },
      {
        moduleTitle: 'React Hooks Deep Dive',
        description: 'Master modern React with hooks',
        order: 2,
        videos: [
          {
            title: 'useState and useEffect Hooks',
            youtubeId: 'TNhaISOUy6Q',
            duration: '40:15',
            description: 'Understanding the most important React hooks',
            order: 1
          },
          {
            title: 'Custom Hooks',
            youtubeId: '5LrDiIWnIgs',
            duration: '36:30',
            description: 'Creating reusable custom hooks',
            order: 2
          },
          {
            title: 'useContext and useReducer',
            youtubeId: 'Cv_aHu9Iz-I',
            duration: '38:45',
            description: 'Advanced state management with hooks',
            order: 3
          },
          {
            title: 'Performance Hooks',
            youtubeId: '1YrYDf4g2wU',
            duration: '34:20',
            description: 'useMemo, useCallback, and React.memo',
            order: 4
          }
        ]
      },
      {
        moduleTitle: 'State Management',
        description: 'Advanced state management patterns',
        order: 3,
        videos: [
          {
            title: 'Context API Patterns',
            youtubeId: '5LrDiIWnIgs',
            duration: '42:10',
            description: 'Advanced Context API usage patterns',
            order: 1
          },
          {
            title: 'Redux Fundamentals',
            youtubeId: 'CV1tQ2ZtVY8',
            duration: '45:30',
            description: 'Understanding Redux for state management',
            order: 2
          },
          {
            title: 'Redux Toolkit and RTK Query',
            youtubeId: 'NqzdCN2oMGg',
            duration: '48:20',
            description: 'Modern Redux with Redux Toolkit',
            order: 3
          },
          {
            title: 'Zustand and Jotai',
            youtubeId: '7AzZ0EDFA-s',
            duration: '35:45',
            description: 'Lightweight state management alternatives',
            order: 4
          }
        ]
      }
    ]
  }
]

// Seeding function
async function seedCourses() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    
    console.log('Clearing existing courses...')
    await Course.deleteMany({})
    await UserProgress.deleteMany({})
    
    console.log('Seeding courses...')
    const insertedCourses = await Course.insertMany(courses)
    console.log(`Inserted ${insertedCourses.length} courses`)
    
    // Create some sample progress for testing
    console.log('Creating sample progress data...')
    const sampleProgress = []
    
    // Create progress for first course with a user (assuming user exists)
    if (insertedCourses.length > 0) {
      sampleProgress.push({
        userId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'), // Sample user ID
        courseId: insertedCourses[0]._id,
        completedVideos: [
          { youtubeId: 'rfscVS0vtbw', completedAt: new Date() },
          { youtubeId: 'RWGihwqW3wU', completedAt: new Date() }
        ],
        lastAccessed: new Date(),
        lastAccessedVideo: {
          youtubeId: 'kqtD5dpnvCw',
          accessedAt: new Date()
        },
        timeSpent: 65,
        notes: [
          {
            videoId: 'rfscVS0vtbw',
            content: 'Python is great for data science because of its simplicity and powerful libraries',
            timestamp: 180,
            createdAt: new Date()
          }
        ]
      })
    }
    
    if (sampleProgress.length > 0) {
      await UserProgress.insertMany(sampleProgress)
      console.log('Created sample progress data')
    }
    
    console.log('Seeding completed successfully!')
    
    // Display seeded courses
    console.log('\nSeeded Courses:')
    insertedCourses.forEach((course, index) => {
      const totalVideos = course.modules.reduce((total, module) => total + module.videos.length, 0)
      console.log(`${index + 1}. ${course.title} (${course.slug})`)
      console.log(`   Modules: ${course.modules.length}, Videos: ${totalVideos}`)
      console.log(`   Level: ${course.level}, Category: ${course.category}`)
      console.log('')
    })
    
  } catch (error) {
    console.error('Error seeding courses:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedCourses().catch(console.error)
}

module.exports = { seedCourses, courses }
