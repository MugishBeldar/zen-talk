// Application constants
export const APP_NAME = 'ZenTalk'

export const ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
  },
  MAIN: {
    CHAT: '/chat',
    GROUPS: '/groups',
    PROFILE: '/profile',
    SETTINGS: '/settings',
  },
} as const

export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 20,
  MAX_BIO_LENGTH: 160,
} as const

export const ANIMATION = {
  DURATION: {
    FAST: 0.15,
    NORMAL: 0.3,
    SLOW: 0.5,
  },
  EASING: {
    EASE_OUT: [0.0, 0.0, 0.2, 1],
    EASE_IN: [0.4, 0.0, 1, 1],
    EASE_IN_OUT: [0.4, 0.0, 0.2, 1],
  },
} as const

export const THEME = {
  COLORS: {
    BLACK: 'var(--color-black)',
    WHITE: 'var(--color-white)',
    GRAY: {
      100: 'var(--color-gray-100)',
      200: 'var(--color-gray-200)',
      300: 'var(--color-gray-300)',
      400: 'var(--color-gray-400)',
      500: 'var(--color-gray-500)',
      600: 'var(--color-gray-600)',
      700: 'var(--color-gray-700)',
      800: 'var(--color-gray-800)',
      900: 'var(--color-gray-900)',
    },
  },
} as const
