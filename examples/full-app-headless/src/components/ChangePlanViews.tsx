import React, { useState } from 'react'
import {
  useW3,
  SettingsProvider,
  useSettingsContext,
} from '@storacha/console-toolkit-react'
import { ChangePlanTyped } from '../types/compoundTypes.js'

export function ChangePlanView({ onBack }: { onBack: () => void }) {
  const [{ accounts }] = useW3()
  const account = accounts[0]

  if (!account) return null

  return (
    <SettingsProvider>
      <ChangePlanViewContent onBack={onBack} account={account} />
    </SettingsProvider>
  )
}

export function ChangePlanViewContent({ onBack, account }: { onBack: () => void; account: any }) {
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
    <div className="app-section">
        <div className="app-section-header">
          <button onClick={onBack} className="app-back-button">← Back to Settings</button>
          <h2>Change Plan</h2>
        </div>

        <ChangePlanTyped>
          <div className="app-plans-grid">
            <ChangePlanTyped.PlanSection
              planID="did:web:starter.storacha.network"
              planName="Starter"
              planLabel="🌶️"
              flatFee={0}
              flatFeeAllotment={5}
              perGbFee={0.15}
            >
              <div className="app-plan-card">
                <div className="app-plan-header">
                  <h3>Starter</h3>
                  <span>🌶️</span>
                </div>
                <div className="app-plan-price">$0/mo</div>
                <div className="app-plan-details">
                  <p>5GB storage</p>
                  <p>Additional at $0.15/GB</p>
                  <p>5GB egress</p>
                  <p>Additional at $0.15/GB</p>
                </div>
                {currentPlanID === 'did:web:starter.storacha.network' ? (
                  <div className="app-plan-current">Current Plan</div>
                ) : (
                  <button
                    disabled={planLoading}
                    className="app-plan-button"
                    onClick={(e) => {
                      e.preventDefault()
                      const el = e.currentTarget.closest('[data-plan-id]') as HTMLElement
                      const planID = el?.getAttribute('data-plan-id')
                      if (planID) {
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
              <div className="app-plan-card">
                <div className="app-plan-header">
                  <h3>Lite</h3>
                  <span>🌶️🌶️</span>
                </div>
                <div className="app-plan-price">$10/mo</div>
                <div className="app-plan-details">
                  <p>100GB storage</p>
                  <p>Additional at $0.05/GB</p>
                  <p>100GB egress</p>
                  <p>Additional at $0.05/GB</p>
                </div>
                {currentPlanID === 'did:web:lite.storacha.network' ? (
                  <div className="app-plan-current">Current Plan</div>
                ) : (
                  <button
                    disabled={planLoading}
                    className="app-plan-button"
                    onClick={(e) => {
                      e.preventDefault()
                      const el = e.currentTarget.closest('[data-plan-id]') as HTMLElement
                      const planID = el?.getAttribute('data-plan-id')
                      if (planID) {
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
              <div className="app-plan-card">
                <div className="app-plan-header">
                  <h3>Business</h3>
                  <span>🔥 Best Value 🔥</span>
                </div>
                <div className="app-plan-price">$100/mo</div>
                <div className="app-plan-details">
                  <p>2TB storage</p>
                  <p>Additional at $0.03/GB</p>
                  <p>2TB egress</p>
                  <p>Additional at $0.03/GB</p>
                </div>
                {currentPlanID === 'did:web:business.storacha.network' ? (
                  <div className="app-plan-current">Current Plan</div>
                ) : (
                  <button
                    disabled={planLoading}
                    className="app-plan-button"
                    onClick={(e) => {
                      e.preventDefault()
                      const el = e.currentTarget.closest('[data-plan-id]') as HTMLElement
                      const planID = el?.getAttribute('data-plan-id')
                      if (planID) {
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
            <div className="app-billing-admin">
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
        <button onClick={generateLink} disabled={generating} className="app-billing-button">
          🔄
        </button>
        <a href={customerPortalLink} target="_blank" rel="noopener noreferrer" className="app-billing-button">
          Open Billing Portal →
        </a>
      </div>
    )
  }

  return (
    <ChangePlanTyped.CustomerPortalLink accountDID={accountDID as any}>
      <button onClick={generateLink} disabled={generating} className="app-billing-button">
        {generating ? 'Generating...' : 'Generate Link'}
      </button>
    </ChangePlanTyped.CustomerPortalLink>
  )
}

function BillingDelegateForm({ accountDID }: { accountDID: string }) {
  return (
    <ChangePlanTyped.DelegateForm accountDID={accountDID as any}>
      <form className="app-delegate-form">
        <label>
          Delegate Billing Access
          <input type="email" placeholder="To Email" required />
        </label>
        <button type="submit">DELEGATE</button>
      </form>
    </ChangePlanTyped.DelegateForm>
  )
}
