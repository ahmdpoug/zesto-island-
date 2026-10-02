'use client'

import { useCallback } from 'react'
import useSWR from 'swr'
import type { Hash } from 'viem'
import { useWalletContext } from '@/components/wallet-context'
import { AuthError, request, useSession } from '@/hooks/use-game'
import { payTreasury } from '@/hooks/use-zesto'
import type { CharacterId } from '@/lib/zesto/config'
import { zestoToWei } from '@/lib/zesto/fees'
import type { HabitatAction, HabitatOutcome, HabitatState, PublicIsland } from '@/lib/habitat/types'

export type PayStage = 'quoting' | 'paying' | 'confirming' | 'applying'

// A confirmed payment whose action then failed server-side; reused by the next paid action so it isn't lost.
let unspentPayment: { hash: Hash; amount: number } | null = null

export function useHabitat() {
  const { token, signOut } = useSession()
  const swr = useSWR<HabitatState>(
    token ? ['habitat-state', token] : null,
    async () => {
      try {
        return await request<HabitatState>('/api/habitat/state', token!)
      } catch (error) {
        if (error instanceof AuthError) await signOut()
        throw error
      }
    },
    { refreshInterval: 30_000, revalidateOnFocus: true },
  )
  return { ...swr, token }
}

export function useHabitatActions() {
  const { token, mutate } = useHabitat()
  const { wallet } = useWalletContext()

  const send = useCallback(
    async (action: HabitatAction, txHash?: Hash) => {
      const res = await request<{ state: HabitatState; outcome: HabitatOutcome }>('/api/habitat/action', token!, {
        method: 'POST',
        body: JSON.stringify({ ...action, txHash }),
      })
      await mutate(res.state, { revalidate: false })
      return res.outcome
    },
    [token, mutate],
  )

  /** Free actions skip the quote round-trip so tile placement feels instant. */
  const act = useCallback(
    async (action: HabitatAction) => {
      if (!token) throw new Error('Sign in to play')
      return send(action)
    },
    [token, send],
  )

  const pay = useCallback(
    async (action: HabitatAction, onStage?: (stage: PayStage) => void) => {
      if (!token) throw new Error('Sign in to play')
      onStage?.('quoting')
      const { fee } = await request<{ fee: number }>('/api/habitat/action', token, {
        method: 'POST',
        body: JSON.stringify({ ...action, dryRun: true }),
      })

      let txHash: Hash | undefined
      if (fee > 0) {
        if (unspentPayment && unspentPayment.amount >= fee) {
          txHash = unspentPayment.hash
        } else {
          if (!wallet) throw new Error('Connect your wallet first')
          onStage?.('paying')
          txHash = await payTreasury(wallet, zestoToWei(fee), () => onStage?.('confirming'))
          unspentPayment = { hash: txHash, amount: fee }
        }
      }

      onStage?.('applying')
      let lastError: unknown
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const outcome = await send(action, txHash)
          if (txHash && unspentPayment?.hash === txHash) unspentPayment = null
          return outcome
        } catch (error) {
          lastError = error
          if (error instanceof Error && /already been used/.test(error.message) && unspentPayment?.hash === txHash) unspentPayment = null
          if (!(error instanceof Error) || !/temporarily unavailable|confirm your payment/.test(error.message)) break
          await new Promise((r) => setTimeout(r, 2000))
        }
      }
      if (txHash && unspentPayment?.hash === txHash) {
        throw new Error(`${lastError instanceof Error ? lastError.message : 'Action failed'}. Your ${fee} $ZESTO payment is saved for your next purchase.`)
      }
      throw lastError
    },
    [token, wallet, send],
  )

  const register = useCallback(
    async (character: CharacterId) => {
      if (!token) throw new Error('Sign in first')
      await request('/api/register', token, { method: 'POST', body: JSON.stringify({ character }) })
      await mutate()
    },
    [token, mutate],
  )

  return { act, pay, register, mutate }
}

const fetchJson = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url)
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.error ?? 'Request failed')
  return data as T
}

export function useIslands() {
  return useSWR<{ islands: PublicIsland[] }>('/api/habitat/islands', fetchJson, { refreshInterval: 30_000 })
}

export function useIsland(wallet: string | null) {
  const { token } = useSession()
  return useSWR<{ island: PublicIsland; lit: boolean }>(
    wallet ? ['island', wallet, token] : null,
    async () => {
      const res = await fetch(`/api/habitat/islands?wallet=${wallet}`, {
        headers: token ? { authorization: `Bearer ${token}` } : undefined,
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error ?? 'Could not load island')
      return data
    },
  )
}
