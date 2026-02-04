import { useState, useEffect, FormEvent } from 'react'
import { 
  useStorachaAuth, 
  StorachaAuth,
  SettingsProvider,
  RewardsSection,
  AccountOverview,
  UsageSection,
  AccountManagement,
  ChangePlan,
  useSettingsContext,
  useW3,
} from '@storacha/console-toolkit-react'
import { Footer } from './Footer'
import { Header } from './Header'
import { DmailSpaces } from './DmailSpaces'

// Type assertions for sub-components
const RewardsSectionTyped = RewardsSection as typeof RewardsSection & {
  Referred: any
  USDCredits: any
  RachaPoints: any
  Info: any
  ReferralLink: any
  ReferralsList: any
}
const AccountOverviewTyped = AccountOverview as typeof AccountOverview & {
  Email: any
  Plan: any
  ChangePlanButton: any
}
const UsageSectionTyped = UsageSection as typeof UsageSection & {
  Total: any
  SpacesList: any
  SpaceItem: any
}
const AccountManagementTyped = AccountManagement as typeof AccountManagement & {
  DeleteButton: any
}
const ChangePlanTyped = ChangePlan as typeof ChangePlan & {
  PlanSection: any
  BillingAdmin: any
  CustomerPortalLink: any
  DelegateForm: any
}

export function DmailSubmitted() {
  const auth = useStorachaAuth()

  return (
    <div className="dmail-app">
      <div
        className="dmail-submitted-container"
        style={{
          background: `#EFE3F3 url(../../../packages/react-styled/src/assets/racha-fire.jpg) bottom left`,
          backgroundSize: '100% auto',
          backgroundPosition: 'bottom',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="dmail-submitted-card">
          <div className="dmail-submitted-logo-container">
          <img src="../../../packages/react-styled/src/assets/storacha-logo.svg" alt="Storacha" className="dmail-submitted-logo" />
          </div>

          <div className="dmail-submitted-content">
            <div className="dmail-submitted-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="#E91315" />
              </svg>
            </div>

            <h1 className="dmail-submitted-title">Verify your email address!</h1>

            <p className="dmail-submitted-message">
              Click the link in the email we sent to{' '}
              <span className="dmail-submitted-email">{auth.email || 'your email'}</span> to authorize this agent.
            </p>

            <div className="dmail-submitted-important-note">
              <div className="dmail-submitted-note-icon">⚠️</div>
              <div className="dmail-submitted-note-content">
                <strong>Important:</strong> If you're viewing this email in Dmail, right-click the verification link and select "Open in new tab" to avoid iframe restrictions.
              </div>
            </div>

            <p className="dmail-submitted-hint">
              Once authorized you can close this window and return to the app.
              <br />
              <span className="dmail-submitted-spam-hint">Don't forget to check your spam folder!</span>
            </p>

            <div className="dmail-submitted-actions">
              <StorachaAuth.CancelButton className="dmail-submitted-cancel-button">
                Cancel
              </StorachaAuth.CancelButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AuthenticatedContent() {
  const auth = useStorachaAuth()
  const [viewMode, setViewMode] = useState<'spaces' | 'settings' | 'change-plan'>('spaces')

  const userEmail = auth.currentUser?.email || null

  const walletAddress = userEmail || '0x0000000000000000000000000000000000000000'
  const displayName = `${walletAddress.slice(0, 4)}..${walletAddress.slice(39, 55)}`

  return (
    <div className="dmail-app authenticated-page">
      <div className="authenticated-background">
        <div className="bg-gradient-orb orb-1"></div>
        <div className="bg-gradient-orb orb-2"></div>
        <div className="bg-gradient-orb orb-3"></div>
      </div>

      <Header />

      <main className="app-main authenticated-main">
        <div className="authenticated-content-3d">
          <div className="status-card-3d">
            <div className="status-card-inner">
              <div className="status-icon-wrapper">
                <div className="status-icon-3d">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor" />
                  </svg>
                </div>
                <div className="status-pulse"></div>
              </div>

              <div className="status-content">
                <h2 className="status-title">Connected</h2>
                <p className="status-label">Your Dmail Address</p>
                <div className="wallet-display-3d">
                  <span className="wallet-address-3d">{displayName}</span>
                  <div className="wallet-badge">✓ Verified</div>
                </div>
              </div>

              <div className="action-section-3d">
            <button onClick={auth.logout} className="logout-button-3d">
              <span className="button-text">Sign Out</span>
              <span className="button-shine"></span>
            </button>
          </div>
          
            </div>
          </div>

          {viewMode === 'spaces' && (
            <>
              <DmailSpaces onNavigateToSettings={() => setViewMode('settings')} />
              <div className="features-grid-3d">
            <div className="feature-card-3d">
              <div className="feature-icon-3d">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.1-.9-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z" fill="currentColor" />
                </svg>
              </div>
              <h3 className="feature-title">Secure Storage</h3>
              <p className="feature-desc">Decentralized file storage powered by Storacha</p>
            </div>

            <div className="feature-card-3d">
              <div className="feature-icon-3d">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="currentColor" />
                </svg>
              </div>
              <h3 className="feature-title">Dmail</h3>
              <p className="feature-desc">Decentralized messaging via Dmail</p>
            </div>

            <div className="feature-card-3d">
              <div className="feature-icon-3d">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" fill="currentColor" />
                </svg>
              </div>
              <h3 className="feature-title">Privacy First</h3>
              <p className="feature-desc">End-to-end encrypted communications</p>
            </div>
          </div>
            </>
          )}

          {viewMode === 'settings' && (
            <SettingsSection 
              onNavigateToChangePlan={() => setViewMode('change-plan')} 
              onNavigateToSpaces={() => setViewMode('spaces')}
            />
          )}

          {viewMode === 'change-plan' && (
            <ChangePlanView onBack={() => setViewMode('settings')} />
          )}

        </div>
      </main>

      <Footer />
    </div>
  )
}

function SettingsSection({ onNavigateToChangePlan, onNavigateToSpaces }: { onNavigateToChangePlan: () => void; onNavigateToSpaces: () => void }) {
  const referralsServiceURL = typeof import.meta !== 'undefined' && (import.meta as any).env 
    ? (import.meta as any).env.VITE_REFERRALS_SERVICE_URL 
    : undefined

  return (
    <SettingsProvider
      referralsServiceURL={referralsServiceURL}
      referralURL="http://storacha.network/referred"
    >
      <nav className="dmail-spaces-nav">
        <button
          onClick={onNavigateToSpaces}
          className="dmail-spaces-nav-button"
        >
          <span>📁</span> Spaces
        </button>
        <button
          onClick={() => {
            onNavigateToSpaces()
            setTimeout(() => {
              const creatorCard = document.querySelector('.space-card-3d')
              if (creatorCard) {
                creatorCard.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            }, 100)
          }}
          className="dmail-spaces-nav-button"
        >
          <span>➕</span> Create Space
        </button>
        <button
          className="dmail-spaces-nav-button active"
        >
          <span>⚙️</span> Settings
        </button>
      </nav>
      <SettingsSectionContent onNavigateToChangePlan={onNavigateToChangePlan} />
    </SettingsProvider>
  )
}

function SettingsSectionContent({ onNavigateToChangePlan }: { onNavigateToChangePlan: () => void }) {
  const [{ referrals = [], referralLink, refcodeLoading, accountEmail, plan, usage, usageLoading }, { copyReferralLink }] = useSettingsContext()
  const referralsServiceURL = (import.meta as any).env?.VITE_REFERRALS_SERVICE_URL
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const MAX_REFERRALS = 11
  const MAX_CREDITS = 460
  const referred = referrals.length
  const credits = 0
  const points = 0

  const PLANS: Record<string, { name: string; limit: number }> = {
    'did:web:starter.storacha.network': { name: 'Starter', limit: 5 * 1024 * 1024 * 1024 },
    'did:web:lite.storacha.network': { name: 'Lite', limit: 100 * 1024 * 1024 * 1024 },
    'did:web:business.storacha.network': { name: 'Business', limit: 2 * 1024 * 1024 * 1024 * 1024 },
  }

  const product = plan?.product
  const planName = product && PLANS[product] ? PLANS[product].name : 'Unknown'
  const allocated = Object.values(usage?.spaces ?? {}).reduce((total, space) => total + space.total, 0)
  const limit = plan?.product ? PLANS[plan.product]?.limit ?? 0 : 0

  const spaces = usage ? Object.entries(usage.spaces)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([spaceDID, data]) => ({
      space: spaceDID,
      total: data.total,
    })) : []

  return (
    <div className="dmail-settings-section">
      <div className="dmail-settings-header">
        <h2>Settings</h2>
      </div>

      <RewardsSectionTyped>
        <div className="dmail-settings-subsection">
          <h3>Rewards</h3>
          <div className="dmail-rewards-grid">
            <RewardsSectionTyped.Referred>
              <div className="dmail-reward-card">
                <h4>Referred</h4>
                <div className="dmail-reward-value">{referred} / {MAX_REFERRALS}</div>
              </div>
            </RewardsSectionTyped.Referred>
            <RewardsSectionTyped.USDCredits>
              <div className="dmail-reward-card">
                <h4>USD Credits</h4>
                <div className="dmail-reward-value">{credits} / {MAX_CREDITS}</div>
              </div>
            </RewardsSectionTyped.USDCredits>
            <RewardsSectionTyped.RachaPoints>
              <div className="dmail-reward-card">
                <h4>Racha Points</h4>
                <div className="dmail-reward-value">{points}</div>
              </div>
            </RewardsSectionTyped.RachaPoints>
          </div>
          <RewardsSectionTyped.Info>
            <div className="dmail-rewards-info">
              <h4>Earn Free Storage and Racha Points!</h4>
              <p>Turn your friends into Lite or Business Rachas and receive up to 16 months of Lite and 3 months of Business for free! You can also earn Racha Points.</p>
            </div>
          </RewardsSectionTyped.Info>
          <RewardsSectionTyped.ReferralLink onClick={copyReferralLink}>
            {refcodeLoading ? (
              <div className="dmail-loading-state">Loading...</div>
            ) : referralLink ? (
              <div className="dmail-referral-link">
                <input type="text" readOnly value={referralLink} className="dmail-referral-link-input" />
                <button onClick={copyReferralLink} className="dmail-copy-button">📋 Copy</button>
              </div>
            ) : (
              <div className="dmail-referral-link-placeholder">
                {referralsServiceURL ? 'No referral link available. Click to create one.' : 'Referrals service not configured. Set VITE_REFERRALS_SERVICE_URL to enable referral links.'}
              </div>
            )}
          </RewardsSectionTyped.ReferralLink>
        </div>
      </RewardsSectionTyped>

      <AccountOverviewTyped>
        <div className="dmail-settings-subsection">
          <h3>Plan</h3>
          <AccountOverviewTyped.Email>
            <div className="dmail-account-email">{accountEmail}</div>
          </AccountOverviewTyped.Email>
          <div className="dmail-account-plan-row">
            <AccountOverviewTyped.Plan>
              <span className="dmail-plan-name">{planName}</span>
            </AccountOverviewTyped.Plan>
            <AccountOverviewTyped.ChangePlanButton
              onClick={onNavigateToChangePlan}
              className="dmail-link-button"
            >
              change
            </AccountOverviewTyped.ChangePlanButton>
          </div>
        </div>
      </AccountOverviewTyped>

      <UsageSectionTyped>
        <div className="dmail-settings-subsection">
          <h3>Usage</h3>
          {usageLoading ? (
            <div className="dmail-loading-state">Loading usage...</div>
          ) : (
            <>
              <UsageSectionTyped.Total>
                <div className="dmail-usage-total">
                  <span className="dmail-usage-allocated">{formatFileSize(allocated)}</span>
                  <span className="dmail-usage-limit"> of {limit === Infinity ? 'Unlimited' : formatFileSize(limit)}</span>
                </div>
              </UsageSectionTyped.Total>
              <UsageSectionTyped.SpacesList>
                <table className="dmail-usage-table">
                  <tbody>
                    {spaces.map((space) => (
                      <tr key={space.space}>
                        <td className="dmail-usage-space-did">{space.space}</td>
                        <td className="dmail-usage-space-total">{formatFileSize(space.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </UsageSectionTyped.SpacesList>
            </>
          )}
        </div>
      </UsageSectionTyped>

      <AccountManagementTyped>
        <div className="dmail-settings-subsection">
          <h3>Account Management</h3>
          <AccountManagementTyped.DeleteButton className="dmail-danger-button">
            Request Account Deletion
          </AccountManagementTyped.DeleteButton>
        </div>
      </AccountManagementTyped>
    </div>
  )
}

function ChangePlanView({ onBack }: { onBack: () => void }) {
  const [{ accounts }] = useW3()
  const account = accounts[0]

  if (!account) return null

  return (
    <SettingsProvider>
      <ChangePlanViewContent onBack={onBack} account={account} />
    </SettingsProvider>
  )
}

function ChangePlanViewContent({ onBack, account }: { onBack: () => void; account: any }) {
  const [{ plan, planLoading }] = useSettingsContext()

  const currentPlanID = plan?.product
  const planRanks: Record<string, number> = {
    'did:web:starter.storacha.network': 0,
    'did:web:lite.storacha.network': 1,
    'did:web:business.storacha.network': 2,
  }
  const buttonText = (currentPlan: string, newPlan: string) =>
    planRanks[currentPlan] > planRanks[newPlan] ? 'Downgrade' : 'Upgrade'

  return (
    <div className="dmail-settings-section">
      <div className="dmail-settings-header">
        <button onClick={onBack} className="dmail-back-button">← Back to Settings</button>
        <h2>Change Plan</h2>
      </div>

      <ChangePlanTyped>
        <div className="dmail-plans-grid">
          <ChangePlanTyped.PlanSection
            planID="did:web:starter.storacha.network"
            planName="Starter"
            planLabel="🌶️"
            flatFee={0}
            flatFeeAllotment={5}
            perGbFee={0.15}
          >
            <div className="dmail-plan-card">
              <div className="dmail-plan-header">
                <h3>Starter</h3>
                <span>🌶️</span>
              </div>
              <div className="dmail-plan-price">$0/mo</div>
              <div className="dmail-plan-details">
                <p>5GB storage</p>
                <p>Additional at $0.15/GB</p>
                <p>5GB egress</p>
                <p>Additional at $0.15/GB</p>
              </div>
              {currentPlanID === 'did:web:starter.storacha.network' ? (
                <div className="dmail-plan-current">Current Plan</div>
              ) : (
                <button 
                  disabled={planLoading} 
                  className="dmail-plan-button"
                  onClick={(e) => {
                    e.stopPropagation()
                    const el = e.currentTarget.closest('[data-plan-id]') as HTMLElement
                    if (el) {
                      el.click()
                    }
                  }}
                >
                  {planLoading ? 'Loading...' : currentPlanID ? buttonText(currentPlanID, 'did:web:starter.storacha.network') : 'Select'}
                </button>
              )}
            </div>
          </ChangePlanTyped.PlanSection>

          <ChangePlanTyped.PlanSection
            planID="did:web:lite.storacha.network"
            planName="Lite"
            planLabel="🌶️🌶️"
            flatFee={10}
            flatFeeAllotment={100}
            perGbFee={0.05}
          >
            <div className="dmail-plan-card">
              <div className="dmail-plan-header">
                <h3>Lite</h3>
                <span>🌶️🌶️</span>
              </div>
              <div className="dmail-plan-price">$10/mo</div>
              <div className="dmail-plan-details">
                <p>100GB storage</p>
                <p>Additional at $0.05/GB</p>
                <p>100GB egress</p>
                <p>Additional at $0.05/GB</p>
              </div>
              {currentPlanID === 'did:web:lite.storacha.network' ? (
                <div className="dmail-plan-current">Current Plan</div>
              ) : (
                <button 
                  disabled={planLoading} 
                  className="dmail-plan-button"
                  onClick={(e) => {
                    e.stopPropagation()
                    const el = e.currentTarget.closest('[data-plan-id]') as HTMLElement
                    if (el) {
                      el.click()
                    }
                  }}
                >
                  {planLoading ? 'Loading...' : currentPlanID ? buttonText(currentPlanID, 'did:web:lite.storacha.network') : 'Upgrade'}
                </button>
              )}
            </div>
          </ChangePlanTyped.PlanSection>

          <ChangePlanTyped.PlanSection
            planID="did:web:business.storacha.network"
            planName="Business"
            planLabel="🔥 Best Value 🔥"
            flatFee={100}
            flatFeeAllotment={2000}
            perGbFee={0.03}
          >
            <div className="dmail-plan-card">
              <div className="dmail-plan-header">
                <h3>Business</h3>
                <span>🔥 Best Value 🔥</span>
              </div>
              <div className="dmail-plan-price">$100/mo</div>
              <div className="dmail-plan-details">
                <p>2TB storage</p>
                <p>Additional at $0.03/GB</p>
                <p>2TB egress</p>
                <p>Additional at $0.03/GB</p>
              </div>
              {currentPlanID === 'did:web:business.storacha.network' ? (
                <div className="dmail-plan-current">Current Plan</div>
              ) : (
                <button 
                  disabled={planLoading} 
                  className="dmail-plan-button"
                  onClick={(e) => {
                    e.stopPropagation()
                    const el = e.currentTarget.closest('[data-plan-id]') as HTMLElement
                    if (el) {
                      el.click()
                    }
                  }}
                >
                  {planLoading ? 'Loading...' : currentPlanID ? buttonText(currentPlanID, 'did:web:business.storacha.network') : 'Upgrade'}
                </button>
              )}
            </div>
          </ChangePlanTyped.PlanSection>
        </div>

        <ChangePlanTyped.BillingAdmin>
          <div className="dmail-billing-admin">
            <h3>Billing Administration</h3>
            <p>Access Billing Admin Portal</p>
            <BillingPortalButton accountDID={account.did()} />
            <BillingDelegateForm accountDID={account.did()} />
          </div>
        </ChangePlanTyped.BillingAdmin>
      </ChangePlanTyped>
    </div>
  )
}

function BillingPortalButton({ accountDID }: { accountDID: string }) {
  const [customerPortalLink, setCustomerPortalLink] = useState<string>()
  const [generating, setGenerating] = useState(false)
  const [{ client, accounts }] = useW3()
  const account = accounts[0]

  const generateLink = async () => {
    if (!client || !account) return
    setGenerating(true)
    try {
      const result = await account.plan.createAdminSession(accountDID as any, window.location.href)
      if (result.ok) {
        setCustomerPortalLink(result.ok.url)
      }
    } catch (error) {
      console.error('Error creating admin session:', error)
    } finally {
      setGenerating(false)
    }
  }

  if (customerPortalLink) {
    return (
      <div>
        <button onClick={generateLink} disabled={generating} className="dmail-billing-button">
          🔄
        </button>
        <a href={customerPortalLink} target="_blank" rel="noopener noreferrer" className="dmail-billing-button">
          Open Billing Portal →
        </a>
      </div>
    )
  }

  return (
    <ChangePlanTyped.CustomerPortalLink accountDID={accountDID as any}>
      <button onClick={generateLink} disabled={generating} className="dmail-billing-button">
        {generating ? 'Generating...' : 'Generate Link'}
      </button>
    </ChangePlanTyped.CustomerPortalLink>
  )
}

function BillingDelegateForm({ accountDID }: { accountDID: string }) {
  return (
    <ChangePlanTyped.DelegateForm accountDID={accountDID as any}>
      <form className="dmail-delegate-form">
        <label>
          Delegate Billing Access
          <input type="email" placeholder="To Email" required />
        </label>
        <button type="submit">DELEGATE</button>
      </form>
    </ChangePlanTyped.DelegateForm>
  )
}

export function DmailAuthForm() {
  const auth = useStorachaAuth()
  const [error, setError] = useState<string | null>(null)

  const isDmailEmail = (email: string) => {
    return email.endsWith('@dmail.ai')
  }

  useEffect(() => {
    if (auth.email && isDmailEmail(auth.email)) {
      setError(null)
    }
  }, [auth.email])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // if (!auth.email) {
    //   setError('Please enter your Dmail address')
    //   return
    // }

    // if (!isDmailEmail(auth.email)) {
    //   setError('Please use a Dmail address (e.g. wallet addr@dmail.ai)')
    //   return
    // }

    setError(null)

    try {
      if (auth.handleRegisterSubmit) {
        await auth.handleRegisterSubmit(e)
      }
    } catch (err: any) {
      if (err?.name === 'AbortError' || err?.message?.includes('aborted')) {
        return
      }
      setError(err?.message || 'Authentication failed. Please try again.')
    }
  }

  return (
    <div className="dmail-app">
      <Header />

      <main className="app-main">
        <div className="dmail-auth">
          <div className="auth-header">
            <h2>Connect with Dmail</h2>
            <p>Use your Dmail address to authenticate and access Storacha storage</p>
          </div>

          {error && (
            <div className="error-banner">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
              <button onClick={() => setError(null)} className="close-button">
                ×
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="dmail-auth-form">
            <div className="email-input-group">
              <label htmlFor="dmail-email">Dmail Email</label>
              <StorachaAuth.EmailInput
                id="dmail-email"
                type="email"
                placeholder="wallet addr@dmail.ai"
                className="dmail-email-input"
                required
              />
              {/* {auth.email && !isDmailEmail(auth.email) && (
                <p className="email-error" style={{ color: '#ff6b6b', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Please use a Dmail address (e.g. wallet addr@dmail.ai)
                </p>
              )} */}
            </div>

            <button
              type="submit"
              // disabled={auth.isSubmitting || (auth.email ? !isDmailEmail(auth.email) : false)}
              className="dmail-auth-button"
            >
              {auth.isSubmitting ? 'Authenticating...' : 'Authenticate with Storacha'}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}