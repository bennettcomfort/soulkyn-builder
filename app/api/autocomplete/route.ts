import { NextRequest, NextResponse } from 'next/server'
import { loadSettings } from '@/lib/settings'
import { copilotCompletion } from '@/lib/providers/copilot'

export async function POST(req: NextRequest) {
  try {
    const { prefix } = await req.json() as { prefix: string }

    if (!prefix || prefix.trim().length < 10) {
      return NextResponse.json({ suggestion: '' })
    }

    const settings = loadSettings()
    const githubToken = settings.copilotToken

    if (!githubToken) {
      return NextResponse.json({ suggestion: '', debug: 'no copilotToken in settings' })
    }

    const suggestion = await copilotCompletion(prefix, githubToken)
    return NextResponse.json({ suggestion })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[autocomplete]', msg)
    return NextResponse.json({ suggestion: '', debug: msg })
  }
}
