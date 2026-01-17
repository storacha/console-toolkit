import { Provider, StorachaAuth, SpaceEnsurer, SpacePicker } from '@storacha/console-toolkit-react'
import { Web3MailAuthForm, AuthenticatedContent, Web3MailSubmitted } from './components/Web3MailAuth'

function AuthenticatedApp() {
  return (
    <SpacePicker>
      <AuthenticatedContent />
    </SpacePicker>
  )
}

function App() {
  const handleAuthEvent = (event: string, properties?: Record<string, any>) => {
    console.log('🌐 Web3Mail Auth Event:', event, properties)
  }

  return (
    <Provider>
      <StorachaAuth
        onAuthEvent={handleAuthEvent}
        enableIframeSupport={true}
        serviceName="storacha.network"
        termsUrl="https://docs.storacha.network/terms/"
      >
        <StorachaAuth.Ensurer
          renderForm={() => <Web3MailAuthForm />}
          renderSubmitted={() => <Web3MailSubmitted />}
        >
          <SpaceEnsurer renderNoSpaces={() => <AuthenticatedApp />}>
            <AuthenticatedApp />
          </SpaceEnsurer>
        </StorachaAuth.Ensurer>
      </StorachaAuth>
    </Provider>
  )
}

export default App
