# headless-auth

Auth-only integration using headless components. This example demonstrates how to build a completely custom authentication UI using `StorachaAuth` render props while keeping all styling under your own control. No Storacha branding is included.

Use this pattern when you only need authentication (no space management or uploads), or when building auth as an isolated step before the rest of your app mounts.

---

## Integration pattern

Install the headless package:

```bash
npm install @storacha/console-toolkit-react
```

### Auth state machine

`StorachaAuth.Ensurer` manages the full auth state machine. Provide a render prop for each state:

```tsx
import { Provider, StorachaAuth } from '@storacha/console-toolkit-react'

function App() {
  return (
    <Provider>
      <StorachaAuth>
        <StorachaAuth.Ensurer
          renderLoader={(type) => (
            <div className="loader">
              {type === 'initializing' ? 'Initializing...' : 'Authenticating...'}
            </div>
          )}
          renderForm={() => <LoginForm />}
          renderSubmitted={() => <CheckEmailScreen />}
        >
          <AuthenticatedApp />
        </StorachaAuth.Ensurer>
      </StorachaAuth>
    </Provider>
  )
}
```

### Building the login form

`StorachaAuth.Form` exposes every slot as a render prop. `StorachaAuth.EmailInput` is a controlled input wired to auth state:

```tsx
import { StorachaAuth } from '@storacha/console-toolkit-react'

function LoginForm() {
  return (
    <StorachaAuth.Form
      renderLogo={() => <MyLogo />}
      renderEmailLabel={() => (
        <label htmlFor="storacha-auth-email">Email</label>
      )}
      renderEmailInput={() => (
        <StorachaAuth.EmailInput
          id="storacha-auth-email"
          className="my-email-input"
          required
        />
      )}
      renderSubmitButton={(disabled) => (
        <button type="submit" disabled={disabled}>
          {disabled ? 'Authorizing...' : 'Authorize'}
        </button>
      )}
    />
  )
}
```

### Post-submission confirmation

`StorachaAuth.Submitted` renders after the email is sent. Use `StorachaAuth.CancelButton` to allow the user to go back:

```tsx
import { StorachaAuth } from '@storacha/console-toolkit-react'

function CheckEmailScreen() {
  return (
    <StorachaAuth.Submitted
      renderTitle={() => <h2>Check your email</h2>}
      renderMessage={(email) => (
        <p>Click the link we sent to <strong>{email}</strong> to sign in.</p>
      )}
      renderCancelButton={() => (
        <StorachaAuth.CancelButton className="cancel-btn">
          Cancel
        </StorachaAuth.CancelButton>
      )}
    />
  )
}
```

### Reading auth state

Use `useStorachaAuth` and `useW3` in any component inside `Provider`:

```tsx
import { useW3, useStorachaAuth } from '@storacha/console-toolkit-react'

function AuthenticatedApp() {
  const [{ accounts }] = useW3()
  const auth = useStorachaAuth()

  return (
    <div>
      <p>Signed in as {accounts[0]?.toEmail()}</p>
      <button onClick={() => auth.logout()}>Sign out</button>
    </div>
  )
}
```

---

## Run this example

```bash
# From the repo root
pnpm install
cd examples/headless-auth
pnpm dev
```
