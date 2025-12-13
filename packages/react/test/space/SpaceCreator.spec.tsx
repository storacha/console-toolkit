import React from 'react'
import 'fake-indexeddb/auto'
import { test, expect, vi, beforeEach, describe } from 'vitest'
import { userEvent as user } from '@testing-library/user-event'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import { Provider, SpaceCreator, useSpaceCreatorContext } from '../../src/index.js'

describe('SpaceCreator Component Suite', () => {
  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  describe('SpaceCreatorProvider', () => {
    test('provides space creator context', () => {
      function TestComponent() {
        const [{ name, accessType }] = useSpaceCreatorContext()
        return <div>Name: {name}, Type: {accessType}</div>
      }

      render(
        <Provider>
          <SpaceCreator>
            <TestComponent />
          </SpaceCreator>
        </Provider>
      )

      expect(screen.getByText(/Name:/)).toBeTruthy()
    })
  })

  describe('SpaceCreatorForm', () => {
    test('renders form with name input', () => {
      render(
        <Provider>
          <SpaceCreator>
            <SpaceCreator.Form />
          </SpaceCreator>
        </Provider>
      )

      const input = screen.getByPlaceholderText('Space name') || screen.getByRole('textbox')
      expect(input).toBeTruthy()
    })

    test('updates name on input change', async () => {
      render(
        <Provider>
          <SpaceCreator>
            <SpaceCreator.Form />
          </SpaceCreator>
        </Provider>
      )

      const input = screen.getByPlaceholderText('Space name') || screen.getByRole('textbox')
      await user.type(input, 'My Space')

      await waitFor(() => {
        expect((input as HTMLInputElement).value).toBe('My Space')
      })
    })
  })

  describe('SpaceCreatorNameInput', () => {
    test('renders name input', () => {
      render(
        <Provider>
          <SpaceCreator>
            <SpaceCreator.NameInput placeholder="Enter name" />
          </SpaceCreator>
        </Provider>
      )

      const input = screen.getByPlaceholderText('Enter name')
      expect(input).toBeTruthy()
    })
  })

  describe('SpaceCreatorAccessTypeSelect', () => {
    test('renders access type select', () => {
      render(
        <Provider>
          <SpaceCreator>
            <SpaceCreator.AccessTypeSelect />
          </SpaceCreator>
        </Provider>
      )

      const select = screen.getByRole('combobox') || screen.getByDisplayValue('Public')
      expect(select).toBeTruthy()
    })
  })
})

