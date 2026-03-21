import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Filter,
  Building2,
  ChevronRight,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

const mockJobs = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'TechCorp Solutions',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salary: '$120k - $160k',
    description: 'We are looking for a skilled Frontend Developer to join our team and build amazing user experiences using React, TypeScript, and modern web technologies.',
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
    posted: '2 days ago',
    logo: 'TC',
  },
  {
    id: '2',
    title: 'Full Stack Engineer',
    company: 'InnovateTech',
    location: 'New York, NY',
    type: 'Full-time',
    salary: '$130k - $170k',
    description: 'Join our dynamic team to build scalable web applications using modern technologies and cloud infrastructure.',
    skills: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
    posted: '3 days ago',
    logo: 'IT',
  },
  {
    id: '3',
    title: 'React Developer Intern',
    company: 'StartupHub',
    location: 'Austin, TX',
    type: 'Internship',
    salary: '$30/hour',
    description: 'Great opportunity for students to learn and grow in a fast-paced startup environment building real products.',
    skills: ['React', 'JavaScript', 'CSS', 'Git'],
    posted: '1 day ago',
    logo: 'SH',
  },
  {
    id: '4',
    title: 'Backend Engineer',
    company: 'DataDriven Co',
    location: 'Remote',
    type: 'Full-time',
    salary: '$100k - $140k',
    description: 'Build robust APIs and microservices to power our data analytics platform serving millions of users.',
    skills: ['Python', 'FastAPI', 'PostgreSQL', 'Redis'],
    posted: '5 days ago',
    logo: 'DD',
  },
  {
    id: '5',
    title: 'DevOps Engineer',
    company: 'CloudScale Systems',
    location: 'Seattle, WA',
    type: 'Contract',
    salary: '$80/hour',
    description: 'Manage and optimize our cloud infrastructure, CI/CD pipelines, and monitoring systems.',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform'],
    posted: '1 week ago',
    logo: 'CS',
  },
  {
    id: '6',
    title: 'Mobile Developer',
    company: 'AppWorks',
    location: 'Los Angeles, CA',
    type: 'Full-time',
    salary: '$110k - $150k',
    description: 'Create beautiful and performant mobile applications for iOS and Android platforms.',
    skills: ['React Native', 'TypeScript', 'iOS', 'Android'],
    posted: '4 days ago',
    logo: 'AW',
  },
]

const jobTypes = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Remote']
const experienceLevels = ['Entry Level', 'Mid Level', 'Senior Level', 'Lead/Manager']
const locations = ['Remote', 'San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Los Angeles, CA']

export default function JobBrowserPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [locationFilter, setLocationFilter] = useState('all')
  const [selectedTypes, setSelectedTypes] = useState([])
  const [selectedExperience, setSelectedExperience] = useState([])
  const [showFilters, setShowFilters] = useState(false)

  const filteredJobs = mockJobs.filter((job) => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesLocation = locationFilter === 'all' || job.location.includes(locationFilter)
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(job.type)
    
    return matchesSearch && matchesLocation && matchesType
  })

  const toggleType = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const clearFilters = () => {
    setSearchQuery('')
    setLocationFilter('all')
    setSelectedTypes([])
    setSelectedExperience([])
  }

  const activeFiltersCount = selectedTypes.length + selectedExperience.length + (locationFilter !== 'all' ? 1 : 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Search Header */}
      <section className="bg-muted/30 border-b py-8 animate-fade-up delay-100">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-center">Find Your Perfect Job</h1>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="searchQuery"
                  name="searchQuery"
                  type="search"
                  autoComplete="off"
                  placeholder="Job title, skills, or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative flex-1 md:max-w-[200px]">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button className="md:hidden" variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge className="ml-2" variant="secondary">{activeFiltersCount}</Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container px-4 md:px-6 py-8 animate-fade-up delay-200">
        <div className="flex gap-8">
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden md:block w-64 shrink-0 animate-fade-up delay-300">
            <div className="sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Filters</h2>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear all
                  </Button>
                )}
              </div>

              <Card>
                <CardContent className="p-4 space-y-6">
                  {/* Job Type */}
                  <div>
                    <h3 className="font-medium mb-3">Job Type</h3>
                    <div className="space-y-2">
                      {jobTypes.map((type) => (
                        <div key={type} className="flex items-center gap-2">
                          <Checkbox
                            id={type}
                            checked={selectedTypes.includes(type)}
                            onCheckedChange={() => toggleType(type)}
                          />
                          <Label htmlFor={type} className="text-sm cursor-pointer">
                            {type}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Experience Level */}
                  <div>
                    <h3 className="font-medium mb-3">Experience Level</h3>
                    <div className="space-y-2">
                      {experienceLevels.map((level) => (
                        <div key={level} className="flex items-center gap-2">
                          <Checkbox
                            id={level}
                            checked={selectedExperience.includes(level)}
                            onCheckedChange={() => {
                              setSelectedExperience((prev) =>
                                prev.includes(level)
                                  ? prev.filter((l) => l !== level)
                                  : [...prev, level]
                              )
                            }}
                          />
                          <Label htmlFor={level} className="text-sm cursor-pointer">
                            {level}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Mobile Filters Modal */}
          {showFilters && (
            <div className="fixed inset-0 z-50 bg-background md:hidden">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="font-semibold">Filters</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="p-4 space-y-6 overflow-auto max-h-[calc(100vh-140px)]">
                {/* Job Type */}
                <div>
                  <h3 className="font-medium mb-3">Job Type</h3>
                  <div className="space-y-2">
                    {jobTypes.map((type) => (
                      <div key={type} className="flex items-center gap-2">
                        <Checkbox
                          id={`mobile-${type}`}
                          checked={selectedTypes.includes(type)}
                          onCheckedChange={() => toggleType(type)}
                        />
                        <Label htmlFor={`mobile-${type}`} className="text-sm cursor-pointer">
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Experience Level */}
                <div>
                  <h3 className="font-medium mb-3">Experience Level</h3>
                  <div className="space-y-2">
                    {experienceLevels.map((level) => (
                      <div key={level} className="flex items-center gap-2">
                        <Checkbox
                          id={`mobile-${level}`}
                          checked={selectedExperience.includes(level)}
                          onCheckedChange={() => {
                            setSelectedExperience((prev) =>
                              prev.includes(level)
                                ? prev.filter((l) => l !== level)
                                : [...prev, level]
                            )
                          }}
                        />
                        <Label htmlFor={`mobile-${level}`} className="text-sm cursor-pointer">
                          {level}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1" onClick={clearFilters}>
                    Clear
                  </Button>
                  <Button className="flex-1" onClick={() => setShowFilters(false)}>
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Job Listings */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">{filteredJobs.length}</span> jobs found
              </p>
              <Select defaultValue="recent">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="relevant">Most Relevant</SelectItem>
                  <SelectItem value="salary-high">Salary: High to Low</SelectItem>
                  <SelectItem value="salary-low">Salary: Low to High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {filteredJobs.map((job, i) => (
                <Card key={job.id} className={`hover:shadow-md transition-shadow animate-fade-up delay-${Math.min((i % 10 + 3) * 100, 1000)}`}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Company Logo */}
                      <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                        {job.logo}
                      </div>

                      {/* Job Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-lg hover:text-primary transition-colors">
                              <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                            </h3>
                            <div className="flex items-center gap-2 text-muted-foreground mt-1">
                              <Building2 className="h-4 w-4" />
                              <span>{job.company}</span>
                            </div>
                          </div>
                          <Badge variant={job.type === 'Full-time' ? 'default' : 'secondary'}>
                            {job.type}
                          </Badge>
                        </div>

                        <p className="text-muted-foreground text-sm mt-3 line-clamp-2">
                          {job.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {job.salary}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {job.posted}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-4">
                          {job.skills.map((skill) => (
                            <Badge key={skill} variant="outline">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end mt-4 pt-4 border-t">
                      <Button asChild>
                        <Link to={`/jobs/${job.id}`}>
                          View Details
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredJobs.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No jobs found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your search or filters to find more opportunities.
                    </p>
                    <Button variant="outline" onClick={clearFilters}>
                      Clear all filters
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
