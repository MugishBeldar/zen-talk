import React, { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import type { RegisterForm, ValidationErrors } from '@/types/auth'

export const RegisterPage: React.FC = () => {
  const { register, isAuthenticated, isLoading, error, clearError } = useAuthStore()
  
  const [formData, setFormData] = useState<RegisterForm>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  })
  
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/chat" replace />
  }

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}

    if (!formData.username) {
      errors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters'
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores'
    }

    if (!formData.email) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.firstName) {
      errors.firstName = 'First name is required'
    }

    if (!formData.lastName) {
      errors.lastName = 'Last name is required'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    
    if (!validateForm()) return

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        firstName: formData.firstName,
        lastName: formData.lastName,
      })
    } catch (error) {
      // Error is handled by the store
      console.error('Registration failed:', error)
    }
  }

  const handleInputChange = (field: keyof RegisterForm) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }))
    }
    
    // Clear global error
    if (error) {
      clearError()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">Create Account</h2>
        <p className="text-gray-600 text-sm">Join ZenTalk and start connecting</p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4"
        >
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name"
            placeholder="John"
            value={formData.firstName}
            onChange={handleInputChange('firstName')}
            error={validationErrors.firstName}
            required
            compact
            autoComplete="given-name"
          />

          <Input
            label="Last Name"
            placeholder="Doe"
            value={formData.lastName}
            onChange={handleInputChange('lastName')}
            error={validationErrors.lastName}
            required
            compact
            autoComplete="family-name"
          />
        </div>

        <Input
          label="Username"
          placeholder="johndoe"
          value={formData.username}
          onChange={handleInputChange('username')}
          error={validationErrors.username}
          required
          compact
          autoComplete="username"
        />

        <Input
          type="email"
          label="Email"
          placeholder="john@example.com"
          value={formData.email}
          onChange={handleInputChange('email')}
          error={validationErrors.email}
          required
          compact
          autoComplete="email"
        />

        <Input
          type="password"
          label="Password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleInputChange('password')}
          error={validationErrors.password}
          required
          compact
          autoComplete="new-password"
        />

        <Input
          type="password"
          label="Confirm Password"
          placeholder="Confirm your password"
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
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to="/auth/login"
            className="font-medium text-primary hover:text-primary-dark transition-colors"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </motion.div>
  )
}
