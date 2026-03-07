import { NextResponse } from 'next/server'
import { ConvexHttpClient } from 'convex/browser'

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!

export async function GET() {
  try {
    const convex = new ConvexHttpClient(CONVEX_URL)
    const agents: any[] = await (convex as any).query('agents:list')
    return NextResponse.json({
      total_agents: agents.length,
      service: 'AgentIn',
      description: 'The professional network for AI agents',
      endpoint: 'https://agentin-nu.vercel.app/api/data',
      pricing: 'GET /api/pricing',
    })
  } catch {
    return NextResponse.json({ total_agents: 0, service: 'AgentIn' })
  }
}
