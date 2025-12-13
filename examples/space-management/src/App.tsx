import React, { useState } from 'react'
import { Provider, useW3, StorachaAuth } from '@storacha/console-toolkit-react'
import {
  SpacePicker,
  SpaceCreator,
  SpaceList,
  FileViewer,
  SharingTool,
  SpaceEnsurer,
  useSpacePickerContext,
  useSharingToolContext,
  useSpaceCreatorContext,
} from '@storacha/console-toolkit-react'
import type { UnknownLink, Space } from '@storacha/ui-core'

function SpaceCreatorNameField() {
  return (
    <div className="app-form-field">
      <label className="app-form-label" htmlFor="space-name">
        Space Name
      </label>
      <SpaceCreator.NameInput
        id="space-name"
        className="app-form-input"
        placeholder="Enter a memorable name for your space"
        required
      />
      <p className="app-form-hint">This is a memorable alias. The true name is a unique DID.</p>
    </div>
  )
}

function SpaceCreatorAccessTypeField() {
  const [{ accessType }, { setAccessType }] = useSpaceCreatorContext()
  
  return (
    <div className="app-form-field">
      <label className="app-form-label">Access Type</label>
      <div className="app-access-type-options">
        <label className={`app-access-type-option ${accessType === 'public' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="accessType"
            value="public"
            checked={accessType === 'public'}
            onChange={() => setAccessType('public')}
            className="app-radio-input"
          />
          <div className="app-access-type-content">
            <span className="app-access-type-title">🌐 Public Space</span>
            <p className="app-access-type-description">Files stored unencrypted and accessible via IPFS</p>
          </div>
        </label>
        <label className={`app-access-type-option ${accessType === 'private' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="accessType"
            value="private"
            checked={accessType === 'private'}
            onChange={() => setAccessType('private')}
            className="app-radio-input"
          />
          <div className="app-access-type-content">
            <span className="app-access-type-title">🔒 Private Space</span>
            <p className="app-access-type-description">Files encrypted locally before upload</p>
          </div>
        </label>
      </div>
    </div>
  )
}


function SharingView({ space, revokingEmails, setRevokingEmails }: { 
  space: Space
  revokingEmails: Set<string>
  setRevokingEmails: React.Dispatch<React.SetStateAction<Set<string>>>
}) {
  const [{ sharedEmails }, { revokeDelegation }] = useSharingToolContext()
  
  const handleRevoke = async (email: string, delegation: any) => {
    try {
      setRevokingEmails(prev => new Set([...prev, email]))
      await revokeDelegation(email, delegation)
    } catch (error) {
      console.error('Failed to revoke delegation:', error)
      alert('Failed to revoke delegation. Please try again.')
    } finally {
      setRevokingEmails(prev => {
        const next = new Set(prev)
        next.delete(email)
        return next
      })
    }
  }

  return (
    <div className="app-section">
      <div className="app-section-header">
        <h2>Share {space.name || 'Untitled Space'}</h2>
        <p className="app-section-description">Share access to this space with others via email or DID</p>
      </div>
      <div className="app-sharing-container">
        <SharingTool.Form 
          renderInput={() => (
            <div className="app-form-field">
              <label className="app-form-label" htmlFor="share-input">
                Email or DID
              </label>
              <SharingTool.Input
                id="share-input"
                className="app-form-input"
                placeholder="email@example.com or did:key:..."
              />
              <p className="app-form-hint">Enter an email address or Decentralized Identifier (DID)</p>
            </div>
          )}
          renderSubmitButton={(disabled) => (
            <button
              type="submit"
              className={`app-submit-button ${disabled ? 'loading' : ''}`}
              disabled={disabled}
            >
              {disabled ? (
                <>
                  <span className="app-spinner"></span>
                  Sharing...
                </>
              ) : (
                <>
                  <span>🔗</span>
                  Share Space
                </>
              )}
            </button>
          )}
        />
        <SharingTool.SharedList 
          renderItem={(item, index) => {
            const isRevoking = revokingEmails.has(item.email)
            return (
              <div key={item.email} className={`app-shared-item ${item.revoked ? 'revoked' : ''}`}>
                <div className="app-shared-item-content">
                  <div className="app-shared-item-header">
                    <span className="app-shared-email">{item.email}</span>
                    {item.revoked && (
                      <span className="app-revoked-badge">Revoked</span>
                    )}
                  </div>
                  <div className="app-shared-capabilities">
                    Capabilities: {item.capabilities.join(', ')}
                  </div>
                </div>
                {!item.revoked && (
                  <button
                    className={`app-revoke-button ${isRevoking ? 'loading' : ''}`}
                    onClick={() => handleRevoke(item.email, item.delegation)}
                    disabled={isRevoking}
                  >
                    {isRevoking ? (
                      <>
                        <span className="app-spinner"></span>
                        Revoking...
                      </>
                    ) : (
                      <>
                        <span>✕</span>
                        Revoke
                      </>
                    )}
                  </button>
                )}
              </div>
            )
          }}
        />
      </div>
    </div>
  )
}

function SpaceManagementApp() {
  const [{ accounts }, { logout }] = useW3()
  const [{ selectedSpace }, { setSelectedSpace }] = useSpacePickerContext()
  const [viewMode, setViewMode] = useState<'picker' | 'list' | 'viewer' | 'sharing' | 'creator'>('picker')
  const [selectedRoot, setSelectedRoot] = useState<UnknownLink | undefined>()
  const [revokingEmails, setRevokingEmails] = useState<Set<string>>(new Set())

  const handleLogout = async () => {
    try {
      if (logout) {
        await logout()
        window.location.reload()
      }
    } catch (error) {
      console.error('Logout error:', error)
      alert('Failed to logout. Please try again.')
    }
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-header-content">
          <h1 className="app-title">Storacha Space Management</h1>
          {accounts[0] && (
            <div className="app-header-user">
              <p className="app-user">
                <span className="app-user-label">Signed in as:</span>
                <span className="app-user-email">{accounts[0].toEmail()}</span>
              </p>
              <button 
                onClick={handleLogout}
                className="app-logout-button"
                title="Sign out"
              >
                <span>🚪</span> Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <nav className="app-nav">
        <button 
          onClick={() => setViewMode('picker')}
          className={`app-nav-button ${viewMode === 'picker' ? 'active' : ''}`}
        >
          <span>📁</span> Spaces
        </button>
        <button 
          onClick={() => setViewMode('creator')}
          className={`app-nav-button ${viewMode === 'creator' ? 'active' : ''}`}
        >
          <span>➕</span> Create Space
        </button>
        {selectedSpace && (
          <>
            <button 
              onClick={() => setViewMode('list')}
              className={`app-nav-button ${viewMode === 'list' ? 'active' : ''}`}
            >
              <span>📤</span> Upload
            </button>
            <button 
              onClick={() => setViewMode('sharing')}
              className={`app-nav-button ${viewMode === 'sharing' ? 'active' : ''}`}
            >
              <span>🔗</span> Share
            </button>
          </>
        )}
      </nav>

      <main className="app-main">
        {viewMode === 'picker' && (
          <div className="app-section">
            <div className="app-section-header">
              <h2>Select a Space</h2>
              <p className="app-section-description">Choose a space to view its contents or manage sharing</p>
            </div>
            <div className="app-search-container">
              <SpacePicker.Search placeholder="Search spaces by name or DID..." />
            </div>
            <div className="app-spaces-container">
              <SpacePicker.List 
                type="all"
                renderItem={(space: Space) => (
                  <div 
                    className="app-space-item"
                    onClick={() => {
                      setSelectedSpace(space)
                      setViewMode('list')
                    }}
                  >
                    <div className="app-space-item-icon">
                      <div className="app-space-icon-placeholder">
                        {space.name?.[0]?.toUpperCase() || 'S'}
                      </div>
                    </div>
                    <div className="app-space-item-content">
                      <div className="app-space-item-header">
                        <span className="app-space-item-name">{space.name || 'Untitled Space'}</span>
                        <span className={`app-space-badge ${space.access?.type === 'private' ? 'private' : 'public'}`}>
                          {space.access?.type === 'private' ? '🔒 Private' : '🌐 Public'}
                        </span>
                      </div>
                      <div className="app-space-item-did">{space.did()}</div>
                    </div>
                    <div className="app-space-item-arrow">→</div>
                  </div>
                )}
                renderEmpty={() => (
                  <div className="app-empty-state">
                    <div className="app-empty-icon">📦</div>
                    <p className="app-empty-title">No spaces yet</p>
                    <p className="app-empty-description">Create your first space to get started</p>
                    <button 
                      className="app-empty-action"
                      onClick={() => setViewMode('creator')}
                    >
                      Create Space
                    </button>
                  </div>
                )}
                onSpaceClick={(space) => {
                  setSelectedSpace(space)
                  setViewMode('list')
                }}
              />
            </div>
          </div>
        )}

        {viewMode === 'creator' && (
          <div className="app-section">
            <div className="app-section-header">
              <h2>Create a New Space</h2>
              <p className="app-section-description">A space is a decentralized bucket for storing your files</p>
            </div>
            <SpaceCreator
              gatewayHost="https://w3s.link"
              gatewayDID="did:web:w3s.link"
              providerDID="did:web:web3.storage"
              onSpaceCreated={(space) => {
                setSelectedSpace(space)
                setViewMode('list')
              }}
              onError={(error) => {
                console.error('Space creation error:', error)
                alert(`Failed to create space: ${error.message}`)
              }}
            >
              <SpaceCreator.Form 
                renderContainer={(children) => (
                  <div className="app-creator-form">
                    {children}
                  </div>
                )}
                renderNameInput={() => <SpaceCreatorNameField />}
                renderAccessTypeSelector={() => <SpaceCreatorAccessTypeField />}
                renderSubmitButton={(disabled) => (
                  <button
                    type="submit"
                    className={`app-submit-button ${disabled ? 'loading' : ''}`}
                    disabled={disabled}
                  >
                    {disabled ? (
                      <>
                        <span className="app-spinner"></span>
                        Creating Space...
                      </>
                    ) : (
                      <>
                        <span>➕</span>
                        Create Space
                      </>
                    )}
                  </button>
                )}
              />
            </SpaceCreator>
          </div>
        )}

        {viewMode === 'list' && selectedSpace && (
          <div className="app-section">
            <div className="app-section-header">
              <div className="app-space-header">
                <div>
                  <h2>{selectedSpace.name || 'Untitled Space'}</h2>
                  <p className="app-space-did">{selectedSpace.did()}</p>
                </div>
                <span className={`app-space-badge ${selectedSpace.access?.type === 'private' ? 'private' : 'public'}`}>
                  {selectedSpace.access?.type === 'private' ? '🔒 Private' : '🌐 Public'}
                </span>
              </div>
            </div>
            <SpaceList space={selectedSpace}>
              <SpaceList.List 
                renderItem={(upload, index) => (
                  <div 
                    key={upload.root.toString()}
                    className="app-upload-item"
                    onClick={() => {
                      setSelectedRoot(upload.root)
                      setViewMode('viewer')
                    }}
                  >
                    <div className="app-upload-icon">📄</div>
                    <div className="app-upload-content">
                      <div className="app-upload-cid">{upload.root.toString()}</div>
                      <div className="app-upload-meta">
                        <span className="app-upload-date">
                          {new Date(upload.updatedAt).toLocaleDateString()} at {new Date(upload.updatedAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <div className="app-upload-arrow">→</div>
                  </div>
                )}
                renderEmpty={() => (
                  <div className="app-empty-state">
                    <div className="app-empty-icon">📭</div>
                    <p className="app-empty-title">No uploads found</p>
                    <p className="app-empty-description">This space is empty. Upload files to get started.</p>
                  </div>
                )}
                renderLoading={() => (
                  <div className="app-loading-state">
                    <span className="app-spinner"></span>
                    <p>Loading uploads...</p>
                  </div>
                )}
                onItemClick={(root) => {
                  setSelectedRoot(root)
                  setViewMode('viewer')
                }}
              />
              <SpaceList.Pagination />
            </SpaceList>
          </div>
        )}

        {viewMode === 'viewer' && selectedSpace && selectedRoot && (
          <div className="app-section">
            <div className="app-section-header">
              <button 
                onClick={() => {
                  setViewMode('list')
                  setSelectedRoot(undefined)
                }}
                className="app-back-button"
              >
                ← Back to Upload
              </button>
              <h2>File Details</h2>
            </div>
            <FileViewer space={selectedSpace} root={selectedRoot}>
              <div className="app-file-viewer">
                <FileViewer.Root 
                  renderRoot={(root: UnknownLink) => (
                    <div className="app-file-detail">
                      <label className="app-file-label">Root CID</label>
                      <div className="app-file-value-container">
                        <code className="app-file-code">{root.toString()}</code>
                        <button
                          className="app-copy-button"
                          onClick={() => {
                            navigator.clipboard.writeText(root.toString())
                            alert('CID copied to clipboard!')
                          }}
                        >
                          📋 Copy
                        </button>
                      </div>
                    </div>
                  )}
                />
                <FileViewer.URL 
                  renderURL={(url: string) => (
                    <div className="app-file-detail">
                      <label className="app-file-label">Gateway URL</label>
                      <div className="app-file-value-container">
                        <a 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="app-file-link"
                        >
                          {url}
                        </a>
                        <button
                          className="app-copy-button"
                          onClick={() => {
                            navigator.clipboard.writeText(url)
                            alert('URL copied to clipboard!')
                          }}
                        >
                          📋 Copy
                        </button>
                      </div>
                    </div>
                  )}
                />
                <FileViewer.Shards 
                  renderShard={(shard, index) => (
                    <div key={shard.toString()} className="app-file-detail">
                      <label className="app-file-label">Shard {index + 1}</label>
                      <div className="app-file-value-container">
                        <code className="app-file-code">{shard.toString()}</code>
                        <button
                          className="app-copy-button"
                          onClick={() => {
                            navigator.clipboard.writeText(shard.toString())
                            alert('Shard CID copied to clipboard!')
                          }}
                        >
                          📋 Copy
                        </button>
                      </div>
                    </div>
                  )}
                />
                <div className="app-file-actions">
                  <FileViewer.RemoveButton 
                    removeShards={true}
                    renderButton={(onClick, loading) => (
                      <button
                        className={`app-danger-button ${loading ? 'loading' : ''}`}
                        onClick={onClick}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="app-spinner"></span>
                            Removing...
                          </>
                        ) : (
                          <>
                            <span>🗑️</span>
                            Remove File
                          </>
                        )}
                      </button>
                    )}
                    onRemove={() => {
                      setViewMode('list')
                      setSelectedRoot(undefined)
                    }}
                  />
                </div>
              </div>
            </FileViewer>
          </div>
        )}

        {viewMode === 'sharing' && selectedSpace && (
          <SharingTool space={selectedSpace}>
            <SharingView 
              space={selectedSpace}
              revokingEmails={revokingEmails}
              setRevokingEmails={setRevokingEmails}
            />
          </SharingTool>
        )}
      </main>
    </div>
  )
}

function App() {
  return (
    <Provider>
      <StorachaAuth>
        <StorachaAuth.Ensurer
          renderLoader={(type) => (
            <div className="app-auth-loader">
              <div className="app-spinner"></div>
              <h3>{type === 'initializing' ? 'Initializing...' : 'Authenticating...'}</h3>
            </div>
          )}
          renderForm={() => (
            <div className="app-auth-container">
              <StorachaAuth.Form 
                renderContainer={(children) => (
                  <div className="app-auth-form-wrapper">
                    {children}
                  </div>
                )}
                renderLogo={() => (
                  <div className="app-auth-logo-container">
                    <div className="app-auth-logo-placeholder">S</div>
                    <h1 className="app-auth-title">Storacha</h1>
                  </div>
                )}
                renderEmailLabel={() => (
                  <label className="app-auth-label" htmlFor="storacha-auth-email">
                    Email
                  </label>
                )}
                renderEmailInput={() => (
                  <StorachaAuth.EmailInput
                    id="storacha-auth-email"
                    className="app-auth-email-input"
                    required
                  />
                )}
                renderSubmitButton={(disabled) => (
                  <button
                    type="submit"
                    className={`app-auth-submit-button ${disabled ? 'loading' : ''}`}
                    disabled={disabled}
                  >
                    {disabled ? (
                      <>
                        <span className="app-spinner"></span>
                        Authorizing...
                      </>
                    ) : (
                      'Authorize'
                    )}
                  </button>
                )}
                renderTerms={() => (
                  <p className="app-auth-terms">
                    By registering with storacha.network, you agree to the{' '}
                    <a href="https://docs.storacha.network/terms/" target="_blank" rel="noopener noreferrer">
                      Terms of Service
                    </a>.
                  </p>
                )}
              />
            </div>
          )}
          renderSubmitted={() => (
            <div className="app-auth-container">
              <StorachaAuth.Submitted 
                renderContainer={(children) => (
                  <div className="app-auth-form-wrapper">
                    {children}
                  </div>
                )}
                renderLogo={() => (
                  <div className="app-auth-logo-container">
                    <div className="app-auth-logo-placeholder">S</div>
                    <h1 className="app-auth-title">Storacha</h1>
                  </div>
                )}
                renderTitle={() => (
                  <h2 className="app-auth-submitted-title">Verify your email address!</h2>
                )}
                renderMessage={(email) => (
                  <p className="app-auth-submitted-message">
                    Click the link in the email we sent to{' '}
                    <span className="app-auth-submitted-email">{email}</span> to authorize this agent.
                    <br />
                    Don&apos;t forget to check your spam folder!
                  </p>
                )}
                renderCancelButton={() => (
                  <StorachaAuth.CancelButton className="app-auth-cancel-button">
                    Cancel
                  </StorachaAuth.CancelButton>
                )}
              />
            </div>
          )}
        >
          <SpaceEnsurer>
            <SpacePicker>
              <SpaceManagementApp />
            </SpacePicker>
          </SpaceEnsurer>
        </StorachaAuth.Ensurer>
      </StorachaAuth>
    </Provider>
  )
}

export default App
