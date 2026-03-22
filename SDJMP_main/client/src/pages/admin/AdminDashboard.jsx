import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Building2, Briefcase, TrendingUp } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { GlassCard } from '@/components/shared/GlassCard'
import { StatCard } from '@/components/shared/StatCard'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const chartData = [
  { month: 'Jan', students: 450, employers: 120, jobs: 240 },
  { month: 'Feb', students: 520, employers: 140, jobs: 310 },
  { month: 'Mar', students: 680, employers: 180, jobs: 420 },
  { month: 'Apr', students: 750, employers: 200, jobs: 510 },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Admin Dashboard"
        description="Platform overview and statistics"
      />

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} title="Total Students" value="2,450" trend="+15%" />
        <StatCard icon={Building2} title="Active Employers" value="320" trend="+5%" />
        <StatCard icon={Briefcase} title="Job Postings" value="1,240" trend="+24" />
        <StatCard icon={TrendingUp} title="Placements" value="1,850" trend="On track" />
      </div>

      {/* Chart */}
      <GlassCard>
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
      </GlassCard>
    </div>
  )
}


