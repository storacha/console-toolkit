# Styled Auth Example

This example demonstrates the **quickest way** to integrate Storacha authentication using pre-styled components that match console.storacha.network.

## What you get
- Console-exact UI
- Built-in logo, background and styles
- Complete authentication flow with almost zero setup

## Run locally
```bash
pnpm install
pnpm dev
```

## Implementation

```tsx
import { Provider } from '@storacha/console-toolkit-react'
import { StorachaAuth, useStorachaAuth } from '@storacha/console-toolkit-react-styled'
import '@storacha/console-toolkit-react-styled/styles.css'

function App() {
  return (
    <Provider>
      <StorachaAuth>
        <StorachaAuth.Ensurer>
          <YourApp />
        </StorachaAuth.Ensurer>
      </StorachaAuth>
    </Provider>
  )
}
```

## Customization

While using pre-styled components, you can still customize:

- `serviceName` - Custom service name
- `termsUrl` - Custom terms of service URL
- `onAuthEvent` - Analytics event tracking

For complete styling control, see the `headless-auth` example.
