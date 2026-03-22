import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Mail,
  MapPin,
  Search,
  Sparkles,
  Target,
  User,
  Users,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'

const INITIAL_APPLICANTS = [
  {
    id: 'app-alice',
    name: 'Alice Johnson',
    position: 'Senior Frontend Developer',
    matchScore: 92,
    status: 'shortlisted',
    appliedDate: '2 days ago',
    email: 'alice.j@uni.edu',
    location: 'Bengaluru',
    highlights: ['React', 'TypeScript', 'Design Systems'],
    notes: 'Strong portfolio and excellent system thinking.',
  },
  {
    id: 'app-bob',
    name: 'Bob Smith',
    position: 'Senior Frontend Developer',
    matchScore: 78,
    status: 'applied',
    appliedDate: '3 days ago',
    email: 'bob.smith@tech.com',
    location: 'Remote',
    highlights: ['React', 'JavaScript', 'Accessibility'],
    notes: '',
  },
  {
    id: 'app-charlie',
    name: 'Charlie Brown',
    position: 'Senior Frontend Developer',
    matchScore: 65,
    status: 'rejected',
    appliedDate: '5 days ago',
    email: 'charlie.b@out.com',
    location: 'New Delhi',
    highlights: ['Next.js', 'REST APIs'],
    notes: 'Missing required depth in TypeScript and testing.',
  },
]

const statusMeta = {
  applied: { label: 'Applied', className: 'bg-sky-500/10 text-sky-600 border-sky-500/20' },
  shortlisted: { label: 'Shortlisted', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  interview: { label: 'Interview', className: 'bg-violet-500/10 text-violet-600 border-violet-500/20' },
  rejected: { label: 'Rejected', className: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
}

export default function EmployerApplicants() {
  const { id: jobId } = useParams()
  const [applicants, setApplicants] = useState(INITIAL_APPLICANTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [detailApplicant, setDetailApplicant] = useState(null)
  const [scheduleApplicant, setScheduleApplicant] = useState(null)
  const [scheduleForm, setScheduleForm] = useState({
    date: '',
    time: '',
    location: '',
    notes: '',
  })

  const jobTitle = jobId ? 'Senior Frontend Developer' : 'All Positions'

  const filteredApplicants = useMemo(() => {
    return applicants.filter((applicant) => {
      const matchesFilter = activeFilter === 'all' || applicant.status === activeFilter
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        !query ||
        applicant.name.toLowerCase().includes(query) ||
        applicant.email.toLowerCase().includes(query) ||
        applicant.position.toLowerCase().includes(query)
      return matchesFilter && matchesSearch
    })
  }, [activeFilter, applicants, searchQuery])

  const stats = useMemo(() => {
    return {
      total: applicants.length,
      shortlisted: applicants.filter((applicant) => applicant.status === 'shortlisted').length,
      interviews: applicants.filter((applicant) => applicant.status === 'interview').length,
      averageMatch: Math.round(
        applicants.reduce((sum, applicant) => sum + applicant.matchScore, 0) / applicants.length
      ),
    }
  }, [applicants])

  const updateStatus = (id, status) => {
    setApplicants((current) =>
      current.map((applicant) => (applicant.id === id ? { ...applicant, status } : applicant))
    )
    toast.success(`Candidate moved to ${status}`)
  }

  const openSchedule = (applicant) => {
    setScheduleApplicant(applicant)
    setScheduleForm({
      date: '',
      time: '',
      location: 'Google Meet',
      notes: applicant.notes || '',
    })
  }

  const saveSchedule = () => {
    if (!scheduleApplicant) return
    setApplicants((current) =>
      current.map((applicant) =>
        applicant.id === scheduleApplicant.id
          ? {
              ...applicant,
              status: 'interview',
              interviewDate: scheduleForm.date,
              interviewTime: scheduleForm.time,
              interviewLocation: scheduleForm.location,
              notes: scheduleForm.notes,
            }
          : applicant
      )
    )
    toast.success('Interview scheduled')
    setScheduleApplicant(null)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12">
      <PageHeader
        title="Applicants"
        description={`Review candidates for ${jobTitle}, compare match signals, and move the strongest profiles forward.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} title="Applicants" value={stats.total} description="Active in pipeline" />
        <StatCard icon={CheckCircle2} title="Shortlisted" value={stats.shortlisted} description="Ready for review" />
        <StatCard icon={Calendar} title="Interviews" value={stats.interviews} description="Scheduled with team" />
        <StatCard icon={Target} title="Avg Match" value={`${stats.averageMatch}%`} description="Across current pool" />
      </div>

      <Card className="border-none shadow-xl glass">
        <CardHeader className="gap-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Candidate Pipeline</CardTitle>
              <CardDescription>Search by name or role and filter candidates by stage.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                ['all', `All (${stats.total})`],
                ['applied', `Applied (${applicants.filter((item) => item.status === 'applied').length})`],
                ['shortlisted', `Shortlisted (${stats.shortlisted})`],
                ['interview', `Interview (${stats.interviews})`],
                ['rejected', `Rejected (${applicants.filter((item) => item.status === 'rejected').length})`],
              ].map(([value, label]) => (
                <Button
                  key={value}
                  variant={activeFilter === value ? 'default' : 'outline'}
                  onClick={() => setActiveFilter(value)}
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
              placeholder="Search by candidate name, email, or position"
              className="pl-10"
            />
          </div>
        </CardHeader>

        <CardContent>
          {filteredApplicants.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-background/40 px-6 py-14 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Search className="h-7 w-7 text-primary" />
              </div>
              <p className="text-lg font-semibold">No applicants in this view</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Clear the search or switch filters to review more candidates.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {filteredApplicants.map((applicant) => (
                <Card key={applicant.id} className="border-border/60 bg-background/50 shadow-sm transition-all hover:shadow-lg">
                  <CardContent className="pt-6">
                    <div className="flex h-full flex-col gap-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl font-bold">{applicant.name}</h3>
                            <Badge variant="outline" className={statusMeta[applicant.status].className}>
                              {statusMeta[applicant.status].label}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{applicant.position}</p>
                          <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Mail className="h-4 w-4" />
                              {applicant.email}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MapPin className="h-4 w-4" />
                              {applicant.location}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock3 className="h-4 w-4" />
                              Applied {applicant.appliedDate}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                        <div className="rounded-2xl border bg-muted/25 p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                              Match Snapshot
                            </span>
                            <span className="text-2xl font-black text-primary">{applicant.matchScore}%</span>
                          </div>
                          <Progress value={applicant.matchScore} className="h-2" />
                          <div className="mt-4 flex flex-wrap gap-2">
                            {applicant.highlights.map((skill) => (
                              <Badge key={skill} variant="secondary">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-2xl border bg-background p-4">
                          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            Recruiter Notes
                          </p>
                          <p className="text-sm leading-6 text-muted-foreground">
                            {applicant.notes || 'No internal notes recorded for this candidate yet.'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 border-t pt-4">
                        <Button variant="outline" onClick={() => setDetailApplicant(applicant)}>
                          View Details
                        </Button>
                        <Button onClick={() => updateStatus(applicant.id, 'shortlisted')}>
                          Shortlist
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button variant="outline" onClick={() => openSchedule(applicant)}>
                          <Calendar className="mr-2 h-4 w-4" />
                          Schedule
                        </Button>
                        <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => updateStatus(applicant.id, 'rejected')}>
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(detailApplicant)} onOpenChange={(open) => !open && setDetailApplicant(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{detailApplicant?.name}</DialogTitle>
            <DialogDescription>
              Candidate summary for the {detailApplicant?.position} role.
            </DialogDescription>
          </DialogHeader>
          {detailApplicant ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border bg-muted/25 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Candidate Info
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    {detailApplicant.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    {detailApplicant.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-primary" />
                    Applied {detailApplicant.appliedDate}
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border bg-background p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Match Breakdown
                </p>
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span>Overall Match</span>
                      <span className="font-semibold">{detailApplicant.matchScore}%</span>
                    </div>
                    <Progress value={detailApplicant.matchScore} className="h-2" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {detailApplicant.highlights.map((highlight) => (
                      <Badge key={highlight} variant="secondary">
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border bg-background p-4 sm:col-span-2">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Notes
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  {detailApplicant.notes || 'No hiring notes have been added for this applicant yet.'}
                </p>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(scheduleApplicant)} onOpenChange={(open) => !open && setScheduleApplicant(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
            <DialogDescription>
              Set up the next conversation with {scheduleApplicant?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="interview-date">Date</Label>
                <Input
                  id="interview-date"
                  type="date"
                  value={scheduleForm.date}
                  onChange={(event) => setScheduleForm((current) => ({ ...current, date: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interview-time">Time</Label>
                <Input
                  id="interview-time"
                  type="time"
                  value={scheduleForm.time}
                  onChange={(event) => setScheduleForm((current) => ({ ...current, time: event.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="interview-location">Location or meeting link</Label>
              <Input
                id="interview-location"
                value={scheduleForm.location}
                onChange={(event) => setScheduleForm((current) => ({ ...current, location: event.target.value }))}
                placeholder="Google Meet, office boardroom, or phone call details"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interview-notes">Notes</Label>
              <Textarea
                id="interview-notes"
                value={scheduleForm.notes}
                onChange={(event) => setScheduleForm((current) => ({ ...current, notes: event.target.value }))}
                placeholder="Agenda, panel details, or preparation notes"
              />
            </div>
            <div className="rounded-2xl border bg-muted/25 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Preview
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  {scheduleForm.date || 'Choose a date'}
                </p>
                <p className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-primary" />
                  {scheduleForm.time || 'Choose a time'}
                </p>
                <p className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  {scheduleForm.location || 'Add a meeting location'}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setScheduleApplicant(null)}>
              Cancel
            </Button>
            <Button onClick={saveSchedule}>Save Interview</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
