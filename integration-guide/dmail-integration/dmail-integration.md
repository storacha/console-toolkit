# Dmail Integration Example

This example demonstrates how to integrate Storacha Console Toolkit with Dmail for email-based authentication, space management, and file storage.

## Overview

Dmail integration provides:
- **Dmail Authentication**: Email-based authentication with Dmail addresses (@dmail.ai)
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
cd integration-guide/dmail-integration

# Install dependencies
pnpm install

# Build toolkit packages (if not already built)
cd ../..
pnpm -r build
cd integration-guide/dmail-integration
```

### Run

```bash
# Start development server
pnpm dev

# The app will be available at http://localhost:3001
```

## Implementation

### Architecture

The integration uses StorachaAuth for authentication:

```typescript
<Provider>
  <StorachaAuth>
    <StorachaAuth.Ensurer>
      <AuthenticatedContent />
    </StorachaAuth.Ensurer>
  </StorachaAuth>
</Provider>
```

### Key Components

#### 1. Authentication (`DmailAuth.tsx`)

- Validates Dmail email addresses (@dmail.ai)
- Uses `StorachaAuth.Ensurer` for authentication flow
- Custom styled authentication forms with Dmail branding
- Iframe support for embedded experiences

#### 2. Space Management (`DmailSpaces.tsx`)

Comprehensive space management interface with:
- **Space Creation**: Create new public or private spaces
- **Space Listing**: View and search all spaces
- **Upload Tool**: Upload files to selected space
- **Upload List**: View all uploads in a space with pagination
- **File Viewer**: View file details (CID, gateway URL, shards)
- **Sharing Tool**: Share space access via email or DID

#### 3. Upload Tool (`DmailUploadTool.tsx`)

- Drag-and-drop file upload
- Support for files, directories, and CAR files
- Real-time upload progress with progress bars
- File preview before upload
- Error handling and retry functionality

### Configuration

Default provider settings (can be customized):

```typescript
const DEFAULT_GATEWAY_HOST = 'https://w3s.link'
const DEFAULT_GATEWAY_DID = 'did:web:w3s.link'
const DEFAULT_PROVIDER_DID = 'did:web:web3.storage'
```

## Features

### ✅ Implemented

- **Dmail Email Authentication**: Validates and authenticates with Dmail addresses (@dmail.ai)
- **Space Creation**: Create public or private spaces with custom names
- **Space Listing**: View and search spaces by name or DID
- **File Upload**: Drag-and-drop uploads with progress tracking
- **Upload Management**: View all uploads with metadata (CID, date, pagination)
- **File Viewer**: Display file details including root CID, gateway URL, and shards
- **Space Sharing**: Share spaces with email addresses or DIDs
- **Access Control**: Public and private space support
- **Error Handling**: Comprehensive error messages with user guidance
- **Iframe Support**: Embedded experience support for Dmail integration
