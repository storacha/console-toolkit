# Web3Mail Integration Example

This example demonstrates how to integrate Storacha Console Toolkit with Web3Mail(eg Ether Mail) for decentralized email communication and file sharing.

## Overview

Web3Mail integration provides:
- **Decentralized Authentication**: Web3 wallet-based authentication
- **Encrypted Communication**: End-to-end encrypted email via Web3Mail
- **File Sharing**: Secure file storage with Web3Mail integration
- **Privacy-First**: No central authority, fully decentralized

## Quick Start

```bash
# Navigate to the integration example
cd integration-guide/web3mail-integration

# Install dependencies (from console-toolkit root)
pnpm install

# Start development server
pnpm dev
```

## Implementation

This example demonstrates how to integrate Storacha Console Toolkit Auth components with Web3Mail services. The implementation uses:

- **`@storacha/console-toolkit-react-styled`**: Pre-styled authentication components
- **`@storacha/console-toolkit-react`**: Core authentication hooks and providers
- **`StorachaAuth.Ensurer`**: Handles authentication flow and state management

### 1. Web3Mail Authentication Setup

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
          renderForm={() => <Web3MailAuthForm />}
        >
          <AuthenticatedContent />
        </StorachaAuth.Ensurer>
      </StorachaAuth>
    </Provider>
  )
}
```

The `Web3MailAuthForm` component uses the `useStorachaAuth` hook to access authentication state and actions, providing a seamless authentication experience.

### 2. Web3Mail File Upload Component[upcoming]

After authentication, users can upload files using the `Web3MailFileUpload` component, which integrates with Storacha storage and includes optional end-to-end encryption settings for secure file sharing.

### 3. Web3Mail Share Component[upcoming]

The `Web3MailShare` component allows authenticated users to share uploaded files via Web3Mail, with support for wallet address-based sharing and optional encryption.


## Features[Change as implemented]

### ✅ Implemented Features

- **Web3(EtherMail) Wallet Authentication**: MetaMask, WalletConnect, and other wallet support
<!-- - **Decentralized File Upload**: Upload files to Storacha with Web3Mail integration
- **End-to-End Encryption**: Optional encryption for file sharing
- **Progress Tracking**: Real-time upload progress display -->

## Contributing

- contributions are highly encouraged.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/web3mail-enhancement`
3. Commit changes: `git commit -am 'Add Web3Mail enhancement'`
4. Push to branch: `git push origin feature/web3mail-enhancement`
5. Submit a pull request