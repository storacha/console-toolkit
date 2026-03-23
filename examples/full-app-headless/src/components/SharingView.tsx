import React from 'react'
import { SharingTool, useSharingToolContext } from '@storacha/console-toolkit-react'

export function SharingView({
  space,
  revokingEmails,
  setRevokingEmails,
}: {
  space: { name?: string; did: () => string }
  revokingEmails: Set<string>
  setRevokingEmails: React.Dispatch<React.SetStateAction<Set<string>>>
}) {
  const [{ sharedEmails }, { revokeDelegation }] = useSharingToolContext()

  const handleRevoke = async (email: string, delegation: any) => {
    try {
      setRevokingEmails(prev => new Set([...prev, email]))
      await revokeDelegation(email, delegation)
    } catch (error) {
      console.error('Failed to revoke delegation:', error)
      alert('Failed to revoke delegation. Please try again.')
    } finally {
      setRevokingEmails(prev => {
        const next = new Set(prev)
        next.delete(email)
        return next
      })
    }
  }

  return (
    <div className="app-section">
      <div className="app-section-header">
        <h2>Share {space.name || 'Untitled Space'}</h2>
        <p className="app-section-description">Share access to this space with others via email or DID</p>
      </div>
      <div className="app-sharing-container">
        <SharingTool.Form
          renderInput={() => (
            <div className="app-form-field">
              <label className="app-form-label" htmlFor="share-input">
                Email or DID
              </label>
              <SharingTool.Input
                id="share-input"
                className="app-form-input"
                placeholder="email@example.com or did:key:..."
              />
              <p className="app-form-hint">Enter an email address or Decentralized Identifier (DID)</p>
            </div>
          )}
          renderSubmitButton={(disabled) => (
            <button
              type="submit"
              className={`app-submit-button ${disabled ? 'loading' : ''}`}
              disabled={disabled}
            >
              {disabled ? (
                <>
                  <span className="app-spinner"></span>
                  Sharing...
                </>
              ) : (
                <>
                  <span>🔗</span>
                  Share Space
                </>
              )}
            </button>
          )}
        />
        <SharingTool.SharedList
          renderItem={(item, index) => {
            const isRevoking = revokingEmails.has(item.email)
            return (
              <div key={item.email} className={`app-shared-item ${item.revoked ? 'revoked' : ''}`}>
                <div className="app-shared-item-content">
                  <div className="app-shared-item-header">
                    <span className="app-shared-email">{item.email}</span>
                    {item.revoked && (
                      <span className="app-revoked-badge">Revoked</span>
                    )}
                  </div>
                  <div className="app-shared-capabilities">
                    Capabilities: {item.capabilities.join(', ')}
                  </div>
                </div>
                {!item.revoked && (
                  <button
                    className={`app-revoke-button ${isRevoking ? 'loading' : ''}`}
                    onClick={() => handleRevoke(item.email, item.delegation)}
                    disabled={isRevoking}
                  >
                    {isRevoking ? (
                      <>
                        <span className="app-spinner"></span>
                        Revoking...
                      </>
                    ) : (
                      <>
                        <span>✕</span>
                        Revoke
                      </>
                    )}
                  </button>
                )}
              </div>
            )
          }}
        />
      </div>
    </div>
  )
}
