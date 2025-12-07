import { useState, useEffect, FormEvent } from 'react'
import { useStorachaAuth, StorachaAuth } from '../../../../packages/react/src/index'
import { Footer } from './Footer'
import { Header } from './Header'
// import { DmailFileUpload } from './DmailFileUpload'
// import { DmailShare } from './DmailShare'

export function DmailSubmitted() {
  const auth = useStorachaAuth()

  return (
    <div className="dmail-app">
      <div
        className="dmail-submitted-container"
        style={{
          background: `#EFE3F3 url(/racha-fire.jpg) bottom left`,
          backgroundSize: '100% auto',
          backgroundPosition: 'bottom',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="dmail-submitted-card">
          <div className="dmail-submitted-logo-container">
            <img src="/storacha-logo.svg" alt="Storacha" className="dmail-submitted-logo" />
          </div>

          <div className="dmail-submitted-content">
            <div className="dmail-submitted-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="#E91315" />
              </svg>
            </div>

            <h1 className="dmail-submitted-title">Verify your email address!</h1>

            <p className="dmail-submitted-message">
              Click the link in the email we sent to{' '}
              <span className="dmail-submitted-email">{auth.email || 'your email'}</span> to authorize this agent.
            </p>

            <div className="dmail-submitted-important-note">
              <div className="dmail-submitted-note-icon">⚠️</div>
              <div className="dmail-submitted-note-content">
                <strong>Important:</strong> If you're viewing this email in Dmail, right-click the verification link and select "Open in new tab" to avoid iframe restrictions.
              </div>
            </div>

            <p className="dmail-submitted-hint">
              Once authorized you can close this window and return to the app.
              <br />
              <span className="dmail-submitted-spam-hint">Don't forget to check your spam folder!</span>
            </p>

            <div className="dmail-submitted-actions">
              <StorachaAuth.CancelButton className="dmail-submitted-cancel-button">
                Cancel
              </StorachaAuth.CancelButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AuthenticatedContent() {
  const auth = useStorachaAuth()

  const userEmail = auth.currentUser?.email || null

  if (!userEmail || !userEmail.endsWith('@dmail.ai')) {
    return (
      <div className="dmail-app authenticated-page">
        <div className="authenticated-background">
          <div className="bg-gradient-orb orb-1"></div>
          <div className="bg-gradient-orb orb-2"></div>
          <div className="bg-gradient-orb orb-3"></div>
        </div>
        <Header />
        <main className="app-main authenticated-main">
          <div className="authenticated-content-3d">
            <div className="error-banner" style={{ maxWidth: '600px', margin: '0 auto' }}>
              <span className="error-icon">⚠️</span>
              <span>Please authenticate with a Dmail address (e.g. wallet addr@dmail.ai)</span>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const walletAddress = userEmail || '0x0000000000000000000000000000000000000000'
  const displayName = `${walletAddress.slice(0, 4)}..${walletAddress.slice(39, 55)}`

  return (
    <div className="dmail-app authenticated-page">
      <div className="authenticated-background">
        <div className="bg-gradient-orb orb-1"></div>
        <div className="bg-gradient-orb orb-2"></div>
        <div className="bg-gradient-orb orb-3"></div>
      </div>

      <Header />

      <main className="app-main authenticated-main">
        <div className="authenticated-content-3d">
          <div className="status-card-3d">
            <div className="status-card-inner">
              <div className="status-icon-wrapper">
                <div className="status-icon-3d">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor" />
                  </svg>
                </div>
                <div className="status-pulse"></div>
              </div>

              <div className="status-content">
                <h2 className="status-title">Connected</h2>
                <p className="status-label">Your Dmail Address</p>
                <div className="wallet-display-3d">
                  <span className="wallet-address-3d">{displayName}</span>
                  <div className="wallet-badge">✓ Verified</div>
                </div>
              </div>
            </div>
          </div>

          <div className="action-section-3d">
            <button onClick={auth.logout} className="logout-button-3d">
              <span className="button-text">Sign Out</span>
              <span className="button-shine"></span>
            </button>
          </div>

          <div className="features-grid-3d">
            <div className="feature-card-3d">
              <div className="feature-icon-3d">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z" fill="currentColor" />
                </svg>
              </div>
              <h3 className="feature-title">Secure Storage</h3>
              <p className="feature-desc">Decentralized file storage powered by Storacha</p>
            </div>

            <div className="feature-card-3d">
              <div className="feature-icon-3d">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="currentColor" />
                </svg>
              </div>
              <h3 className="feature-title">Dmail</h3>
              <p className="feature-desc">Decentralized messaging via Dmail</p>
            </div>

            <div className="feature-card-3d">
              <div className="feature-icon-3d">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" fill="currentColor" />
                </svg>
              </div>
              <h3 className="feature-title">Privacy First</h3>
              <p className="feature-desc">End-to-end encrypted communications</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export function DmailAuthForm() {
  const auth = useStorachaAuth()
  const [error, setError] = useState<string | null>(null)

  const isDmailEmail = (email: string) => {
    return email.endsWith('@dmail.ai')
  }

  useEffect(() => {
    if (auth.email && isDmailEmail(auth.email)) {
      setError(null)
    }
  }, [auth.email])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!auth.email) {
      setError('Please enter your Dmail address')
      return
    }

    if (!isDmailEmail(auth.email)) {
      setError('Please use a Dmail address (e.g. wallet addr@dmail.ai)')
      return
    }

    setError(null)

    try {
      if (auth.handleRegisterSubmit) {
        await auth.handleRegisterSubmit(e)
      }
    } catch (err: any) {
      if (err?.name === 'AbortError' || err?.message?.includes('aborted')) {
        return
      }
      setError(err?.message || 'Authentication failed. Please try again.')
    }
  }

  return (
    <div className="dmail-app">
      <Header />

      <main className="app-main">
        <div className="dmail-auth">
          <div className="auth-header">
            <h2>Connect with Dmail</h2>
            <p>Use your Dmail address to authenticate and access Storacha storage</p>
          </div>

          {error && (
            <div className="error-banner">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
              <button onClick={() => setError(null)} className="close-button">
                ×
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="dmail-auth-form">
            <div className="email-input-group">
              <label htmlFor="dmail-email">Dmail Email</label>
              <StorachaAuth.EmailInput
                id="dmail-email"
                type="email"
                placeholder="wallet addr@dmail.ai"
                className="dmail-email-input"
                required
              />
              {auth.email && !isDmailEmail(auth.email) && (
                <p className="email-error" style={{ color: '#ff6b6b', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Please use a Dmail address (e.g. wallet addr@dmail.ai)
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={auth.isSubmitting || (auth.email ? !isDmailEmail(auth.email) : false)}
              className="dmail-auth-button"
            >
              {auth.isSubmitting ? 'Authenticating...' : 'Authenticate with Storacha'}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}