import type { As, Props, Options } from 'ariakit-react-utils'
import React, { useState, useCallback } from 'react'
import { createElement } from 'ariakit-react-utils'
import { useW3 } from '../../providers/Provider.js'
import { useSettingsContext } from './Settings.js'
import { DID } from '@ucanto/core'
import type { DID as DIDType } from '@ucanto/interface'
import type { AccountDID } from '@storacha/ui-core'
import * as DidMailto from '@storacha/did-mailto'

export const PLANS: Record<string, DIDType<'web'>> = {
  starter: 'did:web:starter.storacha.network',
  lite: 'did:web:lite.storacha.network',
  business: 'did:web:business.storacha.network',
}

const planRanks: Record<string, number> = {
  [PLANS['starter']]: 0,
  [PLANS['lite']]: 1,
  [PLANS['business']]: 2,
}

const buttonText = (currentPlan: string, newPlan: string) =>
  planRanks[currentPlan] > planRanks[newPlan] ? 'Downgrade' : 'Upgrade'

export type ChangePlanOptions<T extends As = 'div'> = Options<T>

export type ChangePlanProps<T extends As = 'div'> = Props<
  ChangePlanOptions<T>
>

/**
 * ChangePlan component - displays plan selection and billing administration
 */
export const ChangePlan = React.forwardRef<
  HTMLDivElement,
  ChangePlanProps<'div'>
>(function ChangePlan(props, ref) {
  return createElement('div', { ref, ...props })
})

export interface PlanSectionProps {
  planID: DIDType<'web'>
  planName: string
  planLabel: string
  flatFee: number
  flatFeeAllotment: number
  perGbFee: number
}

export type ChangePlanPlanSectionOptions<T extends As = 'div'> = Options<T> & PlanSectionProps

export type ChangePlanPlanSectionProps<T extends As = 'div'> = Props<
  ChangePlanPlanSectionOptions<T>
>

/**
 * ChangePlan.PlanSection - displays a plan option
 */
export const ChangePlanPlanSection = React.forwardRef<
  HTMLDivElement,
  ChangePlanPlanSectionProps<'div'>
>(function ChangePlanPlanSection(
  { planID, planName, planLabel, flatFee, flatFeeAllotment, perGbFee, ...props },
  ref
) {
  const [{ accounts }] = useW3()
  const [{ plan, planLoading }, { refreshPlan }] = useSettingsContext()
  const account = accounts[0]
  const currentPlanID = plan?.product
  const isCurrentPlan = currentPlanID === planID
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false)

  const selectPlan = useCallback(
    async (selectedPlanID: DIDType<'web'>) => {
      if (!account) return
      try {
        setIsUpdatingPlan(true)
        const result = await account.plan.set(selectedPlanID)
        if (result.ok) {
          await refreshPlan()
        } else {
          console.error('Failed to set plan:', result.error)
        }
      } finally {
        setIsUpdatingPlan(false)
      }
    },
    [account, refreshPlan]
  )

  const handleClick = useCallback(() => {
    if (!isCurrentPlan && !planLoading && !isUpdatingPlan) {
      selectPlan(planID)
    }
  }, [isCurrentPlan, planLoading, isUpdatingPlan, selectPlan, planID])

  return createElement('div', {
    ref,
    'data-plan-id': planID,
    'data-plan-name': planName,
    'data-plan-label': planLabel,
    'data-flat-fee': flatFee,
    'data-flat-fee-allotment': flatFeeAllotment,
    'data-per-gb-fee': perGbFee,
    'data-is-current-plan': isCurrentPlan,
    'data-is-loading': planLoading || isUpdatingPlan,
    'data-button-text': currentPlanID && !isCurrentPlan ? buttonText(currentPlanID, planID) : undefined,
    onClick: handleClick,
    ...props,
  })
})

export type ChangePlanBillingAdminOptions<T extends As = 'div'> = Options<T>

export type ChangePlanBillingAdminProps<T extends As = 'div'> = Props<
  ChangePlanBillingAdminOptions<T>
>

/**
 * ChangePlan.BillingAdmin - displays billing administration section
 */
export const ChangePlanBillingAdmin = React.forwardRef<
  HTMLDivElement,
  ChangePlanBillingAdminProps<'div'>
>(function ChangePlanBillingAdmin(props, ref) {
  return createElement('div', { ref, ...props })
})

export type ChangePlanCustomerPortalLinkOptions<T extends As = 'button'> = Options<T> & {
  accountDID: AccountDID
}

export type ChangePlanCustomerPortalLinkProps<T extends As = 'button'> = Props<
  ChangePlanCustomerPortalLinkOptions<T>
>

/**
 * ChangePlan.CustomerPortalLink - displays customer portal link button
 */
export const ChangePlanCustomerPortalLink = React.forwardRef<
  HTMLButtonElement,
  ChangePlanCustomerPortalLinkProps<'button'>
>(function ChangePlanCustomerPortalLink({ accountDID, ...props }, ref) {
  const [{ client, accounts }] = useW3()
  const account = accounts[0]
  const [customerPortalLink, setCustomerPortalLink] = useState<string>()
  const [generatingCustomerPortalLink, setGeneratingCustomerPortalLink] =
    useState(false)

  const generateCustomerPortalLink = useCallback(
    async (did: AccountDID) => {
      if (!client || !account) return

      setGeneratingCustomerPortalLink(true)
      try {
        const result = await account.plan.createAdminSession(did, window.location.href)
        if (result.ok) {
          setCustomerPortalLink(result.ok.url)
        } else {
          console.error('Error creating admin session:', result.error)
        }
      } catch (error) {
        console.error('Error creating admin session:', error)
      } finally {
        setGeneratingCustomerPortalLink(false)
      }
    },
    [client, account]
  )

  return createElement('button', {
    ref,
    type: 'button',
    'data-customer-portal-link': customerPortalLink,
    'data-generating': generatingCustomerPortalLink,
    onClick: customerPortalLink
      ? () => window.open(customerPortalLink, '_blank', 'noopener,noreferrer')
      : () => generateCustomerPortalLink(accountDID),
    ...props,
  })
})

export type ChangePlanDelegateFormOptions<T extends As = 'form'> = Options<T> & {
  accountDID: AccountDID
}

export type ChangePlanDelegateFormProps<T extends As = 'form'> = Props<
  ChangePlanDelegateFormOptions<T>
>

/**
 * ChangePlan.DelegateForm - form to delegate billing access
 */
export const ChangePlanDelegateForm = React.forwardRef<
  HTMLFormElement,
  ChangePlanDelegateFormProps<'form'>
>(function ChangePlanDelegateForm({ accountDID, ...props }, ref) {
  const [{ client, accounts }] = useW3()
  const account = accounts[0]
  const [email, setEmail] = useState('')
  const [isDelegating, setIsDelegating] = useState(false)

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!client || !account || !email) return

      setIsDelegating(true)
      try {
        // Create delegation for billing access
        const audience = DID.parse(DidMailto.fromEmail(email as `${string}@${string}`))
        const delegation = await client.createDelegation(audience, [
          'plan/create-admin-session',
          'plan/get',
          'plan/set',
        ], {
          expiration: Date.now() + 60 * 60 * 24 * 365 * 1000, // 1 year
        })
        
        // Archive and store the delegation
        const archiveRes = await delegation.archive()
        if (archiveRes.error) {
          throw new Error('Failed to archive delegation')
        }
        
        setEmail('')
      } catch (error) {
        console.error('Error delegating billing portal access:', error)
      } finally {
        setIsDelegating(false)
      }
    },
    [client, account, email]
  )

  return (
    <form
      ref={ref}
      onSubmit={handleSubmit}
      data-is-delegating={isDelegating}
      {...props}
    >
      <input
        type="email"
        value={email}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setEmail(e.target.value)}
        placeholder="To Email"
        required
      />
      <button type="submit" disabled={isDelegating}>
        DELEGATE
      </button>
    </form>
  )
})

// Attach sub-components to main component
Object.assign(ChangePlan, {
  PlanSection: ChangePlanPlanSection,
  BillingAdmin: ChangePlanBillingAdmin,
  CustomerPortalLink: ChangePlanCustomerPortalLink,
  DelegateForm: ChangePlanDelegateForm,
})

