import React from 'react'
import {
  PlanGate,
  usePlanGateContext,
  useW3,
} from '@storacha/console-toolkit-react'
import type { ReactNode } from 'react'
import { storachaLogoUrl } from '../assets/index.js'

const PLANS = [
  {
    id: 'did:web:starter.storacha.network',
    name: 'Starter',
    emoji: '🌶️',
    price: '$0/mo',
    storage: '5GB Storage',
    storageExtra: 'Additional at $0.15/GB per month',
    egress: '5GB Egress',
    egressExtra: 'Additional at $0.15/GB per month',
  },
  {
    id: 'did:web:lite.storacha.network',
    name: 'Lite',
    emoji: '🌶️🌶️',
    price: '$10/mo',
    storage: '100GB Storage',
    storageExtra: 'Additional at $0.05/GB per month',
    egress: '100GB Egress',
    egressExtra: 'Additional at $0.05/GB per month',
  },
  {
    id: 'did:web:business.storacha.network',
    name: 'Business',
    emoji: '🌶️🌶️🌶️',
    price: '$100/mo',
    storage: '2TB Storage',
    storageExtra: 'Additional at $0.03/GB per month',
    egress: '2TB Egress',
    egressExtra: 'Additional at $0.03/GB per month',
  },
]

function PlanSelectionPage({
  selectPlan,
}: {
  selectPlan: (id: string) => Promise<void>
}) {
  const [{ accounts }] = useW3()
  const email = accounts[0]?.toEmail()

  return (
    <div className="plan-gate-page">
      <div className="plan-gate-card">
        <div className="plan-gate-logo">
          <img src={storachaLogoUrl} alt="Storacha" />
        </div>
        {email && <p className="plan-gate-welcome">Welcome, <strong>{email}</strong>!</p>}
        <p className="plan-gate-desc">
          To get started you'll need to sign up for a subscription. If you choose the starter plan we won't charge
          your credit card, but we do need a card on file before we will store your bits.
        </p>
        <p className="plan-gate-desc">Pick a plan below and complete the Stripe checkout flow to get started!</p>
        <div className="plan-gate-plans">
          {PLANS.map((plan) => (
            <div key={plan.id} className="plan-card">
              <div className="plan-card-header">
                <span className="plan-card-name">{plan.name}</span>
                <span className="plan-card-emoji">{plan.emoji}</span>
              </div>
              <div className="plan-card-price">{plan.price}</div>
              <div className="plan-card-details">
                <p className="plan-card-feature">{plan.storage}</p>
                <p className="plan-card-feature-extra">{plan.storageExtra}</p>
                <p className="plan-card-feature">{plan.egress}</p>
                <p className="plan-card-feature-extra">{plan.egressExtra}</p>
              </div>
              <button
                className="storacha-auth-button plan-card-btn"
                onClick={() => selectPlan(plan.id)}
              >
                Start Storing
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Inner component: reads planStatus from context and either renders children
 * or the plan selection page. Children are ALWAYS in the same React tree so
 * component state (e.g. selectedSpace) is never lost during loading→active transition.
 */
function PlanGateInner({ children }: { children: ReactNode }) {
  const [{ planStatus }, { selectPlan }] = usePlanGateContext()

  if (planStatus === 'missing') {
    return <PlanSelectionPage selectPlan={selectPlan} />
  }

  // loading or active — render children in the same stable tree
  return <>{children}</>
}

export interface PlanGateViewProps {
  children: ReactNode
}

export function PlanGateView({ children }: PlanGateViewProps) {
  return (
    <PlanGate>
      <PlanGateInner>{children}</PlanGateInner>
    </PlanGate>
  )
}
