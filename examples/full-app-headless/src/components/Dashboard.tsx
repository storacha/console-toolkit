import React, { useState } from 'react'
import type { UnknownLink } from '@storacha/ui-core'
import {
  useW3,
  SpacePicker,
  SpaceCreator,
  SpaceList,
  FileViewer,
  SharingTool,
  UploadTool,
  PlanGate,
  ImportSpace,
  useSpacePickerContext,
} from '@storacha/console-toolkit-react'
import { SpaceCreatorNameField, SpaceCreatorAccessTypeField } from './SpaceCreatorFields.js'
import { SharingView } from './SharingView.js'
import { UploadView } from './UploadViews.js'
import { ImportSpaceView } from './ImportSpaceView.js'
import { RemoveFileButton } from './RemoveFileButton.js'
import { SettingsView } from './SettingsViews.js'
import { ChangePlanView } from './ChangePlanViews.js'

export function Dashboard() {
  const [{ accounts, client }, { logout }] = useW3()
  const [{ selectedSpace }, { setSelectedSpace }] = useSpacePickerContext()
  const [viewMode, setViewMode] = useState<'picker' | 'list' | 'viewer' | 'sharing' | 'creator' | 'upload' | 'import' | 'settings' | 'change-plan'>('picker')
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

  const goHome = () => {
    setViewMode('picker')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-header-content">
          <div className="app-title-heading">
            <h1 className="app-title-wrap">
              <button
                type="button"
                className="app-title app-title-link"
                onClick={goHome}
                title="Go to spaces (home)"
              >
                Storage Dashboard
              </button>
            </h1>
            <p className="app-title-tagline">Store, manage, and share your files on a decentralized network.</p>
          </div>
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
        <button
          onClick={() => setViewMode('import')}
          className={`app-nav-button ${viewMode === 'import' ? 'active' : ''}`}
        >
          <span>⬇️</span> Import
        </button>
        <button 
          onClick={() => setViewMode('settings')}
          className={`app-nav-button ${viewMode === 'settings' || viewMode === 'change-plan' ? 'active' : ''}`}
        >
          <span>⚙️</span> Settings
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
                renderItem={(space) => (
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
            <PlanGate>
              <PlanGate.Fallback
                renderFallback={({ planStatus, error, selectPlan, refreshPlan }) => (
                  <div className="app-plan-gate-fallback">
                    {planStatus === 'loading' && (
                      <div className="app-loading-state">
                        <span className="app-spinner"></span>
                        <p>Checking your plan status...</p>
                      </div>
                    )}
                    {planStatus === 'missing' && (
                      <div className="app-plans-container">
                        <div className="app-plans-header">
                          <h2 className="app-plans-title">Plans</h2>
                          <p className="app-plans-description">
                            Pick the price plan that works for you.
                            <br />
                            <strong>Starter</strong> is free for up to 5GiB.
                            <br />
                            <strong>Lite</strong> and <strong>Business</strong> plans unlock lower cost per GiB.
                          </p>
                        </div>
                        <div className="app-plans-grid">
                          <div className="app-plan-card">
                            <div className="app-plan-header">
                              <h3 className="app-plan-name">Starter</h3>
                              <div className="app-plan-peppers">🌶️</div>
                            </div>
                            <div className="app-plan-price">$0/mo</div>
                            <div className="app-plan-features">
                              <div className="app-plan-feature">
                                <strong>5GB Storage</strong>
                                <span>Additional at $0.15/GB per month</span>
                              </div>
                              <div className="app-plan-feature">
                                <strong>5GB Egress</strong>
                                <span>Additional at $0.15/GB per month</span>
                              </div>
                            </div>
                            <button
                              className="app-plan-button"
                              onClick={() => selectPlan('did:web:starter.storacha.network')}
                            >
                              Start Storing
                            </button>
                          </div>
                          <div className="app-plan-card">
                            <div className="app-plan-header">
                              <h3 className="app-plan-name">Lite</h3>
                              <div className="app-plan-peppers">🌶️🌶️</div>
                            </div>
                            <div className="app-plan-price">$10/mo</div>
                            <div className="app-plan-features">
                              <div className="app-plan-feature">
                                <strong>100GB Storage</strong>
                                <span>Additional at $0.05/GB per month</span>
                              </div>
                              <div className="app-plan-feature">
                                <strong>100GB Egress</strong>
                                <span>Additional at $0.05/GB per month</span>
                              </div>
                            </div>
                            <button
                              className="app-plan-button"
                              onClick={() => selectPlan('did:web:lite.storacha.network')}
                            >
                              Start Storing
                            </button>
                          </div>
                          <div className="app-plan-card">
                            <div className="app-plan-header">
                              <h3 className="app-plan-name">Business</h3>
                              <div className="app-plan-peppers">🌶️🌶️🌶️</div>
                            </div>
                            <div className="app-plan-price">$100/mo</div>
                            <div className="app-plan-features">
                              <div className="app-plan-feature">
                                <strong>2TB Storage</strong>
                                <span>Additional at $0.03/GB per month</span>
                              </div>
                              <div className="app-plan-feature">
                                <strong>2TB Egress</strong>
                                <span>Additional at $0.03/GB per month</span>
                              </div>
                            </div>
                            <button
                              className="app-plan-button"
                              onClick={() => selectPlan('did:web:business.storacha.network')}
                            >
                              Start Storing
                            </button>
                          </div>
                        </div>
                        <button className="app-back-button" onClick={refreshPlan} style={{ marginTop: '20px' }}>
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
            <SharingTool space={selectedSpace as any}>
              <SharingView
                space={selectedSpace}
                revokingEmails={revokingEmails}
                setRevokingEmails={setRevokingEmails}
              />
            </SharingTool>
          )
        }

        {
          viewMode === 'import' && (
            <ImportSpace
              onImport={(space) => {
                setSelectedSpace(space as any)
                setViewMode('list')
              }}
            >
              <ImportSpaceView
                onImport={(space) => {
                  setSelectedSpace(space as any)
                  setViewMode('list')
                }}
              />
            </ImportSpace>
          )
        }

        {viewMode === 'settings' && (
          <SettingsView onNavigateToChangePlan={() => setViewMode('change-plan')} />
        )}

        {viewMode === 'change-plan' && (
          <ChangePlanView onBack={() => setViewMode('settings')} />
        )}
      </main >
    </div >
  )
}
