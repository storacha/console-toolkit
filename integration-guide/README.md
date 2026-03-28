# Integration Guide

Real-world integration examples showing how to embed the Storacha Console Toolkit into a partner application. Both examples demonstrate the complete flow: authentication, space management, file uploads, sharing, and settings.

---

## Examples

### Dmail Integration

Integrates with Dmail (`@dmail.ai`) for email-based authentication and file storage. Includes iframe support for embedded contexts.

```bash
cd dmail-integration
pnpm install
pnpm dev
# http://localhost:3001
```

### Web3Mail Integration

Integrates with Web3Mail / EtherMail (`@ethmail.cc`, `@ethermail.io`) for decentralized email authentication and file storage.

```bash
cd web3mail-integration
pnpm install
pnpm dev
# http://localhost:3002
```

---

## Provider stack

Both integrations follow the same provider order — this order matters:

```tsx
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

Each layer is responsible for one thing:

1. **`Provider`** — initializes the Storacha client
2. **`StorachaAuth`** — manages authentication state and actions
3. **`StorachaAuth.Ensurer`** — blocks rendering until authenticated; shows login UI otherwise
4. **`SpaceEnsurer`** — ensures at least one space exists before rendering children
5. **`SpacePicker`** — provides space selection context to all descendants

---

## Features covered

- Email-based authentication with platform-specific address validation
- Space creation (public and private), listing, and selection
- File uploads with drag-and-drop and progress tracking
- File listing with pagination and CID/gateway URL details
- File sharing via email or DID
- Account settings: plan info, usage stats, account management

---

## Running from the monorepo root

Build the toolkit packages first, then run either integration:

```bash
# From the repo root
pnpm install
pnpm build

# Then start an integration
cd integration-guide/dmail-integration && pnpm dev
# or
cd integration-guide/web3mail-integration && pnpm dev
```
