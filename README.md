# Storacha Console Toolkit

The Storacha Console Toolkit is a plug-and-play UI library that allows Web3 applications to embed Storacha console features directly inside their own interface—eliminating “double navigation” and redirect-based UX.

## Overview

The toolkit provides both headless components (logic only, bring your own styling) and styled components (console-exact UI) for seamless integration. Partner applications can quickly add Storacha features such as authentication, space management, uploads, and sharing—by importing only the components they need.

## Packages

### `@storacha/console-toolkit-react`
Headless React components with no styling dependencies. Provides complete logic with full control over appearance.

### `@storacha/console-toolkit-react-styled`
Pre-styled components matching the Storacha console design. Includes CSS and assets for immediate use.

## Installation

```bash
# For headless components
npm install @storacha/console-toolkit-react @storacha/ui-core

# For styled components
npm install @storacha/console-toolkit-react-styled @storacha/console-toolkit-react @storacha/ui-core
```

## Examples

Complete working examples are available in the `examples/` directory:

- **[headless-auth](./examples/headless-auth/)** - Custom styling with headless components
- **[styled-auth](./examples/styled-auth/)** - Pre-styled components with console-exact UI
- **[iframe-auth](./examples/iframe-auth/)** - Embedded authentication in iframe context


## Development

```bash
# Install dependencies
pnpm install

# Build packages
pnpm build


# Run examples
cd examples/headless-auth && pnpm dev
cd examples/styled-auth && pnpm dev
cd examples/iframe-auth && pnpm dev
```

## License

Dual-licensed under [MIT + Apache 2.0](license.md)
