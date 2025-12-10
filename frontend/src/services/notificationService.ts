import axios from 'axios'

const notificationAPI = axios.create({
  baseURL: import.meta.env.VITE_NOTIFICATION_SERVICE_URL || 'http://localhost:3003',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add access token from sessionStorage (cross-port solution)
notificationAPI.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface Notification {
  id: string
  user_id?: number
  userId?: string
  type: 'new_message' | 'message' | 'mention' | 'system' | 'group_invite'
  title: string
  content: string
  related_id?: string
  data?: {
    conversationId?: string
    messageId?: string
    senderId?: string
    senderName?: string
  }
  isRead?: boolean
  is_read?: boolean
  createdAt?: string
  created_at?: string
  updatedAt?: string
  updated_at?: string
}

export const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    const response = await notificationAPI.get('/notifications')
    return response.data
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    await notificationAPI.patch(`/notifications/${notificationId}/read`)
  },

  markAllAsRead: async (): Promise<void> => {
    await notificationAPI.patch('/notifications/read-all')
  },

  deleteNotification: async (notificationId: string): Promise<void> => {
    await notificationAPI.delete(`/notifications/${notificationId}`)
  },
}
