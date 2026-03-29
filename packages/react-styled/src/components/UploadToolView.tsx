import React, { useState, useRef } from 'react'
import { UploadTool, useUploadToolContext, UploadStatus } from '@storacha/console-toolkit-react'
import type { Space } from '@storacha/ui-core'

function UploadInner() {
  const [
    { uploadType, file, status, wrapInDirectory, isPrivateSpace, dataCID, error, uploadProgress },
    { setUploadType, setFiles, setWrapInDirectory, reset },
  ] = useUploadToolContext()
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files?.length) setFiles([...e.dataTransfer.files])
  }

  const getPrompt = () => {
    if (uploadType === 'directory') return 'Drag Directory or Click to Browse'
    if (uploadType === 'car') return 'Drag CAR or Click to Browse'
    return 'Drag File or Click to Browse'
  }

  if (status === UploadStatus.Succeeded) {
    return (
      <div className="upload-card">
        <div className="upload-success-state">
          <p className="upload-success-title">Uploaded!</p>
          {dataCID && (
            <div className="upload-success-cid-row">
              <span className="upload-section-label">Root CID</span>
              <code className="upload-success-cid">{dataCID.toString()}</code>
            </div>
          )}
          <button className="storacha-auth-button upload-another-btn" onClick={reset}>
            Upload Another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="upload-card">
      <UploadTool.Form>
        {/* TYPE */}
        {!isPrivateSpace && (
          <div className="upload-section">
            <span className="upload-section-label">TYPE</span>
            <div className="upload-type-row">
              {(['file', 'directory', 'car'] as const).map((type) => (
                <label key={type} className="upload-type-option">
                  <input
                    type="radio"
                    checked={uploadType === type}
                    onChange={() => setUploadType(type)}
                  />
                  <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Dropzone */}
        <div
          className={`upload-dropzone${isDragging ? ' dragging' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          {status === UploadStatus.Idle && !file && (
            <>
              <input
                ref={inputRef}
                type="file"
                className="upload-file-input"
                onChange={(e) => e.target.files && setFiles([...e.target.files])}
                accept={uploadType === 'car' ? '.car' : undefined}
                {...(uploadType === 'directory' ? { webkitdirectory: 'true' as never } : {})}
              />
              <div className="upload-dropzone-content">
                <svg className="upload-tray-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                <p className="upload-dropzone-text">{getPrompt()}</p>
              </div>
            </>
          )}

          {status === UploadStatus.Idle && file && (
            <div className="upload-file-preview">
              <span className="upload-file-badge">{uploadType.toUpperCase()}</span>
              <span className="upload-file-name">{file.name}</span>
              <button type="submit" className="storacha-auth-button">
                Start Upload
              </button>
            </div>
          )}

          {status === UploadStatus.Uploading && (
            <div className="upload-progress-state">
              <div className="storacha-auth-spinner" />
              <p className="upload-progress-label">Uploading…</p>
              {Object.values(uploadProgress).map((p, i) => {
                const pct =
                  p.lengthComputable && p.total > 0
                    ? Math.floor((p.loaded / p.total) * 100)
                    : 0
                return (
                  <div key={i} className="upload-progress-bar-wrap">
                    <div className="upload-progress-bar">
                      <div className="upload-progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="upload-progress-pct">{pct}%</span>
                  </div>
                )
              })}
            </div>
          )}

          {status === UploadStatus.Failed && (
            <div className="upload-error-state">
              <p className="upload-error-msg">{error?.message || 'Upload failed'}</p>
              <button type="button" className="storacha-auth-button" onClick={reset}>
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* OPTIONS */}
        {!isPrivateSpace && uploadType === 'file' && status === UploadStatus.Idle && (
          <div className="upload-section">
            <span className="upload-section-label">OPTIONS</span>
            <label className="upload-wrap-option">
              <input
                type="checkbox"
                checked={wrapInDirectory}
                onChange={(e) => setWrapInDirectory(e.target.checked)}
              />
              <span>Wrap In Directory</span>
            </label>
          </div>
        )}

        {/* EXPLAIN */}
        {status === UploadStatus.Idle && (
          <div className="upload-section">
            <span className="upload-section-label">EXPLAIN</span>
            <div className="upload-explain-grid">
              <div className="upload-explain-card">
                <p className="upload-explain-title">🌐 Public Data</p>
                <p className="upload-explain-text">
                  All data uploaded here will be available to anyone who requests it using the
                  correct CID. Do not upload private or sensitive information in an unencrypted form.
                </p>
              </div>
              <div className="upload-explain-card">
                <p className="upload-explain-title">🔑 Permanent Data</p>
                <p className="upload-explain-text">
                  Removing files will remove them from the file listing for your account, but that
                  doesn't prevent nodes on the decentralized storage network from retaining copies
                  of the data indefinitely. Do not use this service for data that may need to be
                  permanently deleted in the future.
                </p>
              </div>
            </div>
          </div>
        )}
      </UploadTool.Form>
    </div>
  )
}

export interface UploadToolViewProps {
  space: Space
}

export function UploadToolView({ space }: UploadToolViewProps) {
  return (
    <UploadTool space={space as never}>
      <UploadInner />
    </UploadTool>
  )
}
