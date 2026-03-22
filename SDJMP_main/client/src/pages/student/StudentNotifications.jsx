import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Bell, 
  Briefcase, 
  ClipboardList, 
  Trash2, 
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useNotifications } from '@/context/NotificationContext'
import { toast } from 'sonner'

export default function StudentNotifications() {
  const navigate = useNavigate()
  const { notifications, markAsRead, markAllAsRead, removeNotification, formatRelativeTime } = useNotifications()
  const [filter, setFilter] = useState('all')

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true
    if (filter === 'unread') return !n.read
    return n.type === filter
  })

  const getIcon = (type) => {
    switch (type) {
      case 'job': return <Briefcase className="h-4 w-4 text-blue-500" />
      case 'assessment': return <ClipboardList className="h-4 w-4 text-purple-500" />
      case 'system': return <AlertCircle className="h-4 w-4 text-amber-500" />
      default: return <Bell className="h-4 w-4 text-primary" />
    }
  }

  const handleDelete = (id) => {
    removeNotification(id)
    toast.success('Notification deleted')
  }

  const handleViewDetails = (notification) => {
    markAsRead(notification.id)
    if (notification.type === 'job') navigate('/student/jobs')
    else if (notification.type === 'assessment') navigate('/student/assessments')
    else navigate('/student/applications')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">Stay updated on your job applications and assessments.</p>
        </div>
        <Button variant="outline" onClick={markAllAsRead} className="rounded-xl">
          Mark all as read
        </Button>
      </div>

      <Tabs defaultValue="all" value={filter} onValueChange={setFilter} className="w-full">
        <TabsList className="bg-muted/50 p-1 mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="job">Jobs</TabsTrigger>
          <TabsTrigger value="assessment">Assessments</TabsTrigger>
        </TabsList>

        <Card className="border-none shadow-xl glass overflow-hidden">
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <button
                    type="button"
                    key={notification.id} 
                    className={`p-6 flex items-start gap-4 transition-colors hover:bg-muted/30 relative group ${!notification.read ? 'bg-primary/5' : ''}`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    {!notification.read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                    )}
                    <div className="h-10 w-10 mt-1 rounded-full bg-background flex items-center justify-center border shadow-sm flex-shrink-0">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <h4 className={`text-sm font-bold truncate ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notification.title}
                        </h4>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                          {formatRelativeTime(notification.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{notification.message}</p>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-xs rounded-lg px-4"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewDetails(notification)
                          }}
                        >
                          View Details
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(notification.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="py-20 text-center">
                  <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                    <Bell className="h-10 w-10 text-muted-foreground opacity-20" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Clear Skies!</h3>
                  <p className="text-muted-foreground">You don&apos;t have any notifications in this category.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  )
}
