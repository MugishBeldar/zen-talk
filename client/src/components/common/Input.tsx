import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string
  error?: string
  onChange?: (value: string) => void
  loading?: boolean
  compact?: boolean
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  onChange,
  loading = false,
  compact = false,
  className,
  type = 'text',
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value)
  }

  const inputClasses = clsx(
    'input',
    {
      'error': error,
      'disabled': loading || props.disabled,
    },
    className
  )

  return (
    <div className={clsx('form-field', { compact })}>
      {label && (
        <label className="form-label" htmlFor={props.id}>
          {label}
          {props.required && <span className="text-error ml-1">*</span>}
        </label>
      )}

      <input
        className={inputClasses}
        type={type}
        onChange={handleChange}
        disabled={loading || props.disabled}
        {...props}
      />

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="form-error"
        >
          {error}
        </motion.p>
      )}

      {loading && (
        <div className="flex items-center mt-2">
          <svg
            className="animate-spin h-4 w-4 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-muted text-sm">Loading...</span>
        </div>
      )}
    </div>
  )
}
