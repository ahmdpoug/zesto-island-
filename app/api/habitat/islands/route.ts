import { getIsland, listIslands, litToday } from '@/lib/habitat/server'
import { errorResponse, getSessionWallet } from '@/lib/zesto/server'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const wallet = url.searchParams.get('wallet')?.toLowerCase()
    if (wallet) {
      if (!/^0x[0-9a-f]{40}$/.test(wallet)) return Response.json({ error: 'Unknown island' }, { status: 400 })
      const island = await getIsland(wallet)
      if (!island) return Response.json({ error: 'That island does not exist yet' }, { status: 404 })
      const visitor = await getSessionWallet(request)
      return Response.json({ island, lit: visitor ? await litToday(wallet, visitor) : false })
    }
    return Response.json({ islands: await listIslands() })
  } catch (error) {
    return errorResponse(error, 'habitat/islands')
  }
}
