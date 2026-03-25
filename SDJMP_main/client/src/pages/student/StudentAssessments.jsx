import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle2, 
  Clock, 
  PlayCircle, 
  ChevronRight, 
  ChevronLeft, 
  Timer, 
  AlertTriangle,
  AlertCircle,
  Award,
  BookOpen,
  Trophy,
  ArrowRight,
  Download,
  ShieldCheck,
  Star,
  Loader2
} from 'lucide-react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import api from '@/services/api'

export default function StudentAssessments() {
  const { user } = useAuth()
  const [availableAssessments, setAvailableAssessments] = useState([])
  const [myResults, setMyResults] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTakingTest, setIsTakingTest] = useState(false)
  const [activeTest, setActiveTest] = useState(null)
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(null)
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAssessments()
  }, [])

  const fetchAssessments = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [allAssessments, results] = await Promise.all([
        api.assessments.getAll(),
        api.assessments.getMyResults()
      ])
      
      setAvailableAssessments(allAssessments || [])
      setMyResults(results || [])
    } catch (error) {
      setError('Failed to load assessments')
      toast.error('Failed to load assessments')
      console.error('Assessment error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartAssessment = async (assessmentId) => {
    try {
      setIsLoading(true)
      const startedAssessment = await api.assessments.startAssessment(assessmentId)
      
      // Get assessment questions
      const questionsData = await api.assessments.getQuestions(assessmentId)
      
      setActiveTest({
        ...questionsData,
        studentAssessmentId: startedAssessment._id
      })
      
      setTimeLeft(questionsData.durationMinutes * 60)
      setIsTakingTest(true)
      setCurrentQuestionIdx(0)
      setAnswers({})
      
      toast.success('Assessment started!')
    } catch (error) {
      toast.error(error.message || 'Failed to start assessment')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswerSelect = (optionIdx) => {
    setAnswers({ ...answers, [currentQuestionIdx]: optionIdx })
  }

  const handleNext = async () => {
    if (!activeTest?.questions) return
    
    const currentQ = activeTest.questions[currentQuestionIdx]
    if (currentQ && answers[currentQuestionIdx] !== undefined) {
      try {
        await api.assessments.submitAnswer(
          activeTest.assessmentId, 
          currentQ._id || currentQ.id, 
          answers[currentQuestionIdx]
        )
      } catch (error) {
        toast.error('Failed to save answer')
      }
    }

    if (currentQuestionIdx < activeTest.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1)
    } else {
      await completeAssessment()
    }
  }

  const handleBack = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1)
    }
  }

  const completeAssessment = async () => {
    try {
      const result = await api.assessments.completeAssessment(activeTest.assessmentId)
      
      setActiveTest(prev => ({ ...prev, ...result }))
      setShowResults(true)
      setIsTakingTest(false)
      
      toast.success('Assessment completed!')
      
      // Refresh results
      fetchAssessments()
    } catch (error) {
      toast.error('Failed to complete assessment')
    }
  }

  if (isTakingTest) {
    const currentQuestion = activeTest?.questions?.[currentQuestionIdx]
    const progress = activeTest?.questions ? ((currentQuestionIdx + 1) / activeTest.questions.length) * 100 : 0

    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold font-heading">{activeTest.title}</h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold uppercase tracking-tighter">
              <span>Question {currentQuestionIdx + 1} of {activeTest.questions?.length || 0}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-amber-500" />
              <span className="font-mono text-sm">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            </div>
            <Progress value={progress} className="w-32" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold text-muted-foreground px-1 uppercase tracking-widest">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3 rounded-full bg-muted shadow-inner" />
        </div>

        <Card className="border-none shadow-xl glass overflow-hidden">
          <CardHeader className="p-8">
            <CardTitle className="text-2xl font-bold leading-tight">
              {currentQuestion?.question || currentQuestion?.text || 'Loading question...'}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="grid gap-4">
              {(currentQuestion?.options || []).map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(idx)}
                  className={`w-full p-6 rounded-2xl text-left border-2 transition-all flex items-center justify-between group ${
                    answers[currentQuestionIdx] === idx 
                      ? 'border-primary bg-primary/5 shadow-md scale-[1.01]' 
                      : 'border-muted hover:border-primary/30 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-bold text-sm ${
                      answers[currentQuestionIdx] === idx ? 'bg-primary text-white' : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="font-medium text-lg">{option}</span>
                  </div>
                  {answers[currentQuestionIdx] === idx && (
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white shadow-lg animate-in zoom-in duration-300">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
          <CardFooter className="p-8 border-t bg-muted/5 flex justify-between items-center">
            <Button 
              variant="ghost" 
              onClick={handleBack} 
              disabled={currentQuestionIdx === 0}
              className="px-6 h-12 rounded-xl"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous Question
            </Button>
            
            <Button 
              onClick={handleNext} 
              disabled={answers[currentQuestionIdx] === undefined}
              className="px-8 h-12 rounded-xl shadow-lg shadow-primary/20 font-bold"
            >
              {currentQuestionIdx === (activeTest.questions?.length || 1) - 1 ? 'Finish Assessment' : 'Next Question'}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>

        <div className="flex items-start gap-4 p-6 bg-amber-500/5 border border-amber-500/20 rounded-3xl">
          <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0" />
          <p className="text-xs text-amber-800 leading-relaxed font-medium">
            Once you click <b>Finish Assessment</b>, your answers will be locked and submitted for evaluation. Ensure you have reviewed all questions if time permits.
          </p>
        </div>
      </div>
    )
  }

  const getAssessmentStatus = (assessmentId) => {
    const result = myResults.find(r => r.assessmentId._id === assessmentId)
    if (!result) return 'available'
    return result.status
  }

  const getAssessmentScore = (assessmentId) => {
    const result = myResults.find(r => r.assessmentId._id === assessmentId)
    return result?.score || null
  }

  const getAssessmentProgress = (assessmentId) => {
    const result = myResults.find(r => r.assessmentId._id === assessmentId)
    return result?.progress || 0
  }

  // Calculate real stats from results
  const completedAssessments = myResults.filter(r => r.status === 'completed')
  const badgesEarned = completedAssessments.length
  const avgScore = completedAssessments.length > 0 
    ? Math.round(completedAssessments.reduce((sum, r) => sum + (r.score || 0), 0) / completedAssessments.length)
    : 0

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 transition-colors py-1 px-3 border-none">
            Learning & Mastery
          </Badge>
          <h1 className="text-5xl font-black tracking-tight font-heading">Skill <span className="text-primary">Assessments</span></h1>
          <p className="text-muted-foreground text-lg mt-3 max-w-xl">
            Validate your expertise through industry-standard tests and boost your profile visibility.
          </p>
        </div>
        <div className="flex gap-4">
          <Card className="p-4 bg-primary text-white shadow-xl shadow-primary/20 rounded-3xl border-none">
            <div className="text-center">
              <p className="text-4xl font-black">{badgesEarned}</p>
              <p className="text-[10px] uppercase font-bold tracking-widest text-white/70">Badges Earned</p>
            </div>
          </Card>
          <Card className="p-4 glass rounded-3xl border-none shadow-xl">
            <div className="text-center">
              <p className="text-4xl font-black">{avgScore}<span className="text-lg text-primary">%</span></p>
              <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Avg. Score</p>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-6">
        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground animate-pulse">
            <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin" />
            <div className="text-lg font-medium">Loading assessments...</div>
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <div className="text-lg font-medium mb-2">{error}</div>
            <Button onClick={fetchAssessments} variant="outline">Try Again</Button>
          </div>
        ) : availableAssessments.length === 0 ? (
          <div className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <div className="text-lg font-medium mb-2">No assessments available</div>
            <p className="text-muted-foreground">Check back later for new skill assessments</p>
          </div>
        ) : availableAssessments.map((assessment) => {
          const status = getAssessmentStatus(assessment._id)
          const score = getAssessmentScore(assessment._id)
          const progress = getAssessmentProgress(assessment._id)
          
          return (
          <Card key={assessment._id} className="border-none shadow-xl glass hover:shadow-2xl transition-all duration-300 group overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Award className="h-32 w-32" />
            </div>
            
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-colors ${
                      status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'
                    }`}>
                      <Trophy className="h-6 w-6" />
                    </div>
                    <div>
                      <Badge variant="outline" className="mb-1 text-[10px] uppercase tracking-widest">
                        {assessment.category || 'General'}
                      </Badge>
                      <h3 className="text-2xl font-bold font-heading leading-none group-hover:text-primary transition-colors">
                        {assessment.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6">
                    {status === 'completed' ? (
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span className="text-sm font-black text-emerald-600">
                             {score}% (Passed)
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Completed
                        </span>
                      </div>
                    ) : status === 'in_progress' ? (
                      <div className="flex-1 max-w-sm space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-amber-500" /> Resume where you left</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2 rounded-full" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-6 text-sm text-muted-foreground font-medium">
                        <span className="flex items-center gap-2"><Timer className="h-4 w-4 text-primary" /> {assessment.durationMinutes || 30} mins</span>
                        <span className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /> {assessment.questions?.length || 20} Questions</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {status === 'completed' ? (
                    <Button 
                      variant="outline" 
                      className="h-14 px-8 rounded-2xl border-2 hover:bg-muted font-bold group/btn"
                    >
                      <Award className="h-5 w-5 mr-2 text-primary group-hover/btn:rotate-12 transition-transform" />
                      View Certificate
                    </Button>
                  ) : (
                    <Button 
                      size="lg" 
                      className={`h-14 px-10 rounded-2xl shadow-xl font-black text-lg transition-transform hover:scale-105 active:scale-95 ${
                        status === 'in_progress' 
                          ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' 
                          : 'bg-primary hover:bg-primary shadow-primary/20'
                      }`}
                      onClick={() => handleStartAssessment(assessment._id)}
                      disabled={isLoading}
                    >
                      {status === 'in_progress' ? 'Continue Test' : 'Start Now'}
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          )
        })}
      </div>

    </div>
  )
}
