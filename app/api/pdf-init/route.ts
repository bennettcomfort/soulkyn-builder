import { NextResponse } from 'next/server'
import { buildImageLibrary, getCacheStatus } from '@/lib/pdf'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const status = getCacheStatus()
  return NextResponse.json(status)
}

export async function POST() {
  try {
    const text = await buildImageLibrary()
    const status = getCacheStatus()
    return NextResponse.json({ ok: true, chars: text.length, ...status })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
