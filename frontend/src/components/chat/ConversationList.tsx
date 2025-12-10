import { useEffect, useState } from 'react'
import { Search, Plus, Loader2 } from 'lucide-react'
import { chatService } from '@/services/chatService'
import type { Conversation } from '@/services/chatService'
import { userService } from '@/services/userService'
import { useChatStore } from '@/store/chatStore'
import { useAuthStore } from '@/store/authStore'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import CreateConversationModal from '@/components/chat/CreateConversationModal'

export default function ConversationList() {
  const { user } = useAuthStore()
  const { conversations, setConversations, selectConversation, selectedConversation } = useChatStore()
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    setIsLoading(true)
    try {
      const data = await chatService.getConversations()
      
      // Early return if no conversations
      if (data.length === 0) {
        setConversations([])
        return
      }
      
      // Extract all unique participant IDs (skip invalid/zero IDs)
      const allParticipantIds = new Set<number>()
      data.forEach((conv) => {
        conv.participants.forEach((p) => {
          const id = parseInt(p.id)
          if (!isNaN(id) && id > 0) allParticipantIds.add(id)
        })
      })
      
      // Early return if no valid participant IDs
      if (allParticipantIds.size === 0) {
        setConversations(data)
        return
      }
      
      // Fetch user details (single batch request)
      const users = await userService.getUsersByIds(Array.from(allParticipantIds))
      const userMap = new Map(users.map((u) => [u.user_id, u]))
      
      // Populate participants with user details
      const populatedConversations = data.map((conv) => ({
        ...conv,
        participants: conv.participants.map((p) => {
          const userId = parseInt(p.id)
          const user = userMap.get(userId)
          return {
            id: p.id,
            user_id: userId,
            name: user?.username || `User ${userId}`,
            email: user?.email || '',
          }
        }),
      }))
      
      setConversations(populatedConversations)
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredConversations = conversations.filter((conv) => {
    const searchLower = searchQuery.toLowerCase()

    // Search by conversation name
    if (conv.name && conv.name.toLowerCase().includes(searchLower)) {
      return true
    }

    // Search by participant names
    return conv.participants.some(
      (p) => p.name?.toLowerCase().includes(searchLower) || p.email?.toLowerCase().includes(searchLower)
    )
  })

  const getConversationName = (conversation: Conversation) => {
    if (conversation.name) return conversation.name

    // For non-group conversations, show other participant's name
    const otherParticipant = conversation.participants.find((p) => p.user_id !== user?.user_id)
    return otherParticipant?.name || 'Unknown'
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMins = Math.floor(diffInMs / 60000)
    const diffInHours = Math.floor(diffInMs / 3600000)
    const diffInDays = Math.floor(diffInMs / 86400000)

    if (diffInMins < 1) return 'Vừa xong'
    if (diffInMins < 60) return `${diffInMins} phút`
    if (diffInHours < 24) return `${diffInHours} giờ`
    if (diffInDays < 7) return `${diffInDays} ngày`

    return date.toLocaleDateString('vi-VN')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="p-3 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Tìm kiếm hội thoại..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-3 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-smooth"
          />
        </div>
      </div>

      {/* Create conversation button */}
      <div className="p-3 border-b border-gray-200">
        <Button 
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 transition-smooth rounded-xl" 
          size="sm" 
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Tạo hội thoại mới
        </Button>
      </div>

      {/* Create conversation modal */}
      <CreateConversationModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {/* Loading skeleton */}
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3 p-3 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {searchQuery ? 'Không tìm thấy hội thoại' : 'Chưa có hội thoại nào'}
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => selectConversation(conversation)}
              className={`w-full p-4 flex items-start gap-3 transition-smooth border-b border-gray-100 text-left group ${
                selectedConversation?.id === conversation.id 
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500' 
                  : 'hover:bg-gray-50'
              }`}
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg transition-smooth">
                <span className="text-lg font-bold text-white">
                  {getConversationName(conversation)[0].toUpperCase()}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between mb-1">
                  <h3 className="font-medium text-sm truncate">
                    {getConversationName(conversation)}
                  </h3>
                  {conversation.lastMessage && (
                    <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                      {formatTime(conversation.lastMessage.createdAt)}
                    </span>
                  )}
                </div>
                {conversation.lastMessage ? (
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.lastMessage.sender?.name || 'Unknown'}:{' '}
                    {conversation.lastMessage.content}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Chưa có tin nhắn
                  </p>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
