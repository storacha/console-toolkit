import React, { useState, useCallback } from 'react'
import { Provider, useW3, StorachaAuth } from '@storacha/console-toolkit-react'
import {
  SpacePicker,
  SpaceCreator,
  SpaceList,
  FileViewer,
  SharingTool,
  UploadTool,
  PlanGate,
  useSpacePickerContext,
  useSharingToolContext,
  useSpaceCreatorContext,
  useUploadToolContext,
  useFileViewerContext,
  usePlanGateContext,
  UploadStatus,
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
  const [{ accounts, client }, { logout }] = useW3()
  const [{ selectedSpace }, { setSelectedSpace }] = useSpacePickerContext()
  const [viewMode, setViewMode] = useState<'picker' | 'list' | 'viewer' | 'sharing' | 'creator' | 'upload'>('picker')
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
              onClick={() => setViewMode('upload')}
              className={`app-nav-button ${viewMode === 'upload' ? 'active' : ''}`}
            >
              <span>📤</span> Upload
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`app-nav-button ${viewMode === 'list' ? 'active' : ''}`}
            >
              <span>📋</span> View Uploads
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
                    key={space.did()}
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
          <div className="app-section app-section-creator">
            <div className="app-section-header">
              <h2>Create a New Space</h2>
              <p className="app-section-description">A space is a decentralized bucket for storing your files</p>
            </div>
            <PlanGate billingUrl="https://console.storacha.network/plans">
              <PlanGate.Fallback
                renderFallback={({ planStatus, error, openBillingPage, refreshPlan }) => (
                  <div className="app-plan-gate-fallback">
                    {planStatus === 'loading' && (
                      <div className="app-loading-state">
                        <span className="app-spinner"></span>
                        <p>Checking your plan status...</p>
                      </div>
                    )}
                    {planStatus === 'missing' && (
                      <div className="app-empty-state">
                        <div className="app-empty-icon">📋</div>
                        <p className="app-empty-title">Billing Plan Required</p>
                        <p className="app-empty-description">
                          To create a space, you need to select a billing plan.<br />
                          Don't worry—there's a <strong>free Starter plan</strong> available!<br />
                          <span style={{ fontSize: '0.9em', opacity: 0.8 }}>(Card verification required)</span>
                        </p>
                        <button className="app-empty-action" onClick={openBillingPage}>
                          Select Free Plan →
                        </button>
                        <button className="app-back-button" onClick={refreshPlan} style={{ marginTop: '10px' }}>
                          I've selected a plan, refresh
                        </button>
                      </div>
                    )}
                    {planStatus === 'error' && (
                      <div className="app-empty-state">
                        <div className="app-empty-icon">⚠️</div>
                        <p className="app-empty-title">Error</p>
                        <p className="app-empty-description">{error || 'Failed to check plan status.'}</p>
                        <button className="app-empty-action" onClick={refreshPlan}>
                          Try Again
                        </button>
                      </div>
                    )}
                  </div>
                )}
              />
              <PlanGate.Gate>
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
              </PlanGate.Gate>
            </PlanGate>
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
              <button
                onClick={() => setViewMode('upload')}
                className="app-upload-file-button"
              >
                <span>📤</span> Upload a file
              </button>
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
        )
        }

        {
          viewMode === 'viewer' && selectedSpace && selectedRoot && (
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
                    <RemoveFileButton
                      onRemove={() => {
                        setViewMode('list')
                        setSelectedRoot(undefined)
                      }}
                    />
                  </div>
                </div>
              </FileViewer>
            </div>
          )
        }

        {
          viewMode === 'upload' && selectedSpace && (
            <UploadView space={selectedSpace} />
          )
        }

        {
          viewMode === 'sharing' && selectedSpace && (
            <SharingTool space={selectedSpace}>
              <SharingView
                space={selectedSpace}
                revokingEmails={revokingEmails}
                setRevokingEmails={setRevokingEmails}
              />
            </SharingTool>
          )
        }
      </main >
    </div >
  )
}

function UploadView({ space }: { space: Space }) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    // Files will be handled by UploadTool.Input
  }, [])

  const getUploadPrompt = () => {
    return 'Drag File or Click to Browse' // Will be updated based on uploadType in component
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const isPrivateSpace = space?.access?.type === 'private'

  return (
    <div className="app-section">
      <div className="app-section-header">
        <div className="app-space-header">
          <div>
            <h2>Upload to {space.name || 'Untitled Space'}</h2>
            <p className="app-space-did">{space.did()}</p>
          </div>
          <span className={`app-space-badge ${isPrivateSpace ? 'private' : 'public'}`}>
            {isPrivateSpace ? '🔒 Private' : '🌐 Public'}
          </span>
        </div>
      </div>

      <UploadTool space={space}>
        <UploadViewContent
          isDragging={isDragging}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          formatFileSize={formatFileSize}
        />
      </UploadTool>
    </div>
  )
}

function UploadViewContent({
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  formatFileSize
}: {
  isDragging: boolean
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  formatFileSize: (bytes: number) => string
}) {
  const [{ uploadType, file, files, status, wrapInDirectory, isPrivateSpace }, { setUploadType, setFiles, setWrapInDirectory, reset }] = useUploadToolContext()

  const handleDropWithFiles = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    onDrop(e)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles([...e.dataTransfer.files])
    }
  }, [onDrop, setFiles])

  const getUploadPrompt = () => {
    switch (uploadType) {
      case 'file':
        return 'Drag File or Click to Browse'
      case 'directory':
        return 'Drag Directory or Click to Browse'
      case 'car':
        return 'Drag CAR or Click to Browse'
      default:
        return 'Drag File or Click to Browse'
    }
  }

  return (
    <UploadTool.Form
      renderContainer={(children) => (
        <div className="app-upload-form-container">
          {children}
        </div>
      )}
    >
      {!isPrivateSpace && (
        <div className="app-upload-type-selector">
          <h3 className="app-upload-section-title">Type</h3>
          <UploadTool.TypeSelector
            renderOption={(type, checked, onChange) => (
              <label key={type} className={`app-upload-type-option ${checked ? 'selected' : ''}`}>
                <input
                  type="radio"
                  checked={checked}
                  onChange={onChange}
                  className="app-radio-input"
                />
                <span className="app-upload-type-label">
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </span>
              </label>
            )}
          />
        </div>
      )}

      <div
        className={`app-upload-dropzone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={handleDropWithFiles}
      >
        {!file && (
          <>
            <div className="app-upload-dropzone-icon">📁</div>
            <UploadTool.Input
              className="app-upload-input"
              allowDirectory={uploadType === 'directory'}
            />
            <p className="app-upload-dropzone-text">{getUploadPrompt()}</p>
          </>
        )}
        <UploadTool.Status
          renderIdle={(file, files) => {
            if (!file) return null
            return (
              <div className="app-upload-file-preview">
                <div className="app-upload-file-info">
                  <div className="app-upload-file-icon">📄</div>
                  <div className="app-upload-file-details">
                    <div className="app-upload-file-name">{file.name}</div>
                    <div className="app-upload-file-size">{formatFileSize(file.size)}</div>
                  </div>
                </div>
                <button
                  type="submit"
                  className="app-upload-submit-button"
                  disabled={!file}
                >
                  <span>☁️</span> Start Upload
                </button>
              </div>
            )
          }}
          renderUploading={(file, progress, shards) => (
            <div className="app-upload-progress-container">
              <h3 className="app-upload-progress-title">Uploading {file?.name}</h3>
              <UploadTool.Progress
                renderProgress={(progress, shards) => (
                  <div className="app-upload-progress">
                    {Object.values(progress).map((p, index) => {
                      const { total, loaded, lengthComputable } = p
                      const percent = lengthComputable && total > 0 ? Math.floor((loaded / total) * 100) : 0
                      return (
                        <div key={index} className="app-upload-progress-bar-container">
                          <div className="app-upload-progress-bar">
                            <div
                              className="app-upload-progress-bar-fill"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          {lengthComputable && (
                            <div className="app-upload-progress-text">{percent}%</div>
                          )}
                        </div>
                      )
                    })}
                    {shards.map((shard, index) => (
                      <div key={index} className="app-upload-shard-info">
                        Shard {shard.cid.toString()} ({formatFileSize(shard.size)}) uploaded
                      </div>
                    ))}
                  </div>
                )}
              />
            </div>
          )}
          renderSucceeded={(dataCID, file) => (
            <div className="app-upload-success">
              <h3 className="app-upload-success-title">✅ Uploaded Successfully!</h3>
              {dataCID && (
                <div className="app-upload-success-cid">
                  <label className="app-upload-success-label">Root CID:</label>
                  <code className="app-upload-success-code">{dataCID.toString()}</code>
                </div>
              )}
              <button
                className="app-upload-another-button"
                onClick={() => {
                  reset()
                }}
              >
                <span>➕</span> Upload Another
              </button>
            </div>
          )}
          renderFailed={(error) => (
            <div className="app-upload-error">
              <h3 className="app-upload-error-title">⚠️ Upload Failed</h3>
              <p className="app-upload-error-message">{error?.message || 'Unknown error occurred'}</p>
              <button
                className="app-upload-retry-button"
                onClick={() => {
                  reset()
                }}
              >
                Try Again
              </button>
            </div>
          )}
        />
      </div>

      {!isPrivateSpace && uploadType === 'file' && (
        <div className="app-upload-options">
          <h3 className="app-upload-section-title">Options</h3>
          <label className="app-upload-wrap-option">
            <UploadTool.WrapCheckbox />
            <span className="app-upload-wrap-label">Wrap In Directory</span>
          </label>
        </div>
      )}
    </UploadTool.Form>
  )
}

function RemoveFileButton({ onRemove }: { onRemove: () => void }) {
  const [{ root, upload, isLoading }, { remove }] = useFileViewerContext()
  const [showConfirm, setShowConfirm] = useState(false)
  const [removing, setRemoving] = useState(false)

  const handleRemoveClick = useCallback(() => {
    setShowConfirm(true)
  }, [])

  const handleConfirmRemove = useCallback(async () => {
    if (!root) return

    try {
      setRemoving(true)
      await remove({ shards: true })
      setShowConfirm(false)
      onRemove()
    } catch (err) {
      console.error('Failed to remove file:', err)
      alert('Failed to remove file. Please try again.')
    } finally {
      setRemoving(false)
    }
  }, [root, remove, onRemove])

  const handleCancel = useCallback(() => {
    setShowConfirm(false)
  }, [])

  if (showConfirm) {
    const shards = upload?.shards || []

    return (
      <div className="app-remove-confirm-overlay">
        <div className="app-remove-confirm-dialog">
          <h3 className="app-remove-confirm-title">Confirm remove</h3>
          <p className="app-remove-confirm-message">
            Are you sure you want to remove <code className="app-remove-confirm-cid">{root?.toString()}</code>?
          </p>

          {shards.length > 0 && (
            <div className="app-remove-confirm-shards">
              <p className="app-remove-confirm-shards-title">The following shards will be removed:</p>
              <div className="app-remove-confirm-shards-list">
                <div className="app-remove-confirm-shard-item">
                  <span className="app-remove-confirm-shard-label">ROOT CID</span>
                  <code className="app-remove-confirm-shard-cid">{root?.toString()}</code>
                </div>
                {shards.map((shard, index) => (
                  <div key={shard.toString()} className="app-remove-confirm-shard-item">
                    <span className="app-remove-confirm-shard-label">Shard {index + 1}</span>
                    <code className="app-remove-confirm-shard-cid">{shard.toString()}</code>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="app-remove-confirm-warning">
            Any uploads using the same shards as those listed above will be corrupted. This cannot be undone.
          </p>

          <div className="app-remove-confirm-actions">
            <button
              className="app-remove-confirm-cancel-button"
              onClick={handleCancel}
              disabled={removing}
            >
              Cancel
            </button>
            <button
              className="app-remove-confirm-remove-button"
              onClick={handleConfirmRemove}
              disabled={removing}
            >
              {removing ? (
                <>
                  <span className="app-spinner"></span>
                  Removing...
                </>
              ) : (
                'Remove'
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <FileViewer.RemoveButton
      removeShards={true}
      renderButton={(onClick, loading) => (
        <button
          className={`app-danger-button ${loading ? 'loading' : ''}`}
          onClick={handleRemoveClick}
          disabled={loading || isLoading}
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
      onRemove={onRemove}
    />
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
          <SpacePicker>
            <SpaceManagementApp />
          </SpacePicker>
        </StorachaAuth.Ensurer>
      </StorachaAuth>
    </Provider>
  )
}

export default App
