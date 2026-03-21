import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  User,
  MoreVertical,
  ChevronRight,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Plus,
  Sun,
  Moon
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from 'sonner'

const INITIAL_INTERVIEWS = [
  {
    id: 1,
    candidate: 'Alice Johnson',
    role: 'Senior React Developer',
    date: '2024-03-20',
    time: '10:00 AM - 11:00 AM',
    type: 'Video',
    status: 'scheduled',
    platform: 'Google Meet',
    link: 'https://meet.google.com/abc-defg-hij'
  },
  {
    id: 2,
    candidate: 'Bob Smith',
    role: 'Senior React Developer',
    date: '2024-03-21',
    time: '02:00 PM - 03:00 PM',
    type: 'In-person',
    status: 'scheduled',
    location: 'Conference Room B, Main Office'
  },
  {
    id: 3,
    candidate: 'John Doe',
    role: 'Backend Engineer',
    date: '2024-03-18',
    time: '11:00 AM - 12:00 PM',
    type: 'Video',
    status: 'completed',
    platform: 'Zoom'
  }
]

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState(INITIAL_INTERVIEWS)
  const [isCalendarConnected, setIsCalendarConnected] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [selectedInterview, setSelectedInterview] = useState(null)
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  // Debug message
  console.log('InterviewsPage component loaded successfully')

  const handleReschedule = (interview) => {
    setSelectedInterview(interview)
    setNewDate(interview.date)
    setNewTime(interview.time.split(' - ')[0])
    setIsRescheduleOpen(true)
  }

  const confirmReschedule = () => {
    setInterviews(interviews.map(i => 
      i.id === selectedInterview.id 
        ? { ...i, date: newDate, time: `${newTime} - ${calculateEndTime(newTime)}` } 
        : i
    ))
    setIsRescheduleOpen(false)
    toast.success('Interview rescheduled successfully')
  }

  const calculateEndTime = (startTime) => {
    // Simple mock logic to add 1 hour
    // This is a placeholder and should be replaced with robust date/time manipulation
    const [time, period] = startTime.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0; // Midnight
    }

    hours += 1; // Add one hour

    let newPeriod = period;
    if (hours >= 24) {
      hours -= 24;
      // This would mean going into the next day, which is not handled by this simple mock
      // For simplicity, we'll just adjust the period if it crosses 12
      newPeriod = (period === 'AM' ? 'PM' : 'AM'); // Very basic toggle, not accurate for all cases
    } else if (hours >= 12 && period === 'AM') {
      newPeriod = 'PM';
    } else if (hours < 12 && period === 'PM') {
      newPeriod = 'AM';
    }

    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    const displayMinutes = minutes.toString().padStart(2, '0');

    return `${displayHours}:${displayMinutes} ${newPeriod}`;
  }

  const handleConnectCalendar = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsCalendarConnected(true);
      setIsSyncing(false);
      toast.success('Calendar connected successfully!');
    }, 1500);
  }

  const cancelInterview = (id) => {
    setInterviews(interviews.map(i => i.id === id ? { ...i, status: 'cancelled' } : i))
    toast.error('Interview cancelled')
  }

  const filterInterviews = (interviews, filter) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return interviews.filter(interview => {
      const interviewDate = new Date(interview.date);
      interviewDate.setHours(0, 0, 0, 0);

      switch (filter) {
        case 'today':
          return interviewDate.getTime() === today.getTime();
        case 'tomorrow':
          return interviewDate.getTime() === tomorrow.getTime();
        case 'nextWeek':
          return interviewDate >= today && interviewDate <= nextWeek;
        case 'past':
          return interviewDate < today;
        case 'all':
        default:
          return true;
      }
    });
  }

  const filteredInterviews = filterInterviews(interviews, activeFilter)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-purple-900/20">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 lg:space-y-12 animate-fade-in pb-12 px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8 lg:pt-12">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 lg:gap-8">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-0.5 w-6 sm:h-1 sm:w-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full" />
              <Badge className="bg-gradient-to-r from-purple-500/10 to-purple-500/5 text-purple-600 hover:from-purple-500/20 hover:to-purple-500/10 transition-all duration-300 py-1.5 px-3 sm:px-4 border border-purple-500/20 shadow-sm text-xs sm:text-sm">
                Recruitment Schedule
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight font-heading">
              Interviews <span className="text-purple-600 italic bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">& Slots</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg xl:text-xl mt-3 sm:mt-4 max-w-2xl leading-relaxed">
              Manage your upcoming candidate conversations and sync with your team's availability.
            </p>
          </div>
          <Button 
            onClick={() => {
              toast.success('Schedule new interview functionality activated!')
            }}
            className="h-12 sm:h-14 lg:h-16 px-6 sm:px-8 lg:px-10 rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/40 hover:shadow-3xl hover:shadow-purple-500/50 font-black text-sm sm:text-base lg:text-lg xl:text-xl gap-2 sm:gap-3 lg:gap-4 transition-all duration-300 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-600 border border-purple-500/20 hover:scale-105 transform"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7" />
            Schedule New
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Enhanced Sidebar */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            {/* Quick Filters */}
            <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl sm:rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500/10 to-purple-500/5 p-4 sm:p-6 border-b border-purple-100">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                  Quick Filters
                </h3>
              </div>
              <div className="p-4 sm:p-6 space-y-2">
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start rounded-lg sm:rounded-xl font-medium transition-colors text-sm sm:text-base ${
                    activeFilter === 'all' 
                      ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveFilter('all')}
                >
                  All Interviews
                </Button>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start rounded-lg sm:rounded-xl font-medium transition-colors text-sm sm:text-base ${
                    activeFilter === 'today' 
                      ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveFilter('today')}
                >
                  Today
                </Button>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start rounded-lg sm:rounded-xl font-medium transition-colors text-sm sm:text-base ${
                    activeFilter === 'tomorrow' 
                      ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveFilter('tomorrow')}
                >
                  Tomorrow
                </Button>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start rounded-lg sm:rounded-xl font-medium transition-colors text-sm sm:text-base ${
                    activeFilter === 'nextWeek' 
                      ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveFilter('nextWeek')}
                >
                  Next Week
                </Button>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start rounded-lg sm:rounded-xl font-medium transition-colors text-sm sm:text-base ${
                    activeFilter === 'past' 
                      ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveFilter('past')}
                >
                  Past
                </Button>
              </div>
            </div>

            {/* Calendar Sync */}
            <div className="bg-gradient-to-br from-purple-50 via-white to-blue-50 border border-purple-200 rounded-xl sm:rounded-2xl shadow-xl overflow-hidden">
              <div className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                  Calendar Sync
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isCalendarConnected 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}>
                      {isCalendarConnected ? 'Connected' : 'Not Connected'}
                    </span>
                  </div>
                  <Button 
                    onClick={handleConnectCalendar}
                    disabled={isCalendarConnected || isSyncing}
                    className="w-full h-9 sm:h-10 lg:h-11 rounded-lg sm:rounded-xl font-medium bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg shadow-purple-500/20 transition-all duration-300 text-sm sm:text-base"
                  >
                    {isSyncing ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Connecting...
                      </>
                    ) : isCalendarConnected ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Connected
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Connect Calendar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Interview List */}
          <div className="lg:col-span-3 space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                {activeFilter === 'all' ? 'All Interviews' : 
                 activeFilter === 'today' ? "Today's Interviews" :
                 activeFilter === 'tomorrow' ? "Tomorrow's Interviews" :
                 activeFilter === 'nextWeek' ? 'Next Week Interviews' :
                 'Past Interviews'}
                <span className="text-purple-600 ml-2">({filteredInterviews.filter(i => i.status === 'scheduled').length})</span>
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                {new Date().toLocaleDateString()}
              </div>
            </div>
            
            {filteredInterviews.length === 0 ? (
              <div className="text-center py-12 sm:py-16 lg:py-24 border-2 border-dashed border-purple-200 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-50/50 to-white/50">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Calendar className="h-8 w-8 sm:h-10 sm:w-10 text-purple-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                  {activeFilter === 'all' ? 'No interviews scheduled' : 
                   activeFilter === 'today' ? 'No interviews today' :
                   activeFilter === 'tomorrow' ? 'No interviews tomorrow' :
                   activeFilter === 'nextWeek' ? 'No interviews next week' :
                   'No past interviews'}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 max-w-sm mx-auto mb-6 sm:mb-8">
                  {activeFilter === 'all' 
                    ? 'Start by scheduling your first candidate interview using the "Schedule New" button.'
                    : `Try selecting a different time filter or schedule new interviews.`}
                </p>
                <Button 
                  onClick={() => toast.success('Schedule new interview functionality activated!')}
                  className="h-10 sm:h-12 px-6 sm:px-8 rounded-lg sm:rounded-xl font-medium bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule New Interview
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {filteredInterviews.map(interview => (
                  <div key={interview.id} className="group relative bg-gradient-to-br from-white via-white to-purple-50/30 border border-purple-100/50 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 ease-out overflow-hidden h-full min-h-[280px] sm:min-h-[320px] flex flex-col transform hover:scale-[1.02] hover:-translate-y-1">
                    {/* Hover Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    
                    {/* Top Border Accent */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-purple-400 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
                    
                    <div className="relative p-4 sm:p-6 lg:p-8 flex-1 flex flex-col">
                      <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center border border-purple-200 flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                          <User className="h-6 w-6 sm:h-7 sm:w-7 text-purple-600 group-hover:text-purple-700 transition-colors duration-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate group-hover:text-purple-900 transition-colors duration-300">{interview.candidate}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 transition-all duration-300 ${
                              interview.status === 'scheduled' ? 'bg-blue-100 text-blue-700 border border-blue-200 group-hover:bg-blue-200' :
                              interview.status === 'completed' ? 'bg-green-100 text-green-700 border border-green-200 group-hover:bg-green-200' :
                              interview.status === 'cancelled' ? 'bg-red-100 text-red-700 border border-red-200 group-hover:bg-red-200' :
                              'bg-gray-100 text-gray-700 border border-gray-200 group-hover:bg-gray-200'
                            }`}>
                              {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-2 truncate group-hover:text-purple-700 transition-colors duration-300">{interview.role}</p>
                          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
                            <span className="flex items-center gap-1 group-hover:text-purple-600 transition-colors duration-300">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform duration-300" />
                              {interview.date}
                            </span>
                            <span className="flex items-center gap-1 group-hover:text-purple-600 transition-colors duration-300">
                              <Clock className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform duration-300" />
                              {interview.time}
                            </span>
                            <span className="flex items-center gap-1 group-hover:text-purple-600 transition-colors duration-300">
                              {interview.type === 'Video' ? <Video className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform duration-300" /> : <MapPin className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform duration-300" />}
                              {interview.type}
                            </span>
                          </div>

                          {interview.link && (
                            <div className="flex items-center gap-2 mt-3">
                              <span className="text-xs sm:text-sm text-gray-600 font-medium group-hover:text-purple-600 transition-colors duration-300">Platform:</span>
                              <span className="text-xs sm:text-sm font-bold text-purple-600 truncate group-hover:text-purple-700 transition-colors duration-300">{interview.platform}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-auto pt-3 sm:pt-4 border-t border-gray-100 group-hover:border-purple-200 transition-colors duration-300">
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                          {interview.link && (
                            <Button 
                              size="sm" 
                              className="h-9 sm:h-10 px-3 sm:px-4 rounded-lg font-medium bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300 text-xs sm:text-sm flex-1 group-hover:scale-105 group-hover:shadow-xl transform"
                            >
                              <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1 group-hover:rotate-12 transition-transform duration-300" />
                              Join
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleReschedule(interview)}
                            className="h-9 sm:h-10 px-3 sm:px-4 rounded-lg font-medium border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all duration-300 text-xs sm:text-sm flex-1 group-hover:scale-105 group-hover:shadow-md transform"
                          >
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 group-hover:rotate-12 transition-transform duration-300" />
                            Reschedule
                          </Button>
                          {interview.status === 'scheduled' && (
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => cancelInterview(interview.id)}
                              className="h-9 sm:h-10 px-3 sm:px-4 rounded-lg font-medium text-xs sm:text-sm flex-1 group-hover:scale-105 group-hover:shadow-md transform hover:bg-red-600 transition-all duration-300"
                            >
                              <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 group-hover:scale-110 transition-transform duration-300" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
