import { NextResponse } from 'next/server'
import { listModels, testConnection } from '@/lib/ai'
import { loadSettings, saveSettings } from '@/lib/settings'
import type { AppSettings } from '@/lib/settings'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const models = await listModels()
    return NextResponse.json({ models })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ models: [], error: msg }, { status: 500 })
  }
}
