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
  SpaceUploadsView,
  FileViewerView,
  UploadToolView,
  SharingToolView,
  useW3,
  useStorachaAuth,
} from '@storacha/console-toolkit-react-styled'
import type { Space, NavTab } from '@storacha/console-toolkit-react-styled'
import type { UnknownLink } from '@storacha/ui-core'

function Console() {
  const [{ spaces }] = useW3()
  const auth = useStorachaAuth()
  const [tab, setTab] = useState<NavTab>('spaces')
  const [selectedSpace, setSelectedSpace] = useState<Space | undefined>(undefined)
  const [selectedRoot, setSelectedRoot] = useState<UnknownLink | undefined>(undefined)

  const handleSpaceSelect = (space: Space) => {
    setSelectedSpace(space)
    setSelectedRoot(undefined)
    setTab('uploads')
  }

  const handleHome = () => {
    setSelectedSpace(undefined)
    setSelectedRoot(undefined)
    setTab('spaces')
  }

  const handleTabChange = (next: NavTab) => {
    setTab(next)
    setSelectedRoot(undefined)
  }

  return (
    <ConsoleLayout
      spaces={spaces as Space[]}
      selectedSpace={selectedSpace}
      onSpaceSelect={handleSpaceSelect}
      onLogout={() => auth.logoutWithTracking().then(() => window.location.reload())}
      onHome={handleHome}
      nav={<NavTabs active={tab} onTabChange={handleTabChange} hasSpace={!!selectedSpace} />}
    >
      {/* Space mode */}
      {selectedSpace && (
        <>
          <SpaceDetail space={selectedSpace} onBack={handleHome} />
          {tab === 'uploads' && !selectedRoot && (
            <SpaceUploadsView
              space={selectedSpace}
              onItemSelect={setSelectedRoot}
              onUpload={() => setTab('upload')}
            />
          )}
          {tab === 'uploads' && selectedRoot && (
            <FileViewerView
              space={selectedSpace}
              root={selectedRoot}
              onRemoved={() => setSelectedRoot(undefined)}
            />
          )}
          {tab === 'upload'   && <UploadToolView space={selectedSpace} />}
          {tab === 'share'    && <SharingToolView space={selectedSpace} />}
          {tab === 'settings' && <p className="spaces-row-did" style={{ padding: '1rem 2rem' }}>Settings coming soon.</p>}
        </>
      )}

      {/* Home mode */}
      {!selectedSpace && tab === 'spaces'   && <SpaceList spaces={spaces as Space[]} onSelect={handleSpaceSelect} />}
      {!selectedSpace && tab === 'import'   && <ImportSpaceView onImport={handleSpaceSelect} />}
      {!selectedSpace && tab === 'create'   && <SpaceCreatorView onCreated={handleSpaceSelect} />}
      {!selectedSpace && tab === 'settings' && <p className="spaces-row-did" style={{ padding: '1rem 2rem' }}>Settings coming soon.</p>}
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
