import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Calendar, ChevronRight } from 'lucide-react'
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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      setIsLoading(true)
      const data = await api.applications.getMyApplications()
      setApplications(data || [])
    } catch (error) {
      toast.error('Failed to load applications')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Applications</h1>
        <p className="text-muted-foreground mt-2">Track your job applications</p>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground animate-pulse">Loading applications...</div>
        ) : applications.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">You haven't applied to any jobs yet. Start exploring!</p>
            <Button asChild className="mt-4">
              <Link to="/student/jobs">Find Jobs</Link>
            </Button>
          </Card>
        ) : applications.map((app) => {
          const jobEntity = app.job || app.jobId || {}
          const jobId = jobEntity._id || jobEntity.id || (typeof app.jobId === 'string' ? app.jobId : null)
          const position = jobEntity.title || app.position || 'Unknown Role'
          const company = jobEntity.company || app.company || 'Unknown Company'
          const location = jobEntity.location || jobEntity.locationType || app.location || 'Remote'
          const conf = statusConfig[app.status?.toLowerCase()] || statusConfig.pending

          return (
          <Card key={app._id || app.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{position}</h3>
                  <p className="text-muted-foreground">{company}</p>
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
                  Applied {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : (app.appliedDate || 'Recently')}
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
        )})}
      </div>
    </div>
  )
}
