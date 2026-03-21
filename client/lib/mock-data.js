// Mock data for the Skill Development & Job Matching Portal

export const currentStudent = {
  id: 'STU001',
  name: 'Alex Johnson',
  email: 'alex.johnson@university.edu',
  avatar: '/placeholder.svg?height=40&width=40',
  education: {
    degree: 'B.Tech Computer Science',
    institution: 'State Technical University',
    graduationYear: 2025,
    gpa: 3.8,
  },
  skills: [
    { name: 'React', level: 'Advanced', yearsOfExperience: 2 },
    { name: 'Node.js', level: 'Intermediate', yearsOfExperience: 1.5 },
    { name: 'Python', level: 'Intermediate', yearsOfExperience: 2 },
    { name: 'TypeScript', level: 'Advanced', yearsOfExperience: 1 },
    { name: 'MongoDB', level: 'Beginner', yearsOfExperience: 0.5 },
    { name: 'SQL', level: 'Intermediate', yearsOfExperience: 1 },
  ],
  profileCompletion: 85,
  jobsApplied: 12,
  assessmentsPassed: 8,
  badges: ['Advanced React Developer', 'Node.js Certified', 'Python Intermediate'],
}

export const jobs = [
  {
    id: 'JOB001',
    title: 'Frontend Developer',
    company: 'TechCorp Solutions',
    companyLogo: '/placeholder.svg?height=48&width=48',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salary: '$80,000 - $120,000',
    description: 'We are looking for a skilled Frontend Developer to join our team and build amazing user experiences.',
    requiredSkills: [
      { name: 'React', minLevel: 'Intermediate', weight: 0.4 },
      { name: 'TypeScript', minLevel: 'Intermediate', weight: 0.3 },
      { name: 'CSS', minLevel: 'Beginner', weight: 0.2 },
      { name: 'Git', minLevel: 'Beginner', weight: 0.1 },
    ],
    postedDate: '2025-03-10',
    deadline: '2025-04-10',
    status: 'Active',
    applicantsCount: 45,
  },
  {
    id: 'JOB002',
    title: 'Full Stack Engineer',
    company: 'InnovateTech',
    companyLogo: '/placeholder.svg?height=48&width=48',
    location: 'New York, NY',
    type: 'Full-time',
    salary: '$100,000 - $140,000',
    description: 'Join our dynamic team to build scalable web applications using modern technologies.',
    requiredSkills: [
      { name: 'React', minLevel: 'Advanced', weight: 0.25 },
      { name: 'Node.js', minLevel: 'Intermediate', weight: 0.25 },
      { name: 'MongoDB', minLevel: 'Intermediate', weight: 0.25 },
      { name: 'TypeScript', minLevel: 'Intermediate', weight: 0.25 },
    ],
    postedDate: '2025-03-08',
    deadline: '2025-04-08',
    status: 'Active',
    applicantsCount: 67,
  },
]

export const mockJobs = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    company: "TechCorp Solutions",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$120k - $160k",
    description: "We are looking for a skilled Frontend Developer to join our team and build amazing user experiences using React, TypeScript, and modern web technologies.",
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    posted: "2 days ago",
    matchScore: 92,
  },
  {
    id: "2",
    title: "Full Stack Engineer",
    company: "InnovateTech",
    location: "New York, NY",
    type: "Full-time",
    salary: "$130k - $170k",
    description: "Join our dynamic team to build scalable web applications using modern technologies and cloud infrastructure.",
    skills: ["React", "Node.js", "PostgreSQL", "AWS"],
    posted: "3 days ago",
    matchScore: 85,
  },
  {
    id: "3",
    title: "React Developer Intern",
    company: "StartupHub",
    location: "Austin, TX",
    type: "Internship",
    salary: "$30/hour",
    description: "Great opportunity for students to learn and grow in a fast-paced startup environment building real products.",
    skills: ["React", "JavaScript", "CSS", "Git"],
    posted: "1 day ago",
    matchScore: 78,
  },
]

export const mockSkills = [
  { id: "1", name: "React", level: 85, category: "Frontend" },
  { id: "2", name: "TypeScript", level: 78, category: "Languages" },
  { id: "3", name: "Node.js", level: 72, category: "Backend" },
  { id: "4", name: "Python", level: 65, category: "Languages" },
  { id: "5", name: "SQL", level: 70, category: "Database" },
  { id: "6", name: "AWS", level: 55, category: "Cloud" },
]

export const mockAssessments = [
  {
    id: "1",
    title: "React Fundamentals",
    category: "Frontend Development",
    difficulty: "Beginner",
    duration: "30 min",
    questions: 25,
    status: "completed",
    score: 92,
    completedDate: "Mar 10, 2026",
    description: "Test your knowledge of React basics including components, props, and state.",
  },
  {
    id: "2",
    title: "Advanced TypeScript",
    category: "Languages",
    difficulty: "Advanced",
    duration: "45 min",
    questions: 30,
    status: "completed",
    score: 85,
    completedDate: "Mar 5, 2026",
    description: "Master TypeScript generics, utility types, and advanced patterns.",
  },
]

export const mockApplications = [
  {
    id: "1",
    jobTitle: "Senior Frontend Developer",
    company: "TechCorp Solutions",
    appliedDate: "Mar 15, 2026",
    status: "Interview Scheduled",
    matchScore: 92,
  },
  {
    id: "2",
    jobTitle: "Full Stack Engineer",
    company: "InnovateTech",
    appliedDate: "Mar 12, 2026",
    status: "Under Review",
    matchScore: 85,
  },
]

export const adminStats = {
  totalStudents: 2547,
  totalEmployers: 89,
  totalJobs: 234,
  totalApplications: 4521,
  placementRate: 78,
  pendingEmployerApprovals: 5,
  pendingJobApprovals: 8,
}
