# Dmail Integration Example

This example demonstrates how to integrate Storacha Console Toolkit with Dmail for email-based authentication and file sharing.

## Overview

Dmail integration provides:
- **Email Authentication**: Seamless login using Dmail email addresses
- **File Sharing**: Send files via Dmail with Storacha storage
- **Encrypted Storage**: Secure file storage with Dmail integration
- **Zero Navigation**: Embedded iframe experience

## Live Demo

--

## Quick Start

```bash
# Navigate to the integration example
cd integration-guide/dmail-integration

# Install dependencies (from console-toolkit root)
pnpm install

# Start development server
pnpm dev
```

## Implementation

This example demonstrates how to integrate Storacha Console Toolkit Auth components with Dmail services. The implementation uses:

- **`@storacha/console-toolkit-react-styled`**: Pre-styled authentication components
- **`@storacha/console-toolkit-react`**: Core authentication hooks and providers
- **`StorachaAuth.Ensurer`**: Handles authentication flow and state management

### 1. Dmail Authentication Setup

The authentication is handled using `StorachaAuth.Ensurer` which automatically manages the authentication flow:

```typescript
import { Provider } from '@storacha/console-toolkit-react'
import { StorachaAuth, useStorachaAuth } from '@storacha/console-toolkit-react-styled'

function App() {
  return (
    <Provider>
      <StorachaAuth
        onAuthEvent={handleAuthEvent}
        enableIframeSupport={true}
      >
        <StorachaAuth.Ensurer
          renderForm={() => <DmailAuthForm />}
        >
          <AuthenticatedContent />
        </StorachaAuth.Ensurer>
      </StorachaAuth>
    </Provider>
  )
}
```

The `DmailAuthForm` component validates that users authenticate with a Dmail email address (@dmail.ai) and uses the `useStorachaAuth` hook to access authentication state and actions.

### 2. File Upload with Dmail Integration[upcoming]

After authentication, users can upload files using the `DmailFileUpload` component, which integrates with Storacha storage and prepares files for sharing via Dmail.

### 3. Dmail Share Component[upcoming]

The `DmailShare` component allows authenticated users to share uploaded files via Dmail, sending notifications with file links to recipients.

## Features

### ✅ Implemented Features

- **Dmail Authentication**: Email-based login with Dmail validation


### 🚀 Coming Soon

- **File Upload**: Drag & drop file upload with Storacha storage
- **Dmail Integration**: Send files via Dmail with share URLs
- **Progress Tracking**: Real-time upload progress display
- **Batch File Sharing**: Share multiple files at once

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/dmail-enhancement`
3. Commit changes: `git commit -am 'Add Dmail enhancement'`
4. Push to branch: `git push origin feature/dmail-enhancement`
5. Submit a pull request