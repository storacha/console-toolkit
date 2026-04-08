# iframe-auth

Storacha authentication embedded inside an iframe. This example demonstrates the `enableIframeSupport` prop and how a single app can serve as both the host page and the iframe content depending on how it is loaded.

Use this pattern when your integration lives inside an iframe context and you need auth to work without redirects or cross-window navigation.

---

## Integration pattern

Install the packages:

```bash
npm install @storacha/console-toolkit-react-styled
```

### The `enableIframeSupport` prop

Pass `enableIframeSupport={true}` to `StorachaAuth` when running inside an iframe. This switches the auth flow to iframe-aware handling:

```tsx
import { Provider, useW3, useStorachaAuth } from '@storacha/console-toolkit-react'
import { StorachaAuth } from '@storacha/console-toolkit-react-styled'
import '@storacha/console-toolkit-react-styled/styles.css'

function IframeApp() {
  return (
    <Provider>
      <StorachaAuth enableIframeSupport={true}>
        <StorachaAuth.Ensurer>
          <AuthenticatedContent />
        </StorachaAuth.Ensurer>
      </StorachaAuth>
    </Provider>
  )
}
```

### Dual-mode rendering

A common pattern is a single app that detects whether it is loaded as an iframe or as the host page, and renders accordingly:

```tsx
function App() {
  const isIframe = typeof window !== 'undefined' && window.self !== window.top

  return (
    <Provider>
      {isIframe ? <IframeApp /> : <HostPage />}
    </Provider>
  )
}
```

When loaded as an iframe, `IframeApp` renders the auth flow. When loaded as the top-level document, `HostPage` renders the host UI with the iframe embedded inside it.

### Auth events

Use `onAuthEvent` to observe the auth lifecycle:

```tsx
<StorachaAuth
  enableIframeSupport={true}
  onAuthEvent={(event, props) => {
    console.log('auth event:', event, props)
  }}
>
```

---

## Run this example

```bash
# From the repo root
pnpm install
cd examples/iframe-auth
pnpm dev
```
