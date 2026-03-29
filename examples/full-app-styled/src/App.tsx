import { useState } from 'react'
import {
  Provider,
  StorachaAuth,
  ConsoleLayout,
  NavTabs,
  SpaceList,
  SpaceCreatorView,
  ImportSpaceView,
  PlanGateView,
  SpaceDetail,
  useW3,
  useStorachaAuth,
} from '@storacha/console-toolkit-react-styled'
import type { Space, NavTab } from '@storacha/console-toolkit-react-styled'

function Console() {
  const [{ spaces }] = useW3()
  const auth = useStorachaAuth()
  const [tab, setTab] = useState<NavTab>('spaces')
  const [selectedSpace, setSelectedSpace] = useState<Space | undefined>(undefined)

  const handleSpaceSelect = (space: Space) => {
    setSelectedSpace(space)
    setTab('spaces')
  }

  const handleTabChange = (next: NavTab) => {
    setTab(next)
    if (next !== 'spaces') setSelectedSpace(undefined)
  }

  const handleHome = () => {
    setTab('spaces')
    setSelectedSpace(undefined)
  }

  return (
    <ConsoleLayout
      spaces={spaces as Space[]}
      selectedSpace={selectedSpace}
      onSpaceSelect={handleSpaceSelect}
      onLogout={() => auth.logoutWithTracking().then(() => window.location.reload())}
      onHome={handleHome}
      nav={<NavTabs active={tab} onTabChange={handleTabChange} />}
    >
      {tab === 'spaces' && !selectedSpace && (
        <SpaceList spaces={spaces as Space[]} onSelect={handleSpaceSelect} />
      )}
      {tab === 'spaces' && selectedSpace && (
        <SpaceDetail space={selectedSpace} onBack={() => setSelectedSpace(undefined)} />
      )}
      {tab === 'import'   && <ImportSpaceView onImport={handleSpaceSelect} />}
      {tab === 'create'   && <SpaceCreatorView onCreated={handleSpaceSelect} />}
      {tab === 'settings' && <p style={{ color: '#6b7280' }}>Settings coming soon.</p>}
    </ConsoleLayout>
  )
}

function App() {
  return (
    <Provider>
      <StorachaAuth>
        <StorachaAuth.Ensurer>
          <PlanGateView>
            <Console />
          </PlanGateView>
        </StorachaAuth.Ensurer>
      </StorachaAuth>
    </Provider>
  )
}

export default App
