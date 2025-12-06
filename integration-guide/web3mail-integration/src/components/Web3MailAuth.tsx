import { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { useStorachaAuth } from '../../../../packages/react/src/hooks/useStorachaAuth'
// import { Web3MailFileUpload } from './Web3MailFileUpload'
// import { Web3MailShare } from './Web3MailShare'

export function AuthenticatedContent() {
  const auth = useStorachaAuth()
  // const [uploadedFile, setUploadedFile] = useState<any>(null)
  const [ensName, setEnsName] = useState<string | null>(null)

  const userEmail = auth.currentUser?.email || null

  useEffect(() => {
    if (userEmail) {
      const mockEnsName = `user${Math.floor(Math.random() * 1000)}.eth`
      setEnsName(mockEnsName)
    }
  }, [userEmail])

  // const handleFileUploaded = (fileInfo: any) => {
  //   setUploadedFile(fileInfo)
  // }

  const walletAddress = userEmail || '0x0000000000000000000000000000000000000000'

  return (
    <div className="web3mail-app">
      <header className="app-header">
        <div className="logo-container">
          <span className="web3mail-logo">
            <img src="/web3mail-logo.jpeg" alt="Web3Mail" width={150} height={70} />
          </span>
          <span className="divider">×</span>
          <span className="storacha-logo">
            <img src="/storacha-logo.svg" alt="Storacha" width={150} height={50} />
          </span>
        </div>
        <h1>Storacha × Web3Mail Integration</h1>
        <p>Decentralized storage meets decentralized messaging</p>
        <div className="user-info">
          <p>
            Connected as: <strong>{ensName || `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}</strong>
          </p>
          <button onClick={auth.logout} className="logout-button">
            Sign Out
          </button>
        </div>
      </header>

      {/* <main className="app-main">
        <div className="authenticated-content">
          <Web3MailFileUpload
            walletAddress={walletAddress}
            ensName={ensName || undefined}
            onFileUploaded={handleFileUploaded}
          />
          
          {uploadedFile && (
            <Web3MailShare
              fileCid={uploadedFile.cid}
              fileName={uploadedFile.fileName}
              walletAddress={walletAddress}
              ensName={ensName || undefined}
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
          <a href="https://ethermail.io" target="_blank" rel="noopener noreferrer">
            Ether Mail
          </a>
          <a href="https://github.com/storacha/console-toolkit" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}

export function Web3MailAuthForm() {
  const auth = useStorachaAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    setError(null)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await auth.handleRegisterSubmit?.(e)
  }

  return (
    <div className="web3mail-app">
      <header className="app-header">
        <div className="logo-container">
          <span className="web3mail-logo">
            <img src="/web3mail-logo.jpeg" alt="Web3Mail" width={150} height={70} />
          </span>
          <span className="divider">×</span>
          <span className="storacha-logo">
            <img src="/storacha-logo.svg" alt="Storacha" width={150} height={50} />
          </span>
        </div>
        <h1>Storacha × Web3Mail Integration</h1>
        <p>Decentralized storage meets decentralized messaging</p>
      </header>

      <main className="app-main">
        <div className="web3mail-auth">
          <div className="auth-header">
            <h2>Connect with Web3Mail</h2>
            <p>Use your ether mail to authenticate and access decentralized storage</p>
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

          <form onSubmit={handleSubmit} className="web3mail-auth-form">
            <div className="email-input-group">
              <label htmlFor="web3mail-email">Ether Mail Address</label>
              <input
                id="web3mail-email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="0x..@ethmail.cc or 0x..@ethermail.io"
                className="web3mail-email-input"
                required
              />
            </div>

            <button
              type="submit"
              disabled={auth.isSubmitting}
              className="web3mail-auth-button"
            >
              {auth.isSubmitting ? 'Authenticating...' : 'Authenticate with Web3Mail'}
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
          <a href="https://ethermail.io" target="_blank" rel="noopener noreferrer">
            Ether Mail
          </a>
          <a href="https://github.com/storacha/console-toolkit" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}