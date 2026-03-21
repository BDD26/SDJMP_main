import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  MessageCircle,
  FileText,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Search,
  Filter,
  Star,
  Clock,
  Calendar,
  MapPin,
  Sun,
  Moon,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  User,
  ExternalLink,
  StickyNote,
  Info,
  GraduationCap,
  Sparkles
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

const INITIAL_APPLICANTS = [
  {
    id: 1,
    name: 'Alice Johnson',
    position: 'Senior React Developer',
    matchScore: 92,
    status: 'shortlisted',
    appliedDate: '2 days ago',
    avatar: '',
    email: 'alice.j@uni.edu',
    location: 'Bangalore',
    skills: [
      { name: 'React', level: 'Expert', match: true },
      { name: 'TypeScript', level: 'Advanced', match: true },
      { name: 'Node.js', level: 'Intermediate', match: false }
    ],
    notes: 'Strong portfolio, impressed by the system design'
  },
  {
    id: 2,
    name: 'Bob Smith',
    position: 'Senior React Developer',
    matchScore: 78,
    status: 'applied',
    appliedDate: '3 days ago',
    avatar: '',
    email: 'bob.smith@tech.com',
    location: 'Remote',
    skills: [
      { name: 'React', level: 'Advanced', match: true },
      { name: 'JavaScript', level: 'Expert', match: true },
      { name: 'CSS', level: 'Advanced', match: false }
    ],
    notes: ''
  },
  {
    id: 3,
    name: 'Charlie Brown',
    position: 'Senior React Developer',
    matchScore: 65,
    status: 'rejected',
    appliedDate: '5 days ago',
    avatar: '',
    email: 'charlie.b@out.com',
    location: 'New Delhi',
    skills: [
      { name: 'React', level: 'Intermediate', match: false },
      { name: 'Next.js', level: 'Beginner', match: false }
    ],
    notes: 'Missing required years of experience in TypeScript'
  }
]

const statusConfig = {
  applied: { label: 'Applied', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  shortlisted: { label: 'Shortlisted', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  interview: { label: 'Interviewing', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  rejected: { label: 'Rejected', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
}

export default function EmployerApplicants() {
  const { id: jobId } = useParams()
  const [applicants, setApplicants] = useState(INITIAL_APPLICANTS)
  const [activeTab, setActiveTab] = useState('all')
  const [selectedApplicant, setSelectedApplicant] = useState(null)
  const [noteText, setNoteText] = useState('')
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false)
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false)
  const [rescheduleData, setRescheduleData] = useState({
    date: '',
    time: '',
    location: '',
    type: 'video',
    notes: ''
  })
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Debug message
  console.log('EmployerApplicants component loaded, jobId:', jobId)

  const updateStatus = (id, newStatus) => {
    setApplicants(applicants.map(a => a.id === id ? { ...a, status: newStatus } : a))
    toast.success(`Applicant status updated to ${newStatus}`)
  }

  const handleOpenBreakdown = (applicant) => {
    setSelectedApplicant(applicant)
    setIsBreakdownOpen(true)
  }

  const handleReschedule = (applicant) => {
    setSelectedApplicant(applicant)
    // Load existing interview data or set defaults
    setRescheduleData({
      date: applicant.interviewDate || '',
      time: applicant.interviewTime || '',
      location: applicant.interviewLocation || '',
      type: applicant.interviewType || 'video',
      notes: applicant.interviewNotes || ''
    })
    setIsRescheduleOpen(true)
  }

  const handleSaveReschedule = () => {
    if (!selectedApplicant) return
    
    // Update applicant with new interview data
    setApplicants(applicants.map(a => 
      a.id === selectedApplicant.id 
        ? { 
            ...a, 
            interviewDate: rescheduleData.date,
            interviewTime: rescheduleData.time,
            interviewLocation: rescheduleData.location,
            interviewType: rescheduleData.type,
            interviewNotes: rescheduleData.notes,
            status: 'interview' // Update status to interviewing
          } 
        : a
    ))
    
    setIsRescheduleOpen(false)
    toast.success('Interview scheduled successfully!')
  }

  const filteredApplicants = applicants.filter(a => {
    const matchesTab = activeTab === 'all' || a.status === activeTab
    const matchesSearch = searchQuery === '' || 
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.position.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  // Get job title from URL or use default
  const getJobTitle = () => {
    if (jobId) {
      // In a real app, you'd fetch the job details
      return INITIAL_APPLICANTS[0]?.position || 'Senior React Developer'
    }
    return 'All Positions'
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-white to-blue-50/30'} p-3 sm:p-4 md:p-6 lg:p-8 transition-colors duration-300`}>
      {/* Main Header */}
      <div className="mb-6 sm:mb-8 lg:mb-10">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 lg:gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="h-0.5 w-6 sm:h-1 sm:w-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" />
              <Badge className="bg-gradient-to-r from-blue-500/10 to-blue-500/5 text-blue-600 hover:from-blue-500/20 hover:to-blue-500/10 transition-all duration-300 py-1.5 px-3 sm:px-4 border border-blue-500/20 shadow-sm text-xs sm:text-sm">
                Talent Pipeline
              </Badge>
            </div>
            <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight font-heading mb-3 sm:mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            } transition-colors duration-300`}>
              Applicant <span className="text-blue-600 italic bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">Tracking</span>
            </h1>
            <p className={`text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl leading-relaxed max-w-3xl ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            } transition-colors duration-300`}>
              Review candidates for <span className={`font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              } transition-colors duration-300`}>All Positions</span>. Filter by score, stage, or skills.
            </p>
          </div>
          
          {/* Dark Theme Toggle */}
          <Button
            onClick={() => setIsDarkMode(!isDarkMode)}
            variant="outline"
            className={`h-10 sm:h-12 lg:h-14 px-3 sm:px-4 lg:px-6 rounded-lg sm:rounded-xl lg:rounded-2xl font-medium text-xs sm:text-sm lg:text-base transition-all duration-300 ${
              isDarkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:shadow-lg hover:shadow-gray-800/20' 
                : 'border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-lg hover:shadow-gray-300/20'
            }`}
          >
            {isDarkMode ? (
              <>
                <Sun className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 sm:mb-8">
        <div className="relative max-w-lg sm:max-w-xl lg:max-w-2xl">
          <Search className={`absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-400'
          } transition-colors duration-300`} />
          <input
            type="text"
            placeholder="Search by name or position..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full h-10 sm:h-12 lg:h-14 pl-10 sm:pl-12 pr-4 sm:pr-6 border rounded-lg sm:rounded-xl lg:rounded-2xl focus:outline-none focus:ring-2 transition-all duration-300 text-sm sm:text-base lg:text-lg ${
              isDarkMode 
                ? 'bg-gray-800/50 backdrop-blur-sm border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 focus:bg-gray-800' 
                : 'bg-white/70 backdrop-blur-sm border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 focus:bg-white'
            }`}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-8 sm:mb-10">
        <Button
          variant={activeTab === 'all' ? 'default' : 'outline'}
          onClick={() => setActiveTab('all')}
          className={`h-9 sm:h-10 lg:h-12 px-3 sm:px-4 lg:px-6 rounded-lg sm:rounded-xl lg:rounded-2xl font-medium text-xs sm:text-sm lg:text-base transition-all duration-300 ${
            activeTab === 'all' 
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30' 
              : isDarkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:shadow-lg hover:shadow-gray-800/20' 
                : 'border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-lg hover:shadow-gray-300/20'
          }`}
        >
          All ({applicants.length})
        </Button>
        <Button
          variant={activeTab === 'applied' ? 'default' : 'outline'}
          onClick={() => setActiveTab('applied')}
          className={`h-9 sm:h-10 lg:h-12 px-3 sm:px-4 lg:px-6 rounded-lg sm:rounded-xl lg:rounded-2xl font-medium text-xs sm:text-sm lg:text-base transition-all duration-300 ${
            activeTab === 'applied' 
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30' 
              : isDarkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:shadow-lg hover:shadow-gray-800/20' 
                : 'border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-lg hover:shadow-gray-300/20'
          }`}
        >
          Applied ({applicants.filter(a => a.status === 'applied').length})
        </Button>
        <Button
          variant={activeTab === 'shortlisted' ? 'default' : 'outline'}
          onClick={() => setActiveTab('shortlisted')}
          className={`h-9 sm:h-10 lg:h-12 px-3 sm:px-4 lg:px-6 rounded-lg sm:rounded-xl lg:rounded-2xl font-medium text-xs sm:text-sm lg:text-base transition-all duration-300 ${
            activeTab === 'shortlisted' 
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30' 
              : isDarkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:shadow-lg hover:shadow-gray-800/20' 
                : 'border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-lg hover:shadow-gray-300/20'
          }`}
        >
          Shortlisted ({applicants.filter(a => a.status === 'shortlisted').length})
        </Button>
        <Button
          variant={activeTab === 'rejected' ? 'default' : 'outline'}
          onClick={() => setActiveTab('rejected')}
          className={`h-9 sm:h-10 lg:h-12 px-3 sm:px-4 lg:px-6 rounded-lg sm:rounded-xl lg:rounded-2xl font-medium text-xs sm:text-sm lg:text-base transition-all duration-300 ${
            activeTab === 'rejected' 
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30' 
              : isDarkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:shadow-lg hover:shadow-gray-800/20' 
                : 'border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-lg hover:shadow-gray-300/20'
          }`}
        >
          Rejected ({applicants.filter(a => a.status === 'rejected').length})
        </Button>
      </div>
        
      {/* Results Header */}
      <div className="mb-6 sm:mb-8">
        <h2 className={`text-lg sm:text-xl lg:text-2xl xl:text-3xl font-semibold mb-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        } transition-colors duration-300`}>
          Applicants ({filteredApplicants.length})
          {searchQuery && <span className={`text-sm sm:text-base font-normal ml-2 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          } transition-colors duration-300`}>- Search: "{searchQuery}"</span>}
        </h2>
      </div>

      {/* Applicant Cards */}
      {filteredApplicants.length === 0 ? (
        <div className={`text-center py-12 sm:py-16 lg:py-20 border-2 border-dashed rounded-xl sm:rounded-2xl lg:rounded-3xl transition-colors duration-300 ${
          isDarkMode 
            ? 'border-gray-600 bg-gray-800/50' 
            : 'border-gray-300 bg-gray-50/50'
        }`}>
          <Search className={`h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 mx-auto mb-4 sm:mb-6 ${
            isDarkMode ? 'text-gray-500' : 'text-gray-400'
          } transition-colors duration-300`} />
          <h3 className={`text-lg sm:text-xl lg:text-2xl font-semibold mb-2 sm:mb-3 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          } transition-colors duration-300`}>No applicants found</h3>
          <p className={`text-sm sm:text-base max-w-md mx-auto ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          } transition-colors duration-300`}>
            {searchQuery 
              ? `No results for "${searchQuery}". Try a different search term.` 
              : 'No applicants match the current filter.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {filteredApplicants.map(applicant => (
            <div key={applicant.id} className={`border rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-4 sm:p-6 lg:p-8 group hover:scale-[1.02] hover:-translate-y-1 ${
              isDarkMode 
                ? 'bg-gray-800/50 backdrop-blur-sm border-gray-600 hover:bg-gray-800/70 hover:border-gray-500' 
                : 'bg-white/70 backdrop-blur-sm border-gray-200 hover:bg-white hover:border-blue-200'
            }`}>
              <div className="flex flex-col h-full">
                {/* Header Section */}
                <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className={`h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${
                    isDarkMode ? 'bg-blue-900/50' : 'bg-blue-100'
                  }`}>
                    <User className={`h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 transition-colors duration-300 ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2 truncate transition-colors duration-300 ${
                      isDarkMode ? 'text-white group-hover:text-blue-400' : 'text-gray-900 group-hover:text-blue-600'
                    }`}>{applicant.name}</h3>
                    <p className={`text-sm sm:text-base mb-2 truncate transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>{applicant.position}</p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                        applicant.status === 'shortlisted' ? 'bg-green-100 text-green-700 border border-green-200' :
                        applicant.status === 'applied' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                        applicant.status === 'rejected' ? 'bg-red-100 text-red-700 border border-red-200' :
                        'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}>
                        {statusConfig[applicant.status].label}
                      </span>
                      <span className={`text-xs sm:text-sm transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>{applicant.appliedDate}</span>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 space-y-3 sm:space-y-4">
                  <div className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="truncate">{applicant.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="truncate">{applicant.email}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Section */}
                <div className="mt-auto pt-4 sm:pt-6 border-t border-gray-200/50">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div className="text-center sm:text-left">
                      <div className="text-2xl sm:text-3xl font-bold text-blue-600">{applicant.matchScore}%</div>
                      <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>Match Score</div>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      <Button size="sm" onClick={() => handleOpenBreakdown(applicant)} className={`h-8 sm:h-10 px-3 sm:px-4 rounded-lg font-medium transition-all duration-300 ${
                        isDarkMode 
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:shadow-lg hover:shadow-gray-800/20' 
                          : 'border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-lg hover:shadow-gray-300/20'
                      }`}>
                        <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden sm:inline">Details</span>
                      </Button>
                      <Button size="sm" onClick={() => updateStatus(applicant.id, 'shortlisted')} className="h-8 sm:h-10 px-3 sm:px-4 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300">
                        <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden sm:inline">Shortlist</span>
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleReschedule(applicant)} className={`h-8 sm:h-10 px-3 sm:px-4 rounded-lg font-medium transition-all duration-300 ${
                        isDarkMode 
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:shadow-lg hover:shadow-gray-800/20' 
                          : 'border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-lg hover:shadow-gray-300/20'
                      }`}>
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden sm:inline">Schedule</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Reschedule Dialog */}
      <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
        <DialogContent className={`sm:max-w-[600px] lg:max-w-[700px] rounded-2xl sm:rounded-3xl shadow-2xl transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-600' 
            : 'bg-white border-gray-200'
        }`}>
          <DialogHeader className="pb-6 sm:pb-8">
            <DialogTitle className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
              Schedule Interview
            </DialogTitle>
            <DialogDescription className={`text-base sm:text-lg mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
              Schedule an interview with <span className="font-semibold text-blue-600">{selectedApplicant?.name}</span> for the <span className="font-semibold text-blue-600">{selectedApplicant?.position}</span> position.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 sm:space-y-8 py-6 sm:py-8">
            {/* Applicant Details */}
            <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 border transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-blue-900/30 border-blue-700' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className={`h-12 w-12 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl flex items-center justify-center ${
                  isDarkMode ? 'bg-blue-800' : 'bg-blue-100'
                }`}>
                  <User className={`h-5 w-5 sm:h-6 sm:w-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} transition-colors duration-300`} />
                </div>
                <div>
                  <h4 className={`font-semibold text-lg sm:text-xl ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>{selectedApplicant?.name}</h4>
                  <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>{selectedApplicant?.position}</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>Match Score: {selectedApplicant?.matchScore}%</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm sm:text-base">
                <span className={`flex items-center gap-1 sm:gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                  {selectedApplicant?.location}
                </span>
                <span className={`flex items-center gap-1 sm:gap-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                  {selectedApplicant?.appliedDate}
                </span>
              </div>
            </div>

            {/* Interview Form */}
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label className={`text-sm sm:text-base font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}>Interview Date</Label>
                  <Input 
                    type="date" 
                    value={rescheduleData.date}
                    onChange={(e) => setRescheduleData({...rescheduleData, date: e.target.value})}
                    className={`h-12 sm:h-14 lg:h-16 rounded-lg sm:rounded-xl lg:rounded-2xl text-sm sm:text-base lg:text-lg focus:ring-2 transition-colors duration-300 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400 focus:ring-blue-100' 
                        : 'bg-white border-gray-200 text-gray-900 focus:border-blue-400 focus:ring-blue-100'
                    }`}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className={`text-sm sm:text-base font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}>Interview Time</Label>
                  <Input 
                    type="time" 
                    value={rescheduleData.time}
                    onChange={(e) => setRescheduleData({...rescheduleData, time: e.target.value})}
                    className={`h-12 sm:h-14 lg:h-16 rounded-lg sm:rounded-xl lg:rounded-2xl text-sm sm:text-base lg:text-lg focus:ring-2 transition-colors duration-300 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400 focus:ring-blue-100' 
                        : 'bg-white border-gray-200 text-gray-900 focus:border-blue-400 focus:ring-blue-100'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className={`text-sm sm:text-base font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}>Interview Type</Label>
                <select 
                  value={rescheduleData.type}
                  onChange={(e) => setRescheduleData({...rescheduleData, type: e.target.value})}
                  className={`w-full h-12 sm:h-14 lg:h-16 px-4 sm:px-6 rounded-lg sm:rounded-xl lg:rounded-2xl text-sm sm:text-base lg:text-lg focus:ring-2 transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400 focus:ring-blue-100' 
                      : 'bg-white border-gray-200 text-gray-900 focus:border-blue-400 focus:ring-blue-100'
                  }`}
                >
                  <option value="video">Video Call</option>
                  <option value="phone">Phone Call</option>
                  <option value="inperson">In-Person</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className={`text-sm sm:text-base font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}>Location / Platform</Label>
                <Input 
                  type="text" 
                  value={rescheduleData.location}
                  onChange={(e) => setRescheduleData({...rescheduleData, location: e.target.value})}
                  placeholder={rescheduleData.type === 'video' ? 'e.g., Zoom, Google Meet' : rescheduleData.type === 'phone' ? 'e.g., Phone number' : 'e.g., Office address'}
                  className={`h-12 sm:h-14 lg:h-16 rounded-lg sm:rounded-xl lg:rounded-2xl text-sm sm:text-base lg:text-lg focus:ring-2 transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-100' 
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-400 focus:ring-blue-100'
                  }`}
                />
              </div>

              <div className="space-y-2">
                <Label className={`text-sm sm:text-base font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}>Additional Notes</Label>
                <textarea 
                  value={rescheduleData.notes}
                  onChange={(e) => setRescheduleData({...rescheduleData, notes: e.target.value})}
                  placeholder="Any additional information for the candidate..."
                  className={`w-full h-24 sm:h-32 lg:h-40 px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl lg:rounded-2xl resize-none text-sm sm:text-base lg:text-lg focus:ring-2 transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-100' 
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-400 focus:ring-blue-100'
                  }`}
                />
              </div>

              {/* Preview */}
              {rescheduleData.date && rescheduleData.time && (
                <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 border transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-green-900/30 border-green-700' 
                    : 'bg-green-50 border-green-200'
                }`}>
                  <h4 className={`text-sm sm:text-base font-semibold mb-2 sm:mb-3 ${isDarkMode ? 'text-green-400' : 'text-green-700'} transition-colors duration-300`}>Interview Preview</h4>
                  <div className="space-y-1 sm:space-y-2 text-sm sm:text-base">
                    <p className={isDarkMode ? 'text-green-300' : 'text-green-600'}><strong>Date:</strong> {rescheduleData.date}</p>
                    <p className={isDarkMode ? 'text-green-300' : 'text-green-600'}><strong>Time:</strong> {rescheduleData.time}</p>
                    <p className={isDarkMode ? 'text-green-300' : 'text-green-600'}><strong>Type:</strong> {rescheduleData.type.charAt(0).toUpperCase() + rescheduleData.type.slice(1)}</p>
                    {rescheduleData.location && <p className={isDarkMode ? 'text-green-300' : 'text-green-600'}><strong>Location:</strong> {rescheduleData.location}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className="gap-3 sm:gap-4 pt-6 sm:pt-8">
            <Button 
              variant="outline" 
              onClick={() => setIsRescheduleOpen(false)} 
              className={`h-12 sm:h-14 lg:h-16 px-6 sm:px-8 lg:px-12 rounded-lg sm:rounded-xl lg:rounded-2xl font-medium text-sm sm:text-base lg:text-lg transition-colors duration-300 ${
                isDarkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white hover:shadow-lg hover:shadow-gray-800/20' 
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-lg hover:shadow-gray-300/20'
              }`}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveReschedule} 
              className="h-12 sm:h-14 lg:h-16 px-6 sm:px-8 lg:px-12 rounded-lg sm:rounded-xl lg:rounded-2xl font-bold text-sm sm:text-base lg:text-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300"
            >
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 mr-2" />
              Schedule Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
