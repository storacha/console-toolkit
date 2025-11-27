import React from 'react'
import { Provider, useW3 } from '@storacha/console-toolkit-react'
import { StorachaAuth, useStorachaAuth } from '@storacha/console-toolkit-react'

function CustomAuthForm() {
  const auth = useStorachaAuth()

  return (
    <div className="auth-container">
      <form 
        className="auth-card"
        onSubmit={auth.handleRegisterSubmit}
      >
        <div className="auth-form-group">
          <label className="auth-label" htmlFor="email">
            Email Address
          </label>
          <StorachaAuth.EmailInput
            className="auth-input"
            id="email"
            placeholder="Enter your email"
            required
          />
        </div>
        <button
          className="auth-button"
          type="submit"
          disabled={auth.submitted}
        >
          {auth.submitted ? 'Sending...' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}

function CustomSubmitted() {
  const auth = useStorachaAuth()

  return (
    <div className="auth-container">
      <div className="auth-card auth-submitted">
        <h2>Check your email!</h2>
        <p>
          We sent a verification link to{' '}
          <span className="email-highlight">{auth.email}</span>
          <br />
          Click the link to complete authentication.
        </p>
        <StorachaAuth.CancelButton className="auth-button">
          Cancel
        </StorachaAuth.CancelButton>
      </div>
    </div>
  )
}

function AuthenticatedApp() {
  const [{ accounts }] = useW3()
  const auth = useStorachaAuth()

  return (
    <div className="authenticated-container">
      <div className="authenticated-card">
        <div className="authenticated-header">
          <h1>Welcome!</h1>
          <p>You're successfully authenticated</p>
        </div>

        <div className="auth-info">
          <p>
            <strong>Signed in as:</strong>
            <br />
            {accounts[0]?.toEmail()}
          </p>
        </div>

        <button onClick={auth.logout} className="logout-button">
          Sign Out
        </button>
      </div>
    </div>
  )
}

function App() {
  const handleAuthEvent = (event: string, properties?: Record<string, any>) => {
    console.log('🔐 Auth Event:', event, properties)
  }

  return (
    <Provider>
      <StorachaAuth
        onAuthEvent={handleAuthEvent}
        enableIframeSupport={false}
      >
        <StorachaAuth.Ensurer
          renderLoader={(type) => (
            <div className="auth-loader">
              <div className="spinner" />
              <p className="loader-text">
                {type === 'initializing' ? 'Initializing...' : 'Loading...'}
              </p>
            </div>
          )}
          renderForm={() => <CustomAuthForm />}
          renderSubmitted={() => <CustomSubmitted />}
        >
          <AuthenticatedApp />
        </StorachaAuth.Ensurer>
      </StorachaAuth>
    </Provider>
  )
}

export default App
