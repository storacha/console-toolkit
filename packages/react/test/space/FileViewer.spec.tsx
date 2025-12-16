import React from 'react'
import 'fake-indexeddb/auto'
import { test, expect, vi, beforeEach, describe } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { Provider, FileViewer, useFileViewerContext } from '../../src/index.js'

describe('FileViewer Component Suite', () => {
  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  describe('FileViewerProvider', () => {
    test('provides file viewer context', () => {
      function TestComponent() {
        const [{ root, isLoading }] = useFileViewerContext()
        return <div>Root: {root?.toString() || 'none'}, Loading: {isLoading ? 'yes' : 'no'}</div>
      }

      render(
        <Provider>
          <FileViewer>
            <TestComponent />
          </FileViewer>
        </Provider>
      )

      expect(screen.getByText(/Root:/)).toBeTruthy()
    })
  })

  describe('FileViewerRoot', () => {
    test('renders root component', () => {
      render(
        <Provider>
          <FileViewer>
            <FileViewer.Root />
          </FileViewer>
        </Provider>
      )

      // Should render nothing if no root, or root CID if provided
      expect(screen.queryByText(/Root CID/)).toBeFalsy()
    })
  })

  describe('FileViewerURL', () => {
    test('renders URL component', () => {
      render(
        <Provider>
          <FileViewer>
            <FileViewer.URL />
          </FileViewer>
        </Provider>
      )

      // Should render nothing if no root
      expect(screen.queryByText(/URL/)).toBeFalsy()
    })
  })

  describe('FileViewerShards', () => {
    test('renders shards component', () => {
      render(
        <Provider>
          <FileViewer>
            <FileViewer.Shards />
          </FileViewer>
        </Provider>
      )

      // Should render loading or nothing
      expect(screen.queryByText(/Loading shards|Shards/)).toBeFalsy()
    })
  })

  describe('FileViewerRemoveButton', () => {
    test('renders remove button', () => {
      render(
        <Provider>
          <FileViewer>
            <FileViewer.RemoveButton />
          </FileViewer>
        </Provider>
      )

      const button = screen.getByText('Remove')
      expect(button).toBeTruthy()
      // Button is not disabled when no root, only when loading
      expect((button as HTMLButtonElement).disabled).toBe(false)
    })
  })
})

