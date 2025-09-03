// User types for ZenTalk
export interface User {
  id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
  avatar?: string
  bio?: string
  status: UserStatus
  lastSeen: Date
  createdAt: Date
  updatedAt: Date
}

export type UserStatus = 'online' | 'offline' | 'away' | 'busy'

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  username: string
  email: string
  password: string
  confirmPassword: string
  firstName?: string
  lastName?: string
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  notifications: NotificationSettings
  privacy: PrivacySettings
  language: string
}

export interface NotificationSettings {
  messages: boolean
  mentions: boolean
  groupInvites: boolean
  soundEnabled: boolean
  desktopNotifications: boolean
}

export interface PrivacySettings {
  showOnlineStatus: boolean
  showLastSeen: boolean
  allowDirectMessages: boolean
  profileVisibility: 'public' | 'friends' | 'private'
}
