// API types and interfaces
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ApiError {
  status: number
  message: string
  code?: string
  details?: Record<string, any>
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number // seconds
  tokenType: string
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken?: string // Optional - only if token rotation is enabled
  expiresIn: number
}

export interface ApiRequestConfig {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  data?: any
  headers?: Record<string, string>
  requiresAuth?: boolean
}

export interface TokenInfo {
  token: string
  expiresAt: number
  isExpired: boolean
}

// Mock API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
  },
  CHAT: {
    MESSAGES: '/chat/messages',
    SEND_MESSAGE: '/chat/send',
  },
} as const
