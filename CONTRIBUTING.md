## Contributing to Storacha Console Toolkit

Thank you for your interest in contributing to the Storacha Console Toolkit.
This project extracts reusable UI from the main Storacha Console and makes it available as a plug-and-play toolkit for partner applications.

### Project layout

- **`packages/react`**: React bindings that provide the core auth context, hooks, and components.
- **`packages/react-styled`**: React components that match the Storacha console look-and-feel.
- **`examples/`**: Small example apps that demonstrate typical usage, including iframe / embedded flows.

### How to contribute

- **Bugs / questions**: Open a GitHub Issue with a clear description, reproduction steps, and expected vs actual behavior.
- **Features / improvements**: Open an Issue first to discuss the use‑case and API shape before starting work.
- **Small fixes** (typos, small refactors, docs): You can usually open a PR directly without prior discussion.

### Development guidelines

- **Prefer composition over duplication**:  
  - Reuse existing hooks and context (for example `Provider`, `useStorachaAuth`) instead of re-implementing logic.  
  - If something from the console is useful here, extract and generalize it rather than copy‑pasting.
- **API shape matters**:  
  - New components and hooks should be usable both in simple drop‑in scenarios and in advanced, customized setups.  
  - Prefer props that accept `className`, `style`, and/or render‑props for flexibility.

### Coding style

- **Language / stack**: TypeScript, React function components, hooks-based APIs.
- **Structure**: Keep files focused and small; factor shared logic into hooks or utilities where it improves clarity.
- **Naming**: Use clear, descriptive names (for example `StorachaAuthEnsurer`) that match existing patterns.

### Tests and examples

- **Tests**:  
  - Add or update tests when you change behavior or add new features.  
  - Prefer small, focused tests for hooks and components.
- **Examples**:  
  - When you add a new capability, consider updating or adding an example under `examples/` to show realistic usage.  
  - Keep examples minimal but runnable, so integrators can copy patterns directly.

### Pull request checklist

Before marking a PR as ready for review:

- **API** is consistent with existing components and hooks.  
- **Tests** are added or updated where behavior changed.  
- **Examples / docs** are updated when introducing new capabilities.


