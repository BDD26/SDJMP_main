import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Zap, MapPin, DollarSign, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const jobs = [
  {
    id: 1,
    title: 'Senior React Developer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    salary: '$150K-$200K',
    matchScore: 92,
    skills: ['React', 'TypeScript'],
  },
  {
    id: 2,
    title: 'Full Stack Engineer',
    company: 'StartupXYZ',
    location: 'Remote',
    salary: '$120K-$160K',
    matchScore: 85,
    skills: ['JavaScript', 'Python'],
  },
]

export default function StudentJobSearch() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredJobs = jobs.filter(
    (job) =>
      !searchTerm.trim() ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Job Opportunities</h1>
        <p className="text-muted-foreground mt-2">Personalized jobs based on your skills</p>
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
        {filteredJobs.map((job) => (
          <Card key={job.id} className="hover:shadow-lg transition-shadow overflow-hidden group">
            <CardContent className="pt-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg hover:text-primary transition-colors">
                    <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                  </h3>
                  <p className="text-muted-foreground">{job.company}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="font-bold text-lg text-yellow-500">{job.matchScore}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Match</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {job.salary}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {job.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button asChild>
                  <Link to={`/jobs/${job.id}`}>
                    View Match Analysis
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredJobs.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No jobs match your search. Try different keywords.</p>
          </Card>
        )}
      </div>
    </div>
  )
}
