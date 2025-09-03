import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '@/services/authService'
import { TokenManager } from '@/utils/tokenManager'
import type { User, LoginCredentials, RegisterData } from '@/types/auth'

interface AuthState {
  // State
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => Promise<void>
  loadCurrentUser: () => Promise<void>
  initialize: () => Promise<void>
  clearError: () => void
  setLoading: (loading: boolean) => void
}

// Get token manager instance
const tokenManager = TokenManager.getInstance()

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials) => {
        set({ isLoading: true, error: null })

        try {
          // Basic validation
          if (!credentials.email || !credentials.password) {
            throw new Error('Email and password are required')
          }

          if (credentials.password.length < 6) {
            throw new Error('Password must be at least 6 characters')
          }

          // Call auth service
          const authResponse = await authService.login(credentials)
          const { user, tokens } = authResponse

          // Store tokens
          tokenManager.setTokens(tokens)

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed'
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
            user: null
          })
          throw error
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null })

        try {
          // Basic validation
          if (!userData.email || !userData.password || !userData.username) {
            throw new Error('Email, username, and password are required')
          }

          if (userData.password !== userData.confirmPassword) {
            throw new Error('Passwords do not match')
          }

          if (userData.password.length < 6) {
            throw new Error('Password must be at least 6 characters')
          }

          // Call auth service
          const authResponse = await authService.register(userData)
          const { user, tokens } = authResponse

          // Store tokens
          tokenManager.setTokens(tokens)

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Registration failed'
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
            user: null
          })
          throw error
        }
      },

      logout: async () => {
        try {
          // Call logout API
          const refreshToken = tokenManager.getRefreshToken()
          await authService.logout(refreshToken || undefined)
        } catch (error) {
          console.warn('Logout API call failed:', error)
        } finally {
          // Always clear tokens from storage
          tokenManager.clearTokens()

          set({
            user: null,
            isAuthenticated: false,
            error: null
          })
        }
      },

      loadCurrentUser: async () => {
        try {
          set({ isLoading: true })
          const user = await authService.getCurrentUser()
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
        } catch (error) {
          console.error('Failed to load current user:', error)
          // Clear tokens if user fetch fails
          tokenManager.clearTokens()
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          })
        }
      },

      clearError: () => set({ error: null }),

      setLoading: (loading) => set({ isLoading: loading }),

      // Initialize auth state on app start
      initialize: async () => {
        const tokenManager = TokenManager.getInstance()
        const hasValidToken = tokenManager.hasValidToken()

        if (hasValidToken) {
          // Try to load current user
          const { loadCurrentUser } = get()
          await loadCurrentUser()
        } else {
          // Clear any stale auth state
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
)
