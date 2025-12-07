import React, { useState } from 'react'

interface Web3MailFileUploadProps {
  walletAddress: string
  ensName?: string
  onFileUploaded: (fileInfo: Web3MailFileInfo) => void
}

interface Web3MailFileInfo {
  cid: string
  fileName: string
  fileSize: number
  web3MailShareUrl: string
  encryptedMessageId: string
}

export function Web3MailFileUpload({ 
  walletAddress, 
  ensName, 
  onFileUploaded 
}: Web3MailFileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<Web3MailFileInfo[]>([])
  const [encryptionKey, setEncryptionKey] = useState<string>()

  const generateMessageId = (): string => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const generateEncryptionKey = (): string => {
    return `enc_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files))
    }
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      for (const file of selectedFiles) {
        for (let i = 0; i <= 100; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 100))
          setUploadProgress(i)
        }

        const mockCid = `bafybeig${Math.random().toString(36).substr(2, 44)}`
        const fileInfo: Web3MailFileInfo = {
          cid: mockCid,
          fileName: file.name,
          fileSize: file.size,
          web3MailShareUrl: `https://web3mail.app/share/${mockCid}`,
          encryptedMessageId: generateMessageId()
        }

        setUploadedFiles(prev => [...prev, fileInfo])
        onFileUploaded(fileInfo)

        console.log('Web3Mail notification sent:', {
          to: walletAddress,
          from: walletAddress,
          subject: 'File Uploaded to Storacha',
          message: `Your file "${fileInfo.fileName}" has been uploaded successfully.`,
          fileCid: fileInfo.cid,
          encryptedMessageId: fileInfo.encryptedMessageId
        })
      }
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      setSelectedFiles([])
    }
  }

  return (
    <div className="web3mail-file-upload">
      <div className="upload-header">
        <h3>Upload Files</h3>
        <p>Connected as: {ensName || `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}</p>
      </div>

      <div className="upload-section">
        <div className="web3mail-dropzone">
          <div className="dropzone-content">
            <div className="upload-icon">🌐</div>
            <h4>Drag & Drop Files</h4>
            <p>Upload files to decentralized storage and share via Web3Mail</p>
            <div className="supported-formats">
              <span>All file types supported</span>
            </div>
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              id="file-input"
            />
            <label htmlFor="file-input" className="file-input-label">
              Choose Files
            </label>
          </div>
        </div>

        <div className="encryption-settings">
          <h4>Encryption Settings</h4>
          <div className="encryption-options">
            <label className="encryption-option">
              <input 
                type="checkbox" 
                checked={!!encryptionKey}
                onChange={(e) => setEncryptionKey(e.target.checked ? generateEncryptionKey() : undefined)}
              />
              <span>🔒 Enable end-to-end encryption</span>
            </label>
            {encryptionKey && (
              <div className="encryption-key-info">
                <p>Encryption key generated: {encryptionKey.slice(0, 8)}...</p>
                <button 
                  onClick={() => navigator.clipboard.writeText(encryptionKey)}
                  className="copy-key-button"
                >
                  Copy Key
                </button>
              </div>
            )}
          </div>
        </div>

        {selectedFiles.length > 0 && (
          <div className="selected-files">
            <h4>Selected Files:</h4>
            {selectedFiles.map((file, index) => (
              <div key={index} className="file-item">
                <span className="file-name">{file.name}</span>
                <span className="file-size">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            ))}
          </div>
        )}

        {isUploading && (
          <div className="upload-progress">
            <h4>Uploading...</h4>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p>{uploadProgress}% complete</p>
          </div>
        )}

        <div className="upload-actions">
          <button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || isUploading}
            className="web3mail-upload-button"
          >
            {isUploading ? 'Uploading...' : 'Upload & Share via Web3Mail'}
          </button>
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="uploaded-files">
          <h4>Uploaded Files</h4>
          {uploadedFiles.map((file, index) => (
            <div key={index} className="uploaded-file-item">
              <div className="file-info">
                <span className="file-name">{file.fileName}</span>
                <span className="file-size">{(file.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                <span className="file-cid">CID: {file.cid}</span>
              </div>
              <div className="file-actions">
                <a
                  href={file.web3MailShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="web3mail-share-link"
                >
                  Open in Web3Mail
                </a>
                <button
                  onClick={() => navigator.clipboard.writeText(file.web3MailShareUrl)}
                  className="copy-link-button"
                >
                  Copy Link
                </button>
                <button
                  onClick={() => console.log('Download file:', file.cid)}
                  className="download-button"
                >
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
