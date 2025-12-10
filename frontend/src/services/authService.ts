import axiosInstance from '@/lib/axios'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  confirmPassword: string
}

export interface AuthResponse {
  user: {
    user_id: number
    email: string
    username: string
    avatar_url?: string
    status?: string
  }
  accessToken: string
  refreshToken: string
}

export const authService = {
  // Login
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/auth/login', data)
    return response.data
  },

  // Register
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/auth/register', data)
    return response.data
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await axiosInstance.get('/users/me')
    return response.data
  },

  // Logout
  logout: async () => {
    const response = await axiosInstance.post('/auth/logout')
    return response.data
  },
}
