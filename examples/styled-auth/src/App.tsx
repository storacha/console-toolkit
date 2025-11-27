import React from 'react'
import { Provider, useW3, useStorachaAuth } from '@storacha/console-toolkit-react'
import { StorachaAuth } from '@storacha/console-toolkit-react-styled'

function AuthenticatedApp() {
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
        maxWidth: '600px',
        width: '100%',
        background: 'white',
        borderRadius: '1rem',
        padding: '2rem',
        border: '1px solid #E91315',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ 
          borderBottom: '2px solid #EFE3F3',
          paddingBottom: '1rem',
          marginBottom: '1.5rem'
        }}>
          <h1 style={{ 
            color: '#E91315',
            fontSize: '1.75rem',
            marginBottom: '0.5rem',
            fontFamily: 'Epilogue, sans-serif'
          }}>
            🎉 Welcome to Storacha!
          </h1>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>
            Plug-and-play authentication example
          </p>
        </div>

        <div style={{ 
          background: '#EFE3F3',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1.5rem'
        }}>
          <p style={{ 
            color: '#333',
            lineHeight: '1.5',
            marginBottom: '0.5rem'
          }}>
            <strong style={{ color: '#E91315' }}>Signed in as:</strong>
          </p>
          <p style={{ 
            color: '#666',
            fontFamily: 'monospace',
            fontSize: '0.9rem'
          }}>
            {accounts[0]?.toEmail()}
          </p>
        </div>

        <button
          onClick={auth.logoutWithTracking}
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

function App() {
  const handleAuthEvent = (event: string, properties?: Record<string, any>) => {
    console.log('Auth Event:', event, properties)
  }

  return (
    <Provider>
      <StorachaAuth
        onAuthEvent={handleAuthEvent}
        enableIframeSupport={true}
        serviceName="storacha.network"
        termsUrl="https://docs.storacha.network/terms/"
      >
        <StorachaAuth.Ensurer>
          <AuthenticatedApp />
        </StorachaAuth.Ensurer>
      </StorachaAuth>
    </Provider>
  )
}

export default App


