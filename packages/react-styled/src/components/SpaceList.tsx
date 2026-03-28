import React from 'react'
import md5 from 'blueimp-md5'
import type { Space } from '@storacha/ui-core'

export interface SpaceListProps {
  spaces: Space[]
  onSelect?: (space: Space) => void
}

export function SpaceList({ spaces, onSelect }: SpaceListProps) {
  return (
    <div>
      <h2 className="spaces-heading">Spaces</h2>
      <div className="spaces-tab-row">
        <span className="spaces-tab spaces-tab-active">&#127760; Public</span>
      </div>
      <div className="spaces-card">
        {spaces.map((space) => (
          <button
            key={space.did()}
            className="spaces-row"
            onClick={() => onSelect?.(space)}
          >
            <img
              className="spaces-row-avatar"
              src={`https://www.gravatar.com/avatar/${md5(space.did())}?d=identicon`}
              alt=""
              aria-hidden="true"
            />
            <div className="spaces-row-info">
              <div className="spaces-row-name">{space.name || 'Untitled'}</div>
              <div className="spaces-row-did">{space.did()}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
