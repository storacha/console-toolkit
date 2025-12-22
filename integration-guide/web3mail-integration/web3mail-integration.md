# Web3Mail Integration Example

This example demonstrates how to integrate Storacha Console Toolkit with Web3Mail (EtherMail) for decentralized email authentication, space management, and file storage.

## Overview

Web3Mail integration provides:
- **Web3Mail Authentication**: Email-based authentication with EtherMail addresses (@ethmail.cc, @ethermail.io)
- **Space Management**: Create, list, and manage decentralized storage spaces
- **File Upload**: Upload files with drag-and-drop support and progress tracking
- **File Sharing**: Share spaces with others via email or DID
- **File Viewing**: View uploaded files with CID, gateway URLs, and shard information

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm installed
- Built console-toolkit packages (run `pnpm -r build` from console-toolkit root)

### Installation

```bash
# From console-toolkit root directory
cd integration-guide/web3mail-integration

# Install dependencies
pnpm install

# Build toolkit packages (if not already built)
cd ../..
pnpm -r build
cd integration-guide/web3mail-integration
```

### Run

```bash
# Start development server
pnpm dev

# The app will be available at http://localhost:3002
```

## Implementation

### Architecture

The integration follows the StorachaAuth → SpaceEnsurer → SpacePicker flow:

```typescript
<Provider>
  <StorachaAuth>
    <StorachaAuth.Ensurer>
      <SpaceEnsurer>
        <SpacePicker>
          <AuthenticatedContent />
        </SpacePicker>
      </SpaceEnsurer>
    </StorachaAuth.Ensurer>
  </StorachaAuth>
</Provider>
```

### Key Components

#### 1. Authentication (`Web3MailAuth.tsx`)

- Validates Web3Mail email addresses (@ethmail.cc, @ethermail.io)
- Uses `StorachaAuth.Ensurer` for authentication flow
- Custom styled authentication forms with Web3Mail branding

#### 2. Space Management (`Web3MailSpaces.tsx`)

Tab-based interface with:
- **Spaces Tab**: List and search all spaces
- **Create Space Tab**: Create new public or private spaces
- **Upload Tab**: Upload files to selected space
- **View Uploads Tab**: List all uploads in a space
- **File Viewer Tab**: View file details (CID, gateway URL, shards)
- **Share Tab**: Share space access via email or DID

#### 3. Upload Tool (`Web3MailUploadTool.tsx`)

- Drag-and-drop file upload
- Support for files, directories, and CAR files
- Real-time upload progress
- File preview before upload

### Configuration

Default provider settings:

```typescript
const DEFAULT_GATEWAY_HOST = 'https://w3s.link'
const DEFAULT_GATEWAY_DID = 'did:web:w3s.link'
const DEFAULT_PROVIDER_DID = 'did:web:storacha.network'
```

## Features

### ✅ Implemented

- **Web3Mail Email Authentication**: Validates and authenticates with EtherMail addresses
- **Space Creation**: Create public or private spaces with custom names
- **Space Listing**: Search and filter spaces by name or DID
- **File Upload**: Drag-and-drop uploads with progress tracking
- **Upload Management**: View all uploads with metadata (CID, date)
- **File Viewer**: Display file details including root CID, gateway URL, and shards
- **Space Sharing**: Share spaces with email addresses or DIDs
- **Access Control**: Public and private space support
- **Error Handling**: Comprehensive error messages with user guidance
