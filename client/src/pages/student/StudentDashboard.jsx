import { BarChart3, TrendingUp, FileText, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const matchData = [
  { month: 'Jan', matches: 4, applications: 2 },
  { month: 'Feb', matches: 3, applications: 2 },
  { month: 'Mar', matches: 8, applications: 5 },
  { month: 'Apr', matches: 6, applications: 4 },
  { month: 'May', matches: 10, applications: 7 },
]

const recentApplications = [
  { id: 1, company: 'TechCorp', position: 'React Developer', status: 'Interview', date: '2 days ago' },
  { id: 2, company: 'StartupXYZ', position: 'Full Stack Dev', status: 'Applied', date: '1 week ago' },
  { id: 3, company: 'DataFlow', position: 'Backend Engineer', status: 'Rejected', date: '2 weeks ago' },
]

export default function StudentDashboard() {
  const { user } = useAuth()
  
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div>
        <h1 className="text-4xl font-black tracking-tight font-heading">
          Welcome back, <span className="text-primary">{user?.name || 'Alex'}</span>!
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">Here's your career progress overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={CheckCircle2}
          title="Job Matches"
          value="24"
          description="This month"
          trend="+12%"
        />
        <StatCard
          icon={FileText}
          title="Applications"
          value="8"
          description="Active"
          trend="+3"
        />
        <StatCard
          icon={Clock}
          title="Interviews"
          value="2"
          description="Scheduled"
          trend="Next week"
        />
        <StatCard
          icon={TrendingUp}
          title="Profile Strength"
          value="85%"
          description="Excellent"
          trend="+5%"
        />
      </div>

      {/* Charts and Details */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-none shadow-xl glass hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle>Matches & Applications Trend</CardTitle>
            <CardDescription>Last 5 months activity</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={matchData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="matches" fill="#3b82f6" name="Job Matches" />
                <Bar dataKey="applications" fill="#10b981" name="Applications" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl glass hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full">
              <Link to="/student/jobs">Browse Jobs</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/student/assessments">Take Assessment</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/student/profile">Update Profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card className="border-none shadow-xl glass hover:shadow-2xl transition-all duration-300">
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
          <CardDescription>Your latest job applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentApplications.map((app) => (
              <Link
                key={app.id}
                to="/student/applications"
                className="flex items-center justify-between p-4 border rounded-2xl bg-background/50 hover:bg-background transition-all hover:scale-[1.01] hover:shadow-md cursor-pointer block"
              >
                <div className="flex-1">
                  <h4 className="font-bold">{app.position}</h4>
                  <p className="text-sm text-muted-foreground">{app.company}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className="font-bold" variant={
                    app.status === 'Interview' ? 'default' :
                    app.status === 'Applied' ? 'secondary' :
                    'destructive'
                  }>
                    {app.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground font-medium">{app.date}</p>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ icon: Icon, title, value, description, trend }) {
  return (
    <Card className="border-none shadow-xl glass hover:shadow-2xl transition-all duration-300 hover:scale-[1.05] cursor-pointer group">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <Icon className="h-8 w-8 text-primary group-hover:rotate-12 transition-transform" />
          <span className="text-xs text-success font-bold">{trend}</span>
        </div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</h3>
        <p className="text-3xl font-black mt-1">{value}</p>
        <p className="text-xs text-muted-foreground mt-1 font-medium">{description}</p>
      </CardContent>
    </Card>
  )
}
