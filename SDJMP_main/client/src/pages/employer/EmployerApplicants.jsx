import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Link2,
  Mail,
  MapPin,
  Monitor,
  Search,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { applicationsAPI, employerAPI } from '@/services/api'

const statusMeta = {
  applied:     { label: 'Applied',     className: 'bg-sky-500/10 text-sky-600 border-sky-500/20' },
  shortlisted: { label: 'Shortlisted', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  interview:   { label: 'Interview',   className: 'bg-violet-500/10 text-violet-600 border-violet-500/20' },
  rejected:    { label: 'Rejected',    className: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
  hired:       { label: 'Hired',       className: 'bg-teal-500/10 text-teal-600 border-teal-500/20' },
}

const EMPTY_SCHEDULE = {
  method: 'online',
  link: '',
  location: '',
  date: '',
  time: '',
  notes: '',
}

export default function EmployerApplicants() {
  const { id: jobId } = useParams()

  const [applicants, setApplicants] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [detailApplicant, setDetailApplicant] = useState(null)
  const [scheduleApplicant, setScheduleApplicant] = useState(null)
  const [scheduleForm, setScheduleForm] = useState(EMPTY_SCHEDULE)
  const [saving, setSaving] = useState(false)

  const fetchApplicants = useCallback(() => {
    setLoading(true)
    const call = jobId
      ? applicationsAPI.getForJob(jobId)
      : employerAPI.getAllApplicants()

    call
      .then((data) => setApplicants(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load applicants'))
      .finally(() => setLoading(false))
  }, [jobId])

  useEffect(() => { fetchApplicants() }, [fetchApplicants])

  const filteredApplicants = useMemo(() => {
    return applicants.filter((a) => {
      const matchesFilter = activeFilter === 'all' || a.status === activeFilter
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        !q ||
        (a.name || '').toLowerCase().includes(q) ||
        (a.email || '').toLowerCase().includes(q) ||
        (a.position || '').toLowerCase().includes(q)
      return matchesFilter && matchesSearch
    })
  }, [activeFilter, applicants, searchQuery])

  const stats = useMemo(() => ({
    total:       applicants.length,
    shortlisted: applicants.filter((a) => a.status === 'shortlisted').length,
    interviews:  applicants.filter((a) => a.status === 'interview').length,
    averageMatch: applicants.length
      ? Math.round(applicants.reduce((s, a) => s + (a.matchScore || 0), 0) / applicants.length)
      : 0,
  }), [applicants])

  const updateStatus = async (id, status) => {
    try {
      await applicationsAPI.updateStatus(id, status)
      setApplicants((cur) => cur.map((a) => (a.id === id ? { ...a, status } : a)))
      toast.success(`Candidate moved to ${status}`)
    } catch {
      toast.error('Failed to update status')
    }
  }

  const openSchedule = (applicant) => {
    setScheduleApplicant(applicant)
    setScheduleForm({ ...EMPTY_SCHEDULE, notes: applicant.notes || '' })
  }

  const saveSchedule = async () => {
    if (!scheduleApplicant) return
    const { method, link, location, date, time, notes } = scheduleForm
    if (!date || !time) { toast.error('Date and time are required'); return }
    if (method === 'online' && !link) { toast.error('Meeting link is required for online interviews'); return }
    if (method === 'offline' && !location) { toast.error('Location is required for offline interviews'); return }

    setSaving(true)
    try {
      await employerAPI.scheduleInterview(scheduleApplicant.id, { method, link, location, date, time, notes })
      setApplicants((cur) =>
        cur.map((a) =>
          a.id === scheduleApplicant.id
            ? { ...a, status: 'interview', interview: { method, link, location, date, time, notes } }
            : a,
        ),
      )
      toast.success('Interview scheduled')
      setScheduleApplicant(null)
    } catch (err) {
      toast.error(err?.message || 'Failed to schedule interview')
    } finally {
      setSaving(false)
    }
  }

  const jobTitle = jobId ? applicants[0]?.position || 'Job' : 'All Positions'

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12">
      <PageHeader
        title="Applicants"
        description={`Review candidates for ${jobTitle}, compare match signals, and move the strongest profiles forward.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users}       title="Applicants"  value={stats.total}             description="Active in pipeline" />
        <StatCard icon={CheckCircle2} title="Shortlisted" value={stats.shortlisted}       description="Ready for review" />
        <StatCard icon={Calendar}    title="Interviews"  value={stats.interviews}         description="Scheduled with team" />
        <StatCard icon={Target}      title="Avg Match"   value={`${stats.averageMatch}%`} description="Skill match score" />
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
                ['all',         `All (${stats.total})`],
                ['applied',     `Applied (${applicants.filter((a) => a.status === 'applied').length})`],
                ['shortlisted', `Shortlisted (${stats.shortlisted})`],
                ['interview',   `Interview (${stats.interviews})`],
                ['rejected',    `Rejected (${applicants.filter((a) => a.status === 'rejected').length})`],
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
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by candidate name, email, or position"
              className="pl-10"
            />
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="py-14 text-center text-muted-foreground text-sm">Loading applicants…</div>
          ) : filteredApplicants.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-background/40 px-6 py-14 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Search className="h-7 w-7 text-primary" />
              </div>
              <p className="text-lg font-semibold">No applicants in this view</p>
              <p className="mt-2 text-sm text-muted-foreground">Clear the search or switch filters to review more candidates.</p>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {filteredApplicants.map((applicant) => {
                const meta = statusMeta[applicant.status] || statusMeta.applied
                return (
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
                              <Badge variant="outline" className={meta.className}>{meta.label}</Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">{applicant.position}</p>
                            <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" />{applicant.email}</span>
                              <span className="flex items-center gap-1.5"><Clock3 className="h-4 w-4" />Applied {applicant.appliedDate}</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                          <div className="rounded-2xl border bg-muted/25 p-4">
                            <div className="mb-3 flex items-center justify-between">
                              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                Skill Match Score
                              </span>
                              <span className="text-2xl font-black text-primary">{applicant.matchScore ?? '—'}%</span>
                            </div>
                            <Progress value={applicant.matchScore || 0} className="h-2" />
                            <div className="mt-3 space-y-1 text-xs">
                              {applicant.matchedSkills?.length > 0 && (
                                <p className="text-emerald-600 font-medium">
                                  ✓ Matched: {applicant.matchedSkills.join(', ')}
                                </p>
                              )}
                              {applicant.missingSkills?.length > 0 && (
                                <p className="text-rose-500">
                                  ✗ Missing: {applicant.missingSkills.join(', ')}
                                </p>
                              )}
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
                          {applicant.status !== 'shortlisted' && (
                            <Button onClick={() => updateStatus(applicant.id, 'shortlisted')}>
                              Shortlist <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                          )}
                          {applicant.status !== 'interview' && (
                            <Button variant="outline" onClick={() => openSchedule(applicant)}>
                              <Calendar className="mr-2 h-4 w-4" />
                              Schedule
                            </Button>
                          )}
                          {applicant.status !== 'rejected' && (
                            <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => updateStatus(applicant.id, 'rejected')}>
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={Boolean(detailApplicant)} onOpenChange={(open) => !open && setDetailApplicant(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{detailApplicant?.name}</DialogTitle>
            <DialogDescription>Candidate summary for the {detailApplicant?.position} role.</DialogDescription>
          </DialogHeader>
          {detailApplicant ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border bg-muted/25 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Candidate Info</p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" />{detailApplicant.email}</div>
                  <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-primary" />Applied {detailApplicant.appliedDate}</div>
                </div>
              </div>
              <div className="rounded-2xl border bg-background p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Skill Match Breakdown</p>
                <div className="space-y-3">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span>Match Score</span>
                      <span className="font-semibold">{detailApplicant.matchScore ?? '—'}%</span>
                    </div>
                    <Progress value={detailApplicant.matchScore || 0} className="h-2" />
                  </div>
                  {detailApplicant.matchedSkills?.length > 0 && (
                    <p className="text-xs text-emerald-600 font-medium">✓ {detailApplicant.matchedSkills.join(', ')}</p>
                  )}
                  {detailApplicant.missingSkills?.length > 0 && (
                    <p className="text-xs text-rose-500">✗ {detailApplicant.missingSkills.join(', ')}</p>
                  )}
                </div>
              </div>
              {detailApplicant.coverLetter && (
                <div className="rounded-2xl border bg-background p-4 sm:col-span-2">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Cover Letter</p>
                  <p className="text-sm leading-6 text-muted-foreground">{detailApplicant.coverLetter}</p>
                </div>
              )}
              <div className="rounded-2xl border bg-background p-4 sm:col-span-2">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Notes</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  {detailApplicant.notes || 'No hiring notes have been added for this applicant yet.'}
                </p>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={Boolean(scheduleApplicant)} onOpenChange={(open) => !open && setScheduleApplicant(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
            <DialogDescription>Set up the next conversation with {scheduleApplicant?.name}.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            {/* Method */}
            <div className="space-y-2">
              <Label htmlFor="interview-method">Interview Method</Label>
              <Select
                value={scheduleForm.method}
                onValueChange={(v) => setScheduleForm((cur) => ({ ...cur, method: v, link: '', location: '' }))}
              >
                <SelectTrigger id="interview-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">
                    <span className="flex items-center gap-2"><Monitor className="h-4 w-4" />Online (Video / Call)</span>
                  </SelectItem>
                  <SelectItem value="offline">
                    <span className="flex items-center gap-2"><MapPin className="h-4 w-4" />Offline (In-person)</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Conditional field */}
            {scheduleForm.method === 'online' ? (
              <div className="space-y-2">
                <Label htmlFor="interview-link">Meeting Link</Label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="interview-link"
                    className="pl-10"
                    value={scheduleForm.link}
                    onChange={(e) => setScheduleForm((cur) => ({ ...cur, link: e.target.value }))}
                    placeholder="https://meet.google.com/..."
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="interview-location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="interview-location"
                    className="pl-10"
                    value={scheduleForm.location}
                    onChange={(e) => setScheduleForm((cur) => ({ ...cur, location: e.target.value }))}
                    placeholder="Office address or room name"
                  />
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="interview-date">Date</Label>
                <Input
                  id="interview-date"
                  type="date"
                  value={scheduleForm.date}
                  onChange={(e) => setScheduleForm((cur) => ({ ...cur, date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interview-time">Time</Label>
                <Input
                  id="interview-time"
                  type="time"
                  value={scheduleForm.time}
                  onChange={(e) => setScheduleForm((cur) => ({ ...cur, time: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interview-notes">Notes</Label>
              <Textarea
                id="interview-notes"
                value={scheduleForm.notes}
                onChange={(e) => setScheduleForm((cur) => ({ ...cur, notes: e.target.value }))}
                placeholder="Agenda, panel details, or preparation notes"
              />
            </div>

            {/* Preview */}
            <div className="rounded-2xl border bg-muted/25 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Preview</p>
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
                  {scheduleForm.method === 'online'
                    ? <Monitor className="h-4 w-4 text-primary" />
                    : <MapPin className="h-4 w-4 text-primary" />}
                  {scheduleForm.method === 'online'
                    ? (scheduleForm.link || 'Add meeting link')
                    : (scheduleForm.location || 'Add location')}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setScheduleApplicant(null)}>Cancel</Button>
            <Button onClick={saveSchedule} disabled={saving}>
              {saving ? 'Saving…' : 'Save Interview'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
