# full-app-styled

A complete Storacha console experience using pre-styled components. This example demonstrates how to get auth, space management, uploads, file viewing, sharing, and settings working with zero custom CSS — install the package, import the components, import one CSS file.

The UI matches the official Storacha console exactly: yellow sidebar, fire background, red accents, Epilogue typeface.

---

## Integration pattern

Install the styled package:

```bash
npm install @storacha/console-toolkit-react-styled
```

Import the CSS once at your app entry point:

```tsx
import '@storacha/console-toolkit-react-styled/styles.css'
```

`Provider`, `useW3`, `useStorachaAuth`, and all headless components are re-exported from the styled package — you only need one import source.

### App composition

The full console layout follows this structure:

```tsx
import {
  Provider,
  StorachaAuth,
  ConsoleLayout,
  NavTabs,
  SpaceList,
  SpaceDetail,
  SpaceCreatorView,
  ImportSpaceView,
  SpaceUploadsView,
  FileViewerView,
  UploadToolView,
  SharingToolView,
  SettingsPage,
  PlanGateView,
  useW3,
  useStorachaAuth,
} from '@storacha/console-toolkit-react-styled'
import type { Space, NavTab, UnknownLink } from '@storacha/console-toolkit-react-styled'
import '@storacha/console-toolkit-react-styled/styles.css'

function Console() {
  const [{ spaces }] = useW3()
  const auth = useStorachaAuth()
  const [tab, setTab] = useState<NavTab>('spaces')
  const [selectedSpace, setSelectedSpace] = useState<Space | undefined>()
  const [selectedRoot, setSelectedRoot] = useState<UnknownLink | undefined>()

  return (
    <ConsoleLayout
      spaces={spaces as Space[]}
      selectedSpace={selectedSpace}
      onSpaceSelect={(space) => { setSelectedSpace(space); setTab('uploads') }}
      onLogout={() => auth.logoutWithTracking().then(() => window.location.reload())}
      onHome={() => { setSelectedSpace(undefined); setTab('spaces') }}
      nav={<NavTabs active={tab} onTabChange={setTab} hasSpace={!!selectedSpace} />}
    >
      {tab === 'settings' && <SettingsPage />}

      {tab !== 'settings' && selectedSpace && (
        <>
          <SpaceDetail space={selectedSpace} onBack={() => setSelectedSpace(undefined)} />
          {tab === 'uploads' && !selectedRoot && (
            <SpaceUploadsView space={selectedSpace} onItemSelect={setSelectedRoot} onUpload={() => setTab('upload')} />
          )}
          {tab === 'uploads' && selectedRoot && (
            <FileViewerView space={selectedSpace} root={selectedRoot} onRemoved={() => setSelectedRoot(undefined)} />
          )}
          {tab === 'upload' && <UploadToolView space={selectedSpace} />}
          {tab === 'share'  && <SharingToolView space={selectedSpace} />}
        </>
      )}

      {tab !== 'settings' && !selectedSpace && tab === 'spaces' && (
        <SpaceList spaces={spaces as Space[]} onSelect={(space) => { setSelectedSpace(space); setTab('uploads') }} />
      )}
      {tab !== 'settings' && !selectedSpace && tab === 'import' && (
        <ImportSpaceView onImport={(space) => { setSelectedSpace(space); setTab('uploads') }} />
      )}
      {tab !== 'settings' && !selectedSpace && tab === 'create' && (
        <SpaceCreatorView onCreated={(space) => { setSelectedSpace(space); setTab('uploads') }} />
      )}
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
```

### Key points

- `ConsoleLayout` provides the sidebar, space selector, and logout. Pass `nav` as a prop for the tab bar.
- `NavTabs` is dual-mode: home tabs (`spaces / import / create / settings`) vs space tabs (`uploads / share / upload / settings`), controlled by `hasSpace`.
- The settings tab is rendered before space/home checks so it is always accessible regardless of selected space.
- `PlanGateView` wraps the app and prompts plan selection if no plan is active.

---

## Run this example

```bash
# From the repo root
pnpm install
cd examples/full-app-styled
pnpm dev
```
