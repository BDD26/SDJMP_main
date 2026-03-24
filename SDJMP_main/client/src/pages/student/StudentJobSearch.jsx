import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Zap, MapPin, DollarSign, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import api from '@/services/api'
import { toast } from 'sonner'

export default function StudentJobSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const [jobs, setJobs] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    try {
      setIsLoading(true)
      const data = await api.jobs.getStudentMatches()
      setJobs(data || [])
    } catch (error) {
      toast.error('Failed to load job matches')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredJobs = jobs.filter(
    (job) =>
      !searchTerm.trim() ||
      job.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.job?.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.job?.skills?.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) || // Fallback if structure varies
      job.company?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Job Opportunities</h1>
        <p className="text-muted-foreground mt-2">Jobs matched to your profile and preferences</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="searchJobs"
          name="searchJobs"
          type="search"
          autoComplete="off"
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground animate-pulse">Finding matches...</div>
        ) : filteredJobs.map((job) => {
          const displayJob = job || {}
          const matchScore = job.matchScore || 0
          const jobId = displayJob.id || displayJob._id
          return (
          <Card key={jobId} className="hover:shadow-lg transition-shadow overflow-hidden group">
            <CardContent className="pt-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg hover:text-primary transition-colors">
                    <Link to={jobId ? `/jobs/${jobId}` : '/student/jobs'}>{displayJob.title}</Link>
                  </h3>
                  <p className="text-muted-foreground">{displayJob.company}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="font-bold text-lg text-yellow-500">{matchScore}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Match</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {displayJob.location || displayJob.locationType || 'Remote'}
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {displayJob.salary?.min ? `$${displayJob.salary.min.toLocaleString()} - $${displayJob.salary.max?.toLocaleString()}` : (displayJob.salary || 'Not specified')}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {(displayJob.skills || []).map((skill) => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button asChild>
                  <Link to={jobId ? `/jobs/${jobId}` : '/student/jobs'}>
                    View Details
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )})}
        {filteredJobs.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No jobs match your search. Try different keywords.</p>
          </Card>
        )}
      </div>
    </div>
  )
}


