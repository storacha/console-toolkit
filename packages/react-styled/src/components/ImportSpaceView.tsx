import React, { useRef, useState, useCallback } from 'react'
import type { Space } from '@storacha/ui-core'
import {
  ImportSpace as HeadlessImportSpace,
  useImportSpaceContext,
} from '@storacha/console-toolkit-react'

export interface ImportSpaceViewProps {
  onImport?: (space: Space) => void
  onError?: (error: Error) => void
}

function ImportSpaceForm() {
  const [{ userDID, isImporting, error, success }, { copyDID, emailDID, importUCAN }] =
    useImportSpaceContext()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [copied, setCopied] = useState(false)

  const handleCopyDID = useCallback(async () => {
    await copyDID()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [copyDID])

  const handleImportUCAN = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await (importUCAN as (token: string | File) => Promise<Space | undefined>)(file)
      e.target.value = ''
    }
  }, [importUCAN])

  return (
    <div className="import-card">
      <div className="import-step">
        <p className="import-step-title">1. Send your DID to your friend.</p>
        {userDID && (
          <>
            <div className="import-did-box">
              <code className="import-did-text">{userDID}</code>
            </div>
            <div className="import-did-actions">
              <button className="storacha-auth-button" onClick={handleCopyDID} type="button">
                ⧉ {copied ? 'Copied!' : 'Copy DID'}
              </button>
              <button className="storacha-auth-button import-btn-outline" onClick={emailDID} type="button">
                ✉ Email DID
              </button>
            </div>
          </>
        )}
      </div>

      <div className="import-step">
        <p className="import-step-title">2. Import the UCAN they send you.</p>
        <p className="import-step-desc">
          Instruct your friend to use the web console or CLI to create a UCAN, delegating your DID access to their space.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".ucan,.car,application/vnd.ipfs.car"
          style={{ display: 'none' }}
          onChange={handleImportUCAN}
        />
        <button
          className="storacha-auth-button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
          type="button"
        >
          ⊕ {isImporting ? 'Importing…' : 'Import UCAN'}
        </button>
        {error && <p className="import-error">{error}</p>}
        {success && <p className="import-success">{success}</p>}
      </div>
    </div>
  )
}

export function ImportSpaceView({ onImport, onError }: ImportSpaceViewProps) {
  return (
    <div>
      <h2 className="spaces-heading">Import a Space</h2>
      <HeadlessImportSpace onImport={onImport} onError={onError}>
        <ImportSpaceForm />
      </HeadlessImportSpace>
    </div>
  )
}
