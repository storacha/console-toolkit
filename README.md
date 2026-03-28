# Storacha Console Toolkit

A React component library for embedding Storacha console features into any web application. It provides two packages: a headless package with all the logic and no styling, and a styled package with Storacha-branded UI ready to drop in.

## Packages

### `@storacha/console-toolkit-react`

Headless components — all authentication, space management, upload, and settings logic with zero built-in styling. You control every pixel.

```bash
npm install @storacha/console-toolkit-react @storacha/ui-core
```

### `@storacha/console-toolkit-react-styled`

Pre-styled components that match the Storacha console UI exactly. Good for quick integrations where custom branding is not a requirement.

```bash
npm install @storacha/console-toolkit-react-styled @storacha/ui-core
```

---

## What's included

### Authentication

`StorachaAuth` handles the complete email-based auth flow. It uses a compound component pattern so you can compose just the pieces you need.

```tsx
import { Provider, StorachaAuth } from '@storacha/console-toolkit-react'

function App() {
  return (
    <Provider>
      <StorachaAuth onAuthEvent={(event) => console.log(event)}>
        <StorachaAuth.Ensurer>
          <MyApp />
        </StorachaAuth.Ensurer>
      </StorachaAuth>
    </Provider>
  )
}
```

Sub-components: `StorachaAuth.Form`, `StorachaAuth.Submitted`, `StorachaAuth.Ensurer`, `StorachaAuth.EmailInput`, `StorachaAuth.CancelButton`

`StorachaAuth.Ensurer` handles the loading → form → submitted → authenticated state machine. Once the user is authenticated it renders `children`. Until then it renders the appropriate UI state.

For iframe contexts, pass `enableIframeSupport={true}` to `StorachaAuth` and it will wait for authentication signals from the parent window rather than showing the form.

### Space management

Components for listing, creating, and selecting spaces:

- **`SpacePicker`** — list spaces and let the user select one
- **`SpaceCreator`** — create a new public or private space
- **`SpaceEnsurer`** — ensure a space is selected before rendering children
- **`SpaceList`** — paginated list of uploads within the current space
- **`ImportSpace`** — import an existing space by DID
- **`PlanGate`** — block access until the user has a valid plan

### Uploads

- **`UploadTool`** — upload files, directories, or CAR archives with drag-and-drop and real-time progress
- **`FileViewer`** — inspect an upload: root CID, gateway URL, shards

### Settings

Wrap your settings UI in `SettingsProvider` to get access to plan info, usage stats, and account management actions.

```tsx
import { SettingsProvider, AccountOverview, UsageSection, AccountManagement, ChangePlan } from '@storacha/console-toolkit-react'

function SettingsPage() {
  return (
    <SettingsProvider accountDeletionURL="https://your-deletion-form.example.com">
      <AccountOverview />
      <UsageSection />
      <ChangePlan />
      <AccountManagement />
    </SettingsProvider>
  )
}
```

`SettingsProvider` accepts optional `referralsServiceURL` and `referralURL` props if you run a referral service.

---

## Provider setup

`Provider` is the root context. It initializes the Storacha client and exposes accounts, spaces, and the client instance to all child components. Wrap your entire app (or the portion using toolkit components) in it.

```tsx
import { Provider } from '@storacha/console-toolkit-react'

// Basic — connects to the default Storacha service
<Provider>
  <App />
</Provider>

// Custom service endpoint
<Provider servicePrincipal={principal} connection={connection}>
  <App />
</Provider>
```

---

## Hooks

- **`useStorachaAuth()`** — access auth state and actions: `isAuthenticated`, `isLoading`, `email`, `submitted`, `setEmail`, `cancelLogin`, `logoutWithTracking`, `currentUser`
- **`useSettingsContext()`** — access settings state: `plan`, `usage`, `accountEmail`, `planLoading`, `usageLoading`, and actions to refresh or manage the account
- **`useW3()`** — low-level access to the raw context state from `Provider`

---

## Using the styled package

```tsx
import { StorachaAuth } from '@storacha/console-toolkit-react-styled'
import '@storacha/console-toolkit-react-styled/styles.css'

function App() {
  return (
    <StorachaAuth>
      <StorachaAuth.Form />
    </StorachaAuth>
  )
}
```

The styled package re-exports all headless components and adds Storacha-branded CSS on top. You still need `Provider` from the headless package.

---

## Examples

Working examples are in the `examples/` directory. Run any of them with `pnpm dev` from their directory.

| Example | Description |
|---------|-------------|
| [`full-app-headless`](./examples/full-app-headless/) | Complete integration: auth, spaces, uploads, settings — fully custom UI |
| [`headless-auth`](./examples/headless-auth/) | Auth-only example with custom styling |
| [`styled-auth`](./examples/styled-auth/) | Drop-in auth using the styled package |
| [`iframe-auth`](./examples/iframe-auth/) | Authentication inside an iframe |

Integration guide examples (more complex real-world integrations) are in [`integration-guide/`](./integration-guide/).

---

## Development

This is a pnpm monorepo.

```bash
# Install all dependencies
pnpm install

# Build all packages
pnpm build

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

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md) for how to get set up, make changes, run the CI checks, and submit a pull request.

---

## License

Dual-licensed under [MIT + Apache 2.0](license.md)
