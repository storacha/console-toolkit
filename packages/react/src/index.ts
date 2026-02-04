/**
 * @storacha/console-toolkit-react
 * 
 * Headless React components for Storacha Console Toolkit.
 * These components provide all authentication logic without any built-in styling,
 * giving you complete control over the appearance.
 */

export * from './components/StorachaAuth.js'
export * from './hooks/useStorachaAuth.js'
export * from './providers/Provider.js'
export * from './components/space/index.js'
export * from './components/upload/index.js'
export {
  SettingsProvider,
  useSettingsContext,
  RewardsSection,
  AccountOverview,
  UsageSection,
  AccountManagement,
  ChangePlan,
} from './components/settings/index.js'
export type {
  PlanInfo as SettingsPlanInfo,
  SpaceUsage,
  AccountUsage,
  Referral,
  RefcodeResult,
  ReferralsResult,
  SettingsContextState,
  SettingsContextValue,
} from './components/settings/Settings.js'

