import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Building2, Briefcase, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const chartData = [
  { month: 'Jan', students: 450, employers: 120, jobs: 240 },
  { month: 'Feb', students: 520, employers: 140, jobs: 310 },
  { month: 'Mar', students: 680, employers: 180, jobs: 420 },
  { month: 'Apr', students: 750, employers: 200, jobs: 510 },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Platform overview and statistics</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={Users} title="Total Students" value="2,450" />
        <StatCard icon={Building2} title="Active Employers" value="320" />
        <StatCard icon={Briefcase} title="Job Postings" value="1,240" />
        <StatCard icon={TrendingUp} title="Placements" value="1,850" />
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="students" fill="#3b82f6" />
              <Bar dataKey="employers" fill="#10b981" />
              <Bar dataKey="jobs" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
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
