# Full app (headless) example

This example shows how a **partner product** can embed the **Storacha Console Toolkit** inside its own application: **behavior and data** come from [`@storacha/console-toolkit-react`](../../packages/react/) **headless** components, while **layout, copy, and styling** stay entirely under your control.

---

## Purpose

| Goal | What this example illustrates |
|------|-------------------------------|
| **Embed, don’t fork** | Use the same primitives the Storacha console uses (auth, spaces, uploads, sharing, billing surfaces) without copying internal UI packages. |
| **Headless composition** | Compose small toolkit pieces (`SpacePicker`, `UploadTool`, `StorachaAuth`, …) and render **your** DOM with **your** CSS. |
| **Partner branding** | Replace `src/styles.css` or swap in Tailwind, CSS Modules, or a design system—**no** stylesheet imports are required inside individual feature files beyond the global entry (`main.tsx`). |
| **Reference implementation** | A single place to see wiring, provider order, and typical flows (pick space → list uploads → view file → share → settings). |

**Typical integration path for partners**

1. Add `@storacha/console-toolkit-react` (and peer deps) to your app.
2. Wrap the authenticated area with **`Provider`** and the same context providers this example uses (`StorachaAuth`, `SpacePicker`, etc.).
3. Build **your** shell (nav, header, routes)—here modeled as the **`Dashboard`** component—using toolkit hooks and compound components only for logic.
4. Style with your tokens and components; keep class names or map toolkit render props to your UI library.

---

## Run locally

**From the monorepo root** (after `pnpm install` at the repo root):

```bash
pnpm --filter @storacha/console-toolkit-example-full-app-headless dev
```

**From this directory:**

```bash
pnpm install
pnpm dev
```

Production build:

```bash
pnpm build
```

---

## Application shell

`src/App.tsx` composes providers in a fixed order—**order matters** for context:

| Layer | Role |
|-------|------|
| **`Provider`** | Root toolkit / client context. |
| **`AuthSection`** | `StorachaAuth` + `StorachaAuth.Ensurer`—login UI, session, loading states. |
| **`SpacePicker`** | Space search + list context for the signed-in user. |
| **`Dashboard`** | **Your** main surface after auth: header (“Storacha Console” → home / spaces), navigation, and all feature views (spaces, create, import, upload, files, sharing, settings, change plan). |

The **`Dashboard`** name reflects a common partner pattern: one top-level screen that hosts multiple toolkit-driven sections. A more literal name (e.g. `StorachaConsoleShell`) would also work if you prefer self-documenting file names in a large codebase.

Feature UI is split under `src/components/` (e.g. `SharingView`, `UploadViews`, `SettingsViews`, `ImportSpaceView`) for readability; **global styles** live in **`src/styles.css`** and are imported only from **`main.tsx`**.

---

## Toolkit surface area

| Domain | Headless entry points (representative) |
|--------|----------------------------------------|
| Authentication | `StorachaAuth`, `StorachaAuth.Ensurer`, `StorachaAuth.Form`, … |
| Spaces | `SpacePicker`, `SpaceCreator`, `SpaceList`, `ImportSpace`, `PlanGate` |
| Files & uploads | `FileViewer`, `UploadTool`, remove/upload helpers |
| Sharing | `SharingTool` |
| Account & billing | `AccountOverview`, `UsageSection`, `AccountManagement`, `RewardsSection`, `ChangePlan` (used from Settings / change-plan views) |

See package docs and source under `packages/react` for the full API.

---

## Styling notes

- **Vanilla CSS** in `src/styles.css` demonstrates a complete custom skin.
- You may replace it with any stack (Tailwind, CSS-in-JS, design tokens) as long as your markup still attaches the appropriate hooks (`className`, render props) expected by your composition.
