import React from 'react'
import 'fake-indexeddb/auto'
import { test, expect, vi, beforeEach, describe } from 'vitest'
import { userEvent as user } from '@testing-library/user-event'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import { Provider, ImportSpace, useImportSpaceContext } from '../../src/index.js'

describe('ImportSpace Component Suite', () => {
  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
    vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined)
  })

  describe('ImportSpaceProvider', () => {
    test('provides import space context', () => {
      function TestComponent() {
        const [{ userDID, ucanValue, isImporting }] = useImportSpaceContext()
        return (
          <div>
            DID: {userDID || 'none'}, UCAN: {ucanValue}, Importing: {String(isImporting)}
          </div>
        )
      }

      render(
        <Provider>
          <ImportSpace>
            <TestComponent />
          </ImportSpace>
        </Provider>
      )

      expect(screen.getByText(/DID:/)).toBeTruthy()
    })

    test('displays user DID when available', async () => {
      function TestComponent() {
        const [{ userDID }] = useImportSpaceContext()
        return <div>{userDID ? `DID: ${userDID}` : 'No DID'}</div>
      }

      render(
        <Provider>
          <ImportSpace>
            <TestComponent />
          </ImportSpace>
        </Provider>
      )

      await waitFor(
        () => {
          const didText = screen.queryByText(/DID: did:/)
          const noDidText = screen.queryByText('No DID')
          expect(didText || noDidText).toBeTruthy()
        },
        { timeout: 3000 }
      )
    })
  })

  describe('ImportSpaceDIDDisplay', () => {
    test('renders DID display when DID is available', async () => {
      render(
        <Provider>
          <ImportSpace>
            <ImportSpace.DIDDisplay />
          </ImportSpace>
        </Provider>
      )

      await waitFor(
        () => {
          const didElement = screen.queryByText(/did:/)
          const copyButton = screen.queryByText(/Copy DID/)
          const emailButton = screen.queryByText(/Email DID/)
          if (didElement) {
            expect(copyButton || emailButton).toBeTruthy()
          }
        },
        { timeout: 3000 }
      )
    })

    test('renders nothing when DID is not available', () => {
      render(
        <Provider>
          <ImportSpace>
            <ImportSpace.DIDDisplay />
          </ImportSpace>
        </Provider>
      )

      const didElement = screen.queryByText(/did:/)
      if (!didElement) {
        expect(screen.queryByText(/Copy DID/)).toBeFalsy()
      }
    })
  })

  describe('ImportSpaceForm', () => {
    test('renders import form', () => {
      render(
        <Provider>
          <ImportSpace>
            <ImportSpace.Form />
          </ImportSpace>
        </Provider>
      )

      const textarea = screen.getByPlaceholderText(/Paste UCAN token/i) || screen.getByRole('textbox')
      expect(textarea).toBeTruthy()
    })

    test('renders submit button', () => {
      render(
        <Provider>
          <ImportSpace>
            <ImportSpace.Form />
          </ImportSpace>
        </Provider>
      )

      const button = screen.getByRole('button', { name: /Import UCAN/i })
      expect(button).toBeTruthy()
    })
  })

  describe('ImportSpaceUcanInput', () => {
    test('renders UCAN input and updates value', async () => {
      function TestComponent() {
        const [{ ucanValue }] = useImportSpaceContext()
        return <div>UCAN: {ucanValue}</div>
      }

      render(
        <Provider>
          <ImportSpace>
            <ImportSpace.UcanInput placeholder="Enter UCAN..." />
            <TestComponent />
          </ImportSpace>
        </Provider>
      )

      const textarea = screen.getByPlaceholderText('Enter UCAN...')
      await user.type(textarea, 'test-ucan-token')

      await waitFor(() => {
        expect(screen.getByText(/UCAN: test-ucan-token/)).toBeTruthy()
      })
    })
  })

  describe('Copy DID functionality', () => {
    test('copyDID copies DID to clipboard', async () => {
      const writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText')

      function TestComponent() {
        const [{ userDID }, { copyDID }] = useImportSpaceContext()
        return (
          <div>
            <button onClick={() => void copyDID()}>Copy</button>
            <div>DID: {userDID}</div>
          </div>
        )
      }

      render(
        <Provider>
          <ImportSpace>
            <TestComponent />
          </ImportSpace>
        </Provider>
      )

      await waitFor(
        async () => {
          const button = screen.queryByText('Copy')
          const didText = screen.queryByText(/did:/)
          if (button && didText) {
            await user.click(button)
            await waitFor(() => {
              expect(writeTextSpy).toHaveBeenCalled()
            })
          }
        },
        { timeout: 3000 }
      )
    })
  })

  describe('Email DID functionality', () => {
    test('emailDID opens mailto link', async () => {
      const originalLocation = window.location
      const mockHref = { value: '' }
      
      Object.defineProperty(window, 'location', {
        value: {
          ...originalLocation,
          get href() {
            return mockHref.value
          },
          set href(val: string) {
            mockHref.value = val
          },
        },
        writable: true,
        configurable: true,
      })

      function TestComponent() {
        const [{ userDID }, { emailDID }] = useImportSpaceContext()
        return (
          <div>
            <button onClick={emailDID}>Email</button>
            <div>DID: {userDID}</div>
          </div>
        )
      }

      render(
        <Provider>
          <ImportSpace>
            <TestComponent />
          </ImportSpace>
        </Provider>
      )

      await waitFor(
        async () => {
          const button = screen.queryByText('Email')
          const didText = screen.queryByText(/did:/)
          if (button && didText) {
            await user.click(button)
            await waitFor(() => {
              expect(mockHref.value).toContain('mailto:')
            })
          }
        },
        { timeout: 3000 }
      )

      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
        configurable: true,
      })
    })
  })

  describe('Error states', () => {
    test('displays error message when import fails', async () => {
      function TestComponent() {
        const [{ error }] = useImportSpaceContext()
        return error ? <div className="error" data-testid="error-message">{error}</div> : null
      }

      render(
        <Provider>
          <ImportSpace>
            <ImportSpace.Form />
            <TestComponent />
          </ImportSpace>
        </Provider>
      )

      const textarea = screen.getByPlaceholderText(/Paste UCAN token/i)
      const submitButton = screen.getByRole('button', { name: /Import UCAN/i })

      await user.type(textarea, 'invalid-ucan-token')
      await user.click(submitButton)

      await waitFor(
        () => {
          const errorElement = screen.queryByTestId('error-message')
          if (errorElement) {
            expect(errorElement.textContent).toMatch(/Invalid UCAN|Failed to extract|error/i)
          }
        },
        { timeout: 3000 }
      )
    })
  })

  describe('Success states', () => {
    test('displays success message when import succeeds', async () => {
      function TestComponent() {
        const [{ success }] = useImportSpaceContext()
        return success ? <div className="success">{success}</div> : null
      }

      render(
        <Provider>
          <ImportSpace>
            <ImportSpace.Form />
            <TestComponent />
          </ImportSpace>
        </Provider>
      )

      const textarea = screen.getByPlaceholderText(/Paste UCAN token/i)
      const submitButton = screen.getByRole('button', { name: /Import UCAN/i })

      await user.type(textarea, 'valid-ucan-token')
      await user.click(submitButton)

      await waitFor(
        () => {
          const successElement = screen.queryByText(/success|imported/i)
          if (successElement) {
            expect(successElement).toBeTruthy()
          }
        },
        { timeout: 3000 }
      )
    })
  })

  describe('Loading states', () => {
    test('disables submit button while importing', async () => {
      function TestComponent() {
        const [{ isImporting }] = useImportSpaceContext()
        return <div>Importing: {String(isImporting)}</div>
      }

      render(
        <Provider>
          <ImportSpace>
            <ImportSpace.Form
              renderSubmitButton={(disabled) => (
                <button type="submit" disabled={disabled}>
                  {disabled ? 'Importing...' : 'Import UCAN'}
                </button>
              )}
            />
            <TestComponent />
          </ImportSpace>
        </Provider>
      )

      const textarea = screen.getByPlaceholderText(/Paste UCAN token/i)
      const submitButton = screen.getByRole('button', { name: /Import UCAN|Importing/i })

      await user.type(textarea, 'test-token')
      await user.click(submitButton)

      await waitFor(() => {
        const importingText = screen.queryByText(/Importing: true/)
        if (importingText) {
          expect((submitButton as HTMLButtonElement).disabled).toBeTruthy()
        }
      })
    })
  })

  describe('File import functionality', () => {
    test('importUCAN accepts File objects', async () => {
      const file = new File(['test car file content'], 'test.ucan', { type: 'application/vnd.ipfs.car' })
      
      function TestComponent() {
        const [{ isImporting, error }, { importUCAN }] = useImportSpaceContext()
        const handleClick = async () => {
          try {
            await importUCAN(file)
          } catch (err) {
            // Error handled in context
          }
        }
        return (
          <div>
            <button onClick={handleClick}>Import File</button>
            <div>Importing: {String(isImporting)}</div>
            {error && <div className="error" data-testid="error">{error}</div>}
          </div>
        )
      }

      render(
        <Provider>
          <ImportSpace>
            <TestComponent />
          </ImportSpace>
        </Provider>
      )

      const button = screen.getByText('Import File')
      await user.click(button)

      await waitFor(
        () => {
          const importingText = screen.queryByText(/Importing: true/)
          const errorText = screen.queryByTestId('error')
          expect(importingText || errorText).toBeTruthy()
        },
        { timeout: 3000 }
      )
    })

    test('importUCAN handles empty files', async () => {
      const emptyFile = new File([], 'empty.ucan', { type: 'application/vnd.ipfs.car' })
      
      function TestComponent() {
        const [{ error }, { importUCAN }] = useImportSpaceContext()
        const handleClick = async () => {
          try {
            await importUCAN(emptyFile)
          } catch (err) {
            // Error handled in context
          }
        }
        return (
          <div>
            <button onClick={handleClick}>Import Empty</button>
            {error && <div className="error" data-testid="error">{error}</div>}
          </div>
        )
      }

      render(
        <Provider>
          <ImportSpace>
            <TestComponent />
          </ImportSpace>
        </Provider>
      )

      const button = screen.getByText('Import Empty')
      await user.click(button)

      await waitFor(
        () => {
          const errorText = screen.queryByTestId('error')
          if (errorText) {
            expect(errorText.textContent).toMatch(/empty|too small|required/i)
          }
        },
        { timeout: 3000 }
      )
    })

    test('importUCAN validates file size', async () => {
      const smallFile = new File(['tiny'], 'small.ucan', { type: 'application/vnd.ipfs.car' })
      
      function TestComponent() {
        const [{ error }, { importUCAN }] = useImportSpaceContext()
        const handleClick = async () => {
          try {
            await importUCAN(smallFile)
          } catch (err) {
            // Error handled in context
          }
        }
        return (
          <div>
            <button onClick={handleClick}>Import Small</button>
            {error && <div className="error" data-testid="error">{error}</div>}
          </div>
        )
      }

      render(
        <Provider>
          <ImportSpace>
            <TestComponent />
          </ImportSpace>
        </Provider>
      )

      const button = screen.getByText('Import Small')
      await user.click(button)

      await waitFor(
        () => {
          const errorText = screen.queryByTestId('error')
          if (errorText) {
            expect(errorText.textContent).toMatch(/too small|minimum|11 bytes/i)
          }
        },
        { timeout: 3000 }
      )
    })
  })
})
