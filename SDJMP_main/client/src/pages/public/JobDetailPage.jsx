import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  AlertCircle,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  FileText,
  Info,
  MapPin,
  Share2,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import api from '@/services/api'

function normalizeSkillValue(skill) {
  if (typeof skill === 'string') {
    return skill.trim().toLowerCase()
  }

  if (skill && typeof skill === 'object') {
    return String(skill.name || skill.label || '').trim().toLowerCase()
  }

  return ''
}

function normalizeRequirement(requirement) {
  if (!requirement) {
    return null
  }

  if (typeof requirement === 'string') {
    return {
      skill: requirement,
      score: 0,
      status: 'Required skill',
    }
  }

  return {
    skill: requirement.skill || requirement.label || 'Requirement',
    score: requirement.score || requirement.weight || 0,
    status: requirement.status || 'Required skill',
  }
}

function calculateMatch(job, user) {
  const studentSkills = (user?.profile?.skills || [])
    .map(normalizeSkillValue)
    .filter(Boolean)

  const jobSkills = (job?.skills || [])
    .map(normalizeSkillValue)
    .filter(Boolean)

  if (jobSkills.length === 0) {
    return 60
  }

  const overlap = jobSkills.filter((skill) => studentSkills.includes(skill)).length
  return Math.round((overlap / jobSkills.length) * 100)
}

function buildMatchBreakdown(job, user, matchScore) {
  const studentSkills = (user?.profile?.skills || [])
    .map(normalizeSkillValue)
    .filter(Boolean)

  const jobSkills = (job?.skills || [])
    .map(normalizeSkillValue)
    .filter(Boolean)

  const overlap = jobSkills.filter((skill) => studentSkills.includes(skill)).length
  const skillScore = jobSkills.length > 0 ? Math.round((overlap / jobSkills.length) * 100) : 60
  const profileScore = studentSkills.length > 0 ? Math.min(100, 45 + studentSkills.length * 8) : 35
  const readinessScore = Math.min(100, Math.round((matchScore + profileScore) / 2))

  return [
    {
      label: 'Skill Alignment',
      score: skillScore,
      status: skillScore >= 75 ? 'Strong match' : skillScore >= 45 ? 'Partial match' : 'Needs work',
    },
    {
      label: 'Profile Strength',
      score: profileScore,
      status: profileScore >= 70 ? 'Solid profile' : 'Improve profile',
    },
    {
      label: 'Application Readiness',
      score: readinessScore,
      status: readinessScore >= 75 ? 'Ready to apply' : 'Can improve',
    },
  ]
}

function formatSalary(salary) {
  if (!salary) {
    return 'Not specified'
  }

  if (typeof salary === 'string') {
    return salary
  }

  if (salary.label) {
    return salary.label
  }

  if (salary.min || salary.max) {
    const min = salary.min ? `$${Number(salary.min).toLocaleString()}` : ''
    const max = salary.max ? `$${Number(salary.max).toLocaleString()}` : ''
    return [min, max].filter(Boolean).join(' - ')
  }

  return 'Not specified'
}

export default function JobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()

  const [job, setJob] = useState(null)
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [selectedResume, setSelectedResume] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [applicationSubmitted, setApplicationSubmitted] = useState(false)
  const [existingApplication, setExistingApplication] = useState(null)
  const [isCheckingApplication, setIsCheckingApplication] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadJob() {
      try {
        setLoading(true)
        const jobData = await api.jobs.getById(id)
        let resolvedJob = jobData

        if (user?.role === 'student') {
          try {
            const matches = await api.jobs.getStudentMatches()
            const matchedJob = matches.find((entry) => String(entry.id || entry._id) === String(id))
            if (matchedJob) {
              resolvedJob = {
                ...jobData,
                ...matchedJob,
                matchScore: matchedJob.matchScore,
              }
            }
          } catch {
            // Fall back to the base job payload if match lookup fails.
          }
        }

        if (isMounted) {
          setJob(resolvedJob)
        }
      } catch (error) {
        toast.error('Failed to load job details')
        if (isMounted) {
          setJob(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadJob()
    return () => {
      isMounted = false
    }
  }, [id, user?.role])

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'student') {
      setResumes([])
      setSelectedResume('')
      setExistingApplication(null)
      return
    }

    let isMounted = true

    async function loadResumes() {
      try {
        const payload = await api.user.getResumes()
        const availableResumes = payload?.resumes || []
        if (!isMounted) {
          return
        }

        setResumes(availableResumes)
        const primaryResume = availableResumes.find((resume) => resume.isPrimary)
        setSelectedResume(primaryResume?._id || availableResumes[0]?._id || '')
      } catch (error) {
        if (isMounted) {
          setResumes([])
        }
      }
    }

    loadResumes()
    return () => {
      isMounted = false
    }
  }, [isAuthenticated, user?.role])

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'student' || !id) {
      setExistingApplication(null)
      return
    }

    let isMounted = true

    async function loadApplicationStatus() {
      try {
        setIsCheckingApplication(true)
        const result = await api.applications.getMyForJob(id)
        if (!isMounted) return
        setExistingApplication(result?.application || null)
      } catch {
        if (!isMounted) return
        setExistingApplication(null)
      } finally {
        if (isMounted) setIsCheckingApplication(false)
      }
    }

    loadApplicationStatus()
    return () => {
      isMounted = false
    }
  }, [id, isAuthenticated, user?.role])

  const matchScore = useMemo(() => {
    if (typeof job?.matchScore === 'number' && Number.isFinite(job.matchScore)) {
      return job.matchScore
    }

    return calculateMatch(job, user)
  }, [job, user])
  const matchBreakdown = useMemo(() => buildMatchBreakdown(job, user, matchScore), [job, user, matchScore])
  const normalizedRequirements = useMemo(
    () => {
      const requirements = Array.isArray(job?.requirements) ? job.requirements : []
      const skillRequirements = Array.isArray(job?.skillRequirements) ? job.skillRequirements : []

      // Prefer explicit `requirements`, but fallback to `skillRequirements` for real jobs.
      const source = requirements.length > 0 ? requirements : skillRequirements

      return source.map(normalizeRequirement).filter(Boolean)
    },
    [job]
  )
  const descriptionParagraphs = useMemo(
    () =>
      String(job?.description || '')
        .split('\n')
        .map((paragraph) => paragraph.trim())
        .filter(Boolean),
    [job]
  )

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

    if (resumes.length === 0) {
      toast.info('Create or upload a resume before applying')
      navigate('/student/resumes')
      return
    }

    if (existingApplication) {
      toast.info('You have already applied to this job')
      navigate('/student/applications')
      return
    }

    setApplicationSubmitted(false)
    setIsApplyModalOpen(true)
  }

  const submitApplication = async () => {
    if (!selectedResume) {
      toast.error('Select a resume first')
      return
    }

    try {
      setIsSubmitting(true)
      await api.applications.apply(id, { resumeId: selectedResume })
      setApplicationSubmitted(true)
      setExistingApplication({ jobId: id })
      toast.success('Application submitted successfully')
      window.dispatchEvent(new CustomEvent('skillmatch:data-changed', { detail: { type: 'application', jobId: id } }))
    } catch (error) {
      toast.error(error?.message || 'Failed to submit application')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="mx-auto max-w-2xl p-10 text-center">
          <p className="text-lg font-semibold">Job not found</p>
          <p className="mt-2 text-muted-foreground">This job may have been removed or is no longer available.</p>
          <Button asChild className="mt-6">
            <Link to="/jobs">Back to Jobs</Link>
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-12"> 
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="overflow-hidden border-none shadow-xl glass">
              <CardHeader className="pb-6">
                <div className="flex flex-col gap-6 md:flex-row md:items-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 p-4">
                    <Building2 className="h-12 w-12 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10">
                        {job.type}
                      </Badge>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently'}
                      </span>
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight">{job.title}</CardTitle>
                    <CardDescription className="text-lg font-medium text-foreground">
                      {job.company}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 border-t bg-muted/5 pt-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-xl border bg-background p-3 shadow-sm">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Location</p>
                    <p className="flex items-center gap-1 text-sm font-medium">
                      <MapPin className="h-3 w-3 text-primary" />
                      {job.location || 'Remote'}
                    </p>
                  </div>
                  <div className="rounded-xl border bg-background p-3 shadow-sm">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Salary</p>
                    <p className="flex items-center gap-1 text-sm font-medium">
                      <DollarSign className="h-3 w-3 text-primary" />
                      {formatSalary(job.salary)}
                    </p>
                  </div>
                  <div className="rounded-xl border bg-background p-3 shadow-sm">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Deadline</p>
                    <p className="flex items-center gap-1 text-sm font-medium">
                      <Calendar className="h-3 w-3 text-primary" />
                      {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Open until filled'}
                    </p>
                  </div>
                  <div className="rounded-xl border bg-background p-3 shadow-sm">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</p>
                    <p className="flex items-center gap-1 text-sm font-medium">
                      <Users className="h-3 w-3 text-primary" />
                      {job.status}
                    </p>
                  </div>
                </div>

                {job.skills?.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">Key Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg glass">
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {descriptionParagraphs.length > 0 ? (
                  descriptionParagraphs.map((paragraph, idx) => (
                    <p key={`para-${idx}`} className="text-sm leading-7 text-muted-foreground">{paragraph}</p>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No detailed description provided.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-24 overflow-hidden border-none shadow-2xl glass">
              <div className="h-2 bg-primary" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Match Score Analysis
                </CardTitle>
                <CardDescription>How well your current profile fits this job.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-2xl border border-primary/10 bg-primary/5 py-6">
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-4xl font-bold text-primary">{matchScore}%</div>
                    <div className="mt-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Match</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <h4 className="font-semibold">Match Breakdown</h4>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Info className="h-3 w-3" />
                      Based on your profile
                    </div>
                  </div>

                  {matchBreakdown.map((item) => (
                    <div key={item.label} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-medium">{item.status}</span>
                      </div>
                      <Progress value={item.score} className="h-1.5" />
                    </div>
                  ))}
                </div>

                {normalizedRequirements.length > 0 && (
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="flex items-center gap-2 text-sm font-semibold">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Requirements
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {normalizedRequirements.map((requirement, idx) => (
                        <Badge key={`req-${idx}-${requirement.skill}`} variant="outline" className="bg-background/50 py-1.5 px-3">
                          {requirement.skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-3 border-t bg-muted/5 pt-6">
                {existingApplication ? (
                  <>
                    <Button className="h-12 w-full text-lg font-bold" variant="secondary" disabled>
                      Applied
                    </Button>
                    <Button asChild variant="outline" className="h-11 w-full font-bold">
                      <Link to="/student/applications">View in Applications</Link>
                    </Button>
                  </>
                ) : (
                  <Button
                    className="h-12 w-full text-lg font-bold shadow-lg shadow-primary/20"
                    onClick={handleApply}
                    disabled={isCheckingApplication}
                  >
                    {isCheckingApplication ? 'Checking...' : 'Apply Now'}
                  </Button>
                )}
                <p className="px-4 text-center text-[10px] text-muted-foreground">
                  By applying, you agree to share your profile and resume with <b>{job.company}</b>.
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
        <DialogContent className="sm:max-w-[560px] border-none p-0 shadow-2xl glass-modal overflow-hidden">
          <div className="h-1.5 w-full bg-primary" />
          <div className="p-6 sm:p-8">
            {applicationSubmitted ? (
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                </div>
                <h3 className="mb-2 text-2xl font-bold">Application Sent</h3>
                <p className="mb-8 text-muted-foreground">
                  Your application for <b>{job.title}</b> at <b>{job.company}</b> has been submitted successfully.
                </p>
                <div className="grid gap-3">
                  <Button className="h-12 rounded-xl font-bold" onClick={() => navigate('/student/applications')}>
                    Track Application
                  </Button>
                  <Button variant="ghost" onClick={() => setIsApplyModalOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <DialogHeader className="mb-6">
                  <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
                    <FileText className="h-6 w-6 text-primary" />
                    Apply to {job.company}
                  </DialogTitle>
                  <DialogDescription>
                    Select the resume you want to submit for this role.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                  {resumes.length === 0 ? (
                    <div className="rounded-2xl border border-dashed p-6 text-center">
                      <p className="font-medium">No resumes available</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Create or upload a resume before applying to this job.
                      </p>
                      <Button className="mt-4" asChild>
                        <Link to="/student/resumes">Go to Resume Manager</Link>
                      </Button>
                    </div>
                  ) : (
                    resumes.map((resume) => (
                      <button
                        key={resume._id}
                        type="button"
                        onClick={() => setSelectedResume(resume._id)}
                        className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all ${
                          selectedResume === resume._id
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-primary/30'
                        }`}
                      >
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          selectedResume === resume._id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                        }`}>
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold">{resume.name}</p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {resume.isPrimary ? 'Primary resume' : resume.type}
                          </p>
                        </div>
                        {selectedResume === resume._id ? (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        ) : null}
                      </button>
                    ))
                  )}
                </div>

                {job.skills?.length > 0 && (
                  <div className="mt-6 rounded-2xl bg-muted/30 p-4">
                    <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      Match Snapshot
                    </p>
                    <div className="mb-3 flex items-end justify-between">
                      <span className="text-sm font-medium">Overall confidence</span>
                      <span className="text-2xl font-extrabold text-primary">{matchScore}%</span>
                    </div>
                    <Progress value={matchScore} className="h-2.5" />
                  </div>
                )}

                <DialogFooter className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button variant="ghost" onClick={() => setIsApplyModalOpen(false)}>
                    <X className="mr-1 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    className="h-12 flex-1 rounded-xl font-bold shadow-lg shadow-primary/20"
                    onClick={submitApplication}
                    disabled={isSubmitting || resumes.length === 0 || !selectedResume}
                  >
                    {isSubmitting ? 'Submitting...' : 'Confirm & Apply'}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </DialogFooter>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
