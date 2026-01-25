import type { As, Props, Options } from 'ariakit-react-utils'
import type { ReactNode } from 'react'
import React from 'react'
import { createElement } from 'ariakit-react-utils'
import { useSettingsContext } from './Settings.js'

const MAX_REFERRALS = 11
const MAX_CREDITS = 460

export type RewardsSectionOptions<T extends As = 'div'> = Options<T>

export type RewardsSectionProps<T extends As = 'div'> = Props<
  RewardsSectionOptions<T>
>

/**
 * RewardsSection component - displays referral rewards information
 */
export const RewardsSection = React.forwardRef<
  HTMLDivElement,
  RewardsSectionProps<'div'>
>(function RewardsSection(props, ref) {
  return createElement('div', { ref, ...props })
})

export type RewardsSectionReferredOptions<T extends As = 'div'> = Options<T>

export type RewardsSectionReferredProps<T extends As = 'div'> = Props<
  RewardsSectionReferredOptions<T>
>

/**
 * RewardsSection.Referred - displays referred count
 */
export const RewardsSectionReferred = React.forwardRef<
  HTMLDivElement,
  RewardsSectionReferredProps<'div'>
>(function RewardsSectionReferred(props, ref) {
  const [{ referrals = [] }] = useSettingsContext()
  const referred = referrals.length
  return createElement('div', {
    ref,
    'data-referred': referred,
    'data-max-referrals': MAX_REFERRALS,
    ...props,
  })
})

export type RewardsSectionUSDCreditsOptions<T extends As = 'div'> = Options<T>

export type RewardsSectionUSDCreditsProps<T extends As = 'div'> = Props<
  RewardsSectionUSDCreditsOptions<T>
>

/**
 * RewardsSection.USDCredits - displays USD credits
 */
export const RewardsSectionUSDCredits = React.forwardRef<
  HTMLDivElement,
  RewardsSectionUSDCreditsProps<'div'>
>(function RewardsSectionUSDCredits(props, ref) {
  // TODO: Calculate from referral information (currently hardcoded to 0)
  const credits = 0
  return createElement('div', {
    ref,
    'data-credits': credits,
    'data-max-credits': MAX_CREDITS,
    ...props,
  })
})

export type RewardsSectionRachaPointsOptions<T extends As = 'div'> = Options<T>

export type RewardsSectionRachaPointsProps<T extends As = 'div'> = Props<
  RewardsSectionRachaPointsOptions<T>
>

/**
 * RewardsSection.RachaPoints - displays Racha points
 */
export const RewardsSectionRachaPoints = React.forwardRef<
  HTMLDivElement,
  RewardsSectionRachaPointsProps<'div'>
>(function RewardsSectionRachaPoints(props, ref) {
  // TODO: Calculate from referral information (currently hardcoded to 0)
  const points = 0
  return createElement('div', {
    ref,
    'data-points': points,
    ...props,
  })
})

export type RewardsSectionInfoOptions<T extends As = 'div'> = Options<T>

export type RewardsSectionInfoProps<T extends As = 'div'> = Props<
  RewardsSectionInfoOptions<T>
>

/**
 * RewardsSection.Info - displays informational text
 */
export const RewardsSectionInfo = React.forwardRef<
  HTMLDivElement,
  RewardsSectionInfoProps<'div'>
>(function RewardsSectionInfo(props, ref) {
  return createElement('div', {
    ref,
    ...props,
  })
})

export type RewardsSectionReferralLinkOptions<T extends As = 'div'> = Options<T>

export type RewardsSectionReferralLinkProps<T extends As = 'div'> = Props<
  RewardsSectionReferralLinkOptions<T>
>

/**
 * RewardsSection.ReferralLink - displays copyable referral link
 */
export const RewardsSectionReferralLink = React.forwardRef<
  HTMLDivElement,
  RewardsSectionReferralLinkProps<'div'>
>(function RewardsSectionReferralLink(props, ref) {
  const [{ referralLink, refcodeLoading }, { copyReferralLink }] =
    useSettingsContext()
  return createElement('div', {
    ref,
    'data-referral-link': referralLink,
    'data-loading': refcodeLoading,
    onClick: copyReferralLink,
    ...props,
  })
})

export type RewardsSectionReferralsListOptions<T extends As = 'div'> = Options<T>

export type RewardsSectionReferralsListProps<T extends As = 'div'> = Props<
  RewardsSectionReferralsListOptions<T>
>

/**
 * RewardsSection.ReferralsList - displays list of referrals
 */
export const RewardsSectionReferralsList = React.forwardRef<
  HTMLDivElement,
  RewardsSectionReferralsListProps<'div'>
>(function RewardsSectionReferralsList(props, ref) {
  const [{ referrals = [] }] = useSettingsContext()
  return createElement('div', {
    ref,
    'data-referrals': JSON.stringify(referrals),
    ...props,
  })
})

// Attach sub-components to main component
Object.assign(RewardsSection, {
  Referred: RewardsSectionReferred,
  USDCredits: RewardsSectionUSDCredits,
  RachaPoints: RewardsSectionRachaPoints,
  Info: RewardsSectionInfo,
  ReferralLink: RewardsSectionReferralLink,
  ReferralsList: RewardsSectionReferralsList,
})

