import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area
} from 'recharts'
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  Target, 
  Award, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Download,
  Calendar,
  Zap
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const placementData = [
  { month: 'Oct', rate: 65, active: 450 },
  { month: 'Nov', rate: 68, active: 480 },
  { month: 'Dec', rate: 72, active: 520 },
  { month: 'Jan', rate: 75, active: 600 },
  { month: 'Feb', rate: 82, active: 650 },
  { month: 'Mar', rate: 88, active: 720 },
]

const skillData = [
  { name: 'React', demand: 95, availability: 70 },
  { name: 'Python', demand: 88, availability: 82 },
  { name: 'TypeScript', demand: 85, availability: 45 },
  { name: 'System Design', demand: 78, availability: 30 },
  { name: 'AWS', demand: 72, availability: 40 },
]

const userDist = [
  { name: 'Students', value: 2450, color: '#3b82f6' },
  { name: 'Employers', value: 320, color: '#10b981' },
  { name: 'Admins', value: 12, color: '#8b5cf6' },
]

export default function AdminAnalytics() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 transition-colors py-1 px-3 border-none capitalize font-bold">
            Platform Intelligence
          </Badge>
          <h1 className="text-5xl font-black tracking-tight font-heading">Analytics <span className="text-primary">& Insights</span></h1>
          <p className="text-muted-foreground text-lg mt-3 max-w-xl">
            Real-time tracking of placement rates, skill demand gaps, and platform growth metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-12 rounded-xl border-2 font-bold gap-2">
            <Calendar className="h-4 w-4" />
            Last 30 Days
          </Button>
          <Button className="h-12 rounded-xl shadow-lg shadow-primary/20 font-bold gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Placement Rate" 
          value="88.4%" 
          trend="+12%" 
          up={true} 
          icon={<Target className="h-5 w-5" />} 
          color="text-emerald-500" 
          bg="bg-emerald-500/10" 
        />
        <StatsCard 
          title="Total Students" 
          value="2,450" 
          trend="+4.2%" 
          up={true} 
          icon={<Users className="h-5 w-5" />} 
          color="text-blue-500" 
          bg="bg-blue-500/10" 
        />
        <StatsCard 
          title="Active Jobs" 
          value="412" 
          trend="-2.1%" 
          up={false} 
          icon={<Briefcase className="h-5 w-5" />} 
          color="text-amber-500" 
          bg="bg-amber-500/10" 
        />
        <StatsCard 
          title="Avg. Match Score" 
          value="76%" 
          trend="+5.4%" 
          up={true} 
          icon={<Zap className="h-5 w-5" />} 
          color="text-purple-500" 
          bg="bg-purple-500/10" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-xl glass overflow-hidden">
          <CardHeader className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold font-heading">Placement Success Rate</CardTitle>
                <CardDescription>Percentage of active students placed in jobs over time.</CardDescription>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-500 opacity-20" />
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={placementData}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600}} dx={-10} unit="%" />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorRate)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl glass overflow-hidden">
          <CardHeader className="p-8">
            <CardTitle className="text-2xl font-bold font-heading">User Distribution</CardTitle>
            <CardDescription>Breakdown of platform participants.</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8 flex flex-col items-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={userDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {userDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-full space-y-3 mt-4">
              {userDist.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-bold">{item.name}</span>
                  </div>
                  <span className="text-sm font-black">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <Card className="border-none shadow-xl glass overflow-hidden">
          <CardHeader className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold font-heading">Skill Demand Gap</CardTitle>
                <CardDescription>Top requirements vs. Student availability.</CardDescription>
              </div>
              <Award className="h-8 w-8 text-primary opacity-20" />
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={skillData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700}} width={100} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Legend iconType="circle" />
                <Bar dataKey="demand" name="Industry Demand" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={12} />
                <Bar dataKey="availability" name="Student Skills" fill="#E2E8F0" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl glass overflow-hidden bg-primary text-white">
          <CardHeader className="p-8">
            <CardTitle className="text-2xl font-bold font-heading">AI Talent Insights</CardTitle>
            <CardDescription className="text-white/70">Predictive analysis for the next quarter.</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8 space-y-6">
            <div className="p-6 rounded-3xl bg-white/10 border border-white/20">
              <h5 className="font-bold flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4" />
                Rising Demand: TypeScript
              </h5>
              <p className="text-sm text-white/80 leading-relaxed">
                Job postings requiring TypeScript have increased by <b>28%</b> this month. Consider launching a new assessment for this skill.
              </p>
            </div>
            <div className="p-6 rounded-3xl bg-white/10 border border-white/20">
              <h5 className="font-bold flex items-center gap-2 mb-2">
                <Target className="h-4 w-4" />
                Placement Benchmark
              </h5>
              <p className="text-sm text-white/80 leading-relaxed">
                Platform is on track to hit <b>92%</b> placement rate by June. Top-tier employers like TechFlow are increasing their hiring frequency.
              </p>
            </div>
            <Button variant="secondary" className="w-full h-12 rounded-xl font-black text-primary hover:bg-white transition-colors">
              Generate Detailed AI Report
            </Button>
          </CardContent>
        </Card>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .glass {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .dark .glass {
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}} />
    </div>
  )
}

function StatsCard({ title, value, trend, up, icon, color, bg }) {
  return (
    <Card className="border-none shadow-xl glass p-6 group hover:scale-[1.02] transition-transform duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`h-12 w-12 rounded-2xl ${bg} ${color} flex items-center justify-center transition-transform group-hover:rotate-12`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold ${up ? 'text-emerald-500' : 'text-rose-500'}`}>
          {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
        <h4 className="text-3xl font-black mt-1">{value}</h4>
      </div>
    </Card>
  )
}
