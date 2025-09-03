import { useState } from 'react'
import { apiService } from '@/services/apiService'
import { TokenManager } from '@/utils/tokenManager'

interface ApiTestResult {
  success: boolean
  data?: any
  error?: string
  timestamp: Date
}

export const useApiTest = () => {
  const [results, setResults] = useState<ApiTestResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const tokenManager = TokenManager.getInstance()

  const addResult = (result: Omit<ApiTestResult, 'timestamp'>) => {
    setResults(prev => [...prev, { ...result, timestamp: new Date() }])
  }

  const testProtectedEndpoint = async () => {
    setIsLoading(true)
    try {
      const response = await apiService.get('/user/profile')
      addResult({
        success: response.success,
        data: response.data,
      })
    } catch (error) {
      addResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testTokenRefresh = async () => {
    setIsLoading(true)
    try {
      // Force token to be expired for testing
      const expiredTokens = tokenManager.generateExpiredMockToken('test-user')
      tokenManager.setTokens(expiredTokens)
      
      addResult({
        success: true,
        data: 'Token set to expired for testing',
      })

      // Now try to make a protected request - should trigger refresh
      const response = await apiService.get('/user/profile')
      addResult({
        success: response.success,
        data: { message: 'Token refresh successful', profile: response.data },
      })
    } catch (error) {
      addResult({
        success: false,
        error: error instanceof Error ? error.message : 'Token refresh failed',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testMultipleRequests = async () => {
    setIsLoading(true)
    try {
      // Make multiple concurrent requests to test token refresh handling
      const promises = [
        apiService.get('/user/profile'),
        apiService.get('/chat/messages'),
        apiService.get('/user/profile'),
      ]

      const responses = await Promise.all(promises)
      addResult({
        success: true,
        data: { message: 'Multiple requests completed', responses: responses.length },
      })
    } catch (error) {
      addResult({
        success: false,
        error: error instanceof Error ? error.message : 'Multiple requests failed',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const clearResults = () => {
    setResults([])
  }

  const getTokenInfo = () => {
    const tokenInfo = tokenManager.getTokenInfo()
    return {
      hasToken: !!tokenInfo,
      isExpired: tokenInfo?.isExpired || false,
      expiresAt: tokenInfo?.expiresAt ? new Date(tokenInfo.expiresAt) : null,
    }
  }

  return {
    results,
    isLoading,
    testProtectedEndpoint,
    testTokenRefresh,
    testMultipleRequests,
    clearResults,
    getTokenInfo,
  }
}
