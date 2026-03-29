import React, { useState } from 'react'
import { SpaceList, useSpaceListContext } from '@storacha/console-toolkit-react'
import type { Space, UnknownLink } from '@storacha/ui-core'

type SubTab = 'uploads' | 'blobs'

function UploadsInner({
  onItemSelect,
  onUpload,
}: {
  onItemSelect: (root: UnknownLink) => void
  onUpload?: () => void
}) {
  const [{ uploads, isLoading, isValidating, nextCursor, prevCursor }, { refresh, loadNext, loadPrev }] =
    useSpaceListContext()
  const [subTab, setSubTab] = useState<SubTab>('uploads')

  const busy = isLoading || isValidating

  return (
    <div className="uploads-container">
      <div className="uploads-pill-tabs">
        <button
          className={`uploads-pill${subTab === 'uploads' ? ' uploads-pill-active' : ''}`}
          onClick={() => setSubTab('uploads')}
        >
          Uploads
        </button>
        <button
          className={`uploads-pill${subTab === 'blobs' ? ' uploads-pill-active' : ''}`}
          onClick={() => setSubTab('blobs')}
        >
          Blobs
        </button>
      </div>

      {subTab === 'blobs' ? (
        <p className="uploads-empty-text" style={{ textAlign: 'center', padding: '3rem 0' }}>
          Blob listing coming soon.
        </p>
      ) : busy ? (
        <div className="uploads-loading">
          <div className="storacha-auth-spinner" />
        </div>
      ) : uploads.length === 0 ? (
        <div className="uploads-empty">
          <p className="uploads-empty-text">
            No uploads.{' '}
            <button className="uploads-upload-link" onClick={onUpload}>
              Upload a file.
            </button>
          </p>
          <button className="uploads-reload-btn" onClick={refresh}>
            ↻ RELOAD
          </button>
        </div>
      ) : (
        <>
          <div className="uploads-table-wrap">
            <table className="uploads-table">
              <thead>
                <tr>
                  <th className="uploads-th">Root CID</th>
                  <th className="uploads-th uploads-th-right">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {uploads.map((u) => (
                  <tr
                    key={u.root.toString()}
                    className="uploads-tr"
                    onClick={() => onItemSelect(u.root)}
                  >
                    <td className="uploads-td">{u.root.toString()}</td>
                    <td className="uploads-td uploads-td-ts">
                      {new Date(u.updatedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="uploads-pagination">
            <button className="uploads-page-btn" onClick={loadPrev} disabled={!prevCursor}>
              ‹ PREVIOUS
            </button>
            <button className="uploads-reload-btn" onClick={refresh}>
              ↻ RELOAD
            </button>
            <button className="uploads-page-btn" onClick={loadNext} disabled={!nextCursor}>
              NEXT ›
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export interface SpaceUploadsViewProps {
  space: Space
  onItemSelect: (root: UnknownLink) => void
  onUpload?: () => void
}

export function SpaceUploadsView({ space, onItemSelect, onUpload }: SpaceUploadsViewProps) {
  return (
    <SpaceList space={space}>
      <UploadsInner onItemSelect={onItemSelect} onUpload={onUpload} />
    </SpaceList>
  )
}
