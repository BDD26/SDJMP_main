import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Briefcase, Users, FileText, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, TechCorp!</h1>
        <p className="text-muted-foreground mt-2">Manage your job postings and candidates</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={Briefcase} title="Active Jobs" value="5" />
        <StatCard icon={Users} title="Total Applicants" value="127" />
        <StatCard icon={FileText} title="New Applications" value="8" />
        <StatCard icon={TrendingUp} title="Interviews" value="3" />
      </div>

      {/* Chart and Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
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
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full">
              <Link to="/employer/jobs">Post New Job</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/employer/applicants">Review Applicants</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/employer/company">Company Profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentApplications.map((app) => (
              <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">{app.candidate}</h4>
                  <p className="text-sm text-muted-foreground">{app.position}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary">{app.status}</Badge>
                  <p className="text-xs text-muted-foreground">{app.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ icon: Icon, title, value }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <Icon className="h-8 w-8 text-primary mb-4" />
        <h3 className="text-sm text-muted-foreground">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}
