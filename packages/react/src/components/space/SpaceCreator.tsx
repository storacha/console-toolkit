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
import type { Space, SpaceDID } from '@storacha/ui-core'
import * as UcantoClient from '@ucanto/client'
import { HTTP } from '@ucanto/transport'
import * as CAR from '@ucanto/transport/car'
import type { ContentServeService } from '@storacha/ui-core'

export type SpaceCreatorContextState = ContextState & {
  /**
   * Space name input value
   */
  name: string
  /**
   * Access type ('public' | 'private')
   */
  accessType: 'public' | 'private'
  /**
   * Whether form is being submitted
   */
  submitted: boolean
  /**
   * Whether space was successfully created
   */
  created: boolean
  /**
   * Created space (if successful)
   */
  createdSpace?: Space
  /**
   * Error message (if creation failed)
   */
  error?: string
}

export type SpaceCreatorContextActions = {
  /**
   * Set space name
   */
  setName: React.Dispatch<React.SetStateAction<string>>
  /**
   * Set access type
   */
  setAccessType: (type: 'public' | 'private') => void
  /**
   * Submit form to create space
   */
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>
  /**
   * Reset form
   */
  resetForm: () => void
}

export type SpaceCreatorContextValue = [
  state: SpaceCreatorContextState,
  actions: SpaceCreatorContextActions
]

export const SpaceCreatorContextDefaultValue: SpaceCreatorContextValue = [
  {
    accounts: [],
    spaces: [],
    client: undefined,
    name: '',
    accessType: 'public',
    submitted: false,
    created: false,
  },
  {
    setName: () => {
      throw new Error('missing setName function')
    },
    setAccessType: () => {
      throw new Error('missing setAccessType function')
    },
    handleSubmit: async () => {
      throw new Error('missing handleSubmit function')
    },
    resetForm: () => {
      throw new Error('missing resetForm function')
    },
  },
]

export const SpaceCreatorContext = createContext<SpaceCreatorContextValue>(
  SpaceCreatorContextDefaultValue
)

export interface SpaceCreatorProps {
  children?: ReactNode
  /**
   * Gateway host URL
   */
  gatewayHost?: string
  /**
   * Gateway DID
   */
  gatewayDID?: string
  /**
   * Provider DID
   */
  providerDID?: string
  /**
   * Callback when space is created
   */
  onSpaceCreated?: (space: Space) => void
  /**
   * Callback on error
   */
  onError?: (error: Error) => void
}

/**
 * Main SpaceCreator component that provides space creation context
 */
export const SpaceCreatorProvider = ({ 
  children,
  gatewayHost = 'https://w3s.link',
  gatewayDID,
  providerDID,
  onSpaceCreated,
  onError,
}: SpaceCreatorProps) => {
  const [state] = useW3()
  const { client, accounts } = state
  const [name, setName] = useState('')
  const [accessType, setAccessType] = useState<'public' | 'private'>('public')
  const [submitted, setSubmitted] = useState(false)
  const [created, setCreated] = useState(false)
  const [createdSpace, setCreatedSpace] = useState<Space>()
  const [error, setError] = useState<string>()

  const resetForm = useCallback(() => {
    setName('')
    setAccessType('public')
    setError(undefined)
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!client) {
        const err = new Error('Client not initialized')
        setError(err.message)
        onError?.(err)
        return
      }

      const account = accounts[0]
      if (!account) {
        const err = new Error('cannot create space, no account found, have you authorized your email?')
        setError(err.message)
        onError?.(err)
        return
      }

      setSubmitted(true)
      setError(undefined)

      try {
        // Validate name is not empty
        if (!name || name.trim() === '') {
          const err = new Error('Space name is required')
          setError(err.message)
          setSubmitted(false)
          onError?.(err)
          return
        }

        const toWebDID = (input?: string) => {
          if (!input) return undefined
          return UcantoClient.Schema.DID.match({ method: 'web' }).from(input)
        }

        // Ensure gatewayHost is a valid URL string
        const finalGatewayHost = gatewayHost || 'https://w3s.link'
        const gatewayId = toWebDID(gatewayDID) ?? toWebDID('did:web:w3s.link')!

        const storachaGateway = UcantoClient.connect({
          id: {
            did: () => gatewayId
          },
          codec: CAR.outbound,
          channel: HTTP.open<ContentServeService>({ url: new URL(finalGatewayHost) }),
        })

        const space = await client.createSpace(name.trim(), {
          authorizeGatewayServices: [storachaGateway],
          access: {
            type: accessType,
            ...(accessType === 'private' ? {
              encryption: {
                provider: 'google-kms',
                algorithm: 'RSA_DECRYPT_OAEP_3072_SHA256',
              },
            } : {}),
          },
        } as any)

        const provider = toWebDID(providerDID) ?? toWebDID('did:web:storacha.network')!
        if (!provider) {
          const err = new Error('Failed to resolve provider DID')
          setError(err.message)
          setSubmitted(false)
          onError?.(err)
          return
        }
        const result = await account.provision(space.did(), { provider })
        if (result.error) {
          const error = new Error(`failed provisioning space: ${space.did()} with provider: ${provider}`)
          ;(error as any).cause = result.error
          throw error
        }

        await space.save()

        const recovery = await space.createRecovery(account.did())

        await client.capability.access.delegate({
          space: space.did(),
          delegations: [recovery],
        })

        const savedSpace = client.spaces().find(s => s.did() === space.did())
        setCreatedSpace(savedSpace)
        setCreated(true)
        resetForm()
        onSpaceCreated?.(savedSpace!)
      } catch (err: any) {
        setSubmitted(false)
        setCreated(false)
        const error = err instanceof Error ? err : new Error('failed to create space')
        setError(error.message)
        onError?.(error)
      }
    },
    [client, accounts, name, accessType, gatewayHost, gatewayDID, providerDID, resetForm, onSpaceCreated, onError]
  )

  const value = useMemo<SpaceCreatorContextValue>(
    () => [
      {
        ...state,
        name,
        accessType,
        submitted,
        created,
        createdSpace,
        error,
      },
      {
        setName,
        setAccessType,
        handleSubmit,
        resetForm,
      },
    ],
    [state, name, accessType, submitted, created, createdSpace, error, handleSubmit, resetForm]
  )

  return (
    <SpaceCreatorContext.Provider value={value}>
      {children}
    </SpaceCreatorContext.Provider>
  )
}

export type SpaceCreatorFormOptions<T extends As = 'form'> = Options<T> & {
  /**
   * Additional CSS class names
   */
  className?: string
  /**
   * Inline styles
   */
  style?: CSSProperties
  /**
   * Render prop for form container
   */
  renderContainer?: (children: ReactNode) => ReactNode
  /**
   * Render prop for name input
   */
  renderNameInput?: () => ReactNode
  /**
   * Render prop for access type selector
   */
  renderAccessTypeSelector?: () => ReactNode
  /**
   * Render prop for submit button
   */
  renderSubmitButton?: (disabled: boolean) => ReactNode
  /**
   * Custom form children (overrides default)
   */
  children?: ReactNode
}

export type SpaceCreatorFormProps<T extends As = 'form'> = Props<
  SpaceCreatorFormOptions<T>
>

export const SpaceCreatorForm = ({ 
  className,
  style,
  renderContainer,
  renderNameInput,
  renderAccessTypeSelector,
  renderSubmitButton,
  children,
  ...formProps 
}: SpaceCreatorFormProps) => {
  const [{ name, accessType, submitted }, { handleSubmit }] = useSpaceCreatorContext()

  const defaultRenderNameInput = () => (
    <SpaceCreatorNameInput
      placeholder="Space name"
      required
    />
  )

  const defaultRenderSubmitButton = (disabled: boolean) => (
    <button type="submit" disabled={disabled}>
      Create Space
    </button>
  )

  if (children) {
    return (
      <form 
        {...formProps} 
        onSubmit={handleSubmit}
        className={className}
        style={style}
      >
        {children as ReactNode}
      </form>
    )
  }

  const formContent = (
    <form 
      {...formProps} 
      onSubmit={handleSubmit}
      className={className}
      style={style}
    >
      {renderNameInput ? renderNameInput() : defaultRenderNameInput()}
      {renderAccessTypeSelector?.()}
      {renderSubmitButton ? renderSubmitButton(submitted) : defaultRenderSubmitButton(submitted)}
    </form>
  )

  return renderContainer ? renderContainer(formContent) : formContent
}

export type SpaceCreatorNameInputOptions<T extends As = 'input'> = Options<T> & {
  /**
   * Additional CSS class names
   */
  className?: string
  /**
   * Inline styles
   */
  style?: CSSProperties
}

export type SpaceCreatorNameInputProps<T extends As = 'input'> = Props<
  SpaceCreatorNameInputOptions<T>
>

export const SpaceCreatorNameInput = ({ className, style, ...props }: SpaceCreatorNameInputProps) => {
  const [{ name }, { setName }] = useSpaceCreatorContext()
  
  return createElement('input', {
    ...props,
    type: 'text',
    value: name,
    onChange: (e: ChangeEvent<HTMLInputElement>) => setName(e.target.value),
    className,
    style,
  })
}

export type SpaceCreatorAccessTypeSelectOptions<T extends As = 'select'> = Options<T> & {
  /**
   * Additional CSS class names
   */
  className?: string
  /**
   * Inline styles
   */
  style?: CSSProperties
}

export type SpaceCreatorAccessTypeSelectProps<T extends As = 'select'> = Props<
  SpaceCreatorAccessTypeSelectOptions<T>
>

export const SpaceCreatorAccessTypeSelect = ({ className, style, ...props }: SpaceCreatorAccessTypeSelectProps) => {
  const [{ accessType }, { setAccessType }] = useSpaceCreatorContext()
  
  return createElement('select', {
    ...props,
    value: accessType,
    onChange: (e: ChangeEvent<HTMLSelectElement>) => setAccessType(e.target.value as 'public' | 'private'),
    className,
    style,
    children: (
      <>
        <option value="public">Public</option>
        <option value="private">Private</option>
      </>
    ),
  })
}

export function useSpaceCreatorContext(): SpaceCreatorContextValue {
  return useContext(SpaceCreatorContext)
}

export const SpaceCreator = Object.assign(SpaceCreatorProvider, {
  Form: SpaceCreatorForm,
  NameInput: SpaceCreatorNameInput,
  AccessTypeSelect: SpaceCreatorAccessTypeSelect,
})

