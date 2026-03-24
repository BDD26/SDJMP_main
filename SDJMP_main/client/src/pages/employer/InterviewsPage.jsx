import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Calendar,
  CheckCircle2,
  Clock3,
  ExternalLink,
  MapPin,
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
import { employerAPI } from '@/services/api'

const statusClasses = {
  scheduled:  'bg-sky-500/10 text-sky-600 border-sky-500/20',
  completed:  'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  cancelled:  'bg-rose-500/10 text-rose-600 border-rose-500/20',
}

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')
  const [rescheduleItem, setRescheduleItem] = useState(null)
  const [saving, setSaving] = useState(false)

  const fetchInterviews = useCallback(() => {
    setLoading(true)
    employerAPI.getInterviews()
      .then((data) => setInterviews(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load interviews'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchInterviews() }, [fetchInterviews])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const filteredInterviews = useMemo(() => {
    return interviews.filter((iv) => {
      const ivDate = iv.date ? new Date(`${iv.date}T00:00:00`) : null
      if (activeFilter === 'upcoming') return ivDate && ivDate >= today && iv.status === 'scheduled'
      if (activeFilter === 'completed') return iv.status === 'completed'
      if (activeFilter === 'cancelled') return iv.status === 'cancelled'
      return true
    })
  }, [activeFilter, interviews])

  const stats = useMemo(() => ({
    scheduled:  interviews.filter((iv) => iv.status === 'scheduled').length,
    completed:  interviews.filter((iv) => iv.status === 'completed').length,
    cancelled:  interviews.filter((iv) => iv.status === 'cancelled').length,
  }), [interviews])

  const updateStatus = async (id, status) => {
    try {
      await employerAPI.updateInterviewStatus(id, status)
      setInterviews((cur) =>
        cur.map((iv) => iv.id === id ? { ...iv, status } : iv),
      )
      toast.success(`Interview marked as ${status}`)
    } catch {
      toast.error(`Failed to update status to ${status}`)
    }
  }

  const saveReschedule = async () => {
    if (!rescheduleItem) return
    setSaving(true)
    try {
      // Reschedule via updateStatus to keep interview object in sync
      await employerAPI.scheduleInterview(rescheduleItem.id, {
        method:   rescheduleItem.method,
        link:     rescheduleItem.link     || '',
        location: rescheduleItem.location || '',
        date:     rescheduleItem.date,
        time:     rescheduleItem.time,
        notes:    rescheduleItem.notes    || '',
      })
      setInterviews((cur) =>
        cur.map((iv) => iv.id === rescheduleItem.id ? { ...iv, ...rescheduleItem } : iv),
      )
      setRescheduleItem(null)
      toast.success('Interview rescheduled')
    } catch {
      toast.error('Failed to reschedule')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12">
      <PageHeader
        title="Interviews"
        description="Coordinate upcoming conversations, keep the team aligned, and maintain a clean interview schedule."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Calendar}    title="Scheduled"     value={stats.scheduled}  description="Upcoming sessions" />
        <StatCard icon={CheckCircle2} title="Completed"    value={stats.completed}  description="Closed loop" />
        <StatCard icon={XCircle}     title="Cancelled"     value={stats.cancelled}  description="Needs follow-up"
          trend={stats.cancelled ? `${stats.cancelled} paused` : 'Stable'} trendUp={false} />
        <StatCard icon={Clock3}      title="Calendar Sync" value="Active"           description="Always enabled" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <div className="space-y-6">
          {/* Filters */}
          <Card className="border-none shadow-xl glass">
            <CardHeader>
              <CardTitle>Quick Filters</CardTitle>
              <CardDescription>Switch between active interview queues.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                ['all',       'All interviews'],
                ['upcoming',  'Upcoming'],
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

          {/* Calendar Sync (product state — always enabled) */}
          <Card className="border-none shadow-xl glass">
            <CardHeader>
              <CardTitle>Calendar Sync</CardTitle>
              <CardDescription>Interviews are automatically reflected in your scheduler.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl border bg-background/50 px-4 py-3">
                <span className="text-sm font-medium">Status</span>
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Active</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interview list */}
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
            {loading ? (
              <div className="py-14 text-center text-muted-foreground text-sm">Loading interviews…</div>
            ) : filteredInterviews.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-background/40 px-6 py-14 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <Calendar className="h-7 w-7 text-primary" />
                </div>
                <p className="text-lg font-semibold">No interviews in this view</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Schedule interviews from the Applicants page and they will appear here.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {filteredInterviews.map((iv) => (
                  <Card key={iv.id} className="border-border/60 bg-background/50 shadow-sm transition-all hover:shadow-lg">
                    <CardContent className="pt-6">
                      <div className="flex h-full flex-col gap-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h3 className="text-xl font-bold">{iv.candidate}</h3>
                            <p className="text-sm text-muted-foreground">{iv.role}</p>
                          </div>
                          <Badge variant="outline" className={statusClasses[iv.status] || statusClasses.scheduled}>
                            {iv.status}
                          </Badge>
                        </div>

                        <div className="grid gap-3 rounded-2xl border bg-muted/25 p-4 text-sm text-muted-foreground">
                          <p className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />{iv.date || '—'}
                          </p>
                          <p className="flex items-center gap-2">
                            <Clock3 className="h-4 w-4 text-primary" />{iv.time || '—'}
                          </p>
                          <p className="flex items-center gap-2">
                            {iv.method === 'online'
                              ? <Video className="h-4 w-4 text-primary" />
                              : <MapPin className="h-4 w-4 text-primary" />}
                            {iv.method === 'online'
                              ? (iv.link || 'Online')
                              : (iv.location || 'In-person')}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-3 border-t pt-4">
                          {iv.method === 'online' && iv.link && iv.status === 'scheduled' ? (
                            <Button variant="outline" asChild>
                              <a href={iv.link} target="_blank" rel="noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />Join
                              </a>
                            </Button>
                          ) : null}
                          {iv.status === 'scheduled' && (
                            <>
                              <Button variant="outline" onClick={() => setRescheduleItem({ ...iv })}>
                                Reschedule
                              </Button>
                              <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" onClick={() => updateStatus(iv.id, 'completed')}>
                                <CheckCircle2 className="mr-2 h-4 w-4" />Complete
                              </Button>
                              <Button variant="ghost" className="text-rose-600 hover:text-rose-700 hover:bg-rose-50" onClick={() => updateStatus(iv.id, 'cancelled')}>
                                <XCircle className="mr-2 h-4 w-4" />Cancel
                              </Button>
                            </>
                          )}
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

      {/* Reschedule Dialog */}
      <Dialog open={Boolean(rescheduleItem)} onOpenChange={(open) => !open && setRescheduleItem(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Reschedule Interview</DialogTitle>
            <DialogDescription>Update the date or time for this conversation.</DialogDescription>
          </DialogHeader>
          {rescheduleItem ? (
            <div className="grid gap-4">
              <div className="rounded-2xl border bg-muted/25 p-4">
                <p className="font-semibold">{rescheduleItem.candidate}</p>
                <p className="text-sm text-muted-foreground">{rescheduleItem.role}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rsc-date">Date</Label>
                  <Input
                    id="rsc-date"
                    type="date"
                    value={rescheduleItem.date}
                    onChange={(e) => setRescheduleItem((cur) => ({ ...cur, date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rsc-time">Time</Label>
                  <Input
                    id="rsc-time"
                    type="time"
                    value={rescheduleItem.time}
                    onChange={(e) => setRescheduleItem((cur) => ({ ...cur, time: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRescheduleItem(null)}>Cancel</Button>
            <Button onClick={saveReschedule} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
