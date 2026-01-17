# Integration Guide

This guide provides comprehensive instructions for integrating the Storacha Console Integration Toolkit into various platforms and applications.
Live integrations demo examples avaialable for:-
- Dmail
- web3Mail

## 🚀 Quick Integration

### 🌐 Web3Mail Integration
Complete integration with Web3Mail (EtherMail) for decentralized email authentication and file storage.

**Location:** `web3mail-integration/`

**Features:**
- Web3Mail email authentication (@ethmail.cc, @ethermail.io)
- Space creation and management
- File upload with drag-and-drop
- File sharing via email or DID
- File viewing with CID and gateway URLs

**Quick Start:**
```bash
cd web3mail-integration
pnpm install
pnpm dev
# Available at http://localhost:3002
```

📖 [Full Documentation →](./web3mail-integration/web3mail-integration.md)

### 📧 Dmail Integration
Complete integration with Dmail for email-based authentication and file storage.

**Location:** `dmail-integration/`

**Features:**
- Dmail email authentication (@dmail.ai)
- Space creation and management
- File upload with progress tracking
- File sharing via email or DID
- Iframe support for embedded experiences

**Quick Start:**
```bash
cd dmail-integration
pnpm install
pnpm dev
# Available at http://localhost:3001
```

📖 [Full Documentation →](./dmail-integration/dmail-integration.md)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm installed
- Built console-toolkit packages


### Setup

1. **Build the toolkit packages** (from console-toolkit root):
```bash
pnpm -r build
```

2. **Navigate to an integration example:**
```bash
cd integration-guide/web3mail-integration
# or
cd integration-guide/dmail-integration
```

3. **Install dependencies:**
```bash
pnpm install
```

4. **Run the development server:**
```bash
pnpm dev
```

## 📚 Core Packages

Both integrations use the following packages:

- **`@storacha/console-toolkit-react`**: Core authentication hooks and providers
  - `Provider`: Main context provider for Storacha client
  - `StorachaAuth.Ensurer`: Handles authentication flow and state management
  - `SpaceEnsurer`: Ensures at least one space exists
  - `SpacePicker`: Space selection and management
  - `SpaceCreator`: Create new spaces
  - `UploadTool`: File upload functionality
  - `SpaceList`: List and view uploads
  - `FileViewer`: View file details
  - `SharingTool`: Share spaces with others

- **`@storacha/console-toolkit-react-styled`**: Pre-styled authentication components
  - Pre-built styled components for faster development
  - Consistent theming and branding

## 🏗️ Architecture Pattern

Both integrations follow the same architectural pattern:

```typescript
<Provider>
  <StorachaAuth>
    <StorachaAuth.Ensurer>
      <SpaceEnsurer>
        <SpacePicker>
          {/* Your application components */}
        </SpacePicker>
      </SpaceEnsurer>
    </StorachaAuth.Ensurer>
  </StorachaAuth>
</Provider>
```

**Component Flow:**
1. **Provider**: Initializes the Storacha client
2. **StorachaAuth**: Manages authentication state
3. **StorachaAuth.Ensurer**: Ensures user is authenticated
4. **SpaceEnsurer**: Ensures at least one space exists
5. **SpacePicker**: Provides space selection context
6. **Your Components**: Use hooks to access spaces, uploads, etc.

## 🎯 Key Features Implemented

### Authentication
- Email-based authentication with platform-specific validation
- Custom authentication forms with platform branding
- Email verification flow
- Session management

### Space Management
- Create public or private spaces
- List and search spaces
- Space selection and context management
- Space metadata (name, DID, access type)

### File Operations
- Drag-and-drop file uploads
- Upload progress tracking
- Support for files, directories, and CAR files
- File listing with pagination
- File details (CID, gateway URL, shards)
- File removal


# 🎯 Platform-Specific Integrations

## React Applications

### Next.js Integration
1. Install dependencies:

`npm install @storacha/console-toolkit-react`

2. Create a provider wrapper:

```tsx
// app/providers.tsx
'use client'

import { Provider } from '@storacha/console-toolkit-react'

export function StorachaProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider
      servicePrincipal="did:web:storacha.network"
      connection={{ url: "https://api.storacha.network" }}
    >
      {children}
    </Provider>
  )
}
```

3. Add to your layout:

```tsx
// app/layout.tsx
import { StorachaProvider } from './providers'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <StorachaProvider>
          {children}
        </StorachaProvider>
      </body>
    </html>
  )
}
```

4. Use in your pages:

```tsx
// app/upload/page.tsx
'use client'

import { StorachaAuth, UploadTool } from '@storacha/console-toolkit-react'

export default function UploadPage() {
  return (
    <StorachaAuth>
      <StorachaAuth.Ensurer>
        <UploadTool space={selectedSpace}>
          <div>
            <h1>Upload Files</h1>
            {/* Your upload UI */}
          </div>
        </UploadTool>
      </StorachaAuth.Ensurer>
    </StorachaAuth>
  )
}
```

## Create React App Integration
1. Install dependencies:

`npm install @storacha/console-toolkit-react`

2. Update your main App component:

```ts
// src/App.tsx
import React from 'react'
import { Provider, StorachaAuth, UploadTool } from '@storacha/console-toolkit-react'
import './App.css'

function App() {
  return (
    <Provider>
      <StorachaAuth>
        <StorachaAuth.Ensurer>
          <UploadTool space={selectedSpace}>
            <div className="App">
              <header className="App-header">
                <h1>My Storacha App</h1>
                {/* Your app content */}
              </header>
            </div>
          </UploadTool>
        </StorachaAuth.Ensurer>
      </StorachaAuth>
    </Provider>
  )
}

export default App
```

## Vue.js Integration

1. Install dependencies:

`npm install @storacha/console-toolkit-react`

2. Create a Vue wrapper component:

```vue
<!-- StorachaWrapper.vue -->
<template>
  <div ref="storachaContainer"></div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { createRoot } from 'react-dom/client'
import { Provider, StorachaAuth, UploadTool } from '@storacha/console-toolkit-react'

const storachaContainer = ref(null)

onMounted(() => {
  if (storachaContainer.value) {
    const root = createRoot(storachaContainer.value)
    root.render(
      React.createElement(Provider, null,
        React.createElement(StorachaAuth, null,
          React.createElement(StorachaAuth.Ensurer, null,
            React.createElement(UploadTool, { space: selectedSpace },
              React.createElement('div', null, 'Storacha Components')
            )
          )
        )
      )
    )
  }
})
</script>
```

## Angular Integration

1. Install dependencies:

`npm install @storacha/console-toolkit-react`

2. Create an Angular wrapper component:

```ts
// storacha-wrapper.component.ts
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { createRoot } from 'react-dom/client'
import { Provider, StorachaAuth, UploadTool } from '@storacha/console-toolkit-react'

@Component({
  selector: 'app-storacha-wrapper',
  template: '<div #storachaContainer></div>'
})
export class StorachaWrapperComponent implements OnInit {
  @ViewChild('storachaContainer', { static: true }) container!: ElementRef

  ngOnInit() {
    const root = createRoot(this.container.nativeElement)
    root.render(
      React.createElement(Provider, null,
        React.createElement(StorachaAuth, null,
          React.createElement(StorachaAuth.Ensurer, null,
            React.createElement(UploadTool, { space: selectedSpace },
              React.createElement('div', null, 'Storacha Components')
            )
          )
        )
      )
    )
  }
}
``` 

### 🔧 Configuration
- Set up environment variables for different environments:
```
NEXT_PUBLIC_SERVICE_URL=https://api.storacha.network
NEXT_PUBLIC_SERVICE_PRINCIPAL=did:web:storacha.network
NEXT_PUBLIC_UCAN_KMS_URL=https://kms.storacha.network
NEXT_PUBLIC_UCAN_KMS_DID=did:web:kms.storacha.network
```

### Unit Testing

```tsx
// auth.test.tsx
import { render, screen } from '@testing-library/react'
import { Provider, Authenticator } from '@storacha/console-toolkit-react'

test('renders authentication form', () => {
  render(
    <Provider>
      <Authenticator>
        <Authenticator.Form>
          <Authenticator.EmailInput />
        </Authenticator.Form>
      </Authenticator>
    </Provider>
  )
  
  expect(screen.getByRole('form')).toBeInTheDocument()
  expect(screen.getByRole('textbox')).toBeInTheDocument()
})
```

### Integration Testing

```tsx
// integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider, Authenticator, Uploader } from '@storacha/console-toolkit-react'

test('complete upload flow', async () => {
  const user = userEvent.setup()
  
  render(
    <Provider>
      <Authenticator>
        <Uploader>
          <Uploader.Form>
            <Uploader.Input />
            <button type="submit">Upload</button>
          </Uploader.Form>
        </Uploader>
      </Authenticator>
    </Provider>
  )
  
  const fileInput = screen.getByRole('textbox', { name: /file/i })
  const file = new File(['hello'], 'hello.txt', { type: 'text/plain' })
  
  await user.upload(fileInput, file)
  await user.click(screen.getByRole('button', { name: /upload/i }))
  
  await waitFor(() => {
    expect(screen.getByText(/upload complete/i)).toBeInTheDocument()
  })
})
```

## 🔍 Troubleshooting

### Common Issues

**1. Provider not found error:**
```tsx
// Make sure to wrap components with Provider
<Provider>
  <Authenticator>
    {/* Your components */}
  </Authenticator>
</Provider>
```

**2. Authentication not working:**
```tsx
// Check service configuration
<Provider
  servicePrincipal="did:web:storacha.network"
  connection={{ url: "https://api.storacha.network" }}
>
  {/* Your components */}
</Provider>
```

**3. Upload failing:**
```tsx
// Check space and account state
const [{ accounts, spaces }] = useW3()
const [{ status, error }] = useUploader()

if (accounts.length === 0) {
  return <div>Please authenticate first</div>
}

if (spaces.length === 0) {
  return <div>No spaces available</div>
}
```

## 📖 Learn More

- [Web3Mail Integration Documentation](./web3mail-integration/web3mail-integration.md)
- [Dmail Integration Documentation](./dmail-integration/dmail-integration.md)
- [Console Toolkit Examples](../examples/)