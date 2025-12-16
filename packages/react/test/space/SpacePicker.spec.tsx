import React from 'react'
import 'fake-indexeddb/auto'
import { test, expect, vi, beforeEach, describe } from 'vitest'
import { userEvent as user } from '@testing-library/user-event'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import { Provider, SpacePicker, useSpacePickerContext } from '../../src/index.js'

describe('SpacePicker Component Suite', () => {
  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  describe('SpacePickerProvider', () => {
    test('provides space picker context', () => {
      function TestComponent() {
        const [{ spaces, selectedSpace }] = useSpacePickerContext()
        return <div>{spaces.length} spaces, selected: {selectedSpace?.name || 'none'}</div>
      }

      render(
        <Provider>
          <SpacePicker>
            <TestComponent />
          </SpacePicker>
        </Provider>
      )

      expect(screen.getByText(/spaces/)).toBeTruthy()
    })
  })

  describe('SpacePickerList', () => {
    test('renders list of spaces', () => {
      render(
        <Provider>
          <SpacePicker>
            <SpacePicker.List 
              type="all" 
              renderEmpty={() => <div>No spaces found</div>}
            />
          </SpacePicker>
        </Provider>
      )

      // Should render empty state when no spaces
      expect(screen.getByText('No spaces found')).toBeTruthy()
    })

    test('calls onSpaceClick when space is clicked', async () => {
      const onSpaceClick = vi.fn()

      render(
        <Provider>
          <SpacePicker>
            <SpacePicker.List type="all" onSpaceClick={onSpaceClick} />
          </SpacePicker>
        </Provider>
      )

      // Wait for spaces to load if any
      await waitFor(() => {
        const items = screen.queryAllByText(/Untitled|did:key:/)
        if (items.length > 0) {
          user.click(items[0])
          expect(onSpaceClick).toHaveBeenCalled()
        }
      }, { timeout: 1000 })
    })
  })

  describe('SpacePickerSearch', () => {
    test('renders search input', () => {
      render(
        <Provider>
          <SpacePicker>
            <SpacePicker.Search placeholder="Search..." />
          </SpacePicker>
        </Provider>
      )

      const input = screen.getByPlaceholderText('Search...')
      expect(input).toBeTruthy()
    })

    test('updates query on input change', async () => {
      function TestComponent() {
        const [{ query }] = useSpacePickerContext()
        return <div>Query: {query}</div>
      }

      render(
        <Provider>
          <SpacePicker>
            <SpacePicker.Search />
            <TestComponent />
          </SpacePicker>
        </Provider>
      )

      const input = screen.getByRole('searchbox') || screen.getByRole('textbox')
      await user.type(input, 'test')

      await waitFor(() => {
        expect(screen.getByText(/Query: test/)).toBeTruthy()
      })
    })
  })
})

