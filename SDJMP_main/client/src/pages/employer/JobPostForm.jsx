import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Plus,
  Trash2,
  Save,
  Info,
  FileText,
  Target
} from 'lucide-react'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { GlassCard } from '@/components/shared/GlassCard'
import { jobsAPI } from '@/services/api'

const EMPTY_FORM = {
  title: '',
  type: 'full-time',
  location: '',
  salary: '',
  deadline: '',
  description: '',
  skills: [],
  status: 'draft',
}

export default function JobPostForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const [formData, setFormData] = useState(EMPTY_FORM)
  const [newSkill, setNewSkill] = useState({ name: '', weight: 10, level: 'Intermediate' })
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isEditing) return
    setLoading(true)
    jobsAPI.getById(id)
      .then((job) => {
        setFormData({
          title:       job.title || '',
          type:        job.type  || 'full-time',
          location:    job.location || '',
          salary:      job.salary || '',
          deadline:    job.deadline ? job.deadline.slice(0, 10) : '',
          description: job.description || '',
          // Prefer skillRequirements if available, fallback to skills strings
          skills: job.skillRequirements && job.skillRequirements.length > 0
            ? job.skillRequirements.map(sr => ({ name: sr.name, weight: sr.weight, level: sr.level }))
            : (job.skills || []).map((name) => ({ name, weight: 10, level: 'Intermediate' })),
          status: job.status || 'draft',
        })
      })
      .catch(() => toast.error('Failed to load job data'))
      .finally(() => setLoading(false))
  }, [id, isEditing])

  const addSkill = () => {
    if (!newSkill.name.trim()) return
    setFormData({ ...formData, skills: [...formData.skills, { ...newSkill }] })
    setNewSkill({ name: '', weight: 10, level: 'Intermediate' })
  }

  const removeSkill = (idx) => {
    setFormData({ ...formData, skills: formData.skills.filter((_, i) => i !== idx) })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) { toast.error('Job title is required'); return }

    const payload = {
      title:       formData.title,
      type:        formData.type,
      location:    formData.location,
      salary:      formData.salary,
      deadline:    formData.deadline || '',
      description: formData.description,
      skills:      formData.skills.map((s) => s.name),
      skillRequirements: formData.skills.map(s => ({
        name: s.name,
        weight: s.weight,
        level: s.level
      })),
      status:      formData.status,
    }

    setSaving(true)
    try {
      if (isEditing) {
        await jobsAPI.update(id, payload)
        toast.success('Job updated successfully!')
      } else {
        await jobsAPI.create(payload)
        toast.success('Job posted successfully!')
      }
      navigate('/employer/jobs')
    } catch (err) {
      toast.error(err?.message || 'Failed to save job')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-muted-foreground text-sm">
        Loading job details…
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
      <PageHeader
        title={isEditing ? 'Edit Job Posting' : 'Post New Job'}
        description="Fill in the details to find the perfect candidate."
      >
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving} className="shadow-lg shadow-primary/20 px-8 rounded-xl font-bold">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving…' : isEditing ? 'Update Job' : 'Post Job'}
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <GlassCard className="overflow-hidden">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Senior Frontend Developer"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="h-12 text-lg rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Employment Type</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      placeholder="e.g. Remote or City, State"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="pl-10 h-12 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary Range</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="salary"
                      placeholder="e.g. $80k – $120k"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      className="pl-10 h-12 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Application Deadline</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="pl-10 h-12 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Posting Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Published (Visible to Students)</SelectItem>
                      <SelectItem value="draft">Draft (Private)</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Job Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the role, responsibilities, and team culture..."
                  className="min-h-[200px] rounded-xl p-4"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </CardContent>
          </GlassCard>

          <GlassCard className="overflow-hidden">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Skill Requirements & Weights
              </CardTitle>
              <CardDescription>
                Add the skills this role requires. Higher-weighted skills contribute more to the candidate match score.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="bg-muted/30 p-6 rounded-2xl border border-dashed border-muted-foreground/30 flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <Label>Skill Name</Label>
                  <Input
                    placeholder="e.g. Python"
                    value={newSkill.name}
                    onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                    className="rounded-xl h-11"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                </div>
                <div className="w-full md:w-32 space-y-2">
                  <Label>Level</Label>
                  <Select value={newSkill.level} onValueChange={(v) => setNewSkill({ ...newSkill, level: v })}>
                    <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="Expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full md:w-48 space-y-4 px-2 pb-2">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    <Label>Weight</Label>
                    <span>{newSkill.weight}%</span>
                  </div>
                  <Slider
                    value={[newSkill.weight]}
                    onValueChange={([v]) => setNewSkill({ ...newSkill, weight: v })}
                    max={100}
                    step={5}
                  />
                </div>
                <Button onClick={addSkill} className="rounded-xl h-11 px-6">
                  <Plus className="h-4 w-4 mr-2" />Add
                </Button>
              </div>

              <div className="space-y-4">
                {formData.skills.map((skill, idx) => (
                  <div key={idx} className="flex items-center gap-6 p-4 rounded-2xl border bg-background group hover:border-primary/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold">{skill.name}</span>
                        <Badge variant="secondary" className="text-[10px] h-5">{skill.level}+</Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <Progress value={skill.weight} className="h-1.5 flex-1" />
                        <span className="text-sm font-black text-primary w-12 text-right">{skill.weight}%</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSkill(idx)}
                      className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {formData.skills.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Info className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    <p>No skills specified. Add skills to improve candidate matching.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </GlassCard>
        </div>  
      </div>
    </div>
  )
}

