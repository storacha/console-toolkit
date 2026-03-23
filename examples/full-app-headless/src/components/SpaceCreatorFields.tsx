import React from 'react'
import { SpaceCreator, useSpaceCreatorContext } from '@storacha/console-toolkit-react'

export function SpaceCreatorNameField() {
  return (
    <div className="app-form-field">
      <label className="app-form-label" htmlFor="space-name">
        Space Name
      </label>
      <SpaceCreator.NameInput
        id="space-name"
        className="app-form-input"
        placeholder="Enter a memorable name for your space"
        required
      />
      <p className="app-form-hint">This is a memorable alias. The true name is a unique DID.</p>
    </div>
  )
}

export function SpaceCreatorAccessTypeField() {
  const [{ accessType }, { setAccessType }] = useSpaceCreatorContext()

  return (
    <div className="app-form-field">
      <label className="app-form-label">Access Type</label>
      <div className="app-access-type-options">
        <label className={`app-access-type-option ${accessType === 'public' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="accessType"
            value="public"
            checked={accessType === 'public'}
            onChange={() => setAccessType('public')}
            className="app-radio-input"
          />
          <div className="app-access-type-content">
            <span className="app-access-type-title">🌐 Public Space</span>
            <p className="app-access-type-description">Files stored unencrypted and accessible via IPFS</p>
          </div>
        </label>
        <label className={`app-access-type-option ${accessType === 'private' ? 'selected' : ''}`}>
          <input
            type="radio"
            name="accessType"
            value="private"
            checked={accessType === 'private'}
            onChange={() => setAccessType('private')}
            className="app-radio-input"
          />
          <div className="app-access-type-content">
            <span className="app-access-type-title">🔒 Private Space</span>
            <p className="app-access-type-description">Files encrypted locally before upload</p>
          </div>
        </label>
      </div>
    </div>
  )
}
