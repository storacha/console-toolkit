# Iframe Auth Example

This example demonstrates how to run Storacha authentication **inside an iframe** while the parent application controls UX.

## What this example shows
- Host app embeds an iframe containing Storacha authentication
- User logs in inside the iframe
- The host app receives authentication state (no redirects)

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

function IframeAuth() {
  return (
    <Provider>
      <StorachaAuth enableIframeSupport={true}>
        <StorachaAuth.Ensurer>
          <YourApp />
        </StorachaAuth.Ensurer>
      </StorachaAuth>
    </Provider>
  )
}
```

## Usage

When loaded in an iframe, the component automatically:
1. Detects iframe context
2. Shows Storacha authentication UI (form, submitted state, or authenticated content)
3. Manages session state appropriately
4. Handles authentication flow without redirects

The `enableIframeSupport={true}` prop enables iframe-specific handling.
