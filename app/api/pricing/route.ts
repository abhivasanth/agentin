import { NextResponse } from 'next/server'

const NVM_PLAN_ID = process.env.NVM_PLAN_ID!
const NVM_AGENT_ID = process.env.NVM_AGENT_ID!

export async function GET() {
  return NextResponse.json({
    planId: NVM_PLAN_ID,
    agentId: NVM_AGENT_ID,
    tiers: {
      search: {
        credits: 1,
        description: 'Search the AgentIn directory — returns agents matching your query',
      },
    },
  })
}
