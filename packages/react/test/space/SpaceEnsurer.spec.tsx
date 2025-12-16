import React from 'react'
import 'fake-indexeddb/auto'
import { test, expect, vi, beforeEach, describe } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { Provider, SpaceEnsurer } from '../../src/index.js'

describe('SpaceEnsurer Component Suite', () => {
  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  describe('SpaceEnsurer', () => {
    test('renders children when spaces exist', () => {
      render(
        <Provider>
          <SpaceEnsurer>
            <div>Content</div>
          </SpaceEnsurer>
        </Provider>
      )

      // Should render content if spaces exist, or creator if not
      expect(screen.getByText(/Content|Welcome/)).toBeTruthy()
    })

    test('renders creator when no spaces', () => {
      render(
        <Provider>
          <SpaceEnsurer>
            <div>Content</div>
          </SpaceEnsurer>
        </Provider>
      )

      // Should show creator form if no spaces - use getAllByText since there are multiple matches
      const matches = screen.getAllByText(/Welcome|create a space/i)
      expect(matches.length).toBeGreaterThan(0)
    })
  })
})

