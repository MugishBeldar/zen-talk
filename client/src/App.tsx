import { Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { LoginPage } from '@/pages/Auth/LoginPage'
import { RegisterPage } from '@/pages/Auth/RegisterPage'
import { ForgotPasswordPage } from '@/pages/Auth/ForgotPasswordPage'
import { ChatPage } from '@/pages/ChatPage'
import { useAuthStore } from '@/stores/authStore'
import { ThemeProvider } from '@/contexts/ThemeContext'

function App() {
  const initialize = useAuthStore((state) => state.initialize)

  useEffect(() => {
    // Initialize auth state on app start
    initialize()
  }, [initialize])

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner text="Loading ZenTalk..." />}>
          <Routes>
          {/* Authentication Routes */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route index element={<Navigate to="login" replace />} />
          </Route>

          {/* Protected Main Application Routes */}
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/auth/login" replace />} />

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
