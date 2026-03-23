import React from 'react'
import {
  SettingsProvider,
  useSettingsContext,
} from '@storacha/console-toolkit-react'
import {
  RewardsSectionTyped,
  AccountOverviewTyped,
  UsageSectionTyped,
  AccountManagementTyped,
} from '../types/compoundTypes.js'

export function SettingsView({ onNavigateToChangePlan }: { onNavigateToChangePlan: () => void }) {
  // Get referrals service URL from environment or use undefined (optional)
  const referralsServiceURL = typeof import.meta !== 'undefined' && (import.meta as any).env
    ? (import.meta as any).env.VITE_REFERRALS_SERVICE_URL
    : undefined

  return (
    <SettingsProvider
      referralsServiceURL={referralsServiceURL}
      referralURL="http://storacha.network/referred"
    >
      <SettingsViewContent onNavigateToChangePlan={onNavigateToChangePlan} />
    </SettingsProvider>
  )
}

export function SettingsViewContent({ onNavigateToChangePlan }: { onNavigateToChangePlan: () => void }) {
  const [{ referrals = [], referralLink, refcodeLoading, accountEmail, plan, usage, planLoading, usageLoading }, { copyReferralLink }] = useSettingsContext()
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
  const credits = 0 // TODO: Calculate from referral information
  const points = 0 // TODO: Calculate from referral information

  const PLANS: Record<string, { name: string; limit: number }> = {
    'did:web:starter.web3.storage': { name: 'Starter', limit: 5 * 1024 * 1024 * 1024 },
    'did:web:lite.web3.storage': { name: 'Lite', limit: 100 * 1024 * 1024 * 1024 },
    'did:web:business.web3.storage': { name: 'Business', limit: 2 * 1024 * 1024 * 1024 * 1024 },
    'did:web:free.web3.storage': { name: 'Free', limit: Infinity },
    'did:web:trial.storacha.network': { name: 'Trial', limit: 100 * 1024 * 1024 },
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
    <div className="app-section">
      <div className="app-section-header">
        <h2>Settings</h2>
      </div>

        <RewardsSectionTyped>
          <div className="app-settings-section">
            <h3>Rewards</h3>
            <div className="app-rewards-grid">
              <RewardsSectionTyped.Referred>
                <div className="app-reward-card">
                  <h4>Referred</h4>
                  <div className="app-reward-value">{referred} / {MAX_REFERRALS}</div>
                </div>
              </RewardsSectionTyped.Referred>
              <RewardsSectionTyped.USDCredits>
                <div className="app-reward-card">
                  <h4>USD Credits</h4>
                  <div className="app-reward-value">{credits} / {MAX_CREDITS}</div>
                </div>
              </RewardsSectionTyped.USDCredits>
              <RewardsSectionTyped.RachaPoints>
                <div className="app-reward-card">
                  <h4>Racha Points</h4>
                  <div className="app-reward-value">{points}</div>
                </div>
              </RewardsSectionTyped.RachaPoints>
            </div>
            <RewardsSectionTyped.Info>
              <div className="app-rewards-info">
                <h4>Earn Free Storage and Racha Points!</h4>
                <p>Turn your friends into Lite or Business Rachas and receive up to 16 months of Lite and 3 months of Business for free! You can also earn Racha Points.</p>
              </div>
            </RewardsSectionTyped.Info>
            <RewardsSectionTyped.ReferralLink onClick={copyReferralLink}>
              {refcodeLoading ? (
                <div className="app-loading-state">Loading...</div>
              ) : referralLink ? (
                <div className="app-referral-link">
                  <input type="text" readOnly value={referralLink} className="app-referral-link-input" />
                  <button onClick={copyReferralLink} className="app-copy-button">📋 Copy</button>
                </div>
              ) : (
                <div className="app-referral-link-placeholder">
                  {referralsServiceURL ? 'No referral link available. Click to create one.' : 'Referrals service not configured. Set VITE_REFERRALS_SERVICE_URL to enable referral links.'}
                </div>
              )}
            </RewardsSectionTyped.ReferralLink>
          </div>
        </RewardsSectionTyped>

        <AccountOverviewTyped>
          <div className="app-settings-section">
            <h3>Plan</h3>
            <AccountOverviewTyped.Email>
              <div className="app-account-email">{accountEmail}</div>
            </AccountOverviewTyped.Email>
            <div className="app-account-plan-row">
              <AccountOverviewTyped.Plan>
                <span className="app-plan-name">{planName}</span>
              </AccountOverviewTyped.Plan>
              <AccountOverviewTyped.ChangePlanButton
                onClick={onNavigateToChangePlan}
                className="app-link-button"
              >
                change
              </AccountOverviewTyped.ChangePlanButton>
            </div>
          </div>
        </AccountOverviewTyped>

        <UsageSectionTyped>
          <div className="app-settings-section">
            <h3>Usage</h3>
            {usageLoading ? (
              <div className="app-loading-state">Loading usage...</div>
            ) : (
              <>
                <UsageSectionTyped.Total>
                  <div className="app-usage-total">
                    <span className="app-usage-allocated">{formatFileSize(allocated)}</span>
                    <span className="app-usage-limit"> of {limit === Infinity ? 'Unlimited' : formatFileSize(limit)}</span>
                  </div>
                </UsageSectionTyped.Total>
                <UsageSectionTyped.SpacesList>
                  <table className="app-usage-table">
                    <tbody>
                      {spaces.map((space) => (
                        <tr key={space.space}>
                          <td className="app-usage-space-did">{space.space}</td>
                          <td className="app-usage-space-total">{formatFileSize(space.total)}</td>
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
          <div className="app-settings-section">
            <h3>Account Management</h3>
            <AccountManagementTyped.DeleteButton className="app-danger-button">
              Request Account Deletion
            </AccountManagementTyped.DeleteButton>
          </div>
        </AccountManagementTyped>
      </div>
  )
}
