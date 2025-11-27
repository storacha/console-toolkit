import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useW3 } from '../providers/Provider.js'
import { useStorachaAuthContext, type StorachaAuthContextState, type StorachaAuthContextActions } from '../components/StorachaAuth.js'

/**
 * Return type for useStorachaAuth hook
 */
export type UseStorachaAuthReturn = StorachaAuthContextState & StorachaAuthContextActions & {
  currentUser: { email: string; did: string | undefined; spaces: number; isAuthenticated: boolean } | null
  sessionInfo: { isAuthenticated: boolean; isIframe: boolean; sessionDuration: number; email: string | null; submitted: boolean }
  logoutWithTracking: () => Promise<void>
  logout: () => Promise<void>
  isLoading: boolean
  isSubmitting: boolean
}

/**
 * Authentication hook that provides authentication state and actions
 */
export function useStorachaAuth(): UseStorachaAuthReturn {
  const [authState, authActions] = useStorachaAuthContext()
  const [{ client, accounts, spaces }] = useW3()
  
  const previousAuthState = useRef<boolean>(false)
  const sessionStartTime = useRef<number>(Date.now())

  useEffect(() => {
    const wasAuthenticated = previousAuthState.current
    const isAuthenticated = authState.isAuthenticated

    if (!wasAuthenticated && isAuthenticated) {
      sessionStartTime.current = Date.now()
    }

    previousAuthState.current = isAuthenticated
  }, [authState.isAuthenticated])

  const logoutWithTracking = useCallback(async () => {
    await authActions.logout()
  }, [authActions])

  const currentUser = useMemo(() => {
    if (!authState.isAuthenticated || accounts.length === 0) {
      return null
    }

    const account = accounts[0]
    return {
      email: account.toEmail(),
      did: client?.agent.did(),
      spaces: spaces.length,
      isAuthenticated: true
    }
  }, [authState.isAuthenticated, accounts, client, spaces])

  const sessionInfo = useMemo(() => ({
    isAuthenticated: authState.isAuthenticated,
    isIframe: authState.isIframe,
    sessionDuration: authState.isAuthenticated ? Date.now() - sessionStartTime.current : 0,
    email: authState.email ?? null,
    submitted: authState.submitted
  }), [authState, sessionStartTime])

  return {
    ...authState,
    ...authActions,
    currentUser,
    sessionInfo,
    logoutWithTracking,
    logout: authActions.logout,
    isAuthenticated: authState.isAuthenticated,
    isIframe: authState.isIframe,
    isLoading: !client && !authState.submitted,
    isSubmitting: authState.submitted
  }
}


