// Authentication types
export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface LoginForm {
  email: string
  password: string
  rememberMe: boolean
}

export interface RegisterForm {
  username: string
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
}

export interface FormField<T = any> {
  value: T
  error?: string
  touched: boolean
  required?: boolean
}

export interface ValidationErrors {
  [key: string]: string
}

// Authentication response types
export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType?: string
}

export interface AuthResponse {
  user: User
  tokens: AuthTokens
}

// Re-export User types for convenience
export type { User, LoginCredentials, RegisterData } from './user'
