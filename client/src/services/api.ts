import axios, { type AxiosInstance } from 'axios'
import { TokenManager } from '@/utils/tokenManager'

// Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: any[]
}

export interface Chat {
  id: string
  name: string
  type: 'individual' | 'group'
  avatar?: string
  lastMessage?: {
    content: string
    sender: string
    timestamp: string
  }
  lastActivity: string
  unreadCount: number
  participants: Participant[]
  settings: {
    isArchived: boolean
    isMuted: boolean
    isPinned: boolean
  }
  isOnline?: boolean
  lastSeen?: string
  createdAt: string
  updatedAt: string
}

export interface Participant {
  id: string
  firstName: string
  lastName: string
  username: string
  avatar?: string
  isOnline: boolean
  lastSeen: string
  role: 'admin' | 'member'
}

export interface Message {
  id: string
  chat: string
  sender: {
    id: string
    firstName: string
    lastName: string
    username: string
    avatar?: string
  }
  content: {
    text: string
    type: 'text' | 'image' | 'file' | 'audio' | 'video' | 'emoji'
    attachments?: any[]
  }
  replyTo?: {
    id: string
    content: { text: string }
    sender: string
  }
  reactions: Array<{
    user: string
    emoji: string
    createdAt: string
  }>
  readBy: Array<{
    user: string
    readAt: string
  }>
  isEdited: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  firstName: string
  lastName: string
  username: string
  email: string
  avatar?: string
  isOnline: boolean
  lastSeen: string
}

class ApiService {
  private api: AxiosInstance
  private baseURL: string
  private tokenManager: TokenManager

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
    this.tokenManager = TokenManager.getInstance()

    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.tokenManager.getAccessToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const refreshToken = this.tokenManager.getRefreshToken()
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken)
              const { accessToken, expiresIn } = response.data

              this.tokenManager.updateAccessToken(accessToken, expiresIn)
              originalRequest.headers.Authorization = `Bearer ${accessToken}`

              return this.api(originalRequest)
            }
          } catch (error) {
            // Refresh failed, redirect to login
            this.tokenManager.clearTokens()
            window.location.href = '/auth/login'
          }
        }

        return Promise.reject(error)
      }
    )
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.tokenManager.hasValidToken()
  }

  // Auth methods
  async login(email: string, password: string, rememberMe: boolean = false): Promise<ApiResponse> {
    const response = await this.api.post('/auth/login', { email, password, rememberMe })
    return response.data
  }

  async register(userData: {
    firstName: string
    lastName: string
    username: string
    email: string
    password: string
    confirmPassword: string
  }): Promise<ApiResponse> {
    const response = await this.api.post('/auth/register', userData)
    return response.data
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse> {
    const response = await this.api.post('/auth/refresh', { refreshToken })
    return response.data
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.api.post('/auth/logout')
    return response.data
  }

  // Chat methods
  async getChats(): Promise<ApiResponse<{ chats: Chat[]; total: number }>> {
    const response = await this.api.get('/chats')
    return response.data
  }

  async getChatById(chatId: string): Promise<ApiResponse<{ chat: Chat }>> {
    const response = await this.api.get(`/chats/${chatId}`)
    return response.data
  }

  async createIndividualChat(participantId: string): Promise<ApiResponse<{ chat: Chat }>> {
    const response = await this.api.post('/chats/individual', { participantId })
    return response.data
  }

  async createGroupChat(name: string, description?: string, participantIds: string[] = []): Promise<ApiResponse<{ chat: Chat }>> {
    const response = await this.api.post('/chats/group', { name, description, participantIds })
    return response.data
  }

  async searchUsers(query: string): Promise<ApiResponse<{ users: User[] }>> {
    const response = await this.api.get(`/chats/search-users?query=${encodeURIComponent(query)}`)
    return response.data
  }

  // Message methods
  async getChatMessages(chatId: string, page: number = 1, limit: number = 50): Promise<ApiResponse<{ messages: Message[]; pagination: any }>> {
    const response = await this.api.get(`/chats/${chatId}/messages?page=${page}&limit=${limit}`)
    return response.data
  }

  async sendMessage(chatId: string, content: { text: string; type?: string; attachments?: any[] }, replyTo?: string): Promise<ApiResponse<{ message: Message }>> {
    const response = await this.api.post(`/chats/${chatId}/messages`, { content, replyTo })
    return response.data
  }

  async editMessage(chatId: string, messageId: string, content: string): Promise<ApiResponse<{ message: Message }>> {
    const response = await this.api.put(`/chats/${chatId}/messages/${messageId}`, { content })
    return response.data
  }

  async deleteMessage(chatId: string, messageId: string): Promise<ApiResponse> {
    const response = await this.api.delete(`/chats/${chatId}/messages/${messageId}`)
    return response.data
  }

  async addReaction(chatId: string, messageId: string, emoji: string): Promise<ApiResponse<{ message: Message }>> {
    const response = await this.api.post(`/chats/${chatId}/messages/${messageId}/reactions`, { emoji })
    return response.data
  }

  async removeReaction(chatId: string, messageId: string): Promise<ApiResponse<{ message: Message }>> {
    const response = await this.api.delete(`/chats/${chatId}/messages/${messageId}/reactions`)
    return response.data
  }

  async markAsRead(chatId: string): Promise<ApiResponse> {
    const response = await this.api.post(`/chats/${chatId}/read`)
    return response.data
  }

  async searchMessages(chatId: string, query: string, page: number = 1, limit: number = 20): Promise<ApiResponse<{ messages: Message[]; pagination: any }>> {
    const response = await this.api.get(`/chats/${chatId}/messages/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`)
    return response.data
  }

  // User methods
  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    const response = await this.api.get('/user/profile')
    return response.data
  }

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    const response = await this.api.put('/user/profile', userData)
    return response.data
  }

  // Utility methods
  getSocketUrl(): string {
    return this.baseURL.replace('/api', '').replace('http', 'ws')
  }

  getAuthToken(): string | null {
    return this.tokenManager.getAccessToken()
  }

  clearAuth(): void {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }
}

export default new ApiService()
