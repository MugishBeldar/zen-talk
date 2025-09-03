import type { AuthTokens, TokenInfo } from '@/types/api'

const ACCESS_TOKEN_KEY = 'zentalk_access_token'
const REFRESH_TOKEN_KEY = 'zentalk_refresh_token'
const TOKEN_EXPIRES_KEY = 'zentalk_token_expires'

export class TokenManager {
  private static instance: TokenManager
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private expiresAt: number | null = null

  private constructor() {
    this.loadTokensFromStorage()
  }

  public static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager()
    }
    return TokenManager.instance
  }

  private loadTokensFromStorage(): void {
    this.accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
    this.refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
    const expiresAt = localStorage.getItem(TOKEN_EXPIRES_KEY)
    this.expiresAt = expiresAt ? parseInt(expiresAt, 10) : null
  }

  public setTokens(tokens: AuthTokens): void {
    const expiresAt = Date.now() + (tokens.expiresIn * 1000)
    
    this.accessToken = tokens.accessToken
    this.refreshToken = tokens.refreshToken
    this.expiresAt = expiresAt

    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
    localStorage.setItem(TOKEN_EXPIRES_KEY, expiresAt.toString())
  }

  public getAccessToken(): string | null {
    return this.accessToken
  }

  public getRefreshToken(): string | null {
    return this.refreshToken
  }

  public getTokenInfo(): TokenInfo | null {
    if (!this.accessToken || !this.expiresAt) {
      return null
    }

    return {
      token: this.accessToken,
      expiresAt: this.expiresAt,
      isExpired: this.isTokenExpired(),
    }
  }

  public isTokenExpired(): boolean {
    if (!this.expiresAt) return true
    
    // Consider token expired if it expires within the next 5 minutes
    const bufferTime = 5 * 60 * 1000 // 5 minutes in milliseconds
    return Date.now() + bufferTime >= this.expiresAt
  }

  public hasValidToken(): boolean {
    return this.accessToken !== null && !this.isTokenExpired()
  }

  public updateAccessToken(accessToken: string, expiresIn: number): void {
    const expiresAt = Date.now() + (expiresIn * 1000)

    this.accessToken = accessToken
    this.expiresAt = expiresAt

    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    localStorage.setItem(TOKEN_EXPIRES_KEY, expiresAt.toString())
  }

  public updateRefreshToken(refreshToken: string): void {
    this.refreshToken = refreshToken
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }

  public clearTokens(): void {
    this.accessToken = null
    this.refreshToken = null
    this.expiresAt = null

    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(TOKEN_EXPIRES_KEY)
  }

  public getAuthHeader(): Record<string, string> {
    if (!this.accessToken) {
      return {}
    }

    return {
      Authorization: `Bearer ${this.accessToken}`,
    }
  }

  // Mock token generation for development
  public generateMockTokens(userId: string): AuthTokens {
    const mockAccessToken = `mock_access_${userId}_${Date.now()}`
    const mockRefreshToken = `mock_refresh_${userId}_${Date.now()}`
    
    return {
      accessToken: mockAccessToken,
      refreshToken: mockRefreshToken,
      expiresIn: 3600, // 1 hour
      tokenType: 'Bearer',
    }
  }

  // Mock expired token for testing
  public generateExpiredMockToken(userId: string): AuthTokens {
    const mockAccessToken = `mock_expired_${userId}_${Date.now()}`
    const mockRefreshToken = `mock_refresh_${userId}_${Date.now()}`
    
    return {
      accessToken: mockAccessToken,
      refreshToken: mockRefreshToken,
      expiresIn: -1, // Already expired
      tokenType: 'Bearer',
    }
  }
}
