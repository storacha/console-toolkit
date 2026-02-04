import type { As, Props, Options } from 'ariakit-react-utils'
import type { ReactNode, CSSProperties } from 'react'

import {
  useState,
  createContext,
  useContext,
  useCallback,
  useMemo,
  useEffect,
} from 'react'
import { createElement } from 'ariakit-react-utils'
import { useW3, ContextState } from '../../providers/Provider.js'
import type { Space, SpaceDID, UnknownLink, UploadGetSuccess, CARLink } from '@storacha/ui-core'
import { parse as parseLink } from 'multiformats/link'

export type FileViewerContextState = ContextState & {
  /**
   * Current space
   */
  space?: Space
  /**
   * Root CID being viewed
   */
  root?: UnknownLink
  /**
   * Upload data
   */
  upload?: UploadGetSuccess
  /**
   * Whether data is loading
   */
  isLoading: boolean
  /**
   * Error message if any
   */
  error?: string
}

export type FileViewerContextActions = {
  /**
   * Set the root CID to view
   */
  setRoot: (root: UnknownLink) => void
  /**
   * Refresh upload data
   */
  refresh: () => Promise<void>
  /**
   * Remove the upload
   */
  remove: (options?: { shards?: boolean }) => Promise<void>
}

export type FileViewerContextValue = [
  state: FileViewerContextState,
  actions: FileViewerContextActions
]

export const FileViewerContextDefaultValue: FileViewerContextValue = [
  {
    accounts: [],
    spaces: [],
    client: undefined,
    isLoading: false,
  },
  {
    setRoot: () => {
      throw new Error('missing setRoot function')
    },
    refresh: async () => {
      throw new Error('missing refresh function')
    },
    remove: async () => {
      throw new Error('missing remove function')
    },
  },
]

export const FileViewerContext = createContext<FileViewerContextValue>(
  FileViewerContextDefaultValue
)

export interface FileViewerProps {
  children?: ReactNode
  /**
   * Space to view file in
   */
  space?: Space
  /**
   * Space DID
   */
  spaceDID?: SpaceDID
  /**
   * Root CID to view
   */
  root?: UnknownLink | string
  /**
   * Callback when file is removed (deprecated - use onRemove in RemoveButton)
   */
  onRemove?: () => void
  /**
   * Callback on error
   */
  onError?: (error: Error) => void
}

/**
 * Main FileViewer component that provides file viewing context
 */
export const FileViewerProvider = ({ 
  children,
  space: propSpace,
  spaceDID,
  root: propRoot,
  onRemove,
  onError,
}: FileViewerProps) => {
  const [state] = useW3()
  const { client, spaces } = state
  const [space] = useState<Space | undefined>(
    propSpace || (spaceDID ? spaces.find(s => s.did() === spaceDID) : undefined)
  )
  const [root, setRootState] = useState<UnknownLink | undefined>(
    propRoot ? (typeof propRoot === 'string' ? parseLink(propRoot) : propRoot) : undefined
  )
  const [upload, setUpload] = useState<UploadGetSuccess>()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>()

  const setRoot = useCallback((newRoot: UnknownLink) => {
    setRootState(newRoot)
  }, [])

  const fetchUpload = useCallback(async () => {
    if (!client || !space || !root) {
      setUpload(undefined)
      return
    }

    try {
      setIsLoading(true)
      setError(undefined)

      if (client.currentSpace()?.did() !== space.did()) {
        await client.setCurrentSpace(space.did())
      }

      const result = await client.capability.upload.get(root)
      setUpload(result)
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load upload'
      setError(errorMessage)
      const error = new Error(errorMessage)
      onError?.(error)
    } finally {
      setIsLoading(false)
    }
  }, [client, space, root, onError])

  useEffect(() => {
    if (space && root) {
      void fetchUpload()
    } else {
      setUpload(undefined)
    }
  }, [space, root])

  const refresh = useCallback(async () => {
    await fetchUpload()
  }, [fetchUpload])

  const remove = useCallback(async (options?: { shards?: boolean }) => {
    if (!client || !root) {
      throw new Error('Client or root not available')
    }

    try {
      await client.remove(root, options)
      onRemove?.()
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error('Failed to remove upload')
      setError(error.message)
      onError?.(error)
      throw error
    }
  }, [client, root, onRemove, onError])

  const value = useMemo<FileViewerContextValue>(
    () => [
      {
        ...state,
        space,
        root,
        upload,
        isLoading,
        error,
      },
      {
        setRoot,
        refresh,
        remove,
      },
    ],
    [state, space, root, upload, isLoading, error, setRoot, refresh, remove]
  )

  return (
    <FileViewerContext.Provider value={value}>
      {children}
    </FileViewerContext.Provider>
  )
}

export type FileViewerRootOptions<T extends As = 'div'> = Options<T> & {
  /**
   * Additional CSS class names
   */
  className?: string
  /**
   * Inline styles
   */
  style?: CSSProperties
  /**
   * Render prop for root CID display
   */
  renderRoot?: (root: UnknownLink) => ReactNode
}

export type FileViewerRootProps<T extends As = 'div'> = Props<
  FileViewerRootOptions<T>
>

export const FileViewerRoot = ({ 
  className,
  style,
  renderRoot,
  ...divProps 
}: FileViewerRootProps) => {
  const [{ root, isLoading }] = useFileViewerContext()

  if (isLoading || !root) {
    return null
  }

  const content = renderRoot ? renderRoot(root) : root.toString()

  return createElement('div', {
    ...divProps,
    className,
    style,
    children: content,
  })
}

export type FileViewerURLOptions<T extends As = 'div'> = Options<T> & {
  /**
   * Additional CSS class names
   */
  className?: string
  /**
   * Inline styles
   */
  style?: CSSProperties
  /**
   * Gateway URL template
   */
  gatewayURL?: (cid: UnknownLink) => string
  /**
   * Render prop for URL display
   */
  renderURL?: (url: string) => ReactNode
}

export type FileViewerURLProps<T extends As = 'div'> = Props<
  FileViewerURLOptions<T>
>

export const FileViewerURL = ({ 
  className,
  style,
  gatewayURL,
  renderURL,
  ...divProps 
}: FileViewerURLProps) => {
  const [{ root }] = useFileViewerContext()

  if (!root) {
    return null
  }

  const defaultGatewayURL = (cid: UnknownLink) => 
    `https://${cid.toString()}.ipfs.w3s.link/`

  const url = gatewayURL ? gatewayURL(root) : defaultGatewayURL(root)
  const content = renderURL ? renderURL(url) : url

  return createElement('div', {
    ...divProps,
    className,
    style,
    children: content,
  })
}

export type FileViewerShardsOptions<T extends As = 'div'> = Options<T> & {
  /**
   * Additional CSS class names
   */
  className?: string
  /**
   * Inline styles
   */
  style?: CSSProperties
  /**
   * Render prop for each shard
   */
  renderShard?: (shard: CARLink, index: number) => ReactNode
  /**
   * Render prop for loading state
   */
  renderLoading?: () => ReactNode
}

export type FileViewerShardsProps<T extends As = 'div'> = Props<
  FileViewerShardsOptions<T>
>

export const FileViewerShards = ({ 
  className,
  style,
  renderShard,
  renderLoading,
  ...divProps 
}: FileViewerShardsProps) => {
  const [{ upload, isLoading }] = useFileViewerContext()

  if (isLoading) {
    return renderLoading ? <>{renderLoading()}</> : <div>Loading shards...</div>
  }

  if (!upload?.shards || upload.shards.length === 0) {
    return null
  }

  const content = upload.shards.map((shard, index) => {
    if (renderShard) {
      return renderShard(shard, index)
    }
    return <div key={shard.toString()}>{shard.toString()}</div>
  })

  return createElement('div', {
    ...divProps,
    className,
    style,
    children: content,
  })
}

export type FileViewerRemoveButtonOptions<T extends As = 'button'> = Options<T> & {
  /**
   * Additional CSS class names
   */
  className?: string
  /**
   * Inline styles
   */
  style?: CSSProperties
  /**
   * Whether to remove shards as well
   */
  removeShards?: boolean
  /**
   * Callback when file is removed
   */
  onRemove?: () => void
  /**
   * Render prop for button content
   */
  renderButton?: (onClick: () => void, loading: boolean) => ReactNode
}

export type FileViewerRemoveButtonProps<T extends As = 'button'> = Props<
  FileViewerRemoveButtonOptions<T>
>

export const FileViewerRemoveButton = ({ 
  className,
  style,
  removeShards = false,
  onRemove,
  renderButton,
  ...buttonProps 
}: FileViewerRemoveButtonProps) => {
  const [{ isLoading }, { remove }] = useFileViewerContext()
  const [removing, setRemoving] = useState(false)

  const handleClick = useCallback(async () => {
    try {
      setRemoving(true)
      await remove({ shards: removeShards })
      onRemove?.()
    } catch (err) {
      // Error handled in context
    } finally {
      setRemoving(false)
    }
  }, [remove, removeShards, onRemove])

  const loading = isLoading || removing

  if (renderButton) {
    return <>{renderButton(handleClick, loading)}</>
  }

  return createElement('button', {
    ...buttonProps,
    onClick: handleClick,
    disabled: loading,
    className,
    style,
    children: loading ? 'Removing...' : 'Remove',
  })
}

export function useFileViewerContext(): FileViewerContextValue {
  return useContext(FileViewerContext)
}

export const FileViewer = Object.assign(FileViewerProvider, {
  Root: FileViewerRoot,
  URL: FileViewerURL,
  Shards: FileViewerShards,
  RemoveButton: FileViewerRemoveButton,
})

