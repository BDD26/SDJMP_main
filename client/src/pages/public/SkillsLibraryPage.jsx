import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  TrendingUp,
  Code,
  Database,
  Cloud,
  Palette,
  BarChart3,
  Smartphone,
  ArrowRight,
  BookOpen,
  Youtube,
  ExternalLink,
  ChevronRight,
  X,
  CheckCircle2,
  Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const skillCategories = [
  {
    id: 'frontend',
    name: 'Frontend Development',
    icon: Code,
    description: 'Build beautiful and interactive user interfaces',
    skills: [
      { 
        name: 'React', 
        demand: 89, 
        jobs: 1250, 
        growth: '+25%',
        tracks: [
          { title: 'React Fundamentals', type: 'Course', platform: 'Meta', link: '#' },
          { title: 'Advanced Patterns', type: 'Video', platform: 'YouTube', link: '#' },
          { title: 'React Documentation', type: 'Docs', platform: 'Official', link: '#' }
        ]
      },
      { name: 'TypeScript', demand: 85, jobs: 1100, growth: '+35%' },
      { name: 'Next.js', demand: 78, jobs: 850, growth: '+40%' },
      { name: 'Tailwind CSS', demand: 75, jobs: 720, growth: '+45%' },
    ],
  },
  {
    id: 'backend',
    name: 'Backend Development',
    icon: Database,
    description: 'Build robust server-side applications and APIs',
    skills: [
      { name: 'Node.js', demand: 82, jobs: 980, growth: '+20%' },
      { name: 'Python', demand: 88, jobs: 1150, growth: '+30%' },
      { name: 'PostgreSQL', demand: 78, jobs: 750, growth: '+22%' },
    ],
  },
  {
    id: 'cloud',
    name: 'Cloud & DevOps',
    icon: Cloud,
    description: 'Deploy and scale applications in the cloud',
    skills: [
      { name: 'AWS', demand: 85, jobs: 1050, growth: '+28%' },
      { name: 'Docker', demand: 80, jobs: 920, growth: '+25%' },
      { name: 'Kubernetes', demand: 75, jobs: 680, growth: '+32%' },
    ],
  },
]

const trendingSkills = [
  { name: 'AI/ML Engineering', growth: '+65%', category: 'Emerging' },
  { name: 'TypeScript', growth: '+45%', category: 'Frontend' },
  { name: 'Kubernetes', growth: '+40%', category: 'DevOps' },
]

export default function SkillsLibraryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedSkill, setSelectedSkill] = useState(null)

  const filteredCategories = skillCategories.filter((category) => {
    if (selectedCategory !== 'all' && category.id !== selectedCategory) return false
    if (searchQuery) {
      return (
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.skills.some((skill) =>
          skill.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }
    return true
  })

  const getDemandColor = (demand) => {
    if (demand >= 80) return 'text-green-600'
    if (demand >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getGrowthVariant = (growth) => {
    const value = parseInt(growth)
    if (value >= 30) return 'success'
    if (value >= 15) return 'default'
    return 'secondary'
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Hero Section */}
      <section className="bg-muted/30 border-b py-8">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-center">Master Your Next Skill</h1>
            <p className="text-muted-foreground mb-6 text-center max-w-2xl mx-auto">
              Explore in-demand tech skills, market trends, and curated learning paths designed to help you land your dream role.
            </p>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="searchSkills"
                  name="searchSkills"
                  type="search"
                  autoComplete="off"
                  placeholder="Search for skills (e.g. React, Python, AWS)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Skills Bar */}
      <section className="py-6 border-b bg-card">
        <div className="container px-4 md:px-6">
          <div className="flex items-center gap-6 overflow-x-auto pb-2 no-scrollbar">
            <div className="flex items-center gap-2 text-sm font-bold whitespace-nowrap text-primary uppercase tracking-widest">
              <TrendingUp className="h-4 w-4" />
              Trending
            </div>
            {trendingSkills.map((skill) => (
              <Badge
                key={skill.name}
                variant="secondary"
                className="whitespace-nowrap cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all py-1.5 px-3 rounded-md border-none"
                onClick={() => setSearchQuery(skill.name)}
              >
                {skill.name}
                <span className="ml-2 font-bold opacity-80">{skill.growth}</span>
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container px-4 md:px-6 py-12">
        <Tabs defaultValue="all" value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <h2 className="text-2xl font-bold">Skill Categories</h2>
            <TabsList className="bg-muted/50 p-1 h-auto flex-wrap justify-start gap-1">
              <TabsTrigger value="all" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">All</TabsTrigger>
              {skillCategories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value={selectedCategory} className="mt-0 outline-none">
            <div className="space-y-12">
              {filteredCategories.map((category) => {
                const Icon = category.icon
                return (
                  <div key={category.id} className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">{category.name}</h3>
                        <p className="text-muted-foreground">{category.description}</p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {category.skills
                        .filter(
                          (skill) =>
                            !searchQuery ||
                            skill.name.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((skill) => (
                          <Card
                            key={skill.name}
                            className="group hover:shadow-2xl transition-all duration-300 border-none bg-card/50 backdrop-blur-sm shadow-xl shadow-muted/20 relative overflow-hidden"
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between mb-2">
                                <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                                  {skill.name}
                                </CardTitle>
                                <Badge variant={getGrowthVariant(skill.growth)} className="rounded-full">
                                  {skill.growth} growth
                                </Badge>
                              </div>
                              <CardDescription className="flex items-center gap-2">
                                <Users className="h-3 w-3" />
                                {skill.jobs.toLocaleString()} Open Roles
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-tighter">
                                  <span className="text-muted-foreground">Market Demand</span>
                                  <span className={getDemandColor(skill.demand)}>
                                    {skill.demand}%
                                  </span>
                                </div>
                                <Progress value={skill.demand} className="h-2 rounded-full overflow-hidden bg-primary/10" />
                              </div>
                              
                              <Button 
                                variant="outline" 
                                className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all border-dashed border-primary/30"
                                onClick={() => setSelectedSkill(skill)}
                              >
                                <BookOpen className="h-4 w-4 mr-2" />
                                View Learning Path
                                <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                )
              })}

              {filteredCategories.length === 0 && (
                <div className="py-20 text-center">
                  <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="h-10 w-10 text-muted-foreground opacity-20" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">No skills found</h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    We couldn't find any skills matching "{searchQuery}". Try broadening your search.
                  </p>
                  <Button variant="outline" onClick={() => setSearchQuery('')} size="lg" className="rounded-xl">
                    Clear search
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Skill Detail Modal */}
      <Dialog open={!!selectedSkill} onOpenChange={() => setSelectedSkill(null)}>
        <DialogContent className="sm:max-w-[500px] border-none shadow-2xl p-0 overflow-hidden glass-modal" showCloseButton={false}>
          <div className="h-2 bg-primary w-full" />
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center justify-between mb-4">
              <Badge variant="outline" className="text-primary border-primary/20">Learning Path</Badge>
              <Button variant="ghost" size="icon" onClick={() => setSelectedSkill(null)} className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogTitle className="text-3xl font-bold">{selectedSkill?.name}</DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              Follow these curated resources to master {selectedSkill?.name} and prepare for top-tier roles.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-4">
            <h4 className="font-bold text-sm uppercase tracking-widest text-primary flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Recommended Resources
            </h4>
            
            <div className="grid gap-3">
              {(selectedSkill?.tracks || [
                { title: `${selectedSkill?.name} Crash Course`, type: 'Video', platform: 'YouTube', link: '#' },
                { title: `Complete ${selectedSkill?.name} Roadmap`, type: 'Guide', platform: 'Medium', link: '#' },
                { title: `Official ${selectedSkill?.name} Docs`, type: 'Docs', platform: 'Official', link: '#' }
              ]).map((track, i) => (
                <a 
                  key={i} 
                  href={track.link} 
                  className="flex items-center gap-4 p-4 rounded-xl border bg-background hover:bg-muted/50 hover:border-primary/30 transition-all group/item"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary group-hover/item:bg-primary group-hover/item:text-white transition-colors">
                    {track.type === 'Video' ? <Youtube className="h-5 w-5" /> : <ExternalLink className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{track.title}</p>
                    <p className="text-xs text-muted-foreground">{track.platform} • {track.type}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover/item:text-primary group-hover/item:translate-x-1 transition-all" />
                </a>
              ))}
            </div>

            <div className="mt-8 p-4 rounded-xl bg-primary text-primary-foreground relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-1000" />
              <div className="relative z-10">
                <h5 className="font-bold mb-1">Get Certified</h5>
                <p className="text-xs text-primary-foreground/80 mb-3">
                  Validate your skills with our industry-recognized certification.
                </p>
                <Button variant="secondary" size="sm" className="w-full font-bold shadow-lg shadow-black/10" asChild>
                  <Link to="/student/assessments" onClick={() => setSelectedSkill(null)}>
                    Start Assessment
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .glass-modal {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
        .dark .glass-modal {
          background: rgba(15, 23, 42, 0.95);
        }
      `}} />
    </div>
  )
}
