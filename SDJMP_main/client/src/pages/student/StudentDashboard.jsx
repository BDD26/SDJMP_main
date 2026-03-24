import { BarChart3, TrendingUp, FileText, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useState, useEffect } from 'react'
import { dashboardAPI } from '@/services/api'
import { toast } from 'sonner'


export default function StudentDashboard() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [chartData, setChartData] = useState([])
  const [recentApplications, setRecentApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        const [statsRes, chartRes, applicationsRes] = await Promise.all([
          dashboardAPI.getStats(),
          dashboardAPI.getChartData(),
          dashboardAPI.getRecentApplications()
        ])
        
        setDashboardData(statsRes)
        setChartData(chartRes)
        setRecentApplications(applicationsRes)
      } catch (err) {
        setError('Failed to load dashboard data')
        toast.error('Failed to load dashboard data')
        console.error('Dashboard error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-lg font-medium">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    )
  }
  
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
          value={dashboardData?.jobMatches?.toString() || '0'}
          description="Available positions"
          trend={dashboardData?.jobMatches > 0 ? 'New matches' : 'No matches'}
        />
        <StatCard
          icon={FileText}
          title="Applications"
          value={dashboardData?.activeApplications?.toString() || '0'}
          description="Active"
          trend={dashboardData?.activeApplications > 0 ? `+${dashboardData.activeApplications}` : 'None'}
        />
        <StatCard
          icon={Clock}
          title="Interviews"
          value={dashboardData?.scheduledInterviews?.toString() || '0'}
          description="Scheduled"
          trend={dashboardData?.scheduledInterviews > 0 ? 'Upcoming' : 'None scheduled'}
        />
        <StatCard
          icon={TrendingUp}
          title="Profile Strength"
          value={`${dashboardData?.profileCompletion || 0}%`}
          description={dashboardData?.profileCompletion >= 80 ? 'Excellent' : dashboardData?.profileCompletion >= 60 ? 'Good' : 'Needs work'}
          trend={dashboardData?.profileCompletion > 85 ? '+5%' : dashboardData?.profileCompletion === 85 ? 'Complete' : 'Improve'}
        />
      </div>

      {/* Charts Section - Full Width */}
      <Card className="border-none shadow-xl glass hover:shadow-2xl transition-all duration-300">
        <CardHeader>
          <CardTitle>Activity Overview</CardTitle>
          <CardDescription>Last 6 months of applications and job matches</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="matches" fill="#3b82f6" name="Job Matches" />
                <Bar dataKey="applications" fill="#10b981" name="Applications" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No activity data available yet</p>
                <p className="text-sm">Start applying to jobs to see your activity trends</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Applications */}
      <Card className="border-none shadow-xl glass hover:shadow-2xl transition-all duration-300">
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
          <CardDescription>Your latest job applications</CardDescription>
        </CardHeader>
        <CardContent>
          {recentApplications.length > 0 ? (
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
                      app.status === 'interview' ? 'default' :
                      app.status === 'applied' ? 'secondary' :
                      app.status === 'accepted' ? 'default' :
                      'destructive'
                    }>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </Badge>
                    <p className="text-xs text-muted-foreground font-medium">{app.date}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No applications yet</p>
              <p className="text-sm text-muted-foreground mt-2">Start browsing jobs to submit your first application</p>
              <Button asChild className="mt-4">
                <Link to="/student/jobs">Browse Jobs</Link>
              </Button>
            </div>
          )}
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
