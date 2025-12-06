import React from 'react'
import { useStorachaAuth } from '../../../../packages/react/src/hooks/useStorachaAuth'
// import { DmailFileUpload } from './DmailFileUpload'
// import { DmailShare } from './DmailShare'

export function AuthenticatedContent() {
  const auth = useStorachaAuth()
  // const [uploadedFile, setUploadedFile] = React.useState<any>(null)

  const dmailEmail = auth.currentUser?.email || null

  // const handleFileUploaded = (fileInfo: any) => {
  //   setUploadedFile(fileInfo)
  // }

  if (!dmailEmail || !dmailEmail.endsWith('@dmail.ai')) {
    return (
      <div className="dmail-app">
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span>Please authenticate with a Dmail address (e.g. wallet addr@dmail.ai)</span>
        </div>
      </div>
    )
  }

  return (
    <div className="dmail-app">
      <header className="app-header">
        <div className="logo-container">
          <span className="dmail-logo">
            <img src="/dmail-logo.png" alt="Dmail" width={150} height={80} />
          </span>
          <span className="divider">×</span>
          <span className="storacha-logo">
            <img src="/storacha-logo.svg" alt="Storacha" width={150} height={50} />
          </span>
        </div>
        <h1>Storacha × Dmail Integration</h1>
        <p>Decentralized storage meets decentralized email</p>
        <div className="user-info">
          <p>Connected as: <strong>{dmailEmail}</strong></p>
          <button onClick={auth.logout} className="logout-button">
            Sign Out
          </button>
        </div>
      </header>

      {/* <main className="app-main">
        <div className="authenticated-content">
          <DmailFileUpload
            dmailEmail={dmailEmail}
            onFileUploaded={handleFileUploaded}
          />
          
          {uploadedFile && (
            <DmailShare
              fileCid={uploadedFile.cid}
              fileName={uploadedFile.fileName}
              dmailEmail={dmailEmail}
            />
          )}
        </div>
      </main> */}

      <footer className="app-footer">
        <p>Powered by Storacha Console Toolkit</p>
        <div className="footer-links">
          <a href="https://storacha.network" target="_blank" rel="noopener noreferrer">
            Storacha
          </a>
          <a href="https://dmail.ai" target="_blank" rel="noopener noreferrer">
            Dmail
          </a>
          <a href="https://github.com/storacha/console-toolkit" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}

export function DmailAuthForm() {
  const auth = useStorachaAuth()
  const [email, setEmail] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    setError(null)
  }

  const isDmailEmail = email.endsWith('@dmail.ai')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isDmailEmail) {
      setError('Please use a Dmail address (e.g. wallet addr@dmail.ai)')
      return
    }
    await auth.handleRegisterSubmit?.(e)
  }

  return (
    <div className="dmail-app">
      <header className="app-header">
        <div className="logo-container">
          <span className="dmail-logo">
            <img src="/dmail-logo.png" alt="Dmail" width={150} height={80} />
          </span>
          <span className="divider">×</span>
          <span className="storacha-logo">
            <img src="/storacha-logo.svg" alt="Storacha" width={150} height={50} />
            </span>
        </div>
        <h1>Storacha × Dmail Integration</h1>
        <p>Decentralized storage meets decentralized email</p>
      </header>

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
              <input
                id="dmail-email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="wallet addr@dmail.ai"
                className="dmail-email-input"
                required
              />
              {email && !isDmailEmail && (
                <p className="email-error">
                  Please use a Dmail address (e.g. wallet addr@dmail.ai)
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={auth.isSubmitting || !isDmailEmail}
              className="dmail-auth-button"
            >
              {auth.isSubmitting ? 'Connecting...' : 'Connect with Dmail'}
            </button>
          </form>
        </div>
      </main>

      <footer className="app-footer">
        <p>Powered by Storacha Console Toolkit</p>
        <div className="footer-links">
          <a href="https://storacha.network" target="_blank" rel="noopener noreferrer">
            Storacha
          </a>
          <a href="https://dmail.ai" target="_blank" rel="noopener noreferrer">
            Dmail
          </a>
          <a href="https://github.com/storacha/console-toolkit" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}