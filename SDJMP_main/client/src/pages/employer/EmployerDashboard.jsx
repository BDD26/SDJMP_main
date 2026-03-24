import { useEffect, useMemo, useState } from 'react'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Briefcase, Users, FileText, TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { PageHeader } from '@/components/shared/PageHeader'
import { GlassCard } from '@/components/shared/GlassCard'
import { StatCard } from '@/components/shared/StatCard'
import { employerAPI } from '@/services/api'
import { useAuth } from '@/context/AuthContext'

const statusMeta = {
  applied:     { label: 'Applied',     className: 'bg-sky-500/10 text-sky-600 border-sky-500/20' },
  shortlisted: { label: 'Shortlisted', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  interview:   { label: 'Interview',   className: 'bg-violet-500/10 text-violet-600 border-violet-500/20' },
  rejected:    { label: 'Rejected',    className: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
  hired:       { label: 'Hired',       className: 'bg-teal-500/10 text-teal-600 border-teal-500/20' },
}

export default function EmployerDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    employerAPI.getStats()
      .then((data) => { if (!cancelled) setStats(data) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const companyName = user?.company?.name || user?.name || 'your company'

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title={`Welcome back${companyName ? `, ${companyName}` : ''}!`}
        description="Here is a live summary of your hiring activity."
      />

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Briefcase}   title="Active Jobs"       value={loading ? '—' : stats?.activeJobs ?? 0}          trend="Published" />
        <StatCard icon={Users}       title="Total Applicants"  value={loading ? '—' : stats?.totalApplicants ?? 0}     trend="In pipeline" />
        <StatCard icon={FileText}    title="New Today"         value={loading ? '—' : stats?.newApplications ?? 0}    trend="Last 24 hrs" />
        <StatCard icon={TrendingUp}  title="Interviews"        value={loading ? '—' : stats?.scheduledInterviews ?? 0} trend="Scheduled" />
      </div>

      {/* Chart */}
      <GlassCard>
        <CardHeader>
          <CardTitle>Application Trends</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
              Loading trend data…
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats?.weeklyTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="applications" stroke="#3b82f6" name="Applications" />
                <Line type="monotone" dataKey="interviews"   stroke="#10b981" name="Interviews" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </GlassCard>

      {/* Recent Applications */}
      <GlassCard>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Loading…</p>
          ) : !stats?.recentApplications?.length ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No applications yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentApplications.map((app) => {
                const meta = statusMeta[app.status] || statusMeta.applied
                return (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-4 border rounded-2xl bg-background/50 hover:bg-background transition-all hover:scale-[1.01] hover:shadow-md"
                  >
                    <div>
                      <h4 className="font-bold">{app.candidate}</h4>
                      <p className="text-sm text-muted-foreground">{app.position}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className={meta.className}>{meta.label}</Badge>
                      <p className="text-xs text-muted-foreground font-medium">{app.date}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </GlassCard>
    </div>
  )
}
