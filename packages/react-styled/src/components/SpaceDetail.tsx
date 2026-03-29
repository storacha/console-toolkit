import React from 'react'
import md5 from 'blueimp-md5'
import type { Space } from '@storacha/ui-core'

export interface SpaceDetailProps {
  space: Space
  onBack?: () => void
  children?: React.ReactNode
}

export function SpaceDetail({ space, onBack, children }: SpaceDetailProps) {
  return (
    <div className="space-detail-container">
      <div className="space-detail-header">
        <img
          className="space-detail-avatar"
          src={`https://www.gravatar.com/avatar/${md5(space.did())}?d=identicon&s=80`}
          alt=""
          aria-hidden="true"
        />
        <div className="space-detail-meta">
          <div className="space-detail-name-row">
            <span className="space-detail-name">{space.name || 'Untitled'}</span>
            <span className="space-detail-badge">Public</span>
          </div>
          <div className="space-detail-did">{space.did()}</div>
        </div>
      </div>
      {onBack && (
        <div className="space-detail-breadcrumb">
          <button className="space-detail-back" onClick={onBack}>Spaces</button>
          <span className="space-detail-breadcrumb-sep">›</span>
          <span className="space-detail-breadcrumb-did">{space.did().slice(0, 20)}…{space.did().slice(-4)}</span>
        </div>
      )}
      {children}
    </div>
  )
}
