import 'fake-indexeddb/auto'
import { test, expect, vi, beforeEach, afterEach, describe } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { StorachaErrorBoundary } from '../src/index.js'

function ThrowingChild() {
  throw new Error('boom')
}

describe('StorachaErrorBoundary', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  test('renders children when there is no error', () => {
    render(
      <StorachaErrorBoundary>
        <div>Safe content</div>
      </StorachaErrorBoundary>
    )

    expect(screen.getByText('Safe content')).toBeTruthy()
  })

  test('renders default fallback UI when a child throws', () => {
    render(
      <StorachaErrorBoundary>
        <ThrowingChild />
      </StorachaErrorBoundary>
    )

    expect(screen.getByText('Something went wrong.')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeTruthy()
    expect(screen.getByText('boom')).toBeTruthy()
  })

  test('renders static fallback when provided', () => {
    render(
      <StorachaErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowingChild />
      </StorachaErrorBoundary>
    )

    expect(screen.getByText('Custom fallback')).toBeTruthy()
  })

  test('prefers renderFallback and supports reset', () => {
    let shouldThrow = true

    function ThrowOnce() {
      if (shouldThrow) {
        throw new Error('boom once')
      }

      return <div>Recovered content</div>
    }

    const renderFallback = vi.fn((error: Error, reset: () => void) => (
      <button
        type="button"
        onClick={() => {
          shouldThrow = false
          reset()
        }}
      >
        Retry {error.message}
      </button>
    ))

    render(
      <StorachaErrorBoundary
        fallback={<div>Static fallback</div>}
        renderFallback={renderFallback}
      >
        <ThrowOnce />
      </StorachaErrorBoundary>
    )

    expect(renderFallback).toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Retry boom once' })).toBeTruthy()
    expect(screen.queryByText('Static fallback')).toBeFalsy()

    fireEvent.click(screen.getByRole('button', { name: 'Retry boom once' }))

    expect(screen.getByText('Recovered content')).toBeTruthy()
  })

  test('calls onError when an error is caught', async () => {
    const onError = vi.fn()

    render(
      <StorachaErrorBoundary onError={onError}>
        <ThrowingChild />
      </StorachaErrorBoundary>
    )

    await waitFor(() => {
      expect(onError).toHaveBeenCalledTimes(1)
    })

    const [error, errorInfo] = onError.mock.calls[0]

    expect((error as Error).message).toBe('boom')
    expect(typeof errorInfo.componentStack).toBe('string')
  })
})
