import { useEffect, useState } from 'react'
import {
  Building2,
  Calendar,
  Check,
  Edit2,
  Globe,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { PageHeader } from '@/components/shared/PageHeader'
import { employerAPI } from '@/services/api'

const DEFAULT_PROFILE = {
  name: '',
  industry: 'Technology & Software',
  description: '',
  culture: '',
  foundedYear: '',
  size: '11-50',
  location: '',
  website: '',
  email: '',
  phone: '',
  benefits: [],
}

export default function EmployerCompanyProfile() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE)
  const [draft, setDraft] = useState(DEFAULT_PROFILE)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newBenefit, setNewBenefit] = useState('')

  useEffect(() => {
    employerAPI.getCompanyProfile()
      .then((data) => {
        const merged = { ...DEFAULT_PROFILE, ...data }
        setProfile(merged)
        setDraft(merged)
      })
      .catch(() => toast.error('Failed to load company profile'))
      .finally(() => setLoading(false))
  }, [])

  const startEditing = () => {
    setDraft(profile)
    setNewBenefit('')
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setDraft(profile)
    setNewBenefit('')
    setIsEditing(false)
  }

  const saveProfile = async () => {
    setSaving(true)
    try {
      await employerAPI.updateCompanyProfile(draft)
      setProfile(draft)
      setIsEditing(false)
      toast.success('Company profile updated')
    } catch (err) {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const addBenefit = () => {
    const value = newBenefit.trim()
    if (!value) return
    setDraft((current) => ({ ...current, benefits: [...(current.benefits || []), value] }))
    setNewBenefit('')
  }

  const removeBenefit = (benefitToRemove) => {
    setDraft((current) => ({
      ...current,
      benefits: (current.benefits || []).filter((benefit) => benefit !== benefitToRemove),
    }))
  }

  if (loading) {
    return <div className="flex h-[400px] items-center justify-center text-muted-foreground">Loading profile...</div>
  }

  const company = isEditing ? draft : profile

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12">
      <PageHeader
        title="Company Profile"
        description="Present your team clearly so strong candidates understand the role, culture, and company context."
      >
        {isEditing ? (
          <>
            <Button variant="outline" onClick={cancelEditing} disabled={saving}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={saveProfile} disabled={saving} className="shadow-lg shadow-primary/20">
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </>
        ) : (
          <Button onClick={startEditing} className="shadow-lg shadow-primary/20">
            <Edit2 className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </PageHeader>

      <Card className="border-none shadow-xl glass overflow-hidden">
        <CardContent className="p-0">
          <div className="border-b bg-primary/5 px-6 py-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight">{company.name || 'Untitled Company'}</h2>
                  <p className="mt-1 text-muted-foreground">{company.industry}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="secondary">{company.size} employees</Badge>
                    <Badge variant="outline">{company.location || 'Location tbd'}</Badge>
                    {company.foundedYear && <Badge variant="outline">Founded {company.foundedYear}</Badge>}
                  </div>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <InfoPill icon={Users} label="Team Size" value={company.size} />
                <InfoPill icon={MapPin} label="HQ" value={company.location || '—'} />
                <InfoPill icon={Calendar} label="Founded" value={company.foundedYear || '—'} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-6">
          <SectionCard
            title="Company Story"
            description="Explain what you build, who you serve, and why this team is worth joining."
            icon={Building2}
          >
            <div className="space-y-5">
              <Field
                label="Company name"
                editing={isEditing}
                value={company.name}
                input={
                  <Input
                    value={draft.name}
                    onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Enter company name"
                  />
                }
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Industry"
                  editing={isEditing}
                  value={company.industry}
                  input={
                    <Select value={draft.industry} onValueChange={(value) => setDraft((current) => ({ ...current, industry: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Technology & Software">Technology & Software</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Consulting">Consulting</SelectItem>
                      </SelectContent>
                    </Select>
                  }
                />
                <Field
                  label="Company size"
                  editing={isEditing}
                  value={company.size}
                  input={
                    <Select value={draft.size} onValueChange={(value) => setDraft((current) => ({ ...current, size: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10</SelectItem>
                        <SelectItem value="11-50">11-50</SelectItem>
                        <SelectItem value="51-200">51-200</SelectItem>
                        <SelectItem value="201-500">201-500</SelectItem>
                        <SelectItem value="500+">500+</SelectItem>
                      </SelectContent>
                    </Select>
                  }
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Founded Year"
                  editing={isEditing}
                  value={company.foundedYear}
                  input={
                    <Input
                      value={draft.foundedYear}
                      onChange={(event) => setDraft((current) => ({ ...current, foundedYear: event.target.value }))}
                      placeholder="e.g. 2018"
                    />
                  }
                />
              </div>
              <Field
                label="Description"
                editing={isEditing}
                value={company.description}
                input={
                  <Textarea
                    value={draft.description}
                    onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                    rows={5}
                    placeholder="Tell candidates about your mission..."
                  />
                }
              />
              <Field
                label="Culture"
                editing={isEditing}
                value={company.culture}
                input={
                  <Textarea
                    value={draft.culture}
                    onChange={(event) => setDraft((current) => ({ ...current, culture: event.target.value }))}
                    rows={4}
                    placeholder="Describe the environment and values..."
                  />
                }
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Benefits"
            description="Highlight what candidates can expect beyond the job description."
            icon={Check}
          >
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {(company.benefits || []).map((benefit) => (
                  <Badge key={benefit} variant="secondary" className="px-3 py-1.5">
                    {benefit}
                    {isEditing ? (
                      <button type="button" className="ml-2" onClick={() => removeBenefit(benefit)} aria-label={`Remove ${benefit}`}>
                        <Trash2 className="h-3 w-3" />
                      </button>
                    ) : null}
                  </Badge>
                ))}
              </div>
              {isEditing ? (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input
                    value={newBenefit}
                    onChange={(event) => setNewBenefit(event.target.value)}
                    placeholder="Add a benefit"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                  />
                  <Button type="button" variant="outline" onClick={addBenefit}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add
                  </Button>
                </div>
              ) : null}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard
            title="Contact"
            description="Keep candidate-facing company details current."
            icon={Mail}
          >
            <div className="space-y-5">
              <Field
                label="Location"
                editing={isEditing}
                value={company.location}
                input={
                  <Input
                    value={draft.location}
                    onChange={(event) => setDraft((current) => ({ ...current, location: event.target.value }))}
                    placeholder="e.g. Bengaluru, India"
                  />
                }
              />
              <Field
                label="Website"
                editing={isEditing}
                value={company.website}
                input={
                  <Input
                    value={draft.website}
                    onChange={(event) => setDraft((current) => ({ ...current, website: event.target.value }))}
                    placeholder="https://..."
                  />
                }
              />
              <Field
                label="Email"
                editing={isEditing}
                value={company.email}
                input={
                  <Input
                    value={draft.email}
                    onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))}
                    placeholder="talent@company.com"
                  />
                }
              />
              <Field
                label="Phone"
                editing={isEditing}
                value={company.phone}
                input={
                  <Input
                    value={draft.phone}
                    onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))}
                    placeholder="+91 ..."
                  />
                }
              />
            </div>
          </SectionCard>

          <Card className="border-none shadow-xl glass">
            <CardHeader>
              <CardTitle>Profile Checklist</CardTitle>
              <CardDescription>Stronger company pages convert more qualified applicants.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { icon: Globe, label: 'Website included', done: Boolean(company.website) },
                { icon: MapPin, label: 'Location defined', done: Boolean(company.location) },
                { icon: Mail, label: 'Recruiting email added', done: Boolean(company.email) },
                { icon: Phone, label: 'Phone available', done: Boolean(company.phone) },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl border bg-background/50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <Badge variant={item.done ? 'secondary' : 'outline'}>
                    {item.done ? 'Done' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function SectionCard({ title, description, icon: Icon, children }) {
  return (
    <Card className="border-none shadow-xl glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function Field({ label, value, editing, input }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-widest text-muted-foreground font-bold">{label}</Label>
      {editing ? input : <div className="rounded-2xl border bg-background/50 px-4 py-3 text-sm leading-6">{value || <span className="text-muted-foreground italic">Not provided</span>}</div>}
    </div>
  )
}

function InfoPill({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border bg-background/60 px-4 py-3">
      <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" />
        {label}
      </div>
      <p className="text-sm font-semibold">{value || '—'}</p>
    </div>
  )
}
