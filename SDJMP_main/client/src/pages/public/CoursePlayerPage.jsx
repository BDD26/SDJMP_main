import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { coursesAPI } from '@/services/api'
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

export default function CoursePlayerPage() {
  const { skill } = useParams()
  const navigate = useNavigate()
  const [courseData, setCourseData] = useState(null)
  const [progress, setProgress] = useState(null)
  const [activeVideo, setActiveVideo] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load course data and progress
  useEffect(() => {
    async function loadCourse() {
      try {
        setLoading(true)
        setError(null)
        
        // Get course data
        const course = await coursesAPI.getBySlug(skill)
        setCourseData(course)
        
        // Get user progress if course exists
        if (course?.id) {
          try {
            const userProgress = await coursesAPI.getProgress(course.id)
            setProgress(userProgress)
            
            // Set active video to next uncompleted video or first video
            const nextVideo = userProgress.nextVideo
            if (nextVideo) {
              setActiveVideo(nextVideo)
            } else if (course.modules?.[0]?.videos?.[0]) {
              setActiveVideo(course.modules[0].videos[0])
            }
          } catch (progressError) {
            console.warn('Could not load progress:', progressError)
            // Set first video as active if no progress
            if (course.modules?.[0]?.videos?.[0]) {
              setActiveVideo(course.modules[0].videos[0])
            }
          }
        }
      } catch (err) {
        console.error('Failed to load course:', err)
        setError(err.message || 'Failed to load course')
      } finally {
        setLoading(false)
      }
    }
    
    if (skill) {
      loadCourse()
    }
  }, [skill])

  // Handle video selection
  const handleVideoSelect = async (video) => {
    setActiveVideo(video)
    setIsSidebarOpen(false) // Close sidebar on mobile after selection
    setIsPlaying(true)
    
    // Update last accessed video
    if (courseData?.id && video?.youtubeId) {
      try {
        await coursesAPI.updateLastAccessed(courseData.id, video.youtubeId)
      } catch (err) {
        console.warn('Could not update last accessed:', err)
      }
    }
  }

  // Handle video completion (90% watched)
  const handleVideoProgress = async (videoId, currentTime, duration) => {
    if (!courseData?.id) return
    
    const watchedPercentage = (currentTime / duration) * 100
    
    if (watchedPercentage > 90) {
      try {
        await coursesAPI.updateProgress(
          courseData.id,
          videoId,
          Math.round(currentTime / 60)
        )
        
        // Refresh progress
        const updatedProgress = await coursesAPI.getProgress(courseData.id)
        setProgress(updatedProgress)
      } catch (err) {
        console.warn('Could not update progress:', err)
      }
    }
  }

  // Check if video is completed
  const isVideoCompleted = (videoId) => {
    return progress?.completedVideos?.some(cv => cv.youtubeId === videoId) || false
  }

  // Calculate completion percentage
  const completionPercentage = progress?.completionPercentage || 0
  const completedCount = progress?.completedCount || 0
  const totalVideos = progress?.totalVideos || courseData?.totalVideos || 0

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading course...</p>
        </div>
      </div>
    )
  }

  if (error || !courseData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Course Not Found</h2>
          <p className="text-slate-400 mb-6">{error || 'The requested course could not be found.'}</p>
          <Button onClick={() => navigate('/skills')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Skills
          </Button>
        </div>
      </div>
    )
  }

  const [isPlaying, setIsPlaying] = useState(false)

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
                src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0`}
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
                  <span>{courseData.totalVideos} videos</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Users className="h-4 w-4" />
                  <span>{courseData.studentsEnrolled?.toLocaleString() || 0} students</span>
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
                <span className="text-slate-400 text-sm">Instructor: {courseData.instructor?.name || 'Unknown'}</span>
                <span className="text-slate-400 text-sm">Updated: {new Date(courseData.lastUpdated).toLocaleDateString()}</span>
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
                  {completedCount} of {totalVideos}
                </span>
              </div>
              <Progress value={completionPercentage} className="h-2 mb-2" />
              <p className="text-xs text-slate-400">{Math.round(completionPercentage)}% complete</p>
            </div>

            {/* Scrollable Syllabus */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-6">
                {courseData.modules.map((module) => (
                  <div key={module.moduleTitle}>
                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-blue-400" />
                      {module.moduleTitle}
                    </h4>
                    <p className="text-sm text-slate-400 mb-3">{module.description}</p>
                    
                    <div className="space-y-2">
                      {module.videos.map((video) => (
                        <button
                          key={video.youtubeId}
                          onClick={() => handleVideoSelect(video)}
                          className={`
                            w-full text-left p-3 rounded-lg transition-all duration-200
                            ${activeVideo?.youtubeId === video.youtubeId 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-slate-700/50 hover:bg-slate-700 text-slate-300'
                            }
                          `}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              {isVideoCompleted(video.youtubeId) ? (
                                <CheckCircle2 className="h-4 w-4 text-green-400" />
                              ) : activeVideo?.youtubeId === video.youtubeId ? (
                                <PlayCircle className="h-4 w-4 text-white" />
                              ) : (
                                <Play className="h-4 w-4 text-slate-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm line-clamp-2">{video.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs opacity-75">
                                  <Clock className="h-3 w-3 inline mr-1" />
                                  {video.duration}
                                </span>
                                {isVideoCompleted(video.youtubeId) && (
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
