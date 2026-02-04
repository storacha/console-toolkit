import { useEffect, useState, useCallback, useRef } from 'react'
import type { UnknownLink } from '@storacha/ui-core'

import {
  SpaceEnsurer,
  SpacePicker,
  SpaceCreator,
  SpaceList,
  FileViewer,
  SharingTool,
  UploadTool,
  PlanGate,
  ImportSpace,
  useSpacePickerContext,
  useSpaceCreatorContext,
  useSpaceListContext,
  useFileViewerContext,
  useSharingToolContext,
  usePlanGateContext,
  useImportSpaceContext,
} from '@storacha/console-toolkit-react'
import { DmailUploadTool } from './DmailUploadTool'

type SpaceT = ReturnType<typeof useSpacePickerContext>[0]['spaces'][number]

const DEFAULT_GATEWAY_HOST = 'https://w3s.link'
const DEFAULT_GATEWAY_DID = 'did:web:w3s.link'
const DEFAULT_PROVIDER_DID = 'did:web:web3.storage'

function PlanGateFallbackContent({
  planStatus,
  error,
  selectPlan,
  refreshPlan,
}: {
  planStatus: 'loading' | 'active' | 'missing' | 'error'
  error?: string
  selectPlan: (planID: string) => Promise<void>
  refreshPlan: () => Promise<void>
}) {
  if (planStatus === 'loading') {
    return (
      <div className="space-empty">
        <div className="space-help">Checking your plan status...</div>
      </div>
    )
  }

  if (planStatus === 'missing') {
    return (
      <div className="space-plans-container">
        <div className="space-plans-header">
          <h2 className="space-plans-title">Plans</h2>
          <p className="space-plans-description">
            Pick the price plan that works for you.
            <br />
            <strong>Starter</strong> is free for up to 5GiB.
            <br />
            <strong>Lite</strong> and <strong>Business</strong> plans unlock lower cost per GiB.
          </p>
        </div>
        <div className="space-plans-grid">
          <div className="space-plan-card">
            <div className="space-plan-header">
              <h3 className="space-plan-name">Starter</h3>
              <div className="space-plan-peppers">🌶️</div>
            </div>
            <div className="space-plan-price">$0/mo</div>
            <div className="space-plan-features">
              <div className="space-plan-feature">
                <div className="space-plan-feature-main">
                  <strong>5GB Storage</strong>
                </div>
                <div className="space-plan-feature-sub">Additional at $0.15/GB per month</div>
              </div>
              <div className="space-plan-feature">
                <div className="space-plan-feature-main">
                  <strong>5GB Egress</strong>
                </div>
                <div className="space-plan-feature-sub">Additional at $0.15/GB per month</div>
              </div>
            </div>
            <button
              className="space-plan-button"
              type="button"
              onClick={() => selectPlan('did:web:starter.storacha.network')}
            >
              START STORING
            </button>
          </div>
          <div className="space-plan-card">
            <div className="space-plan-header">
              <h3 className="space-plan-name">Lite</h3>
              <div className="space-plan-peppers">🌶️🌶️</div>
            </div>
            <div className="space-plan-price">$10/mo</div>
            <div className="space-plan-features">
              <div className="space-plan-feature">
                <div className="space-plan-feature-main">
                  <strong>100GB Storage</strong>
                </div>
                <div className="space-plan-feature-sub">Additional at $0.05/GB per month</div>
              </div>
              <div className="space-plan-feature">
                <div className="space-plan-feature-main">
                  <strong>100GB Egress</strong>
                </div>
                <div className="space-plan-feature-sub">Additional at $0.05/GB per month</div>
              </div>
            </div>
            <button
              className="space-plan-button"
              type="button"
              onClick={() => selectPlan('did:web:lite.storacha.network')}
            >
              START STORING
            </button>
          </div>
          <div className="space-plan-card">
            <div className="space-plan-header">
              <h3 className="space-plan-name">Business</h3>
              <div className="space-plan-peppers">🌶️🌶️🌶️</div>
            </div>
            <div className="space-plan-price">$100/mo</div>
            <div className="space-plan-features">
              <div className="space-plan-feature">
                <div className="space-plan-feature-main">
                  <strong>2TB Storage</strong>
                </div>
                <div className="space-plan-feature-sub">Additional at $0.03/GB per month</div>
              </div>
              <div className="space-plan-feature">
                <div className="space-plan-feature-main">
                  <strong>2TB Egress</strong>
                </div>
                <div className="space-plan-feature-sub">Additional at $0.03/GB per month</div>
              </div>
            </div>
            <button
              className="space-plan-button"
              type="button"
              onClick={() => selectPlan('did:web:business.storacha.network')}
            >
              START STORING
            </button>
          </div>
        </div>
        <button className="space-secondary-btn" type="button" onClick={refreshPlan} style={{ marginTop: '20px' }}>
          I've selected a plan, refresh
        </button>
      </div>
    )
  }

  if (planStatus === 'error') {
    return (
      <div className="space-empty">
        <div className="space-inline-error">
          <div style={{ marginBottom: '8px' }}>⚠️ Error</div>
          <div style={{ marginBottom: '12px' }}>{error || 'Failed to check plan status.'}</div>
          <button className="space-secondary-btn" type="button" onClick={refreshPlan}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return null
}

function SpaceCreatorWithPlanErrorHandling() {
  const [, { refreshPlan }] = usePlanGateContext()

  return (
    <SpaceCreator
      gatewayHost={DEFAULT_GATEWAY_HOST}
      gatewayDID={DEFAULT_GATEWAY_DID}
      providerDID={DEFAULT_PROVIDER_DID}
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
        }
      }}
    >
      <SpaceCreator.Form
        className="space-form"
        renderNameInput={() => <CreatorNameInput />}
        renderAccessTypeSelector={() => <CreatorAccessSelect />}
        renderSubmitButton={(disabled) => (
          <button className="space-primary-btn" type="submit" disabled={disabled}>
            {disabled ? 'Creating...' : 'Create Space'}
          </button>
        )}
      />
      <CreatorStatus />
    </SpaceCreator>
  )
}

function SpaceCreatorCard() {
  return (
    <div className="space-card-3d">
      <div className="space-card-header">
        <h3 className="space-card-title">Create your first Space</h3>
        <p className="space-card-subtitle">Spaces organize uploads, sharing and access control.</p>
      </div>

      <PlanGate>
        <PlanGate.Fallback
          renderFallback={({ planStatus, error, selectPlan, refreshPlan }) => (
            <PlanGateFallbackContent
              planStatus={planStatus}
              error={error}
              selectPlan={selectPlan}
              refreshPlan={refreshPlan}
            />
          )}
        />
        <PlanGate.Gate>
          <SpaceCreatorWithPlanErrorHandling />
        </PlanGate.Gate>
      </PlanGate>
    </div>
  )
}

function CreatorNameInput() {
  const [{ name }] = useSpaceCreatorContext()
  return (
    <div className="space-field">
      <label className="space-label" htmlFor="space-name">Space name</label>
      <SpaceCreator.NameInput id="space-name" className="space-input" placeholder="e.g. Dmail workspace" required />
      {name?.length ? <div className="space-help">Tip: keep it short and descriptive.</div> : null}
    </div>
  )
}

function CreatorAccessSelect() {
  const [{ accessType }] = useSpaceCreatorContext()
  return (
    <div className="space-field">
      <label className="space-label" htmlFor="space-access">Access</label>
      <SpaceCreator.AccessTypeSelect id="space-access" className="space-select" />
      <div className="space-help">
        {accessType === 'private'
          ? 'Private spaces include encryption settings.'
          : 'Public spaces are accessible without private encryption.'}
      </div>
    </div>
  )
}

function CreatorStatus() {
  const [{ created, createdSpace, error }] = useSpaceCreatorContext()
  if (error) {
    return <div className="space-inline-error">{error}</div>
  }
  if (created && createdSpace) {
    return (
      <div className="space-inline-success">
        Space created: <strong>{createdSpace.name || createdSpace.did()}</strong>
      </div>
    )
  }
  return null
}

function SpacePickerPanel() {
  const [{ spaces, selectedSpace, query, publicSpaces, privateSpaces }, { setSelectedSpace }] = useSpacePickerContext()

  useEffect(() => {
    if (!selectedSpace && spaces.length > 0) {
      setSelectedSpace(spaces[0])
    }
  }, [selectedSpace, spaces, setSelectedSpace])

  const hasQuery = query.trim().length > 0

  return (
    <div className="space-card-3d">
      <div className="space-card-header">
        <h3 className="space-card-title">Spaces</h3>
        <p className="space-card-subtitle">Pick a space, view uploads, share access, and inspect files.</p>
      </div>

      <div className="space-toolbar">
        <SpacePicker.Search className="space-search" placeholder="Search spaces..." />
        <div className="space-toolbar-right">
          <PlanGate>
            <PlanGate.Fallback
              renderFallback={({ planStatus, error, selectPlan, refreshPlan }) => {
                if (planStatus === 'loading') {
                  return <div className="space-help">Checking plan status...</div>
                }
                if (planStatus === 'missing') {
                  return (
                    <div className="space-help">
                      <button
                        className="space-secondary-btn"
                        type="button"
                        onClick={() => selectPlan('did:web:starter.storacha.network')}
                      >
                        Select Plan to Add Space
                      </button>
                    </div>
                  )
                }
                if (planStatus === 'error') {
                  return (
                    <div className="space-inline-error">
                      {error || 'Plan check failed.'}
                      <button className="space-secondary-btn" type="button" onClick={refreshPlan} style={{ marginLeft: '8px' }}>
                        Retry
                      </button>
                    </div>
                  )
                }
                return null
              }}
            />
            <PlanGate.Gate>
              <SpaceCreator
                gatewayHost={DEFAULT_GATEWAY_HOST}
                gatewayDID={DEFAULT_GATEWAY_DID}
                providerDID={DEFAULT_PROVIDER_DID}
                onError={(error) => {
                  console.error('Space creation error:', error)
                  const errorMessage = (error as any)?.cause?.message || error.message
                  // Filter out plan-related errors since PlanGate handles plan selection
                  const isPlanError =
                    (error as any)?.isAccountPlanMissing ||
                    errorMessage?.includes('AccountPlanMissing') ||
                    errorMessage?.includes('payment plan') ||
                    errorMessage?.includes('plan selection') ||
                    errorMessage?.includes('billing plan') ||
                    (errorMessage?.includes('provisioning') && errorMessage?.includes('plan'))

                  if (isPlanError) {
                    // PlanGate will handle showing the plan selection UI
                    return
                  }
                }}
              >
                <SpaceCreator.Form
                  className="space-compact-form"
                  renderNameInput={() => (
                    <SpaceCreator.NameInput className="space-input" placeholder="New space name" required />
                  )}
                  renderAccessTypeSelector={() => (
                    <SpaceCreator.AccessTypeSelect className="space-select" />
                  )}
                  renderSubmitButton={(disabled) => (
                    <button className="space-secondary-btn" type="submit" disabled={disabled}>
                      {disabled ? 'Creating...' : 'Add Space'}
                    </button>
                  )}
                />
                <CreatorStatus />
              </SpaceCreator>
            </PlanGate.Gate>
          </PlanGate>
        </div>
      </div>

      <div className="space-split">
        <div className="space-split-col">
          <div className="space-split-title">Public</div>
          <SpacePicker.List
            type="public"
            className="space-list"
            renderEmpty={() => (
              <div className="space-empty">{hasQuery ? 'No public spaces match your search.' : 'No public spaces yet.'}</div>
            )}
            renderItem={(space) => (
              <SpaceRow
                key={space.did()}
                space={space}
                selected={selectedSpace?.did() === space.did()}
                onClick={() => setSelectedSpace(space)}
              />
            )}
          />
        </div>

        <div className="space-split-col">
          <div className="space-split-title">Private</div>
          <SpacePicker.List
            type="private"
            className="space-list"
            renderEmpty={() => (
              <div className="space-empty">{hasQuery ? 'No private spaces match your search.' : 'No private spaces yet.'}</div>
            )}
            renderItem={(space) => (
              <SpaceRow
                key={space.did()}
                space={space}
                selected={selectedSpace?.did() === space.did()}
                onClick={() => setSelectedSpace(space)}
              />
            )}
          />
        </div>
      </div>

      <div className="space-meta">
        <div className="space-meta-item">Public: <strong>{publicSpaces.length}</strong></div>
        <div className="space-meta-item">Private: <strong>{privateSpaces.length}</strong></div>
      </div>
    </div>
  )
}

function SpaceRow({ space, selected, onClick }: { space: SpaceT; selected: boolean; onClick: () => void }) {
  const label = space.name || space.did()
  const did = space.did()
  const access = space.access?.type === 'private' ? 'Private' : 'Public'

  return (
    <button type="button" className={`space-row ${selected ? 'is-selected' : ''}`} onClick={onClick}>
      <div className="space-row-main">
        <div className="space-row-name">{label}</div>
        <div className="space-row-did">{did}</div>
      </div>
      <div className={`space-pill ${access === 'Private' ? 'is-private' : 'is-public'}`}>{access}</div>
    </button>
  )
}

function UploadsPanel({ space, onSelectRoot }: { space: SpaceT | undefined; onSelectRoot: (root: UnknownLink) => void }) {
  return (
    <div className="space-card-3d">
      <div className="space-card-header">
        <h3 className="space-card-title">Uploads</h3>
        <p className="space-card-subtitle">Browse uploads within the selected space.</p>
      </div>

      <SpaceList space={space as any}>
        <SpaceList.List
          className="upload-list"
          renderLoading={() => <div className="space-empty">Loading uploads...</div>}
          renderEmpty={() => <div className="space-empty">No uploads found in this space.</div>}
          onItemClick={onSelectRoot}
          renderItem={(upload) => (
            <UploadRow
              key={upload.root.toString()}
              root={upload.root}
              insertedAt={upload.insertedAt}
              onSelect={() => onSelectRoot(upload.root)}
            />
          )}
        />
        <div className="upload-pagination">
          <SpaceList.Pagination
            renderPrevButton={(disabled, onClick) => (
              <button className="space-secondary-btn" disabled={disabled} onClick={onClick}>Prev</button>
            )}
            renderRefreshButton={(loading, onClick) => (
              <button className="space-secondary-btn" disabled={loading} onClick={onClick}>{loading ? 'Refreshing...' : 'Refresh'}</button>
            )}
            renderNextButton={(disabled, onClick) => (
              <button className="space-secondary-btn" disabled={disabled} onClick={onClick}>Next</button>
            )}
          />
        </div>
        <UploadsStatus />
      </SpaceList>
    </div>
  )
}

function UploadsStatus() {
  const [{ error }] = useSpaceListContext()
  if (!error) return null
  return <div className="space-inline-error">{error}</div>
}

function UploadRow({ root, insertedAt, onSelect }: { root: UnknownLink; insertedAt?: string; onSelect: () => void }) {
  const cidString = root.toString()

  return (
    <button type="button" className="upload-row" onClick={onSelect}>
      <div className="upload-row-cid" title={cidString}>{cidString}</div>
      <div className="upload-row-date">{insertedAt ? new Date(insertedAt).toLocaleString() : '—'}</div>
    </button>
  )
}

function FileViewerPanel({ space, root, onCleared }: { space: SpaceT | undefined; root: UnknownLink | undefined; onCleared: () => void }) {
  return (
    <div className="space-card-3d">
      <div className="space-card-header">
        <h3 className="space-card-title">File Viewer</h3>
        <p className="space-card-subtitle">Inspect a selected upload and get gateway URL.</p>
      </div>

      <FileViewer space={space as any} root={root as any}>
        <FileViewerContent onCleared={onCleared} />
      </FileViewer>
    </div>
  )
}

function FileViewerContent({ onCleared }: { onCleared: () => void }) {
  const [{ root, isLoading, error, upload }] = useFileViewerContext()

  if (!root) {
    return <div className="space-empty">Select an upload from the list to view details.</div>
  }

  if (isLoading) {
    return <div className="space-empty">Loading file details...</div>
  }

  if (error) {
    return <div className="space-inline-error">{error}</div>
  }

  return (
    <div className="file-viewer">
      <div className="file-kv">
        <div className="file-k">Root</div>
        <div className="file-v"><FileViewer.Root /></div>
      </div>

      <div className="file-kv">
        <div className="file-k">Gateway URL</div>
        <div className="file-v">
          <FileViewer.URL
            renderURL={(url) => (
              <a href={url} target="_blank" rel="noopener noreferrer" className="file-viewer-gateway-link">
                {url}
              </a>
            )}
          />
        </div>
      </div>

      <div className="file-kv">
        <div className="file-k">Shards</div>
        <div className="file-v"><FileViewer.Shards renderLoading={() => <div>Loading shards...</div>} /></div>
      </div>

      <div className="file-actions">
        <FileViewer.RemoveButton
          className="space-danger-btn"
          onRemove={onCleared}
          renderButton={(onClick, loading) => (
            <button className="space-danger-btn" onClick={onClick} disabled={loading}>
              {loading ? 'Removing...' : 'Remove upload'}
            </button>
          )}
        />
        <button className="space-secondary-btn" type="button" onClick={onCleared}>
          Clear
        </button>
      </div>

      {upload?.shards?.length ? (
        <div className="space-help">Shards: <strong>{upload.shards.length}</strong></div>
      ) : null}
    </div>
  )
}

function SharingPanel({ space }: { space: SpaceT | undefined }) {
  if (!space) {
    return (
      <div className="space-card-3d">
        <div className="space-card-header">
          <h3 className="space-card-title">Share Space</h3>
          <p className="space-card-subtitle">Select a space to enable sharing.</p>
        </div>
        <div className="space-empty">Pick a space to share access.</div>
      </div>
    )
  }

  return (
    <div className="space-card-3d">
      <div className="space-card-header">
        <h3 className="space-card-title">Share Space</h3>
        <p className="space-card-subtitle">Share by email (sends authorization) or by DID (downloads delegation).</p>
      </div>

      <SharingTool key={space.did()} space={space as any}>
        <SharingTool.Form
          className="space-form"
          renderInput={() => (
            <SharingTool.Input className="space-input" placeholder="Email or DID" />
          )}
          renderSubmitButton={(disabled) => (
            <button className="space-primary-btn" type="submit" disabled={disabled}>
              {disabled ? 'Sharing...' : 'Share'}
            </button>
          )}
        />

        <SharingStatus />

        <SharingTool.SharedList
          className="share-list"
          renderItem={(item) => <SharedRow key={item.email} item={item} />}
        />
      </SharingTool>
    </div>
  )
}

function SharingStatus() {
  const [{ error, isLoading }] = useSharingToolContext()
  if (isLoading) return <div className="space-help">Loading shared access…</div>
  if (!error) return null
  return <div className="space-inline-error">{error}</div>
}

function SharedRow({ item }: { item: { email: string; capabilities: string[]; delegation: any; revoked?: boolean } }) {
  const [, { revokeDelegation }] = useSharingToolContext()

  return (
    <div className={`share-row ${item.revoked ? 'is-revoked' : ''}`}>
      <div className="share-row-main">
        <div className="share-email">{item.email}</div>
        <div className="share-caps">{item.capabilities.join(', ')}</div>
      </div>
      <div className="share-actions">
        <button
          className="space-secondary-btn"
          type="button"
          disabled={!!item.revoked}
          onClick={() => revokeDelegation(item.email, item.delegation)}
        >
          {item.revoked ? 'Revoked' : 'Revoke'}
        </button>
      </div>
    </div>
  )
}

function ImportSpacePanel() {
  const [{ userDID, error, success }, { copyDID, emailDID, importUCAN, setUcanValue }] = useImportSpaceContext()
  const [copied, setCopied] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCopyDID = useCallback(async () => {
    try {
      await copyDID()
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy DID:', err)
    }
  }, [copyDID])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleFileImport = useCallback(
    async (file: File) => {
      try {
        await importUCAN(file)
      } catch (err) {
        console.error('Failed to import file:', err)
      }
    },
    [importUCAN]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      const files = e.dataTransfer.files
      if (files?.length) {
        const file = files[0]
        if (file.name.endsWith('.ucan') || file.name.endsWith('.car') || file.type === 'application/vnd.ipfs.car') {
          setSelectedFile(file)
          setUcanValue('')
          handleFileImport(file)
        } else {
          alert('Please select a .ucan or .car file')
        }
      }
    },
    [setUcanValue, handleFileImport]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files?.length) {
        const file = files[0]
        setSelectedFile(file)
        setUcanValue('')
        handleFileImport(file)
      }
    },
    [setUcanValue, handleFileImport]
  )

  const handleDropzoneClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div className="space-card-3d" id="dmail-import-space">
      <div className="space-card-header">
        <h3 className="space-card-title">Import a Space</h3>
        <p className="space-card-subtitle">Share spaces via DID and UCAN delegation</p>
      </div>
      <div className="space-import-container">
        <div className="space-import-section">
          <h4 className="space-import-section-title">1. Send your DID to your friend.</h4>
          {userDID && (
            <>
              <div className="space-did-display">
                <code className="space-did-text">{userDID}</code>
              </div>
              <div className="space-did-actions">
                <button type="button" className="space-secondary-btn" onClick={handleCopyDID} title="Copy DID">
                  <span>📋</span> {copied ? 'Copied!' : 'Copy DID'}
                </button>
                <button type="button" className="space-secondary-btn" onClick={emailDID} title="Open email with DID">
                  <span>✉️</span> Email DID
                </button>
              </div>
            </>
          )}
        </div>
        <div className="space-import-section">
          <h4 className="space-import-section-title">2. Import the UCAN they send you.</h4>
          <p className="space-import-instruction">
            Ask them to create a UCAN in the console or CLI delegating your DID access to their space.
          </p>
          <div
            className={`space-ucan-dropzone ${isDragging ? 'dragging' : ''} ${selectedFile ? 'has-file' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleDropzoneClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".ucan,.car,application/vnd.ipfs.car"
              className="space-file-input-hidden"
              onChange={handleFileSelect}
            />
            {!selectedFile && (
              <>
                <div className="space-ucan-dropzone-icon">📁</div>
                <p className="space-ucan-dropzone-text">Drag UCAN file here or click to browse</p>
                <p className="space-ucan-dropzone-hint">Supports .ucan and .car files</p>
              </>
            )}
            {selectedFile && (
              <div className="space-ucan-file-preview">
                <div className="space-ucan-file-info">
                  <div className="space-ucan-file-icon">📄</div>
                  <div className="space-ucan-file-details">
                    <div className="space-ucan-file-name">{selectedFile.name}</div>
                    <div className="space-ucan-file-size">{(selectedFile.size / 1024).toFixed(2)} KB</div>
                  </div>
                </div>
                <button
                  type="button"
                  className="space-ucan-remove-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedFile(null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>
          
          {error && (
            <div className="space-inline-error">
              <span>⚠️</span> {error}
            </div>
          )}
          {success && (
            <div className="space-inline-success">
              <span>✅</span> {success}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export type DmailSpacesView = 'spaces' | 'create' | 'uploads' | 'import'

export function DmailSpaces({ onNavigateToSettings }: { onNavigateToSettings?: () => void }) {
  const [selectedRoot, setSelectedRoot] = useState<UnknownLink | undefined>(undefined)
  const [showUploadTool, setShowUploadTool] = useState(false)
  const [view, setView] = useState<DmailSpacesView>('spaces')

  const openAdvancedUpload = () => {
    setShowUploadTool(true)
    setView('uploads')
  }

  return (
    <div className="dmail-spaces-section">
      {onNavigateToSettings && (
        <nav className="dmail-spaces-nav">
          <button
            onClick={() => setView('spaces')}
            className={`dmail-spaces-nav-button ${view === 'spaces' ? 'active' : ''}`}
            type="button"
          >
            <span>📁</span> Spaces
          </button>
          <button
            onClick={() => setView('create')}
            className={`dmail-spaces-nav-button ${view === 'create' ? 'active' : ''}`}
            type="button"
          >
            <span>➕</span> Create Space
          </button>
          <button
            onClick={() => setView('uploads')}
            className={`dmail-spaces-nav-button ${view === 'uploads' ? 'active' : ''}`}
            type="button"
          >
            <span>📤</span> Uploads
          </button>
          <button
            onClick={() => setView('import')}
            className={`dmail-spaces-nav-button ${view === 'import' ? 'active' : ''}`}
            type="button"
          >
            <span>📥</span> Import
          </button>
          <button
            onClick={onNavigateToSettings}
            className="dmail-spaces-nav-button"
            type="button"
          >
            <span>⚙️</span> Settings
          </button>
        </nav>
      )}
      <section className="space-demo">
        <SpaceEnsurer
          renderNoSpaces={() => <SpaceCreatorCard />}
          renderCreator={() => <SpaceCreatorCard />}
        >
          <SpacePicker>
            <DmailSpacesInner
              view={view}
              selectedRoot={selectedRoot}
              setSelectedRoot={setSelectedRoot}
              showUploadTool={showUploadTool}
              setShowUploadTool={setShowUploadTool}
              openAdvancedUpload={openAdvancedUpload}
            />
          </SpacePicker>
        </SpaceEnsurer>
      </section>
    </div>
  )
}

function DmailSpacesInner({
  view,
  selectedRoot,
  setSelectedRoot,
  showUploadTool,
  setShowUploadTool,
  openAdvancedUpload,
}: {
  view: DmailSpacesView
  selectedRoot: UnknownLink | undefined
  setSelectedRoot: (cid?: UnknownLink) => void
  showUploadTool: boolean
  setShowUploadTool: (v: boolean) => void
  openAdvancedUpload: () => void
}) {
  const [{ selectedSpace }, { setSelectedSpace }] = useSpacePickerContext()
  const activeSpace = selectedSpace as SpaceT | undefined

  useEffect(() => {
    setSelectedRoot(undefined)
  }, [activeSpace?.did(), setSelectedRoot])

  const onSelectRoot = (root: UnknownLink) => {
    setSelectedRoot(root)
  }

  const clearRoot = () => {
    setSelectedRoot(undefined)
  }

  if (view === 'spaces') {
    return (
      <div className="space-grid">
        <SpacePickerPanel />
        <SharingPanel space={activeSpace} />
      </div>
    )
  }

  if (view === 'create') {
    return (
      <div className="space-grid space-grid-single">
        <SpaceCreatorCard />
      </div>
    )
  }

  if (view === 'uploads') {
    return (
      <>
        <div className="space-toolbar space-upload-launch">
          <div className="space-help">
            {activeSpace ? `Uploading to: ${activeSpace.name || activeSpace.did()}` : 'Select a space in the Spaces tab to upload.'}
          </div>
          <button className="space-secondary-btn" type="button" onClick={openAdvancedUpload}>
            Open Advanced Upload
          </button>
        </div>
        <div className="space-grid space-grid-uploads">
          <UploadPanel space={activeSpace} onUploaded={(cid) => setSelectedRoot(cid)} />
          <UploadsPanel space={activeSpace} onSelectRoot={onSelectRoot} />
          <FileViewerPanel space={activeSpace} root={selectedRoot} onCleared={clearRoot} />
        </div>
        {showUploadTool && (
          <DmailUploadTool
            space={activeSpace}
            onUploaded={(cid) => setSelectedRoot(cid as any)}
            onClose={() => setShowUploadTool(false)}
          />
        )}
      </>
    )
  }

  if (view === 'import') {
    return (
      <div className="space-grid space-grid-single">
        <div className="space-grid-cell-full">
          <ImportSpace onImport={(space) => setSelectedSpace(space)}>
            <ImportSpacePanel />
          </ImportSpace>
        </div>
      </div>
    )
  }

  return null
}

function UploadPanel({
  space,
  onUploaded,
}: {
  space: SpaceT | undefined
  onUploaded: (cid?: UnknownLink) => void
}) {
  if (!space) {
    return (
      <div className="space-card-3d">
        <div className="space-card-header">
          <h3 className="space-card-title">Upload</h3>
          <p className="space-card-subtitle">Pick a space to start uploading.</p>
        </div>
        <div className="space-empty">Select a space to enable uploads.</div>
      </div>
    )
  }

  return (
    <div className="space-card-3d">
      <div className="space-card-header">
        <h3 className="space-card-title">Upload to {space.name || 'this space'}</h3>
        <p className="space-card-subtitle">Upload files, directories, or CARs. Private spaces only allow file uploads.</p>
      </div>

      <UploadTool
        space={space as any}
        onUploadComplete={({ dataCID }) => {
          if (dataCID) onUploaded(dataCID as any)
        }}
      >
        <UploadTool.Form className="space-form">
          <div className="space-field">
            <label className="space-label">Upload type</label>
            <UploadTool.TypeSelector
              className="upload-type-options"
              renderOption={(type, checked, onChange) => (
                <button
                  type="button"
                  className={`space-pill-option ${checked ? 'is-selected' : ''}`}
                  onClick={onChange}
                >
                  {type === 'car' ? 'CAR' : type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              )}
            />
          </div>

          <div className="space-field">
            <label className="space-label" htmlFor="upload-input-dmail">
              Select files
            </label>
            <UploadTool.Input id="upload-input-dmail" className="space-input" multiple />
            <UploadTool.WrapCheckbox
              className="space-checkbox"
              renderCheckbox={(checked, toggle) => (
                <label className="space-wrap-toggle">
                  <input type="checkbox" checked={checked} onChange={toggle} />
                  <span>Wrap single file in directory</span>
                </label>
              )}
            />
            <div className="space-help">
              Use CAR for pre-built DAGs. Directories and multiple files are uploaded as a folder.
            </div>
          </div>

          <button className="space-primary-btn" type="submit">
            Upload
          </button>
        </UploadTool.Form>

        <UploadTool.Progress className="upload-progress" />

        <UploadTool.Status
          renderIdle={(_file, files) => (
            <div className="space-help">
              {files?.length
                ? `${files.length} item${files.length > 1 ? 's' : ''} ready to upload.`
                : 'Choose files or a directory to upload.'}
            </div>
          )}
          renderUploading={(_file, progress, shards) => (
            <div className="space-help">
              Uploading {Object.keys(progress).length || 1} transfer{Object.keys(progress).length === 1 ? '' : 's'}...
              {shards.length ? ` Shards stored: ${shards.length}` : ''}
            </div>
          )}
          renderSucceeded={(dataCID) => (
            <div className="space-inline-success">
              Upload complete: <code className="code-chip">{dataCID?.toString() || 'Unknown CID'}</code>
            </div>
          )}
          renderFailed={(err) => (
            <div className="space-inline-error">{err?.message || 'Upload failed. Try again.'}</div>
          )}
        />
      </UploadTool>
    </div>
  )
}
