# Space Management Example

This example demonstrates how to use **headless space management components** from `@storacha/console-toolkit-react` with **fully custom styling**.

## What this example shows

- Space selection and listing
- Space creation
- Content listing within a space
- File viewing
- Space sharing
- Custom UI implementation

## Run locally

```bash
pnpm install
pnpm dev
```

## Component Usage

This example uses only headless components, allowing complete control over styling:

```tsx
import { Provider, StorachaAuth } from '@storacha/console-toolkit-react'
import { 
  SpacePicker, 
  SpaceCreator, 
  SpaceList, 
  FileViewer, 
  SharingTool,
  SpaceEnsurer 
} from '@storacha/console-toolkit-react'

function App() {
  return (
    <Provider>
      <StorachaAuth>
        <StorachaAuth.Ensurer>
          <SpaceEnsurer>
            <SpacePicker>
              {/* Your custom UI */}
            </SpacePicker>
          </SpaceEnsurer>
        </StorachaAuth.Ensurer>
      </StorachaAuth>
    </Provider>
  )
}
```

## Features Demonstrated

1. **SpacePicker** - List and select spaces
2. **SpaceCreator** - Create new spaces
3. **SpaceList** - List uploads in a space
4. **FileViewer** - View file details
5. **SharingTool** - Share spaces with others
6. **SpaceEnsurer** - Ensure at least one space exists

## Styling

This example uses vanilla CSS, but you can use any styling solution:

- Tailwind CSS
- Emotion / styled-components
- CSS Modules
- Chakra UI / MUI
- Your own CSS framework

