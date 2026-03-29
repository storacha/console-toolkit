import React, { useState } from 'react'
import { FileViewer, useFileViewerContext } from '@storacha/console-toolkit-react'
import type { Space, UnknownLink } from '@storacha/ui-core'

const GATEWAY = 'https://w3s.link'

function FileViewerInner({
  onRemoved,
}: {
  onRemoved?: () => void
}) {
  const [{ root, upload, isLoading, error }, { remove }] = useFileViewerContext()
  const [copied, setCopied] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 1500)
  }

  const handleRemoveConfirm = async () => {
    setIsRemoving(true)
    await remove()
    setIsRemoving(false)
    setShowConfirm(false)
    onRemoved?.()
  }

  if (isLoading) {
    return (
      <div className="file-viewer-loading">
        <div className="storacha-auth-spinner" />
      </div>
    )
  }

  if (error) {
    return <p className="file-viewer-error">{error}</p>
  }

  const rootStr = root?.toString() ?? ''
  const url = root ? `${GATEWAY}/ipfs/${rootStr}` : ''
  const shards = upload?.shards

  return (
    <div className="file-viewer-card">
      <div className="file-viewer-row">
        <div className="file-viewer-label">Root CID</div>
        <div className="file-viewer-value-row">
          <code className="file-viewer-cid">{rootStr}</code>
          <button className="file-viewer-copy-btn" onClick={() => copy(rootStr, 'root')}>
            {copied === 'root' ? '✓' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="file-viewer-row">
        <div className="file-viewer-label">URL</div>
        <div className="file-viewer-value-row">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="file-viewer-link"
          >
            {url}
          </a>
          <button className="file-viewer-copy-btn" onClick={() => copy(url, 'url')}>
            {copied === 'url' ? '✓' : 'Copy'}
          </button>
        </div>
      </div>

      {upload && (
        <div className="file-viewer-row">
          <div className="file-viewer-label">Shards</div>
          {shards && shards.length > 0 ? (
            shards.map((shard, i) => {
              const shardStr = shard.toString()
              const id = `shard-${i}`
              return (
                <div key={shardStr} className="file-viewer-value-row">
                  <code className="file-viewer-cid">{shardStr}</code>
                  <button className="file-viewer-copy-btn" onClick={() => copy(shardStr, id)}>
                    {copied === id ? '✓' : 'Copy'}
                  </button>
                </div>
              )
            })
          ) : (
            <div className="file-viewer-value-row">
              <span className="file-viewer-no-shards">No shard data available</span>
            </div>
          )}
        </div>
      )}

      <div className="file-viewer-actions">
        <button className="file-viewer-remove-btn" onClick={() => setShowConfirm(true)}>
          Remove
        </button>
      </div>

      {showConfirm && (
        <div className="file-viewer-confirm-overlay">
          <div className="file-viewer-confirm-dialog">
            <h3 className="file-viewer-confirm-title">Confirm remove</h3>
            <p className="file-viewer-confirm-msg">
              Are you sure you want to remove <code>{rootStr}</code>?
            </p>
            {shards && shards.length > 0 && (
              <>
                <p className="file-viewer-confirm-msg">The following shards will be removed:</p>
                <ul className="file-viewer-confirm-shards">
                  <li><code>{rootStr}</code></li>
                  {shards.map((shard) => (
                    <li key={shard.toString()}><code>{shard.toString()}</code></li>
                  ))}
                </ul>
              </>
            )}
            <p className="file-viewer-confirm-warning">
              Any uploads using the same shards as those listed above will be corrupted. This cannot be undone.
            </p>
            <div className="file-viewer-confirm-actions">
              <button
                className="file-viewer-confirm-cancel"
                onClick={() => setShowConfirm(false)}
                disabled={isRemoving}
              >
                Cancel
              </button>
              <button
                className="file-viewer-confirm-remove"
                onClick={handleRemoveConfirm}
                disabled={isRemoving}
              >
                {isRemoving ? <span className="storacha-auth-spinner file-viewer-confirm-spinner" /> : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export interface FileViewerViewProps {
  space: Space
  root: UnknownLink
  onRemoved?: () => void
}

export function FileViewerView({ space, root, onRemoved }: FileViewerViewProps) {
  return (
    <FileViewer space={space} root={root}>
      <FileViewerInner onRemoved={onRemoved} />
    </FileViewer>
  )
}
