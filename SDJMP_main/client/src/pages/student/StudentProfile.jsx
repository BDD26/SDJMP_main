import { useEffect, useMemo, useState } from 'react'
import { User, GraduationCap, Code, Briefcase, Award, Plus, Pencil, Trash2, ChevronRight, Globe, MapPin, CheckCircle2, AlertCircle, Search } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import api from '@/services/api'
import { buildStudentProfileViewData, calculateProfileCompletion, transformProfileForBackend } from '@/utils/profileTransforms'

const JOB_TYPE_OPTIONS = ['Full-time', 'Internship', 'Contract', 'Remote Role']

function getEmptyState(user) {
  return buildStudentProfileViewData(user || {})
}

function SectionEmpty({ children, fullWidth = false }) {
  return (
    <div className={`rounded-xl border border-dashed bg-background/40 p-4 text-sm text-muted-foreground ${fullWidth ? 'md:col-span-2' : ''}`}>
      {children}
    </div>
  )
}

export default function StudentProfile() {
  const { user, updateProfile, refreshSession } = useAuth()
  const [profileData, setProfileData] = useState(() => getEmptyState(user))
  const [profileCompletion, setProfileCompletion] = useState(0)
  const [activeModal, setActiveModal] = useState(null)
  const [editingIndex, setEditingIndex] = useState(null)
  const [formValues, setFormValues] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [skillsQuery, setSkillsQuery] = useState('')
  const [showAllSkills, setShowAllSkills] = useState(false)

  useEffect(() => {
    const nextProfile = getEmptyState(user)
    setProfileData(nextProfile)
    setProfileCompletion(calculateProfileCompletion(nextProfile))
  }, [user])

  useEffect(() => {
    setProfileCompletion(calculateProfileCompletion(profileData))
  }, [profileData])

  const closeModal = () => {
    setActiveModal(null)
    setEditingIndex(null)
    setFormValues({})
  }

  const openModal = (modal, item = null, index = null) => {
    setActiveModal(modal)
    setEditingIndex(index)

    if (modal === 'basics') {
      setFormValues({
        bio: profileData.bio || '',
        location: profileData.location || '',
      })
      return
    }

    if (modal === 'preferences') {
      setFormValues({
        locations: profileData.preferences.locations.join(', '),
        minSalary: profileData.preferences.minSalary,
        jobTypes: profileData.preferences.jobTypes,
      })
      return
    }

    if (item) {
      setFormValues({ ...item })
      return
    }

    if (modal === 'skills') setFormValues({ name: '', level: 'intermediate', years: 0 })
    else if (modal === 'education') setFormValues({ degree: '', institution: '', year: '' })
    else if (modal === 'projects') setFormValues({ title: '', description: '', link: '' })
    else if (modal === 'certifications') setFormValues({ name: '', issuer: '', year: '' })
  }

  const persistProfile = async (nextProfile) => {
    const payload = transformProfileForBackend(nextProfile)
    const result = await updateProfile(payload)
    if (!result?.success) throw new Error(result?.error || 'Failed to update profile')
    const savedProfile = buildStudentProfileViewData(result.user || { ...user, profile: payload.profile })
    setProfileData(savedProfile)
    return savedProfile
  }

  const emitSkillChange = () => {
    window.dispatchEvent(new CustomEvent('skillmatch:data-changed', { detail: { type: 'skill' } }))
  }

  const refreshProfileFromSession = async () => {
    if (typeof refreshSession !== 'function') {
      return false
    }

    const result = await refreshSession()
    if (result?.data) {
      const nextProfile = getEmptyState(result.data)
      setProfileData(nextProfile)
      setProfileCompletion(calculateProfileCompletion(nextProfile))
      return true
    }

    return false
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      let nextProfile = { ...profileData }

      if (activeModal === 'basics') {
        nextProfile.bio = formValues.bio || ''
        nextProfile.location = formValues.location || ''
      } else if (activeModal === 'skills') {
        const existingSkill = editingIndex !== null ? nextProfile.skills[editingIndex] : null
        const skill = {
          ...(existingSkill || {}),
          name: formValues.name || 'New Skill',
          level: formValues.level || existingSkill?.level || 'intermediate',
          years: Number(formValues.years) || 0,
          verified: Boolean(existingSkill?.verified),
          sources: Array.isArray(existingSkill?.sources) && existingSkill.sources.length > 0
            ? existingSkill.sources
            : [{ type: 'manual', sourceId: '', category: 'manual' }],
        }
        nextProfile.skills = editingIndex !== null ? nextProfile.skills.map((item, index) => index === editingIndex ? skill : item) : [...nextProfile.skills, skill]
      } else if (activeModal === 'education') {
        const education = { id: profileData.education[editingIndex]?.id || `edu-${Date.now()}`, degree: formValues.degree, institution: formValues.institution, year: String(formValues.year || '') }
        nextProfile.education = editingIndex !== null ? nextProfile.education.map((item, index) => index === editingIndex ? education : item) : [...nextProfile.education, { ...education, id: `edu-${Date.now()}` }]
      } else if (activeModal === 'projects') {
        const project = { id: formValues.id || `project-${Date.now()}`, title: formValues.title, description: formValues.description, link: formValues.link || '' }
        nextProfile.projects = editingIndex !== null ? nextProfile.projects.map((item, index) => index === editingIndex ? project : item) : [...nextProfile.projects, project]
      } else if (activeModal === 'certifications') {
        const certification = { name: formValues.name, issuer: formValues.issuer, year: formValues.year }
        nextProfile.certifications = editingIndex !== null ? nextProfile.certifications.map((item, index) => index === editingIndex ? certification : item) : [...nextProfile.certifications, certification]
      } else if (activeModal === 'preferences') {
        nextProfile.preferences = {
          locations: (formValues.locations || '').split(',').map((value) => value.trim()).filter(Boolean),
          minSalary: formValues.minSalary || '',
          jobTypes: formValues.jobTypes || [],
        }
      }

      await persistProfile(nextProfile)
      if (activeModal === 'skills') {
        emitSkillChange()
      }
      toast.success('Profile updated successfully')
      closeModal()
    } catch (error) {
      toast.error(error?.message || 'Failed to save profile changes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveProject = async (projectId) => {
    setIsLoading(true)
    try {
      await persistProfile({ ...profileData, projects: profileData.projects.filter((project) => project.id !== projectId) })
      toast.success('Project removed')
    } catch (error) {
      toast.error(error?.message || 'Failed to remove project')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveCertification = async (indexToRemove) => {
    setIsLoading(true)
    try {
      await persistProfile({ ...profileData, certifications: profileData.certifications.filter((_, index) => index !== indexToRemove) })
      toast.success('Certification removed')
    } catch (error) {
      toast.error(error?.message || 'Failed to remove certification')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveSkill = async (skillName) => {
    setIsLoading(true)
    try {
      await api.skills.removeFromProfile(skillName)
      const refreshed = await refreshProfileFromSession()
      if (!refreshed) {
        setProfileData((currentProfile) => ({
          ...currentProfile,
          skills: currentProfile.skills.filter(
            (skill) => String(skill?.name || '').toLowerCase() !== String(skillName || '').toLowerCase()
          ),
        }))
      }
      emitSkillChange()
      toast.success('Skill removed')
    } catch (error) {
      toast.error(error?.message || 'Failed to remove skill')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredSkills = useMemo(() => {
    const query = skillsQuery.trim().toLowerCase()
    const source = Array.isArray(profileData.skills) ? profileData.skills : []

    const filtered = query
      ? source.filter((skill) => String(skill?.name || '').toLowerCase().includes(query))
      : source

    return filtered.slice().sort((a, b) => {
      const aVerified = Boolean(a?.verified)
      const bVerified = Boolean(b?.verified)
      if (aVerified !== bVerified) return aVerified ? -1 : 1
      return String(a?.name || '').localeCompare(String(b?.name || ''), undefined, { sensitivity: 'base' })
    })
  }, [profileData.skills, skillsQuery])

  const visibleSkills = useMemo(() => {
    if (showAllSkills) return filteredSkills
    return filteredSkills.slice(0, 12)
  }, [filteredSkills, showAllSkills])

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="h-24 w-24 rounded-3xl bg-primary/10 flex items-center justify-center border-2 border-primary/20">
            <User className="h-12 w-12 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{profileData.name}</h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <MapPin className="h-4 w-4" />
              {profileData.locationLabel}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-none">Available for Hire</Badge>
              <Badge variant="outline" className="border-primary/20 text-primary">
                {profileData.preferences.jobTypes.length > 0 ? profileData.preferences.jobTypes.join(' | ') : 'Preferences pending'}
              </Badge>
            </div>
          </div>
        </div>
        <Button onClick={() => openModal('preferences')} className="shadow-lg shadow-primary/20 rounded-xl px-6">Update Preferences</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-8">
          <Card className="border-none shadow-xl glass">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">Profile Snapshot</CardTitle>
                  <CardDescription>Your public basics and job preferences</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => openModal('basics')}>
                  <Pencil className="h-3.5 w-3.5 mr-2" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Bio</p>
                <p className="mt-2 text-sm text-muted-foreground">{profileData.bio || 'Add a short bio so employers understand your strengths and interests.'}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border bg-background/40 p-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Location</p>
                  <p className="mt-2 text-sm font-medium">{profileData.locationLabel}</p>
                </div>
                <div className="rounded-xl border bg-background/40 p-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Expected Salary</p>
                  <p className="mt-2 text-sm font-medium">{profileData.preferences.minSalary || 'Not added yet'}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {profileData.preferences.locations.length > 0
                  ? profileData.preferences.locations.map((location) => <Badge key={location} variant="secondary">{location}</Badge>)
                  : <p className="text-sm text-muted-foreground">No preferred locations selected yet.</p>}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl glass overflow-hidden">
            <div className="h-1.5 bg-primary w-full" />
            <CardHeader>
              <CardTitle className="text-lg">Profile Strength</CardTitle>
              <CardDescription>Complete your profile to increase visibility to employers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold">{profileCompletion}% Complete</span>
                {profileCompletion >= 80 ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <AlertCircle className="h-4 w-4 text-amber-500" />}
              </div>
              <Progress value={profileCompletion} className="h-3 rounded-full bg-primary/10" />
              <p className="text-xs text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/10">
                {profileCompletion >= 80 ? 'Excellent! Your profile is complete and ready for employers.' : 'Add more information to improve your profile visibility.'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg flex items-center gap-2"><Code className="h-5 w-5 text-primary" />Skills Inventory</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => openModal('skills')} className="h-8 w-8 rounded-full"><Plus className="h-4 w-4 text-primary" /></Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileData.skills.length > 10 ? (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={skillsQuery}
                    onChange={(event) => setSkillsQuery(event.target.value)}
                    placeholder="Filter skills..."
                    className="pl-9 rounded-xl"
                  />
                </div>
              ) : null}

              {filteredSkills.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {visibleSkills.map((skill, index) => (
                    <div key={`${skill.name}-${index}`} className="p-3 rounded-xl border bg-background/50 group flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm truncate">{skill.name}</span>
                          {skill.verified ? (
                            <Badge className="text-[10px] h-5 bg-emerald-500/10 text-emerald-600 border-none">Verified</Badge>
                          ) : null}
                          <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tighter py-0">{skill.level}</Badge>
                        </div>
                        <p className="mt-2 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                          Experience: {skill.years} {skill.years === 1 ? 'Year' : 'Years'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            const idx = profileData.skills.findIndex(
                              (s) =>
                                s?.name === skill?.name &&
                                s?.level === skill?.level &&
                                Number(s?.years) === Number(skill?.years)
                            )
                            openModal('skills', skill, idx >= 0 ? idx : null)
                          }}
                          aria-label={`Edit ${skill.name}`}
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveSkill(skill.name)}
                          aria-label={`Delete ${skill.name}`}
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <SectionEmpty>No skills added yet. Add your strongest tools so employers can match you correctly.</SectionEmpty>
              )}

              {filteredSkills.length > 12 ? (
                <Button variant="secondary" className="w-full rounded-xl" onClick={() => setShowAllSkills((value) => !value)}>
                  {showAllSkills ? 'Show fewer skills' : `Show all skills (${filteredSkills.length})`}
                </Button>
              ) : null}
              <Button variant="outline" className="w-full border-dashed group" onClick={() => openModal('skills')}>
                <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" />
                Add New Skill
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-xl glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xl flex items-center gap-2"><GraduationCap className="h-6 w-6 text-primary" />Academic Background</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => openModal('education')} className="h-8 w-8 rounded-full"><Plus className="h-4 w-4 text-primary" /></Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {profileData.education.length > 0 ? profileData.education.map((education, index) => (
                <div key={education.id} className="relative pl-6 border-l-2 border-primary/20 py-1 group">
                  <div className="absolute left-[-9px] top-2 h-4 w-4 rounded-full bg-primary border-4 border-background shadow-primary/20" />
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-base">{education.degree}</h4>
                      <p className="text-muted-foreground">{education.institution}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-primary bg-primary/5 px-2 py-1 rounded-md">{education.year ? `Class of ${education.year}` : 'Year pending'}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => openModal('education', education, index)}><Pencil className="h-3 w-3" /></Button>
                    </div>
                  </div>
                </div>
              )) : <SectionEmpty>Your academic background will appear here after you add your degree, institution, and graduation year.</SectionEmpty>}
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xl flex items-center gap-2"><Briefcase className="h-6 w-6 text-primary" />Featured Projects</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => openModal('projects')} className="h-8 w-8 rounded-full"><Plus className="h-4 w-4 text-primary" /></Button>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {profileData.projects.length > 0 ? profileData.projects.map((project) => (
                <div key={project.id} className="p-4 rounded-2xl border bg-background/30 border-white/20 group">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold">{project.title}</h4>
                    {project.link ? <Button variant="ghost" size="icon" className="h-7 w-7" asChild><a href={project.link} target="_blank" rel="noopener noreferrer"><ChevronRight className="h-4 w-4" /></a></Button> : null}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{project.description || 'Project description pending.'}</p>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-primary">
                    {project.link ? <a href={project.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline"><Globe className="h-3 w-3" /> Live Demo</a> : <span className="text-muted-foreground">Link not added</span>}
                    <span className="text-muted-foreground hover:text-destructive cursor-pointer" onClick={() => handleRemoveProject(project.id)}>Remove</span>
                  </div>
                </div>
              )) : <SectionEmpty fullWidth>Showcase your best work here. Projects help employers understand what you can actually build.</SectionEmpty>}
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl glass bg-gradient-to-br from-indigo-500/5 to-primary/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xl flex items-center gap-2"><Award className="h-6 w-6 text-primary" />Certifications</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => openModal('certifications')} className="h-8 w-8 rounded-full"><Plus className="h-4 w-4 text-primary" /></Button>
            </CardHeader>
            <CardContent>
              {profileData.certifications.length > 0 ? (
                <div className="space-y-3">
                  {profileData.certifications.map((certification, index) => (
                    <div key={`${certification.name}-${index}`} className="p-3 rounded-xl border bg-background/50 flex items-center justify-between group">
                      <div>
                        <p className="font-bold text-sm">{certification.name}</p>
                        <p className="text-xs text-muted-foreground">{[certification.issuer, certification.year].filter(Boolean).join(' | ') || 'Certification details pending'}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => openModal('certifications', certification, index)}><Pencil className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => handleRemoveCertification(index)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <SectionEmpty>Add certifications to showcase verified expertise to employers.</SectionEmpty>}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!activeModal} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="sm:max-w-[450px] border-none shadow-2xl glass-modal p-0 overflow-hidden">
          <div className="h-1.5 bg-primary w-full" />
          <DialogHeader className="p-6">
            <DialogTitle className="text-2xl font-bold capitalize">
              {activeModal === 'basics'
                ? 'Profile Basics'
                : activeModal === 'certifications'
                  ? 'Certification Editor'
                  : activeModal === 'preferences'
                    ? 'Job Preferences'
                    : `${activeModal} Editor`}
            </DialogTitle>
            <DialogDescription>Keep your profile up-to-date to ensure the best matching results.</DialogDescription>
          </DialogHeader>
          <div className="p-6 pt-0 space-y-6">
            {activeModal === 'basics' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Textarea
                    placeholder="A short intro about your strengths and interests..."
                    value={formValues.bio || ''}
                    onChange={(event) => setFormValues((value) => ({ ...value, bio: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    placeholder="e.g. Ahmedabad, India"
                    value={formValues.location || ''}
                    onChange={(event) => setFormValues((value) => ({ ...value, location: event.target.value }))}
                  />
                </div>
              </div>
            )}

            {activeModal === 'skills' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Skill Name</Label>
                  <Input placeholder="e.g. React, Python" value={formValues.name || ''} onChange={(event) => setFormValues((value) => ({ ...value, name: event.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Proficiency Level</Label>
                    <Select value={formValues.level || 'intermediate'} onValueChange={(value) => setFormValues((current) => ({ ...current, level: value }))}>
                      <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
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
                    <Input type="number" min="0" placeholder="0" value={formValues.years ?? ''} onChange={(event) => setFormValues((value) => ({ ...value, years: event.target.value }))} />
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'education' && (
              <div className="space-y-4">
                <div className="space-y-2"><Label>Degree / Certificate</Label><Input placeholder="e.g. B.Tech Computer Science" value={formValues.degree || ''} onChange={(event) => setFormValues((value) => ({ ...value, degree: event.target.value }))} /></div>
                <div className="space-y-2"><Label>Institution</Label><Input placeholder="e.g. State Technical University" value={formValues.institution || ''} onChange={(event) => setFormValues((value) => ({ ...value, institution: event.target.value }))} /></div>
                <div className="space-y-2"><Label>Graduation Year</Label><Input type="number" placeholder="2025" value={formValues.year || ''} onChange={(event) => setFormValues((value) => ({ ...value, year: event.target.value }))} /></div>
              </div>
            )}

            {activeModal === 'preferences' && (
              <div className="space-y-4">
                <div className="space-y-2"><Label>Preferred Locations</Label><Input placeholder="e.g. Remote, Bangalore, London" value={formValues.locations ?? ''} onChange={(event) => setFormValues((value) => ({ ...value, locations: event.target.value }))} /></div>
                <div className="space-y-2"><Label>Expected Minimum Salary (Annual)</Label><Input placeholder="e.g. INR 8,00,000 or $100,000" value={formValues.minSalary ?? ''} onChange={(event) => setFormValues((value) => ({ ...value, minSalary: event.target.value }))} /></div>
                <div className="space-y-2">
                  <Label>Job Category Interests</Label>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {JOB_TYPE_OPTIONS.map((tag) => (
                      <Badge key={tag} variant={formValues.jobTypes?.includes(tag) ? 'default' : 'secondary'} className="cursor-pointer hover:bg-primary hover:text-white transition-colors" onClick={() => setFormValues((value) => ({ ...value, jobTypes: (value.jobTypes || []).includes(tag) ? (value.jobTypes || []).filter((item) => item !== tag) : [...(value.jobTypes || []), tag] }))}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'projects' && (
              <div className="space-y-4">
                <div className="space-y-2"><Label>Project Title</Label><Input placeholder="Project Name" value={formValues.title || ''} onChange={(event) => setFormValues((value) => ({ ...value, title: event.target.value }))} /></div>
                <div className="space-y-2"><Label>Description</Label><Textarea placeholder="Tell us what you built..." value={formValues.description || ''} onChange={(event) => setFormValues((value) => ({ ...value, description: event.target.value }))} /></div>
                <div className="space-y-2"><Label>Project Link</Label><Input placeholder="https://github.com/..." value={formValues.link || ''} onChange={(event) => setFormValues((value) => ({ ...value, link: event.target.value }))} /></div>
              </div>
            )}

            {activeModal === 'certifications' && (
              <div className="space-y-4">
                <div className="space-y-2"><Label>Certification Name</Label><Input placeholder="e.g. AWS Certified Developer" value={formValues.name || ''} onChange={(event) => setFormValues((value) => ({ ...value, name: event.target.value }))} /></div>
                <div className="space-y-2"><Label>Issuing Organization</Label><Input placeholder="e.g. Amazon Web Services" value={formValues.issuer || ''} onChange={(event) => setFormValues((value) => ({ ...value, issuer: event.target.value }))} /></div>
                <div className="space-y-2"><Label>Year Obtained</Label><Input type="number" placeholder="2024" value={formValues.year || ''} onChange={(event) => setFormValues((value) => ({ ...value, year: event.target.value }))} /></div>
              </div>
            )}
          </div>
          <DialogFooter className="p-6 bg-muted/20 border-t">
            <Button variant="ghost" onClick={closeModal} className="rounded-xl">Cancel</Button>
            <Button onClick={handleSave} disabled={isLoading} className="shadow-lg shadow-primary/20 rounded-xl px-8">{isLoading ? 'Saving...' : 'Save Changes'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
