import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  Calendar, 
  ChevronLeft, 
  Share2, 
  Bookmark,
  CheckCircle2,
  Info,
  TrendingUp,
  AlertCircle,
  Building2,
  Users,
  Target,
  FileText,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  X,
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'

// Mock job data - to be replaced by API
const getMockJob = (id) => ({
  id,
  title: 'Senior Frontend Developer',
  company: 'TechCorp Solutions',
  logo: '',
  location: 'San Francisco, CA (Remote)',
  type: 'Full-time',
  salary: '$120,000 - $160,000',
  deadline: '2026-04-15',
  postedAt: '2 days ago',
  applicants: 45,
  description: `
    We are looking for a Senior Frontend Developer to join our core product team. 
    You will be responsible for building high-performance, responsive, and accessible user interfaces using React and the latest web technologies.
    
    ### Key Responsibilities:
    - Lead the development of new features in our flagship application.
    - Architect scalable and maintainable frontend solutions.
    - Collaborate with UX designers to translate wireframes into pixel-perfect components.
    - Mentor junior developers and conduct thorough code reviews.
    - Optimize application performance and ensure cross-browser compatibility.
  `,
  requirements: [
    { skill: 'React', weight: 40, minLevel: 4, scoreContribution: 35 },
    { skill: 'TypeScript', weight: 30, minLevel: 3, scoreContribution: 25 },
    { skill: 'Node.js', weight: 20, minLevel: 2, scoreContribution: 15 },
    { skill: 'Tailwind CSS', weight: 10, minLevel: 3, scoreContribution: 10 },
  ],
  matchScore: 85,
  matchBreakdown: [
    { label: 'Technical Skills', score: 90, status: 'Strong Match' },
    { label: 'Education', score: 100, status: 'Perfect Fit' },
    { label: 'Experience', score: 70, status: 'Adequate' },
  ]
})

export default function JobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isBookmarked, setIsBookmarked] = useState(false)
  
  // Apply Flow State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [applyStep, setApplyStep] = useState(1) // 1: Resume, 2: Match Summary, 3: Success
  const [selectedResume, setSelectedResume] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const mockResumes = [
    { id: 1, name: 'Frontend_Developer_2024.pdf', date: 'Mar 10, 2024' },
    { id: 2, name: 'Fullstack_Resume.pdf', date: 'Feb 15, 2024' },
  ]

  useEffect(() => {
    // Simulate API fetch
    const fetchJob = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 800))
      setJob(getMockJob(id))
      setLoading(false)
    }
    fetchJob()
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!job) return <div>Job not found</div>

  const handleApply = () => {
    if (!isAuthenticated) {
      toast.info('Please log in as a student to apply')
      navigate('/login')
      return
    }

    if (user?.role !== 'student') {
      toast.error('Only students can apply for jobs')
      return
    }

    setIsApplyModalOpen(true)
    setApplyStep(1)
  }

  const submitApplication = async () => {
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsSubmitting(false)
    setApplyStep(3)
    toast.success('Application submitted successfully!')
  }

  const descriptionParagraphs = job.description
    .split('\n')
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  return (
    <div className="min-h-screen bg-muted/20 pb-12">
      {/* Top Navigation */}
      <div className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to Jobs
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsBookmarked(!isBookmarked)}>
              <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-primary text-primary' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Job Info */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="overflow-hidden border-none shadow-xl glass">
                <CardHeader className="pb-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center p-4">
                      <Building2 className="h-12 w-12 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10">
                          {job.type}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Posted {job.postedAt}
                        </span>
                      </div>
                      <CardTitle className="text-3xl font-bold tracking-tight">{job.title}</CardTitle>
                      <CardDescription className="text-lg font-medium text-foreground flex items-center gap-1">
                        {job.company}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 border-t pt-6 bg-muted/5">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 rounded-xl bg-background border shadow-sm">
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Location</p>
                      <p className="text-sm font-medium flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-primary" />
                        {job.location}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-background border shadow-sm">
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Salary Range</p>
                      <p className="text-sm font-medium flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-primary" />
                        {job.salary}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-background border shadow-sm">
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Deadline</p>
                      <p className="text-sm font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-primary" />
                        {job.deadline}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-background border shadow-sm">
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Applicants</p>
                      <p className="text-sm font-medium flex items-center gap-1">
                        <Users className="h-3 w-3 text-primary" />
                        {job.applicants} Applied
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-none shadow-lg glass overflow-hidden">
                <Tabs defaultValue="details" className="w-full">
                  <div className="px-6 pt-4 border-b">
                    <TabsList className="bg-transparent gap-6 h-12 w-full justify-start border-none">
                      <TabsTrigger value="details" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-12">
                        Job Details
                      </TabsTrigger>
                      <TabsTrigger value="company" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-12">
                        About Company
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  <CardContent className="p-6">
                    <TabsContent value="details" className="mt-0 space-y-4 prose prose-sm max-w-none dark:prose-invert">
                      {descriptionParagraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </TabsContent>
                    <TabsContent value="company" className="mt-0">
                      <p className="text-muted-foreground">Company information and cultural overview will be displayed here.</p>
                    </TabsContent>
                  </CardContent>
                </Tabs>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar: Match Score & Application */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-none shadow-2xl glass overflow-hidden sticky top-24">
                <div className="h-2 bg-primary" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Match Score Analysis
                  </CardTitle>
                  <CardDescription>How well do you fit this role?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center justify-center py-4 bg-primary/5 rounded-2xl border border-primary/10">
                    <div className="relative h-32 w-32 flex items-center justify-center">
                      <svg className="h-full w-full -rotate-90 transform">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          className="text-muted/30"
                        />
                        <motion.circle
                          initial={{ strokeDasharray: "0 351.8" }}
                          animate={{ strokeDasharray: `${(job.matchScore / 100) * 351.8} 351.8` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          className="text-primary"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-3xl font-bold">{job.matchScore}%</span>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Match</span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold border border-emerald-500/20">
                      <CheckCircle2 className="h-3 w-3" />
                      Highly Recommended
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <h4 className="font-semibold">Match Breakdown</h4>
                      <Button variant="link" size="sm" className="h-auto p-0 text-xs gap-1">
                        <Info className="h-3 w-3" />
                        How it's calculated
                      </Button>
                    </div>
                    
                    {job.matchBreakdown.map((item, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{item.label || item.skill}</span>
                          <span className="font-medium">{item.status}</span>
                        </div>
                        <Progress value={item.score} className="h-1.5" />
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t space-y-4">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Required Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {job.requirements.map((req, idx) => (
                        <Badge key={idx} variant="outline" className="bg-background/50 py-1.5 px-3">
                          {req.skill}
                          <span className="ml-2 text-primary font-bold">Lvl {req.minLevel}+</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 pt-6 border-t bg-muted/5">
                  <Button 
                    variant="default" 
                    className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20"
                    onClick={handleApply}
                  >
                    Apply Now
                  </Button>
                  <p className="text-[10px] text-center text-muted-foreground px-4">
                    By applying, you agree to share your profile and resume with <b>{job.company}</b>.
                  </p>
                </CardFooter>
              </Card>
            </motion.div>

            <Card className="border-none shadow-lg glass border-l-4 border-l-amber-500">
              <CardContent className="p-4 flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Requirement Note</p>
                  <p className="text-xs text-muted-foreground">
                    This position requires <b>React</b> at an <b>Expert</b> level. You may want to take an assessment first.
                  </p>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs text-amber-600" asChild>
                    <Link to="/student/assessments">Go to Assessments</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Multi-step Application Modal */}
      <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
        <DialogContent className="sm:max-w-[500px] border-none shadow-2xl glass-modal p-0 overflow-hidden">
          <div className="h-1.5 bg-primary w-full" />
          
          <AnimatePresence mode="wait">
            {applyStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8"
              >
                <DialogHeader className="mb-8">
                  <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary" />
                    Select Your Resume
                  </DialogTitle>
                  <DialogDescription>
                    Choose the best resume for this position at {job.company}.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 mb-8">
                  {mockResumes.map((resume) => (
                    <div
                      key={resume.id}
                      onClick={() => setSelectedResume(resume.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
                        selectedResume === resume.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-muted hover:border-primary/30'
                      }`}
                    >
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                        selectedResume === resume.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                      }`}>
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm">{resume.name}</p>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Updated {resume.date}</p>
                      </div>
                      {selectedResume === resume.id && <CheckCircle2 className="h-5 w-5 text-primary" />}
                    </div>
                  ))}
                  <Button variant="outline" className="w-full h-14 border-dashed rounded-2xl group">
                    <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" />
                    Upload New Resume
                  </Button>
                </div>

                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsApplyModalOpen(false)}>Cancel</Button>
                  <Button onClick={() => setApplyStep(2)} className="px-8 rounded-xl shadow-lg shadow-primary/20">
                    Next: Match Analysis
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </DialogFooter>
              </motion.div>
            )}

            {applyStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8"
              >
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-primary" />
                    Match Analysis
                  </DialogTitle>
                  <DialogDescription>
                    AI-powered insight on your alignment with this role.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mb-8">
                  <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex gap-4">
                    <ShieldCheck className="h-6 w-6 text-emerald-500 shrink-0" />
                    <p className="text-sm font-medium text-emerald-800 leading-relaxed">
                      Your <b>React</b> and <b>TypeScript</b> expertise are a perfect match. Your projects show proven experience in building similar dashboards.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-bold text-muted-foreground">Overall Confidence</span>
                      <span className="text-2xl font-extrabold text-primary">85%</span>
                    </div>
                    <Progress value={85} className="h-3 rounded-full" />
                  </div>

                  <div className="bg-muted/30 p-4 rounded-2xl space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Top Matching Points</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-foreground/80">
                        <CheckCircle className="h-3 w-3 text-emerald-500" /> Education alignment (B.Tech CS)
                      </div>
                      <div className="flex items-center gap-2 text-sm text-foreground/80">
                        <CheckCircle className="h-3 w-3 text-emerald-500" /> 2+ years React experience
                      </div>
                      <div className="flex items-center gap-2 text-sm text-foreground/80">
                        <CheckCircle className="h-3 w-3 text-emerald-500" /> Location preference match
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-3">
                  <Button variant="ghost" onClick={() => setApplyStep(1)}>Back</Button>
                  <Button 
                    onClick={submitApplication} 
                    disabled={isSubmitting}
                    className="flex-1 rounded-xl shadow-lg shadow-primary/20 h-12 text-lg"
                  >
                    {isSubmitting ? 'Submitting...' : 'Confirm & Apply'}
                  </Button>
                </DialogFooter>
              </motion.div>
            )}

            {applyStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-12 text-center"
              >
                <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Application Sent!</h3>
                <p className="text-muted-foreground mb-8">
                  Your application for <b>{job.title}</b> at <b>{job.company}</b> has been successfully submitted.
                </p>
                <div className="grid gap-3">
                  <Button variant="default" className="rounded-xl h-12 font-bold" onClick={() => navigate('/student/applications')}>
                    Track Application
                  </Button>
                  <Button variant="ghost" onClick={() => setIsApplyModalOpen(false)}>
                    Close
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      <style dangerouslySetInnerHTML={{ __html: `
        .glass {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .dark .glass {
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .glass-modal {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(16px);
        }
        .dark .glass-modal {
          background: rgba(15, 23, 42, 0.95);
        }
      `}} />
    </div>
  )
}

