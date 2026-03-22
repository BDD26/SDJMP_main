import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Briefcase,
  Clock3,
  Eye,
  MapPin,
  MoreVertical,
  PenSquare,
  Plus,
  Search,
  Sparkles,
  Target,
  Trash2,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { useAuth } from '@/context/AuthContext'

const INITIAL_JOBS = [
  {
    id: 'job-frontend-lead',
    title: 'Senior Frontend Developer',
    type: 'Full-time',
    location: 'Remote',
    salary: 'Rs 15L - 25L LPA',
    status: 'active',
    applicants: 42,
    interviews: 6,
    matchConfidence: 89,
    posted: '2 days ago',
    summary: 'Own the frontend architecture for our employer platform and lead the React UI roadmap.',
  },
  {
    id: 'job-product-designer',
    title: 'Product Designer',
    type: 'Full-time',
    location: 'Hybrid',
    salary: 'Rs 12L - 20L LPA',
    status: 'active',
    applicants: 28,
    interviews: 3,
    matchConfidence: 76,
    posted: '1 week ago',
    summary: 'Partner with engineering and product to shape polished workflows for student and employer journeys.',
  },
  {
    id: 'job-backend-engineer',
    title: 'Backend Engineer',
    type: 'Full-time',
    location: 'On-site',
    salary: 'Rs 18L - 30L LPA',
    status: 'draft',
    applicants: 0,
    interviews: 0,
    matchConfidence: 92,
    posted: '3 days ago',
    summary: 'Build resilient APIs and data pipelines that power candidate matching and hiring workflows.',
  },
]

const statusClasses = {
  active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  draft: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  paused: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
}

export default function EmployerJobManagement() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [jobs, setJobs] = useState(INITIAL_JOBS)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [jobToDelete, setJobToDelete] = useState(null)

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.type.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [jobs, searchQuery, statusFilter])

  const stats = useMemo(() => {
    const active = jobs.filter((job) => job.status === 'active').length
    const draft = jobs.filter((job) => job.status === 'draft').length
    const applicants = jobs.reduce((sum, job) => sum + job.applicants, 0)
    const interviews = jobs.reduce((sum, job) => sum + job.interviews, 0)
    return { active, draft, applicants, interviews }
  }, [jobs])

  const handleDelete = () => {
    if (!jobToDelete) return
    setJobs((current) => current.filter((job) => job.id !== jobToDelete.id))
    toast.success('Job removed from your postings')
    setJobToDelete(null)
  }

  const handleStatusChange = (id, nextStatus) => {
    setJobs((current) =>
      current.map((job) => (job.id === id ? { ...job, status: nextStatus } : job))
    )
    toast.success(`Job updated to ${nextStatus}`)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12">
      <PageHeader
        title="Manage Jobs"
        description={`Track openings, applicant flow, and hiring activity for ${user?.company?.name || 'your team'}.`}
      >
        <Button onClick={() => navigate('/employer/jobs/new')} className="shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" />
          Post Job
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Briefcase} title="Active Jobs" value={stats.active} description="Live and visible" />
        <StatCard icon={PenSquare} title="Drafts" value={stats.draft} description="Need review" trend={stats.draft ? `${stats.draft} pending` : 'Ready'} trendUp={false} />
        <StatCard icon={Users} title="Applicants" value={stats.applicants} description="Across all jobs" />
        <StatCard icon={Target} title="Interviews" value={stats.interviews} description="Pipeline in motion" />
      </div>

      <Card className="border-none shadow-xl glass">
        <CardHeader className="gap-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Hiring Pipeline</CardTitle>
              <CardDescription>Filter current postings and manage their status from one place.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                ['all', `All (${jobs.length})`],
                ['active', `Active (${stats.active})`],
                ['draft', `Drafts (${stats.draft})`],
              ].map(([value, label]) => (
                <Button
                  key={value}
                  variant={statusFilter === value ? 'default' : 'outline'}
                  onClick={() => setStatusFilter(value)}
                  className="rounded-full"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by role, location, or type"
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredJobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-background/40 px-6 py-14 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Briefcase className="h-7 w-7 text-primary" />
              </div>
              <p className="text-lg font-semibold">No job postings match this view</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Adjust the filters or create a new opening to keep your pipeline moving.
              </p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <Card key={job.id} className="border-border/60 bg-background/50 shadow-sm transition-all hover:shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-5">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-2xl font-bold tracking-tight">{job.title}</h3>
                          <Badge variant="outline" className={statusClasses[job.status] || statusClasses.draft}>
                            {job.status}
                          </Badge>
                          <Badge variant="secondary">{job.type}</Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </span>
                          <span>{job.salary}</span>
                          <span className="flex items-center gap-1.5">
                            <Clock3 className="h-4 w-4" />
                            Posted {job.posted}
                          </span>
                        </div>
                        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{job.summary}</p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Button asChild>
                          <Link to={`/employer/jobs/${job.id}/applicants`}>
                            Manage Applicants
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" onClick={() => navigate(`/employer/jobs/${job.id}/edit`)}>
                          <PenSquare className="mr-2 h-4 w-4" />
                          Edit Job
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label={`Manage ${job.title}`}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/employer/jobs/${job.id}/edit`)}>
                              <PenSquare className="mr-2 h-4 w-4" />
                              Edit details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(job.id, job.status === 'active' ? 'draft' : 'active')
                              }
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              {job.status === 'active' ? 'Move to draft' : 'Publish job'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setJobToDelete(job)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete posting
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 xl:min-w-[260px]">
                      <MetricCard
                        label="Applicants"
                        value={job.applicants}
                        hint={job.applicants ? 'In review' : 'No applications yet'}
                        icon={Users}
                      />
                      <MetricCard
                        label="Interviews"
                        value={job.interviews}
                        hint={job.interviews ? 'Scheduled' : 'Waiting'}
                        icon={Sparkles}
                      />
                      <MetricCard
                        label="Match Score"
                        value={`${job.matchConfidence}%`}
                        hint="Candidate quality"
                        icon={Target}
                        className="col-span-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      <AlertDialog open={Boolean(jobToDelete)} onOpenChange={(open) => !open && setJobToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete job posting?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes <strong>{jobToDelete?.title}</strong> from your employer workspace. Existing applicant data for this mock page will also disappear.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep job</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete job
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function MetricCard({ label, value, hint, icon: Icon, className = '' }) {
  return (
    <div className={`rounded-2xl border bg-muted/30 p-4 ${className}`}>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="text-2xl font-black tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  )
}
