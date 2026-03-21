import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Plus, 
  Trash2, 
  ChevronLeft, 
  Save, 
  Sparkles,
  Info,
  Building2,
  FileText,
  Target,
  AlertTriangle,
  Users
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

export default function JobPostForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const [formData, setFormData] = useState({
    title: isEditing ? 'Senior React Developer' : '',
    type: 'Full-time',
    location: isEditing ? 'San Francisco, CA' : '',
    salary: isEditing ? '$120k - $160k' : '',
    deadline: isEditing ? '2026-04-15' : '',
    description: isEditing ? 'We are looking for a Senior React Developer...' : '',
    skills: isEditing ? [
      { name: 'React', weight: 40, level: 'Expert' },
      { name: 'TypeScript', weight: 30, level: 'Advanced' }
    ] : [],
    status: isEditing ? 'Active' : 'Draft'
  })

  const [newSkill, setNewSkill] = useState({ name: '', weight: 10, level: 'Intermediate' })

  const addSkill = () => {
    if (!newSkill.name) return
    setFormData({ ...formData, skills: [...formData.skills, newSkill] })
    setNewSkill({ name: '', weight: 10, level: 'Intermediate' })
  }

  const removeSkill = (idx) => {
    setFormData({ ...formData, skills: formData.skills.filter((_, i) => i !== idx) })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    toast.success(isEditing ? 'Job updated successfully!' : 'Job posted successfully!')
    navigate('/employer/jobs')
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{isEditing ? 'Edit Job Posting' : 'Post New Job'}</h1>
            <p className="text-muted-foreground mt-1">Fill in the details to find the perfect candidate.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          <Button onClick={handleSubmit} className="shadow-lg shadow-primary/20 px-8 rounded-xl font-bold">
            <Save className="h-4 w-4 mr-2" />
            {isEditing ? 'Update Job' : 'Post Job'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-xl glass overflow-hidden">
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
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="h-12 text-lg rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Employment Type</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Freelance">Freelance</SelectItem>
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
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
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
                      placeholder="e.g. $80k - $120k" 
                      value={formData.salary}
                      onChange={(e) => setFormData({...formData, salary: e.target.value})}
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
                      onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                      className="pl-10 h-12 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Posting Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active (Visible to Students)</SelectItem>
                      <SelectItem value="Draft">Draft (Private)</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
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
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl glass overflow-hidden">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Skill Requirements & Weights
              </CardTitle>
              <CardDescription>Assign weights to skills to fine-tune the Match Score algorithm.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="bg-muted/30 p-6 rounded-2xl border border-dashed border-muted-foreground/30 flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <Label>Skill Name</Label>
                  <Input 
                    placeholder="e.g. Python" 
                    value={newSkill.name} 
                    onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
                    className="rounded-xl h-11"
                  />
                </div>
                <div className="w-full md:w-32 space-y-2">
                  <Label>Level</Label>
                  <Select value={newSkill.level} onValueChange={(v) => setNewSkill({...newSkill, level: v})}>
                    <SelectTrigger className="rounded-xl h-11">
                      <SelectValue />
                    </SelectTrigger>
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
                    onValueChange={([v]) => setNewSkill({...newSkill, weight: v})}
                    max={100}
                    step={5}
                  />
                </div>
                <Button onClick={addSkill} className="rounded-xl h-11 px-6">
                  <Plus className="h-4 w-4 mr-2" /> Add
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
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-xl glass overflow-hidden sticky top-24">
            <CardHeader className="bg-primary text-white">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI Match Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-2">Algorithm Confidence</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-primary">High</span>
                  <Badge className="bg-emerald-500 text-white mb-1">94% Accurate</Badge>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Based on your weights, we will prioritize candidates with <b>{formData.skills[0]?.name || 'relevant'}</b> experience.
                </p>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Estimated Reach</p>
                  <div className="flex justify-between items-center bg-muted/30 p-3 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="font-bold text-sm">Targeted Students</span>
                    </div>
                    <span className="font-black">1.2k+</span>
                  </div>
                </div>
              </div>

              <Button variant="ghost" className="w-full text-xs text-primary gap-1">
                <Info className="h-3 w-3" />
                Learn about weighted matching
              </Button>
            </CardContent>
            <CardFooter className="bg-muted/5 border-t p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-muted-foreground">
                  Your job will be reviewed by placement admins within 24 hours. Ensure your company profile is up to date.
                </p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .glass {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .dark .glass {
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}} />
    </div>
  )
}
