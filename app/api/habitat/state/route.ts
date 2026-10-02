import { loadHabitat } from '@/lib/habitat/server'
import { errorResponse, requireWallet } from '@/lib/zesto/server'

export async function GET(request: Request) {
  try {
    const wallet = await requireWallet(request)
    return Response.json(await loadHabitat(wallet))
  } catch (error) {
    return errorResponse(error, 'habitat/state')
  }
}
