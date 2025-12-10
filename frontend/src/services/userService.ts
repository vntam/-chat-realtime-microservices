import axiosInstance from '@/lib/axios'

export interface User {
  user_id: number
  username: string
  email: string
  avatar_url?: string
  status?: string
  created_at?: string
}

interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export const userService = {
  // Get all users
  getAllUsers: async (): Promise<User[]> => {
    const response = await axiosInstance.get<PaginatedResponse<User>>('/users')
    return response.data.data // Extract data array from paginated response
  },

  // Get multiple users by IDs (optimized batch request)
  getUsersByIds: async (ids: number[]): Promise<User[]> => {
    if (ids.length === 0) return []
    
    // Use batch endpoint for better performance
    const response = await axiosInstance.post('/users/batch', { ids })
    return response.data
  },

  // Get user by ID
  getUserById: async (id: number): Promise<User> => {
    const response = await axiosInstance.get(`/users/${id}`)
    return response.data
  },

  // Update user
  updateUser: async (id: number, data: Partial<User>): Promise<User> => {
    const response = await axiosInstance.put(`/users/${id}`, data)
    return response.data
  },

  // Delete user
  deleteUser: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/users/${id}`)
  },
}
