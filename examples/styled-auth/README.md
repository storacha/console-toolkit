# styled-auth

The minimal path to working Storacha authentication. Install one package, import one CSS file, render two components. The UI matches the Storacha console exactly — fire background, logo, email form, and check-email confirmation screen included.

---

## Integration pattern

Install the styled package:

```bash
npm install @storacha/console-toolkit-react-styled
```

Import the CSS once at your entry point:

```tsx
import '@storacha/console-toolkit-react-styled/styles.css'
```

### Minimal implementation

`Provider`, `StorachaAuth`, `useW3`, and `useStorachaAuth` are all available from the styled package — no separate headless import needed:

```tsx
import {
  Provider,
  StorachaAuth,
  useW3,
  useStorachaAuth,
} from '@storacha/console-toolkit-react-styled'
import '@storacha/console-toolkit-react-styled/styles.css'

function AuthenticatedApp() {
  const [{ accounts }] = useW3()
  const auth = useStorachaAuth()

  return (
    <div>
      <p>Signed in as {accounts[0]?.toEmail()}</p>
      <button onClick={auth.logoutWithTracking}>Sign out</button>
    </div>
  )
}

function App() {
  return (
    <Provider>
      <StorachaAuth>
        <StorachaAuth.Ensurer>
          <AuthenticatedApp />
        </StorachaAuth.Ensurer>
      </StorachaAuth>
    </Provider>
  )
}
```

`StorachaAuth.Ensurer` handles the full state machine — initializing, form, submitted, authenticated — with no configuration required.

### Optional props

```tsx
<StorachaAuth
  onAuthEvent={(event, properties) => {
    // analytics hook — receives events like 'login', 'logout'
    analytics.track(event, properties)
  }}
>
```

For complete control over the auth UI, see the [`headless-auth`](../headless-auth/) example.

---

## Run this example

```bash
# From the repo root
pnpm install
cd examples/styled-auth
pnpm dev
```
