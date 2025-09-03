import React, { useState } from 'react'

interface TooltipProps {
  content: string
  children: React.ReactElement
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = 'top',
  delay = 500 
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const showTooltip = () => {
    const id = setTimeout(() => {
      setIsVisible(true)
    }, delay)
    setTimeoutId(id)
  }

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
    setIsVisible(false)
  }

  const getPositionStyles = () => {
    const baseStyles = {
      position: 'absolute' as const,
      zIndex: 1000,
      backgroundColor: 'var(--color-gray-900)',
      color: 'white',
      padding: 'var(--space-2) var(--space-3)',
      borderRadius: 'var(--radius-md)',
      fontSize: 'var(--font-size-xs)',
      fontWeight: '500',
      whiteSpace: 'nowrap' as const,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      opacity: isVisible ? 1 : 0,
      visibility: isVisible ? 'visible' : 'hidden' as const,
      transition: 'opacity 0.2s ease-in-out, visibility 0.2s ease-in-out',
      pointerEvents: 'none' as const
    }

    switch (position) {
      case 'top':
        return {
          ...baseStyles,
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: 'var(--space-2)'
        }
      case 'bottom':
        return {
          ...baseStyles,
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginTop: 'var(--space-2)'
        }
      case 'left':
        return {
          ...baseStyles,
          right: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          marginRight: 'var(--space-2)'
        }
      case 'right':
        return {
          ...baseStyles,
          left: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          marginLeft: 'var(--space-2)'
        }
      default:
        return baseStyles
    }
  }

  return (
    <div 
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      <div style={getPositionStyles()}>
        {content}
      </div>
    </div>
  )
}
