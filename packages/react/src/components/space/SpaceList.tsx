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
import type { Space, SpaceDID, UnknownLink, UploadListSuccess } from '@storacha/ui-core'

export type SpaceListContextState = ContextState & {
  /**
   * Current space being listed
   */
  space?: Space
  /**
   * Uploads/items in the space
   */
  uploads: UploadListSuccess['results']
  /**
   * Whether data is loading
   */
  isLoading: boolean
  /**
   * Whether data is being validated/refreshed
   */
  isValidating: boolean
  /**
   * Pagination cursor for next page
   */
  nextCursor?: string
  /**
   * Pagination cursor for previous page
   */
  prevCursor?: string
  /**
   * Error message if any
   */
  error?: string
}

export type SpaceListContextActions = {
  /**
   * Refresh the list
   */
  refresh: () => Promise<void>
  /**
   * Load next page
   */
  loadNext: () => Promise<void>
  /**
   * Load previous page
   */
  loadPrev: () => Promise<void>
  /**
   * Set the space to list
   */
  setSpace: (space: Space | undefined) => void
}

export type SpaceListContextValue = [
  state: SpaceListContextState,
  actions: SpaceListContextActions
]

export const SpaceListContextDefaultValue: SpaceListContextValue = [
  {
    accounts: [],
    spaces: [],
    client: undefined,
    uploads: [],
    isLoading: false,
    isValidating: false,
  },
  {
    refresh: async () => {
      throw new Error('missing refresh function')
    },
    loadNext: async () => {
      throw new Error('missing loadNext function')
    },
    loadPrev: async () => {
      throw new Error('missing loadPrev function')
    },
    setSpace: () => {
      throw new Error('missing setSpace function')
    },
  },
]

export const SpaceListContext = createContext<SpaceListContextValue>(
  SpaceListContextDefaultValue
)

export interface SpaceListProps {
  children?: ReactNode
  /**
   * Space to list content for
   */
  space?: Space
  /**
   * Space DID to list content for
   */
  spaceDID?: SpaceDID
  /**
   * Page size for pagination
   */
  pageSize?: number
  /**
   * Callback when an item is selected
   */
  onItemSelect?: (root: UnknownLink) => void
}

/**
 * Main SpaceList component that provides space content listing context
 */
export const SpaceListProvider = ({
  children,
  space: propSpace,
  spaceDID,
  pageSize = 15,
  onItemSelect: _onItemSelect,
}: SpaceListProps) => {
  const [state] = useW3()
  const { client, spaces } = state
  const initialSpace = propSpace || (spaceDID ? spaces.find(s => s.did() === spaceDID) : undefined)
  const [space, setSpaceState] = useState<Space | undefined>(initialSpace)
  const [uploads, setUploads] = useState<UploadListSuccess['results']>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [cursor, setCursor] = useState<string | undefined>()
  const [nextCursor, setNextCursor] = useState<string | undefined>()
  const [prevCursor, setPrevCursor] = useState<string | undefined>()
  const [error, setError] = useState<string>()

  const setSpace = useCallback((newSpace: Space | undefined) => {
    setSpaceState(newSpace)
    setCursor(undefined)
    setNextCursor(undefined)
    setPrevCursor(undefined)
  }, [])

  const fetchUploads = useCallback(async (currentCursor?: string, isPrev = false) => {
    if (!client || !space) {
      setUploads([])
      return
    }

    try {
      if (isValidating) {
        setIsValidating(true)
      } else {
        setIsLoading(true)
      }
      setError(undefined)

      if (client.currentSpace()?.did() !== space.did()) {
        await client.setCurrentSpace(space.did())
      }

      const result = await client.capability.upload.list({
        cursor: currentCursor,
        pre: isPrev,
        size: pageSize,
      })

      setUploads(result.results)
      setNextCursor(result.after)
      setPrevCursor(result.before)
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load uploads'
      setError(errorMessage)
      setUploads([])
    } finally {
      setIsLoading(false)
      setIsValidating(false)
    }
  }, [client, space, pageSize, isValidating])

  // Update space when prop changes
  useEffect(() => {
    if (propSpace) {
      setSpaceState(propSpace)
    } else if (spaceDID) {
      const foundSpace = spaces.find(s => s.did() === spaceDID)
      setSpaceState(foundSpace)
    }
  }, [propSpace, spaceDID, spaces])

  // Fetch uploads when space changes
  useEffect(() => {
    if (space) {
      setIsLoading(true)
      void fetchUploads()
    } else {
      setUploads([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [space])

  const refresh = useCallback(async () => {
    await fetchUploads(cursor)
  }, [fetchUploads, cursor])

  const loadNext = useCallback(async () => {
    if (nextCursor) {
      setCursor(nextCursor)
      await fetchUploads(nextCursor, false)
    }
  }, [nextCursor, fetchUploads])

  const loadPrev = useCallback(async () => {
    if (prevCursor) {
      setCursor(prevCursor)
      await fetchUploads(prevCursor, true)
    }
  }, [prevCursor, fetchUploads])

  const value = useMemo<SpaceListContextValue>(
    () => [
      {
        ...state,
        space,
        uploads,
        isLoading,
        isValidating,
        nextCursor,
        prevCursor,
        error,
      },
      {
        refresh,
        loadNext,
        loadPrev,
        setSpace,
      },
    ],
    [state, space, uploads, isLoading, isValidating, nextCursor, prevCursor, error, refresh, loadNext, loadPrev, setSpace]
  )

  return (
    <SpaceListContext.Provider value={value}>
      {children}
    </SpaceListContext.Provider>
  )
}

export type SpaceListListOptions<T extends As = 'div'> = Options<T> & {
  /**
   * Additional CSS class names
   */
  className?: string
  /**
   * Inline styles
   */
  style?: CSSProperties
  /**
   * Render prop for each upload item
   */
  renderItem?: (upload: UploadListSuccess['results'][0], index: number) => ReactNode
  /**
   * Render prop for empty state
   */
  renderEmpty?: () => ReactNode
  /**
   * Render prop for loading state
   */
  renderLoading?: () => ReactNode
  /**
   * Callback when an item is clicked
   */
  onItemClick?: (root: UnknownLink) => void
}

export type SpaceListListProps<T extends As = 'div'> = Props<
  SpaceListListOptions<T>
>

export const SpaceListList = ({ 
  className,
  style,
  renderItem,
  renderEmpty,
  renderLoading,
  onItemClick,
  ...divProps 
}: SpaceListListProps) => {
  const [{ uploads, isLoading }] = useSpaceListContext()

  const handleClick = useCallback((root: UnknownLink) => {
    onItemClick?.(root)
  }, [onItemClick])

  if (isLoading) {
    return renderLoading ? <>{renderLoading()}</> : <div>Loading...</div>
  }

  if (uploads.length === 0) {
    return renderEmpty ? <>{renderEmpty()}</> : <div>No uploads found</div>
  }

  const content = uploads.map((upload, index) => {
    if (renderItem) {
      return renderItem(upload, index)
    }
    return (
      <div
        key={upload.root.toString()}
        onClick={() => handleClick(upload.root)}
        style={{ cursor: 'pointer' }}
      >
        {upload.root.toString()}
      </div>
    )
  })

  return createElement('div', {
    ...divProps,
    className,
    style,
    children: content,
  })
}

export type SpaceListPaginationOptions<T extends As = 'nav'> = Options<T> & {
  /**
   * Additional CSS class names
   */
  className?: string
  /**
   * Inline styles
   */
  style?: CSSProperties
  /**
   * Render prop for previous button
   */
  renderPrevButton?: (disabled: boolean, onClick: () => void) => ReactNode
  /**
   * Render prop for next button
   */
  renderNextButton?: (disabled: boolean, onClick: () => void) => ReactNode
  /**
   * Render prop for refresh button
   */
  renderRefreshButton?: (loading: boolean, onClick: () => void) => ReactNode
}

export type SpaceListPaginationProps<T extends As = 'nav'> = Props<
  SpaceListPaginationOptions<T>
>

export const SpaceListPagination = ({ 
  className,
  style,
  renderPrevButton,
  renderNextButton,
  renderRefreshButton,
  ...navProps 
}: SpaceListPaginationProps) => {
  const [{ isLoading, isValidating, nextCursor, prevCursor }, { loadNext, loadPrev, refresh }] = useSpaceListContext()

  const defaultRenderPrevButton = (disabled: boolean, onClick: () => void) => (
    <button onClick={onClick} disabled={disabled}>
      Previous
    </button>
  )

  const defaultRenderNextButton = (disabled: boolean, onClick: () => void) => (
    <button onClick={onClick} disabled={disabled}>
      Next
    </button>
  )

  const defaultRenderRefreshButton = (loading: boolean, onClick: () => void) => (
    <button onClick={onClick} disabled={loading}>
      {loading ? 'Loading...' : 'Refresh'}
    </button>
  )

  const content = (
    <>
      {renderPrevButton ? renderPrevButton(!prevCursor || isLoading, loadPrev) : defaultRenderPrevButton(!prevCursor || isLoading, loadPrev)}
      {renderRefreshButton ? renderRefreshButton(isLoading || isValidating, refresh) : defaultRenderRefreshButton(isLoading || isValidating, refresh)}
      {renderNextButton ? renderNextButton(!nextCursor || isLoading, loadNext) : defaultRenderNextButton(!nextCursor || isLoading, loadNext)}
    </>
  )

  return createElement('nav', {
    ...navProps,
    className,
    style,
    children: content,
  })
}

export function useSpaceListContext(): SpaceListContextValue {
  return useContext(SpaceListContext)
}

export const SpaceList = Object.assign(SpaceListProvider, {
  List: SpaceListList,
  Pagination: SpaceListPagination,
})

