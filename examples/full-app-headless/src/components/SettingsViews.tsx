import React from 'react'
import {
  SettingsProvider,
  useSettingsContext,
} from '@storacha/console-toolkit-react'
import {
  AccountOverviewTyped,
  UsageSectionTyped,
  AccountManagementTyped,
} from '../types/compoundTypes.js'

export function SettingsView({ onNavigateToChangePlan }: { onNavigateToChangePlan: () => void }) {
  return (
    <SettingsProvider>
      <SettingsViewContent onNavigateToChangePlan={onNavigateToChangePlan} />
    </SettingsProvider>
  )
}

export function SettingsViewContent({ onNavigateToChangePlan }: { onNavigateToChangePlan: () => void }) {
  const [{ accountEmail, plan, usage, planLoading, usageLoading }] = useSettingsContext()

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

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
