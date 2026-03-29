import React, { useState } from 'react'
import { SharingTool, useSharingToolContext } from '@storacha/console-toolkit-react'
import type { Space } from '@storacha/ui-core'

function isDID(value: string): boolean {
  return /^did:[a-z]+:.+/.test(value.trim())
}

function isEmail(value: string): boolean {
  return !isDID(value) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function getButtonLabel(value: string, isSharing: boolean): string {
  if (isSharing) return 'SHARING…'
  const v = value.trim()
  if (isEmail(v)) return 'SHARE VIA EMAIL'
  if (isDID(v)) return 'SHARE VIA DID'
  return 'ENTER A VALID EMAIL OR DID'
}

function SharingInner() {
  const [{ value, sharedEmails, isSharing, error }, { setValue, shareViaEmail, shareViaDID, revokeDelegation }] =
    useSharingToolContext()
  const [delegationUrl, setDelegationUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const trimmed = value.trim()
  const validEmail = isEmail(trimmed)
  const validDID = isDID(trimmed)
  const isValid = validEmail || validDID
  const buttonLabel = getButtonLabel(value, isSharing)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || isSharing) return
    setDelegationUrl(null)
    if (validDID) {
      const url = await shareViaDID(trimmed)
      setDelegationUrl(url)
      setValue('')
    } else {
      await shareViaEmail(trimmed)
      setValue('')
    }
  }

  const handleCopy = () => {
    if (delegationUrl) {
      navigator.clipboard.writeText(delegationUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  return (
    <div className="sharing-container">
      <h2 className="sharing-heading">SHARE YOUR SPACE</h2>
      <div className="sharing-card">
        <p className="sharing-desc">
          Ask your friend for their Email or Decentralized Identifier (DID) and paste it below:
        </p>
        <form onSubmit={handleSubmit}>
          <input
            className="sharing-input"
            placeholder="email or did:"
            value={value}
            onChange={(e) => { setValue(e.target.value); setDelegationUrl(null) }}
          />
          <button
            type="submit"
            className={`sharing-btn${isValid ? ' sharing-btn-active' : ''}`}
            disabled={!isValid || isSharing}
          >
            {buttonLabel}
          </button>
        </form>
        {error && <p className="sharing-error">{error}</p>}
        {delegationUrl && (
          <div className="sharing-delegation">
            <p className="sharing-delegation-label">Delegation URL</p>
            <div className="sharing-delegation-row">
              <code className="sharing-delegation-url">{delegationUrl}</code>
              <button className="sharing-copy-btn" onClick={handleCopy}>
                {copied ? '✓' : 'Copy'}
              </button>
            </div>
          </div>
        )}
      </div>

      {sharedEmails.length > 0 && (
        <div className="sharing-list">
          {sharedEmails.map((item) => (
            <div
              key={item.email}
              className={`sharing-item${item.revoked ? ' sharing-item-revoked' : ''}`}
            >
              <span className="sharing-item-email">{item.email}</span>
              {!item.revoked && (
                <button
                  className="sharing-revoke-btn"
                  onClick={() => revokeDelegation(item.email, item.delegation)}
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export interface SharingToolViewProps {
  space: Space
}

export function SharingToolView({ space }: SharingToolViewProps) {
  return (
    <SharingTool space={space as never}>
      <SharingInner />
    </SharingTool>
  )
}
