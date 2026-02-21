import { NextRequest, NextResponse } from 'next/server'
import { loadSettings, saveSettings } from '@/lib/settings'
import { testConnection } from '@/lib/ai'
import type { AppSettings } from '@/lib/settings'

export const runtime = 'nodejs'

export async function GET() {
  const settings = loadSettings()
  return NextResponse.json({
    ...settings,
    apiKey: settings.apiKey ? '***' + settings.apiKey.slice(-4) : '',
    copilotToken: settings.copilotToken ? '***' + settings.copilotToken.slice(-4) : '',
  })
}

export async function PUT(req: NextRequest) {
  const body = await req.json() as Partial<AppSettings>
  const current = loadSettings()

  // Don't overwrite keys if masked values sent back
  const apiKey =
    body.apiKey && body.apiKey.startsWith('***')
      ? current.apiKey
      : (body.apiKey ?? current.apiKey)

  const copilotToken =
    body.copilotToken && body.copilotToken.startsWith('***')
      ? current.copilotToken
      : (body.copilotToken ?? current.copilotToken)

  const updated: AppSettings = {
    ...current,
    ...body,
    apiKey,
    copilotToken,
  }

  saveSettings(updated)
  return NextResponse.json({ ok: true })
}

export async function POST(req: NextRequest) {
  const { action } = await req.json() as { action: string }

  if (action === 'test') {
    const result = await testConnection()
    return NextResponse.json(result)
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
