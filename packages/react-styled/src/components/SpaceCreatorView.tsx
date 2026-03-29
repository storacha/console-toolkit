import React from 'react'
import type { Space } from '@storacha/ui-core'
import {
  SpaceCreator as HeadlessSpaceCreator,
  useSpaceCreatorContext,
} from '@storacha/console-toolkit-react'

export interface SpaceCreatorViewProps {
  onCreated?: (space: Space) => void
  onError?: (error: Error) => void
}

function SpaceCreatorForm() {
  const [{ name, submitted, created, error }, { setName, handleSubmit, resetForm }] =
    useSpaceCreatorContext()

  if (created) {
    return (
      <div className="creator-card">
        <p className="creator-success">Space created successfully!</p>
        <button className="storacha-auth-button" onClick={resetForm}>
          Create another
        </button>
      </div>
    )
  }

  return (
    <div className="creator-card">
      <form onSubmit={handleSubmit}>
        <div className="creator-field">
          <label className="creator-label">Name</label>
          <input
            className="storacha-auth-input creator-name-input"
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submitted}
          />
        </div>
        <button
          type="submit"
          className="storacha-auth-button creator-submit"
          disabled={submitted || !name.trim()}
        >
          {submitted && !error ? (
            <><span className="storacha-auth-spinner creator-spinner" /> Creating…</>
          ) : (
            '⊡ Create Public Space'
          )}
        </button>
        {error && <p className="creator-error">{error}</p>}
      </form>

      <div className="creator-explain">
        <div className="creator-explain-label">Explain</div>
        <p>A space is a decentralized bucket. The name you give it is a memorable alias.</p>
        <p>Its true name is a unique DID derived from a key-pair.</p>
        <p>Console, your agent, creates a UCAN delegating all capabilities on that space to your email DID.</p>
        <p>
          You can allow others to use your space, by creating a delegation to their email or a specific agent from the share page.
        </p>
        <p>
          For details on how this works see{' '}
          <a href="https://github.com/storacha/specs/blob/main/w3-account.md" target="_blank" rel="noopener noreferrer">
            specs/w3-account
          </a>
        </p>
      </div>
    </div>
  )
}

export function SpaceCreatorView({ onCreated, onError }: SpaceCreatorViewProps) {
  return (
    <div>
      <h2 className="spaces-heading">Create a New Space</h2>
      <HeadlessSpaceCreator
        gatewayHost="https://w3s.link"
        gatewayDID="did:web:w3s.link"
        providerDID="did:web:web3.storage"
        onSpaceCreated={onCreated}
        onError={onError}
      >
        <SpaceCreatorForm />
      </HeadlessSpaceCreator>
    </div>
  )
}
