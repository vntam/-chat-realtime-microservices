import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null
let notificationSocket: Socket | null = null

export const initializeSocket = (token: string) => {
  if (socket) {
    socket.disconnect()
  }

  socket = io(import.meta.env.VITE_CHAT_SERVICE_URL || 'http://localhost:3002', {
    auth: {
      token,
    },
    transports: ['websocket'],
  })

  socket.on('connect', () => {
    console.log('Chat socket connected:', socket?.id)
  })

  socket.on('disconnect', () => {
    console.log('Chat socket disconnected')
  })

  socket.on('error', (error) => {
    console.error('Chat socket error:', error)
  })

  return socket
}

export const initializeNotificationSocket = (token: string) => {
  if (notificationSocket) {
    notificationSocket.disconnect()
  }

  notificationSocket = io(import.meta.env.VITE_NOTIFICATION_SERVICE_URL || 'http://localhost:3003', {
    auth: {
      token,
    },
    transports: ['websocket'],
  })

  notificationSocket.on('connect', () => {
    console.log('Notification socket connected:', notificationSocket?.id)
  })

  notificationSocket.on('disconnect', () => {
    console.log('Notification socket disconnected')
  })

  notificationSocket.on('error', (error) => {
    console.error('Notification socket error:', error)
  })

  return notificationSocket
}

export const getSocket = (): Socket | null => {
  return socket
}

export const getNotificationSocket = (): Socket | null => {
  return notificationSocket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
  if (notificationSocket) {
    notificationSocket.disconnect()
    notificationSocket = null
  }
}
