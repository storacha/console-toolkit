import React, { useState, useCallback } from 'react'
import { UploadTool, useUploadToolContext } from '@storacha/console-toolkit-react'

export function UploadView({ space }: { space: { did: () => string; name?: string; access?: { type?: string } } }) {
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

      <UploadTool space={space as any}>
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

export function UploadViewContent({
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
