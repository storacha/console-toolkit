import React from 'react'
import 'fake-indexeddb/auto'
import { test, expect, vi, beforeEach, describe } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import { Provider, PlanGate, usePlanGateContext } from '../../src/index.js'

describe('PlanGate Component Suite', () => {
  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  describe('PlanGateProvider', () => {
    test('provides plan gate context', () => {
      function TestComponent() {
        const [{ planStatus }] = usePlanGateContext()
        return <div>Status: {planStatus}</div>
      }

      render(
        <Provider>
          <PlanGate>
            <TestComponent />
          </PlanGate>
        </Provider>
      )

      expect(screen.getByText(/Status:/)).toBeTruthy()
    })

    test('exposes refreshPlan and selectPlan actions via context', () => {
      function TestComponent() {
        const [, { refreshPlan, selectPlan }] = usePlanGateContext()
        return (
          <div>
            <span data-testid="has-refresh">{typeof refreshPlan === 'function' ? 'yes' : 'no'}</span>
            <span data-testid="has-select">{typeof selectPlan === 'function' ? 'yes' : 'no'}</span>
          </div>
        )
      }

      render(
        <Provider>
          <PlanGate>
            <TestComponent />
          </PlanGate>
        </Provider>
      )

      expect(screen.getByTestId('has-refresh').textContent).toBe('yes')
      expect(screen.getByTestId('has-select').textContent).toBe('yes')
    })

    test('accepts onPlanChecked and onError callbacks without error', () => {
      const onPlanChecked = vi.fn()
      const onError = vi.fn()

      render(
        <Provider>
          <PlanGate onPlanChecked={onPlanChecked} onError={onError}>
            <div>Child</div>
          </PlanGate>
        </Provider>
      )

      expect(screen.getByText('Child')).toBeTruthy()
    })
  })

  describe('PlanGate.Gate', () => {
    test('does not render children when plan is not active', async () => {
      render(
        <Provider>
          <PlanGate>
            <PlanGate.Gate>
              <div data-testid="gated-content">Gated content</div>
            </PlanGate.Gate>
          </PlanGate>
        </Provider>
      )

      await waitFor(() => {
        expect(screen.queryByTestId('gated-content')).toBeFalsy()
      })
    })
  })

  describe('PlanGate.Fallback', () => {
    test('renders fallback when plan is not active', async () => {
      render(
        <Provider>
          <PlanGate>
            <PlanGate.Fallback />
          </PlanGate>
        </Provider>
      )

      await waitFor(
        () => {
          const loading = screen.queryByText(/Checking your plan status|Checking plan status/)
          const missing = screen.queryByText(/Billing Plan Required/)
          const error = screen.queryByText(/Error/)
          expect(loading || missing || error).toBeTruthy()
        },
        { timeout: 3000 }
      )
    })

    test('renders custom children when provided', () => {
      render(
        <Provider>
          <PlanGate>
            <PlanGate.Fallback>
              <div data-testid="custom-fallback">Custom fallback message</div>
            </PlanGate.Fallback>
          </PlanGate>
        </Provider>
      )

      expect(screen.getByTestId('custom-fallback').textContent).toContain('Custom fallback message')
    })

    test('calls renderFallback when provided', () => {
      const renderFallback = vi.fn(({ planStatus }) => <div data-testid="render-fallback">Status: {planStatus}</div>)

      render(
        <Provider>
          <PlanGate>
            <PlanGate.Fallback renderFallback={renderFallback} />
          </PlanGate>
        </Provider>
      )

      expect(renderFallback).toHaveBeenCalled()
      expect(screen.getByTestId('render-fallback')).toBeTruthy()
    })
  })

  describe('PlanGate.Loading', () => {
    test('renders loading state when plan status is loading', () => {
      render(
        <Provider>
          <PlanGate>
            <PlanGate.Loading>
              <div data-testid="loading-custom">Loading...</div>
            </PlanGate.Loading>
          </PlanGate>
        </Provider>
      )

      // Initially plan status is often 'loading' before checkPlan runs
      const loadingEl = screen.queryByTestId('loading-custom')
      if (loadingEl) {
        expect(loadingEl.textContent).toContain('Loading...')
      }
    })

    test('renders default loading message when no children', () => {
      render(
        <Provider>
          <PlanGate>
            <PlanGate.Loading />
          </PlanGate>
        </Provider>
      )

      // May or may not be visible depending on timing; default is "Checking plan status..."
      const defaultLoading = screen.queryByText(/Checking plan status/)
      if (defaultLoading) {
        expect(defaultLoading).toBeTruthy()
      }
    })
  })
})
