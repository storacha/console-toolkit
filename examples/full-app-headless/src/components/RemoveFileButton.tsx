import React, { useState, useCallback } from 'react'
import { FileViewer, useFileViewerContext } from '@storacha/console-toolkit-react'

export function RemoveFileButton({ onRemove }: { onRemove: () => void }) {
  const [{ root, upload, isLoading }, { remove }] = useFileViewerContext()
  const [showConfirm, setShowConfirm] = useState(false)
  const [removing, setRemoving] = useState(false)

  const handleRemoveClick = useCallback(() => {
    setShowConfirm(true)
  }, [])

  const handleConfirmRemove = useCallback(async () => {
    if (!root) return

    try {
      setRemoving(true)
      await remove({ shards: true })
      setShowConfirm(false)
      onRemove()
    } catch (err) {
      console.error('Failed to remove file:', err)
      alert('Failed to remove file. Please try again.')
    } finally {
      setRemoving(false)
    }
  }, [root, remove, onRemove])

  const handleCancel = useCallback(() => {
    setShowConfirm(false)
  }, [])

  if (showConfirm) {
    const shards = upload?.shards || []

    return (
      <div className="app-remove-confirm-overlay">
        <div className="app-remove-confirm-dialog">
          <h3 className="app-remove-confirm-title">Confirm remove</h3>
          <p className="app-remove-confirm-message">
            Are you sure you want to remove <code className="app-remove-confirm-cid">{root?.toString()}</code>?
          </p>

          {shards.length > 0 && (
            <div className="app-remove-confirm-shards">
              <p className="app-remove-confirm-shards-title">The following shards will be removed:</p>
              <div className="app-remove-confirm-shards-list">
                <div className="app-remove-confirm-shard-item">
                  <span className="app-remove-confirm-shard-label">ROOT CID</span>
                  <code className="app-remove-confirm-shard-cid">{root?.toString()}</code>
                </div>
                {shards.map((shard, index) => (
                  <div key={shard.toString()} className="app-remove-confirm-shard-item">
                    <span className="app-remove-confirm-shard-label">Shard {index + 1}</span>
                    <code className="app-remove-confirm-shard-cid">{shard.toString()}</code>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="app-remove-confirm-warning">
            Any uploads using the same shards as those listed above will be corrupted. This cannot be undone.
          </p>

          <div className="app-remove-confirm-actions">
            <button
              className="app-remove-confirm-cancel-button"
              onClick={handleCancel}
              disabled={removing}
            >
              Cancel
            </button>
            <button
              className="app-remove-confirm-remove-button"
              onClick={handleConfirmRemove}
              disabled={removing}
            >
              {removing ? (
                <>
                  <span className="app-spinner"></span>
                  Removing...
                </>
              ) : (
                'Remove'
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <FileViewer.RemoveButton
      removeShards={true}
      renderButton={(onClick, loading) => (
        <button
          className={`app-danger-button ${loading ? 'loading' : ''}`}
          onClick={handleRemoveClick}
          disabled={loading || isLoading}
        >
          {loading ? (
            <>
              <span className="app-spinner"></span>
              Removing...
            </>
          ) : (
            <>
              <span>🗑️</span>
              Remove File
            </>
          )}
        </button>
      )}
      onRemove={onRemove}
    />
  )
}
