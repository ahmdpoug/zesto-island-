import { isHash, type Hash } from 'viem'
import { db } from '@/lib/db'
import { payments } from '@/lib/db/schema'
import { habitatFee, loadHabitat, parseHabitatAction, performHabitat } from '@/lib/habitat/server'
import { zestoToWei } from '@/lib/zesto/fees'
import { paidToTreasury } from '@/lib/zesto/payments'
import { GameError, errorResponse, requireWallet } from '@/lib/zesto/server'

export async function POST(request: Request) {
  try {
    const wallet = await requireWallet(request)
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
    const action = parseHabitatAction(body)

    if (body?.dryRun === true) {
      return Response.json({ fee: await habitatFee(db, wallet, action) })
    }

    const txHash = typeof body?.txHash === 'string' && isHash(body.txHash) ? (body.txHash.toLowerCase() as Hash) : null
    let paidWei = BigInt(0)
    if (txHash) {
      try {
        paidWei = await paidToTreasury(txHash, wallet)
      } catch {
        throw new GameError('Could not confirm your payment yet. Please try again shortly.', 502)
      }
    }

    const outcome = await db.transaction(async (tx) => {
      const fee = await habitatFee(tx, wallet, action)
      if (fee > 0) {
        if (!txHash) throw new GameError(`This costs ${fee} $ZESTO`, 402)
        if (paidWei < zestoToWei(fee)) throw new GameError(`Payment too low. This costs ${fee} $ZESTO`, 402)
        const recorded = await tx
          .insert(payments)
          .values({ txHash, wallet, action: `habitat:${action.type}`, amount: fee })
          .onConflictDoNothing()
          .returning({ txHash: payments.txHash })
        if (recorded.length === 0) throw new GameError('This payment has already been used', 409)
      }
      const result = await performHabitat(tx, wallet, action)
      return { ...result, fee }
    })

    return Response.json({ state: await loadHabitat(wallet), outcome })
  } catch (error) {
    return errorResponse(error, 'habitat/action')
  }
}
