import type { As, Props, Options } from 'ariakit-react-utils'
import type { ReactNode, CSSProperties, ChangeEvent, FormEventHandler } from 'react'

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
import type { Space, AnyLink, CARMetadata, ProgressStatus, UploadOptions } from '@storacha/ui-core'

export enum UploadStatus {
  Idle = 'idle',
  Uploading = 'uploading',
  Failed = 'failed',
  Succeeded = 'succeeded',
}

export type UploadType = 'file' | 'directory' | 'car'

export type UploadProgress = Record<string, ProgressStatus>

export interface OnUploadComplete {
  file?: File
  files?: File[]
  dataCID?: AnyLink
}

export type UploadToolContextState = ContextState & {
  /**
   * Current space for upload
   */
  space?: Space
  /**
   * Selected upload type
   */
  uploadType: UploadType
  /**
   * Whether to wrap single files in directory
   */
  wrapInDirectory: boolean
  /**
   * Upload status
   */
  status: UploadStatus
  /**
   * Selected file
   */
  file?: File
  /**
   * Selected files
   */
  files?: File[]
  /**
   * Upload progress
   */
  uploadProgress: UploadProgress
  /**
   * Stored DAG shards
   */
  storedDAGShards: CARMetadata[]
  /**
   * Uploaded data CID
   */
  dataCID?: AnyLink
  /**
   * Upload error
   */
  error?: Error
  /**
   * Whether space is private
   */
  isPrivateSpace: boolean
}

export type UploadToolContextActions = {
  /**
   * Set upload type
   */
  setUploadType: (type: UploadType) => void
  /**
   * Set file to upload
   */
  setFile: (file?: File) => void
  /**
   * Set files to upload
   */
  setFiles: (files?: File[]) => void
  /**
   * Set wrap in directory
   */
  setWrapInDirectory: (wrap: boolean) => void
  /**
   * Reset upload state
   */
  reset: () => void
  /**
   * Handle form submit
   */
  handleUploadSubmit: FormEventHandler<HTMLFormElement>
}

export type UploadToolContextValue = [
  state: UploadToolContextState,
  actions: UploadToolContextActions
]

const UploadToolContext = createContext<UploadToolContextValue | undefined>(undefined)

export function useUploadToolContext(): UploadToolContextValue {
  const context = useContext(UploadToolContext)
  if (!context) {
    throw new Error('useUploadToolContext must be used within UploadTool')
  }
  return context
}

export type UploadToolOptions<T extends As = 'div'> = Options<T> & {
  /**
   * Space to upload to
   */
  space?: Space
  /**
   * Callback when upload completes
   */
  onUploadComplete?: (props: OnUploadComplete) => void
  /**
   * Default upload type
   */
  defaultUploadType?: UploadType
  /**
   * Default wrap in directory
   */
  defaultWrapInDirectory?: boolean
}

export type UploadToolProps<T extends As = 'div'> = Props<UploadToolOptions<T>>

const UploadToolRoot = <T extends As = 'div'>({
  space,
  onUploadComplete,
  defaultUploadType = 'file',
  defaultWrapInDirectory = false,
  children,
  ...props
}: UploadToolProps<T>) => {
  void props
  const [{ client, accounts, spaces }] = useW3()
  const [uploadType, setUploadType] = useState<UploadType>(defaultUploadType)
  const [wrapInDirectory, setWrapInDirectory] = useState(defaultWrapInDirectory)
  const [files, setFiles] = useState<File[]>()
  const file = files?.[0]
  const [status, setStatus] = useState<UploadStatus>(UploadStatus.Idle)
  const [error, setError] = useState<Error>()
  const [dataCID, setDataCID] = useState<AnyLink>()
  const [storedDAGShards, setStoredDAGShards] = useState<CARMetadata[]>([])
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({})

  const isPrivateSpace = space?.access?.type === 'private'

  // Set current space in client
  useEffect(() => {
    if (space && client) {
      client.setCurrentSpace(space.did())
    }
  }, [space, client])

  const handleUploadSubmit: FormEventHandler<HTMLFormElement> = useCallback(
    async (e) => {
      e.preventDefault()

      if (!client) {
        const err = new Error('Client not initialized')
        setError(err)
        setStatus(UploadStatus.Failed)
        return
      }

      if (!space) {
        const err = new Error('No space selected for upload')
        setError(err)
        setStatus(UploadStatus.Failed)
        return
      }

      if (!files || files.length === 0) {
        const err = new Error('No files selected for upload')
        setError(err)
        setStatus(UploadStatus.Failed)
        return
      }

      setError(undefined)
      setStatus(UploadStatus.Uploading)
      setStoredDAGShards([])
      setUploadProgress({})

      try {
        const storedShards: CARMetadata[] = []
        const uploadOptions: UploadOptions = {
          onShardStored(meta: CARMetadata) {
            storedShards.push(meta)
            setStoredDAGShards([...storedShards])
          },
          onUploadProgress(progress: ProgressStatus) {
            setUploadProgress((prev) => ({
              ...prev,
              [progress.url ?? '']: progress,
            }))
          },
        }

        let cid: AnyLink

        // Determine upload method based on type and file count
        if (uploadType === 'car') {
          if (files.length > 1) {
            throw new Error('Multiple CAR files not supported')
          }
          cid = await client.uploadCAR(file!, uploadOptions)
        } else if (uploadType === 'directory' || files.length > 1) {
          cid = await client.uploadDirectory(files, uploadOptions)
        } else if (wrapInDirectory) {
          cid = await client.uploadDirectory(files, uploadOptions)
        } else {
          cid = await client.uploadFile(file!, uploadOptions)
        }

        setDataCID(cid)
        setStatus(UploadStatus.Succeeded)
        onUploadComplete?.({ file, files, dataCID: cid })
      } catch (err: any) {
        const error = err instanceof Error ? err : new Error('Upload failed')
        setError(error)
        setStatus(UploadStatus.Failed)
      }
    },
    [client, space, files, file, uploadType, wrapInDirectory, onUploadComplete]
  )

  const setFile = useCallback((file?: File) => {
    setFiles(file ? [file] : undefined)
    setStatus(UploadStatus.Idle)
    setError(undefined)
    setDataCID(undefined)
  }, [])

  const setFilesState = useCallback((files?: File[]) => {
    setFiles(files)
    setStatus(UploadStatus.Idle)
    setError(undefined)
    setDataCID(undefined)
  }, [])

  const reset = useCallback(() => {
    setFiles(undefined)
    setStatus(UploadStatus.Idle)
    setError(undefined)
    setDataCID(undefined)
    setStoredDAGShards([])
    setUploadProgress({})
  }, [])

  const value = useMemo<UploadToolContextValue>(
    () => [
      {
        client,
        accounts,
        spaces,
        space,
        uploadType,
        wrapInDirectory,
        status,
        file,
        files,
        uploadProgress,
        storedDAGShards,
        dataCID,
        error,
        isPrivateSpace,
      },
      {
        setUploadType,
        setFile,
        setFiles: setFilesState,
        setWrapInDirectory,
        reset,
        handleUploadSubmit,
      },
    ],
    [
      client,
      accounts,
      spaces,
      space,
      uploadType,
      wrapInDirectory,
      status,
      file,
      files,
      uploadProgress,
      storedDAGShards,
      dataCID,
      error,
      isPrivateSpace,
      setFile,
      setFilesState,
      reset,
      handleUploadSubmit,
    ]
  )

  return (
    <UploadToolContext.Provider value={value}>
      {children as ReactNode}
    </UploadToolContext.Provider>
  )
}

export type UploadToolFormOptions<T extends As = 'form'> = Options<T> & {
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
}

export type UploadToolFormProps<T extends As = 'form'> = Props<
  UploadToolFormOptions<T>
>

export const UploadToolForm = <T extends As = 'form'>({
  className,
  style,
  renderContainer,
  children,
  ...formProps
}: UploadToolFormProps<T>) => {
  const [, { handleUploadSubmit }] = useUploadToolContext()

  const formContent = (
    <form
      {...(formProps as any)}
      onSubmit={handleUploadSubmit}
      className={className}
      style={style}
    >
      {children as ReactNode}
    </form>
  )

  return renderContainer ? renderContainer(formContent) : formContent
}

export type UploadToolInputOptions<T extends As = 'input'> = Options<T> & {
  /**
   * Additional CSS class names
   */
  className?: string
  /**
   * Inline styles
   */
  style?: CSSProperties
  /**
   * Allow directory selection
   */
  allowDirectory?: boolean
}

export type UploadToolInputProps<T extends As = 'input'> = Props<
  UploadToolInputOptions<T>
>

export const UploadToolInput = <T extends As = 'input'>({
  className,
  style,
  allowDirectory,
  ...inputProps
}: UploadToolInputProps<T>) => {
  const [{ uploadType }, { setFiles }] = useUploadToolContext()

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        setFiles([...e.target.files])
      }
    },
    [setFiles]
  )

  const finalAllowDirectory = allowDirectory ?? uploadType === 'directory'

  return createElement('input', {
    ...inputProps,
    type: 'file',
    className,
    style,
    onChange: handleChange,
    webkitdirectory: finalAllowDirectory ? 'true' : undefined,
    accept: uploadType === 'car' ? '.car' : inputProps.accept,
  })
}

export type UploadToolTypeSelectorOptions<T extends As = 'div'> = Options<T> & {
  /**
   * Additional CSS class names
   */
  className?: string
  /**
   * Inline styles
   */
  style?: CSSProperties
  /**
   * Render prop for type option
   */
  renderOption?: (type: UploadType, checked: boolean, onChange: () => void) => ReactNode
}

export type UploadToolTypeSelectorProps<T extends As = 'div'> = Props<
  UploadToolTypeSelectorOptions<T>
>

export const UploadToolTypeSelector = <T extends As = 'div'>({
  className,
  style,
  renderOption,
  ...divProps
}: UploadToolTypeSelectorProps<T>) => {
  const [{ uploadType, isPrivateSpace }, { setUploadType }] = useUploadToolContext()

  const handleTypeChange = useCallback(
    (type: UploadType) => {
      setUploadType(type)
    },
    [setUploadType]
  )

  // Don't show type selector for private spaces
  if (isPrivateSpace) {
    return null
  }

  const types: UploadType[] = ['file', 'directory', 'car']

  const content = types.map((type) => {
    const checked = uploadType === type
    const onChange = () => handleTypeChange(type)

    if (renderOption) {
      return (
        <React.Fragment key={type}>
          {renderOption(type, checked, onChange)}
        </React.Fragment>
      )
    }

    return (
      <label key={type} style={{ marginRight: '1rem', cursor: 'pointer' }}>
        <input
          type="radio"
          checked={checked}
          onChange={onChange}
          style={{ marginRight: '0.5rem' }}
        />
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </label>
    )
  })

  return createElement('div', {
    ...divProps,
    className,
    style,
    children: content,
  })
}

export type UploadToolWrapCheckboxOptions<T extends As = 'input'> = Options<T> & {
  /**
   * Additional CSS class names
   */
  className?: string
  /**
   * Inline styles
   */
  style?: CSSProperties
  /**
   * Render prop for checkbox
   */
  renderCheckbox?: (checked: boolean, onChange: () => void) => ReactNode
}

export type UploadToolWrapCheckboxProps<T extends As = 'input'> = Props<
  UploadToolWrapCheckboxOptions<T>
>

export const UploadToolWrapCheckbox = <T extends As = 'input'>({
  className,
  style,
  renderCheckbox,
  ...inputProps
}: UploadToolWrapCheckboxProps<T>) => {
  const [{ wrapInDirectory, uploadType, isPrivateSpace }, { setWrapInDirectory }] = useUploadToolContext()

  // Only show for file type in public spaces
  if (uploadType !== 'file' || isPrivateSpace) {
    return null
  }

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setWrapInDirectory(e.target.checked)
    },
    [setWrapInDirectory]
  )

  if (renderCheckbox) {
    return <>{renderCheckbox(wrapInDirectory, () => setWrapInDirectory(!wrapInDirectory))}</>
  }

  return createElement('input', {
    ...inputProps,
    type: 'checkbox',
    checked: wrapInDirectory,
    onChange: handleChange,
    className,
    style,
  })
}

export type UploadToolProgressOptions<T extends As = 'div'> = Options<T> & {
  /**
   * Additional CSS class names
   */
  className?: string
  /**
   * Inline styles
   */
  style?: CSSProperties
  /**
   * Render prop for progress display
   */
  renderProgress?: (progress: UploadProgress, shards: CARMetadata[]) => ReactNode
}

export type UploadToolProgressProps<T extends As = 'div'> = Props<
  UploadToolProgressOptions<T>
>

export const UploadToolProgress = <T extends As = 'div'>({
  className,
  style,
  renderProgress,
  ...divProps
}: UploadToolProgressProps<T>) => {
  const [{ uploadProgress, storedDAGShards, status }] = useUploadToolContext()

  if (status !== UploadStatus.Uploading) {
    return null
  }

  if (renderProgress) {
    return <>{renderProgress(uploadProgress, storedDAGShards)}</>
  }

  const progressBars = Object.values(uploadProgress).map((progress, index) => {
    const { total, loaded, lengthComputable } = progress
    const percent = lengthComputable && total > 0 ? Math.floor((loaded / total) * 100) : 0

    return (
      <div key={index} style={{ marginBottom: '0.5rem' }}>
        <div style={{ width: '100%', height: '4px', backgroundColor: '#e0e0e0', borderRadius: '2px' }}>
          <div
            style={{
              width: `${percent}%`,
              height: '100%',
              backgroundColor: '#E91315',
              borderRadius: '2px',
              transition: 'width 0.3s',
            }}
          />
        </div>
        {lengthComputable && <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>{percent}%</div>}
      </div>
    )
  })

  return createElement('div', {
    ...divProps,
    className,
    style,
    children: progressBars,
  })
}

export type UploadToolStatusOptions<T extends As = 'div'> = Options<T> & {
  /**
   * Additional CSS class names
   */
  className?: string
  /**
   * Inline styles
   */
  style?: CSSProperties
  /**
   * Render prop for idle state
   */
  renderIdle?: (file?: File, files?: File[]) => ReactNode
  /**
   * Render prop for uploading state
   */
  renderUploading?: (file: File | undefined, progress: UploadProgress, shards: CARMetadata[]) => ReactNode
  /**
   * Render prop for succeeded state
   */
  renderSucceeded?: (dataCID?: AnyLink, file?: File) => ReactNode
  /**
   * Render prop for failed state
   */
  renderFailed?: (error?: Error) => ReactNode
}

export type UploadToolStatusProps<T extends As = 'div'> = Props<
  UploadToolStatusOptions<T>
>

export const UploadToolStatus = <T extends As = 'div'>({
  className,
  style,
  renderIdle,
  renderUploading,
  renderSucceeded,
  renderFailed,
  ...divProps
}: UploadToolStatusProps<T>) => {
  void divProps
  const [{ status, file, files, uploadProgress, storedDAGShards, dataCID, error }] = useUploadToolContext()

  switch (status) {
    case UploadStatus.Idle:
      return renderIdle ? <>{renderIdle(file, files)}</> : null
    case UploadStatus.Uploading:
      return renderUploading ? <>{renderUploading(file, uploadProgress, storedDAGShards)}</> : null
    case UploadStatus.Succeeded:
      return renderSucceeded ? <>{renderSucceeded(dataCID, file)}</> : null
    case UploadStatus.Failed:
      return renderFailed ? <>{renderFailed(error)}</> : null
    default:
      return null
  }
}

// Attach subcomponents to UploadTool
export const UploadTool = Object.assign(UploadToolRoot, {
  Form: UploadToolForm,
  Input: UploadToolInput,
  TypeSelector: UploadToolTypeSelector,
  WrapCheckbox: UploadToolWrapCheckbox,
  Progress: UploadToolProgress,
  Status: UploadToolStatus,
})
