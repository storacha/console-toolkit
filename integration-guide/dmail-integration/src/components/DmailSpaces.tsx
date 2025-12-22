import { useEffect, useMemo, useState } from 'react'
import type { UnknownLink } from '@storacha/ui-core'

import {
  SpaceEnsurer,
  SpacePicker,
  SpaceCreator,
  SpaceList,
  FileViewer,
  SharingTool,
  UploadTool,
  useSpacePickerContext,
  useSpaceCreatorContext,
  useSpaceListContext,
  useFileViewerContext,
  useSharingToolContext,
} from '@storacha/console-toolkit-react'
import { DmailUploadTool } from './DmailUploadTool'

type SpaceT = ReturnType<typeof useSpacePickerContext>[0]['spaces'][number]

const DEFAULT_GATEWAY_HOST = 'https://w3s.link'
const DEFAULT_GATEWAY_DID = 'did:web:w3s.link'
const DEFAULT_PROVIDER_DID = 'did:web:web3.storage'

function SpaceCreatorCard() {
  return (
    <div className="space-card-3d">
      <div className="space-card-header">
        <h3 className="space-card-title">Create your first Space</h3>
        <p className="space-card-subtitle">Spaces organize uploads, sharing and access control.</p>
      </div>

      <SpaceCreator
        gatewayHost={DEFAULT_GATEWAY_HOST}
        gatewayDID={DEFAULT_GATEWAY_DID}
        providerDID={DEFAULT_PROVIDER_DID}
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
          <SpaceCreator
            gatewayHost={DEFAULT_GATEWAY_HOST}
            gatewayDID={DEFAULT_GATEWAY_DID}
            providerDID={DEFAULT_PROVIDER_DID}
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
            <UploadRow key={upload.root.toString()} root={upload.root} insertedAt={upload.insertedAt} />
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

function UploadRow({ root, insertedAt }: { root: UnknownLink; insertedAt?: string }) {
  const short = useMemo(() => {
    const s = root.toString()
    return `${s.slice(0, 10)}…${s.slice(-8)}`
  }, [root])

  return (
    <div className="upload-row">
      <div className="upload-row-title">{short}</div>
      <div className="upload-row-sub">{insertedAt ? new Date(insertedAt).toLocaleString() : '—'}</div>
    </div>
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
        <div className="file-v"><FileViewer.URL /></div>
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

export function DmailSpaces() {
  const [selectedRoot, setSelectedRoot] = useState<UnknownLink | undefined>(undefined)
  const [showUploadTool, setShowUploadTool] = useState(false)

  const openAdvancedUpload = () => {
    setShowUploadTool(true)
    setTimeout(() => {
      document.getElementById('dmail-upload-tool')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  return (
    <section className="space-demo">
      <SpaceEnsurer
        renderNoSpaces={() => <SpaceCreatorCard />}
        renderCreator={() => <SpaceCreatorCard />}
      >
        <SpacePicker>
          <DmailSpacesInner
            selectedRoot={selectedRoot}
            setSelectedRoot={setSelectedRoot}
            showUploadTool={showUploadTool}
            setShowUploadTool={setShowUploadTool}
            openAdvancedUpload={openAdvancedUpload}
          />
        </SpacePicker>
      </SpaceEnsurer>
    </section>
  )
}

function DmailSpacesInner({
  selectedRoot,
  setSelectedRoot,
  showUploadTool,
  setShowUploadTool,
  openAdvancedUpload,
}: {
  selectedRoot: UnknownLink | undefined
  setSelectedRoot: (cid?: UnknownLink) => void
  showUploadTool: boolean
  setShowUploadTool: (v: boolean) => void
  openAdvancedUpload: () => void
}) {
  const [{ selectedSpace }] = useSpacePickerContext()
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

  return (
    <>
      <div className="space-toolbar space-upload-launch">
        <div className="space-help">
          {activeSpace ? `Uploading to: ${activeSpace.name || activeSpace.did()}` : 'Select a space to upload.'}
        </div>
        <button className="space-secondary-btn" type="button" onClick={openAdvancedUpload}>
          Open Advanced Upload
        </button>
      </div>
      <div className="space-grid">
        <SpacePickerPanel />
        <SharingPanel space={activeSpace} />
        <UploadPanel space={activeSpace} onUploaded={(cid) => setSelectedRoot(cid)} />
        <UploadsPanel space={activeSpace} onSelectRoot={onSelectRoot} />
        <FileViewerPanel space={activeSpace} root={selectedRoot} onCleared={clearRoot} />
        {showUploadTool && (
          <DmailUploadTool
            space={activeSpace}
            onUploaded={(cid) => setSelectedRoot(cid as any)}
            onClose={() => setShowUploadTool(false)}
          />
        )}
      </div>
    </>
  )
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
