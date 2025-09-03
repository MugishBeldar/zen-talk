import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { authService } from '@/services/authService'

interface FormData {
  email: string
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

interface ValidationErrors {
  email?: string
  oldPassword?: string
  newPassword?: string
  confirmPassword?: string
}

export const ForgotPasswordPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<FormData>({
    email: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSupportMessage, setShowSupportMessage] = useState(false)

  const handleInputChange = (field: keyof FormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }))
    }
    // Clear general error
    if (error) {
      setError(null)
      setShowSupportMessage(false)
    }
  }

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}

    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!formData.oldPassword) {
      errors.oldPassword = 'Current password is required'
    }

    if (!formData.newPassword) {
      errors.newPassword = 'New password is required'
    } else if (formData.newPassword.length < 6) {
      errors.newPassword = 'New password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password'
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError(null)
    setShowSupportMessage(false)

    try {
      await authService.resetPassword({
        email: formData.email,
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      })

      // Success - redirect to login with success message
      navigate('/login', { 
        state: { 
          message: 'Password reset successful! Please login with your new password.',
          type: 'success'
        }
      })
    } catch (err: any) {
      console.error('Password reset failed:', err)
      console.error('Error details:', {
        message: err.message,
        status: err.status,
        code: err.code,
        details: err.details
      })

      // Handle API error response structure
      if (err.status === 400 && err.details) {
        // Check for old password error
        if (err.details.oldPassword) {
          setError(err.details.oldPassword)
          setShowSupportMessage(true)
        }
        // Check for other validation errors
        else if (err.details.email) {
          setError(err.details.email)
          setShowSupportMessage(true)
        }
        // Use the main message if available
        else if (err.message && err.message !== 'Validation failed') {
          setError(err.message)
        }
        // Fallback to generic message
        else {
          setError('Password reset failed. Please check your information and try again.')
        }
      }
      // Handle other error types
      else if (err.message && err.message !== 'Validation failed') {
        setError(err.message)
        if (err.message.includes('contact customer support') || err.message.includes('Current password is incorrect')) {
          setShowSupportMessage(true)
        }
      }
      // Fallback error message
      else {
        setError('Password reset failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">Reset Password</h2>
        <p className="text-gray-600 text-sm">Enter your current password to set a new one</p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4"
        >
          <p className="text-red-700 text-sm font-medium">{error}</p>
          {showSupportMessage && (
            <div className="mt-2 pt-2 border-t border-red-200">
              <p className="text-red-600 text-xs">
                Need help? Contact{' '}
                <a 
                  href="mailto:support@zentalk.com" 
                  className="font-medium underline hover:text-red-700"
                >
                  ZenTalk Customer Support
                </a>
              </p>
            </div>
          )}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="email"
          label="Email Address"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleInputChange('email')}
          error={validationErrors.email}
          required
          compact
          autoComplete="email"
        />

        <Input
          type="password"
          label="Current Password"
          placeholder="Enter your current password"
          value={formData.oldPassword}
          onChange={handleInputChange('oldPassword')}
          error={validationErrors.oldPassword}
          required
          compact
          autoComplete="current-password"
        />

        <Input
          type="password"
          label="New Password"
          placeholder="Enter your new password"
          value={formData.newPassword}
          onChange={handleInputChange('newPassword')}
          error={validationErrors.newPassword}
          required
          compact
          autoComplete="new-password"
        />

        <Input
          type="password"
          label="Confirm New Password"
          placeholder="Confirm your new password"
          value={formData.confirmPassword}
          onChange={handleInputChange('confirmPassword')}
          error={validationErrors.confirmPassword}
          required
          compact
          autoComplete="new-password"
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isLoading}
          className="w-full"
        >
          {isLoading ? 'Resetting Password...' : 'Reset Password'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Remember your password?{' '}
          <Link
            to="/auth/login"
            className="font-medium text-primary hover:text-primary-dark transition-colors"
          >
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  )
}
