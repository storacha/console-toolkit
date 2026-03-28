import React from 'react'
import { Provider, useW3, useStorachaAuth, StorachaAuth } from '@storacha/console-toolkit-react-styled'

function AuthenticatedApp() {
  const [{ accounts }] = useW3()
  const auth = useStorachaAuth()

  return (
    <div>
      <h2>Authenticated</h2>
      <p>Signed in as: {accounts[0]?.toEmail()}</p>
      <button onClick={auth.logoutWithTracking}>Sign Out</button>
    </div>
  )
}

function App() {
  const handleAuthEvent = (event: string, properties?: Record<string, any>) => {
    console.log('Auth Event:', event, properties)
  }

  return (
    <Provider>
      <StorachaAuth
        onAuthEvent={handleAuthEvent}
        enableIframeSupport={true}
      >
        <StorachaAuth.Ensurer>
          <AuthenticatedApp />
        </StorachaAuth.Ensurer>
      </StorachaAuth>
    </Provider>
  )
}

export default App


