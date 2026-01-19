import { useState, useCallback } from 'react'
import type { Space, UnknownLink } from '@storacha/ui-core'
import {
  SpacePicker,
  SpaceCreator,
  SpaceList,
  FileViewer,
  SharingTool,
  UploadTool,
  PlanGate,
  useSpacePickerContext,
  useSpaceCreatorContext,
  useSharingToolContext,
  useFileViewerContext,
  useUploadToolContext,
  usePlanGateContext,
} from '@storacha/console-toolkit-react'

type ViewMode = 'picker' | 'creator' | 'upload' | 'list' | 'viewer' | 'sharing'

const DEFAULT_GATEWAY_HOST = 'https://w3s.link'
const DEFAULT_GATEWAY_DID = 'did:web:w3s.link'
const DEFAULT_PROVIDER_DID = 'did:web:web3.storage'

export function Web3MailSpaces() {
  const [{ selectedSpace }, { setSelectedSpace }] = useSpacePickerContext()
  const [viewMode, setViewMode] = useState<ViewMode>('picker')
  const [selectedRoot, setSelectedRoot] = useState<UnknownLink | undefined>()

  return (
    <div className="w3m-app-container">

      <nav className="w3m-nav">
        <button
          onClick={() => setViewMode('picker')}
          className={`w3m-nav-btn ${viewMode === 'picker' ? 'active' : ''}`}
        >
          📁 Spaces
        </button>
        <button
          onClick={() => setViewMode('creator')}
          className={`w3m-nav-btn ${viewMode === 'creator' ? 'active' : ''}`}
        >
          ➕ Create Space
        </button>
        {selectedSpace && (
          <>
            <button
              onClick={() => setViewMode('upload')}
              className={`w3m-nav-btn ${viewMode === 'upload' ? 'active' : ''}`}
            >
              📤 Upload
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`w3m-nav-btn ${viewMode === 'list' ? 'active' : ''}`}
            >
              📋 View Uploads
            </button>
            <button
              onClick={() => setViewMode('sharing')}
              className={`w3m-nav-btn ${viewMode === 'sharing' ? 'active' : ''}`}
            >
              🔗 Share
            </button>
          </>
        )}
      </nav>

      <main className="w3m-main">
        {viewMode === 'picker' && (
          <SpacePickerView
            onSpaceSelect={(space) => {
              setSelectedSpace(space)
              setViewMode('list')
            }}
            onCreateClick={() => setViewMode('creator')}
          />
        )}

        {viewMode === 'creator' && (
          <SpaceCreatorView
            onSpaceCreated={(space) => {
              setSelectedSpace(space)
              setViewMode('list')
            }}
          />
        )}

        {viewMode === 'upload' && selectedSpace && (
          <UploadView space={selectedSpace} />
        )}

        {viewMode === 'list' && selectedSpace && (
          <UploadsListView
            space={selectedSpace}
            onUploadClick={() => setViewMode('upload')}
            onSelectRoot={(root) => {
              setSelectedRoot(root)
              setViewMode('viewer')
            }}
          />
        )}

        {viewMode === 'viewer' && selectedSpace && selectedRoot && (
          <FileViewerView
            space={selectedSpace}
            root={selectedRoot}
            onBack={() => {
              setSelectedRoot(undefined)
              setViewMode('list')
            }}
          />
        )}

        {viewMode === 'sharing' && selectedSpace && (
          <SharingView space={selectedSpace} />
        )}
      </main>
    </div>
  )
}

function SpacePickerView({
  onSpaceSelect,
  onCreateClick,
}: {
  onSpaceSelect: (space: Space) => void
  onCreateClick: () => void
}) {
  return (
    <div className="w3m-section">
      <div className="w3m-section-header">
        <h2>Select a Space</h2>
        <p className="w3m-section-desc">Choose a space to view its contents or manage sharing</p>
      </div>
      <div className="w3m-search-container">
        <SpacePicker.Search className="w3m-search-input" placeholder="Search spaces by name or DID..." />
      </div>
      <div className="w3m-spaces-list">
        <SpacePicker.List
          type="all"
          renderItem={(space: Space) => (
            <div
              key={space.did()}
              className="w3m-space-item"
              onClick={() => onSpaceSelect(space)}
            >
              <div className="w3m-space-icon">
                {space.name?.[0]?.toUpperCase() || 'S'}
              </div>
              <div className="w3m-space-content">
                <div className="w3m-space-header">
                  <span className="w3m-space-name">{space.name || 'Untitled Space'}</span>
                  <span className={`w3m-badge ${space.access?.type === 'private' ? 'private' : 'public'}`}>
                    {space.access?.type === 'private' ? '🔒 Private' : '🌐 Public'}
                  </span>
                </div>
                <div className="w3m-space-did">{space.did()}</div>
              </div>
              <div className="w3m-space-arrow">→</div>
            </div>
          )}
          renderEmpty={() => (
            <div className="w3m-empty-state">
              <div className="w3m-empty-icon">📦</div>
              <p className="w3m-empty-title">No spaces yet</p>
              <p className="w3m-empty-desc">Create your first space to get started</p>
              <button className="w3m-primary-btn" onClick={onCreateClick}>
                Create Space
              </button>
            </div>
          )}
          onSpaceClick={onSpaceSelect}
        />
      </div>
    </div>
  )
}

function SpaceCreatorView({ onSpaceCreated }: { onSpaceCreated: (space: Space) => void }) {
  return (
    <div className="w3m-section w3m-section-creator">
      <div className="w3m-section-header">
        <h2>Create a New Space</h2>
        <p className="w3m-section-desc">A space is a decentralized bucket for storing your files</p>
      </div>
      <PlanGate>
        <PlanGate.Fallback
          renderFallback={({ planStatus, error, selectPlan, refreshPlan }) => (
            <div className="w3m-plan-gate-fallback">
              {planStatus === 'loading' && (
                <div className="w3m-loading-state">
                  <span className="w3m-spinner"></span>
                  <p>Checking your plan status...</p>
                </div>
              )}
              {planStatus === 'missing' && (
                <div className="w3m-plans-container">
                  <div className="w3m-plans-header">
                    <h2 className="w3m-plans-title">Plans</h2>
                    <p className="w3m-plans-description">
                      Pick the price plan that works for you.
                      <br />
                      <strong>Starter</strong> is free for up to 5GiB.
                      <br />
                      <strong>Lite</strong> and <strong>Business</strong> plans unlock lower cost per GiB.
                    </p>
                  </div>
                  <div className="w3m-plans-grid">
                    <div className="w3m-plan-card">
                      <div className="w3m-plan-header">
                        <h3 className="w3m-plan-name">Starter</h3>
                        <div className="w3m-plan-peppers">🌶️</div>
                      </div>
                      <div className="w3m-plan-price">$0/mo</div>
                      <div className="w3m-plan-features">
                        <div className="w3m-plan-feature">
                          <div className="w3m-plan-feature-main">
                            <strong>5GB Storage</strong>
                          </div>
                          <div className="w3m-plan-feature-sub">Additional at $0.15/GB per month</div>
                        </div>
                        <div className="w3m-plan-feature">
                          <div className="w3m-plan-feature-main">
                            <strong>5GB Egress</strong>
                          </div>
                          <div className="w3m-plan-feature-sub">Additional at $0.15/GB per month</div>
                        </div>
                      </div>
                      <button
                        className="w3m-plan-button"
                        type="button"
                        onClick={() => selectPlan('did:web:starter.storacha.network')}
                      >
                        START STORING
                      </button>
                    </div>
                    <div className="w3m-plan-card">
                      <div className="w3m-plan-header">
                        <h3 className="w3m-plan-name">Lite</h3>
                        <div className="w3m-plan-peppers">🌶️🌶️</div>
                      </div>
                      <div className="w3m-plan-price">$10/mo</div>
                      <div className="w3m-plan-features">
                        <div className="w3m-plan-feature">
                          <div className="w3m-plan-feature-main">
                            <strong>100GB Storage</strong>
                          </div>
                          <div className="w3m-plan-feature-sub">Additional at $0.05/GB per month</div>
                        </div>
                        <div className="w3m-plan-feature">
                          <div className="w3m-plan-feature-main">
                            <strong>100GB Egress</strong>
                          </div>
                          <div className="w3m-plan-feature-sub">Additional at $0.05/GB per month</div>
                        </div>
                      </div>
                      <button
                        className="w3m-plan-button"
                        type="button"
                        onClick={() => selectPlan('did:web:lite.storacha.network')}
                      >
                        START STORING
                      </button>
                    </div>
                    <div className="w3m-plan-card">
                      <div className="w3m-plan-header">
                        <h3 className="w3m-plan-name">Business</h3>
                        <div className="w3m-plan-peppers">🌶️🌶️🌶️</div>
                      </div>
                      <div className="w3m-plan-price">$100/mo</div>
                      <div className="w3m-plan-features">
                        <div className="w3m-plan-feature">
                          <div className="w3m-plan-feature-main">
                            <strong>2TB Storage</strong>
                          </div>
                          <div className="w3m-plan-feature-sub">Additional at $0.03/GB per month</div>
                        </div>
                        <div className="w3m-plan-feature">
                          <div className="w3m-plan-feature-main">
                            <strong>2TB Egress</strong>
                          </div>
                          <div className="w3m-plan-feature-sub">Additional at $0.03/GB per month</div>
                        </div>
                      </div>
                      <button
                        className="w3m-plan-button"
                        type="button"
                        onClick={() => selectPlan('did:web:business.storacha.network')}
                      >
                        START STORING
                      </button>
                    </div>
                  </div>
                  <button className="w3m-secondary-btn" type="button" onClick={refreshPlan} style={{ marginTop: '20px' }}>
                    I've selected a plan, refresh
                  </button>
                </div>
              )}
              {planStatus === 'error' && (
                <div className="w3m-empty-state">
                  <div className="w3m-empty-icon">⚠️</div>
                  <p className="w3m-empty-title">Error</p>
                  <p className="w3m-empty-desc">{error || 'Failed to check plan status.'}</p>
                  <button className="w3m-primary-btn" type="button" onClick={refreshPlan}>
                    Try Again
                  </button>
                </div>
              )}
            </div>
          )}
        />
        <PlanGate.Gate>
          <SpaceCreatorWithPlanErrorHandling onSpaceCreated={onSpaceCreated} />
        </PlanGate.Gate>
      </PlanGate>
    </div>
  )
}

function SpaceCreatorWithPlanErrorHandling({ onSpaceCreated }: { onSpaceCreated: (space: Space) => void }) {
  const [, { refreshPlan }] = usePlanGateContext()

  return (
    <SpaceCreator
      gatewayHost={DEFAULT_GATEWAY_HOST}
      gatewayDID={DEFAULT_GATEWAY_DID}
      providerDID={DEFAULT_PROVIDER_DID}
      onSpaceCreated={onSpaceCreated}
      onError={(error) => {
        console.error('Space creation error:', error)
        const errorMessage = (error as any)?.cause?.message || error.message
        // Check if this is a plan-related error
        const isPlanError =
          (error as any)?.isAccountPlanMissing ||
          errorMessage?.includes('AccountPlanMissing') ||
          errorMessage?.includes('payment plan') ||
          errorMessage?.includes('plan selection') ||
          errorMessage?.includes('billing plan') ||
          (errorMessage?.includes('provisioning') && errorMessage?.includes('plan'))

        if (isPlanError) {
          // Refresh plan status to show the plan selection UI
          refreshPlan().catch((err) => {
            console.error('Failed to refresh plan status:', err)
          })
        } else {
          alert(`Failed to create space: ${errorMessage}`)
        }
      }}
    >
      <SpaceCreator.Form
        renderContainer={(children) => <div className="w3m-creator-form">{children}</div>}
        renderNameInput={() => <SpaceCreatorNameField />}
        renderAccessTypeSelector={() => <SpaceCreatorAccessField />}
        renderSubmitButton={(disabled) => (
          <button type="submit" className={`w3m-primary-btn ${disabled ? 'loading' : ''}`} disabled={disabled}>
            {disabled ? '⏳ Creating Space...' : '➕ Create Space'}
          </button>
        )}
      />
    </SpaceCreator>
  )
}

function SpaceCreatorNameField() {
  return (
    <div className="w3m-form-field">
      <label className="w3m-form-label">Space Name</label>
      <SpaceCreator.NameInput
        className="w3m-form-input"
        placeholder="Enter a memorable name for your space"
        required
      />
      <p className="w3m-form-hint">This is a memorable alias. The true name is a unique DID.</p>
    </div>
  )
}

function SpaceCreatorAccessField() {
  const [{ accessType }, { setAccessType }] = useSpaceCreatorContext()

  return (
    <div className="w3m-form-field">
      <label className="w3m-form-label">Access Type</label>
      <div className="w3m-access-options">
        <label className={`w3m-access-option ${accessType === 'public' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="accessType"
            value="public"
            checked={accessType === 'public'}
            onChange={() => setAccessType('public')}
          />
          <div className="w3m-access-content">
            <span className="w3m-access-title">🌐 Public Space</span>
            <p className="w3m-access-desc">Files stored unencrypted and accessible via IPFS</p>
          </div>
        </label>
        <label className={`w3m-access-option ${accessType === 'private' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="accessType"
            value="private"
            checked={accessType === 'private'}
            onChange={() => setAccessType('private')}
          />
          <div className="w3m-access-content">
            <span className="w3m-access-title">🔒 Private Space</span>
            <p className="w3m-access-desc">Files encrypted locally before upload</p>
          </div>
        </label>
      </div>
    </div>
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
  }, [])

  const isPrivateSpace = space?.access?.type === 'private'

  return (
    <div className="w3m-section">
      <div className="w3m-section-header">
        <div className="w3m-space-title-row">
          <div>
            <h2>Upload to {space.name || 'Untitled Space'}</h2>
            <p className="w3m-space-did">{space.did()}</p>
          </div>
          <span className={`w3m-badge ${isPrivateSpace ? 'private' : 'public'}`}>
            {isPrivateSpace ? '🔒 Private' : '🌐 Public'}
          </span>
        </div>
      </div>

      <UploadTool key={space.did()} space={space}>
        <UploadViewContent
          isDragging={isDragging}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
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
}: {
  isDragging: boolean
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
}) {
  const [{ uploadType, file, isPrivateSpace }, { setFiles, reset }] = useUploadToolContext()

  const handleDropWithFiles = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      onDrop(e)
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        setFiles([...e.dataTransfer.files])
      }
    },
    [onDrop, setFiles]
  )

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const getUploadPrompt = () => {
    switch (uploadType) {
      case 'file': return 'Drag File or Click to Browse'
      case 'directory': return 'Drag Directory or Click to Browse'
      case 'car': return 'Drag CAR or Click to Browse'
      default: return 'Drag File or Click to Browse'
    }
  }

  return (
    <UploadTool.Form
      renderContainer={(children) => <div className="w3m-upload-form">{children}</div>}
    >
      {!isPrivateSpace && (
        <div className="w3m-form-field">
          <label className="w3m-form-label">Type</label>
          <UploadTool.TypeSelector
            renderOption={(type, checked, onChange) => (
              <label key={type} className={`w3m-type-option ${checked ? 'selected' : ''}`}>
                <input type="radio" checked={checked} onChange={onChange} />
                <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
              </label>
            )}
          />
        </div>
      )}

      <div
        className={`w3m-dropzone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={handleDropWithFiles}
      >
        <UploadTool.Status
          renderIdle={(idleFile) => {
            if (!idleFile) {
              return (
                <div className="w3m-dropzone-inner">
                  <div className="w3m-dropzone-icon">📁</div>
                  <UploadTool.Input className="w3m-upload-input" allowDirectory={uploadType === 'directory'} />
                  <p className="w3m-dropzone-text">{getUploadPrompt()}</p>
                </div>
              )
            }
            return (
              <div className="w3m-file-preview">
                <div className="w3m-file-info">
                  <div className="w3m-file-icon">📄</div>
                  <div>
                    <div className="w3m-file-name">{idleFile.name}</div>
                    <div className="w3m-file-size">{formatFileSize(idleFile.size)}</div>
                  </div>
                </div>
                <button type="submit" className="w3m-primary-btn">
                  ☁️ Start Upload
                </button>
              </div>
            )
          }}
          renderUploading={(uploadingFile) => (
            <div className="w3m-upload-progress">
              <h4>Uploading {uploadingFile?.name || 'file'}...</h4>
              <UploadTool.Progress
                renderProgress={(prog) => (
                  <div className="w3m-progress-bars">
                    {Object.values(prog).map((p, index) => {
                      const { total, loaded, lengthComputable } = p
                      const percent = lengthComputable && total > 0 ? Math.floor((loaded / total) * 100) : 0
                      return (
                        <div key={index} className="w3m-progress-bar-row">
                          <div className="w3m-progress-bar">
                            <div className="w3m-progress-fill" style={{ width: `${percent}%` }} />
                          </div>
                          {lengthComputable && <span className="w3m-progress-text">{percent}%</span>}
                        </div>
                      )
                    })}
                  </div>
                )}
              />
            </div>
          )}
          renderSucceeded={(successCID) => (
            <div className="w3m-upload-success">
              <h4>✅ Upload Complete!</h4>
              {successCID && (
                <div className="w3m-success-cid">
                  <label>Root CID:</label>
                  <code>{successCID.toString()}</code>
                </div>
              )}
              <button type="button" className="w3m-secondary-btn" onClick={() => reset()}>
                ➕ Upload Another
              </button>
            </div>
          )}
          renderFailed={(error) => (
            <div className="w3m-upload-error">
              <h4>⚠️ Upload Failed</h4>
              <p>{error?.message || 'Unknown error occurred'}</p>
              <button type="button" className="w3m-secondary-btn" onClick={() => reset()}>
                Try Again
              </button>
            </div>
          )}
        />
      </div>

      {!isPrivateSpace && uploadType === 'file' && (
        <div className="w3m-form-field">
          <label className="w3m-wrap-option">
            <UploadTool.WrapCheckbox />
            <span>Wrap In Directory</span>
          </label>
        </div>
      )}
    </UploadTool.Form>
  )
}

function UploadsListView({
  space,
  onUploadClick,
  onSelectRoot,
}: {
  space: Space
  onUploadClick: () => void
  onSelectRoot: (root: UnknownLink) => void
}) {
  const isPrivateSpace = space.access?.type === 'private'

  return (
    <div className="w3m-section">
      <div className="w3m-section-header">
        <div className="w3m-space-title-row">
          <div>
            <h2>{space.name || 'Untitled Space'}</h2>
            <p className="w3m-space-did">{space.did()}</p>
          </div>
          <span className={`w3m-badge ${isPrivateSpace ? 'private' : 'public'}`}>
            {isPrivateSpace ? '🔒 Private' : '🌐 Public'}
          </span>
        </div>
        <button onClick={onUploadClick} className="w3m-primary-btn">
          📤 Upload a file
        </button>
      </div>

      <SpaceList key={space.did()} space={space}>
        <SpaceList.List
          renderItem={(upload) => (
            <div
              key={upload.root.toString()}
              className="w3m-upload-item"
              onClick={() => onSelectRoot(upload.root)}
            >
              <div className="w3m-upload-icon">📄</div>
              <div className="w3m-upload-content">
                <div className="w3m-upload-cid">{upload.root.toString()}</div>
                <div className="w3m-upload-date">
                  {new Date(upload.updatedAt).toLocaleDateString()} at{' '}
                  {new Date(upload.updatedAt).toLocaleTimeString()}
                </div>
              </div>
              <div className="w3m-upload-arrow">→</div>
            </div>
          )}
          renderEmpty={() => (
            <div className="w3m-empty-state">
              <div className="w3m-empty-icon">📭</div>
              <p className="w3m-empty-title">No uploads found</p>
              <p className="w3m-empty-desc">This space is empty. Upload files to get started.</p>
            </div>
          )}
          renderLoading={() => (
            <div className="w3m-loading-state">
              <span className="w3m-spinner"></span>
              <p>Loading uploads...</p>
            </div>
          )}
          onItemClick={onSelectRoot}
        />
        <SpaceList.Pagination />
      </SpaceList>
    </div>
  )
}

function FileViewerView({
  space,
  root,
  onBack,
}: {
  space: Space
  root: UnknownLink
  onBack: () => void
}) {
  return (
    <div className="w3m-section">
      <div className="w3m-section-header">
        <button onClick={onBack} className="w3m-back-btn">← Back to Uploads</button>
        <h2>File Details</h2>
      </div>
      <FileViewer space={space} root={root}>
        <FileViewerContent onBack={onBack} />
      </FileViewer>
    </div>
  )
}

function FileViewerContent({ onBack }: { onBack: () => void }) {
  const [{ isLoading, error }, { remove }] = useFileViewerContext()
  const [removing, setRemoving] = useState(false)

  const handleRemove = async () => {
    if (!confirm('Are you sure you want to remove this file?')) return
    try {
      setRemoving(true)
      await remove({ shards: true })
      onBack()
    } catch (err) {
      console.error('Failed to remove:', err)
      alert('Failed to remove file')
    } finally {
      setRemoving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="w3m-loading-state">
        <span className="w3m-spinner"></span>
        <p>Loading file details...</p>
      </div>
    )
  }

  if (error) {
    return <div className="w3m-error-message">{error}</div>
  }

  return (
    <div className="w3m-file-viewer">
      <FileViewer.Root
        renderRoot={(r: UnknownLink) => (
          <div className="w3m-file-detail">
            <label>Root CID</label>
            <div className="w3m-file-value">
              <code>{r.toString()}</code>
              <button
                className="w3m-copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(r.toString())
                  alert('Copied!')
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
          <div className="w3m-file-detail">
            <label>Gateway URL</label>
            <div className="w3m-file-value">
              <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
              <button
                className="w3m-copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(url)
                  alert('Copied!')
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
          <div key={shard.toString()} className="w3m-file-detail">
            <label>Shard {index + 1}</label>
            <div className="w3m-file-value">
              <code>{shard.toString()}</code>
            </div>
          </div>
        )}
      />
      <div className="w3m-file-actions">
        <button className="w3m-danger-btn" onClick={handleRemove} disabled={removing}>
          {removing ? '⏳ Removing...' : '🗑️ Remove File'}
        </button>
      </div>
    </div>
  )
}

function SharingView({ space }: { space: Space }) {
  const isPrivateSpace = space.access?.type === 'private'

  return (
    <div className="w3m-section">
      <div className="w3m-section-header">
        <div className="w3m-space-title-row">
          <div>
            <h2>Share {space.name || 'Untitled Space'}</h2>
            <p className="w3m-section-desc">Share access to this space with others via email or DID</p>
          </div>
          <span className={`w3m-badge ${isPrivateSpace ? 'private' : 'public'}`}>
            {isPrivateSpace ? '🔒 Private' : '🌐 Public'}
          </span>
        </div>
      </div>

      <SharingTool key={space.did()} space={space}>
        <SharingContent />
      </SharingTool>
    </div>
  )
}

function SharingContent() {
  const [{ error }, { revokeDelegation }] = useSharingToolContext()
  const [revokingEmails, setRevokingEmails] = useState<Set<string>>(new Set())

  const handleRevoke = async (email: string, delegation: any) => {
    try {
      setRevokingEmails((prev) => new Set([...prev, email]))
      await revokeDelegation(email, delegation)
    } catch (err) {
      console.error('Failed to revoke:', err)
      alert('Failed to revoke delegation')
    } finally {
      setRevokingEmails((prev) => {
        const next = new Set(prev)
        next.delete(email)
        return next
      })
    }
  }

  return (
    <div className="w3m-sharing-container">
      <SharingTool.Form
        renderInput={() => (
          <div className="w3m-form-field">
            <label className="w3m-form-label">Email or DID</label>
            <SharingTool.Input
              className="w3m-form-input"
              placeholder="email@example.com or did:key:..."
            />
            <p className="w3m-form-hint">Enter an email address or Decentralized Identifier (DID)</p>
          </div>
        )}
        renderSubmitButton={(disabled) => (
          <button type="submit" className={`w3m-primary-btn ${disabled ? 'loading' : ''}`} disabled={disabled}>
            {disabled ? '⏳ Sharing...' : '🔗 Share Space'}
          </button>
        )}
      />

      {error && <div className="w3m-error-message">{error}</div>}

      <SharingTool.SharedList
        renderItem={(item) => {
          const isRevoking = revokingEmails.has(item.email)
          return (
            <div key={item.email} className={`w3m-shared-item ${item.revoked ? 'revoked' : ''}`}>
              <div className="w3m-shared-content">
                <div className="w3m-shared-header">
                  <span className="w3m-shared-email">{item.email}</span>
                  {item.revoked && <span className="w3m-revoked-badge">Revoked</span>}
                </div>
                <div className="w3m-shared-caps">Capabilities: {item.capabilities.join(', ')}</div>
              </div>
              {!item.revoked && (
                <button
                  className={`w3m-revoke-btn ${isRevoking ? 'loading' : ''}`}
                  onClick={() => handleRevoke(item.email, item.delegation)}
                  disabled={isRevoking}
                >
                  {isRevoking ? '⏳ Revoking...' : '✕ Revoke'}
                </button>
              )}
            </div>
          )
        }}
      />
    </div>
  )
}
