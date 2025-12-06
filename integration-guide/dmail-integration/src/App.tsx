import { Provider } from '../../../packages/react/src/providers/Provider'
import { StorachaAuth } from '../../../packages/react/src/components/StorachaAuth'
import { DmailAuthForm, AuthenticatedContent } from './components/DmailAuth'

function App() {
  const handleAuthEvent = (event: string, properties?: Record<string, any>) => {
    console.log('🔐 Dmail Auth Event:', event, properties)
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
          renderForm={() => <DmailAuthForm />}
        >
          <AuthenticatedContent />
        </StorachaAuth.Ensurer>
      </StorachaAuth>
    </Provider>
  )
}

export default App
