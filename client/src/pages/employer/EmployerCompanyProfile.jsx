import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  Edit2, 
  Save, 
  X, 
  Upload, 
  MapPin, 
  Globe, 
  Users, 
  Mail, 
  Phone,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Check,
  AlertCircle,
  Camera,
  Plus,
  Calendar
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'

const INITIAL_COMPANY_DATA = {
  name: 'TechCorp Solutions',
  industry: 'Technology & Software',
  description: 'A leading technology company specializing in innovative software solutions. We are passionate about creating cutting-edge products that transform businesses and improve people\'s lives. Our team of talented engineers and designers work together to build scalable, user-friendly applications that solve real-world problems.',
  foundedYear: '2018',
  size: '51-200',
  location: 'Bangalore, India',
  website: 'https://techcorp.example.com',
  email: 'hr@techcorp.example.com',
  phone: '+91 80 1234 5678',
  logo: null,
  socialMedia: {
    linkedin: 'https://linkedin.com/company/techcorp',
    twitter: 'https://twitter.com/techcorp',
    facebook: 'https://facebook.com/techcorp',
    instagram: 'https://instagram.com/techcorp'
  },
  benefits: [
    'Health Insurance',
    'Flexible Work Hours',
    'Remote Work Options',
    'Professional Development',
    'Performance Bonuses'
  ],
  culture: 'Innovation-driven, collaborative, and results-oriented culture where creativity and technical excellence are celebrated.'
}

export default function EmployerCompanyProfile() {
  const { user } = useAuth()
  const [companyData, setCompanyData] = useState(INITIAL_COMPANY_DATA)
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState(INITIAL_COMPANY_DATA)
  const [isSaving, setIsSaving] = useState(false)

  const handleEdit = () => {
    setEditedData({ ...companyData })
    setIsEditing(true)
  }

  const handleCancel = () => {
    setEditedData({ ...companyData })
    setIsEditing(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    // Simulate API call
    setTimeout(() => {
      setCompanyData({ ...editedData })
      setIsEditing(false)
      setIsSaving(false)
      toast.success('Company profile updated successfully!')
    }, 1500)
  }

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSocialMediaChange = (platform, value) => {
    setEditedData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }))
  }

  const handleLogoUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditedData(prev => ({
          ...prev,
          logo: reader.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const addBenefit = () => {
    const newBenefit = prompt('Enter new benefit:')
    if (newBenefit && newBenefit.trim()) {
      setEditedData(prev => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit.trim()]
      }))
    }
  }

  const removeBenefit = (index) => {
    setEditedData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }))
  }

  if (isEditing) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight font-heading">
              Edit <span className="text-primary italic">Company Profile</span>
            </h1>
            <p className="text-muted-foreground font-medium mt-2">
              Update your company information and attract top talent
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              className="h-12 px-6 rounded-xl font-bold"
              disabled={isSaving}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              className="h-12 px-6 rounded-xl font-bold shadow-xl shadow-primary/20"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Logo Upload */}
        <Card className="border-none shadow-xl glass overflow-hidden">
          <CardHeader className="bg-primary/5 border-b px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Camera className="h-5 w-5 text-primary" />
              Company Logo
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="relative">
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl sm:rounded-2xl bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-muted-foreground/30">
                  {editedData.logo ? (
                    <img src={editedData.logo} alt="Company Logo" className="h-full w-full object-cover" />
                  ) : (
                    <Building2 className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-1.5 sm:p-2 cursor-pointer hover:bg-primary/90 transition-colors">
                  <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="text-center sm:text-left">
                <p className="font-bold text-base sm:text-lg">Upload your company logo</p>
                <p className="text-muted-foreground text-xs sm:text-sm">Recommended: Square image, at least 200x200px</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card className="border-none shadow-xl glass overflow-hidden">
          <CardHeader className="bg-primary/5 border-b px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Building2 className="h-5 w-5 text-primary" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="company-name" className="text-sm sm:text-base font-medium">Company Name *</Label>
                <Input
                  id="company-name"
                  value={editedData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="h-10 sm:h-12 rounded-xl text-sm sm:text-base"
                  placeholder="Enter company name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry" className="text-sm sm:text-base font-medium">Industry *</Label>
                <Select value={editedData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                  <SelectTrigger className="h-10 sm:h-12 rounded-xl text-sm sm:text-base">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technology & Software">Technology & Software</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="Retail">Retail</SelectItem>
                    <SelectItem value="Consulting">Consulting</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="founded" className="text-sm sm:text-base font-medium">Founded Year</Label>
                <Input
                  id="founded"
                  type="number"
                  value={editedData.foundedYear}
                  onChange={(e) => handleInputChange('foundedYear', e.target.value)}
                  className="h-10 sm:h-12 rounded-xl text-sm sm:text-base"
                  placeholder="e.g., 2018"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="size" className="text-sm sm:text-base font-medium">Company Size</Label>
                <Select value={editedData.size} onValueChange={(value) => handleInputChange('size', value)}>
                  <SelectTrigger className="h-10 sm:h-12 rounded-xl text-sm sm:text-base">
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201-500">201-500 employees</SelectItem>
                    <SelectItem value="501-1000">501-1000 employees</SelectItem>
                    <SelectItem value="1000+">1000+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm sm:text-base font-medium">Location *</Label>
                <Input
                  id="location"
                  value={editedData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="h-10 sm:h-12 rounded-xl text-sm sm:text-base"
                  placeholder="e.g., Bangalore, India"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website" className="text-sm sm:text-base font-medium">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={editedData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="h-10 sm:h-12 rounded-xl text-sm sm:text-base"
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Description */}
        <Card className="border-none shadow-xl glass overflow-hidden">
          <CardHeader className="bg-primary/5 border-b px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Edit2 className="h-5 w-5 text-primary" />
              Company Description
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm sm:text-base font-medium">Company Description *</Label>
              <Textarea
                id="description"
                value={editedData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="min-h-[100px] sm:min-h-[120px] rounded-xl resize-none text-sm sm:text-base"
                placeholder="Describe your company, mission, and what makes it unique..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                {editedData.description.length}/500 characters
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="culture" className="text-sm sm:text-base font-medium">Company Culture</Label>
              <Textarea
                id="culture"
                value={editedData.culture}
                onChange={(e) => handleInputChange('culture', e.target.value)}
                className="min-h-[80px] sm:min-h-[100px] rounded-xl resize-none text-sm sm:text-base"
                placeholder="Describe your work environment and company values..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="border-none shadow-xl glass overflow-hidden">
          <CardHeader className="bg-primary/5 border-b px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Mail className="h-5 w-5 text-primary" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm sm:text-base font-medium">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={editedData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="h-10 sm:h-12 rounded-xl text-sm sm:text-base"
                  placeholder="hr@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm sm:text-base font-medium">Phone</Label>
                <Input
                  id="phone"
                  value={editedData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="h-10 sm:h-12 rounded-xl text-sm sm:text-base"
                  placeholder="+91 80 1234 5678"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Media Links */}
        <Card className="border-none shadow-xl glass overflow-hidden">
          <CardHeader className="bg-primary/5 border-b px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Globe className="h-5 w-5 text-primary" />
              Social Media Links
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="linkedin" className="flex items-center gap-2 text-sm sm:text-base font-medium">
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </Label>
                <Input
                  id="linkedin"
                  type="url"
                  value={editedData.socialMedia.linkedin}
                  onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
                  className="h-10 sm:h-12 rounded-xl text-sm sm:text-base"
                  placeholder="https://linkedin.com/company/yourcompany"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter" className="flex items-center gap-2 text-sm sm:text-base font-medium">
                  <Twitter className="h-4 w-4" />
                  Twitter
                </Label>
                <Input
                  id="twitter"
                  type="url"
                  value={editedData.socialMedia.twitter}
                  onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                  className="h-10 sm:h-12 rounded-xl text-sm sm:text-base"
                  placeholder="https://twitter.com/yourcompany"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook" className="flex items-center gap-2 text-sm sm:text-base font-medium">
                  <Facebook className="h-4 w-4" />
                  Facebook
                </Label>
                <Input
                  id="facebook"
                  type="url"
                  value={editedData.socialMedia.facebook}
                  onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                  className="h-10 sm:h-12 rounded-xl text-sm sm:text-base"
                  placeholder="https://facebook.com/yourcompany"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram" className="flex items-center gap-2 text-sm sm:text-base font-medium">
                  <Instagram className="h-4 w-4" />
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  type="url"
                  value={editedData.socialMedia.instagram}
                  onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                  className="h-10 sm:h-12 rounded-xl text-sm sm:text-base"
                  placeholder="https://instagram.com/yourcompany"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card className="border-none shadow-xl glass overflow-hidden">
          <CardHeader className="bg-primary/5 border-b px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Check className="h-5 w-5 text-primary" />
              Employee Benefits
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {editedData.benefits.map((benefit, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1.5 text-xs sm:text-sm font-bold">
                    {benefit}
                    <button
                      onClick={() => removeBenefit(index)}
                      className="ml-2 hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <Button
                  onClick={addBenefit}
                  variant="outline"
                  size="sm"
                  className="rounded-xl font-bold h-8 sm:h-10"
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Add Benefit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight font-heading">
            Company <span className="text-primary italic">Profile</span>
          </h1>
          <p className="text-muted-foreground font-medium mt-2">
            Manage your company information and attract top talent
          </p>
        </div>
        <Button 
          onClick={handleEdit}
          className="h-12 px-6 rounded-xl font-bold shadow-xl shadow-primary/20"
        >
          <Edit2 className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      {/* Company Overview Card */}
      <Card className="border-none shadow-2xl glass overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 sm:p-8 border-b">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="relative">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl sm:rounded-2xl bg-primary/20 flex items-center justify-center overflow-hidden border-2 border-dashed border-muted-foreground/30">
                  {companyData.logo ? (
                    <img src={companyData.logo} alt="Company Logo" className="h-full w-full object-cover rounded-xl sm:rounded-2xl" />
                  ) : (
                    <Building2 className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                  )}
                </div>
              </div>
              <div className="text-center sm:text-left flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black font-heading truncate">{companyData.name}</h2>
                <p className="text-muted-foreground font-medium text-sm sm:text-base">{companyData.industry}</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 mt-2 sm:mt-3 text-xs sm:text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="truncate">{companyData.location}</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {companyData.size} employees
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Founded {companyData.foundedYear}
                  </span>
                </div>
                {/* Mobile-only info */}
                <div className="flex flex-col sm:hidden gap-2 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {companyData.size} employees
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Founded {companyData.foundedYear}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        {/* Company Description */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="border-none shadow-xl glass overflow-hidden">
            <CardHeader className="bg-primary/5 border-b px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Edit2 className="h-5 w-5 text-primary" />
                About Company
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 lg:p-8 space-y-6">
              <div>
                <h3 className="font-black text-base sm:text-lg mb-3 sm:mb-4">Company Description</h3>
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">{companyData.description}</p>
              </div>
              <div>
                <h3 className="font-black text-base sm:text-lg mb-3 sm:mb-4">Company Culture</h3>
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">{companyData.culture}</p>
              </div>
            </CardContent>
          </Card>

          {/* Employee Benefits */}
          <Card className="border-none shadow-xl glass overflow-hidden">
            <CardHeader className="bg-primary/5 border-b px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Check className="h-5 w-5 text-primary" />
                Employee Benefits
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {companyData.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-muted/30">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base">{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact & Links */}
        <div className="space-y-6">
          <Card className="border-none shadow-xl glass overflow-hidden">
            <CardHeader className="bg-primary/5 border-b px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Mail className="h-5 w-5 text-primary" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 lg:p-8 space-y-4">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium text-sm sm:text-base break-all">{companyData.email}</p>
                  </div>
                </div>
                {companyData.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="font-medium text-sm sm:text-base">{companyData.phone}</p>
                    </div>
                  </div>
                )}
                {companyData.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">Website</p>
                      <a 
                        href={companyData.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-sm sm:text-base text-primary hover:underline break-all"
                      >
                        Visit Website
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl glass overflow-hidden">
            <CardHeader className="bg-primary/5 border-b px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Globe className="h-5 w-5 text-primary" />
                Social Media
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="space-y-3">
                {companyData.socialMedia.linkedin && (
                  <a 
                    href={companyData.socialMedia.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Linkedin className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base">LinkedIn</span>
                  </a>
                )}
                {companyData.socialMedia.twitter && (
                  <a 
                    href={companyData.socialMedia.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Twitter className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base">Twitter</span>
                  </a>
                )}
                {companyData.socialMedia.facebook && (
                  <a 
                    href={companyData.socialMedia.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Facebook className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base">Facebook</span>
                  </a>
                )}
                {companyData.socialMedia.instagram && (
                  <a 
                    href={companyData.socialMedia.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Instagram className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="font-medium text-sm sm:text-base">Instagram</span>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .glass {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.4);
        }
        .dark .glass {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}} />
    </div>
  )
}
