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
      return NextResponse.json({ suggestion: '' })
    }

    const suggestion = await copilotCompletion(prefix, githubToken)
    return NextResponse.json({ suggestion })
  } catch {
    return NextResponse.json({ suggestion: '' })
  }
}
