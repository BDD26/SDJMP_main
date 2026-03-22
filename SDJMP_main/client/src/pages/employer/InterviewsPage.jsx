import { useMemo, useState } from 'react'
import {
  Calendar,
  CheckCircle2,
  Clock3,
  ExternalLink,
  MapPin,
  Plus,
  Video,
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
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'

const INITIAL_INTERVIEWS = [
  {
    id: 'interview-alice',
    candidate: 'Alice Johnson',
    role: 'Senior Frontend Developer',
    date: '2026-03-24',
    time: '10:00',
    duration: '60 min',
    type: 'video',
    status: 'scheduled',
    venue: 'Google Meet',
    link: 'https://meet.google.com/example',
  },
  {
    id: 'interview-bob',
    candidate: 'Bob Smith',
    role: 'Senior Frontend Developer',
    date: '2026-03-25',
    time: '14:00',
    duration: '45 min',
    type: 'onsite',
    status: 'scheduled',
    venue: 'Conference Room B',
    link: '',
  },
  {
    id: 'interview-john',
    candidate: 'John Doe',
    role: 'Backend Engineer',
    date: '2026-03-20',
    time: '11:00',
    duration: '60 min',
    type: 'video',
    status: 'completed',
    venue: 'Zoom',
    link: '',
  },
]

const statusClasses = {
  scheduled: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
  completed: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  cancelled: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
}

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState(INITIAL_INTERVIEWS)
  const [activeFilter, setActiveFilter] = useState('all')
  const [calendarConnected, setCalendarConnected] = useState(false)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [scheduleForm, setScheduleForm] = useState({
    candidate: '',
    role: '',
    date: '',
    time: '',
    venue: '',
  })
  const [rescheduleItem, setRescheduleItem] = useState(null)

  const filteredInterviews = useMemo(() => {
    const today = new Date('2026-03-22T00:00:00.000Z')
    return interviews.filter((interview) => {
      const interviewDate = new Date(`${interview.date}T00:00:00.000Z`)
      if (activeFilter === 'upcoming') {
        return interviewDate >= today && interview.status === 'scheduled'
      }
      if (activeFilter === 'completed') {
        return interview.status === 'completed'
      }
      if (activeFilter === 'cancelled') {
        return interview.status === 'cancelled'
      }
      return true
    })
  }, [activeFilter, interviews])

  const stats = useMemo(() => {
    return {
      scheduled: interviews.filter((item) => item.status === 'scheduled').length,
      completed: interviews.filter((item) => item.status === 'completed').length,
      cancelled: interviews.filter((item) => item.status === 'cancelled').length,
    }
  }, [interviews])

  const createInterview = () => {
    const nextInterview = {
      id: `interview-${Date.now()}`,
      candidate: scheduleForm.candidate,
      role: scheduleForm.role,
      date: scheduleForm.date,
      time: scheduleForm.time,
      duration: '45 min',
      type: 'video',
      status: 'scheduled',
      venue: scheduleForm.venue || 'Google Meet',
      link: 'https://meet.google.com/new-interview',
    }
    setInterviews((current) => [nextInterview, ...current])
    setScheduleForm({ candidate: '', role: '', date: '', time: '', venue: '' })
    setScheduleOpen(false)
    toast.success('Interview scheduled')
  }

  const saveReschedule = () => {
    if (!rescheduleItem) return
    setInterviews((current) =>
      current.map((interview) =>
        interview.id === rescheduleItem.id
          ? {
              ...interview,
              date: rescheduleItem.date,
              time: rescheduleItem.time,
              venue: rescheduleItem.venue,
            }
          : interview
      )
    )
    setRescheduleItem(null)
    toast.success('Interview updated')
  }

  const cancelInterview = (id) => {
    setInterviews((current) =>
      current.map((interview) =>
        interview.id === id ? { ...interview, status: 'cancelled' } : interview
      )
    )
    toast.error('Interview cancelled')
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12">
      <PageHeader
        title="Interviews"
        description="Coordinate upcoming conversations, keep the team aligned, and maintain a clean interview schedule."
      >
        <Button onClick={() => setScheduleOpen(true)} className="shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" />
          Schedule Interview
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Calendar} title="Scheduled" value={stats.scheduled} description="Upcoming sessions" />
        <StatCard icon={CheckCircle2} title="Completed" value={stats.completed} description="Closed loop" />
        <StatCard icon={XCircle} title="Cancelled" value={stats.cancelled} description="Needs follow-up" trend={stats.cancelled ? `${stats.cancelled} paused` : 'Stable'} trendUp={false} />
        <StatCard icon={Clock3} title="Calendar Sync" value={calendarConnected ? 'On' : 'Off'} description="External scheduling" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <div className="space-y-6">
          <Card className="border-none shadow-xl glass">
            <CardHeader>
              <CardTitle>Quick Filters</CardTitle>
              <CardDescription>Switch between active interview queues.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                ['all', 'All interviews'],
                ['upcoming', 'Upcoming'],
                ['completed', 'Completed'],
                ['cancelled', 'Cancelled'],
              ].map(([value, label]) => (
                <Button
                  key={value}
                  variant={activeFilter === value ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveFilter(value)}
                >
                  {label}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl glass">
            <CardHeader>
              <CardTitle>Calendar Sync</CardTitle>
              <CardDescription>Connect your external calendar for availability checks.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl border bg-background/50 px-4 py-3">
                <span className="text-sm font-medium">Status</span>
                <Badge variant={calendarConnected ? 'secondary' : 'outline'}>
                  {calendarConnected ? 'Connected' : 'Not connected'}
                </Badge>
              </div>
              <Button
                className="w-full"
                variant={calendarConnected ? 'outline' : 'default'}
                onClick={() => {
                  setCalendarConnected((current) => !current)
                  toast.success(calendarConnected ? 'Calendar disconnected' : 'Calendar connected')
                }}
              >
                {calendarConnected ? 'Disconnect Calendar' : 'Connect Calendar'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-xl glass">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Interview Schedule</CardTitle>
                <CardDescription>Review and update scheduled candidate conversations.</CardDescription>
              </div>
              <Badge variant="outline">{filteredInterviews.length} items</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {filteredInterviews.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-background/40 px-6 py-14 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <Calendar className="h-7 w-7 text-primary" />
                </div>
                <p className="text-lg font-semibold">No interviews in this view</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Schedule a candidate conversation or switch filters to review more records.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {filteredInterviews.map((interview) => (
                  <Card key={interview.id} className="border-border/60 bg-background/50 shadow-sm transition-all hover:shadow-lg">
                    <CardContent className="pt-6">
                      <div className="flex h-full flex-col gap-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h3 className="text-xl font-bold">{interview.candidate}</h3>
                            <p className="text-sm text-muted-foreground">{interview.role}</p>
                          </div>
                          <Badge variant="outline" className={statusClasses[interview.status] || statusClasses.scheduled}>
                            {interview.status}
                          </Badge>
                        </div>

                        <div className="grid gap-3 rounded-2xl border bg-muted/25 p-4 text-sm text-muted-foreground">
                          <p className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            {interview.date}
                          </p>
                          <p className="flex items-center gap-2">
                            <Clock3 className="h-4 w-4 text-primary" />
                            {interview.time} · {interview.duration}
                          </p>
                          <p className="flex items-center gap-2">
                            {interview.type === 'video' ? (
                              <Video className="h-4 w-4 text-primary" />
                            ) : (
                              <MapPin className="h-4 w-4 text-primary" />
                            )}
                            {interview.venue}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-3 border-t pt-4">
                          {interview.link ? (
                            <Button variant="outline" asChild>
                              <a href={interview.link} target="_blank" rel="noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Join
                              </a>
                            </Button>
                          ) : null}
                          <Button variant="outline" onClick={() => setRescheduleItem({ ...interview })}>
                            Reschedule
                          </Button>
                          {interview.status === 'scheduled' ? (
                            <Button
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => cancelInterview(interview.id)}
                            >
                              Cancel
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
            <DialogDescription>Create a new interview event for a candidate.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="candidate-name">Candidate</Label>
                <Input
                  id="candidate-name"
                  value={scheduleForm.candidate}
                  onChange={(event) => setScheduleForm((current) => ({ ...current, candidate: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="candidate-role">Role</Label>
                <Input
                  id="candidate-role"
                  value={scheduleForm.role}
                  onChange={(event) => setScheduleForm((current) => ({ ...current, role: event.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="candidate-date">Date</Label>
                <Input
                  id="candidate-date"
                  type="date"
                  value={scheduleForm.date}
                  onChange={(event) => setScheduleForm((current) => ({ ...current, date: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="candidate-time">Time</Label>
                <Input
                  id="candidate-time"
                  type="time"
                  value={scheduleForm.time}
                  onChange={(event) => setScheduleForm((current) => ({ ...current, time: event.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="candidate-venue">Venue or meeting platform</Label>
              <Input
                id="candidate-venue"
                value={scheduleForm.venue}
                onChange={(event) => setScheduleForm((current) => ({ ...current, venue: event.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setScheduleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createInterview}>Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(rescheduleItem)} onOpenChange={(open) => !open && setRescheduleItem(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Reschedule Interview</DialogTitle>
            <DialogDescription>Update the date, time, or venue for this conversation.</DialogDescription>
          </DialogHeader>
          {rescheduleItem ? (
            <div className="grid gap-4">
              <div className="rounded-2xl border bg-muted/25 p-4">
                <p className="font-semibold">{rescheduleItem.candidate}</p>
                <p className="text-sm text-muted-foreground">{rescheduleItem.role}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="reschedule-date">Date</Label>
                  <Input
                    id="reschedule-date"
                    type="date"
                    value={rescheduleItem.date}
                    onChange={(event) => setRescheduleItem((current) => ({ ...current, date: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reschedule-time">Time</Label>
                  <Input
                    id="reschedule-time"
                    type="time"
                    value={rescheduleItem.time}
                    onChange={(event) => setRescheduleItem((current) => ({ ...current, time: event.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reschedule-venue">Venue</Label>
                <Input
                  id="reschedule-venue"
                  value={rescheduleItem.venue}
                  onChange={(event) => setRescheduleItem((current) => ({ ...current, venue: event.target.value }))}
                />
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRescheduleItem(null)}>
              Cancel
            </Button>
            <Button onClick={saveReschedule}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
