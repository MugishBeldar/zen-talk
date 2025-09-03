import React from 'react'
import { motion } from 'framer-motion'
import { useApiTest } from '@/hooks/useApiTest'
import { Button } from './Button'

export const ApiTestPanel: React.FC = () => {
  const {
    results,
    isLoading,
    testProtectedEndpoint,
    testTokenRefresh,
    testMultipleRequests,
    clearResults,
    getTokenInfo,
  } = useApiTest()

  const tokenInfo = getTokenInfo()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        backgroundColor: 'var(--color-card)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--color-border)',
        padding: 'var(--space-8)'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        marginBottom: 'var(--space-6)'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg style={{ width: '16px', height: '16px', color: '#3b82f6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 style={{
          fontSize: 'var(--font-size-xl)',
          fontWeight: '600',
          color: 'var(--color-text-primary)'
        }}>API Interceptor Test Panel</h3>
      </div>
      
      {/* Token Info */}
      <div style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-6)',
        marginBottom: 'var(--space-6)'
      }}>
        <h4 style={{
          fontWeight: '600',
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-4)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)'
        }}>
          <svg style={{ width: '20px', height: '20px', color: 'var(--color-text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z" />
          </svg>
          Token Status
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Has Token</span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                tokenInfo.hasToken
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {tokenInfo.hasToken ? 'Yes' : 'No'}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Is Expired</span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                tokenInfo.isExpired
                  ? 'bg-red-100 text-red-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {tokenInfo.isExpired ? 'Yes' : 'No'}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-600 mb-1">Expires At</span>
              <span className="text-xs text-gray-900 font-mono">
                {tokenInfo.expiresAt ? tokenInfo.expiresAt.toLocaleTimeString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Button
          onClick={testProtectedEndpoint}
          disabled={isLoading}
          variant="primary"
          size="sm"
          className="flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Test Protected API
        </Button>

        <Button
          onClick={testTokenRefresh}
          disabled={isLoading}
          variant="secondary"
          size="sm"
          className="flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Test Token Refresh
        </Button>

        <Button
          onClick={testMultipleRequests}
          disabled={isLoading}
          variant="secondary"
          size="sm"
          className="flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Multiple Requests
        </Button>

        <Button
          onClick={clearResults}
          disabled={isLoading}
          variant="danger"
          size="sm"
          className="flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear Results
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-3">
            <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <p className="text-blue-800 font-medium">Testing API interceptor...</p>
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="nes-container is-rounded">
          <h4 className="nes-text mb-4">📊 Test Results</h4>
          
          <div className="max-h-64 overflow-y-auto">
            {results.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`nes-container mb-2 ${
                  result.success ? 'is-success' : 'is-error'
                }`}
                style={{
                  backgroundColor: result.success 
                    ? 'var(--color-gray-100)' 
                    : 'var(--color-gray-200)',
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="nes-text text-sm">
                      <strong>
                        {result.success ? '✅' : '❌'} 
                        {result.timestamp.toLocaleTimeString()}
                      </strong>
                    </p>
                    
                    {result.success && result.data && (
                      <div className="mt-2">
                        <p className="nes-text text-xs">
                          <strong>Response:</strong>
                        </p>
                        <pre className="nes-text text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                          {typeof result.data === 'string' 
                            ? result.data 
                            : JSON.stringify(result.data, null, 2)
                          }
                        </pre>
                      </div>
                    )}
                    
                    {!result.success && result.error && (
                      <p className="nes-text text-xs mt-2" style={{ color: 'var(--color-gray-700)' }}>
                        <strong>Error:</strong> {result.error}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="nes-container is-rounded mt-4">
        <h4 className="nes-text">📖 How to Test</h4>
        <div className="nes-text text-sm mt-2">
          <p className="mb-2">
            <strong>🛡️ Test Protected API:</strong> Makes a request to a protected endpoint. 
            Should work normally if token is valid.
          </p>
          <p className="mb-2">
            <strong>🔄 Test Token Refresh:</strong> Forces token to expire and makes a request. 
            Should automatically refresh the token and retry.
          </p>
          <p className="mb-2">
            <strong>📡 Multiple Requests:</strong> Makes multiple concurrent requests. 
            Tests that token refresh is handled properly with concurrent calls.
          </p>
          <p>
            <strong>Note:</strong> The API service simulates random 401 errors (5% chance) 
            to test the token refresh functionality.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
