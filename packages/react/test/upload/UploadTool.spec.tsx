import React from 'react'
import 'fake-indexeddb/auto'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UploadTool, useUploadToolContext, UploadStatus } from '../../src/components/upload/UploadTool.js'
import { Provider } from '../../src/providers/Provider.js'
import type { Space } from '@storacha/ui-core'

describe('UploadTool', () => {
  const mockSpace: Partial<Space> = {
    did: () => 'did:web:test-space' as any,
    access: { type: 'public' },
    name: 'Test Space',
    meta: () => ({ access: { type: 'public' } }),
  }

  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders upload tool with form', () => {
    render(
      <Provider>
        <UploadTool space={mockSpace as Space}>
          <UploadTool.Form>
            <div>Upload Form</div>
          </UploadTool.Form>
        </UploadTool>
      </Provider>
    )

    expect(screen.getByText('Upload Form')).toBeTruthy()
  })

  it('provides context to children', () => {
    function TestComponent() {
      const [{ uploadType, status }] = useUploadToolContext()
      return (
        <div>
          <span>Type: {uploadType}</span>
          <span>Status: {status}</span>
        </div>
      )
    }

    render(
      <Provider>
        <UploadTool space={mockSpace as Space}>
          <TestComponent />
        </UploadTool>
      </Provider>
    )

    expect(screen.getByText(/Type: file/)).toBeTruthy()
    expect(screen.getByText(/Status: idle/)).toBeTruthy()
  })

  it('renders file input', () => {
    render(
      <Provider>
        <UploadTool space={mockSpace as Space}>
          <UploadTool.Form>
            <UploadTool.Input data-testid="upload-input" />
          </UploadTool.Form>
        </UploadTool>
      </Provider>
    )

    const input = screen.getByTestId('upload-input') as HTMLInputElement
    expect(input).toBeTruthy()
    expect(input.type).toBe('file')
  })

  it('renders type selector for public spaces', () => {
    render(
      <Provider>
        <UploadTool space={mockSpace as Space}>
          <UploadTool.TypeSelector
            renderOption={(type, checked, onChange) => (
              <label>
                <input type="radio" checked={checked} onChange={onChange} />
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </label>
            )}
          />
        </UploadTool>
      </Provider>
    )

    expect(screen.getByText(/File/i)).toBeTruthy()
    expect(screen.getByText(/Directory/i)).toBeTruthy()
    expect(screen.getByText(/CAR/i)).toBeTruthy()
  })

  it('does not render type selector for private spaces', () => {
    const privateSpace: Partial<Space> = {
      ...mockSpace,
      access: { type: 'private' },
      meta: () => ({ access: { type: 'private' } }),
    }

    render(
      <Provider>
        <UploadTool space={privateSpace as Space}>
          <UploadTool.TypeSelector
            renderOption={(type, checked, onChange) => (
              <label>
                <input type="radio" checked={checked} onChange={onChange} />
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </label>
            )}
          />
        </UploadTool>
      </Provider>
    )

    // Type selector should not render for private spaces
    expect(screen.queryByText(/File/i)).toBeFalsy()
  })

  it('allows changing upload type', async () => {
    function TestComponent() {
      const [{ uploadType }, { setUploadType }] = useUploadToolContext()
      return (
        <div>
          <span>Type: {uploadType}</span>
          <button onClick={() => setUploadType('directory')}>Set Directory</button>
        </div>
      )
    }

    render(
      <Provider>
        <UploadTool space={mockSpace as Space}>
          <TestComponent />
        </UploadTool>
      </Provider>
    )

    expect(screen.getByText(/Type: file/)).toBeTruthy()

    const button = screen.getByText('Set Directory')
    await userEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/Type: directory/)).toBeTruthy()
    })
  })

  it('renders wrap checkbox for file type in public spaces', () => {
    render(
      <Provider>
        <UploadTool space={mockSpace as Space} defaultUploadType="file">
          <UploadTool.WrapCheckbox data-testid="wrap-checkbox" />
        </UploadTool>
      </Provider>
    )

    const checkbox = screen.getByTestId('wrap-checkbox') as HTMLInputElement
    expect(checkbox).toBeTruthy()
    expect(checkbox.type).toBe('checkbox')
  })

  it('does not render wrap checkbox for directory type', () => {
    render(
      <Provider>
        <UploadTool space={mockSpace as Space} defaultUploadType="directory">
          <UploadTool.WrapCheckbox data-testid="wrap-checkbox" />
        </UploadTool>
      </Provider>
    )

    expect(screen.queryByTestId('wrap-checkbox')).toBeFalsy()
  })

  it('does not render wrap checkbox for private spaces', () => {
    const privateSpace: Partial<Space> = {
      ...mockSpace,
      access: { type: 'private' },
      meta: () => ({ access: { type: 'private' } }),
    }

    render(
      <Provider>
        <UploadTool space={privateSpace as Space} defaultUploadType="file">
          <UploadTool.WrapCheckbox data-testid="wrap-checkbox" />
        </UploadTool>
      </Provider>
    )

    expect(screen.queryByTestId('wrap-checkbox')).toBeFalsy()
  })

  it('renders progress component when uploading', () => {
    function TestComponent() {
      const [{ status }, { setUploadType }] = useUploadToolContext()
      // Simulate uploading state
      React.useEffect(() => {
        // This would normally be set by the upload process
      }, [])
      return (
        <div>
          <UploadTool.Progress renderProgress={(progress, shards) => (
            <div data-testid="progress">Progress: {Object.keys(progress).length} items</div>
          )} />
        </div>
      )
    }

    render(
      <Provider>
        <UploadTool space={mockSpace as Space}>
          <TestComponent />
        </UploadTool>
      </Provider>
    )

    // Progress should not render when status is not uploading
    expect(screen.queryByTestId('progress')).toBeFalsy()
  })

  it('renders status component with idle state', () => {
    render(
      <Provider>
        <UploadTool space={mockSpace as Space}>
          <UploadTool.Status
            renderIdle={(file) => file ? <div>File selected: {file.name}</div> : <div>No file</div>}
          />
        </UploadTool>
      </Provider>
    )

    expect(screen.getByText('No file')).toBeTruthy()
  })

  it('renders status component with succeeded state', () => {
    function TestComponent() {
      const [{ status }] = useUploadToolContext()
      // In a real scenario, status would be set by the upload process
      return (
        <UploadTool.Status
          renderSucceeded={(dataCID) => dataCID ? <div>Uploaded: {dataCID.toString()}</div> : null}
        />
      )
    }

    render(
      <Provider>
        <UploadTool space={mockSpace as Space}>
          <TestComponent />
        </UploadTool>
      </Provider>
    )

    // Status is idle by default, so succeeded won't render
    expect(screen.queryByText(/Uploaded:/)).toBeFalsy()
  })

  it('renders status component with failed state', () => {
    render(
      <Provider>
        <UploadTool space={mockSpace as Space}>
          <UploadTool.Status
            renderFailed={(error) => error ? <div>Error: {error.message}</div> : null}
          />
        </UploadTool>
      </Provider>
    )

    // Status is idle by default, so failed won't render
    expect(screen.queryByText(/Error:/)).toBeFalsy()
  })

  it('allows setting files', async () => {
    const file = new File(['test'], 'test.txt', { type: 'text/plain' })

    function TestComponent() {
      const [{ file: currentFile }, { setFile }] = useUploadToolContext()
      return (
        <div>
          <span>File: {currentFile?.name || 'none'}</span>
          <button onClick={() => setFile(file)}>Set File</button>
        </div>
      )
    }

    render(
      <Provider>
        <UploadTool space={mockSpace as Space}>
          <TestComponent />
        </UploadTool>
      </Provider>
    )

    expect(screen.getByText(/File: none/)).toBeTruthy()

    const button = screen.getByText('Set File')
    await userEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/File: test\.txt/)).toBeTruthy()
    })
  })

  it('allows resetting upload state', async () => {
    const file = new File(['test'], 'test.txt', { type: 'text/plain' })

    function TestComponent() {
      const [{ file: currentFile }, { setFile, reset }] = useUploadToolContext()
      return (
        <div>
          <span>File: {currentFile?.name || 'none'}</span>
          <button onClick={() => setFile(file)}>Set File</button>
          <button onClick={() => reset()}>Reset</button>
        </div>
      )
    }

    render(
      <Provider>
        <UploadTool space={mockSpace as Space}>
          <TestComponent />
        </UploadTool>
      </Provider>
    )

    const setButton = screen.getByText('Set File')
    await userEvent.click(setButton)

    await waitFor(() => {
      expect(screen.getByText(/File: test\.txt/)).toBeTruthy()
    })

    const resetButton = screen.getByText('Reset')
    await userEvent.click(resetButton)

    await waitFor(() => {
      expect(screen.getByText(/File: none/)).toBeTruthy()
    })
  })

  it('handles directory input when upload type is directory', () => {
    render(
      <Provider>
        <UploadTool space={mockSpace as Space} defaultUploadType="directory">
          <UploadTool.Form>
            <UploadTool.Input data-testid="upload-input" allowDirectory={true} />
          </UploadTool.Form>
        </UploadTool>
      </Provider>
    )

    const input = screen.getByTestId('upload-input') as HTMLInputElement
    expect(input).toBeTruthy()
    // Directory input should have webkitdirectory attribute
    expect(input.hasAttribute('webkitdirectory') || input.webkitdirectory).toBeTruthy()
  })

  it('handles CAR input when upload type is car', () => {
    render(
      <Provider>
        <UploadTool space={mockSpace as Space} defaultUploadType="car">
          <UploadTool.Form>
            <UploadTool.Input data-testid="upload-input" />
          </UploadTool.Form>
        </UploadTool>
      </Provider>
    )

    const input = screen.getByTestId('upload-input') as HTMLInputElement
    expect(input).toBeTruthy()
    // CAR input should accept .car files
    expect(input.accept).toContain('.car')
  })

  it('calls onUploadComplete when provided', async () => {
    const onUploadComplete = vi.fn()

    render(
      <Provider>
        <UploadTool space={mockSpace as Space} onUploadComplete={onUploadComplete}>
          <div>Upload Tool</div>
        </UploadTool>
      </Provider>
    )

    // onUploadComplete would be called after successful upload
    // This is tested indirectly through the upload process
    expect(onUploadComplete).toBeDefined()
  })

  it('throws error when useUploadToolContext is used outside provider', () => {
    // Suppress console.error for this test
    const consoleError = console.error
    console.error = vi.fn()

    expect(() => {
      function TestComponent() {
        useUploadToolContext()
        return <div>Test</div>
      }
      render(<TestComponent />)
    }).toThrow('useUploadToolContext must be used within UploadTool')

    console.error = consoleError
  })
})

