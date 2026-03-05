import { test, expect, vi, beforeEach, describe } from 'vitest'
import { render, screen, cleanup, waitFor } from '@testing-library/react'
import 'fake-indexeddb/auto'
import { Provider, StorachaAuth as HeadlessStorachaAuth } from '@storacha/console-toolkit-react'
import { StorachaAuth } from '../src/components/StorachaAuth.js'

describe('StorachaAuth Styled Component Suite', () => {
  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  describe('StorachaAuth.Form', () => {
    test('renders styled form with correct elements', () => {
      render(
        <Provider>
          <HeadlessStorachaAuth>
            <StorachaAuth.Form />
          </HeadlessStorachaAuth>
        </Provider>
      )

      // Check logo with alt text "Storacha"
      expect(screen.getByAltText('Storacha')).toBeTruthy()
      
      // Check email label
      expect(screen.getByLabelText('Email')).toBeTruthy()
      
      // Check authorize button
      expect(screen.getByRole('button', { name: 'Authorize' })).toBeTruthy()
      
      // Check terms of service text
      expect(screen.getByText(/By registering with storacha.network/)).toBeTruthy()
      expect(screen.getByText(/Terms of Service/)).toBeTruthy()
    })

    test('renders email input with correct attributes', () => {
      render(
        <Provider>
          <HeadlessStorachaAuth>
            <StorachaAuth.Form />
          </HeadlessStorachaAuth>
        </Provider>
      )

      const emailInput = screen.getByLabelText('Email')
      expect(emailInput).toBeTruthy()
      expect(emailInput.getAttribute('id')).toBe('storacha-auth-email')
    })
  })

  describe('StorachaAuth.EmailInput', () => {
    test('renders standalone email input component', () => {
      render(
        <Provider>
          <HeadlessStorachaAuth>
            <HeadlessStorachaAuth.Form>
              <StorachaAuth.EmailInput />
            </HeadlessStorachaAuth.Form>
          </HeadlessStorachaAuth>
        </Provider>
      )

      const emailInput = screen.getByRole('textbox')
      expect(emailInput).toBeTruthy()
      expect(emailInput.getAttribute('id')).toBe('storacha-auth-email')
    })
  })

  describe('StorachaAuth.CancelButton', () => {
    test('renders cancel button with correct text', () => {
      render(
        <Provider>
          <HeadlessStorachaAuth>
            <StorachaAuth.CancelButton />
          </HeadlessStorachaAuth>
        </Provider>
      )

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeTruthy()
    })
  })

  describe('StorachaAuth.Submitted', () => {
    test('renders submitted state with email verification message', () => {
      render(
        <Provider>
          <HeadlessStorachaAuth>
            <StorachaAuth.Submitted />
          </HeadlessStorachaAuth>
        </Provider>
      )

      // Check for verification title
      expect(screen.getByText('Verify your email address!')).toBeTruthy()
      
      // Check for logo
      expect(screen.getByAltText('Storacha')).toBeTruthy()
      
      // Check for cancel button
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeTruthy()
      
      // Check for instruction text
      expect(screen.getByText(/authorize this agent/)).toBeTruthy()
      expect(screen.getByText(/check your spam folder/)).toBeTruthy()
    })
  })

  describe('StorachaAuth.Ensurer', () => {
    test('renders loader initially during initialization', () => {
      render(
        <Provider>
          <HeadlessStorachaAuth>
            <StorachaAuth.Ensurer>
              <div data-testid="authenticated-content">Authenticated!</div>
            </StorachaAuth.Ensurer>
          </HeadlessStorachaAuth>
        </Provider>
      )

      // Should show the loader during initialization
      expect(screen.getByText('Initializing')).toBeTruthy()
      expect(screen.getByText('Setting up authentication...')).toBeTruthy()
    })

    test('renders form after initialization when not authenticated', async () => {
      render(
        <Provider>
          <HeadlessStorachaAuth>
            <StorachaAuth.Ensurer>
              <div data-testid="authenticated-content">Authenticated!</div>
            </StorachaAuth.Ensurer>
          </HeadlessStorachaAuth>
        </Provider>
      )

      // Wait for the form to appear after initialization
      await waitFor(() => {
        expect(screen.getByLabelText('Email')).toBeTruthy()
      })
      
      expect(screen.getByRole('button', { name: 'Authorize' })).toBeTruthy()
    })

    test('renders with proper styling classes after initialization', async () => {
      render(
        <Provider>
          <HeadlessStorachaAuth>
            <StorachaAuth.Ensurer>
              <div>Content</div>
            </StorachaAuth.Ensurer>
          </HeadlessStorachaAuth>
        </Provider>
      )

      // Wait for the form to appear
      await waitFor(() => {
        const form = document.querySelector('.storacha-auth-form')
        expect(form).toBeTruthy()
      })
    })
  })

  describe('Export functionality', () => {
    test('exports useStorachaAuth hook from headless package', async () => {
      const { useStorachaAuth } = await import('../src/components/StorachaAuth.js')
      expect(useStorachaAuth).toBeDefined()
      expect(typeof useStorachaAuth).toBe('function')
    })

    test('StorachaAuth has all required subcomponents', () => {
      expect(StorachaAuth.Form).toBeDefined()
      expect(StorachaAuth.EmailInput).toBeDefined()
      expect(StorachaAuth.CancelButton).toBeDefined()
      expect(StorachaAuth.Submitted).toBeDefined()
      expect(StorachaAuth.Ensurer).toBeDefined()
    })
  })
})
