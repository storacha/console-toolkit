import React, { useState, type ReactNode } from 'react'
import type { Space } from '@storacha/ui-core'
import { storachaLogoUrl, rachaFireBgHalfUrl } from '../assets/index.js'

export interface ConsoleLayoutProps {
  children: ReactNode
  spaces: Space[]
  selectedSpace?: Space
  onSpaceSelect?: (space: Space) => void
  onCreateSpace?: () => void
  onLogout?: () => void
  onHome?: () => void
  nav?: ReactNode
}

export function ConsoleLayout({
  children,
  spaces,
  selectedSpace,
  onSpaceSelect,
  onCreateSpace,
  onLogout,
  onHome,
  nav,
}: ConsoleLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="console-shell">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="console-mobile-overlay"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <nav className={`console-sidebar${sidebarOpen ? ' open' : ''}`}>
        {/* Logo */}
        <div className="console-sidebar-logo">
          {onHome ? (
            <button className="console-sidebar-logo-btn" onClick={onHome} aria-label="Go to home">
              <img src={storachaLogoUrl} alt="Storacha" />
            </button>
          ) : (
            <img src={storachaLogoUrl} alt="Storacha" />
          )}
        </div>

        {/* Spaces section — compact select */}
        <div className="console-sidebar-spaces">
          <div className="console-sidebar-section-label">Spaces</div>
          <select
            className="console-space-select"
            value={selectedSpace?.did() ?? ''}
            onChange={(e) => {
              const space = spaces.find((s) => s.did() === e.target.value)
              if (space) {
                onSpaceSelect?.(space)
                closeSidebar()
              }
            }}
          >
            <option value="">Select a space…</option>
            {spaces.map((space) => (
              <option key={space.did()} value={space.did()}>
                {space.name || 'Untitled'}
              </option>
            ))}
          </select>
          {onCreateSpace && (
            <button
              className="console-btn-outline console-btn-sm"
              style={{ marginTop: '0.5rem' }}
              onClick={() => {
                onCreateSpace()
                closeSidebar()
              }}
            >
              + Create Space
            </button>
          )}
        </div>

        {/* Spacer pushes footer to bottom */}
        <div style={{ flex: 1 }} />

        {/* Footer links — bottom of sidebar */}
        <div className="console-sidebar-footer">
          <div className="console-sidebar-footer-links">
            <a className="console-sidebar-footer-link" href="https://docs.storacha.network/terms/" target="_blank" rel="noopener noreferrer">Terms</a>
            <a className="console-sidebar-footer-link" href="https://docs.storacha.network/" target="_blank" rel="noopener noreferrer">Docs</a>
            <a className="console-sidebar-footer-link" href="mailto:support@storacha.network">Support</a>
            {onLogout && (
              <button className="console-sidebar-footer-link console-sidebar-logout" onClick={onLogout}>
                Log Out
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main area */}
      <div
        className="console-main"
        style={{
          background: `#EFE3F3 url(${rachaFireBgHalfUrl}) bottom left / 100% auto no-repeat`,
        }}
      >
        {/* Mobile top bar */}
        <div className="console-mobile-topbar">
          <button
            className="console-hamburger"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
          <img src={storachaLogoUrl} alt="Storacha" style={{ width: '7rem' }} />
        </div>

        {nav && <div className="console-main-nav">{nav}</div>}
        <main className="console-main-content">
          {children}
        </main>
      </div>
    </div>
  )
}
