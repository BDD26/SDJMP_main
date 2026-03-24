import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { jobsAPI } from '@/services/api'

const statusClasses = {
  published: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  draft:     'bg-amber-500/10 text-amber-600 border-amber-500/20',
  closed:    'bg-slate-500/10 text-slate-600 border-slate-500/20',
}

const statusLabel = {
  published: 'Published',
  draft:     'Draft',
  closed:    'Closed',
}

function formatPosted(dateStr) {
  if (!dateStr) return ''
  const now = new Date()
  const d = new Date(dateStr)
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`
  return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`
}

export default function EmployerJobManagement() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [jobToDelete, setJobToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchJobs = useCallback(() => {
    setLoading(true)
    jobsAPI.getMyJobs()
      .then((data) => setJobs(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load jobs'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        !q ||
        (job.title || '').toLowerCase().includes(q) ||
        (job.location || '').toLowerCase().includes(q) ||
        (job.type || '').toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [jobs, searchQuery, statusFilter])

  const stats = useMemo(() => ({
    published:  jobs.filter((j) => j.status === 'published').length,
    draft:      jobs.filter((j) => j.status === 'draft').length,
    applicants: jobs.reduce((s, j) => s + (j.applicants || 0), 0),
    interviews: jobs.reduce((s, j) => s + (j.interviews || 0), 0),
  }), [jobs])

  const handleDelete = async () => {
    if (!jobToDelete) return
    setDeleting(true)
    try {
      await jobsAPI.delete(jobToDelete.id)
      setJobs((cur) => cur.filter((j) => j.id !== jobToDelete.id))
      toast.success('Job removed from your postings')
      setJobToDelete(null)
    } catch {
      toast.error('Failed to delete job')
    } finally {
      setDeleting(false)
    }
  }

  const handleStatusChange = async (job, nextStatus) => {
    try {
      await jobsAPI.update(job.id, { status: nextStatus })
      setJobs((cur) => cur.map((j) => (j.id === job.id ? { ...j, status: nextStatus } : j)))
      toast.success(`Job moved to ${statusLabel[nextStatus] || nextStatus}`)
    } catch {
      toast.error('Failed to update job status')
    }
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
        <StatCard icon={Briefcase} title="Published"  value={stats.published}  description="Live and visible" />
        <StatCard icon={PenSquare} title="Drafts"     value={stats.draft}      description="Need review"
          trend={stats.draft ? `${stats.draft} pending` : 'Ready'} trendUp={false} />
        <StatCard icon={Users}     title="Applicants" value={stats.applicants} description="Across all jobs" />
        <StatCard icon={Target}    title="Interviews" value={stats.interviews} description="Pipeline in motion" />
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
                ['all',       `All (${jobs.length})`],
                ['published', `Published (${stats.published})`],
                ['draft',     `Drafts (${stats.draft})`],
                ['closed',    `Closed (${jobs.filter((j) => j.status === 'closed').length})`],
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
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role, location, or type"
              className="pl-10"
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {loading ? (
            <div className="py-14 text-center text-muted-foreground text-sm">Loading your job postings…</div>
          ) : filteredJobs.length === 0 ? (
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
                            {statusLabel[job.status] || job.status}
                          </Badge>
                          <Badge variant="secondary">{job.type}</Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          {job.location && (
                            <span className="flex items-center gap-1.5">
                              <MapPin className="h-4 w-4" />{job.location}
                            </span>
                          )}
                          {job.salary && <span>{job.salary}</span>}
                          <span className="flex items-center gap-1.5">
                            <Clock3 className="h-4 w-4" />Posted {formatPosted(job.createdAt)}
                          </span>
                        </div>
                        {job.description && (
                          <p className="max-w-3xl text-sm leading-6 text-muted-foreground line-clamp-2">
                            {job.description}
                          </p>
                        )}
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
                              <PenSquare className="mr-2 h-4 w-4" />Edit details
                            </DropdownMenuItem>
                            {job.status !== 'published' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(job, 'published')}>
                                <Eye className="mr-2 h-4 w-4" />Publish
                              </DropdownMenuItem>
                            )}
                            {job.status === 'published' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(job, 'draft')}>
                                <Eye className="mr-2 h-4 w-4" />Move to draft
                              </DropdownMenuItem>
                            )}
                            {job.status !== 'closed' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(job, 'closed')}>
                                <Trash2 className="mr-2 h-4 w-4" />Close posting
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setJobToDelete(job)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />Delete permanently
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 xl:min-w-[220px]">
                      <MetricCard label="Applicants" value={job.applicants ?? 0}
                        hint={job.applicants ? 'In review' : 'No applications yet'} icon={Users} />
                      <MetricCard label="Interviews" value={job.interviews ?? 0}
                        hint={job.interviews ? 'Scheduled' : 'Waiting'} icon={Target} />
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
              This permanently removes <strong>{jobToDelete?.title}</strong> from your account. Existing applications will also be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Keep job</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? 'Deleting…' : 'Delete job'}
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
