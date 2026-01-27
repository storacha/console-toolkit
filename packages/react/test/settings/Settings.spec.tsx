import React from 'react'
import 'fake-indexeddb/auto'
import { test, expect, vi, beforeEach, describe } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import { 
  Provider, 
  SettingsProvider, 
  useSettingsContext,
  RewardsSection,
  AccountOverview,
  UsageSection,
  AccountManagement,
  ChangePlan,
} from '../../src/index.js'

describe('Settings Component Suite', () => {
  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  describe('SettingsProvider', () => {
    test('provides settings context', () => {
      function TestComponent() {
        const [{ accountEmail, planLoading }] = useSettingsContext()
        return <div>Email: {accountEmail}, Loading: {planLoading}</div>
      }

      render(
        <Provider>
          <SettingsProvider>
            <TestComponent />
          </SettingsProvider>
        </Provider>
      )

      expect(screen.getByText(/Email:/)).toBeTruthy()
    })
  })

  describe('RewardsSection', () => {
    test('renders rewards section', () => {
      render(
        <Provider>
          <SettingsProvider>
            <RewardsSection data-testid="rewards-section" />
          </SettingsProvider>
        </Provider>
      )

      const section = screen.getByTestId('rewards-section')
      expect(section).toBeTruthy()
    })
  })

  describe('AccountOverview', () => {
    test('renders account overview', () => {
      render(
        <Provider>
          <SettingsProvider>
            <AccountOverview data-testid="account-overview" />
          </SettingsProvider>
        </Provider>
      )

      const overview = screen.getByTestId('account-overview')
      expect(overview).toBeTruthy()
    })
  })

  describe('UsageSection', () => {
    test('renders usage section', () => {
      render(
        <Provider>
          <SettingsProvider>
            <UsageSection data-testid="usage-section" />
          </SettingsProvider>
        </Provider>
      )

      const section = screen.getByTestId('usage-section')
      expect(section).toBeTruthy()
    })
  })

  describe('AccountManagement', () => {
    test('renders account management', () => {
      render(
        <Provider>
          <SettingsProvider>
            <AccountManagement data-testid="account-management" />
          </SettingsProvider>
        </Provider>
      )

      const management = screen.getByTestId('account-management')
      expect(management).toBeTruthy()
    })
  })

  describe('ChangePlan', () => {
    test('renders change plan', () => {
      render(
        <Provider>
          <SettingsProvider>
            <ChangePlan data-testid="change-plan" />
          </SettingsProvider>
        </Provider>
      )

      const changePlan = screen.getByTestId('change-plan')
      expect(changePlan).toBeTruthy()
    })
  })
})

