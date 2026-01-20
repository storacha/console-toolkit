import React, { useState, useCallback } from 'react'
import type { UnknownLink } from '@storacha/ui-core'
import {
  UploadTool,
  useUploadToolContext,
} from '@storacha/console-toolkit-react'

type UploadToolProps = {
  space?: { name?: string; did: () => string; access?: { type?: string } }
  onUploaded?: (cid?: UnknownLink) => void
  onClose?: () => void
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

export function Web3MailUploadTool({ space, onUploaded, onClose }: UploadToolProps) {
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
    <div className="space-card-3d upload-advanced-card" id="web3mail-upload-tool">
      <div className="space-card-header upload-tool-header">
        <div className="upload-header-text">
          <h3 className="space-card-title">
            {space ? `Upload to ${space.name || 'Untitled Space'}` : 'Advanced Uploads'}
          </h3>
          <p className="space-card-subtitle">
            {space
              ? `Upload files${!isPrivateSpace ? ', directories, or CARs' : ''} with live status and progress.`
              : 'Select a space to start uploading.'}
          </p>
        </div>
        {onClose && (
          <button className="upload-close-btn" type="button" onClick={onClose}>
            CLOSE
          </button>
        )}
      </div>

      {space ? (
        <UploadTool
          key={space.did()}
          space={space as any}
          onUploadComplete={({ dataCID }) => {
            if (dataCID) onUploaded?.(dataCID as any)
          }}
        >
          <UploadToolContent
            isDragging={isDragging}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          />
        </UploadTool>
      ) : (
        <div className="space-empty">Pick a space to unlock uploads.</div>
      )}
    </div>
  )
}

function UploadToolContent({
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
  const fileInputRef = React.useRef<HTMLInputElement>(null)

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

  const handleDropzoneClick = useCallback((e: React.MouseEvent) => {
    // Prevent triggering if clicking on the submit button or other interactive elements
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('a') || target.closest('input[type="file"]')) {
      return
    }
    // Find the file input and trigger it
    const input = fileInputRef.current || document.querySelector('.upload-input-hidden') as HTMLInputElement
    input?.click()
  }, [])

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
    <UploadTool.Form className="space-form">
      <UploadSummary />

      {!isPrivateSpace && (
        <div className="space-field">
          <label className="space-label">Upload Type</label>
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
      )}

      <label
        htmlFor="web3mail-upload-input"
        className={`upload-dropzone ${isDragging ? 'is-dragging' : ''} ${file ? 'has-file' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={handleDropWithFiles}
        onClick={handleDropzoneClick}
      >
        <UploadTool.Input
          id="web3mail-upload-input"
          ref={fileInputRef}
          className="space-input upload-input-hidden"
          allowDirectory={uploadType === 'directory'}
        />
        <UploadTool.Status
          renderIdle={(idleFile, idleFiles) => {
            if (!idleFile) {
              return (
                <div className="upload-dropzone-inner">
                  <div className="upload-dropzone-icon">📁</div>
                  <p className="upload-dropzone-text">{getUploadPrompt()}</p>
                  <p className="space-help">
                    {idleFiles?.length
                      ? `${idleFiles.length} item${idleFiles.length > 1 ? 's' : ''} selected.`
                      : 'Choose files or a directory to upload.'}
                  </p>
                </div>
              )
            }
            return (
              <div className="upload-file-preview">
                <div className="upload-file-info">
                  <div className="upload-file-icon">📄</div>
                  <div className="upload-file-details">
                    <div className="upload-file-name">{idleFile.name}</div>
                    <div className="upload-file-size">{formatFileSize(idleFile.size)}</div>
                  </div>
                </div>
                <button type="submit" className="space-primary-btn upload-start-btn" disabled={!idleFile}>
                  ☁️ Start Upload
                </button>
              </div>
            )
          }}
          renderUploading={(uploadingFile, progress, shards) => (
            <div className="upload-progress-container">
              <h4 className="upload-progress-title">Uploading {uploadingFile?.name || 'file'}...</h4>
              <UploadTool.Progress
                renderProgress={(prog, progShards) => (
                  <div className="upload-progress-bars">
                    {Object.values(prog).map((p, index) => {
                      const { total, loaded, lengthComputable } = p
                      const percent = lengthComputable && total > 0 ? Math.floor((loaded / total) * 100) : 0
                      return (
                        <div key={index} className="upload-progress-bar-wrapper">
                          <div className="upload-progress-bar">
                            <div className="upload-progress-bar-fill" style={{ width: `${percent}%` }} />
                          </div>
                          {lengthComputable && <div className="upload-progress-text">{percent}%</div>}
                        </div>
                      )
                    })}
                    {progShards.map((shard, index) => (
                      <div key={index} className="upload-shard-info">
                        Shard {shard.cid.toString().slice(0, 12)}... ({formatFileSize(shard.size)}) uploaded
                      </div>
                    ))}
                  </div>
                )}
              />
              <div className="space-help">
                Transfers: {Object.keys(progress).length || 1}
                {shards.length > 0 && ` · Shards stored: ${shards.length}`}
              </div>
            </div>
          )}
          renderSucceeded={(successCID) => (
            <div className="upload-success">
              <h4 className="upload-success-title">✅ Upload Complete!</h4>
              {successCID && (
                <div className="upload-success-cid">
                  <label className="space-label">Root CID:</label>
                  <code className="code-chip">{successCID.toString()}</code>
                </div>
              )}
              <button type="button" className="space-secondary-btn" onClick={() => reset()}>
                ➕ Upload Another
              </button>
            </div>
          )}
          renderFailed={(error) => (
            <div className="upload-error">
              <h4 className="upload-error-title">⚠️ Upload Failed</h4>
              <p className="upload-error-message">{error?.message || 'Unknown error occurred'}</p>
              <button type="button" className="space-secondary-btn" onClick={() => reset()}>
                Try Again
              </button>
            </div>
          )}
        />
      </label>

      {!isPrivateSpace && uploadType === 'file' && (
        <div className="space-field">
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
            When enabled, the file is placed inside a folder. Useful for preserving the filename in gateways.
          </div>
        </div>
      )}

    </UploadTool.Form>
  )
}

function UploadSummary() {
  const [{ uploadType, status, wrapInDirectory, isPrivateSpace }] = useUploadToolContext()

  return (
    <div className="upload-tool-meta">
      <div className="upload-pill-row">
        <span className="pill pill-type">Type: {uploadType}</span>
        <span className={`pill pill-status status-${status}`}>Status: {status}</span>
        {wrapInDirectory && <span className="pill pill-wrap">Wrap in dir</span>}
        {isPrivateSpace ? (
          <span className="pill pill-private">🔒 Private</span>
        ) : (
          <span className="pill pill-public">🌐 Public</span>
        )}
      </div>
    </div>
  )
}
