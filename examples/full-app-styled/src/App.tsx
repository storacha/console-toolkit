import { useState } from 'react'
import {
  Provider,
  StorachaAuth,
  ConsoleLayout,
  SpaceList,
  useW3,
  useStorachaAuth,
} from '@storacha/console-toolkit-react-styled'
import type { Space } from '@storacha/console-toolkit-react-styled'

function Console() {
  const [{ spaces }] = useW3()
  const auth = useStorachaAuth()
  const [selectedSpace, setSelectedSpace] = useState<Space | undefined>(undefined)

  return (
    <ConsoleLayout
      spaces={spaces as Space[]}
      selectedSpace={selectedSpace}
      onSpaceSelect={setSelectedSpace}
      onLogout={() => auth.logoutWithTracking().then(() => window.location.reload())}
    >
      {selectedSpace ? (
        <div>
          <h2 className="spaces-heading">{selectedSpace.name || 'Untitled Space'}</h2>
          <p className="spaces-row-did">{selectedSpace.did()}</p>
        </div>
      ) : (
        <SpaceList spaces={spaces as Space[]} onSelect={setSelectedSpace} />
      )}
    </ConsoleLayout>
  )
}

function App() {
  return (
    <Provider>
      <StorachaAuth>
        <StorachaAuth.Ensurer>
          <Console />
        </StorachaAuth.Ensurer>
      </StorachaAuth>
    </Provider>
  )
}

export default App
