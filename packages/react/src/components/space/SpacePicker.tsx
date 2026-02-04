import type { As, Props, Options } from 'ariakit-react-utils'
import type { ReactNode, CSSProperties } from 'react'

import React, {
  useState,
  createContext,
  useContext,
  useCallback,
  useMemo,
} from 'react'
import { createElement } from 'ariakit-react-utils'
import { useW3, ContextState } from '../../providers/Provider.js'
import type { Space, SpaceDID } from '@storacha/ui-core'

export type SpacePickerContextState = ContextState & {
  /**
   * Currently selected space
   */
  selectedSpace?: Space
  /**
   * Filter query for searching spaces
   */
  query: string
  /**
   * Filtered spaces based on query
   */
  filteredSpaces: Space[]
  /**
   * Public spaces
   */
  publicSpaces: Space[]
  /**
   * Private spaces
   */
  privateSpaces: Space[]
}

export type SpacePickerContextActions = {
  /**
   * Set the selected space
   */
  setSelectedSpace: (space: Space | undefined) => void
  /**
   * Set the search query
   */
  setQuery: React.Dispatch<React.SetStateAction<string>>
  /**
   * Select a space by DID
   */
  selectSpaceByDID: (did: SpaceDID) => void
}

export type SpacePickerContextValue = [
  state: SpacePickerContextState,
  actions: SpacePickerContextActions
]

export const SpacePickerContextDefaultValue: SpacePickerContextValue = [
  {
    accounts: [],
    spaces: [],
    client: undefined,
    selectedSpace: undefined,
    query: '',
    filteredSpaces: [],
    publicSpaces: [],
    privateSpaces: [],
  },
  {
    setSelectedSpace: () => {
      throw new Error('missing setSelectedSpace function')
    },
    setQuery: () => {
      throw new Error('missing setQuery function')
    },
    selectSpaceByDID: () => {
      throw new Error('missing selectSpaceByDID function')
    },
  },
]

export const SpacePickerContext = createContext<SpacePickerContextValue>(
  SpacePickerContextDefaultValue
)

export interface SpacePickerProps {
  children?: ReactNode
  /**
   * Initial selected space DID
   */
  initialSpaceDID?: SpaceDID
  /**
   * Callback when space is selected
   */
  onSpaceSelect?: (space: Space) => void
}

/**
 * Main SpacePicker component that provides space selection context
 */
export const SpacePickerProvider = ({ 
  children, 
  initialSpaceDID,
  onSpaceSelect 
}: SpacePickerProps) => {
  const [state] = useW3()
  const { spaces } = state
  const [selectedSpace, setSelectedSpaceState] = useState<Space | undefined>(
    initialSpaceDID ? spaces.find(s => s.did() === initialSpaceDID) : undefined
  )
  const [query, setQuery] = useState('')

  const filteredSpaces = useMemo(() => {
    if (!query) return spaces
    const lowerQuery = query.toLowerCase().replace(/\s+/g, '')
    return spaces.filter((space: Space) =>
      (space.name || space.did())
        .toLowerCase()
        .replace(/\s+/g, '')
        .includes(lowerQuery)
    )
  }, [spaces, query])

  const publicSpaces = useMemo(() => {
    return filteredSpaces
      .filter(space => space.access?.type !== 'private')
      .sort((a, b) => {
        const nameA = (a.name || a.did()).toLowerCase()
        const nameB = (b.name || b.did()).toLowerCase()
        return nameA.localeCompare(nameB)
      })
  }, [filteredSpaces])

  const privateSpaces = useMemo(() => {
    return filteredSpaces
      .filter(space => space.access?.type === 'private')
      .sort((a, b) => {
        const nameA = (a.name || a.did()).toLowerCase()
        const nameB = (b.name || b.did()).toLowerCase()
        return nameA.localeCompare(nameB)
      })
  }, [filteredSpaces])

  const setSelectedSpace = useCallback((space: Space | undefined) => {
    setSelectedSpaceState(space)
    if (space) {
      onSpaceSelect?.(space)
    }
  }, [onSpaceSelect])

  const selectSpaceByDID = useCallback((did: SpaceDID) => {
    const space = spaces.find(s => s.did() === did)
    if (space) {
      setSelectedSpace(space)
    }
  }, [spaces, setSelectedSpace])

  const value = useMemo<SpacePickerContextValue>(
    () => [
      {
        ...state,
        selectedSpace,
        query,
        filteredSpaces,
        publicSpaces,
        privateSpaces,
      },
      {
        setSelectedSpace,
        setQuery,
        selectSpaceByDID,
      },
    ],
    [state, selectedSpace, query, filteredSpaces, publicSpaces, privateSpaces, setSelectedSpace, selectSpaceByDID]
  )

  return (
    <SpacePickerContext.Provider value={value}>
      {children}
    </SpacePickerContext.Provider>
  )
}

export type SpacePickerListOptions<T extends As = 'div'> = Options<T> & {
  /**
   * Space type to filter ('public' | 'private' | 'all')
   */
  type?: 'public' | 'private' | 'all'
  /**
   * Additional CSS class names
   */
  className?: string
  /**
   * Inline styles
   */
  style?: CSSProperties
  /**
   * Render prop for each space item
   */
  renderItem?: (space: Space, index: number) => ReactNode
  /**
   * Render prop for empty state
   */
  renderEmpty?: () => ReactNode
  /**
   * Callback when a space is clicked
   */
  onSpaceClick?: (space: Space) => void
}

export type SpacePickerListProps<T extends As = 'div'> = Props<
  SpacePickerListOptions<T>
>

export const SpacePickerList = ({ 
  type = 'all',
  className,
  style,
  renderItem,
  renderEmpty,
  onSpaceClick,
  ...divProps 
}: SpacePickerListProps) => {
  const [{ publicSpaces, privateSpaces }] = useSpacePickerContext()

  const spacesToShow = type === 'public' 
    ? publicSpaces 
    : type === 'private' 
    ? privateSpaces 
    : [...publicSpaces, ...privateSpaces]

  const handleClick = useCallback((space: Space) => {
    onSpaceClick?.(space)
  }, [onSpaceClick])

  if (spacesToShow.length === 0) {
    return renderEmpty ? <>{renderEmpty()}</> : null
  }

  const content = spacesToShow.map((space, index) => {
    if (renderItem) {
      const item = renderItem(space, index)
      // Ensure the item has a key
      if (React.isValidElement(item) && item.key) {
        return item
      }
      return <React.Fragment key={space.did()}>{item}</React.Fragment>
    }
    return (
      <div
        key={space.did()}
        onClick={() => handleClick(space)}
        style={{ cursor: 'pointer' }}
      >
        {space.name || space.did()}
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

export type SpacePickerSearchOptions<T extends As = 'input'> = Options<T> & {
  /**
   * Additional CSS class names
   */
  className?: string
  /**
   * Inline styles
   */
  style?: CSSProperties
  /**
   * Placeholder text
   */
  placeholder?: string
}

export type SpacePickerSearchProps<T extends As = 'input'> = Props<
  SpacePickerSearchOptions<T>
>

export const SpacePickerSearch = ({ 
  className, 
  style, 
  placeholder = 'Search spaces...',
  ...inputProps 
}: SpacePickerSearchProps) => {
  const [{ query }, { setQuery }] = useSpacePickerContext()
  
  return createElement('input', {
    ...inputProps,
    type: 'search',
    value: query,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value),
    placeholder,
    className,
    style,
  })
}

export function useSpacePickerContext(): SpacePickerContextValue {
  return useContext(SpacePickerContext)
}

export const SpacePicker = Object.assign(SpacePickerProvider, {
  List: SpacePickerList,
  Search: SpacePickerSearch,
})

