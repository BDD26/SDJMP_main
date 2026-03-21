import { useState, useRef, useEffect } from 'react'
import { 
  FileText, 
  Upload, 
  Eye, 
  Download, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MoreVertical,
  Plus,
  Pencil,
  FileSearch,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Briefcase,
  GraduationCap,
  Sparkles,
  ExternalLink
} from 'lucide-react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'

const DEFAULT_RESUME_DATA = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  summary: '',
  skills: [],
  education: [],
  experience: [],
  projects: [],
}

export default function StudentResumeManager() {
  const { user } = useAuth()
  const fileInputRef = useRef(null)
  
  const [activeTab, setActiveTab] = useState('resumes')
  const [resumes, setResumes] = useState([
    { id: 1, name: 'Fullstack_Dev_2024.pdf', type: 'uploaded', date: '2024-03-10', status: 'verified', data: null, isPrimary: true },
    { id: 2, name: 'Frontend_Specialist.pdf', type: 'uploaded', date: '2024-03-15', status: 'pending', data: null, isPrimary: false },
  ])
  const [isUploading, setIsUploading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showRename, setShowRename] = useState(false)
  const [selectedResume, setSelectedResume] = useState(null)
  const [newName, setNewName] = useState('')
  const [newSkillInput, setNewSkillInput] = useState('')

  // Resume Builder state
  const [showBuilder, setShowBuilder] = useState(false)
  const [builderStep, setBuilderStep] = useState(1)
  const [resumeData, setResumeData] = useState({
    ...DEFAULT_RESUME_DATA,
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '9876543210',
    location: 'Bangalore, India',
    summary: 'Highly motivated Full Stack Developer with 4+ years of experience building scalable web applications. Expertise in React, Node.js, and Cloud Architecture. Passionate about solving complex problems through clean, efficient code and user-centric design.',
    skills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'Docker'],
    education: [
      { id: 1, degree: 'B.Tech Computer Science', institution: 'State Technical University', year: '2025' }
    ],
    experience: [
      { id: 1, title: 'Senior Frontend Engineer', company: 'TechFlow Solutions', period: '2022 - Present', bullets: ['Led the modernization of internal dashboard, increasing user efficiency by 40%.', 'Implemented comprehensive testing strategy using Jest and Cypress.', 'Mentored 5+ junior developers on best practices and design patterns.'] }
    ],
    projects: [
      { id: 1, title: 'SkillMatch Portal', description: 'A job matching platform built with React and Shadcn UI.', link: 'https://github.com' }
    ],
  })

  useEffect(() => {
    if (user?.name) setResumeData(d => ({ ...d, fullName: user.name }))
    if (user?.email) setResumeData(d => ({ ...d, email: user.email }))
  }, [user?.name, user?.email])

  const handleUploadClick = () => fileInputRef.current?.click()

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      toast.error('Please upload a PDF or Word document')
      e.target.value = ''
      return
    }
    setIsUploading(true)
    setTimeout(() => {
      setResumes(prev => [{
        id: Date.now(),
        name: file.name,
        type: 'uploaded',
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        data: null
      }, ...prev])
      setIsUploading(false)
      toast.success('Resume uploaded successfully')
      e.target.value = ''
    }, 1500)
  }

  const handleSaveBuiltResume = () => {
    const name = `${resumeData.fullName.replace(/\s+/g, '_')}_Resume.pdf`
    const newResume = {
      id: Date.now(),
      name,
      type: 'built',
      date: new Date().toISOString().split('T')[0],
      status: 'verified',
      data: { ...resumeData }
    }
    setResumes(prev => [newResume, ...prev])
    setShowBuilder(false)
    setBuilderStep(1)
    toast.success('Resume created successfully')
  }

  const deleteResume = (id) => {
    setResumes(prev => prev.filter(r => r.id !== id))
    setSelectedResume(null)
    setShowPreview(false)
    toast.success('Resume deleted')
  }

  const setPrimary = (id) => {
    setResumes(prev => prev.map(r => ({ ...r, isPrimary: r.id === id })))
    toast.success('Primary resume updated')
  }

  const handlePreview = (resume) => {
    setSelectedResume(resume)
    setShowPreview(true)
  }

  const handleDownload = (resume) => {
    if (resume.type === 'built') {
      window.print()
      toast.success('Use print dialog to save as PDF')
    } else {
      toast.success(`Downloading ${resume.name}...`)
    }
  }

  const openRename = (resume) => {
    setSelectedResume(resume)
    setNewName(resume.name)
    setShowRename(true)
  }

  const handleRename = () => {
    setResumes(prev => prev.map(r => r.id === selectedResume.id ? { ...r, name: newName } : r))
    setShowRename(false)
    toast.success('Resume renamed')
  }

  const getPreviewData = () => {
    if (selectedResume?.type === 'built' && selectedResume?.data) return selectedResume.data
    return resumeData
  }

  const addSkill = () => {
    const skill = newSkillInput.trim()
    if (skill) {
      setResumeData(d => ({ ...d, skills: [...d.skills, skill] }))
      setNewSkillInput('')
    }
  }

  const removeSkill = (idx) => setResumeData(d => ({ ...d, skills: d.skills.filter((_, i) => i !== idx) }))

  const addEducation = () => setResumeData(d => ({
    ...d,
    education: [...d.education, { id: Date.now(), degree: '', institution: '', year: '' }]
  }))

  const updateEducation = (id, field, value) => setResumeData(d => ({
    ...d,
    education: d.education.map(e => e.id === id ? { ...e, [field]: value } : e)
  }))

  const removeEducation = (id) => setResumeData(d => ({ ...d, education: d.education.filter(e => e.id !== id) }))

  const addExperience = () => setResumeData(d => ({
    ...d,
    experience: [...d.experience, { id: Date.now(), title: '', company: '', period: '', bullets: [''] }]
  }))

  const updateExperience = (id, field, value) => setResumeData(d => ({
    ...d,
    experience: d.experience.map(e => e.id === id ? { ...e, [field]: value } : e)
  }))

  const updateExperienceBullet = (expId, bulletIdx, value) => setResumeData(d => ({
    ...d,
    experience: d.experience.map(e => {
      if (e.id !== expId) return e
      const bullets = [...(e.bullets || [])]
      bullets[bulletIdx] = value
      return { ...e, bullets }
    })
  }))

  const removeExperience = (id) => setResumeData(d => ({ ...d, experience: d.experience.filter(e => e.id !== id) }))

  const addProject = () => setResumeData(d => ({
    ...d,
    projects: [...d.projects, { id: Date.now(), title: '', description: '', link: '' }]
  }))

  const updateProject = (id, field, value) => setResumeData(d => ({
    ...d,
    projects: d.projects.map(p => p.id === id ? { ...p, [field]: value } : p)
  }))

  const removeProject = (id) => setResumeData(d => ({ ...d, projects: d.projects.filter(p => p.id !== id) }))

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resume Manager</h1>
          <p className="text-muted-foreground mt-1">Create, upload, and manage your resumes for job applications.</p>
        </div>
        <div className="flex gap-3">
          <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileChange} />
          <Button onClick={handleUploadClick} disabled={isUploading} variant="outline" className="rounded-xl">
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? 'Uploading...' : 'Upload File'}
          </Button>
          <Button onClick={() => setShowBuilder(true)} className="shadow-lg shadow-primary/20 rounded-xl">
            <Sparkles className="h-4 w-4 mr-2" />
            Create with Builder
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="resumes">My Resumes</TabsTrigger>
          <TabsTrigger value="ats">ATS Score</TabsTrigger>
        </TabsList>

        <TabsContent value="resumes" className="mt-0">
          <Card className="border-none shadow-xl glass overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <FileText className="h-32 w-32" />
            </div>
            <CardHeader>
              <CardTitle>Your Resumes</CardTitle>
              <CardDescription>Upload files or create professional resumes with our builder.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {resumes.map((resume) => (
                  <div key={resume.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border bg-background/50 hover:bg-background transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm">{resume.name}</h4>
                          <Badge variant={resume.type === 'built' ? 'default' : 'outline'} className="text-[10px] h-5">
                            {resume.type === 'built' ? 'Builder' : resume.type}
                          </Badge>
                          {resume.isPrimary && <Badge variant="secondary" className="text-[10px]">Primary</Badge>}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {resume.date}</span>
                          <span className="flex items-center gap-1">
                            {resume.status === 'verified' ? (
                              <><CheckCircle2 className="h-3 w-3 text-emerald-500" /> ATS Friendly</>
                            ) : (
                              <><AlertCircle className="h-3 w-3 text-amber-500" /> Pending</>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 sm:mt-0">
                      <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => handlePreview(resume)} title="Preview">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => handleDownload(resume)} title="Download">
                        <Download className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setPrimary(resume.id)}>Set as Primary</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openRename(resume)}>
                            <Pencil className="h-4 w-4 mr-2" /> Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => deleteResume(resume.id)}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
                {resumes.length === 0 && (
                  <div className="py-16 text-center border-2 border-dashed rounded-3xl">
                    <FileText className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                    <h3 className="font-bold text-lg mb-2">No resumes yet</h3>
                    <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">Upload a file or create a professional resume with our builder.</p>
                    <div className="flex gap-3 justify-center flex-wrap">
                      <Button variant="outline" onClick={handleUploadClick} className="rounded-xl">
                        <Upload className="h-4 w-4 mr-2" /> Upload
                      </Button>
                      <Button onClick={() => setShowBuilder(true)} className="rounded-xl">
                        <Sparkles className="h-4 w-4 mr-2" /> Create with Builder
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ats" className="mt-0">
          <Card className="border-none shadow-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.08\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-60" />
            <CardHeader className="relative z-10">
              <CardTitle className="text-2xl">ATS Optimization</CardTitle>
              <CardDescription className="text-white/80">Compatibility with employer applicant tracking systems.</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="h-36 w-36 rounded-full border-4 border-white/30 flex items-center justify-center relative shrink-0">
                  <span className="text-4xl font-black">82</span>
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-emerald-400 text-slate-900 text-xs font-bold px-3 py-1 rounded-full">Good</span>
                  <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                    <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="8" strokeDasharray="283" strokeDashoffset="51" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="bg-white/15 backdrop-blur p-4 rounded-xl border border-white/20">
                    <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1">Keywords</p>
                    <p className="text-xl font-bold">Excellent</p>
                  </div>
                  <div className="bg-white/15 backdrop-blur p-4 rounded-xl border border-white/20">
                    <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1">Formatting</p>
                    <p className="text-xl font-bold">Good</p>
                  </div>
                  <div className="bg-white/15 backdrop-blur p-4 rounded-xl border border-white/20">
                    <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1">Sections</p>
                    <p className="text-xl font-bold">Complete</p>
                  </div>
                  <div className="bg-white/15 backdrop-blur p-4 rounded-xl border border-white/20">
                    <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1">Length</p>
                    <p className="text-xl font-bold">Optimal</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rename Dialog */}
      <Dialog open={showRename} onOpenChange={setShowRename}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Resume</DialogTitle>
            <DialogDescription>Enter a new name for your resume.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowRename(false)}>Cancel</Button>
            <Button onClick={handleRename}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resume Builder Dialog */}
      <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Resume Builder
            </DialogTitle>
            <DialogDescription>Build a professional, ATS-friendly resume step by step.</DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 mb-6">
            {[1, 2, 3, 4].map((s) => (
              <button
                key={s}
                onClick={() => setBuilderStep(s)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  builderStep === s ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {s === 1 && 'Contact'}
                {s === 2 && 'Summary & Skills'}
                {s === 3 && 'Education'}
                {s === 4 && 'Experience'}
              </button>
            ))}
          </div>

          {builderStep === 1 && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={resumeData.fullName} onChange={(e) => setResumeData(d => ({ ...d, fullName: e.target.value }))} placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={resumeData.email} onChange={(e) => setResumeData(d => ({ ...d, email: e.target.value }))} placeholder="john@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={resumeData.phone} onChange={(e) => setResumeData(d => ({ ...d, phone: e.target.value }))} placeholder="+1 234 567 8900" />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={resumeData.location} onChange={(e) => setResumeData(d => ({ ...d, location: e.target.value }))} placeholder="City, Country" />
                </div>
              </div>
            </div>
          )}

          {builderStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Professional Summary</Label>
                <Textarea value={resumeData.summary} onChange={(e) => setResumeData(d => ({ ...d, summary: e.target.value }))} rows={4} placeholder="2-4 sentences about your experience and goals..." />
              </div>
                <div className="space-y-2">
                <Label>Skills</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {resumeData.skills.map((s, i) => (
                    <Badge key={i} variant="secondary" className="gap-1 pr-1">
                      {s}
                      <button type="button" onClick={() => removeSkill(i)} className="ml-0.5 hover:text-destructive font-bold leading-none">×</button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Add a skill (e.g. React, Python)" 
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addSkill}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {builderStep === 3 && (
            <div className="space-y-4">
              {resumeData.education.map((edu) => (
                <Card key={edu.id}>
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Education</span>
                      <Button variant="ghost" size="sm" className="h-7 text-destructive" onClick={() => removeEducation(edu.id)}>Remove</Button>
                    </div>
                    <Input placeholder="Degree" value={edu.degree} onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)} />
                    <Input placeholder="Institution" value={edu.institution} onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)} />
                    <Input placeholder="Year" value={edu.year} onChange={(e) => updateEducation(edu.id, 'year', e.target.value)} />
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" onClick={addEducation} className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Add Education
              </Button>
            </div>
          )}

          {builderStep === 4 && (
            <div className="space-y-4">
              {resumeData.experience.map((exp) => (
                <Card key={exp.id}>
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Experience</span>
                      <Button variant="ghost" size="sm" className="h-7 text-destructive" onClick={() => removeExperience(exp.id)}>Remove</Button>
                    </div>
                    <Input placeholder="Job Title" value={exp.title} onChange={(e) => updateExperience(exp.id, 'title', e.target.value)} />
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Input placeholder="Company" value={exp.company} onChange={(e) => updateExperience(exp.id, 'company', e.target.value)} />
                      <Input placeholder="Period (e.g. 2020 - Present)" value={exp.period} onChange={(e) => updateExperience(exp.id, 'period', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Bullet Points</Label>
                      {(exp.bullets || []).map((b, i) => (
                        <Input key={i} value={b} onChange={(e) => updateExperienceBullet(exp.id, i, e.target.value)} placeholder={`Achievement ${i + 1}`} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" onClick={addExperience} className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Add Experience
              </Button>

              <div className="pt-4 border-t">
                <Label className="mb-2 block">Projects</Label>
                {resumeData.projects.map((p) => (
                  <Card key={p.id} className="mb-3">
                    <CardContent className="pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">Project</span>
                        <Button variant="ghost" size="sm" className="h-6 text-destructive text-xs" onClick={() => removeProject(p.id)}>Remove</Button>
                      </div>
                      <Input placeholder="Title" value={p.title} onChange={(e) => updateProject(p.id, 'title', e.target.value)} />
                      <Input placeholder="Description" value={p.description} onChange={(e) => updateProject(p.id, 'description', e.target.value)} />
                      <Input placeholder="Link" value={p.link} onChange={(e) => updateProject(p.id, 'link', e.target.value)} />
                    </CardContent>
                  </Card>
                ))}
                <Button variant="outline" size="sm" onClick={addProject}>
                  <Plus className="h-3 w-3 mr-1" /> Add Project
                </Button>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between sm:justify-between">
            <div className="flex gap-2">
              {builderStep > 1 && <Button variant="outline" onClick={() => setBuilderStep(s => s - 1)}><ChevronLeft className="h-4 w-4 mr-1" /> Back</Button>}
              {builderStep < 4 && <Button onClick={() => setBuilderStep(s => s + 1)}>Next <ChevronRight className="h-4 w-4 ml-1" /></Button>}
            </div>
            {builderStep === 4 && (
              <Button onClick={handleSaveBuiltResume}>
                <CheckCircle2 className="h-4 w-4 mr-2" /> Save Resume
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Professional Resume Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-4 border-b bg-muted/30 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <FileSearch className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle>{selectedResume?.name}</DialogTitle>
                  <DialogDescription>{selectedResume?.type === 'built' ? 'Your built resume' : 'Document preview'}</DialogDescription>
                </div>
              </div>
              <Button size="sm" onClick={() => selectedResume && handleDownload(selectedResume)} className="print:hidden">
                <Download className="h-4 w-4 mr-2" /> Download / Print
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-auto bg-slate-200 dark:bg-slate-900 p-6 md:p-10 flex justify-center print:bg-white">
            {/* Professional Resume Layout */}
            <div className="w-full max-w-[210mm] bg-white text-slate-800 shadow-2xl p-10 md:p-14 min-h-[297mm] print:shadow-none print:p-12 resume-preview">
              {selectedResume?.type === 'uploaded' ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center py-20">
                  <FileText className="h-20 w-20 text-slate-300 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-600 mb-2">Uploaded Document</h3>
                  <p className="text-sm text-slate-500 max-w-md">Preview for uploaded PDF/DOC files is not available. Use the Download button to view your file, or create a resume with our builder for a preview.</p>
                </div>
              ) : (
                (() => {
                  const data = getPreviewData()
                  return (
                    <div className="space-y-8">
                      {/* Header */}
                      <header className="text-center border-b-2 border-primary pb-6">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">{data.fullName || user?.name || 'Your Name'}</h1>
                        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-slate-600">
                          {data.email && <span className="flex items-center gap-1"><Mail className="h-3.5 w-3" />{data.email}</span>}
                          {data.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3" />{data.phone}</span>}
                          {data.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3" />{data.location}</span>}
                        </div>
                      </header>

                      {/* Summary */}
                      {data.summary && (
                        <section>
                          <h2 className="text-sm font-bold uppercase tracking-widest text-primary border-b border-slate-200 pb-1 mb-3">Professional Summary</h2>
                          <p className="text-slate-700 text-sm leading-relaxed">{data.summary}</p>
                        </section>
                      )}

                      {/* Skills */}
                      {data.skills?.length > 0 && (
                        <section>
                          <h2 className="text-sm font-bold uppercase tracking-widest text-primary border-b border-slate-200 pb-1 mb-3">Skills</h2>
                          <div className="flex flex-wrap gap-2">
                            {data.skills.map((s, i) => (
                              <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded">{s}</span>
                            ))}
                          </div>
                        </section>
                      )}

                      {/* Experience */}
                      {data.experience?.length > 0 && (
                        <section>
                          <h2 className="text-sm font-bold uppercase tracking-widest text-primary border-b border-slate-200 pb-1 mb-3 flex items-center gap-2">
                            <Briefcase className="h-4 w-4" /> Experience
                          </h2>
                          <div className="space-y-4">
                            {data.experience.map((exp) => (
                              <div key={exp.id}>
                                <div className="flex justify-between items-start flex-wrap gap-2">
                                  <h3 className="font-bold text-slate-900">{exp.title}</h3>
                                  <span className="text-xs text-slate-500 whitespace-nowrap">{exp.period}</span>
                                </div>
                                <p className="text-sm font-medium text-primary mb-2">{exp.company}</p>
                                {exp.bullets?.length > 0 && (
                                  <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                                    {exp.bullets.filter(Boolean).map((b, i) => (
                                      <li key={i}>{b}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      {/* Education */}
                      {data.education?.length > 0 && (
                        <section>
                          <h2 className="text-sm font-bold uppercase tracking-widest text-primary border-b border-slate-200 pb-1 mb-3 flex items-center gap-2">
                            <GraduationCap className="h-4 w-4" /> Education
                          </h2>
                          <div className="space-y-3">
                            {data.education.map((edu) => (
                              <div key={edu.id}>
                                <h3 className="font-bold text-slate-900">{edu.degree}</h3>
                                <p className="text-sm text-slate-600">{edu.institution}{edu.year ? ` • ${edu.year}` : ''}</p>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      {/* Projects */}
                      {data.projects?.length > 0 && (
                        <section>
                          <h2 className="text-sm font-bold uppercase tracking-widest text-primary border-b border-slate-200 pb-1 mb-3 flex items-center gap-2">
                            <ExternalLink className="h-4 w-4" /> Projects
                          </h2>
                          <div className="space-y-3">
                            {data.projects.map((p) => (
                              <div key={p.id}>
                                <h3 className="font-bold text-slate-900">{p.title}</h3>
                                <p className="text-sm text-slate-600">{p.description}</p>
                                {p.link && <a href={p.link} className="text-xs text-primary hover:underline">{p.link}</a>}
                              </div>
                            ))}
                          </div>
                        </section>
                      )}
                    </div>
                  )
                })()
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
