import { useEffect, useState } from 'react'
import { Bell, Check, CheckCheck, Trash2, MessageSquare, X } from 'lucide-react'
import { useNotificationStore } from '@/store/notificationStore'
import { notificationService } from '@/services/notificationService'
import { initializeNotificationSocket, getNotificationSocket } from '@/lib/socket'
import type { Notification } from '@/services/notificationService'
import Button from '@/components/ui/Button'

export default function NotificationDropdown() {
  const { notifications, unreadCount, setNotifications, addNotification, markAsRead, markAllAsRead, removeNotification } =
    useNotificationStore()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchNotifications()
    
    // Initialize notification socket
    const token = sessionStorage.getItem('access_token')
    if (token) {
      initializeNotificationSocket(token)
      
      const notifSocket = getNotificationSocket()
      if (notifSocket) {
        // Listen for new notifications
        notifSocket.on('notification:created', (notification: Notification) => {
          console.log('Received notification:', notification)
          addNotification(notification)
        })
      }
    }

    return () => {
      const notifSocket = getNotificationSocket()
      if (notifSocket) {
        notifSocket.off('notification:created')
      }
    }
  }, [])

  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      const data = await notificationService.getNotifications()
      setNotifications(data)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId)
      markAsRead(notificationId)
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      markAllAsRead()
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId)
      removeNotification(notificationId)
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const formatTime = (dateString?: string) => {
    if (!dateString) return 'Vừa xong'
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMins = Math.floor(diffInMs / 60000)
    const diffInHours = Math.floor(diffInMs / 3600000)
    const diffInDays = Math.floor(diffInMs / 86400000)

    if (diffInMins < 1) return 'Vừa xong'
    if (diffInMins < 60) return `${diffInMins} phút trước`
    if (diffInHours < 24) return `${diffInHours} giờ trước`
    if (diffInDays < 7) return `${diffInDays} ngày trước`

    return date.toLocaleDateString('vi-VN')
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'new_message':
      case 'message':
        return <MessageSquare className="w-5 h-5 text-blue-600" />
      case 'group_invite':
        return <MessageSquare className="w-5 h-5 text-indigo-600" />
      default:
        return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-smooth group"
      >
        <Bell className="w-5 h-5 text-gray-700 group-hover:text-blue-600 transition-smooth" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 shadow-lg animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

          {/* Dropdown Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-card border border-border rounded-lg shadow-lg z-20 max-h-[600px] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-lg">Thông báo</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="text-xs"
                  >
                    <CheckCheck className="w-4 h-4 mr-1" />
                    Đọc tất cả
                  </Button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-accent rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  Đang tải...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    Chưa có thông báo nào
                  </p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const isRead = notification.isRead ?? notification.is_read ?? false
                  const createdAt = notification.createdAt ?? notification.created_at
                  return (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-smooth cursor-pointer ${
                      !isRead ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-sm text-gray-900">{notification.title}</h4>
                          {!isRead && (
                            <div className="w-2.5 h-2.5 bg-blue-600 rounded-full flex-shrink-0 mt-1 animate-pulse" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {notification.content}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 font-medium">
                            {formatTime(createdAt)}
                          </span>
                          <div className="flex items-center gap-1">
                            {!isRead && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleMarkAsRead(notification.id)
                                }}
                                className="p-1.5 hover:bg-blue-100 rounded-lg transition-smooth"
                                title="Đánh dấu đã đọc"
                              >
                                <Check className="w-4 h-4 text-blue-600" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(notification.id)
                              }}
                              className="p-1.5 hover:bg-red-100 rounded-lg transition-smooth"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  )
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
