'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './auth-provider'
import type { AccessRequestDetails, PortfolioRequestState } from '@/lib/portfolio-request-model'

type Context = {
  state: PortfolioRequestState | null
  error: string
  checking: boolean
  refresh: () => Promise<void>
  submit: (body: AccessRequestDetails | { intent: string }) => Promise<PortfolioRequestState>
}
const PortfolioRequestContext = createContext<Context | null>(null)

export function PortfolioRequestProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const router = useRouter()
  const token = session?.access_token
  const userId = session?.user.id
  const [result, setResult] = useState<{ owner: string; state: PortfolioRequestState } | null>(null)
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)
  const owner = useRef(userId)
  owner.current = userId
  const accessSignature = useRef('')
  const sequence = useRef(0)

  const request = useCallback(
    async (body?: AccessRequestDetails | { intent: string }) => {
      if (!token || !userId) throw new Error('Please sign in to continue.')
      const response = await fetch('/api/portfolio-access/request', {
        method: body ? 'POST' : 'GET',
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${token}`,
          ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Please try again.')
      if (owner.current !== userId)
        throw new Error('Your account changed. Please check your access again.')
      return data as PortfolioRequestState
    },
    [token, userId],
  )

  const accept = useCallback(
    (state: PortfolioRequestState) => {
      if (!userId || owner.current !== userId) return
      setResult({ owner: userId, state })
      setError('')
      const signature = JSON.stringify([userId, state.status, state.studies])
      if (accessSignature.current !== signature) {
        accessSignature.current = signature
        // Refresh server-rendered gates after the live permission check sets the identity cookie.
        router.refresh()
      }
    },
    [userId, router],
  )

  const refresh = useCallback(async () => {
    if (!token) return
    const current = ++sequence.current
    setChecking(true)
    try {
      const state = await request()
      if (current === sequence.current) accept(state)
    } catch (failure) {
      if (current === sequence.current)
        setError(failure instanceof Error ? failure.message : 'Please try again.')
    } finally {
      if (current === sequence.current) setChecking(false)
    }
  }, [token, request, accept])

  const submit = useCallback(
    async (body: AccessRequestDetails | { intent: string }) => {
      ++sequence.current
      const state = await request(body)
      ++sequence.current
      accept(state)
      setChecking(false)
      return state
    },
    [request, accept],
  )

  useEffect(() => {
    setError('')
    if (!token) {
      setResult(null)
      setChecking(false)
      accessSignature.current = ''
      return
    }
    void refresh()
    const checkVisible = () => {
      if (document.visibilityState === 'visible') void refresh()
    }
    const timer = window.setInterval(checkVisible, 30_000)
    document.addEventListener('visibilitychange', checkVisible)
    window.addEventListener('focus', checkVisible)
    return () => {
      // Invalidate all in-flight requests, including ones started after this effect.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      ++sequence.current
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', checkVisible)
      window.removeEventListener('focus', checkVisible)
    }
  }, [token, refresh])

  return (
    <PortfolioRequestContext.Provider
      value={{
        state: result && result.owner === userId ? result.state : null,
        error,
        checking,
        refresh,
        submit,
      }}
    >
      {children}
    </PortfolioRequestContext.Provider>
  )
}

export function usePortfolioRequest() {
  const context = useContext(PortfolioRequestContext)
  if (!context) throw new Error('PortfolioRequestProvider is required.')
  return context
}
