import React, { useMemo, useState, useCallback } from 'react'
import type { UnknownLink } from '@storacha/ui-core'
import {
  UploadTool,
  useUploadToolContext,
  UploadStatus,
} from '@storacha/console-toolkit-react'

type UploadToolProps = {
  space?: { name?: string; did: () => string; access?: { type?: string } }
  onUploaded?: (cid?: UnknownLink) => void
  onClose?: () => void
}

export function DmailUploadTool({ space, onUploaded, onClose }: UploadToolProps) {
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

  return (
    <DmailUploadToolContent
      space={space}
      onUploaded={onUploaded}
      onClose={onClose}
      isDragging={isDragging}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    />
  )
}

function DmailUploadToolContent({
  space,
  onUploaded,
  onClose,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
}: UploadToolProps & {
  isDragging: boolean
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
}) {

  return (
    <div className="space-card-3d upload-advanced-card" id="dmail-upload-tool">
      <div className="space-card-header upload-tool-header">
        <div className="upload-header-text">
          <h3 className="space-card-title">Advanced Uploads</h3>
          <p className="space-card-subtitle">
            Upload files, directories, or CARs with live status and progress.
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
          space={space as any}
          onUploadComplete={({ dataCID }) => {
            if (dataCID) onUploaded?.(dataCID as any)
          }}
        >
          <UploadSummary />

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

            <UploadToolWithDropzone
              isDragging={isDragging}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            />

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
                Private spaces limit type selection to files. Use CAR for pre-built DAGs.
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
      ) : (
        <div className="space-empty">Pick a space to unlock uploads.</div>
      )}
    </div>
  )
}

function UploadToolWithDropzone({
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
  const [{ file }, { setFiles }] = useUploadToolContext()
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
    const input = fileInputRef.current || document.getElementById('advanced-upload-input-dmail') as HTMLInputElement
    input?.click()
  }, [])

  return (
    <label
      htmlFor="advanced-upload-input-dmail"
      className={`upload-dropzone ${isDragging ? 'is-dragging' : ''} ${file ? 'has-file' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={handleDropWithFiles}
      onClick={handleDropzoneClick}
    >
      <UploadTool.Input
        ref={fileInputRef}
        id="advanced-upload-input-dmail"
        className="space-input upload-input-hidden"
        multiple
      />
      <div className="upload-dropzone-inner">
        <div className="upload-dropzone-icon">📁</div>
        <p className="upload-dropzone-text">
          {file ? `Selected: ${file.name}` : 'Drag files here or click to browse'}
        </p>
        <p className="space-help">
          Choose files or a directory to upload.
        </p>
      </div>
    </label>
  )
}

function UploadSummary() {
  const [{ uploadType, status, wrapInDirectory, uploadProgress, storedDAGShards, dataCID, isPrivateSpace }] =
    useUploadToolContext()

  const transfers = useMemo(() => Object.values(uploadProgress).length, [uploadProgress])

  return (
    <div className="upload-tool-meta">
      <div className="upload-pill-row">
        <span className="pill pill-type">Type: {uploadType}</span>
        <span className={`pill pill-status status-${status}`}>Status: {status}</span>
        {wrapInDirectory && <span className="pill pill-wrap">Wrap in dir</span>}
        {isPrivateSpace ? (
          <span className="pill pill-private">Private space</span>
        ) : (
          <span className="pill pill-public">Public space</span>
        )}
      </div>
      {status === UploadStatus.Uploading && (
        <div className="space-help">
          Transfers: {transfers || 1}
          {storedDAGShards.length ? ` · Shards stored: ${storedDAGShards.length}` : ''}
        </div>
      )}
      {status === UploadStatus.Succeeded && dataCID && (
        <div className="space-inline-success">
          Latest CID: <code className="code-chip">{dataCID.toString()}</code>
        </div>
      )}
    </div>
  )
}
