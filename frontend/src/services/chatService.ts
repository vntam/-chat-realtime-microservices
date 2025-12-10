import axios from 'axios'

const chatAPI = axios.create({
  baseURL: import.meta.env.VITE_CHAT_SERVICE_URL || 'http://localhost:3002',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add access token from sessionStorage (cross-port solution)
chatAPI.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Transform MongoDB response to match frontend interface
chatAPI.interceptors.response.use((response) => {
  if (response.data) {
    // Helper function to transform a single item
    const transformItem = (item: any) => {
      if (!item || typeof item !== 'object') return item
      
      const transformed: any = { ...item }
      
      // Transform _id to id
      if (item._id) {
        transformed.id = item._id
      }
      
      // Transform conversation_id to conversationId
      if (item.conversation_id) {
        transformed.conversationId = item.conversation_id
      }
      
      // Transform sender_id to senderId (if exists)
      if (item.sender_id) {
        transformed.senderId = item.sender_id
      }
      
      // Transform type to isGroup (for conversations)
      if (item.type) {
        transformed.isGroup = item.type === 'group'
      }
      
      // Transform participants array - keep minimal structure
      // Will be populated with user details in component after fetch
      if (item.participants && Array.isArray(item.participants)) {
        transformed.participants = item.participants.map((p: any) => {
          // If already an object with id, return as is
          if (typeof p === 'object' && p.id) return p
          // If it's just a number (user_id), create minimal structure with just id
          return { id: String(p) }
        })
      }
      
      return transformed
    }
    
    // Transform array of objects
    if (Array.isArray(response.data)) {
      response.data = response.data.map(transformItem)
    } else {
      // Transform single object
      response.data = transformItem(response.data)
    }
  }
  return response
})

export interface Conversation {
  id: string
  name?: string
  isGroup: boolean
  participants: Array<{
    id: string
    user_id?: number
    name?: string
    email?: string
  }>
  lastMessage?: {
    content: string
    createdAt: string
    sender: {
      id: string
      name: string
    }
  }
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  conversationId?: string
  conversation_id?: string
  senderId?: string
  sender_id?: string
  content: string
  sender: {
    id: string
    name?: string
    email?: string
  }
  createdAt: string
  updatedAt: string
}

export interface CreateConversationRequest {
  participantIds: string[]
  isGroup: boolean
  name?: string
}

export interface SendMessageRequest {
  conversationId: string
  content: string
}

export const chatService = {
  // Get all conversations
  getConversations: async (): Promise<Conversation[]> => {
    const response = await chatAPI.get('/conversations')
    // Note: participants will be populated in the component after fetching user details
    return response.data
  },

  // Get conversation by ID
  getConversationById: async (id: string): Promise<Conversation> => {
    const response = await chatAPI.get(`/conversations/${id}`)
    return response.data
  },

  // Create new conversation
  createConversation: async (data: CreateConversationRequest): Promise<Conversation> => {
    const response = await chatAPI.post('/conversations', data)
    return response.data
  },

  // Get messages in a conversation
  getMessages: async (conversationId: string): Promise<Message[]> => {
    const response = await chatAPI.get(`/conversations/${conversationId}/messages`)
    return response.data
  },

  // Send a message
  sendMessage: async (data: SendMessageRequest): Promise<Message> => {
    const response = await chatAPI.post('/conversations/messages', data)
    return response.data
  },

  // Delete conversation
  deleteConversation: async (id: string): Promise<void> => {
    await chatAPI.delete(`/conversations/${id}`)
  },

  // Accept conversation (message request)
  acceptConversation: async (id: string): Promise<Conversation> => {
    const response = await chatAPI.post(`/conversations/${id}/accept`)
    return response.data
  },
}
