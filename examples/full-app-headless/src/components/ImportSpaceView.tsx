import React, { useState, useCallback, useRef } from 'react'
import type { Space } from '@storacha/ui-core'
import { useImportSpaceContext } from '@storacha/console-toolkit-react'

export function ImportSpaceView({ onImport: _onImport }: { onImport: (space: Space) => void }) {
  const [{ userDID, ucanValue, isImporting, error, success, importedSpace }, { copyDID, emailDID, importUCAN: importUCANAction, setUcanValue }] = useImportSpaceContext()
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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.name.endsWith('.ucan') || file.name.endsWith('.car') || file.type === 'application/vnd.ipfs.car') {
        setSelectedFile(file)
        setUcanValue('')
        handleFileImport(file)
      } else {
        alert('Please select a .ucan or .car file')
      }
    }
  }, [setUcanValue])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      setSelectedFile(file)
      setUcanValue('')
      handleFileImport(file)
    }
  }, [setUcanValue])

  const handleFileImport = useCallback(async (file: File) => {
    try {
      await (importUCANAction as (ucanToken: string | File) => Promise<Space | undefined>)(file)
    } catch (err) {
      console.error('Failed to import file:', err)
    }
  }, [importUCANAction])

  const handleDropzoneClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div className="app-section">
      <div className="app-section-header">
        <h2>IMPORT A SPACE</h2>
      </div>
      <div className="app-import-container">
        <div className="app-import-section">
          <h3 className="app-import-section-title">1. Send your DID to your friend.</h3>
          {userDID && (
            <>
              <div className="app-did-display">
                <code className="app-did-text">{userDID}</code>
              </div>
              <div className="app-did-actions">
                <button
                  type="button"
                  className="app-copy-did-button"
                  onClick={handleCopyDID}
                  title="Copy DID"
                >
                  <span>📋</span> {copied ? 'Copied!' : 'COPY DID'}
                </button>
                <button
                  type="button"
                  className="app-email-did-button"
                  onClick={emailDID}
                  title="Open email client with DID"
                >
                  <span>✉️</span> EMAIL DID
                </button>
              </div>
            </>
          )}
        </div>

        <div className="app-import-section">
          <h3 className="app-import-section-title">2. Import the UCAN they send you.</h3>
          <p className="app-import-instruction">
            Instruct your friend to use the web console or CLI to create a UCAN, delegating your DID access to their space.
          </p>

          <div
            className={`app-ucan-dropzone ${isDragging ? 'dragging' : ''} ${selectedFile ? 'has-file' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleDropzoneClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".ucan,.car,application/vnd.ipfs.car"
              className="app-file-input-hidden"
              onChange={handleFileSelect}
            />
            {!selectedFile && (
              <>
                <div className="app-ucan-dropzone-icon">📁</div>
                <p className="app-ucan-dropzone-text">
                  Drag UCAN file here or click to browse
                </p>
                <p className="app-ucan-dropzone-hint">
                  Supports .ucan and .car files
                </p>
              </>
            )}
            {selectedFile && (
              <div className="app-ucan-file-preview">
                <div className="app-ucan-file-info">
                  <div className="app-ucan-file-icon">📄</div>
                  <div className="app-ucan-file-details">
                    <div className="app-ucan-file-name">{selectedFile.name}</div>
                    <div className="app-ucan-file-size">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="app-ucan-remove-button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedFile(null)
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ''
                    }
                  }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="app-error-message">
              <span>⚠️</span> {error}
            </div>
          )}
          {success && (
            <div className="app-success-message">
              <span>✅</span> {success}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
