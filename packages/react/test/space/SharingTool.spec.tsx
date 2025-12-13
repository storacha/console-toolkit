import React from 'react'
import 'fake-indexeddb/auto'
import { test, expect, vi, beforeEach, describe } from 'vitest'
import { userEvent as user } from '@testing-library/user-event'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import { Provider, SharingTool, useSharingToolContext } from '../../src/index.js'

describe('SharingTool Component Suite', () => {
  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  describe('SharingToolProvider', () => {
    test('provides sharing tool context', () => {
      function TestComponent() {
        const [{ value, sharedEmails }] = useSharingToolContext()
        return <div>Value: {value}, Shared: {sharedEmails.length}</div>
      }

      render(
        <Provider>
          <SharingTool>
            <TestComponent />
          </SharingTool>
        </Provider>
      )

      expect(screen.getByText(/Value:/)).toBeTruthy()
    })
  })

  describe('SharingToolForm', () => {
    test('renders sharing form', () => {
      render(
        <Provider>
          <SharingTool>
            <SharingTool.Form />
          </SharingTool>
        </Provider>
      )

      const input = screen.getByPlaceholderText('Email or DID') || screen.getByRole('textbox')
      expect(input).toBeTruthy()
    })
  })

  describe('SharingToolInput', () => {
    test('renders input and updates value', async () => {
      function TestComponent() {
        const [{ value }] = useSharingToolContext()
        return <div>Value: {value}</div>
      }

      render(
        <Provider>
          <SharingTool>
            <SharingTool.Input placeholder="Enter email or DID" />
            <TestComponent />
          </SharingTool>
        </Provider>
      )

      const input = screen.getByPlaceholderText('Enter email or DID')
      await user.type(input, 'test@example.com')

      await waitFor(() => {
        expect(screen.getByText(/Value: test@example.com/)).toBeTruthy()
      })
    })
  })

  describe('SharingToolSharedList', () => {
    test('renders shared list', () => {
      render(
        <Provider>
          <SharingTool>
            <SharingTool.SharedList />
          </SharingTool>
        </Provider>
      )

      // Should render nothing if no shared emails
      expect(screen.queryByText(/email/)).toBeFalsy()
    })
  })
})

