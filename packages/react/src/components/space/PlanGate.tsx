import type { ReactNode, CSSProperties } from 'react'

import {
    useState,
    useEffect,
    createContext,
    useContext,
    useCallback,
    useMemo,
} from 'react'
import { useW3, ContextState } from '../../providers/Provider.js'

/**
 * Plan status types
 */
export type PlanStatus = 'loading' | 'active' | 'missing' | 'error'

/**
 * Plan information
 */
export interface PlanInfo {
    product: string
    updatedAt?: string
}

export type PlanGateContextState = ContextState & {
    /**
     * Current plan status
     */
    planStatus: PlanStatus
    /**
     * Plan information if available
     */
    plan?: PlanInfo
    /**
     * Error message if plan check failed
     */
    error?: string
}

export type PlanGateContextActions = {
    /**
     * Refresh plan status
     */
    refreshPlan: () => Promise<void>
    /**
     * Select a plan and create checkout session
     */
    selectPlan: (planID: string) => Promise<void>
}

export type PlanGateContextValue = [
    state: PlanGateContextState,
    actions: PlanGateContextActions
]

export const PlanGateContextDefaultValue: PlanGateContextValue = [
    {
        accounts: [],
        spaces: [],
        client: undefined,
        planStatus: 'loading',
    },
    {
        refreshPlan: async () => {
            throw new Error('missing refreshPlan function')
        },
        selectPlan: async () => {
            throw new Error('missing selectPlan function')
        },
    },
]

export const PlanGateContext = createContext<PlanGateContextValue>(
    PlanGateContextDefaultValue
)

export interface PlanGateProps {
    children?: ReactNode
    /**
     * Callback when plan check completes
     */
    onPlanChecked?: (status: PlanStatus, plan?: PlanInfo) => void
    /**
     * Callback on error
     */
    onError?: (error: Error) => void
}

/**
 * PlanGate Provider - Checks if the user's account has an active billing plan
 */
export const PlanGateProvider = ({
    children,
    onPlanChecked,
    onError,
}: PlanGateProps) => {
    const [state] = useW3()
    const { client, accounts } = state
    const [planStatus, setPlanStatus] = useState<PlanStatus>('loading')
    const [plan, setPlan] = useState<PlanInfo>()
    const [error, setError] = useState<string>()

    const checkPlan = useCallback(async () => {
        if (!client) {
            setPlanStatus('loading')
            return
        }

        const account = accounts[0]
        if (!account) {
            setPlanStatus('missing')
            setError('No account found. Please log in first.')
            return
        }

        setPlanStatus('loading')
        setError(undefined)

        try {
            // account.plan.get() returns the current plan for the account
            const planResult = await account.plan.get()

            if (planResult.error) {
                // If there's an error, it likely means no plan is set
                setPlanStatus('missing')
                setError('No billing plan found for this account.')
                onPlanChecked?.('missing')
                return
            }

            if (planResult.ok) {
                const planInfo: PlanInfo = {
                    product: planResult.ok.product,
                    updatedAt: planResult.ok.updatedAt,
                }
                setPlan(planInfo)
                setPlanStatus('active')
                onPlanChecked?.('active', planInfo)
            } else {
                setPlanStatus('missing')
                onPlanChecked?.('missing')
            }
        } catch (err: any) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to check plan status'
            setPlanStatus('error')
            setError(errorMessage)
            onError?.(err instanceof Error ? err : new Error(errorMessage))
            onPlanChecked?.('error')
        }
    }, [client, accounts, onPlanChecked, onError])

    const refreshPlan = useCallback(async () => {
        await checkPlan()
    }, [checkPlan])

    const selectPlan = useCallback(async (planID: string) => {
        if (!client || accounts.length === 0) {
            throw new Error('Client or account not available')
        }

        try {
            const account = accounts[0]
            const checkoutResponse = await client.capability.plan.createCheckoutSession(
                account.did(),
                {
                    planID: planID as any, // planID is a DID string
                    successURL: window.location.href,
                    cancelURL: window.location.href,
                    redirectAfterCompletion: true,
                }
            )
            
            // Open the authenticated checkout session URL
            window.open(checkoutResponse.url, '_blank', 'noopener,noreferrer')
        } catch (error) {
            console.error('Failed to create checkout session:', error)
            throw error
        }
    }, [client, accounts])

    // Check plan on mount and when accounts change
    useEffect(() => {
        if (accounts.length > 0) {
            void checkPlan()
        }
    }, [accounts, checkPlan])

    const value = useMemo<PlanGateContextValue>(
        () => [
            {
                ...state,
                planStatus,
                plan,
                error,
            },
            {
                refreshPlan,
                selectPlan,
            },
        ],
        [state, planStatus, plan, error, refreshPlan, selectPlan]
    )

    return (
        <PlanGateContext.Provider value={value}>
            {children}
        </PlanGateContext.Provider>
    )
}

export interface PlanGateGateProps {
    /**
     * Content to render when plan is active
     */
    children?: ReactNode
}

/**
 * Renders children only when a plan is active
 */
export const PlanGateGate = ({ children }: PlanGateGateProps) => {
    const [{ planStatus }] = usePlanGateContext()

    if (planStatus === 'active') {
        return <>{children}</>
    }

    return null
}

export interface PlanGateFallbackProps {
    /**
     * Custom render function for the fallback UI
     */
    renderFallback?: (state: {
        planStatus: PlanStatus
        error?: string
        selectPlan: (planID: string) => Promise<void>
        refreshPlan: () => Promise<void>
    }) => ReactNode
    /**
     * Additional CSS class names
     */
    className?: string
    /**
     * Inline styles
     */
    style?: CSSProperties
    /**
     * Children to render as fallback (if renderFallback is not provided)
     */
    children?: ReactNode
}

/**
 * Renders fallback UI when no plan is active
 */
export const PlanGateFallback = ({
    renderFallback,
    className,
    style,
    children
}: PlanGateFallbackProps) => {
    const [{ planStatus, error }, { selectPlan, refreshPlan }] = usePlanGateContext()

    if (planStatus === 'active') {
        return null
    }

    if (renderFallback) {
        return <>{renderFallback({ planStatus, error, selectPlan, refreshPlan })}</>
    }

    if (children) {
        return <>{children}</>
    }

    // Default fallback UI
    return (
        <div className={className} style={style}>
            {planStatus === 'loading' && (
                <div>
                    <p>Checking your plan status...</p>
                </div>
            )}
            {planStatus === 'missing' && (
                <div>
                    <h3>📋 Billing Plan Required</h3>
                    <p>
                        To create a space, you need to select a billing plan.
                        Don't worry—there's a <strong>free Starter plan</strong> available!
                    </p>
                    <button onClick={() => selectPlan('did:web:starter.storacha.network')} type="button">
                        Select Free Plan →
                    </button>
                    <button onClick={refreshPlan} type="button">
                        I've selected a plan, refresh
                    </button>
                </div>
            )}
            {planStatus === 'error' && (
                <div>
                    <h3>⚠️ Error</h3>
                    <p>{error || 'Failed to check plan status.'}</p>
                    <button onClick={refreshPlan} type="button">
                        Try Again
                    </button>
                </div>
            )}
        </div>
    )
}

export interface PlanGateLoadingProps {
    /**
     * Custom render function for loading state
     */
    renderLoading?: () => ReactNode
    /**
     * Children to render as loading (if renderLoading is not provided)
     */
    children?: ReactNode
}

/**
 * Renders loading state while plan is being checked
 */
export const PlanGateLoading = ({ renderLoading, children }: PlanGateLoadingProps) => {
    const [{ planStatus }] = usePlanGateContext()

    if (planStatus !== 'loading') {
        return null
    }

    if (renderLoading) {
        return <>{renderLoading()}</>
    }

    if (children) {
        return <>{children}</>
    }

    return <div>Checking plan status...</div>
}

/**
 * Hook to access PlanGate context
 */
export function usePlanGateContext(): PlanGateContextValue {
    return useContext(PlanGateContext)
}

/**
 * PlanGate compound component
 */
export const PlanGate = Object.assign(PlanGateProvider, {
    Gate: PlanGateGate,
    Fallback: PlanGateFallback,
    Loading: PlanGateLoading,
})
