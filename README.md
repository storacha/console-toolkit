# Storacha Console Toolkit

A plug-and-play UI library that enables Web3 applications to embed Storacha console features directly into their interface, eliminating redirect-based UX and double navigation.

## Overview

The toolkit provides headless React components with complete logic and no styling dependencies, giving you full control over appearance. Applications can quickly integrate Storacha features such as authentication, space management, file operations, and account settings.

## Features

### Authentication
- Email-based authentication flow
- Session management
- Iframe support for embedded contexts

### Space Management
- **SpacePicker** - List and select spaces
- **SpaceCreator** - Create public or private spaces
- **SpaceList** - List content within a space with pagination
- **SpaceEnsurer** - Ensure a space is selected before rendering
- **ImportSpace** - Import existing spaces
- **PlanGate** - Plan selection and validation

### File Operations
- **UploadTool** - Upload files, directories, or CAR files
  - Drag & drop support
  - Real-time progress tracking
  - Support for public and private spaces
- **FileViewer** - View file details (Root CID, Gateway URL, Shards)
- File removal with shard management

### Sharing
- **SharingTool** - Share spaces via email or DID
- Delegation management
- Revocation support

### Settings & Account Management
- **SettingsProvider** - Account settings context
- **RewardsSection** - Display referral counts, credits, and points
- **AccountOverview** - Show account email and current plan
- **UsageSection** - Display storage usage and per-space breakdown
- **AccountManagement** - Account deletion and management
- **ChangePlan** - Plan selection and billing administration

## Installation

```bash
# Install headless components
npm install @storacha/console-toolkit-react @storacha/ui-core
```

## Examples

Complete working examples are available in the `examples/` directory:

- **[headless-auth](./examples/headless-auth/)** - Custom styling with headless components
- **[styled-auth](./examples/styled-auth/)** - Pre-styled components with console-exact UI
- **[iframe-auth](./examples/iframe-auth/)** - Embedded authentication in iframe context
- **[space-management](./examples/space-management/)** - Complete space management with upload, file viewing, sharing, and settings

## Integration Guides

Integration examples:

- **[dmail-integration](./integration-guide/dmail-integration/)** - Dmail email authentication integration
- **[web3mail-integration](./integration-guide/web3mail-integration/)** - Web3Mail (EtherMail) authentication integration

See the [Integration Guide](./integration-guide/README.md) for detailed documentation.

## Development

```bash
# Install dependencies
pnpm install

# Build packages
pnpm build

# Run examples
cd examples/space-management && pnpm dev
cd integration-guide/dmail-integration && pnpm dev
cd integration-guide/web3mail-integration && pnpm dev
```

## License

Dual-licensed under [MIT + Apache 2.0](license.md)
