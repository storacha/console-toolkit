# Contributing to Storacha Console Toolkit

Thanks for your interest in contributing. This guide walks through everything from getting the repo running locally to submitting a pull request.

---

## Prerequisites

- **Node.js** 18 or later
- **pnpm** 8 or later (`npm install -g pnpm`)
- A GitHub account

---

## Fork and clone

1. Fork the repo on GitHub.

2. Clone your fork:

   ```bash
   git clone https://github.com/storacha/console-toolkit
   cd console-toolkit
   ```

3. Add the upstream remote so you can pull in future changes:

   ```bash
   git remote add upstream https://github.com/storacha/console-toolkit
   ```

---

## Install dependencies

From the repo root:

```bash
pnpm install
```

This installs dependencies for all packages and examples at once. The monorepo uses pnpm workspaces, so everything is linked together automatically.

---

## Project structure

```
packages/
  react/              # @storacha/console-toolkit-react (headless components)
  react-styled/       # @storacha/console-toolkit-react-styled (styled wrapper)

examples/
  full-app-headless/  # Complete example with custom UI
  headless-auth/      # Auth-only with custom styling
  styled-auth/        # Auth using the styled package
  iframe-auth/        # Auth inside an iframe

integration-guide/
  dmail-integration/
  web3mail-integration/
```

The two packages under `packages/` are what gets published to npm. The examples and integration guides are not published — they exist for development and reference.

---

## Making changes

Create a branch for your work:

```bash
git checkout -b your-branch-name
```

If you are changing a component in `packages/react`, build it first so the examples can pick up your changes:

```bash
cd packages/react
pnpm build
```

Or run it in watch mode while you develop:

```bash
pnpm dev
```

Then in a separate terminal, run the example you want to test against:

```bash
cd examples/full-app-headless
pnpm dev
```

---

## Running CI checks

Before submitting a PR, run the full check suite from the repo root:

```bash
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
```

Or run them all at once:

```bash
pnpm run ci
```

All four checks must pass. The CI pipeline runs the same commands on every PR.

A few things to keep in mind:

- **Lint**: ESLint runs against `src/**` and `test/**` in each package. Fix any errors before pushing.
- **Typecheck**: TypeScript is set to strict mode. Don't use `any` unless there's a genuine reason.
- **Tests**: Tests use Vitest and `@testing-library/react`. If you change a component's API or behavior, update or add tests in `packages/react/test/`.
- **Build**: A clean build must succeed for all packages. If you add a new export, make sure it's in the package's `index.ts`.

---

## Commit style

Keep commits focused. One logical change per commit. Use a short present-tense subject line:

```
fix(SpaceList): correct pagination cursor on refresh
feat(StorachaAuth): add onAuthEvent callback prop
```

There is no strict enforced format, but keeping commits clean and descriptive makes review easier.

---

## Submitting a PR

1. Push your branch to your fork:

   ```bash
   git push origin your-branch-name
   ```

2. Open a pull request against the `main` branch of `storacha/console-toolkit`.

3. Fill in the PR description. Explain what changed and why. If it fixes an issue, reference it with `Closes #123`.

4. CI will run automatically. Fix anything that fails before requesting review.

---

## Syncing with upstream

If `main` has moved on since you branched:

```bash
git fetch upstream
git rebase upstream/main
```

---

## Questions

If you are unsure about an approach or want feedback before writing code, open an issue first. It is easier to align on direction early than to rework a large PR after the fact.
