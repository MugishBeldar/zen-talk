import { TokenManager } from '@/utils/tokenManager'
import type {
  ApiResponse,
  ApiRequestConfig,
  RefreshTokenResponse,
} from '@/types/api'

class ApiService {
  private baseURL: string
  private tokenManager: TokenManager
  private isRefreshing: boolean = false
  private refreshPromise: Promise<string> | null = null

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
    this.tokenManager = TokenManager.getInstance()
  }

  // Real API call to refresh token
  private async refreshTokenAPI(): Promise<RefreshTokenResponse> {
    const refreshToken = this.tokenManager.getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const error = new Error(errorData.message || 'Token refresh failed')
        ; (error as any).status = response.status
        ; (error as any).code = errorData.error
        ; (error as any).details = errorData.details
      throw error
    }

    const data = await response.json()
    return {
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken, // New refresh token if rotated
      expiresIn: data.data.expiresIn,
    }
  }

  // Refresh access token
  private async refreshAccessToken(): Promise<string> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise
    }

    this.isRefreshing = true
    this.refreshPromise = this.performTokenRefresh()

    try {
      const newToken = await this.refreshPromise
      return newToken
    } finally {
      this.isRefreshing = false
      this.refreshPromise = null
    }
  }

  private async performTokenRefresh(): Promise<string> {
    try {
      console.log('🔄 Refreshing access token...')

      const refreshResponse = await this.refreshTokenAPI()

      // Update tokens in manager
      this.tokenManager.updateAccessToken(
        refreshResponse.accessToken,
        refreshResponse.expiresIn
      )

      // Update refresh token if rotated
      if (refreshResponse.refreshToken) {
        this.tokenManager.updateRefreshToken(refreshResponse.refreshToken)
      }

      console.log('✅ Token refreshed successfully')
      return refreshResponse.accessToken

    } catch (error) {
      console.error('❌ Token refresh failed:', error)

      // Clear tokens and redirect to login
      this.tokenManager.clearTokens()

      // Trigger logout in auth store
      const { useAuthStore } = await import('@/stores/authStore')
      useAuthStore.getState().logout()

      throw new Error('Session expired. Please login again.')
    }
  }

  // Main request method with interceptors
  public async request<T>(config: ApiRequestConfig): Promise<ApiResponse<T>> {
    const { url, method, data, headers = {}, requiresAuth = true } = config

    try {
      // Set default headers
      if (data && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json'
      }

      // Add auth header if required and available
      if (requiresAuth) {
        const tokenInfo = this.tokenManager.getTokenInfo()

        if (!tokenInfo) {
          throw new ApiError(401, 'No authentication token available')
        }

        // Check if token is expired and refresh if needed
        if (tokenInfo.isExpired) {
          console.log('🔄 Token expired, refreshing...')
          await this.refreshAccessToken()
        }

        // Add fresh auth header
        Object.assign(headers, this.tokenManager.getAuthHeader())
      }

      // Make real API call
      console.log(`📡 API Request: ${method} ${url}`, { data, headers })

      const response = await fetch(`${this.baseURL}${url}`, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      })

      const responseData = await response.json()

      if (!response.ok) {
        const error = new Error(responseData.message || 'API request failed')
        ;(error as any).status = response.status
        ;(error as any).code = responseData.error
        ;(error as any).details = responseData.details
        throw error
      }

      console.log(`✅ API Response: ${method} ${url}`, responseData)
      return responseData

    } catch (error: any) {
      console.error(`❌ API Error: ${method} ${url}`, error)

      // Handle 401 errors (unauthorized)
      if (error.status === 401 && requiresAuth && !this.isRefreshing) {
        try {
          console.log('🔄 Received 401, attempting token refresh...')
          const newAccessToken = await this.refreshAccessToken()

          // Retry the original request with new token
          headers.Authorization = `Bearer ${newAccessToken}`
          console.log(`🔄 Retrying request: ${method} ${url}`)

          const retryResponse = await fetch(`${this.baseURL}${url}`, {
            method,
            headers,
            body: data ? JSON.stringify(data) : undefined,
          })

          const retryData = await retryResponse.json()

          if (!retryResponse.ok) {
            const retryError = new Error(retryData.message || 'Retry request failed')
            ;(retryError as any).status = retryResponse.status
            ;(retryError as any).code = retryData.error
            ;(retryError as any).details = retryData.details
            throw retryError
          }

          console.log(`✅ Retry successful: ${method} ${url}`, retryData)
          return retryData

        } catch (refreshError) {
          console.error('❌ Token refresh failed, redirecting to login')
          throw refreshError
        }
      }

      throw error
    }
  }



  // Convenience methods
  public async get<T>(url: string, requiresAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: 'GET', requiresAuth })
  }

  public async post<T>(url: string, data?: any, requiresAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: 'POST', data, requiresAuth })
  }

  public async put<T>(url: string, data?: any, requiresAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: 'PUT', data, requiresAuth })
  }

  public async delete<T>(url: string, requiresAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>({ url, method: 'DELETE', requiresAuth })
  }
}

// Custom error class
class ApiError extends Error {
  public status: number
  public code?: string
  public details?: Record<string, any>

  constructor(status: number, message: string, code?: string, details?: Record<string, any>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

// Export class and singleton instance
export { ApiService }
export const apiService = new ApiService()
export type { ApiError }
