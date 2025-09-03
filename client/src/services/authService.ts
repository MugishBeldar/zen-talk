import apiService from './api'
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User
} from '@/types/auth'

class AuthService {
  constructor() {
    // Use the main API service instance
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiService.login(credentials.email, credentials.password, credentials.rememberMe)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || 'Login failed')
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await apiService.register(userData)

    if (response.success && response.data) {
      return response.data
    }

    throw new Error(response.message || 'Registration failed')
  }

  async logout(refreshToken?: string): Promise<void> {
    try {
      await apiService.logout(refreshToken)
    } catch (error) {
      // Even if logout fails on server, we should clear local tokens
      console.warn('Logout request failed, but clearing local tokens:', error)
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiService.getCurrentUser()

    if (response.success && response.data) {
      return response.data.user
    }

    throw new Error(response.message || 'Failed to get user profile')
  }
}

export const authService = new AuthService()
