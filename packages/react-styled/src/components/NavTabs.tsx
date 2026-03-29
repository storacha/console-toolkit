import React from 'react'

export type NavTab = 'spaces' | 'import' | 'create' | 'settings' | 'uploads' | 'share' | 'upload'

export interface NavTabsProps {
  active: NavTab
  onTabChange: (tab: NavTab) => void
  hasSpace?: boolean
}

const HOME_TABS: { id: NavTab; label: string; icon: string }[] = [
  { id: 'spaces',   label: 'Spaces',   icon: '≡' },
  { id: 'import',   label: 'Import',   icon: '⊕' },
  { id: 'create',   label: 'Create',   icon: '⊡' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
]

const SPACE_TABS: { id: NavTab; label: string; icon: string }[] = [
  { id: 'uploads',  label: 'Uploads',  icon: '≡' },
  { id: 'share',    label: 'Share',    icon: '⇌' },
  { id: 'upload',   label: 'Upload',   icon: '↑' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
]

export function NavTabs({ active, onTabChange, hasSpace }: NavTabsProps) {
  const tabs = hasSpace ? SPACE_TABS : HOME_TABS
  return (
    <div className="nav-tabs">
      {tabs.map((tab) => (
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
