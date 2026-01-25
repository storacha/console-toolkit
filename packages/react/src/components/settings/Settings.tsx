import type { ReactNode } from 'react'
import React, {
  useState,
  createContext,
  useContext,
  useCallback,
  useMemo,
  useEffect,
} from 'react'
import { useW3, ContextState } from '../../providers/Provider.js'
import type { Account, SpaceDID } from '@storacha/ui-core'
import type { DID as DIDType } from '@ucanto/interface'

/**
 * Plan information
 */
export interface PlanInfo {
  product?: DIDType<'web'>
  updatedAt?: string
}

/**
 * Usage information per space
 */
export interface SpaceUsage {
  space: SpaceDID
  total: number
}

/**
 * Account usage information
 */
export interface AccountUsage {
  total: number
  spaces: Record<SpaceDID, SpaceUsage>
}

/**
 * Referral information
 */
export interface Referral {
  id: string
  status: string
}

/**
 * Referral code result
 */
export interface RefcodeResult {
  refcode: string
}

/**
 * Referrals result
 */
export interface ReferralsResult {
  referrals: Referral[]
}

/**
 * Settings context state
 */
export type SettingsContextState = ContextState & {
  /**
   * Current plan information
   */
  plan?: PlanInfo
  /**
   * Whether plan is loading
   */
  planLoading: boolean
  /**
   * Plan error
   */
  planError?: Error
  /**
   * Account usage information
   */
  usage?: AccountUsage
  /**
   * Whether usage is loading
   */
  usageLoading: boolean
  /**
   * Usage error
   */
  usageError?: Error
  /**
   * Referral code
   */
  refcode?: string
  /**
   * Whether refcode is loading
   */
  refcodeLoading: boolean
  /**
   * Referrals list
   */
  referrals?: Referral[]
  /**
   * Whether referrals are loading
   */
  referralsLoading: boolean
  /**
   * Referral link
   */
  referralLink?: string
  /**
   * Account email
   */
  accountEmail?: string
}

/**
 * Settings context actions
 */
export type SettingsContextActions = {
  /**
   * Refresh plan information
   */
  refreshPlan: () => Promise<void>
  /**
   * Refresh usage information
   */
  refreshUsage: () => Promise<void>
  /**
   * Refresh referral information
   */
  refreshReferrals: () => Promise<void>
  /**
   * Create referral code
   */
  createRefcode: (email: string) => Promise<void>
  /**
   * Copy referral link to clipboard
   */
  copyReferralLink: () => Promise<void>
  /**
   * Request account deletion
   */
  requestAccountDeletion: () => void
}

export type SettingsContextValue = [
  state: SettingsContextState,
  actions: SettingsContextActions
]

export const SettingsContextDefaultValue: SettingsContextValue = [
  {
    accounts: [],
    spaces: [],
    client: undefined,
    planLoading: false,
    usageLoading: false,
    refcodeLoading: false,
    referralsLoading: false,
  },
  {
    refreshPlan: async () => {
      throw new Error('missing refreshPlan function')
    },
    refreshUsage: async () => {
      throw new Error('missing refreshUsage function')
    },
    refreshReferrals: async () => {
      throw new Error('missing refreshReferrals function')
    },
    createRefcode: async () => {
      throw new Error('missing createRefcode function')
    },
    copyReferralLink: async () => {
      throw new Error('missing copyReferralLink function')
    },
    requestAccountDeletion: () => {
      throw new Error('missing requestAccountDeletion function')
    },
  },
]

export const SettingsContext = createContext<SettingsContextValue>(
  SettingsContextDefaultValue
)

export interface SettingsProps {
  children?: ReactNode
  /**
   * Referrals service URL
   */
  referralsServiceURL?: string
  /**
   * Referral URL base (for generating referral links)
   */
  referralURL?: string
  /**
   * Account deletion form URL
   */
  accountDeletionURL?: string
}

/**
 * Main Settings component that provides settings context
 */
export const SettingsProvider = ({
  children,
  referralsServiceURL,
  referralURL = 'http://storacha.network/referred',
  accountDeletionURL = 'https://forms.gle/QsvfMip2qzJqzEEo9',
}: SettingsProps) => {
  const [state] = useW3()
  const { client, accounts } = state
  const account = accounts[0]

  const [plan, setPlan] = useState<PlanInfo>()
  const [planLoading, setPlanLoading] = useState(false)
  const [planError, setPlanError] = useState<Error>()

  const [usage, setUsage] = useState<AccountUsage>()
  const [usageLoading, setUsageLoading] = useState(false)
  const [usageError, setUsageError] = useState<Error>()

  const [refcode, setRefcode] = useState<string>()
  const [refcodeLoading, setRefcodeLoading] = useState(false)
  const [referrals, setReferrals] = useState<Referral[]>()
  const [referralsLoading, setReferralsLoading] = useState(false)
  const [referralLink, setReferralLink] = useState<string>()

  const accountEmail = useMemo(() => account?.toEmail(), [account])

  // Fetch plan information
  const refreshPlan = useCallback(async () => {
    if (!account || !client) return

    setPlanLoading(true)
    setPlanError(undefined)
    try {
      const result = await account.plan.get()
      if (result.ok) {
        setPlan({
          product: result.ok.product as DIDType<'web'>,
          updatedAt: result.ok.updatedAt,
        })
      } else {
        setPlanError(result.error as Error)
      }
    } catch (error) {
      setPlanError(error as Error)
    } finally {
      setPlanLoading(false)
    }
  }, [account, client])

  // Fetch usage information
  const refreshUsage = useCallback(async () => {
    if (!account || !client) return

    setUsageLoading(true)
    setUsageError(undefined)
    try {
      const result = await client.capability.account.usage.get(account.did())
      if ('error' in result) {
        setUsageError(result.error as Error)
      } else {
        const spaces: Record<SpaceDID, SpaceUsage> = {}
        Object.entries(result.spaces).forEach(([spaceDID, value]) => {
          spaces[spaceDID as SpaceDID] = {
            space: spaceDID as SpaceDID,
            total: value.total,
          }
        })
        setUsage({
          total: result.total,
          spaces,
        })
      }
    } catch (error) {
      setUsageError(error as Error)
    } finally {
      setUsageLoading(false)
    }
  }, [account, client])

  // Fetch referral information
  const refreshReferrals = useCallback(async () => {
    if (!accountEmail || !referralsServiceURL) return

    setRefcodeLoading(true)
    try {
      const refcodeResponse = await fetch(
        `${referralsServiceURL}/refcode/${encodeURIComponent(accountEmail)}`
      )
      if (refcodeResponse.ok) {
        const refcodeData: RefcodeResult = await refcodeResponse.json()
        setRefcode(refcodeData.refcode)
        setReferralLink(`${referralURL}?refcode=${refcodeData.refcode}`)

        // Fetch referrals
        if (refcodeData.refcode) {
          setReferralsLoading(true)
          try {
            const referralsResponse = await fetch(
              `${referralsServiceURL}/referrals/${refcodeData.refcode}`
            )
            if (referralsResponse.ok) {
              const referralsData: ReferralsResult =
                await referralsResponse.json()
              setReferrals(referralsData.referrals)
            }
          } catch (error) {
            console.error('Failed to fetch referrals:', error)
          } finally {
            setReferralsLoading(false)
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch refcode:', error)
    } finally {
      setRefcodeLoading(false)
    }
  }, [accountEmail, referralsServiceURL, referralURL])

  // Create referral code
  const createRefcode = useCallback(
    async (email: string) => {
      if (!referralsServiceURL) return

      setRefcodeLoading(true)
      try {
        const form = new FormData()
        form.append('email', email)
        const response = await fetch(
          `${referralsServiceURL}/refcode/create`,
          {
            method: 'POST',
            body: form,
          }
        )
        if (response.ok) {
          await refreshReferrals()
        }
      } catch (error) {
        console.error('Failed to create refcode:', error)
      } finally {
        setRefcodeLoading(false)
      }
    },
    [referralsServiceURL, refreshReferrals]
  )

  // Copy referral link to clipboard
  const copyReferralLink = useCallback(async () => {
    if (referralLink) {
      await navigator.clipboard.writeText(referralLink)
    }
  }, [referralLink])

  // Request account deletion
  const requestAccountDeletion = useCallback(() => {
    window.open(accountDeletionURL, '_blank', 'noopener,noreferrer')
  }, [accountDeletionURL])

  // Initial data fetch
  useEffect(() => {
    if (account && client) {
      refreshPlan()
      refreshUsage()
      if (referralsServiceURL) {
        refreshReferrals()
      }
    }
  }, [account, client, referralsServiceURL, refreshPlan, refreshUsage, refreshReferrals])

  const contextState: SettingsContextState = useMemo(
    () => ({
      ...state,
      plan,
      planLoading,
      planError,
      usage,
      usageLoading,
      usageError,
      refcode,
      refcodeLoading,
      referrals,
      referralsLoading,
      referralLink,
      accountEmail,
    }),
    [
      state,
      plan,
      planLoading,
      planError,
      usage,
      usageLoading,
      usageError,
      refcode,
      refcodeLoading,
      referrals,
      referralsLoading,
      referralLink,
      accountEmail,
    ]
  )

  const contextActions: SettingsContextActions = useMemo(
    () => ({
      refreshPlan,
      refreshUsage,
      refreshReferrals,
      createRefcode,
      copyReferralLink,
      requestAccountDeletion,
    }),
    [
      refreshPlan,
      refreshUsage,
      refreshReferrals,
      createRefcode,
      copyReferralLink,
      requestAccountDeletion,
    ]
  )

  return (
    <SettingsContext.Provider value={[contextState, contextActions]}>
      {children}
    </SettingsContext.Provider>
  )
}

/**
 * Hook to access Settings context
 */
export function useSettingsContext(): SettingsContextValue {
  return useContext(SettingsContext)
}

