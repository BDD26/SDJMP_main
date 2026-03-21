import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Users,
  Eye,
  Edit2,
  Plus,
  Briefcase,
  Clock,
  MoreVertical,
  Target,
  MapPin,
  Banknote,
  Sparkles,
  Trash2,
  AlertCircle,
  Search
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'

const INITIAL_JOBS = [
  {
    id: 1,
    title: 'Senior Frontend Developer',
    type: 'Full-time',
    location: 'Remote',
    salary: '₹15L - ₹25L L.P.A',
    status: 'active',
    applicants: 42,
    interviews: 5,
    matchConfidence: 89,
    posted: '2 days ago'
  },
  {
    id: 2,
    title: 'Product Designer',
    type: 'Full-time',
    location: 'Hybrid',
    salary: '₹12L - ₹20L L.P.A',
    status: 'active',
    applicants: 28,
    interviews: 3,
    matchConfidence: 76,
    posted: '1 week ago'
  },
  {
    id: 3,
    title: 'Backend Engineer',
    type: 'Full-time',
    location: 'On-site',
    salary: '₹18L - ₹30L L.P.A',
    status: 'draft',
    applicants: 0,
    interviews: 0,
    matchConfidence: 92,
    posted: '3 days ago'
  }
]

export default function EmployerJobManagement() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [jobList, setJobList] = useState(INITIAL_JOBS)
  const [deleteId, setDeleteId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const handleDelete = (id) => {
    setJobList(jobList.filter(j => j.id !== id))
    setDeleteId(null)
    toast.success('Job posting deleted permanently')
  }

  const handleStatusChange = (id, newStatus) => {
    setJobList(jobList.map(job => 
      job.id === id ? { ...job, status: newStatus } : job
    ))
    toast.success(`Job status changed to ${newStatus}`)
  }

  const filteredJobs = jobList.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const activeJobs = jobList.filter(job => job.status === 'active').length
  const draftJobs = jobList.filter(job => job.status === 'draft').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/20">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10 lg:space-y-12 animate-fade-in pb-12 px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header Section */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 xl:gap-8">
          <div className="space-y-3 xl:space-y-4">
            <div className="flex items-center gap-3 xl:gap-4">
              <div className="h-1 w-8 xl:w-12 bg-gradient-to-r from-primary to-primary/60 rounded-full" />
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight font-heading leading-tight">
                Manage <span className="text-primary italic bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Jobs</span>
              </h1>
            </div>
            <p className="text-muted-foreground font-medium flex items-center gap-3 text-sm sm:text-base lg:text-lg">
              <div className="h-px bg-gradient-to-r from-transparent via-muted-foreground/30 to-transparent flex-1 max-w-xs" />
              Viewing talent pipeline for 
              <span className="text-foreground font-bold px-3 py-1.5 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg text-sm sm:text-base lg:text-lg shadow-sm shadow-primary/5">
                {user?.company?.name || 'Acme Corp'}
              </span>
              <div className="h-px bg-gradient-to-r from-muted-foreground/30 via-transparent to-transparent flex-1 max-w-xs" />
            </p>
          </div>
          <Button 
            onClick={() => navigate('/employer/jobs/new')} 
            className="h-14 sm:h-16 lg:h-18 xl:h-20 px-8 sm:px-10 lg:px-12 xl:px-14 rounded-2xl sm:rounded-3xl shadow-2xl shadow-primary/30 hover:shadow-primary/40 font-black text-base sm:text-lg lg:text-xl xl:text-2xl gap-3 sm:gap-4 hover:scale-105 transition-all duration-300 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary border border-primary/20"
          >
            <Plus className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8" />
            <span className="hidden sm:inline">Post New Job</span>
            <span className="sm:hidden">Add Job</span>
          </Button>
        </div>

        {/* Stats Quick View */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {[
            { label: 'Active Postings', value: activeJobs, icon: Briefcase, color: 'text-blue-500', bgGradient: 'from-blue-500/10 to-blue-600/5' },
            { label: 'Draft Posts', value: draftJobs, icon: Target, color: 'text-amber-500', bgGradient: 'from-amber-500/10 to-amber-600/5' },
            { label: 'Total Applicants', value: jobList.reduce((sum, job) => sum + job.applicants, 0), icon: Users, color: 'text-emerald-500', bgGradient: 'from-emerald-500/10 to-emerald-600/5' },
          ].map((stat, i) => (
            <Card key={i} className="border-none shadow-2xl glass group hover:scale-[1.02] sm:hover:scale-[1.05] lg:hover:scale-[1.08] transition-all duration-700 rounded-2xl sm:rounded-3xl lg:rounded-[3.5rem] overflow-hidden bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-800/80 dark:to-slate-800/40 backdrop-blur-xl border border-white/20 dark:border-white/10">
              <CardContent className="p-6 sm:p-8 lg:p-10 flex items-center gap-6 sm:gap-8">
                <div className={"relative"}>
                  <div className={"absolute inset-0 bg-gradient-to-br " + stat.bgGradient + " rounded-2xl sm:rounded-3xl lg:rounded-4xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity"} />
                  <div className={"relative h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 rounded-2xl sm:rounded-3xl lg:rounded-4xl bg-gradient-to-br " + stat.bgGradient + " flex items-center justify-center shadow-inner border border-white/20 dark:border-white/10"}>
                    <stat.icon className={"h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 " + stat.color + " group-hover:rotate-12 transition-transform duration-500 drop-shadow-sm"} />
                  </div>
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="text-[10px] sm:text-[12px] lg:text-[14px] font-black uppercase tracking-widest text-muted-foreground/80 font-mono">{stat.label}</p>
                  <p className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-transparent">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Jobs List */}
        <div className="space-y-8">
          {/* Search and Filter Section */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div className="flex-1 max-w-lg xl:max-w-xl">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl sm:rounded-3xl lg:rounded-4xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                <input
                  type="text"
                  placeholder="Search jobs by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="relative w-full h-12 sm:h-14 lg:h-16 pl-12 pr-6 rounded-2xl sm:rounded-3xl lg:rounded-4xl border-2 border-border bg-background/80 backdrop-blur-sm text-sm sm:text-base lg:text-lg placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm hover:shadow-md transition-all duration-300"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-muted/50 to-muted/30 p-1.5 rounded-2xl sm:rounded-3xl border border-border/50 backdrop-blur-sm shadow-sm">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setStatusFilter('all')}
                className={`rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm lg:text-base px-4 py-2.5 h-auto transition-all duration-300 ${
                  statusFilter === 'all' 
                    ? 'bg-background shadow-lg shadow-primary/20 text-foreground border border-primary/20' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                All ({jobList.length})
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setStatusFilter('active')}
                className={`rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm lg:text-base px-4 py-2.5 h-auto transition-all duration-300 ${
                  statusFilter === 'active' 
                    ? 'bg-background shadow-lg shadow-emerald-500/20 text-emerald-600 border border-emerald-500/20' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                Active ({activeJobs})
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setStatusFilter('draft')}
                className={`rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm lg:text-base px-4 py-2.5 h-auto transition-all duration-300 ${
                  statusFilter === 'draft' 
                    ? 'bg-background shadow-lg shadow-amber-500/20 text-amber-600 border border-amber-500/20' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                Drafts ({draftJobs})
              </Button>
            </div>
          </div>

          {/* Jobs Grid */}
          <div className="space-y-8">
            {filteredJobs.length === 0 ? (
              <Card className="border-none shadow-2xl glass rounded-3xl p-8 sm:p-12 lg:p-16 text-center bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-800/80 dark:to-slate-800/40 backdrop-blur-xl border border-white/20 dark:border-white/10">
                <div className="space-y-6">
                  <div className="h-24 w-24 sm:h-28 sm:w-28 lg:h-32 lg:w-32 rounded-full bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center mx-auto shadow-inner border border-white/20 dark:border-white/10">
                    <Briefcase className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 text-muted-foreground/60" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">No jobs found</h3>
                    <p className="text-muted-foreground text-base sm:text-lg lg:text-xl max-w-md mx-auto">
                      {searchQuery ? 'Try adjusting your search terms' : 'Get started by posting your first job'}
                    </p>
                  </div>
                  {!searchQuery && (
                    <Button 
                      onClick={() => navigate('/employer/jobs/new')} 
                      className="h-14 sm:h-16 lg:h-18 px-8 sm:px-12 lg:px-16 rounded-2xl sm:rounded-3xl font-black text-base sm:text-lg lg:text-xl shadow-xl shadow-primary/30 hover:shadow-primary/40 transition-all duration-300 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary border border-primary/20"
                    >
                      <Plus className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 mr-2 sm:mr-3" />
                      Post Your First Job
                    </Button>
                  )}
                </div>
              </Card>
            ) : (
              filteredJobs.map((job) => (
                <Card key={job.id} className="border-none shadow-2xl glass group hover:shadow-primary/10 transition-all duration-700 rounded-3xl sm:rounded-4xl lg:rounded-[3.5rem] overflow-hidden bg-gradient-to-br from-white/90 to-white/60 dark:from-slate-800/90 dark:to-slate-800/60 backdrop-blur-xl border border-white/30 dark:border-white/15 hover:scale-[1.02] sm:hover:scale-[1.03] hover:border-primary/20 sm:hover:border-primary/30">
                  <CardContent className="p-0">
                    <div className="flex flex-col lg:flex-row">
                      {/* Left Column: Job Content */}
                      <div className="flex-1 p-6 sm:p-8 lg:p-10 xl:p-12 space-y-6 sm:space-y-8 lg:space-y-10">
                        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6 sm:gap-8 lg:gap-10">
                          <div className="space-y-3 sm:space-y-4 flex-1 min-w-0">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">
                              <h3 
                                className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black font-heading leading-tight group-hover:text-primary transition-colors duration-300 cursor-pointer truncate bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-transparent"
                                onClick={() => navigate(`/employer/jobs/${job.id}/edit`)}
                              >
                                {job.title}
                              </h3>
                              <Badge className={"px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-[12px] lg:text-[14px] uppercase font-black tracking-widest border-none self-start shadow-sm " + (
                                job.status === 'active' 
                                  ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 text-emerald-600 border-emerald-500/20' 
                                  : 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-600 border-amber-500/20'
                              )}>
                                {job.status}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-muted-foreground font-bold text-sm sm:text-base lg:text-lg">
                              <span className="flex items-center gap-2 hover:text-foreground transition-colors duration-300">
                                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-primary" /> 
                                <span className="truncate">{job.location}</span>
                              </span>
                              <span className="hidden sm:inline-flex h-1 w-1 rounded-full bg-muted-foreground/30" />
                              <span className="flex items-center gap-2 hover:text-foreground transition-colors duration-300">
                                <Banknote className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-primary" /> 
                                <span className="truncate">{job.salary}</span>
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-4 sm:gap-6">
                            <div className="text-center bg-gradient-to-br from-white/60 to-white/20 dark:from-slate-700/60 dark:to-slate-700/20 p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl lg:rounded-4xl border border-white/30 dark:border-white/10 backdrop-blur-sm shadow-lg group-hover:shadow-xl transition-all duration-300 w-24 sm:w-28 lg:w-32">
                              <p className="text-[10px] sm:text-[12px] lg:text-[14px] font-black uppercase tracking-widest text-muted-foreground/80 font-mono mb-2">Applicants</p>
                              <p className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">{job.applicants}</p>
                            </div>
                            <div className="text-center bg-gradient-to-br from-white/60 to-white/20 dark:from-slate-700/60 dark:to-slate-700/20 p-4 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl lg:rounded-4xl border border-white/30 dark:border-white/10 backdrop-blur-sm shadow-lg group-hover:shadow-xl transition-all duration-300 w-24 sm:w-28 lg:w-32">
                              <p className="text-[10px] sm:text-[12px] lg:text-[14px] font-black uppercase tracking-widest text-muted-foreground/80 font-mono mb-2">Interviews</p>
                              <p className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-br from-purple-500 to-purple-600 bg-clip-text text-transparent">{job.interviews}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3 sm:gap-4 lg:gap-6 pt-6">
                          <Button 
                            asChild
                            className="h-12 sm:h-14 lg:h-16 px-3 sm:px-6 lg:px-8 rounded-2xl sm:rounded-3xl font-black gap-2 sm:gap-3 lg:gap-4 shadow-xl shadow-primary/30 hover:shadow-primary/40 transition-all duration-300 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary border border-primary/20 text-xs sm:text-sm lg:text-base flex-shrink-0"
                          >
                            <Link to={`/employer/jobs/${job.id}/applicants`}>
                              <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                              <span className="hidden sm:inline">Manage Applicants</span>
                              <span className="sm:hidden">Applicants</span>
                            </Link>
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => navigate(`/employer/jobs/${job.id}/edit`)}
                            className="h-12 sm:h-14 lg:h-16 px-3 sm:px-6 lg:px-8 rounded-2xl sm:rounded-3xl font-black gap-2 sm:gap-3 lg:gap-4 border-2 hover:bg-muted/50 transition-all duration-300 text-xs sm:text-sm lg:text-lg bg-gradient-to-br from-white/60 to-white/20 dark:from-slate-700/60 dark:to-slate-700/20 backdrop-blur-sm border-white/30 dark:border-white/10 flex-shrink-0"
                          >
                            <Edit2 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                            <span className="hidden sm:inline">Edit details</span>
                            <span className="sm:hidden">Edit</span>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-12 sm:h-14 lg:h-16 w-12 sm:w-14 lg:w-16 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white/60 to-white/20 dark:from-slate-700/60 dark:to-slate-700/20 hover:from-white/80 hover:to-white/40 dark:hover:from-slate-700/80 dark:hover:to-slate-700/40 backdrop-blur-sm border border-white/30 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 flex-shrink-0">
                                <MoreVertical className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-2xl sm:rounded-3xl border-none shadow-2xl glass p-2 min-w-[180px] sm:min-w-[200px] bg-gradient-to-br from-white/90 to-white/60 dark:from-slate-800/90 dark:to-slate-800/60 backdrop-blur-xl border border-white/30 dark:border-white/15">
                              <DropdownMenuItem 
                                className="p-3 sm:p-4 font-bold cursor-pointer rounded-xl sm:rounded-2xl text-sm sm:text-base hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all duration-300" 
                                onClick={() => handleStatusChange(job.id, job.status === 'active' ? 'draft' : 'active')}
                              >
                                {job.status === 'active' ? (
                                  <>
                                    <Eye className="h-4 w-4 sm:h-5 sm:w-5 mr-3 text-amber-500" />
                                    <span>Set to Draft</span>
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-4 w-4 sm:h-5 sm:w-5 mr-3 text-emerald-500" />
                                    <span>Set to Active</span>
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-white/20 dark:bg-white/10" />
                              <DropdownMenuItem 
                                className="p-3 sm:p-4 font-bold cursor-pointer text-destructive focus:text-destructive rounded-xl sm:rounded-2xl text-sm sm:text-base hover:bg-destructive/10 transition-all duration-300"
                                onClick={() => setDeleteId(job.id)}
                              >
                                <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 mr-3" />
                                <span>Delete Posting</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Right Column: AI Insights */}
                      <div className="bg-gradient-to-br from-primary/5 to-primary/2 lg:w-72 xl:w-80 p-6 sm:p-8 lg:p-10 xl:p-12 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-white/20 dark:border-white/10">
                        <div className="space-y-6 sm:space-y-8">
                          <div className="space-y-3">
                            <p className="text-[10px] sm:text-[12px] lg:text-[14px] font-black uppercase tracking-widest text-muted-foreground/80 font-mono">Match Accuracy</p>
                            <div className="flex items-end gap-3">
                              <span className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">{job.matchConfidence}%</span>
                              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-amber-500 mb-1" />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <p className="text-[10px] sm:text-[12px] lg:text-[14px] font-black uppercase tracking-widest text-muted-foreground/80 font-mono">Posted Date</p>
                            <div className="flex items-center gap-3 font-bold text-sm sm:text-base lg:text-lg">
                              <Clock className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-primary" />
                              <span>{job.posted}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent className="rounded-2xl sm:rounded-3xl lg:rounded-4xl glass border-none shadow-2xl p-8 sm:p-10 lg:p-12 max-w-md sm:max-w-lg bg-gradient-to-br from-white/90 to-white/60 dark:from-slate-800/90 dark:to-slate-800/60 backdrop-blur-xl border border-white/30 dark:border-white/15">
            <AlertDialogHeader className="space-y-6">
              <div className="h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28 rounded-full bg-gradient-to-br from-destructive/10 to-destructive/5 flex items-center justify-center mx-auto shadow-inner border border-destructive/20">
                <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 text-destructive" />
              </div>
              <AlertDialogTitle className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading leading-tight text-center bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-transparent">
                Delete <span className="text-destructive uppercase bg-gradient-to-br from-destructive to-destructive/80 bg-clip-text text-transparent">Permanent?</span>
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base sm:text-lg lg:text-xl font-medium leading-relaxed text-center text-muted-foreground max-w-sm mx-auto">
                You are about to delete <b className="text-foreground">{jobList.find(j => j.id === deleteId)?.title}</b>. This will wipe all associated applicant data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-4 sm:gap-6 pt-8 sm:pt-10">
              <AlertDialogCancel className="rounded-2xl sm:rounded-3xl font-bold h-12 sm:h-14 lg:h-16 px-6 sm:px-8 lg:px-10 border-2 text-sm sm:text-base lg:text-lg bg-gradient-to-br from-white/60 to-white/20 dark:from-slate-700/60 dark:to-slate-700/20 backdrop-blur-sm border-white/30 dark:border-white/10 hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all duration-300">
                Keep Posting
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => handleDelete(deleteId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-2xl sm:rounded-3xl font-black h-12 sm:h-14 lg:h-16 px-6 sm:px-8 lg:px-10 shadow-xl shadow-destructive/20 hover:shadow-destructive/30 transition-all duration-300 text-sm sm:text-base lg:text-lg bg-gradient-to-r from-destructive to-destructive/90 hover:from-destructive/90 hover:to-destructive border border-destructive/20"
              >
                Confirm Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      <style dangerouslySetInnerHTML={{ __html: `
        .glass {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.4);
        }
        .dark .glass {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}} />
      </div>
    </div>
  )
}

