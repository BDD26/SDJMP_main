import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Course from './src/models/course.model.js'
import Skill from './src/modules/skills/skill.model.js'

dotenv.config()

const sampleCourses = [
  {
    title: 'MERN Stack Mastery 2026',
    slug: 'mern-stack-mastery',
    description: 'Learn to build professional full-stack applications using MongoDB, Express, React, and Node.js.',
    level: 'Intermediate',
    category: 'web development',
    duration: '12h 45m',
    instructor: {
      name: 'Dhris',
      bio: 'Full Stack Developer specializing in Skill India initiatives.',
      avatar: 'https://ui-avatars.com/api/?name=Dhris',
    },
    modules: [
      {
        moduleTitle: 'Backend Foundation',
        videos: [
          {
            title: 'Node.js & Express Setup',
            youtubeId: '7S_zhv857ZE',
            duration: '15:20',
            description: 'Setting up the server environment.',
          },
          {
            title: 'MongoDB Atlas Connection',
            youtubeId: 'WDrU305J1yw',
            duration: '10:45',
            description: 'Connecting our API to the cloud database.',
          },
        ],
      },
      {
        moduleTitle: 'Frontend Integration',
        videos: [
          {
            title: 'React Query Fetching',
            youtubeId: 'lVLz_ASqA4Y',
            duration: '22:10',
            description: 'How to fetch course data in React.',
          },
        ],
      },
    ],
  },
  {
    title: 'Data Science Fundamentals',
    slug: 'data-science-fundamentals',
    description: 'An introductory course on data analysis, visualization, and basic machine learning.',
    level: 'Beginner',
    category: 'data science',
    duration: '8h 15m',
    instructor: {
      name: 'Bhavik',
      bio: 'Data Scientist and Best Friend.',
      avatar: 'https://ui-avatars.com/api/?name=Bhavik',
    },
    modules: [
      {
        moduleTitle: 'Python for Data',
        videos: [
          {
            title: 'NumPy Basics',
            youtubeId: 'QUT1VHiLmmI',
            duration: '18:30',
          },
        ],
      },
    ],
  },
]

const sampleSkills = [
  {
    name: 'React',
    category: 'frontend',
    categoryLabel: 'Frontend Development',
    categoryDescription: 'Build accessible, high-performance interfaces for web products.',
    description: 'A component-based JavaScript library for building modern user interfaces and single-page applications.',
    popularity: 98,
    demand: 92,
    jobs: 18420,
    growth: 24,
    tracks: [
      { title: 'React Documentation', type: 'Guide', platform: 'React', link: 'https://react.dev/learn' },
      { title: 'React Crash Course', type: 'Video', platform: 'YouTube', link: 'https://www.youtube.com/watch?v=w7ejDZ8SWv8' },
      { title: 'Thinking in React', type: 'Guide', platform: 'React', link: 'https://react.dev/learn/thinking-in-react' },
    ],
  },
  {
    name: 'TypeScript',
    category: 'frontend',
    categoryLabel: 'Frontend Development',
    categoryDescription: 'Build accessible, high-performance interfaces for web products.',
    description: 'A typed superset of JavaScript that helps teams ship safer frontend and full-stack applications.',
    popularity: 95,
    demand: 89,
    jobs: 16240,
    growth: 28,
    tracks: [
      { title: 'TypeScript Handbook', type: 'Guide', platform: 'TypeScript', link: 'https://www.typescriptlang.org/docs/' },
      { title: 'TypeScript in 100 Seconds', type: 'Video', platform: 'YouTube', link: 'https://www.youtube.com/watch?v=zQnBQ4tB3ZA' },
      { title: 'TSConfig Reference', type: 'Guide', platform: 'TypeScript', link: 'https://www.typescriptlang.org/tsconfig' },
    ],
  },
  {
    name: 'Next.js',
    category: 'frontend',
    categoryLabel: 'Frontend Development',
    categoryDescription: 'Build accessible, high-performance interfaces for web products.',
    description: 'A React framework for production-grade applications with routing, server rendering, and deployment support.',
    popularity: 91,
    demand: 84,
    jobs: 9380,
    growth: 31,
    tracks: [
      { title: 'Next.js Learn', type: 'Guide', platform: 'Vercel', link: 'https://nextjs.org/learn' },
      { title: 'Next.js App Router Course', type: 'Video', platform: 'YouTube', link: 'https://www.youtube.com/watch?v=ZVnjOPwW4ZA' },
      { title: 'Next.js Documentation', type: 'Guide', platform: 'Vercel', link: 'https://nextjs.org/docs' },
    ],
  },
  {
    name: 'Tailwind CSS',
    category: 'frontend',
    categoryLabel: 'Frontend Development',
    categoryDescription: 'Build accessible, high-performance interfaces for web products.',
    description: 'A utility-first CSS framework for crafting fast, responsive design systems.',
    popularity: 88,
    demand: 76,
    jobs: 7020,
    growth: 23,
    tracks: [
      { title: 'Tailwind CSS Docs', type: 'Guide', platform: 'Tailwind', link: 'https://tailwindcss.com/docs' },
      { title: 'Tailwind Crash Course', type: 'Video', platform: 'YouTube', link: 'https://www.youtube.com/watch?v=ft30zcMlFao' },
      { title: 'Responsive Design', type: 'Guide', platform: 'Tailwind', link: 'https://tailwindcss.com/docs/responsive-design' },
    ],
  },
  {
    name: 'Node.js',
    category: 'backend',
    categoryLabel: 'Backend Development',
    categoryDescription: 'Design APIs, services, and backend systems that power production applications.',
    description: 'A JavaScript runtime used to build scalable APIs, automation workflows, and real-time services.',
    popularity: 97,
    demand: 90,
    jobs: 17350,
    growth: 22,
    tracks: [
      { title: 'Node.js Learn', type: 'Guide', platform: 'Node.js', link: 'https://nodejs.org/en/learn' },
      { title: 'Node.js Crash Course', type: 'Video', platform: 'YouTube', link: 'https://www.youtube.com/watch?v=32M1al-Y6Ag' },
      { title: 'Node.js API Docs', type: 'Guide', platform: 'Node.js', link: 'https://nodejs.org/api/' },
    ],
  },
  {
    name: 'Express.js',
    category: 'backend',
    categoryLabel: 'Backend Development',
    categoryDescription: 'Design APIs, services, and backend systems that power production applications.',
    description: 'A lightweight Node.js web framework for building REST APIs and backend services quickly.',
    popularity: 89,
    demand: 81,
    jobs: 11430,
    growth: 17,
    tracks: [
      { title: 'Express Guide', type: 'Guide', platform: 'Express', link: 'https://expressjs.com/en/guide/routing.html' },
      { title: 'Express JS Crash Course', type: 'Video', platform: 'YouTube', link: 'https://www.youtube.com/watch?v=L72fhGm1tfE' },
      { title: 'Middleware Guide', type: 'Guide', platform: 'Express', link: 'https://expressjs.com/en/guide/using-middleware.html' },
    ],
  },
  {
    name: 'MongoDB',
    category: 'backend',
    categoryLabel: 'Backend Development',
    categoryDescription: 'Design APIs, services, and backend systems that power production applications.',
    description: 'A document database widely used in modern web applications for flexible and scalable data storage.',
    popularity: 90,
    demand: 83,
    jobs: 12080,
    growth: 18,
    tracks: [
      { title: 'MongoDB University', type: 'Guide', platform: 'MongoDB', link: 'https://learn.mongodb.com/' },
      { title: 'MongoDB Tutorial for Beginners', type: 'Video', platform: 'YouTube', link: 'https://www.youtube.com/watch?v=ExcRbA7fy_A' },
      { title: 'Aggregation Pipeline', type: 'Guide', platform: 'MongoDB', link: 'https://www.mongodb.com/docs/manual/core/aggregation-pipeline/' },
    ],
  },
  {
    name: 'PostgreSQL',
    category: 'backend',
    categoryLabel: 'Backend Development',
    categoryDescription: 'Design APIs, services, and backend systems that power production applications.',
    description: 'A robust relational database known for reliability, SQL support, and production-grade performance.',
    popularity: 93,
    demand: 87,
    jobs: 14960,
    growth: 26,
    tracks: [
      { title: 'PostgreSQL Tutorial', type: 'Guide', platform: 'PostgreSQL', link: 'https://www.postgresql.org/docs/current/tutorial.html' },
      { title: 'PostgreSQL Full Course', type: 'Video', platform: 'YouTube', link: 'https://www.youtube.com/watch?v=SpfIwlAYaKk' },
      { title: 'SQL Commands', type: 'Guide', platform: 'PostgreSQL', link: 'https://www.postgresql.org/docs/current/sql-commands.html' },
    ],
  },
  {
    name: 'Python',
    category: 'backend',
    categoryLabel: 'Backend Development',
    categoryDescription: 'Design APIs, services, and backend systems that power production applications.',
    description: 'A versatile programming language used in backend development, automation, data science, and AI.',
    popularity: 99,
    demand: 94,
    jobs: 22890,
    growth: 29,
    tracks: [
      { title: 'Python Docs Tutorial', type: 'Guide', platform: 'Python', link: 'https://docs.python.org/3/tutorial/' },
      { title: 'Python for Beginners', type: 'Video', platform: 'YouTube', link: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc' },
      { title: 'Python Packaging Guide', type: 'Guide', platform: 'Python', link: 'https://packaging.python.org/' },
    ],
  },
  {
    name: 'AWS',
    category: 'cloud-devops',
    categoryLabel: 'Cloud and DevOps',
    categoryDescription: 'Deploy, observe, and scale systems across modern cloud platforms and pipelines.',
    description: 'A leading cloud platform offering compute, storage, networking, and managed services for production systems.',
    popularity: 96,
    demand: 91,
    jobs: 19110,
    growth: 27,
    tracks: [
      { title: 'AWS Skill Builder', type: 'Guide', platform: 'AWS', link: 'https://skillbuilder.aws/' },
      { title: 'AWS Certified Cloud Practitioner', type: 'Guide', platform: 'AWS', link: 'https://aws.amazon.com/certification/certified-cloud-practitioner/' },
      { title: 'AWS for Beginners', type: 'Video', platform: 'YouTube', link: 'https://www.youtube.com/watch?v=ulprqHHWlng' },
    ],
  },
  {
    name: 'Docker',
    category: 'cloud-devops',
    categoryLabel: 'Cloud and DevOps',
    categoryDescription: 'Deploy, observe, and scale systems across modern cloud platforms and pipelines.',
    description: 'A container platform that helps package applications consistently across development and production.',
    popularity: 94,
    demand: 88,
    jobs: 15720,
    growth: 25,
    tracks: [
      { title: 'Docker Get Started', type: 'Guide', platform: 'Docker', link: 'https://docs.docker.com/get-started/' },
      { title: 'Docker Tutorial for Beginners', type: 'Video', platform: 'YouTube', link: 'https://www.youtube.com/watch?v=pTFZFxd4hOI' },
      { title: 'Docker Compose', type: 'Guide', platform: 'Docker', link: 'https://docs.docker.com/compose/' },
    ],
  },
  {
    name: 'Kubernetes',
    category: 'cloud-devops',
    categoryLabel: 'Cloud and DevOps',
    categoryDescription: 'Deploy, observe, and scale systems across modern cloud platforms and pipelines.',
    description: 'An orchestration platform for running containerized applications reliably at scale.',
    popularity: 88,
    demand: 82,
    jobs: 10340,
    growth: 30,
    tracks: [
      { title: 'Kubernetes Basics', type: 'Guide', platform: 'Kubernetes', link: 'https://kubernetes.io/docs/tutorials/kubernetes-basics/' },
      { title: 'Kubernetes Course for Beginners', type: 'Video', platform: 'YouTube', link: 'https://www.youtube.com/watch?v=X48VuDVv0do' },
      { title: 'kubectl Cheat Sheet', type: 'Guide', platform: 'Kubernetes', link: 'https://kubernetes.io/docs/reference/kubectl/cheatsheet/' },
    ],
  },
  {
    name: 'Terraform',
    category: 'cloud-devops',
    categoryLabel: 'Cloud and DevOps',
    categoryDescription: 'Deploy, observe, and scale systems across modern cloud platforms and pipelines.',
    description: 'An infrastructure-as-code tool for provisioning and managing cloud resources safely.',
    popularity: 84,
    demand: 74,
    jobs: 6940,
    growth: 21,
    tracks: [
      { title: 'Terraform Tutorials', type: 'Guide', platform: 'HashiCorp', link: 'https://developer.hashicorp.com/terraform/tutorials' },
      { title: 'Terraform Full Course', type: 'Video', platform: 'YouTube', link: 'https://www.youtube.com/watch?v=SLB_c_ayRMo' },
      { title: 'Terraform Language', type: 'Guide', platform: 'HashiCorp', link: 'https://developer.hashicorp.com/terraform/language' },
    ],
  },
  {
    name: 'Machine Learning',
    category: 'emerging-tech',
    categoryLabel: 'Emerging Technology',
    categoryDescription: 'Explore high-growth skills shaping AI, intelligent systems, and the next wave of hiring demand.',
    description: 'A discipline focused on training models to learn patterns from data and make predictions.',
    popularity: 92,
    demand: 86,
    jobs: 11280,
    growth: 35,
    tracks: [
      { title: 'Machine Learning Crash Course', type: 'Guide', platform: 'Google', link: 'https://developers.google.com/machine-learning/crash-course' },
      { title: 'Machine Learning Full Course', type: 'Video', platform: 'YouTube', link: 'https://www.youtube.com/watch?v=Gv9_4yMHFhI' },
      { title: 'Scikit-learn User Guide', type: 'Guide', platform: 'scikit-learn', link: 'https://scikit-learn.org/stable/user_guide.html' },
    ],
  },
  {
    name: 'Generative AI',
    category: 'emerging-tech',
    categoryLabel: 'Emerging Technology',
    categoryDescription: 'Explore high-growth skills shaping AI, intelligent systems, and the next wave of hiring demand.',
    description: 'A field focused on models that generate text, images, code, and other media from prompts and context.',
    popularity: 87,
    demand: 79,
    jobs: 6210,
    growth: 41,
    tracks: [
      { title: 'Generative AI Learning Plan', type: 'Guide', platform: 'Google Cloud', link: 'https://www.cloudskillsboost.google/paths/118' },
      { title: 'Intro to Large Language Models', type: 'Video', platform: 'YouTube', link: 'https://www.youtube.com/watch?v=zjkBMFhNj_g' },
      { title: 'Prompt Engineering Guide', type: 'Guide', platform: 'Prompting Guide', link: 'https://www.promptingguide.ai/' },
    ],
  },
  {
    name: 'Cybersecurity',
    category: 'emerging-tech',
    categoryLabel: 'Emerging Technology',
    categoryDescription: 'Explore high-growth skills shaping AI, intelligent systems, and the next wave of hiring demand.',
    description: 'The practice of securing systems, networks, applications, and data against digital threats.',
    popularity: 90,
    demand: 85,
    jobs: 12840,
    growth: 32,
    tracks: [
      { title: 'Introduction to Cybersecurity', type: 'Guide', platform: 'Cisco', link: 'https://www.netacad.com/courses/cybersecurity/introduction-cybersecurity' },
      { title: 'Cyber Security Full Course', type: 'Video', platform: 'YouTube', link: 'https://www.youtube.com/watch?v=inWWhr5tnEA' },
      { title: 'OWASP Top 10', type: 'Guide', platform: 'OWASP', link: 'https://owasp.org/www-project-top-ten/' },
    ],
  },
  {
    name: 'Data Analysis',
    category: 'data-analytics',
    categoryLabel: 'Data and Analytics',
    categoryDescription: 'Turn raw data into operational insight, reporting, and business decisions.',
    description: 'A practical skill focused on inspecting, cleaning, and interpreting data to support decisions.',
    popularity: 91,
    demand: 84,
    jobs: 14110,
    growth: 24,
    tracks: [
      { title: 'Data Analysis with Python', type: 'Guide', platform: 'freeCodeCamp', link: 'https://www.freecodecamp.org/learn/data-analysis-with-python/' },
      { title: 'Data Analyst Roadmap', type: 'Video', platform: 'YouTube', link: 'https://www.youtube.com/watch?v=yZvFH7B6gKI' },
      { title: 'Pandas Documentation', type: 'Guide', platform: 'Pandas', link: 'https://pandas.pydata.org/docs/' },
    ],
  },
  {
    name: 'Power BI',
    category: 'data-analytics',
    categoryLabel: 'Data and Analytics',
    categoryDescription: 'Turn raw data into operational insight, reporting, and business decisions.',
    description: 'A business intelligence platform for dashboards, reports, and interactive data exploration.',
    popularity: 82,
    demand: 73,
    jobs: 7960,
    growth: 19,
    tracks: [
      { title: 'Power BI Guided Learning', type: 'Guide', platform: 'Microsoft', link: 'https://learn.microsoft.com/en-us/training/powerplatform/power-bi/' },
      { title: 'Power BI Full Course', type: 'Video', platform: 'YouTube', link: 'https://www.youtube.com/watch?v=AGrl-H87pRU' },
      { title: 'DAX Basics', type: 'Guide', platform: 'Microsoft', link: 'https://learn.microsoft.com/en-us/dax/' },
    ],
  },
  {
    name: 'SQL',
    category: 'data-analytics',
    categoryLabel: 'Data and Analytics',
    categoryDescription: 'Turn raw data into operational insight, reporting, and business decisions.',
    description: 'The core query language used to retrieve, transform, and analyze structured data.',
    popularity: 97,
    demand: 93,
    jobs: 23440,
    growth: 18,
    tracks: [
      { title: 'SQL Tutorial', type: 'Guide', platform: 'W3Schools', link: 'https://www.w3schools.com/sql/' },
      { title: 'SQL Full Course', type: 'Video', platform: 'YouTube', link: 'https://www.youtube.com/watch?v=HXV3zeQKqGY' },
      { title: 'SQLBolt', type: 'Guide', platform: 'SQLBolt', link: 'https://sqlbolt.com/' },
    ],
  },
]

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB Atlas...')
    await mongoose.connect(process.env.MONGODB_URI || process.env.ATLAS_URI)
    console.log('Connected!')

    console.log('Clearing old course and skill data...')
    await Promise.all([
      Course.deleteMany({}),
      Skill.deleteMany({}),
    ])

    console.log('Inserting courses...')
    await Course.insertMany(sampleCourses)

    console.log('Inserting skills...')
    await Skill.insertMany(sampleSkills)

    console.log('------------------------------------')
    console.log('Database successfully seeded!')
    console.log(`Inserted ${sampleCourses.length} courses.`)
    console.log(`Inserted ${sampleSkills.length} skills.`)
    console.log('------------------------------------')

    await mongoose.connection.close()
    process.exit(0)
  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  }
}

seedDatabase()
