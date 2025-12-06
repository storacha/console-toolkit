import { Provider } from '../../../packages/react/src/providers/Provider'
import { StorachaAuth } from '../../../packages/react/src/components/StorachaAuth'
import { Web3MailAuthForm, AuthenticatedContent } from './components/Web3MailAuth'

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
        >
          <AuthenticatedContent />
        </StorachaAuth.Ensurer>
      </StorachaAuth>
    </Provider>
  )
}

export default App
