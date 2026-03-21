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
  Award,
  BookOpen,
  Trophy,
  ArrowRight,
  Download,
  ShieldCheck,
  Star
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

const INITIAL_ASSESSMENTS = [
  {
    id: 1,
    name: 'React Advanced Concepts',
    status: 'completed',
    score: 92,
    date: '2 weeks ago',
    category: 'Development',
    duration: '30 mins',
    questions: 20
  },
  {
    id: 2,
    name: 'TypeScript Fundamentals',
    status: 'completed',
    score: 88,
    date: '1 month ago',
    category: 'Development',
    duration: '20 mins',
    questions: 15
  },
  {
    id: 3,
    name: 'System Design Patterns',
    status: 'in_progress',
    score: null,
    progress: 60,
    category: 'Architecture',
    duration: '45 mins',
    questions: 25
  },
  {
    id: 4,
    name: 'Python Data Structures',
    status: 'pending',
    score: null,
    category: 'Programming',
    duration: '30 mins',
    questions: 20
  },
]

const MOCK_QUESTIONS = [
  {
    id: 1,
    text: "What is the primary purpose of the 'useEffect' hook in React?",
    options: [
      "To handle side effects in functional components",
      "To manage local state in class components",
      "To optimize rendering performance automatically",
      "To define global styles for the application"
    ],
    correct: 0
  },
  {
    id: 2,
    text: "Which of the following is NOT a valid React Hook?",
    options: [
      "useState",
      "useContext",
      "useReducer",
      "useDataFetch"
    ],
    correct: 3
  },
  {
    id: 3,
    text: "How do you pass data from a parent component to a child component?",
    options: [
      "Using local storage",
      "Using context only",
      "Using props",
      "Using Redux dispatch"
    ],
    correct: 2
  }
]

export default function StudentAssessments() {
  const { user } = useAuth()
  const [assessments, setAssessments] = useState(INITIAL_ASSESSMENTS)
  const [isTakingTest, setIsTakingTest] = useState(false)
  const [activeTest, setActiveTest] = useState(null)
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes in seconds
  const [isFinished, setIsFinished] = useState(false)
  const [showCertificate, setShowCertificate] = useState(false)
  const [showReviewAnswers, setShowReviewAnswers] = useState(false)
  const [selectedAssessment, setSelectedAssessment] = useState(null)

  useEffect(() => {
    let timer
    if (isTakingTest && !isFinished && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && !isFinished) {
      handleFinish()
    }
    return () => clearInterval(timer)
  }, [isTakingTest, isFinished, timeLeft])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartTest = (assessment) => {
    setActiveTest(assessment)
    setIsTakingTest(true)
    setCurrentQuestionIdx(0)
    setAnswers({})
    setTimeLeft(600)
    setIsFinished(false)
  }

  const handleAnswerSelect = (optionIdx) => {
    setAnswers({ ...answers, [currentQuestionIdx]: optionIdx })
  }

  const handleNext = () => {
    if (currentQuestionIdx < MOCK_QUESTIONS.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1)
    } else {
      handleFinish()
    }
  }

  const handleBack = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1)
    }
  }

  const handleFinish = () => {
    setIsFinished(true)
    // Update assessment list with results
    setAssessments(prev => prev.map(a => 
      a.id === activeTest.id 
        ? { ...a, status: 'completed', score: 100, date: 'Just now' } 
        : a
    ))
    toast.success('Assessment completed!')
  }

  if (isTakingTest) {
    if (isFinished) {
      return (
        <div className="max-w-2xl mx-auto py-12 px-4 animate-in fade-in zoom-in duration-500">
          <Card className="border-none shadow-2xl glass overflow-hidden text-center p-12">
            <div className="h-24 w-24 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-8 animate-bounce">
              <Trophy className="h-12 w-12 text-emerald-500" />
            </div>
            <h2 className="text-4xl font-extrabold mb-4">Congratulations!</h2>
            <p className="text-muted-foreground text-lg mb-8">
              You've successfully completed the <b>{activeTest.name}</b> assessment.
            </p>
            
            <div className="bg-muted/30 rounded-3xl p-8 mb-10 border border-white/20">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Final Score</p>
                  <p className="text-5xl font-black text-primary">100%</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Status</p>
                  <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 text-lg py-1 px-4">PASSED</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button onClick={() => setIsTakingTest(false)} className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg shadow-primary/20">
                Back to Dashboard
              </Button>
              <Button 
                variant="ghost" 
                className="w-full font-bold"
                onClick={() => setShowReviewAnswers(true)}
              >
                Review My Answers
              </Button>
            </div>

            {/* Review Answers Modal */}
            <Dialog open={showReviewAnswers} onOpenChange={setShowReviewAnswers}>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Review Your Answers</DialogTitle>
                  <DialogDescription>Review the questions and your selected answers from the assessment.</DialogDescription>
                </DialogHeader>
                <div className="space-y-6 mt-4">
                  {MOCK_QUESTIONS.map((q, idx) => (
                    <div key={q.id} className="p-4 rounded-xl border bg-muted/30">
                      <p className="font-semibold mb-2">{idx + 1}. {q.text}</p>
                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-lg text-sm ${
                              answers[idx] === optIdx
                                ? optIdx === q.correct
                                  ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-destructive/10 border border-destructive/30 text-destructive'
                                : optIdx === q.correct
                                  ? 'bg-emerald-500/10 border border-emerald-500/30'
                                  : 'bg-muted/50'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}. {opt}
                            {answers[idx] === optIdx && <span className="ml-2 font-bold">(Your answer)</span>}
                            {optIdx === q.correct && answers[idx] !== optIdx && <span className="ml-2 font-bold text-emerald-600">(Correct)</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <Button onClick={() => setShowReviewAnswers(false)} className="w-full mt-4">
                  Close
                </Button>
              </DialogContent>
            </Dialog>
          </Card>
        </div>
      )
    }

    const currentQuestion = MOCK_QUESTIONS[currentQuestionIdx]
    const progress = ((currentQuestionIdx + 1) / MOCK_QUESTIONS.length) * 100

    return (
      <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading">{activeTest.name}</h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold uppercase tracking-tighter">
                <span>Question {currentQuestionIdx + 1} of {MOCK_QUESTIONS.length}</span>
              </div>
            </div>
          </div>
          
          <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border ${timeLeft < 60 ? 'bg-destructive/10 border-destructive text-destructive animate-pulse' : 'bg-muted/50 border-white/20'}`}>
            <Timer className="h-4 w-4" />
            <span className="font-mono font-bold text-lg">{formatTime(timeLeft)}</span>
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
              {currentQuestion.text}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="grid gap-4">
              {currentQuestion.options.map((option, idx) => (
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
              {currentQuestionIdx === MOCK_QUESTIONS.length - 1 ? 'Finish Assessment' : 'Next Question'}
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

  const handleViewCertificate = (assessment) => {
    setSelectedAssessment(assessment)
    setShowCertificate(true)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 transition-colors py-1 px-3 border-none">
            Learning & Mastery
          </Badge>
          <h1 className="text-5xl font-black tracking-tight font-heading">Skill <span className="text-primary">Assessments</span></h1>
          <p className="text-muted-foreground text-lg mt-3 max-w-xl">
            Validate your expertise through industry-standard tests and boost your profile visibility by <span className="text-foreground font-bold">2.5x</span>.
          </p>
        </div>
        <div className="flex gap-4">
          <Card className="p-4 bg-primary text-white shadow-xl shadow-primary/20 rounded-3xl border-none">
            <div className="text-center">
              <p className="text-4xl font-black">12</p>
              <p className="text-[10px] uppercase font-bold tracking-widest text-white/70">Badges Earned</p>
            </div>
          </Card>
          <Card className="p-4 glass rounded-3xl border-none shadow-xl">
            <div className="text-center">
              <p className="text-4xl font-black">88<span className="text-lg text-primary">%</span></p>
              <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Avg. Percentile</p>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-6">
        {assessments.map((assessment) => (
          <Card key={assessment.id} className="border-none shadow-xl glass hover:shadow-2xl transition-all duration-300 group overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Award className="h-32 w-32" />
            </div>
            
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-colors ${
                      assessment.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'
                    }`}>
                      <Trophy className="h-6 w-6" />
                    </div>
                    <div>
                      <Badge variant="outline" className="mb-1 text-[10px] uppercase tracking-widest">
                        {assessment.category}
                      </Badge>
                      <h3 className="text-2xl font-bold font-heading leading-none group-hover:text-primary transition-colors">
                        {assessment.name}
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6">
                    {assessment.status === 'completed' ? (
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span className="text-sm font-black text-emerald-600">
                             {assessment.score}% (Passed)
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {assessment.date}
                        </span>
                      </div>
                    ) : assessment.status === 'in_progress' ? (
                      <div className="flex-1 max-w-sm space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-amber-500" /> Resume where you left</span>
                          <span>{assessment.progress}%</span>
                        </div>
                        <Progress value={assessment.progress} className="h-2 rounded-full" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-6 text-sm text-muted-foreground font-medium">
                        <span className="flex items-center gap-2"><Timer className="h-4 w-4 text-primary" /> {assessment.duration}</span>
                        <span className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /> {assessment.questions} Questions</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {assessment.status === 'completed' ? (
                    <Button 
                      variant="outline" 
                      className="h-14 px-8 rounded-2xl border-2 hover:bg-muted font-bold group/btn"
                      onClick={() => handleViewCertificate(assessment)}
                    >
                      <Award className="h-5 w-5 mr-2 text-primary group-hover/btn:rotate-12 transition-transform" />
                      View Certificate
                    </Button>
                  ) : (
                    <Button 
                      size="lg" 
                      className={`h-14 px-10 rounded-2xl shadow-xl font-black text-lg transition-transform hover:scale-105 active:scale-95 ${
                        assessment.status === 'in_progress' 
                          ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' 
                          : 'bg-primary hover:bg-primary shadow-primary/20'
                      }`}
                      onClick={() => handleStartTest(assessment)}
                    >
                      {assessment.status === 'in_progress' ? 'Continue Test' : 'Start Now'}
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CertificateModal 
        isOpen={showCertificate} 
        onClose={() => setShowCertificate(false)} 
        assessment={selectedAssessment}
        userName={user?.name}
      />
    </div>
  )
}

function CertificateModal({ isOpen, onClose, assessment, userName }) {
  if (!assessment) return null

  const handleDownloadPDF = () => {
    window.print()
    toast.success('Use your browser\'s print dialog to save as PDF')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl border-none p-0 overflow-hidden bg-white dark:bg-slate-900 shadow-[0_0_50px_rgba(0,0,0,0.3)]">
        <DialogTitle className="sr-only">Certificate of Completion - {assessment.name}</DialogTitle>
        <DialogDescription className="sr-only">
          Certificate verifying successful completion of {assessment.name} with a score of {assessment.score}%
        </DialogDescription>
        <div className="p-1 bg-primary/10">
           <div className="border-[12px] border-double border-primary/20 p-8 md:p-16 relative overflow-hidden bg-white dark:bg-slate-950">
             {/* Decorative Background Elements */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
             <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
             
             <div className="relative z-10 text-center space-y-10">
               <div className="space-y-4">
                 <div className="flex justify-center mb-6">
                    <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center border-4 border-primary/20 relative">
                       <Award className="h-10 w-10 text-primary" />
                       <div className="absolute -bottom-2 -right-2 bg-primary text-white p-1 rounded-full shadow-lg">
                          <CheckCircle2 className="h-4 w-4" />
                       </div>
                    </div>
                 </div>
                 <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary/60">Certificate of Completion</h2>
                 <p className="text-xs font-bold text-muted-foreground">THIS IS TO CERTIFY THAT</p>
               </div>

               <div>
                 <h1 className="text-5xl md:text-6xl font-black tracking-tight font-heading text-slate-900 dark:text-white mb-2 print:text-5xl">
                   {userName}
                 </h1>
                 <div className="h-1 w-32 bg-primary/20 mx-auto" />
               </div>

               <div className="max-w-xl mx-auto space-y-4">
                 <p className="text-lg text-muted-foreground leading-relaxed">
                   has successfully completed the professional assessment in
                 </p>
                 <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 italic">
                   {assessment.name}
                 </h3>
                 <p className="text-muted-foreground">
                   demonstrating exceptional proficiency and command over the subject matter with a verified score of <b>{assessment.score}%</b>.
                 </p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-12">
                 <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-4">
                   <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Date Issued</p>
                   <p className="font-bold text-slate-700 dark:text-slate-300">{assessment.date === 'Just now' ? new Date().toLocaleDateString() : assessment.date}</p>
                 </div>
                 <div className="flex flex-col items-center justify-center">
                    <div className="h-24 w-24 border-4 border-primary/30 rounded-full flex items-center justify-center relative rotate-12 shadow-xl bg-white dark:bg-slate-900">
                       <ShieldCheck className="h-10 w-10 text-primary opacity-50" />
                       <div className="absolute inset-x-0 text-center text-[10px] font-black uppercase tracking-tighter text-primary/80">
                         VERIFIED PLATFORM
                       </div>
                    </div>
                 </div>
                 <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Certificate ID</p>
                    <p className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">CERT-2024-{assessment.id}-SKLLM</p>
                 </div>
               </div>
             </div>
           </div>
        </div>
        <div className="p-4 bg-muted/30 border-t flex justify-between items-center bg-white dark:bg-slate-900">
           <p className="text-xs text-muted-foreground">This is a digitally verified certificate and does not require a physical signature.</p>
           <Button 
             className="font-bold gap-2 rounded-xl h-11 px-6 shadow-lg shadow-primary/20 print:hidden"
             onClick={handleDownloadPDF}
           >
              <Download className="h-4 w-4" />
              Download PDF
           </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
