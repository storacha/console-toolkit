# Headless Auth Example

This example demonstrates how to use **headless authentication components** from `@storacha/console-toolkit-react` with **fully custom styling**.

## What this example shows
- Storacha authentication without built-in styles
- Full control over layout and appearance
- Usage of `className`, `style`, and render props

## Run locally

```bash
pnpm install
pnpm dev
```

### Component Usage

```tsx
import { Provider } from '@storacha/console-toolkit-react'
import { StorachaAuth, useStorachaAuth } from '@storacha/console-toolkit-react'

function CustomForm() {
  const [{ handleRegisterSubmit, submitted }] = useStorachaAuth()
  
  return (
    <form onSubmit={handleRegisterSubmit}>
      <label htmlFor="email">Email Address</label>
      <StorachaAuth.EmailInput id="email" />
      <button type="submit" disabled={submitted}>
        Sign In
      </button>
    </form>
  )
}
```

## Styling

This example uses vanilla CSS, but you can use any styling solution:

- Tailwind CSS
- Emotion / styled-components
- CSS Modules
- Chakra UI / MUI
- Your own CSS framework
