import type { As, Props, Options } from 'ariakit-react-utils'
import type { ChangeEvent, ReactNode, CSSProperties } from 'react'

import React, {
  useState,
  createContext,
  useContext,
  useCallback,
  useMemo,
} from 'react'
import { createElement } from 'ariakit-react-utils'
import { useW3, ContextState } from '../../providers/Provider.js'
import type { Capabilities, Space } from '@storacha/ui-core'
import * as Delegation from '@ucanto/core/delegation'

export type ImportSpaceContextState = ContextState & {
  /**
   * User's DID
   */
  userDID?: string
  /**
   * UCAN token input value
   */
  ucanValue: string
  /**
   * Whether import is in progress
   */
  isImporting: boolean
  /**
   * Error message if any
   */
  error?: string
  /**
   * Success message if import succeeded
   */
  success?: string
  /**
   * Imported space if import succeeded
   */
  importedSpace?: Space
}

export type ImportSpaceContextActions = {
  /**
   * Set UCAN token input value
   */
  setUcanValue: React.Dispatch<React.SetStateAction<string>>
  /**
   * Copy user DID to clipboard
   */
  copyDID: () => Promise<void>
  /**
   * Email user DID
   */
  emailDID: () => void
  /**
   * Import UCAN token (from string or File)
   */
  importUCAN: (ucanToken: string | File) => Promise<Space | undefined>
  /**
   * Clear error/success messages
   */
  clearMessages: () => void
}

export type ImportSpaceContextValue = [
  state: ImportSpaceContextState,
  actions: ImportSpaceContextActions
]

export const ImportSpaceContextDefaultValue: ImportSpaceContextValue = [
  {
    accounts: [],
    spaces: [],
    client: undefined,
    userDID: undefined,
    ucanValue: '',
    isImporting: false,
  },
  {
    setUcanValue: () => {
      throw new Error('missing setUcanValue function')
    },
    copyDID: async () => {
      throw new Error('missing copyDID function')
    },
    emailDID: () => {
      throw new Error('missing emailDID function')
    },
    importUCAN: async (_ucanToken: string | File) => {
      throw new Error('missing importUCAN function')
    },
    clearMessages: () => {
      throw new Error('missing clearMessages function')
    },
  },
]

export const ImportSpaceContext = createContext<ImportSpaceContextValue>(
  ImportSpaceContextDefaultValue
)

export interface ImportSpaceProps {
  children?: ReactNode
  /**
   * Callback when space is successfully imported
   */
  onImport?: (space: Space) => void
  /**
   * Callback on error
   */
  onError?: (error: Error) => void
}

/**
 * Main ImportSpace component that provides space import context
 */
export const ImportSpaceProvider = ({
  children,
  onImport,
  onError,
}: ImportSpaceProps) => {
  const [state] = useW3()
  const { client, accounts, spaces } = state
  const [ucanValue, setUcanValue] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string>()
  const [success, setSuccess] = useState<string>()
  const [importedSpace, setImportedSpace] = useState<Space>()

  const userDID = useMemo(() => {
    if (!client) return undefined
    try {
      return client.agent.did()
    } catch {
      return undefined
    }
  }, [client])

  const copyDID = useCallback(async () => {
    if (!userDID) {
      throw new Error('User DID not available')
    }

    try {
      await navigator.clipboard.writeText(userDID)
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error('Failed to copy DID')
      setError(error.message)
      onError?.(error)
      throw error
    }
  }, [userDID, onError])

  const emailDID = useCallback(() => {
    if (!userDID) {
      setError('User DID not available')
      return
    }

    const subject = encodeURIComponent('My Storacha DID')
    const body = encodeURIComponent(
      `Hi,\n\nHere is my Storacha DID:\n\n${userDID}\n\nPlease create a UCAN delegation for me to access your space.`
    )
    const mailtoLink = `mailto:?subject=${subject}&body=${body}`
    window.location.href = mailtoLink
  }, [userDID])

  const importUCAN = useCallback(
    async (ucanToken: string | File): Promise<Space | undefined> => {
      if (!client) {
        throw new Error('Client not available')
      }

      try {
        setIsImporting(true)
        setError(undefined)
        setSuccess(undefined)

        let bytes: Uint8Array

        if (ucanToken instanceof File) {
          const arrayBuffer = await ucanToken.arrayBuffer()
          bytes = new Uint8Array(arrayBuffer)
        } else {
          if (!ucanToken.trim()) {
            throw new Error('UCAN token is required')
          }
          try {
            bytes = Uint8Array.from(atob(ucanToken.trim()), (c) => c.charCodeAt(0))
          } catch {
            bytes = new TextEncoder().encode(ucanToken.trim())
          }
        }

        if (bytes.length === 0) {
          throw new Error('UCAN file is empty')
        }

        if (bytes.length < 11) {
          throw new Error('File is too small to be a valid CAR archive (minimum 11 bytes)')
        }

        let delegation: Delegation.Delegation<Capabilities>
        try {
          const extractResult = await Delegation.extract(bytes)

          if (extractResult.error) {
            const errorMsg = extractResult.error.message || String(extractResult.error)
            if (errorMsg.includes('CBOR decode error') || errorMsg.includes('too many terminals')) {
              throw new Error(`Invalid CAR file format: The file may be corrupted, not a valid CAR archive, or in an unsupported format. Please ensure the file was created using the Storacha console or CLI. Original error: ${errorMsg}`)
            }
            throw new Error(`Failed to extract delegation: ${errorMsg}`)
          }

          delegation = extractResult.ok as Delegation.Delegation<Capabilities>
        } catch (parseError: any) {
          const errorMessage = parseError.message || String(parseError)
          if (errorMessage.includes('CBOR decode error') || errorMessage.includes('too many terminals')) {
            throw new Error(`Invalid CAR file format: The file may be corrupted or not a valid CAR archive. Please ensure you're importing a .ucan or .car file created by the Storacha console. Original error: ${errorMessage}`)
          }
          throw new Error(`Invalid UCAN format: ${errorMessage}`)
        }

        const addResult = await client.capability.access.delegate({
          delegations: [delegation],
        })
        
        if (addResult.error) {
          throw new Error(`Failed to add delegation: ${addResult.error.message}`)
        }

        const delegationSpaces = delegation.capabilities
          .filter((cap: any) => cap.can === 'space/*' || cap.can?.startsWith('space/'))
          .map((cap: any) => {
            if (typeof cap.with === 'string') {
              return cap.with
            }
            return undefined
          })
          .filter((did: any): did is string => did !== undefined)

        if (delegationSpaces.length === 0) {
          throw new Error('UCAN does not contain space capabilities')
        }

        const spaceDID = delegationSpaces[0]
        const space = spaces.find((s: any) => s.did() === spaceDID)

        if (!space) {
          setSuccess('UCAN imported successfully. Please refresh to see the space.')
        } else {
          setImportedSpace(space)
          setSuccess('Space imported successfully!')
          onImport?.(space)
        }

        setUcanValue('')
        return space
      } catch (err: any) {
        const error = err instanceof Error ? err : new Error('Failed to import UCAN')
        setError(error.message)
        onError?.(error)
        throw error
      } finally {
        setIsImporting(false)
      }
    },
    [client, spaces, onImport, onError]
  )

  const clearMessages = useCallback(() => {
    setError(undefined)
    setSuccess(undefined)
    setImportedSpace(undefined)
  }, [])

  const contextValue = useMemo<ImportSpaceContextValue>(
    () => [
      {
        ...state,
        userDID,
        ucanValue,
        isImporting,
        error,
        success,
        importedSpace,
      },
      {
        setUcanValue,
        copyDID,
        emailDID,
        importUCAN,
        clearMessages,
      },
    ],
    [
      state,
      userDID,
      ucanValue,
      isImporting,
      error,
      success,
      importedSpace,
      copyDID,
      emailDID,
      importUCAN,
      clearMessages,
    ]
  )

  return (
    <ImportSpaceContext.Provider value={contextValue}>
      {children}
    </ImportSpaceContext.Provider>
  )
}

export type ImportSpaceFormOptions<T extends As = 'form'> = Options<T> & {
  className?: string
  style?: CSSProperties
  renderUcanInput?: () => ReactNode
  renderSubmitButton?: (disabled: boolean) => ReactNode
  onSubmit?: (ucanToken: string) => void
}

export type ImportSpaceFormProps<T extends As = 'form'> = Props<
  ImportSpaceFormOptions<T>
>

export const ImportSpaceForm = ({
  className,
  style,
  renderUcanInput,
  renderSubmitButton,
  onSubmit,
  children,
  ...formProps
}: ImportSpaceFormProps) => {
  const [{ ucanValue, isImporting }, { setUcanValue, importUCAN }] =
    useImportSpaceContext()

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const trimmedValue = ucanValue.trim()

      if (!trimmedValue) {
        return
      }

      try {
        await importUCAN(trimmedValue)
        onSubmit?.(trimmedValue)
      } catch (err) {
        // Error handled in context
      }
    },
    [ucanValue, importUCAN, onSubmit]
  )

  const defaultRenderUcanInput = () => (
    <ImportSpaceUcanInput placeholder="Paste UCAN token here..." />
  )

  const defaultRenderSubmitButton = (disabled: boolean) => (
    <button type="submit" disabled={disabled}>
      Import UCAN
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
          {renderUcanInput ? renderUcanInput() : defaultRenderUcanInput()}
          {renderSubmitButton
            ? renderSubmitButton(isImporting)
            : defaultRenderSubmitButton(isImporting)}
        </>
      )}
    </form>
  )

  return formContent
}

export type ImportSpaceUcanInputOptions<T extends As = 'textarea'> = Options<T> & {
  className?: string
  style?: CSSProperties
}

export type ImportSpaceUcanInputProps<T extends As = 'textarea'> = Props<
  ImportSpaceUcanInputOptions<T>
>

export const ImportSpaceUcanInput = ({
  className,
  style,
  ...props
}: ImportSpaceUcanInputProps) => {
  const [{ ucanValue }, { setUcanValue }] = useImportSpaceContext()

  return createElement('textarea', {
    ...props,
    value: ucanValue,
    onChange: (e: ChangeEvent<HTMLTextAreaElement>) =>
      setUcanValue(e.target.value),
    className,
    style,
    rows: 6,
  })
}

export type ImportSpaceDIDDisplayOptions<T extends As = 'div'> = Options<T> & {
  className?: string
  style?: CSSProperties
  renderDID?: (did: string) => ReactNode
  renderCopyButton?: (onClick: () => void) => ReactNode
  renderEmailButton?: (onClick: () => void) => ReactNode
}

export type ImportSpaceDIDDisplayProps<T extends As = 'div'> = Props<
  ImportSpaceDIDDisplayOptions<T>
>

export const ImportSpaceDIDDisplay = ({
  className,
  style,
  renderDID,
  renderCopyButton,
  renderEmailButton,
  ...divProps
}: ImportSpaceDIDDisplayProps) => {
  const [{ userDID }, { copyDID, emailDID }] = useImportSpaceContext()

  if (!userDID) {
    return null
  }

  const defaultRenderDID = (did: string) => (
    <div style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
      {did}
    </div>
  )

  const defaultRenderCopyButton = (onClick: () => void) => (
    <button type="button" onClick={onClick}>
      Copy DID
    </button>
  )

  const defaultRenderEmailButton = (onClick: () => void) => (
    <button type="button" onClick={onClick}>
      Email DID
    </button>
  )

  const content = (
    <>
      {renderDID ? renderDID(userDID) : defaultRenderDID(userDID)}
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        {renderCopyButton
          ? renderCopyButton(() => {
              void copyDID()
            })
          : defaultRenderCopyButton(() => {
              void copyDID()
            })}
        {renderEmailButton
          ? renderEmailButton(emailDID)
          : defaultRenderEmailButton(emailDID)}
      </div>
    </>
  )

  return createElement('div', {
    ...divProps,
    className,
    style,
    children: content,
  })
}

export function useImportSpaceContext(): ImportSpaceContextValue {
  return useContext(ImportSpaceContext)
}

export const ImportSpace = Object.assign(ImportSpaceProvider, {
  Form: ImportSpaceForm,
  UcanInput: ImportSpaceUcanInput,
  DIDDisplay: ImportSpaceDIDDisplay,
})
