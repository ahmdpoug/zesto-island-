import { decodeEventLog, erc20Abi, type Hash } from 'viem'
import { publicClient } from './chain'
import { TREASURY_ADDRESS, ZESTO_ADDRESS } from './config'

/** Total $ZESTO (wei) the given wallet sent to the treasury in this transaction. */
export async function paidToTreasury(txHash: Hash, wallet: string): Promise<bigint> {
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash, timeout: 45_000 })
  if (receipt.status !== 'success' || receipt.from.toLowerCase() !== wallet.toLowerCase()) return BigInt(0)

  let total = BigInt(0)
  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== ZESTO_ADDRESS.toLowerCase()) continue
    try {
      const event = decodeEventLog({ abi: erc20Abi, data: log.data, topics: log.topics })
      if (event.eventName !== 'Transfer') continue
      const { from, to, value } = event.args
      if (from.toLowerCase() === wallet.toLowerCase() && to.toLowerCase() === TREASURY_ADDRESS.toLowerCase()) total += value
    } catch {
      continue
    }
  }
  return total
}
