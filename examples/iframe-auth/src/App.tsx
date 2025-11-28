import React from 'react'
import { Provider, useW3, useStorachaAuth } from '@storacha/console-toolkit-react'
import { StorachaAuth } from '@storacha/console-toolkit-react-styled'

function AuthenticatedContent() {
  const [{ accounts }] = useW3()
  const auth = useStorachaAuth()

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: '#EFE3F3'
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        background: 'white',
        borderRadius: '1rem',
        padding: '2rem',
        border: '1px solid #E91315',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{
          color: '#E91315',
          fontSize: '1.5rem',
          marginBottom: '1rem',
          fontWeight: 600,
          fontFamily: 'Epilogue, sans-serif'
        }}>
          Authenticated
        </h2>
        <p style={{ color: '#64748b', marginBottom: '1rem' }}>
          Signed in as:
        </p>
        <p style={{
          color: '#1e293b',
          fontFamily: 'monospace',
          background: '#EFE3F3',
          padding: '0.75rem',
          borderRadius: '0.5rem',
          marginBottom: '1.5rem'
        }}>
          {accounts[0]?.toEmail()}
        </p>
        <button
          onClick={async () => {
            try {
              await auth.logoutWithTracking()
            } catch (error) {
              console.error('Logout error:', error)
            }
          }}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: '#E91315',
            color: 'white',
            border: '1px solid #E91315',
            borderRadius: '9999px',
            fontFamily: 'Epilogue, sans-serif',
            textTransform: 'uppercase',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'white'
            e.currentTarget.style.color = '#E91315'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = '#E91315'
            e.currentTarget.style.color = 'white'
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}

function IframeAuthApp() {
  return (
    <StorachaAuth
      enableIframeSupport={true}
      onAuthEvent={(event, props) => {
        console.log('🔐 Iframe Auth Event:', event, props)
      }}
    >
      <StorachaAuth.Ensurer>
        <AuthenticatedContent />
      </StorachaAuth.Ensurer>
    </StorachaAuth>
  )
}

function HostPage() {
  const iframeUrl = typeof window !== 'undefined' ? window.location.href : ''

  return (
    <div style={{
      minHeight: '100vh',
      padding: '2rem',
      background: '#f8fafc',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '2rem',
            color: '#1e293b',
            marginBottom: '0.5rem'
          }}>
            Iframe Integration Demo
          </h1>
          <p style={{
            color: '#64748b',
            fontSize: '1rem'
          }}>
            Storacha authentication embedded in partner application
          </p>
        </div>

        <div style={{
          border: '2px solid #e2e8f0',
          borderRadius: '0.5rem',
          overflow: 'hidden',
          background: 'white',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <Provider>
            <IframeAuthApp />
          </Provider>
        </div>
      </div>
    </div>
  )
}

function App() {
  const isIframe = typeof window !== 'undefined' && window.self !== window.top

  return (
    <Provider>
      {isIframe ? <IframeAuthApp /> : <HostPage />}
    </Provider>
  )
}

export default App
