import {
  RewardsSection,
  AccountOverview,
  UsageSection,
  AccountManagement,
  ChangePlan,
} from '@storacha/console-toolkit-react'

/**
 * Type assertions for toolkit compound components. `Object.assign` builds these
 * at runtime, but TypeScript does not list sub-components (e.g. UsageSection.SpacesList)
 * on the exported type. These aliases keep JSX usage type-checking without changing runtime.
 */
export const RewardsSectionTyped = RewardsSection as typeof RewardsSection & {
  Referred: any
  USDCredits: any
  RachaPoints: any
  Info: any
  ReferralLink: any
  ReferralsList: any
}
export const AccountOverviewTyped = AccountOverview as typeof AccountOverview & {
  Email: any
  Plan: any
  ChangePlanButton: any
}
export const UsageSectionTyped = UsageSection as typeof UsageSection & {
  Total: any
  SpacesList: any
  SpaceItem: any
}
export const AccountManagementTyped = AccountManagement as typeof AccountManagement & {
  DeleteButton: any
}
export const ChangePlanTyped = ChangePlan as typeof ChangePlan & {
  PlanSection: any
  BillingAdmin: any
  CustomerPortalLink: any
  DelegateForm: any
}
