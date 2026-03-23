import React from 'react'
import { Provider, SpacePicker } from '@storacha/console-toolkit-react'
import { AuthSection } from './components/AuthSection.tsx'
import { Dashboard } from './components/Dashboard.tsx'

function App() {
  return (
    <Provider>
      <AuthSection>
        <SpacePicker>
          <Dashboard />
        </SpacePicker>
      </AuthSection>
    </Provider>
  )
}

export default App
