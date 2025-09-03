import React from 'react'
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ThemeToggle } from '@/components/common/ThemeToggle'

export const AuthLayout: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-background) 100%)',
      position: 'relative'
    }}>
      {/* Theme Toggle */}
      <div style={{
        position: 'absolute',
        top: 'var(--space-4)',
        right: 'var(--space-4)',
        zIndex: 10
      }}>
        <ThemeToggle size="md" />
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 'var(--space-4)'
      }}>
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            width: '100%',
            maxWidth: '28rem',
            margin: 'var(--space-8) 0'
          }}
        >
        {/* Brand Section */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          style={{
            textAlign: 'center',
            marginBottom: 'var(--space-8)'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 'var(--space-4)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: 'var(--color-primary)',
              borderRadius: 'var(--radius-xl)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-lg)'
            }}>
              <svg
                style={{
                  width: '24px',
                  height: '24px',
                  color: 'white'
                }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
          </div>
          <h1 style={{
            fontSize: 'var(--font-size-3xl)',
            fontWeight: 'bold',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-2)'
          }}>
            ZenTalk
          </h1>
          <p style={{
            color: 'var(--color-text-secondary)'
          }}>
            Connect with your team beautifully
          </p>
        </motion.div>

        {/* Auth Content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          style={{
            backgroundColor: 'var(--color-card)',
            borderRadius: 'var(--radius-2xl)',
            boxShadow: 'var(--shadow-xl)',
            padding: 'var(--space-8)',
            border: '1px solid var(--color-border)'
          }}
        >
          <Outlet />
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          style={{
            textAlign: 'center',
            marginTop: 'var(--space-6)'
          }}
        >
          <p style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-muted)'
          }}>
            © 2024 ZenTalk. Built with ❤️ and modern design.
          </p>
        </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
