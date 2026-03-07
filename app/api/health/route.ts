import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'AgentIn', version: '1.0.0' })
}
