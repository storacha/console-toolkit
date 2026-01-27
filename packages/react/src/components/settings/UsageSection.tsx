import type { As, Props, Options } from 'ariakit-react-utils'
import type { ReactNode } from 'react'
import React, { useMemo } from 'react'
import { createElement } from 'ariakit-react-utils'
import { useSettingsContext } from './Settings.js'
import type { SpaceDID } from '@storacha/ui-core'

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

export type UsageSectionOptions<T extends As = 'div'> = Options<T>

export type UsageSectionProps<T extends As = 'div'> = Props<
  UsageSectionOptions<T>
>

/**
 * UsageSection component - displays usage information
 */
export const UsageSection = React.forwardRef<
  HTMLDivElement,
  UsageSectionProps<'div'>
>(function UsageSection(props, ref) {
  return createElement('div', { ref, ...props })
})

export type UsageSectionTotalOptions<T extends As = 'div'> = Options<T>

export type UsageSectionTotalProps<T extends As = 'div'> = Props<
  UsageSectionTotalOptions<T>
>

/**
 * UsageSection.Total - displays total usage
 */
export const UsageSectionTotal = React.forwardRef<
  HTMLDivElement,
  UsageSectionTotalProps<'div'>
>(function UsageSectionTotal(props, ref) {
  const [{ usage, plan }] = useSettingsContext()
  const allocated = useMemo(
    () => Object.values(usage?.spaces ?? {}).reduce((total, space) => total + space.total, 0),
    [usage]
  )
  const limit = plan?.product ? PLANS[plan.product]?.limit ?? 0 : 0
  return createElement('div', {
    ref,
    'data-allocated': allocated,
    'data-limit': limit,
    ...props,
  })
})

export type UsageSectionSpacesListOptions<T extends As = 'div'> = Options<T>

export type UsageSectionSpacesListProps<T extends As = 'div'> = Props<
  UsageSectionSpacesListOptions<T>
>

/**
 * UsageSection.SpacesList - displays per-space usage list
 */
export const UsageSectionSpacesList = React.forwardRef<
  HTMLDivElement,
  UsageSectionSpacesListProps<'div'>
>(function UsageSectionSpacesList(props, ref) {
  const [{ usage }] = useSettingsContext()
  const spaces = useMemo(() => {
    if (!usage) return []
    return Object.entries(usage.spaces)
      .sort((a, b) => b[1].total - a[1].total)
      .map(([space, data]) => ({
        space: space as SpaceDID,
        total: data.total,
      }))
  }, [usage])
  return createElement('div', {
    ref,
    'data-spaces': JSON.stringify(spaces),
    ...props,
  })
})

export type UsageSectionSpaceItemOptions<T extends As = 'div'> = Options<T> & {
  space: SpaceDID
  total: number
}

export type UsageSectionSpaceItemProps<T extends As = 'div'> = Props<
  UsageSectionSpaceItemOptions<T>
>

/**
 * UsageSection.SpaceItem - individual space usage item
 */
export const UsageSectionSpaceItem = React.forwardRef<
  HTMLDivElement,
  UsageSectionSpaceItemProps<'div'>
>(function UsageSectionSpaceItem({ space, total, ...props }, ref) {
  return createElement('div', {
    ref,
    'data-space': space,
    'data-total': total,
    ...props,
  })
})

// Attach sub-components to main component
Object.assign(UsageSection, {
  Total: UsageSectionTotal,
  SpacesList: UsageSectionSpacesList,
  SpaceItem: UsageSectionSpaceItem,
})

