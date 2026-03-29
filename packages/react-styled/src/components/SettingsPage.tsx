import React, { useState, useCallback } from 'react'
import {
  SettingsProvider,
  useSettingsContext,
  useW3,
} from '@storacha/console-toolkit-react'
import type { DID as DIDType } from '@ucanto/interface'

// did:mailto format: did:mailto:{domain}:{local} (e.g. user@example.com → did:mailto:example.com:user)
function emailToDidMailto(email: string): DIDType<'mailto'> {
  const [local, domain] = email.split('@')
  return `did:mailto:${domain}:${local}` as DIDType<'mailto'>
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0B'
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  if (bytes < 1024 * 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)}GB`
  return `${(bytes / (1024 * 1024 * 1024 * 1024)).toFixed(1)}TB`
}

const PLAN_NAMES: Record<string, string> = {
  'did:web:starter.storacha.network': 'Starter',
  'did:web:lite.storacha.network': 'Lite',
  'did:web:business.storacha.network': 'Business',
  'did:web:free.storacha.network': 'Free',
  'did:web:trial.storacha.network': 'Trial',
  'did:web:starter.web3.storage': 'Starter',
  'did:web:lite.web3.storage': 'Lite',
  'did:web:business.web3.storage': 'Business',
  'did:web:free.web3.storage': 'Free',
}

const PLAN_LIMITS: Record<string, number> = {
  'did:web:starter.storacha.network': 5 * 1024 * 1024 * 1024,
  'did:web:lite.storacha.network': 100 * 1024 * 1024 * 1024,
  'did:web:business.storacha.network': 2 * 1024 * 1024 * 1024 * 1024,
  'did:web:free.storacha.network': Infinity,
  'did:web:starter.web3.storage': 5 * 1024 * 1024 * 1024,
  'did:web:lite.web3.storage': 100 * 1024 * 1024 * 1024,
  'did:web:business.web3.storage': 2 * 1024 * 1024 * 1024 * 1024,
  'did:web:free.web3.storage': Infinity,
}

const PLAN_CARDS: {
  id: DIDType<'web'>
  name: string
  label: string
  fee: number
  gb: number
  perGb: number
}[] = [
  {
    id: 'did:web:starter.storacha.network',
    name: 'STARTER',
    label: '🌶️',
    fee: 0,
    gb: 5,
    perGb: 0.15,
  },
  {
    id: 'did:web:lite.storacha.network',
    name: 'LITE',
    label: '🌶️🌶️',
    fee: 10,
    gb: 100,
    perGb: 0.05,
  },
  {
    id: 'did:web:business.storacha.network',
    name: 'BUSINESS',
    label: '🔥 BEST VALUE 🔥',
    fee: 100,
    gb: 2000,
    perGb: 0.03,
  },
]

function gbLabel(gb: number): string {
  return gb >= 1000 ? `${(gb / 1000).toFixed(0)},000` : `${gb}`
}

// ─── Main Settings View ─────────────────────────────────────────────────────

function SettingsMain({ onChangePlan }: { onChangePlan: () => void }) {
  const [{ accountEmail, plan, planLoading, usage, usageLoading }, { requestAccountDeletion }] =
    useSettingsContext()

  const planName = plan?.product ? (PLAN_NAMES[plan.product] ?? 'Unknown') : '—'
  const planLimit = plan?.product ? (PLAN_LIMITS[plan.product] ?? 0) : 0
  const spacesList = Object.values(usage?.spaces ?? {}).sort(
    (a, b) => b.total - a.total
  )
  const totalUsed = usage?.total ?? 0

  return (
    <div className="settings-page">
      <h1 className="settings-title">SETTINGS</h1>

      <div className="settings-card">
        {accountEmail && (
          <p className="settings-email">{accountEmail.toUpperCase()}</p>
        )}

        <div className="settings-section">
          <span className="settings-label">PLAN</span>
          <div className="settings-plan-row">
            <span className="settings-plan-name">
              {planLoading ? '…' : planName}
            </span>
            <button className="settings-change-link" onClick={onChangePlan}>
              change
            </button>
          </div>
        </div>

        <div className="settings-section">
          <span className="settings-label">STORAGE</span>
          {usageLoading ? (
            <div className="storacha-auth-spinner settings-spinner" />
          ) : (
            <>
              <p className="settings-usage-summary">
                {formatBytes(totalUsed)}{' '}
                <span className="settings-usage-limit">
                  of {planLimit === Infinity ? '∞' : formatBytes(planLimit)}
                </span>
              </p>
              {spacesList.length > 0 && (
                <table className="settings-usage-table">
                  <tbody>
                    {spacesList.map(({ space, total }) => (
                      <tr key={space} className="settings-usage-row">
                        <td className="settings-usage-space">{space}</td>
                        <td className="settings-usage-bytes">
                          {formatBytes(total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>

      </div>

      <div className="settings-card">
        <span className="settings-label">ACCOUNT MANAGEMENT</span>
        <button className="settings-delete-btn" onClick={requestAccountDeletion}>
          Request Account Deletion
        </button>
      </div>
    </div>
  )
}

// ─── Billing Admin ──────────────────────────────────────────────────────────

function BillingAdmin({ accountEmail }: { accountEmail?: string }) {
  const [{ client, accounts }] = useW3()
  const account = accounts[0]
  const [portalLink, setPortalLink] = useState<string>()
  const [generating, setGenerating] = useState(false)
  const [delegateEmail, setDelegateEmail] = useState('')
  const [delegating, setDelegating] = useState(false)

  const handleGenerateLink = useCallback(async () => {
    if (!account || generating) return
    if (portalLink) {
      window.open(portalLink, '_blank', 'noopener,noreferrer')
      return
    }
    setGenerating(true)
    try {
      const result = await account.plan.createAdminSession(account.did(), window.location.href)
      if (result.ok) setPortalLink(result.ok.url)
    } finally {
      setGenerating(false)
    }
  }, [account, generating, portalLink])

  const handleDelegate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!client || !account || !delegateEmail) return
    const currentSpace = client.currentSpace()
    if (!currentSpace) return
    setDelegating(true)
    try {
      const audience = { did: () => emailToDidMailto(delegateEmail) }
      const delegation = await client.createDelegation(audience as never, [
        'plan/create-admin-session',
        'plan/get',
        'plan/set',
      ], {
        expiration: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365,
      })
      await client.capability.access.delegate({
        space: currentSpace.did(),
        delegations: [delegation],
      })
      setDelegateEmail('')
    } catch (err) {
      console.error('Delegate error:', err)
    } finally {
      setDelegating(false)
    }
  }, [client, account, delegateEmail])

  return (
    <div className="settings-billing-card">
      <h2 className="settings-billing-title">BILLING ADMINISTRATION</h2>
      <p className="settings-billing-desc">Access Billing Admin Portal</p>
      <button
        className="settings-generate-btn"
        onClick={handleGenerateLink}
        disabled={generating}
      >
        {generating ? (
          <span className="storacha-auth-spinner settings-plan-spinner" />
        ) : portalLink ? (
          '↗ OPEN BILLING PORTAL'
        ) : (
          '🔗 GENERATE LINK'
        )}
      </button>

      <p className="settings-billing-desc settings-billing-delegate-label">
        Delegate access to {accountEmail}&apos;s billing admin portal:
      </p>
      <form className="settings-delegate-form" onSubmit={handleDelegate}>
        <input
          type="email"
          placeholder="To Email"
          value={delegateEmail}
          onChange={(e) => setDelegateEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={delegating}>
          {delegating ? 'DELEGATING…' : 'DELEGATE'}
        </button>
      </form>
    </div>
  )
}

// ─── Change Plan View ────────────────────────────────────────────────────────

function ChangePlanView({ onBack }: { onBack: () => void }) {
  const [{ accountEmail, plan, planLoading }, { refreshPlan }] =
    useSettingsContext()
  const [{ accounts }] = useW3()
  const account = accounts[0]
  const currentPlanID = plan?.product
  const [updatingPlan, setUpdatingPlan] = useState<string | null>(null)

  const selectPlan = async (planID: DIDType<'web'>) => {
    if (!account || planID === currentPlanID || updatingPlan) return
    setUpdatingPlan(planID)
    try {
      const result = await account.plan.set(planID)
      if (result.ok) await refreshPlan()
    } finally {
      setUpdatingPlan(null)
    }
  }

  return (
    <div className="settings-page">
      <div className="settings-change-plan-header">
        <button className="settings-back-btn" onClick={onBack}>
          ‹ Back
        </button>
        <h1 className="settings-title">CHANGE PLAN</h1>
      </div>

      {accountEmail && (
        <div className="settings-account-banner">
          YOUR ACCOUNT: {accountEmail.toUpperCase()}
        </div>
      )}

      <div className="settings-plans-grid">
        {PLAN_CARDS.map((card) => {
          const isCurrent = currentPlanID === card.id
          const isUpdating = updatingPlan === card.id
          const isBusy = planLoading || !!updatingPlan

          return (
            <div
              key={card.id}
              className={`settings-plan-card${isCurrent ? ' settings-plan-card-current' : ''}`}
            >
              <div className="settings-plan-card-header">
                <span className="settings-plan-card-name">{card.name}</span>
                <span className="settings-plan-card-label">{card.label}</span>
              </div>
              <p className="settings-plan-price">
                ${card.fee}
                <span className="settings-plan-price-mo">/mo</span>
              </p>
              <p className="settings-plan-feature-title">
                {gbLabel(card.gb)}GB STORAGE
              </p>
              <p className="settings-plan-feature-sub">
                Additional at ${card.perGb}/GB per month
              </p>
              <p className="settings-plan-feature-title">
                {gbLabel(card.gb)}GB EGRESS
              </p>
              <p className="settings-plan-feature-sub settings-plan-feature-sub-upper">
                PER MONTH
              </p>
              <p className="settings-plan-feature-sub">
                Additional at ${card.perGb}/GB per month
              </p>

              {isCurrent ? (
                <button className="settings-plan-current-btn" disabled>
                  ✓ CURRENT PLAN
                </button>
              ) : (
                <button
                  className="settings-plan-upgrade-btn"
                  onClick={() => selectPlan(card.id)}
                  disabled={isBusy}
                >
                  {isUpdating ? (
                    <span className="storacha-auth-spinner settings-plan-spinner" />
                  ) : (
                    '🚀 UPGRADE'
                  )}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <BillingAdmin accountEmail={accountEmail} />
    </div>
  )
}

// ─── Page Router ─────────────────────────────────────────────────────────────

function SettingsPageInner() {
  const [view, setView] = useState<'settings' | 'changePlan'>('settings')

  if (view === 'changePlan') {
    return <ChangePlanView onBack={() => setView('settings')} />
  }
  return <SettingsMain onChangePlan={() => setView('changePlan')} />
}

export function SettingsPage() {
  return (
    <SettingsProvider>
      <SettingsPageInner />
    </SettingsProvider>
  )
}
