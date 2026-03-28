import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Play,
  Clock,
  CheckCircle2,
  ChevronRight,
  Menu,
  X,
  BookOpen,
  Target,
  Award,
  Users,
  Calendar,
  BarChart3,
  ArrowLeft,
  Volume2,
  Settings,
  Maximize2,
  SkipBack,
  SkipForward,
  Pause,
  PlayCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Sample course data - this will come from MongoDB Atlas later
const courseData = {
  skill: 'React',
  title: 'Complete React Development Course',
  description: 'Master React from basics to advanced concepts',
  totalLessons: 12,
  completedLessons: 3,
  duration: '8h 45m',
  instructor: 'Sarah Johnson',
  level: 'Intermediate',
  students: 15420,
  rating: 4.8,
  lastUpdated: '2024-03-15',
  modules: [
    {
      id: 'intro',
      title: 'Introduction to React',
      description: 'Get started with React fundamentals',
      lessons: [
        {
          id: 'react-101',
          title: 'What is React?',
          description: 'Understanding React basics and core concepts',
          duration: '12:45',
          videoId: 'TLVir_-bX8k',
          completed: true,
        },
        {
          id: 'react-102',
          title: 'Setting Up Development Environment',
          description: 'Install Node.js, npm, and create your first React app',
          duration: '15:30',
          videoId: 'Ke90TjeGeVS',
          completed: true,
        },
        {
          id: 'react-103',
          title: 'Components and Props',
          description: 'Learn about React components and how to pass data',
          duration: '18:20',
          videoId: 'IrHmgOSlDv0',
          completed: true,
        },
      ],
    },
    {
      id: 'core',
      title: 'Core React Concepts',
      description: 'Deep dive into React fundamentals',
      lessons: [
        {
          id: 'react-201',
          title: 'State and Lifecycle',
          description: 'Understanding component state and lifecycle methods',
          duration: '22:15',
          videoId: 'TNhaISOUy6Q',
          completed: false,
        },
        {
          id: 'react-202',
          title: 'Handling Events',
          description: 'Learn how to handle user events in React',
          duration: '16:40',
          videoId: 'B2JAj4F9k8Y',
          completed: false,
        },
        {
          id: 'react-203',
          title: 'Conditional Rendering',
          description: 'Render components based on conditions',
          duration: '14:25',
          videoId: 'yIeKlL-3V4g',
          completed: false,
        },
        {
          id: 'react-204',
          title: 'Lists and Keys',
          description: 'Working with arrays and rendering lists',
          duration: '19:10',
          videoId: 'Qs1xzz2_c4M',
          completed: false,
        },
      ],
    },
    {
      id: 'advanced',
      title: 'Advanced React',
      description: 'Advanced patterns and best practices',
      lessons: [
        {
          id: 'react-301',
          title: 'Hooks Deep Dive',
          description: 'Master useState, useEffect, and custom hooks',
          duration: '28:35',
          videoId: 'TNhaISOUy6Q',
          completed: false,
        },
        {
          id: 'react-302',
          title: 'Context API',
          description: 'Global state management with Context',
          duration: '24:20',
          videoId: '5LrDiIWnIgs',
          completed: false,
        },
        {
          id: 'react-303',
          title: 'Performance Optimization',
          description: 'Optimize React applications for better performance',
          duration: '32:15',
          videoId: 'Cv_aHu9Iz-I',
          completed: false,
        },
        {
          id: 'react-304',
          title: 'Testing React Apps',
          description: 'Unit testing and integration testing',
          duration: '26:40',
          videoId: '1YrYDf4g2wU',
          completed: false,
        },
        {
          id: 'react-305',
          title: 'React Router',
          description: 'Client-side routing with React Router',
          duration: '21:55',
          videoId: 'Ul3y1Lkx8Wk',
          completed: false,
        },
      ],
    },
  ],
}

export default function CoursePlayerPage() {
  const { skill } = useParams()
  const navigate = useNavigate()
  
  const [activeVideo, setActiveVideo] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    // Set the first video as active on component mount
    const firstLesson = courseData.modules[0]?.lessons[0]
    if (firstLesson) {
      setActiveVideo(firstLesson)
    }
  }, [])

  const handleLessonClick = (lesson) => {
    setActiveVideo(lesson)
    setIsSidebarOpen(false) // Close sidebar on mobile after selection
    setIsPlaying(true)
  }

  const completedLessons = courseData.modules.reduce(
    (total, module) => total + module.lessons.filter(lesson => lesson.completed).length,
    0
  )

  const progressPercentage = (completedLessons / courseData.totalLessons) * 100

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="text-white hover:bg-slate-700"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">{courseData.title}</h1>
                <p className="text-slate-400 text-sm">{courseData.description}</p>
              </div>
            </div>
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden text-white hover:bg-slate-700"
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row">
        {/* Main Content - 75% width */}
        <main className="flex-1 lg:w-3/4">
          {/* Video Container */}
          <div className="aspect-video bg-black relative">
            {activeVideo && (
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.videoId}?autoplay=1&rel=0`}
                title={activeVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            )}
          </div>

          {/* Content Section */}
          <div className="bg-slate-800 p-6 lg:p-8">
            {/* Course Info */}
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <Badge variant="secondary" className="bg-blue-600 text-white">
                  {courseData.level}
                </Badge>
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="h-4 w-4" />
                  <span>{courseData.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <BookOpen className="h-4 w-4" />
                  <span>{courseData.totalLessons} lessons</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Users className="h-4 w-4" />
                  <span>{courseData.students.toLocaleString()} students</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">
                      {i < Math.floor(courseData.rating) ? '★' : '☆'}
                    </span>
                  ))}
                  <span className="text-slate-400 ml-2">{courseData.rating}</span>
                </div>
                <span className="text-slate-400 text-sm">Instructor: {courseData.instructor}</span>
                <span className="text-slate-400 text-sm">Updated: {courseData.lastUpdated}</span>
              </div>
            </div>

            {/* Current Lesson Info */}
            {activeVideo && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-4 text-white">{activeVideo.title}</h2>
                  <p className="text-slate-300 text-lg leading-relaxed mb-4">
                    {activeVideo.description}
                  </p>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="border-slate-600 text-slate-300">
                      <Clock className="h-3 w-3 mr-1" />
                      {activeVideo.duration}
                    </Badge>
                    {activeVideo.completed && (
                      <Badge className="bg-green-600 text-white">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>

                {/* What is React Section */}
                <section className="prose prose-invert max-w-none">
                  <h3 className="text-2xl font-bold text-white mb-4">What is {courseData.skill}?</h3>
                  <p className="text-slate-300 leading-relaxed mb-6">
                    {courseData.skill} is a powerful JavaScript library for building user interfaces, 
                    particularly single-page applications where you need a fast, interactive user experience. 
                    Developed by Facebook, React has become one of the most popular front-end frameworks 
                    in the world, used by companies like Netflix, Airbnb, and Instagram.
                  </p>
                </section>

                {/* Key Steps Section */}
                <section className="prose prose-invert max-w-none">
                  <h3 className="text-2xl font-bold text-white mb-4">Key Steps to Master {courseData.skill}</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white font-bold text-sm">1</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-2">Understand the Fundamentals</h4>
                        <p className="text-slate-300">
                          Start with the core concepts including components, props, state, and the virtual DOM. 
                          These building blocks form the foundation of all React applications.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white font-bold text-sm">2</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-2">Master Modern React Features</h4>
                        <p className="text-slate-300">
                          Learn Hooks, Context API, and other modern React features that have revolutionized 
                          how we build React applications.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white font-bold text-sm">3</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-2">Build Real Projects</h4>
                        <p className="text-slate-300">
                          Apply your knowledge by building real-world applications. Practice makes perfect, 
                          and building projects helps solidify your understanding.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Why It Matters Section */}
                <section className="prose prose-invert max-w-none">
                  <h3 className="text-2xl font-bold text-white mb-4">Why {courseData.skill} Matters</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="bg-slate-700/50 border-slate-600">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                          <Target className="h-5 w-5 text-blue-400" />
                          Career Opportunities
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-300">
                          React developers are in high demand with competitive salaries. 
                          Master React opens doors to frontend, full-stack, and mobile development roles.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-slate-700/50 border-slate-600">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                          <BarChart3 className="h-5 w-5 text-green-400" />
                          Industry Standard
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-300">
                          React is used by thousands of companies worldwide. It's a proven technology 
                          with excellent community support and continuous innovation.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-slate-700/50 border-slate-600">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                          <Award className="h-5 w-5 text-yellow-400" />
                          Developer Experience
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-300">
                          React provides excellent developer tools, hot reloading, and a rich ecosystem 
                          that makes building complex applications enjoyable and efficient.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-slate-700/50 border-slate-600">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                          <Users className="h-5 w-5 text-purple-400" />
                          Community & Ecosystem
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-300">
                          Join a massive community of developers. Access thousands of libraries, 
                          tutorials, and solutions to common problems.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </section>
              </div>
            )}
          </div>
        </main>

        {/* Sidebar - 25% width */}
        <aside className={`
          lg:w-1/4 lg:sticky lg:top-0 lg:h-screen bg-slate-800 border-l border-slate-700
          fixed inset-y-0 right-0 z-50 transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}>
          <div className="h-full flex flex-col">
            {/* Progress Header */}
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white">Course Progress</h3>
                <span className="text-sm text-slate-400">
                  {completedLessons} of {courseData.totalLessons}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2 mb-2" />
              <p className="text-xs text-slate-400">{Math.round(progressPercentage)}% complete</p>
            </div>

            {/* Scrollable Syllabus */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-6">
                {courseData.modules.map((module) => (
                  <div key={module.id}>
                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-blue-400" />
                      {module.title}
                    </h4>
                    <p className="text-sm text-slate-400 mb-3">{module.description}</p>
                    
                    <div className="space-y-2">
                      {module.lessons.map((lesson) => (
                        <button
                          key={lesson.id}
                          onClick={() => handleLessonClick(lesson)}
                          className={`
                            w-full text-left p-3 rounded-lg transition-all duration-200
                            ${activeVideo?.id === lesson.id 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-slate-700/50 hover:bg-slate-700 text-slate-300'
                            }
                          `}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              {lesson.completed ? (
                                <CheckCircle2 className="h-4 w-4 text-green-400" />
                              ) : activeVideo?.id === lesson.id ? (
                                <PlayCircle className="h-4 w-4 text-white" />
                              ) : (
                                <Play className="h-4 w-4 text-slate-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm line-clamp-2">{lesson.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs opacity-75">
                                  <Clock className="h-3 w-3 inline mr-1" />
                                  {lesson.duration}
                                </span>
                                {lesson.completed && (
                                  <span className="text-xs bg-green-600 px-2 py-1 rounded">Done</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
