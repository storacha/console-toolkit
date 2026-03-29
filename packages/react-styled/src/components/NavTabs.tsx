import React from 'react'

export type NavTab = 'spaces' | 'import' | 'create' | 'settings'

export interface NavTabsProps {
  active: NavTab
  onTabChange: (tab: NavTab) => void
}

const TABS: { id: NavTab; label: string; icon: string }[] = [
  { id: 'spaces',   label: 'Spaces',   icon: '≡' },
  { id: 'import',   label: 'Import',   icon: '⊕' },
  { id: 'create',   label: 'Create',   icon: '⊡' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
]

export function NavTabs({ active, onTabChange }: NavTabsProps) {
  return (
    <div className="nav-tabs">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`nav-tab${active === tab.id ? ' nav-tab-active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span className="nav-tab-icon">{tab.icon}</span>
          {tab.label.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
