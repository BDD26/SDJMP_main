import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Briefcase, Users, FileText, TrendingUp, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { PageHeader } from '@/components/shared/PageHeader'
import { GlassCard } from '@/components/shared/GlassCard'
import { StatCard } from '@/components/shared/StatCard'

const chartData = [
  { week: 'Week 1', applications: 12, interviews: 3 },
  { week: 'Week 2', applications: 18, interviews: 5 },
  { week: 'Week 3', applications: 25, interviews: 8 },
  { week: 'Week 4', applications: 22, interviews: 6 },
]

const recentApplications = [
  { id: 1, candidate: 'John Doe', position: 'React Dev', status: 'New', date: 'Today' },
  { id: 2, candidate: 'Jane Smith', position: 'React Dev', status: 'Reviewed', date: 'Yesterday' },
]

export default function EmployerDashboard() {
  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader 
        title="Welcome back, TechCorp!" 
        description="Manage your job postings and candidates" 
      />

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Briefcase} title="Active Jobs" value="5" trend="+2%" />
        <StatCard icon={Users} title="Total Applicants" value="127" trend="+12" />
        <StatCard icon={FileText} title="New Applications" value="8" trend="Today" />
        <StatCard icon={TrendingUp} title="Interviews" value="3" trend="This week" />
      </div>

      {/* Chart and Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Application Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="applications" stroke="#3b82f6" />
                <Line type="monotone" dataKey="interviews" stroke="#10b981" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </GlassCard>

        <GlassCard>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-between group">
              <Link to="/employer/jobs">Post New Job <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between group">
              <Link to="/employer/applicants">Review Applicants <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-between group">
              <Link to="/employer/company">Company Profile <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></Link>
            </Button>
          </CardContent>
        </GlassCard>
      </div>

      {/* Recent Applications */}
      <GlassCard>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentApplications.map((app) => (
              <div key={app.id} className="flex items-center justify-between p-4 border rounded-2xl bg-background/50 hover:bg-background transition-all hover:scale-[1.01] hover:shadow-md cursor-pointer block">
                <div>
                  <h4 className="font-bold">{app.candidate}</h4>
                  <p className="text-sm text-muted-foreground">{app.position}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="font-bold">{app.status}</Badge>
                  <p className="text-xs text-muted-foreground font-medium">{app.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </GlassCard>
    </div>
  )
}


