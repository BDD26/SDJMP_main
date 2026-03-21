import { useState } from 'react'
import { 
  User, 
  GraduationCap, 
  Code, 
  Briefcase, 
  Award, 
  Plus, 
  Pencil, 
  Trash2, 
  ChevronRight, 
  Globe, 
  MapPin,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'

export default function StudentProfile() {
  const { user, updateProfile } = useAuth()
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [activeModal, setActiveModal] = useState(null) // 'skills', 'education', 'projects', 'preferences'
  const [isLoading, setIsLoading] = useState(false)

  // Mock initial state based on user context or defaults
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Alex Johnson',
    bio: 'Passionate Frontend Developer with a love for React and modern UI/UX design.',
    location: 'Bangalore, India',
    education: [
      { id: 1, degree: 'B.Tech Computer Science', institution: 'State Technical University', year: '2025' }
    ],
    skills: [
      { name: 'React', level: 'Advanced', years: 2 },
      { name: 'TypeScript', level: 'Intermediate', years: 1 },
      { name: 'Tailwind CSS', level: 'Expert', years: 2 }
    ],
    projects: [
      { id: 1, title: 'SkillMatch Portal', description: 'A job matching platform built with React and Shadcn UI.', link: 'https://github.com' }
    ],
    certifications: [],
    preferences: {
      jobTypes: ['Full-time', 'Internship'],
      locations: ['Remote', 'Bangalore', 'Mumbai'],
      minSalary: '₹8,00,000'
    }
  })

  const [editingIndex, setEditingIndex] = useState(null)
  const [formValues, setFormValues] = useState({})

  const openModal = (modal, editItem = null, index = null) => {
    setActiveModal(modal)
    setEditingIndex(index)
    if (editItem) {
      if (modal === 'skills') setFormValues({ name: editItem.name, level: editItem.level, years: editItem.years })
      else if (modal === 'education') setFormValues({ degree: editItem.degree, institution: editItem.institution, year: editItem.year })
      else if (modal === 'projects') setFormValues({ title: editItem.title, description: editItem.description, link: editItem.link, id: editItem.id })
    } else {
      if (modal === 'skills') setFormValues({ name: '', level: 'intermediate', years: 0 })
      else if (modal === 'education') setFormValues({ degree: '', institution: '', year: '' })
      else if (modal === 'projects') setFormValues({ title: '', description: '', link: '' })
      else if (modal === 'preferences') setFormValues({
        locations: profileData.preferences.locations.join(', '),
        minSalary: profileData.preferences.minSalary,
        jobTypes: profileData.preferences.jobTypes
      })
      else if (modal === 'certifications') setFormValues({ name: '', issuer: '', year: '' })
    }
  }

  const closeModal = () => {
    setActiveModal(null)
    setEditingIndex(null)
    setFormValues({})
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      let updated = { ...profileData }
      if (activeModal === 'skills') {
        const skill = { name: formValues.name || 'New Skill', level: formValues.level || 'intermediate', years: Number(formValues.years) || 0 }
        if (editingIndex !== null) {
          updated.skills = updated.skills.map((s, i) => i === editingIndex ? skill : s)
        } else {
          updated.skills = [...updated.skills, skill]
        }
      } else if (activeModal === 'education') {
        const edu = { id: editingIndex !== null ? profileData.education[editingIndex].id : Date.now(), degree: formValues.degree, institution: formValues.institution, year: String(formValues.year) }
        if (editingIndex !== null) {
          updated.education = updated.education.map((e, i) => i === editingIndex ? edu : e)
        } else {
          updated.education = [...updated.education, edu]
        }
      } else if (activeModal === 'projects') {
        const proj = { id: formValues.id || Date.now(), title: formValues.title, description: formValues.description, link: formValues.link || '#' }
        if (editingIndex !== null) {
          updated.projects = updated.projects.map((p, i) => i === editingIndex ? proj : p)
        } else {
          updated.projects = [...updated.projects, proj]
        }
      } else if (activeModal === 'preferences') {
        updated.preferences = {
          locations: (formValues.locations || '').split(',').map(s => s.trim()).filter(Boolean),
          minSalary: formValues.minSalary || updated.preferences.minSalary,
          jobTypes: formValues.jobTypes || updated.preferences.jobTypes
        }
      } else if (activeModal === 'certifications') {
        const cert = { name: formValues.name, issuer: formValues.issuer, year: formValues.year }
        updated.certifications = [...(updated.certifications || []), cert]
      }
      setProfileData(updated)
      await updateProfile(updated)
      toast.success('Profile updated successfully')
      closeModal()
    } catch {
      toast.error('Failed to save')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveProject = (projectId) => {
    setProfileData(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== projectId) }))
    toast.success('Project removed')
  }

  const handleRemoveCertification = (idx) => {
    setProfileData(prev => ({ ...prev, certifications: (prev.certifications || []).filter((_, i) => i !== idx) }))
    toast.success('Certification removed')
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="h-24 w-24 rounded-3xl bg-primary/10 flex items-center justify-center border-2 border-primary/20 overflow-hidden relative">
              <User className="h-12 w-12 text-primary" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                <Pencil className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{profileData.name}</h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <MapPin className="h-4 w-4" />
              {profileData.location}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-none">Available for Hire</Badge>
              <Badge variant="outline" className="border-primary/20 text-primary">Open to Remote</Badge>
            </div>
          </div>
        </div>
        <Button onClick={() => openModal('preferences')} className="shadow-lg shadow-primary/20 rounded-xl px-6">
          Update Preferences
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Skills */}
        <div className="space-y-8">
          <Card className="border-none shadow-xl glass overflow-hidden">
            <div className="h-1.5 bg-primary w-full" />
            <CardHeader>
              <CardTitle className="text-lg">Profile Strength</CardTitle>
              <CardDescription>Complete your profile to unlock premium features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold">85% Complete</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <Progress value={85} className="h-3 rounded-full bg-primary/10" />
              <p className="text-xs text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/10">
                <AlertCircle className="h-3 w-3 inline mr-1 -mt-0.5 text-primary" />
                Add certification to reach 100% and get 2x more visibility.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg flex items-center gap-2">
                <Code className="h-5 w-5 text-primary" />
                Skills Inventory
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => openModal('skills')} className="h-8 w-8 rounded-full">
                <Plus className="h-4 w-4 text-primary" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileData.skills.map((skill, idx) => (
                <div key={idx} className="p-3 rounded-xl border bg-background/50 hover:bg-background transition-colors group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm">{skill.name}</span>
                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tighter py-0">
                      {skill.level}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                    <span>Experience: {skill.years} {skill.years === 1 ? 'Year' : 'Years'}</span>
                    <span className="group-hover:text-primary transition-colors cursor-pointer" onClick={() => openModal('skills', skill, idx)}>Edit</span>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full border-dashed group" onClick={() => openModal('skills')}>
                <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" />
                Add New Skill
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Experience, Education, Projects */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-xl glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xl flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-primary" />
                Academic Background
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => openModal('education')} className="h-8 w-8 rounded-full">
                <Plus className="h-4 w-4 text-primary" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {profileData.education.map((edu, idx) => (
                <div key={edu.id} className="relative pl-6 border-l-2 border-primary/20 py-1 group">
                  <div className="absolute left-[-9px] top-2 h-4 w-4 rounded-full bg-primary border-4 border-background shadow-primary/20" />
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-base">{edu.degree}</h4>
                      <p className="text-muted-foreground">{edu.institution}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-primary bg-primary/5 px-2 py-1 rounded-md">Class of {edu.year}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => openModal('education', edu, idx)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xl flex items-center gap-2">
                <Briefcase className="h-6 w-6 text-primary" />
                Featured Projects
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => openModal('projects')} className="h-8 w-8 rounded-full">
                <Plus className="h-4 w-4 text-primary" />
              </Button>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {profileData.projects.map((project) => (
                <div key={project.id} className="p-4 rounded-2xl border bg-background/30 hover:bg-background/80 transition-all border-white/20 group">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold">{project.title}</h4>
                    <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                      <a href={project.link} target="_blank" rel="noopener noreferrer">
                        <ChevronRight className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{project.description}</p>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-primary">
                    <a href={project.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                      <Globe className="h-3 w-3" /> Live Demo
                    </a>
                    <span className="text-muted-foreground hover:text-destructive cursor-pointer" onClick={() => handleRemoveProject(project.id)}>Remove</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl glass bg-gradient-to-br from-indigo-500/5 to-primary/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xl flex items-center gap-2">
                <Award className="h-6 w-6 text-primary" />
                Certifications
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => openModal('certifications')} className="h-8 w-8 rounded-full">
                <Plus className="h-4 w-4 text-primary" />
              </Button>
            </CardHeader>
            <CardContent>
              {profileData.certifications?.length > 0 ? (
                <div className="space-y-3">
                  {profileData.certifications.map((cert, idx) => (
                    <div key={idx} className="p-3 rounded-xl border bg-background/50 flex items-center justify-between group">
                      <div>
                        <p className="font-bold text-sm">{cert.name}</p>
                        <p className="text-xs text-muted-foreground">{cert.issuer} • {cert.year}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => handleRemoveCertification(idx)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center bg-white/30 rounded-3xl border border-dashed border-primary/20">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Award className="h-8 w-8 text-primary opacity-50" />
                  </div>
                  <h4 className="font-bold mb-1">Boost Your Credibility</h4>
                  <p className="text-xs text-muted-foreground max-w-[240px] mb-4">
                    Add certifications to showcase your verified expertise to potential employers.
                  </p>
                  <Button variant="outline" size="sm" className="rounded-xl border-primary text-primary hover:bg-primary hover:text-white" onClick={() => openModal('certifications')}>
                    Add Certification
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals for Editing */}
      <Dialog open={!!activeModal} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-[450px] border-none shadow-2xl glass-modal p-0 overflow-hidden">
          <div className="h-1.5 bg-primary w-full" />
          <DialogHeader className="p-6">
            <DialogTitle className="text-2xl font-bold capitalize">{activeModal === 'certifications' ? 'Add Certification' : `${activeModal} Editor`}</DialogTitle>
            <DialogDescription>
              Keep your profile up-to-date to ensure the best matching results.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 pt-0 space-y-6">
            {activeModal === 'skills' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Skill Name</Label>
                  <Input placeholder="e.g. React, Python" value={formValues.name || ''} onChange={(e) => setFormValues(v => ({ ...v, name: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Proficiency Level</Label>
                    <Select value={formValues.level || 'intermediate'} onValueChange={(v) => setFormValues(x => ({ ...x, level: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Years of Experience</Label>
                    <Input type="number" min="0" placeholder="0" value={formValues.years ?? ''} onChange={(e) => setFormValues(v => ({ ...v, years: e.target.value }))} />
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'education' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Degree / Certificate</Label>
                  <Input placeholder="e.g. B.Tech Computer Science" value={formValues.degree || ''} onChange={(e) => setFormValues(v => ({ ...v, degree: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Institution</Label>
                  <Input placeholder="e.g. State Technical University" value={formValues.institution || ''} onChange={(e) => setFormValues(v => ({ ...v, institution: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Graduation Year</Label>
                  <Input type="number" placeholder="2025" value={formValues.year || ''} onChange={(e) => setFormValues(v => ({ ...v, year: e.target.value }))} />
                </div>
              </div>
            )}

            {activeModal === 'preferences' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Preferred Locations</Label>
                  <Input placeholder="e.g. Remote, Bangalore, London" value={formValues.locations ?? ''} onChange={(e) => setFormValues(v => ({ ...v, locations: e.target.value }))} />
                  <p className="text-[10px] text-muted-foreground">Separate with commas</p>
                </div>
                <div className="space-y-2">
                  <Label>Expected Minimum Salary (Annual)</Label>
                  <Input placeholder="e.g. ₹8,00,000" value={formValues.minSalary ?? ''} onChange={(e) => setFormValues(v => ({ ...v, minSalary: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Job Category Interests</Label>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {['Full-time', 'Internship', 'Contract', 'Remote Role'].map(tag => (
                      <Badge
                        key={tag}
                        variant={formValues.jobTypes?.includes(tag) ? 'default' : 'secondary'}
                        className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
                        onClick={() => setFormValues(v => ({
                          ...v,
                          jobTypes: (v.jobTypes || []).includes(tag) ? (v.jobTypes || []).filter(t => t !== tag) : [...(v.jobTypes || []), tag]
                        }))}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'projects' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Project Title</Label>
                  <Input placeholder="Project Name" value={formValues.title || ''} onChange={(e) => setFormValues(v => ({ ...v, title: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Tell us what you built..." value={formValues.description || ''} onChange={(e) => setFormValues(v => ({ ...v, description: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Project Link</Label>
                  <Input placeholder="https://github.com/..." value={formValues.link || ''} onChange={(e) => setFormValues(v => ({ ...v, link: e.target.value }))} />
                </div>
              </div>
            )}

            {activeModal === 'certifications' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Certification Name</Label>
                  <Input placeholder="e.g. AWS Certified Developer" value={formValues.name || ''} onChange={(e) => setFormValues(v => ({ ...v, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Issuing Organization</Label>
                  <Input placeholder="e.g. Amazon Web Services" value={formValues.issuer || ''} onChange={(e) => setFormValues(v => ({ ...v, issuer: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Year Obtained</Label>
                  <Input type="number" placeholder="2024" value={formValues.year || ''} onChange={(e) => setFormValues(v => ({ ...v, year: e.target.value }))} />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="p-6 bg-muted/20 border-t">
            <Button variant="ghost" onClick={closeModal} className="rounded-xl">Cancel</Button>
            <Button onClick={handleSave} disabled={isLoading} className="shadow-lg shadow-primary/20 rounded-xl px-8">
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

