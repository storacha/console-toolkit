# Storacha Console Toolkit

A React component library for embedding Storacha console features — authentication, spaces, uploads, sharing, and account management — into any web application. Ships two packages: a headless package with all the logic and zero styling, and a styled package with Storacha-branded UI ready to use.

## Packages

### `@storacha/console-toolkit-react`

Headless components. All behavior and state, no styling. You control the markup, CSS, and design system — the same approach as Radix UI or Headless UI.

```bash
npm install @storacha/console-toolkit-react
```

### `@storacha/console-toolkit-react-styled`

Pre-styled components matching the Storacha console UI exactly. Import one CSS file and everything is styled. Re-exports `Provider`, `useW3`, and all headless components so you only need this one package.

```bash
npm install @storacha/console-toolkit-react-styled
```

---

## Quick start

### Headless

```tsx
import {
  Provider,
  StorachaAuth,
  SpacePicker,
  SpaceList,
  UploadTool,
} from '@storacha/console-toolkit-react'

function App() {
  return (
    <Provider>
      <StorachaAuth>
        <StorachaAuth.Ensurer>
          <SpacePicker>
            {/* your UI here */}
          </SpacePicker>
        </StorachaAuth.Ensurer>
      </StorachaAuth>
    </Provider>
  )
}
```

### Styled

```tsx
import {
  Provider,
  StorachaAuth,
  ConsoleLayout,
  NavTabs,
  SpaceList,
  SettingsPage,
} from '@storacha/console-toolkit-react-styled'
import '@storacha/console-toolkit-react-styled/styles.css'

function App() {
  return (
    <Provider>
      <StorachaAuth>
        <StorachaAuth.Ensurer>
          {/* your content */}
        </StorachaAuth.Ensurer>
      </StorachaAuth>
    </Provider>
  )
}
```

---

## Components

### Auth

| Component | Description |
|---|---|
| `Provider` | Root context. Initializes the Storacha client. Wrap your entire app in this. |
| `StorachaAuth` | Email-based auth flow. Manages login, submitted, and authenticated states. |
| `StorachaAuth.Ensurer` | Blocks rendering until authenticated. Shows login UI in the meantime. |
| `StorachaAuth.Form` | Login form with render prop slots for logo, inputs, and submit button. |
| `StorachaAuth.Submitted` | Post-submission confirmation UI with render prop slots. |
| `StorachaAuth.EmailInput` | Controlled email input wired to auth state. |
| `StorachaAuth.CancelButton` | Cancels a pending auth submission. |

### Spaces

| Component | Description |
|---|---|
| `SpacePicker` | Space selection context with `.Search` and `.List` sub-components. |
| `SpaceCreator` | Creates a new space. Accepts `providerDID`, `gatewayHost`, `gatewayDID`. |
| `SpaceList` | Lists uploads within the current space. Includes `.List` and `.Pagination`. |
| `SpaceEnsurer` | Ensures a space is selected before rendering children. |
| `ImportSpace` | Imports an existing space via UCAN delegation. |
| `PlanGate` | Blocks access until the user has a valid plan. |

### Uploads

| Component | Description |
|---|---|
| `UploadTool` | File, directory, and CAR upload with drag-and-drop and progress tracking. |
| `FileViewer` | Displays root CID, gateway URL, and shards for an upload. Includes a remove action. |

### Sharing

| Component | Description |
|---|---|
| `SharingTool` | Share a space via email or DID. Creates UCAN delegations. |

### Settings

| Component | Description |
|---|---|
| `SettingsProvider` | Context for account info, plan data, and per-space usage stats. |
| `AccountOverview` | Displays account email and current plan name. |
| `UsageSection` | Per-space storage usage breakdown. |
| `AccountManagement` | Account deletion request. |
| `ChangePlan` | Plan selection, upgrade UI, and Stripe customer portal link. |

---

## Hooks

| Hook | Description |
|---|---|
| `useW3()` | Raw context: `client`, `accounts`, `spaces`, `logout`. |
| `useStorachaAuth()` | Auth state and actions: `isAuthenticated`, `email`, `setEmail`, `logout`, `logoutWithTracking`. |
| `useSettingsContext()` | Plan info, usage stats, and account management actions. |
| `useSpacePickerContext()` | Selected space and setter. |
| `useSpaceListContext()` | Upload list, pagination, loading, and reload. |
| `useFileViewerContext()` | CID, URL, shards, and remove action for a viewed upload. |
| `useUploadToolContext()` | Upload state, progress, file selection, and upload action. |
| `useSharingToolContext()` | Sharing state and actions for email and DID delegation. |
| `useImportSpaceContext()` | Import space state, DID, and UCAN actions. |
| `usePlanGateContext()` | Plan status and `selectPlan` action. |
| `useSpaceCreatorContext()` | Space creation state and submit action. |

---

## Examples

| Example | Description |
|---|---|
| [`full-app-styled`](./examples/full-app-styled/) | Complete console UI using pre-styled components — zero custom CSS required |
| [`full-app-headless`](./examples/full-app-headless/) | Complete integration with fully custom UI and branding |
| [`headless-auth`](./examples/headless-auth/) | Auth only with custom styling using render props |
| [`styled-auth`](./examples/styled-auth/) | Minimal auth integration using the styled package |
| [`iframe-auth`](./examples/iframe-auth/) | Auth embedded inside an iframe |

More complex real-world integrations are in [`integration-guide/`](./integration-guide/).

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup, development workflow, and PR guidelines.

---

## Development

This is a pnpm monorepo.

```bash
# Install all dependencies and build packages
pnpm install

# Run tests across all packages
pnpm test

# Run the full CI check (lint + typecheck + test + build)
pnpm run ci
```

To develop a specific example:

```bash
cd examples/full-app-headless
pnpm dev
```

---

## License

Dual-licensed under [MIT + Apache 2.0](license.md)
