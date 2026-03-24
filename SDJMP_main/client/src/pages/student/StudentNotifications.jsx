import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Bell, 
  Briefcase, 
  ClipboardList, 
  Trash2, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  Settings,
  Archive
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { useNotifications } from '@/context/NotificationContext'
import { toast } from 'sonner'

export default function StudentNotifications() {
  const navigate = useNavigate()
  const { notifications, markAsRead, markAllAsRead, removeNotification, formatRelativeTime } = useNotifications()
  const [filter, setFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(false)

  // Memoized filtered notifications for performance
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (filter === 'all') return true
      if (filter === 'unread') return !n.read
      return n.type === filter
    })
  }, [notifications, filter])

  // Memoized notification stats
  const notificationStats = useMemo(() => {
    const stats = {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      jobs: notifications.filter(n => n.type === 'job').length,
      assessments: notifications.filter(n => n.type === 'assessment').length,
      system: notifications.filter(n => n.type === 'system').length,
    }
    return stats
  }, [notifications])

  // Optimized icon function with memoization
  const getIcon = useCallback((type) => {
    switch (type) {
      case 'job': return <Briefcase className="h-4 w-4 text-blue-500" />
      case 'assessment': return <ClipboardList className="h-4 w-4 text-purple-500" />
      case 'system': return <AlertCircle className="h-4 w-4 text-amber-500" />
      default: return <Bell className="h-4 w-4 text-primary" />
    }
  }, [])

  // Optimized handlers with error handling
  const handleDelete = useCallback(async (id) => {
    try {
      removeNotification(id)
      toast.success('Notification deleted')
    } catch (error) {
      toast.error('Failed to delete notification')
    }
  }, [removeNotification])

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      setIsLoading(true)
      markAllAsRead()
      toast.success('All notifications marked as read')
    } catch (error) {
      toast.error('Failed to mark notifications as read')
    } finally {
      setIsLoading(false)
    }
  }, [markAllAsRead])

  const handleViewDetails = useCallback((notification) => {
    markAsRead(notification.id)
    if (notification.type === 'job') navigate('/student/jobs')
    else if (notification.type === 'assessment') navigate('/student/assessments')
    else navigate('/student/applications')
  }, [markAsRead, navigate])

  const handleArchiveAll = useCallback(async () => {
    try {
      setIsLoading(true)
      // Archive all read notifications
      const readNotifications = notifications.filter(n => n.read)
      readNotifications.forEach(n => removeNotification(n.id))
      toast.success(`${readNotifications.length} notifications archived`)
    } catch (error) {
      toast.error('Failed to archive notifications')
    } finally {
      setIsLoading(false)
    }
  }, [notifications, removeNotification])

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">Stay updated on your job applications and assessments.</p>
        </div>
        <div className="flex items-center gap-2">
          {notificationStats.unread > 0 && (
            <Badge variant="secondary" className="px-3 py-1">
              {notificationStats.unread} unread
            </Badge>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Settings className="h-4 w-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleMarkAllAsRead} disabled={isLoading}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark all as read
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleArchiveAll} disabled={isLoading}>
                <Archive className="h-4 w-4 mr-2" />
                Archive read notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold">{notificationStats.total}</div>
          <div className="text-sm text-muted-foreground">Total</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{notificationStats.unread}</div>
          <div className="text-sm text-muted-foreground">Unread</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{notificationStats.jobs}</div>
          <div className="text-sm text-muted-foreground">Jobs</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{notificationStats.assessments}</div>
          <div className="text-sm text-muted-foreground">Assessments</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">{notificationStats.system}</div>
          <div className="text-sm text-muted-foreground">System</div>
        </Card>
      </div>

      <Tabs defaultValue="all" value={filter} onValueChange={setFilter} className="w-full">
        <TabsList className="bg-muted/50 p-1 mb-6">
          <TabsTrigger value="all">All ({notificationStats.total})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({notificationStats.unread})</TabsTrigger>
          <TabsTrigger value="job">Jobs ({notificationStats.jobs})</TabsTrigger>
          <TabsTrigger value="assessment">Assessments ({notificationStats.assessments})</TabsTrigger>
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
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{notification.message}</p>
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
                  <h3 className="text-xl font-bold mb-2">All caught up!</h3>
                  <p className="text-muted-foreground">
                    {filter === 'all' 
                      ? "You don't have any notifications yet."
                      : `No ${filter} notifications found.`
                    }
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  )
}
