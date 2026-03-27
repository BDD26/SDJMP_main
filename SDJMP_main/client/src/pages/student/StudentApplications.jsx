import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  MapPin, 
  Calendar, 
  ChevronRight, 
  RefreshCw, 
  Filter, 
  AlertCircle,
  FileText,
  Loader2,
  Briefcase,
  Clock
} from 'lucide-react'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import api from '@/services/api'
import { toast } from 'sonner'

const statusConfig = {
  pending: { label: 'Application Sent', color: 'secondary' },
  reviewed: { label: 'Under Review', color: 'secondary' },
  shortlisted: { label: 'Interview Required', color: 'default' },
  rejected: { label: 'Rejected', color: 'destructive' },
  hired: { label: 'Offer Extended', color: 'default' },
  interview: { label: 'Interview Scheduled', color: 'default' },
  applied: { label: 'Application Sent', color: 'secondary' },
}

export default function StudentApplications() {
  const [applications, setApplications] = useState([])
  const [filteredApplications, setFilteredApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    fetchApplications()
  }, [])

  useEffect(() => {
    const handler = (event) => {
      if (event?.detail?.type === 'application') {
        fetchApplications()
      }
    }

    window.addEventListener('skillmatch:data-changed', handler)
    return () => window.removeEventListener('skillmatch:data-changed', handler)
  }, [])

  useEffect(() => {
    filterAndSortApplications()
  }, [applications, statusFilter, sortBy])

  const fetchApplications = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await api.applications.getMyApplications()
      setApplications(data || [])
    } catch (error) {
      setError('Failed to load applications')
      toast.error('Failed to load applications. Please try again.')
      console.error('Applications error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchApplications()
    setIsRefreshing(false)
    toast.success('Applications refreshed')
  }

  const filterAndSortApplications = () => {
    let filtered = [...applications]
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status?.toLowerCase() === statusFilter)
    }
    
    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt || b.appliedDate || 0) - new Date(a.createdAt || a.appliedDate || 0)
      } else if (sortBy === 'company') {
        const companyA = (a.job?.company || a.company || '').toLowerCase()
        const companyB = (b.job?.company || b.company || '').toLowerCase()
        return companyA.localeCompare(companyB)
      } else if (sortBy === 'status') {
        return (a.status || '').localeCompare(b.status || '')
      }
      return 0
    })
    
    setFilteredApplications(filtered)
  }

  const getStatusStats = () => {
    const stats = {
      total: applications.length,
      pending: applications.filter(app => app.status === 'pending' || app.status === 'applied').length,
      interview: applications.filter(app => app.status === 'interview' || app.status === 'shortlisted').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
      hired: applications.filter(app => app.status === 'hired').length,
    }
    return stats
  }

  const stats = getStatusStats()

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Applications</h1>
          <p className="text-muted-foreground mt-2">Track your job applications</p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-muted-foreground">Pending</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.interview}</div>
          <div className="text-sm text-muted-foreground">Interview</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          <div className="text-sm text-muted-foreground">Rejected</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.hired}</div>
          <div className="text-sm text-muted-foreground">Hired</div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter:</span>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Applications</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="interview">Interview</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="hired">Hired</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date Applied</SelectItem>
            <SelectItem value="company">Company</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground">
            <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin" />
            <div className="text-lg font-medium">Loading applications...</div>
          </div>
        ) : error ? (
          <Card className="p-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <div className="text-lg font-medium mb-2">{error}</div>
            <Button onClick={fetchApplications} variant="outline">Try Again</Button>
          </Card>
        ) : filteredApplications.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <div className="text-lg font-medium mb-2">
              {applications.length === 0 ? 'No applications yet' : 'No applications match your filters'}
            </div>
            <p className="text-muted-foreground mb-4">
              {applications.length === 0 
                ? 'Start exploring job opportunities!' 
                : 'Try adjusting your filters to see more applications.'
              }
            </p>
            {applications.length === 0 && (
              <Button asChild>
                <Link to="/student/jobs">Find Jobs</Link>
              </Button>
            )}
          </Card>
        ) : filteredApplications.map((app) => {
          const jobEntity = app.job || app.jobId || {}
          const jobId = jobEntity._id || jobEntity.id || (typeof app.jobId === 'string' ? app.jobId : null)
          const position = jobEntity.title || app.position || 'Unknown Role'
          const company = jobEntity.company || app.company || 'Unknown Company'
          const location = jobEntity.location || jobEntity.locationType || app.location || 'Remote'
          const conf = statusConfig[app.status?.toLowerCase()] || statusConfig.pending
          const appliedDate = app.createdAt ? new Date(app.createdAt) : (app.appliedDate ? new Date(app.appliedDate) : new Date())
          const daysAgo = Math.floor((new Date() - appliedDate) / (1000 * 60 * 60 * 24))
          
          return (
          <Card key={app._id || app.id} className="hover:shadow-lg transition-all duration-200 hover:scale-[1.01]">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{position}</h3>
                    {app.status === 'interview' && app.interview?.date && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(app.interview.date).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    {company}
                  </div>
                </div>
                <Badge variant={conf.color}>
                  {conf.label}
                </Badge>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {location}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Applied {daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`}
                </div>
              </div>

              {app.notes && (
                <div className="bg-muted/50 p-3 rounded-lg mb-4">
                  <p className="text-sm font-medium">Updates:</p>
                  <p className="text-sm text-muted-foreground">{app.notes}</p>
                </div>
              )}
              
              <Button asChild variant="outline" className="w-full">
                <Link to={jobId ? `/jobs/${jobId}` : '/student/jobs'}>
                  View Job Details
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )
        })}
      </div>
    </div>
  )
}
