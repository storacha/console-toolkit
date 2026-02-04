import type { As, Props, Options } from 'ariakit-react-utils'
import React from 'react'
import { createElement } from 'ariakit-react-utils'
import { useSettingsContext } from './Settings.js'

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

export type AccountOverviewOptions<T extends As = 'div'> = Options<T>

export type AccountOverviewProps<T extends As = 'div'> = Props<
  AccountOverviewOptions<T>
>

/**
 * AccountOverview component - displays account information
 */
export const AccountOverview = React.forwardRef<
  HTMLDivElement,
  AccountOverviewProps<'div'>
>(function AccountOverview(props, ref) {
  return createElement('div', { ref, ...props })
})

export type AccountOverviewEmailOptions<T extends As = 'div'> = Options<T>

export type AccountOverviewEmailProps<T extends As = 'div'> = Props<
  AccountOverviewEmailOptions<T>
>

/**
 * AccountOverview.Email - displays user email
 */
export const AccountOverviewEmail = React.forwardRef<
  HTMLDivElement,
  AccountOverviewEmailProps<'div'>
>(function AccountOverviewEmail(props, ref) {
  const [{ accountEmail }] = useSettingsContext()
  return createElement('div', {
    ref,
    'data-email': accountEmail,
    ...props,
  })
})

export type AccountOverviewPlanOptions<T extends As = 'div'> = Options<T>

export type AccountOverviewPlanProps<T extends As = 'div'> = Props<
  AccountOverviewPlanOptions<T>
>

/**
 * AccountOverview.Plan - displays current plan name
 */
export const AccountOverviewPlan = React.forwardRef<
  HTMLDivElement,
  AccountOverviewPlanProps<'div'>
>(function AccountOverviewPlan(props, ref) {
  const [{ plan }] = useSettingsContext()
  const product = plan?.product
  const planName =
    product && PLANS[product] ? PLANS[product].name : 'Unknown'
  return createElement('div', {
    ref,
    'data-plan-name': planName,
    'data-plan-product': product,
    ...props,
  })
})

export type AccountOverviewChangePlanButtonOptions<T extends As = 'button'> = Options<T>

export type AccountOverviewChangePlanButtonProps<T extends As = 'button'> = Props<
  AccountOverviewChangePlanButtonOptions<T>
>

/**
 * AccountOverview.ChangePlanButton - button to change plan
 */
export const AccountOverviewChangePlanButton = React.forwardRef<
  HTMLButtonElement,
  AccountOverviewChangePlanButtonProps<'button'>
>(function AccountOverviewChangePlanButton(props, ref) {
  return createElement('button', { ref, type: 'button', ...props })
})

// Attach sub-components to main component
Object.assign(AccountOverview, {
  Email: AccountOverviewEmail,
  Plan: AccountOverviewPlan,
  ChangePlanButton: AccountOverviewChangePlanButton,
})

