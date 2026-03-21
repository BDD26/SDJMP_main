import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Calendar, ChevronRight } from 'lucide-react'

const applications = [
  {
    id: 1,
    jobId: 1,
    position: 'Senior React Developer',
    company: 'TechCorp Solutions',
    location: 'San Francisco, CA',
    status: 'interview',
    appliedDate: '5 days ago',
    nextStep: 'Technical Interview - March 25',
  },
  {
    id: 2,
    jobId: 2,
    position: 'Full Stack Developer',
    company: 'StartupXYZ',
    location: 'Remote',
    status: 'applied',
    appliedDate: '1 week ago',
    nextStep: 'Awaiting HR review',
  },
  {
    id: 3,
    jobId: 3,
    position: 'Backend Engineer',
    company: 'DataFlow Inc',
    location: 'New York, NY',
    status: 'rejected',
    appliedDate: '2 weeks ago',
    nextStep: 'Application rejected',
  },
]

const statusConfig = {
  interview: { label: 'Interview Scheduled', color: 'default' },
  applied: { label: 'Application Sent', color: 'secondary' },
  rejected: { label: 'Rejected', color: 'destructive' },
}

export default function StudentApplications() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Applications</h1>
        <p className="text-muted-foreground mt-2">Track your job applications</p>
      </div>

      <div className="grid gap-4">
        {applications.map((app) => (
          <Card key={app.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{app.position}</h3>
                  <p className="text-muted-foreground">{app.company}</p>
                </div>
                <Badge variant={statusConfig[app.status].color}>
                  {statusConfig[app.status].label}
                </Badge>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {app.location}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Applied {app.appliedDate}
                </div>
              </div>

              <div className="bg-muted/50 p-3 rounded-lg mb-4">
                <p className="text-sm font-medium">Next Step:</p>
                <p className="text-sm text-muted-foreground">{app.nextStep}</p>
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link to={`/jobs/${app.jobId}`}>
                  View Job Details
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
