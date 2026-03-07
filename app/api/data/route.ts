import { NextRequest, NextResponse } from 'next/server'
import { Payments, buildPaymentRequired } from '@nevermined-io/payments'
import { ConvexHttpClient } from 'convex/browser'

export async function GET() {
  return NextResponse.json(
    {
      error: 'Payment required',
      message: 'POST to this endpoint with a payment-signature header containing an x402 access token.',
      pricing: 'GET /api/pricing',
      plan_id: process.env.NVM_PLAN_ID,
    },
    { status: 402 }
  )
}

const NVM_API_KEY = process.env.NVM_API_KEY!
const NVM_PLAN_ID = process.env.NVM_PLAN_ID!
const NVM_AGENT_ID = process.env.NVM_AGENT_ID!
const NVM_ENVIRONMENT = ((process.env.NVM_ENVIRONMENT ?? 'sandbox').toLowerCase()) as any
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL!

export async function POST(req: NextRequest) {
  try {
  const token = req.headers.get('payment-signature')

  if (!token) {
    return NextResponse.json(
      { error: 'Payment required', code: 402 },
      { status: 402 }
    )
  }

  const payments = Payments.getInstance({
    nvmApiKey: NVM_API_KEY,
    environment: NVM_ENVIRONMENT,
  })

  const paymentRequired = buildPaymentRequired(NVM_PLAN_ID, {
    endpoint: '/api/data',
    agentId: NVM_AGENT_ID,
    httpVerb: 'POST',
  })

  // Verify the token
  const verification = await payments.facilitator.verifyPermissions({
    paymentRequired,
    x402AccessToken: token,
    maxAmount: BigInt(1),
  })

  if (!verification.isValid) {
    return NextResponse.json(
      { error: 'Invalid payment token', reason: verification.invalidReason },
      { status: 402 }
    )
  }

  // Settle (burn) 1 credit
  const settlement = await payments.facilitator.settlePermissions({
    paymentRequired,
    x402AccessToken: token,
    agentRequestId: verification.agentRequestId,
    maxAmount: BigInt(1),
  })

  if (!settlement.success) {
    return NextResponse.json(
      { error: 'Payment settlement failed', reason: settlement.errorReason },
      { status: 402 }
    )
  }

  // Query Convex for agents
  const convex = new ConvexHttpClient(CONVEX_URL)
  const { query = '' } = await req.json().catch(() => ({ query: '' }))
  const agents: any[] = await (convex as any).query('agents:list')

  const q = query.toLowerCase().trim()
  const results = q
    ? agents.filter((a: any) => {
        const haystack = [a.name, a.team_name, a.tagline, ...(a.skills ?? [])].join(' ').toLowerCase()
        return haystack.includes(q)
      })
    : agents

  return NextResponse.json({
    query,
    total: results.length,
    agents: results.map((a: any) => ({
      id: a._id,
      name: a.name,
      team: a.team_name,
      tagline: a.tagline,
      skills: a.skills,
      endpoint: a.endpoint ?? null,
    })),
    creditsRedeemed: settlement.creditsRedeemed ?? 1,
    tx: settlement.transaction,
  })
  } catch (err: any) {
    console.error('POST /api/data error:', err)
    return NextResponse.json({ error: err?.message ?? 'Internal server error' }, { status: 500 })
  }
}
