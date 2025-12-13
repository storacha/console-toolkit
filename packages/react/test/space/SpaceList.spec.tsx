import React from 'react'
import 'fake-indexeddb/auto'
import { test, expect, vi, beforeEach, describe } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { Provider, SpaceList, useSpaceListContext } from '../../src/index.js'

describe('SpaceList Component Suite', () => {
  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  describe('SpaceListProvider', () => {
    test('provides space list context', () => {
      function TestComponent() {
        const [{ uploads, isLoading }] = useSpaceListContext()
        return <div>Uploads: {uploads.length}, Loading: {isLoading ? 'yes' : 'no'}</div>
      }

      render(
        <Provider>
          <SpaceList>
            <TestComponent />
          </SpaceList>
        </Provider>
      )

      expect(screen.getByText(/Uploads:/)).toBeTruthy()
    })
  })

  describe('SpaceListList', () => {
    test('renders list component', () => {
      render(
        <Provider>
          <SpaceList>
            <SpaceList.List />
          </SpaceList>
        </Provider>
      )

      // Should render empty state or loading
      expect(screen.getByText(/No uploads found|Loading/)).toBeTruthy()
    })
  })

  describe('SpaceListPagination', () => {
    test('renders pagination controls', () => {
      render(
        <Provider>
          <SpaceList>
            <SpaceList.Pagination />
          </SpaceList>
        </Provider>
      )

      expect(screen.getByText('Previous')).toBeTruthy()
      expect(screen.getByText('Next')).toBeTruthy()
      expect(screen.getByText('Refresh')).toBeTruthy()
    })
  })
})

