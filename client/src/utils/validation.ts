// Validation utilities for forms
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
  return usernameRegex.test(username)
}

export const isValidPassword = (password: string): boolean => {
  return password.length >= 6
}

export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value || value.trim() === '') {
    return `${fieldName} is required`
  }
  return null
}

export const validateEmail = (email: string): string | null => {
  const required = validateRequired(email, 'Email')
  if (required) return required
  
  if (!isValidEmail(email)) {
    return 'Please enter a valid email address'
  }
  
  return null
}

export const validateUsername = (username: string): string | null => {
  const required = validateRequired(username, 'Username')
  if (required) return required
  
  if (!isValidUsername(username)) {
    return 'Username must be 3-20 characters and contain only letters, numbers, and underscores'
  }
  
  return null
}

export const validatePassword = (password: string): string | null => {
  const required = validateRequired(password, 'Password')
  if (required) return required
  
  if (!isValidPassword(password)) {
    return 'Password must be at least 6 characters long'
  }
  
  return null
}

export const validatePasswordConfirmation = (password: string, confirmPassword: string): string | null => {
  const required = validateRequired(confirmPassword, 'Password confirmation')
  if (required) return required
  
  if (password !== confirmPassword) {
    return 'Passwords do not match'
  }
  
  return null
}
