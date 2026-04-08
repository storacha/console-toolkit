# full-app-headless

A complete Storacha console integration — auth, spaces, uploads, file viewing, sharing, and settings — built with headless components and fully custom UI. There is no Storacha branding anywhere; the app uses its own visual identity ("My Storage").

This is the reference for integrating the toolkit when you want complete control over every pixel.

---

## Integration pattern

Install the headless package:

```bash
npm install @storacha/console-toolkit-react
```

### Provider order

Providers must wrap the app in this order:

```tsx
import {
  Provider,
  StorachaAuth,
  SpacePicker,
} from '@storacha/console-toolkit-react'

function App() {
  return (
    <Provider>
      <StorachaAuth>
        <StorachaAuth.Ensurer
          renderLoader={(type) => <MyLoader type={type} />}
          renderForm={() => <MyLoginForm />}
          renderSubmitted={() => <MyCheckEmailScreen />}
        >
          <SpacePicker>
            <Dashboard />
          </SpacePicker>
        </StorachaAuth.Ensurer>
      </StorachaAuth>
    </Provider>
  )
}
```

`StorachaAuth.Ensurer` accepts render props for each auth state (`renderLoader`, `renderForm`, `renderSubmitted`). Once authenticated it renders `children`. `SpacePicker` provides space selection context to the entire authenticated area.

### Building the auth form

Use `StorachaAuth.Form` for the login UI. Every slot is a render prop — you own the markup:

```tsx
import { StorachaAuth } from '@storacha/console-toolkit-react'

function MyLoginForm() {
  return (
    <StorachaAuth.Form
      renderLogo={() => <MyLogo />}
      renderEmailLabel={() => <label htmlFor="email">Email</label>}
      renderEmailInput={() => (
        <StorachaAuth.EmailInput id="email" className="my-input" />
      )}
      renderSubmitButton={(disabled) => (
        <button type="submit" disabled={disabled}>
          {disabled ? 'Authorizing...' : 'Authorize'}
        </button>
      )}
    />
  )
}
```

### Accessing state with hooks

Each domain exposes a context hook. Use hooks directly in your own components:

```tsx
import { useW3, useSpacePickerContext, useSpaceListContext } from '@storacha/console-toolkit-react'

function SpaceView() {
  const [{ accounts }] = useW3()
  const [{ selectedSpace }] = useSpacePickerContext()
  const [{ uploads, isLoading }, { reload }] = useSpaceListContext()

  return (/* your UI */)
}
```

### Styling

All styles live in `src/styles.css` — a single flat CSS file imported only from `main.tsx`. There are no style imports inside individual component files. Swap this file for Tailwind, CSS Modules, or a design system without touching any component logic.

### Component split

The example splits feature UI across focused files under `src/components/`:

| File | Feature |
|---|---|
| `Dashboard.tsx` | Main shell — nav, header, routing between views |
| `SharingView.tsx` | `SharingTool` UI |
| `UploadViews.tsx` | `UploadTool` and file listing UI |
| `SettingsViews.tsx` | `SettingsProvider`, account overview, usage |
| `ChangePlanViews.tsx` | `ChangePlan` UI |
| `ImportSpaceView.tsx` | `ImportSpace` UI |
| `RemoveFileButton.tsx` | File remove action |
| `SpaceCreatorFields.tsx` | Space creation form fields |

This mirrors how a real application would structure a multi-feature Storacha integration.

---

## Run this example

```bash
# From the repo root
pnpm install
cd examples/full-app-headless
pnpm dev
```
