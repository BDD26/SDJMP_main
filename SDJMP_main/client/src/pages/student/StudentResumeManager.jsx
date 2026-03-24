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
import api from '@/services/api'
import { uploadResumeAsset } from '@/shared/api/cloudinary'

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

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function normalizeResumeFileName(name, fallbackExtension = 'html') {
  const trimmed = (name || 'resume').trim()
  const withoutPdf = trimmed.replace(/\.pdf$/i, '')
  const withoutDoc = withoutPdf.replace(/\.(doc|docx|html)$/i, '')
  return `${withoutDoc || 'resume'}.${fallbackExtension}`
}

function getUploadedResumeMimeType(resume) {
  return (resume?.data?.mimeType || '').toLowerCase()
}

function getUploadedResumePreviewUrl(resume) {
  if (!resume?.fileUrl) {
    return ''
  }

  const mimeType = getUploadedResumeMimeType(resume)
  if (!mimeType.includes('pdf')) {
    return ''
  }

  return resume.fileUrl.includes('#')
    ? resume.fileUrl
    : `${resume.fileUrl}#toolbar=0&navpanes=0&scrollbar=0`
}

function buildResumeDocumentMarkup(data = {}, user = null) {
  const fullName = escapeHtml(data.fullName || user?.name || 'Your Name')
  const email = escapeHtml(data.email || user?.email || '')
  const phone = escapeHtml(data.phone || '')
  const location = escapeHtml(data.location || '')
  const summary = escapeHtml(data.summary || '')
  const skills = Array.isArray(data.skills) ? data.skills.map(escapeHtml) : []
  const education = Array.isArray(data.education) ? data.education : []
  const experience = Array.isArray(data.experience) ? data.experience : []
  const projects = Array.isArray(data.projects) ? data.projects : []

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${fullName} Resume</title>
    <style>
      @page { size: A4; margin: 14mm; }
      * { box-sizing: border-box; }
      body { font-family: "Aptos", "Segoe UI", Arial, sans-serif; color: #1f2937; margin: 0; background: #e5e7eb; }
      main { width: 210mm; min-height: 297mm; margin: 0 auto; background: #ffffff; padding: 16mm 18mm; }
      header { border-bottom: 2px solid #1d4ed8; padding-bottom: 10px; margin-bottom: 18px; }
      h1 { margin: 0; font-size: 28px; line-height: 1.1; color: #0f172a; }
      h2 { font-size: 11px; letter-spacing: 0.24em; text-transform: uppercase; color: #1d4ed8; border-bottom: 1px solid #dbeafe; padding-bottom: 5px; margin: 18px 0 10px; }
      h3 { margin: 0; font-size: 14px; line-height: 1.35; color: #0f172a; }
      p, li, span, a { font-size: 11px; line-height: 1.5; }
      ul { margin: 6px 0 0 16px; padding: 0; }
      li { margin: 0 0 4px; }
      .meta { color: #475569; display: flex; gap: 12px; flex-wrap: wrap; margin-top: 8px; }
      .meta span { white-space: nowrap; }
      .chips { display: flex; flex-wrap: wrap; gap: 6px; }
      .chip { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; padding: 3px 8px; border-radius: 999px; font-size: 10px; font-weight: 600; }
      .entry { margin-bottom: 12px; }
      .entry-head { display: flex; justify-content: space-between; gap: 12px; align-items: baseline; }
      .muted { color: #475569; }
      .project-link { color: #1d4ed8; text-decoration: none; word-break: break-all; }
      .project-link:hover { text-decoration: underline; }
      @media screen {
        body { padding: 24px; }
        main { box-shadow: 0 18px 50px rgba(15, 23, 42, 0.14); }
      }
      @media print {
        body { background: #ffffff; padding: 0; }
        main { width: auto; min-height: auto; margin: 0; box-shadow: none; }
      }
    </style>
  </head>
  <body>
    <main>
      <header>
        <h1>${fullName}</h1>
        <div class="meta">
          ${email ? `<span>${email}</span>` : ''}
          ${phone ? `<span>${phone}</span>` : ''}
          ${location ? `<span>${location}</span>` : ''}
        </div>
      </header>

      ${summary ? `<section><h2>Professional Summary</h2><p>${summary}</p></section>` : ''}

      ${skills.length ? `<section><h2>Skills</h2><div class="chips">${skills.map((skill) => `<span class="chip">${skill}</span>`).join('')}</div></section>` : ''}

      ${experience.length ? `<section><h2>Experience</h2>${experience.map((exp) => `
        <div class="entry">
          <div class="entry-head">
            <h3>${escapeHtml(exp.title || '')}</h3>
            <span class="muted">${escapeHtml(exp.period || '')}</span>
          </div>
          <p class="muted">${escapeHtml(exp.company || '')}</p>
          ${(exp.bullets || []).filter(Boolean).length ? `<ul>${exp.bullets.filter(Boolean).map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul>` : ''}
        </div>
      `).join('')}</section>` : ''}

      ${education.length ? `<section><h2>Education</h2>${education.map((edu) => `
        <div class="entry">
          <h3>${escapeHtml(edu.degree || '')}</h3>
          <p class="muted">${escapeHtml(edu.institution || '')}${edu.year ? ` • ${escapeHtml(edu.year)}` : ''}</p>
        </div>
      `).join('')}</section>` : ''}

      ${projects.length ? `<section><h2>Projects</h2>${projects.map((project) => `
        <div class="entry">
          <h3>${escapeHtml(project.title || '')}</h3>
          <p>${escapeHtml(project.description || '')}</p>
          ${project.link ? `<a class="project-link" href="${escapeHtml(project.link)}">${escapeHtml(project.link)}</a>` : ''}
        </div>
      `).join('')}</section>` : ''}
    </main>
  </body>
</html>`
}

function triggerDownload({ href, filename }) {
  const link = document.createElement('a')
  link.href = href
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function toPdfSafeText(value = '') {
  return String(value)
    .normalize('NFKD')
    .replace(/[^\x20-\x7E]/g, '')
}

function escapePdfText(value = '') {
  return toPdfSafeText(value)
    .replaceAll('\\', '\\\\')
    .replaceAll('(', '\\(')
    .replaceAll(')', '\\)')
}

function wrapPdfText(text, fontSize, maxWidth) {
  const words = toPdfSafeText(text).split(/\s+/).filter(Boolean)

  if (words.length === 0) {
    return []
  }

  const averageCharWidth = fontSize * 0.52
  const maxChars = Math.max(12, Math.floor(maxWidth / averageCharWidth))
  const lines = []
  let currentLine = ''

  words.forEach((word) => {
    const candidate = currentLine ? `${currentLine} ${word}` : word
    if (candidate.length <= maxChars) {
      currentLine = candidate
      return
    }

    if (currentLine) {
      lines.push(currentLine)
    }

    currentLine = word
  })

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}

function buildResumePdfBlob(data = {}, user = null) {
  const documentData = {
    fullName: data.fullName || user?.name || 'Your Name',
    email: data.email || user?.email || '',
    phone: data.phone || '',
    location: data.location || '',
    summary: data.summary || '',
    skills: Array.isArray(data.skills) ? data.skills : [],
    education: Array.isArray(data.education) ? data.education : [],
    experience: Array.isArray(data.experience) ? data.experience : [],
    projects: Array.isArray(data.projects) ? data.projects : [],
  }

  const pageWidth = 595.28
  const pageHeight = 841.89
  const marginX = 48
  const topMargin = 60
  const bottomMargin = 54
  const contentWidth = pageWidth - marginX * 2
  const sectionGap = 18
  const lineGap = 6
  const pages = []
  let currentPage = []
  let y = pageHeight - topMargin

  const addPage = () => {
    currentPage = []
    pages.push(currentPage)
    y = pageHeight - topMargin
  }

  const ensureSpace = (requiredHeight) => {
    if (y - requiredHeight < bottomMargin) {
      addPage()
    }
  }

  const addTextLine = (text, {
    x = marginX,
    size = 11,
    font = 'F1',
    color = [0.12, 0.16, 0.22],
  } = {}) => {
    const safeText = escapePdfText(text)
    currentPage.push(
      `BT /${font} ${size} Tf ${color[0]} ${color[1]} ${color[2]} rg 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm (${safeText}) Tj ET`
    )
    y -= size + lineGap
  }

  const addWrappedBlock = (text, options = {}) => {
    const size = options.size || 11
    const lines = wrapPdfText(text, size, options.maxWidth || contentWidth)
    lines.forEach((line) => {
      ensureSpace(size + lineGap)
      addTextLine(line, options)
    })
  }

  const addSectionHeading = (title) => {
    ensureSpace(28)
    y -= 2
    addTextLine(title.toUpperCase(), {
      size: 11,
      font: 'F2',
      color: [0.11, 0.31, 0.85],
    })
    y -= 4
  }

  addPage()
  addTextLine(documentData.fullName, {
    size: 24,
    font: 'F2',
    color: [0.06, 0.09, 0.16],
  })

  const contactLine = [documentData.email, documentData.phone, documentData.location]
    .filter(Boolean)
    .join('   |   ')

  if (contactLine) {
    addWrappedBlock(contactLine, {
      size: 11,
      color: [0.33, 0.39, 0.48],
    })
  }

  y -= 8

  if (documentData.summary) {
    addSectionHeading('Professional Summary')
    addWrappedBlock(documentData.summary)
    y -= 6
  }

  if (documentData.skills.length > 0) {
    addSectionHeading('Skills')
    addWrappedBlock(documentData.skills.join(' | '))
    y -= 6
  }

  if (documentData.experience.length > 0) {
    addSectionHeading('Experience')
    documentData.experience.forEach((experienceItem) => {
      ensureSpace(48)
      addWrappedBlock(experienceItem.title || '', {
        size: 12,
        font: 'F2',
        color: [0.06, 0.09, 0.16],
      })

      if (experienceItem.period) {
        addWrappedBlock(experienceItem.period, {
          size: 10,
          color: [0.33, 0.39, 0.48],
        })
      }

      if (experienceItem.company) {
        addWrappedBlock(experienceItem.company, {
          size: 11,
          color: [0.11, 0.31, 0.85],
        })
      }

      ;(experienceItem.bullets || []).filter(Boolean).forEach((bullet) => {
        addWrappedBlock(`- ${bullet}`, {
          x: marginX + 14,
          maxWidth: contentWidth - 14,
        })
      })

      y -= 4
    })
  }

  if (documentData.education.length > 0) {
    addSectionHeading('Education')
    documentData.education.forEach((educationItem) => {
      ensureSpace(32)
      addWrappedBlock(educationItem.degree || '', {
        size: 12,
        font: 'F2',
        color: [0.06, 0.09, 0.16],
      })

      const educationMeta = [educationItem.institution, educationItem.year].filter(Boolean).join(' | ')
      if (educationMeta) {
        addWrappedBlock(educationMeta, {
          size: 11,
          color: [0.33, 0.39, 0.48],
        })
      }

      y -= 4
    })
  }

  if (documentData.projects.length > 0) {
    addSectionHeading('Projects')
    documentData.projects.forEach((projectItem) => {
      ensureSpace(42)
      addWrappedBlock(projectItem.title || '', {
        size: 12,
        font: 'F2',
        color: [0.06, 0.09, 0.16],
      })

      if (projectItem.description) {
        addWrappedBlock(projectItem.description)
      }

      if (projectItem.link) {
        addWrappedBlock(projectItem.link, {
          color: [0.11, 0.31, 0.85],
        })
      }

      y -= 4
    })
  }

  const objects = []
  const addObject = (content) => {
    objects.push(content)
    return objects.length
  }

  const catalogRef = addObject('<< /Type /Catalog /Pages 2 0 R >>')
  addObject('') // placeholder for Pages object
  const regularFontRef = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>')
  const boldFontRef = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>')

  const pageRefs = []

  pages.forEach((commands) => {
    const contentStream = commands.join('\n')
    const contentRef = addObject(
      `<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream`
    )
    const pageRef = addObject(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth.toFixed(2)} ${pageHeight.toFixed(2)}] /Resources << /Font << /F1 ${regularFontRef} 0 R /F2 ${boldFontRef} 0 R >> >> /Contents ${contentRef} 0 R >>`
    )
    pageRefs.push(pageRef)
  })

  objects[1] = `<< /Type /Pages /Count ${pageRefs.length} /Kids [${pageRefs.map((ref) => `${ref} 0 R`).join(' ')}] >>`

  let pdf = '%PDF-1.4\n'
  const offsets = [0]

  objects.forEach((objectContent, index) => {
    offsets.push(pdf.length)
    pdf += `${index + 1} 0 obj\n${objectContent}\nendobj\n`
  })

  const xrefOffset = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += '0000000000 65535 f \n'

  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
  })

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogRef} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

  return new Blob([pdf], { type: 'application/pdf' })
}

function sanitizeResumePublicIdSegment(value = '') {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function createResumePdfFile(data, user, name) {
  const pdfBlob = buildResumePdfBlob(data, user)
  return new File([pdfBlob], normalizeResumeFileName(name, 'pdf'), {
    type: 'application/pdf',
  })
}

export default function StudentResumeManager() {
  const { user } = useAuth()
  const fileInputRef = useRef(null)
  
  const [activeTab, setActiveTab] = useState('resumes')
  const [resumes, setResumes] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [isLoadingResumes, setIsLoadingResumes] = useState(true)
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

  const fetchResumes = async () => {
    try {
      setIsLoadingResumes(true)
      const data = await api.user.getResumes()
      setResumes(data.resumes || [])
    } catch (error) {
      toast.error('Failed to load resumes')
    } finally {
      setIsLoadingResumes(false)
    }
  }

  useEffect(() => {
    fetchResumes()
  }, [])

  const handleUploadClick = () => fileInputRef.current?.click()

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      toast.error('Please upload a PDF or Word document')
      e.target.value = ''
      return
    }
    setIsUploading(true)
    try {
      const uploadedAsset = await uploadResumeAsset(file, {
        publicId: `uploaded-${Date.now()}-${sanitizeResumePublicIdSegment(file.name)}`,
      })

      await api.user.createResume({
        name: file.name,
        type: 'uploaded',
        fileUrl: uploadedAsset.fileUrl,
        filePublicId: uploadedAsset.filePublicId,
        storageProvider: 'cloudinary',
        data: {
          mimeType: file.type,
          originalName: file.name,
          size: uploadedAsset.bytes || file.size,
          resourceType: uploadedAsset.resourceType,
          storageProvider: 'cloudinary',
        }
      })
      toast.success('Resume uploaded successfully')
      fetchResumes()
    } catch (error) {
       toast.error(error?.message || 'Upload failed')
    } finally {
       setIsUploading(false)
       e.target.value = ''
    }
  }

  const handleSaveBuiltResume = async () => {
    const baseName = resumeData.fullName.trim() || user?.name || 'student'
    const name = `${baseName.replace(/\s+/g, '_')}_Resume.pdf`
    try {
      const pdfFile = createResumePdfFile(resumeData, user, name)
      const uploadedAsset = await uploadResumeAsset(pdfFile, {
        publicId: `built-${Date.now()}-${sanitizeResumePublicIdSegment(baseName)}`,
        fileName: name,
      })

      await api.user.createResume({
        name,
        type: 'built',
        fileUrl: uploadedAsset.fileUrl,
        filePublicId: uploadedAsset.filePublicId,
        storageProvider: 'cloudinary',
        data: {
          ...resumeData,
          mimeType: 'application/pdf',
          size: uploadedAsset.bytes || pdfFile.size,
          storageProvider: 'cloudinary',
        }
      })
      setShowBuilder(false)
      setBuilderStep(1)
      toast.success('Resume created successfully')
      fetchResumes()
    } catch (error) {
      toast.error('Failed to create resume')
    }
  }

  const deleteResume = async (id) => {
    try {
      await api.user.deleteResume(id)
      setResumes(prev => prev.filter(r => r._id !== id))
      if (selectedResume?._id === id) {
        setSelectedResume(null)
        setShowPreview(false)
      }
      toast.success('Resume deleted')
    } catch (error) {
      toast.error('Failed to delete')
    }
  }

  const setPrimary = async (id) => {
    try {
      await api.user.updateResume(id, { isPrimary: true })
      toast.success('Primary resume updated')
      fetchResumes()
    } catch (error) {
      toast.error('Failed to set primary')
    }
  }

  const handlePreview = (resume) => {
    setSelectedResume(resume)
    setShowPreview(true)
  }

  const handleDownload = (resume) => {
    if (resume.fileUrl) {
      triggerDownload({
        href: resume.fileUrl,
        filename: normalizeResumeFileName(resume.name, 'pdf'),
      })
      toast.success(`Downloading ${resume.name}...`)
      return
    }

    if (resume.type === 'built') {
      try {
        const pdfBlob = buildResumePdfBlob(resume.data || resumeData, user)
        const url = URL.createObjectURL(pdfBlob)
        triggerDownload({
          href: url,
          filename: normalizeResumeFileName(resume.name, 'pdf'),
        })
        window.setTimeout(() => URL.revokeObjectURL(url), 1000)
        toast.success('Resume PDF downloaded')
      } catch (error) {
        toast.error('Failed to generate resume PDF')
      }
      return
    }

    toast.error('No file available to download')
  }

  const openRename = (resume) => {
    setSelectedResume(resume)
    setNewName(resume.name)
    setShowRename(true)
  }

  const handleRename = async () => {
    try {
      await api.user.updateResume(selectedResume._id, { name: newName })
      setShowRename(false)
      toast.success('Resume renamed')
      fetchResumes()
    } catch (error) {
      toast.error('Failed to rename resume')
    }
  }

  const getPreviewData = () => {
    if (selectedResume?.type === 'built' && selectedResume?.data) return selectedResume.data
    return resumeData
  }

  const uploadedResumePreviewUrl = getUploadedResumePreviewUrl(selectedResume)
  const canPreviewUploadedResume = Boolean(
    selectedResume?.type === 'uploaded' &&
    uploadedResumePreviewUrl
  )

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
        <TabsContent value="resumes" className="mt-0">
          <Card className="border-none shadow-xl glass overflow-hidden relative">
            <div className="pointer-events-none absolute top-0 right-0 p-8 opacity-5">
              <FileText className="h-32 w-32" />
            </div>
            <CardHeader className="relative z-10">
              <CardTitle>Your Resumes</CardTitle>
              <CardDescription>Upload files or create professional resumes with our builder.</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="grid gap-4">
                {isLoadingResumes ? (
                  <div className="py-8 text-center text-muted-foreground animate-pulse">Loading resumes...</div>
                ) : resumes.map((resume) => (
                  <div
                    key={resume._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border bg-background/50 hover:bg-background transition-all group cursor-pointer"
                    onClick={() => handlePreview(resume)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        handlePreview(resume)
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm truncate">{resume.name}</h4>
                          <Badge variant={resume.type === 'built' ? 'default' : 'outline'} className="text-[10px] h-5">
                            {resume.type === 'built' ? 'Builder' : resume.type}
                          </Badge>
                          {resume.isPrimary && <Badge variant="secondary" className="text-[10px]">Primary</Badge>}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(resume.createdAt).toLocaleDateString()}</span>
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          handlePreview(resume)
                        }}
                        aria-label={`Preview ${resume.name}`}
                        title="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleDownload(resume)
                        }}
                        aria-label={`Download ${resume.name}`}
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9"
                            type="button"
                            aria-label={`More actions for ${resume.name}`}
                            onClick={(event) => event.stopPropagation()}
                            onPointerDown={(event) => event.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(event) => {
                            event.stopPropagation()
                            setPrimary(resume._id)
                          }}>Set as Primary</DropdownMenuItem>
                          <DropdownMenuItem onClick={(event) => {
                            event.stopPropagation()
                            openRename(resume)
                          }}>
                            <Pencil className="h-4 w-4 mr-2" /> Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={(event) => {
                            event.stopPropagation()
                            deleteResume(resume._id)
                          }}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
                {!isLoadingResumes && resumes.length === 0 && (
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
                      <button type="button" onClick={() => removeSkill(i)} className="ml-0.5 hover:text-destructive font-bold leading-none">x</button>
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
                <Download className="h-4 w-4 mr-2" /> Download Resume
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-auto bg-slate-200 dark:bg-slate-900 p-6 md:p-10 flex justify-center print:bg-white">
            {/* Professional Resume Layout */}
            <div className="w-full max-w-[210mm] bg-white text-slate-800 shadow-2xl p-10 md:p-14 min-h-[297mm] print:shadow-none print:p-12 resume-preview">
              {selectedResume?.type === 'uploaded' ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center py-20">
                  {canPreviewUploadedResume ? (
                    <object
                      aria-label="Uploaded resume preview"
                      data={uploadedResumePreviewUrl}
                      type="application/pdf"
                      className="w-full min-h-[70vh] rounded-2xl border border-slate-200 bg-white"
                    >
                      <iframe
                        title={selectedResume?.name || 'Uploaded resume preview'}
                        src={uploadedResumePreviewUrl}
                        className="w-full min-h-[70vh] rounded-2xl border border-slate-200 bg-white"
                      />
                    </object>
                  ) : (
                    <>
                      <FileText className="h-20 w-20 text-slate-300 mb-4" />
                      <h3 className="text-lg font-semibold text-slate-600 mb-2">Uploaded Document</h3>
                      <p className="text-sm text-slate-500 max-w-md">
                        PDF previews are available after upload. Word documents can still be downloaded, but inline browser preview is not supported here.
                      </p>
                    </>
                  )}
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
