import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from './src/models/course.model.js';

// Load environment variables
dotenv.config();

const sampleCourses = [
  {
    title: "MERN Stack Mastery 2026",
    slug: "mern-stack-mastery",
    description: "Learn to build professional full-stack applications using MongoDB, Express, React, and Node.js.",
    level: "Intermediate",
    category: "web development",
    duration: "12h 45m",
    instructor: {
      name: "Dhris",
      bio: "Full Stack Developer specializing in Skill India initiatives.",
      avatar: "https://ui-avatars.com/api/?name=Dhris"
    },
    modules: [
      {
        moduleTitle: "Backend Foundation",
        videos: [
          { 
            title: "Node.js & Express Setup", 
            youtubeId: "7S_zhv857ZE", 
            duration: "15:20",
            description: "Setting up the server environment." 
          },
          { 
            title: "MongoDB Atlas Connection", 
            youtubeId: "WDrU305J1yw", 
            duration: "10:45",
            description: "Connecting our API to the cloud database." 
          }
        ]
      },
      {
        moduleTitle: "Frontend Integration",
        videos: [
          { 
            title: "React Query Fetching", 
            youtubeId: "lVLz_ASqA4Y", 
            duration: "22:10",
            description: "How to fetch course data in React." 
          }
        ]
      }
    ]
  },
  {
    title: "Data Science Fundamentals",
    slug: "data-science-fundamentals",
    description: "An introductory course on data analysis, visualization, and basic machine learning.",
    level: "Beginner",
    category: "data science",
    duration: "8h 15m",
    instructor: {
      name: "Bhavik",
      bio: "Data Scientist and Best Friend.",
      avatar: "https://ui-avatars.com/api/?name=Bhavik"
    },
    modules: [
      {
        moduleTitle: "Python for Data",
        videos: [
          { 
            title: "NumPy Basics", 
            youtubeId: "QUT1VHiLmmI", 
            duration: "18:30" 
          }
        ]
      }
    ]
  }
];

const seedDatabase = async () => {
  try {
    // 1. Connect to MongoDB
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGODB_URI || process.env.ATLAS_URI);
    console.log("Connected! 🌱");

    // 2. Clear existing courses
    console.log("Clearing old course data...");
    await Course.deleteMany({});

    // 3. Insert new courses
    // Note: Our pre-save middleware will automatically calculate 'totalVideos'
    console.log("Inserting new courses...");
    await Course.insertMany(sampleCourses);

    console.log("------------------------------------");
    console.log("✅ Database successfully seeded!");
    console.log(`Inserted ${sampleCourses.length} courses.`);
    console.log("------------------------------------");

    // 4. Close connection
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();