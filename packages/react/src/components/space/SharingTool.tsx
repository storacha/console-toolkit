import type { As, Props, Options } from 'ariakit-react-utils'
import type { ChangeEvent, ReactNode, CSSProperties } from 'react'

import React, {
  useState,
  createContext,
  useContext,
  useCallback,
  useMemo,
  useEffect,
} from 'react'
import { createElement } from 'ariakit-react-utils'
import { useW3, ContextState } from '../../providers/Provider.js'
import type { Space, SpaceDID, Delegation, Capabilities } from '@storacha/ui-core'
import * as DIDMailTo from '@storacha/did-mailto'
import { DID } from '@ucanto/core'

export type SharingToolContextState = ContextState & {
  /**
   * Current space being shared
   */
  space?: Space
  /**
   * Input value (email or DID)
   */
  value: string
  /**
   * List of shared emails/DIDs
   */
  sharedEmails: Array<{
    email: string
    capabilities: string[]
    delegation: Delegation<Capabilities>
    revoked?: boolean
  }>
  /**
   * Whether data is loading
   */
  isLoading: boolean
  /**
   * Whether sharing is in progress
   */
  isSharing: boolean
  /**
   * Error message if any
   */
  error?: string
}

export type SharingToolContextActions = {
  /**
   * Set input value
   */
  setValue: React.Dispatch<React.SetStateAction<string>>
  /**
   * Share space via email
   */
  shareViaEmail: (email: string) => Promise<void>
  /**
   * Share space via DID (creates UCAN delegation)
   */
  shareViaDID: (did: string) => Promise<string>
  /**
   * Revoke delegation
   */
  revokeDelegation: (email: string, delegation: Delegation<Capabilities>) => Promise<void>
  /**
   * Refresh shared list
   */
  refresh: () => Promise<void>
}

export type SharingToolContextValue = [
  state: SharingToolContextState,
  actions: SharingToolContextActions
]

export const SharingToolContextDefaultValue: SharingToolContextValue = [
  {
    accounts: [],
    spaces: [],
    client: undefined,
    value: '',
    sharedEmails: [],
    isLoading: false,
    isSharing: false,
  },
  {
    setValue: () => {
      throw new Error('missing setValue function')
    },
    shareViaEmail: async () => {
      throw new Error('missing shareViaEmail function')
    },
    shareViaDID: async () => {
      throw new Error('missing shareViaDID function')
    },
    revokeDelegation: async () => {
      throw new Error('missing revokeDelegation function')
    },
    refresh: async () => {
      throw new Error('missing refresh function')
    },
  },
]

export const SharingToolContext = createContext<SharingToolContextValue>(
  SharingToolContextDefaultValue
)

function isDID(value: string): boolean {
  try {
    DID.parse(value.trim())
    return true
  } catch {
    return false
  }
}

function isEmail(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return !isDID(value) && emailRegex.test(value)
}

export interface SharingToolProps {
  children?: ReactNode
  /**
   * Space to share
   */
  space?: Space
  /**
   * Space DID
   */
  spaceDID?: SpaceDID
  /**
   * Callback when space is shared
   */
  onShare?: (email: string) => void
  /**
   * Callback on error
   */
  onError?: (error: Error) => void
}

/**
 * Main SharingTool component that provides space sharing context
 */
export const SharingToolProvider = ({ 
  children,
  space: propSpace,
  spaceDID,
  onShare,
  onError,
}: SharingToolProps) => {
  const [state] = useW3()
  const { client, spaces } = state
  const [space] = useState<Space | undefined>(
    propSpace || (spaceDID ? spaces.find(s => s.did() === spaceDID) : undefined)
  )
  const [inputValue, setInputValue] = useState('')
  const [sharedEmails, setSharedEmails] = useState<Array<{
    email: string
    capabilities: string[]
    delegation: Delegation<Capabilities>
    revoked?: boolean
  }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [error, setError] = useState<string>()

  const loadSharedEmails = useCallback(async () => {
    if (!client || !space) {
      setSharedEmails([])
      return
    }

    try {
      setIsLoading(true)
      const delegations = client.delegations()
        .filter(d => d.capabilities.some(c => c.with === space.did()))
        .filter(d => d.audience.did().startsWith('did:mailto:'))
        .map(d => ({
          email: DIDMailTo.toEmail(DIDMailTo.fromString(d.audience.did())),
          capabilities: d.capabilities.map(c => c.can),
          delegation: d,
          revoked: false,
        }))
      
      setSharedEmails(delegations)
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load shared emails'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [client, space])

  useEffect(() => {
    if (space) {
      void loadSharedEmails()
    }
  }, [space, loadSharedEmails])

  const shareViaEmail = useCallback(async (email: string) => {
    if (!client || !space) {
      throw new Error('Client or space not available')
    }

    try {
      setIsSharing(true)
      setError(undefined)

      const delegatedEmail = DIDMailTo.email(email)
      const delegation: Delegation<Capabilities> = await client.shareSpace(delegatedEmail, space.did())
      
      const next = {
        email: delegatedEmail,
        capabilities: delegation.capabilities.map(c => c.can),
        delegation,
      }
      
      setSharedEmails(prev => [...prev, next])
      setInputValue('')
      onShare?.(email)
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error('Failed to share space')
      setError(error.message)
      onError?.(error)
      throw error
    } finally {
      setIsSharing(false)
    }
  }, [client, space, onShare, onError])

  const shareViaDID = useCallback(async (did: string): Promise<string> => {
    if (!client) {
      throw new Error('Client not available')
    }

    try {
      setIsSharing(true)
      setError(undefined)

      const audience = DID.parse(did.trim())
      const delegation = await client.createDelegation(audience, [
        'space/*',
        'store/*',
        'upload/*',
        'access/*',
        'usage/*',
        'filecoin/*',
      ], {
        expiration: Infinity,
      })

      const archiveRes = await delegation.archive()
      if (archiveRes.error) {
        const err = new Error('failed to archive delegation')
        ;(err as any).cause = archiveRes.error
        throw err
      }
      
      const blob = new Blob([archiveRes.ok as BlobPart])
      const url = URL.createObjectURL(blob)
      return url
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error('Failed to create delegation')
      setError(error.message)
      onError?.(error)
      throw error
    } finally {
      setIsSharing(false)
    }
  }, [client, onError])

  const revokeDelegation = useCallback(async (email: string, delegation: Delegation<Capabilities>) => {
    if (!client) {
      throw new Error('Client not available')
    }

    try {
      setIsSharing(true)
      await client.revokeDelegation(delegation.cid)
      
      setSharedEmails(prev => prev.map(item => 
        item.email === email ? { ...item, revoked: true } : item
      ))
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error('Failed to revoke delegation')
      setError(error.message)
      onError?.(error)
      throw error
    } finally {
      setIsSharing(false)
    }
  }, [client, onError])

  const refresh = useCallback(async () => {
    await loadSharedEmails()
  }, [loadSharedEmails])

  const contextValue = useMemo<SharingToolContextValue>(
    () => [
      {
        ...state,
        space,
        value: inputValue,
        sharedEmails,
        isLoading,
        isSharing,
        error,
      },
      {
        setValue: setInputValue,
        shareViaEmail,
        shareViaDID,
        revokeDelegation,
        refresh,
      },
    ],
    [state, space, inputValue, sharedEmails, isLoading, isSharing, error, shareViaEmail, shareViaDID, revokeDelegation, refresh]
  )

  return (
    <SharingToolContext.Provider value={contextValue}>
      {children}
    </SharingToolContext.Provider>
  )
}

export type SharingToolFormOptions<T extends As = 'form'> = Options<T> & {
  /**
   * Additional CSS class names
   */
  className?: string
  /**
   * Inline styles
   */
  style?: CSSProperties
  /**
   * Render prop for input
   */
  renderInput?: () => ReactNode
  /**
   * Render prop for submit button
   */
  renderSubmitButton?: (disabled: boolean) => ReactNode
  /**
   * Callback when form is submitted
   */
  onSubmit?: (value: string, isEmail: boolean, isDID: boolean) => void
}

export type SharingToolFormProps<T extends As = 'form'> = Props<
  SharingToolFormOptions<T>
>

export const SharingToolForm = ({ 
  className,
  style,
  renderInput,
  renderSubmitButton,
  onSubmit,
  children,
  ...formProps 
}: SharingToolFormProps) => {
  const [{ value, isSharing }, { shareViaEmail, shareViaDID }] = useSharingToolContext()

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmedValue = value.trim()
    
    if (isDID(trimmedValue)) {
      try {
        const url = await shareViaDID(trimmedValue)
        const link = document.createElement('a')
        link.href = url
        link.download = `did-${trimmedValue.split(':')[1]}-${trimmedValue.split(':')[2]?.substring(0, 10)}.ucan`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        onSubmit?.(trimmedValue, false, true)
      } catch (err) {
        // Error handled in context
      }
    } else if (isEmail(trimmedValue)) {
      try {
        await shareViaEmail(trimmedValue)
        onSubmit?.(trimmedValue, true, false)
      } catch (err) {
        // Error handled in context
      }
    }
  }, [value, shareViaEmail, shareViaDID, onSubmit])

  const defaultRenderInput = () => (
    <SharingToolInput placeholder="Email or DID" />
  )

  const defaultRenderSubmitButton = (disabled: boolean) => (
    <button type="submit" disabled={disabled}>
      Share
    </button>
  )

  const formContent = (
    <form 
      {...formProps} 
      onSubmit={handleSubmit}
      className={className}
      style={style}
    >
      {(children as ReactNode) || (
        <>
          {renderInput ? renderInput() : defaultRenderInput()}
          {renderSubmitButton ? renderSubmitButton(isSharing) : defaultRenderSubmitButton(isSharing)}
        </>
      )}
    </form>
  )

  return formContent
}

export type SharingToolInputOptions<T extends As = 'input'> = Options<T> & {
  /**
   * Additional CSS class names
   */
  className?: string
  /**
   * Inline styles
   */
  style?: CSSProperties
}

export type SharingToolInputProps<T extends As = 'input'> = Props<
  SharingToolInputOptions<T>
>

export const SharingToolInput = ({ className, style, ...props }: SharingToolInputProps) => {
  const [{ value }, { setValue }] = useSharingToolContext()
  
  return createElement('input', {
    ...props,
    type: 'text',
    value: value,
    onChange: (e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value),
    className,
    style,
  })
}

export type SharingToolSharedListOptions<T extends As = 'div'> = Options<T> & {
  /**
   * Additional CSS class names
   */
  className?: string
  /**
   * Inline styles
   */
  style?: CSSProperties
  /**
   * Render prop for each shared item
   */
  renderItem?: (item: {
    email: string
    capabilities: string[]
    delegation: Delegation<Capabilities>
    revoked?: boolean
  }, index: number) => ReactNode
}

export type SharingToolSharedListProps<T extends As = 'div'> = Props<
  SharingToolSharedListOptions<T>
>

export const SharingToolSharedList = ({ 
  className,
  style,
  renderItem,
  ...divProps 
}: SharingToolSharedListProps) => {
  const [{ sharedEmails }] = useSharingToolContext()

  if (sharedEmails.length === 0) {
    return null
  }

  const content = sharedEmails.map((item, index) => {
    if (renderItem) {
      return renderItem(item, index)
    }
    return (
      <div key={item.email}>
        {item.email} {item.revoked ? '(Revoked)' : ''}
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

export function useSharingToolContext(): SharingToolContextValue {
  return useContext(SharingToolContext)
}

export const SharingTool = Object.assign(SharingToolProvider, {
  Form: SharingToolForm,
  Input: SharingToolInput,
  SharedList: SharingToolSharedList,
})

