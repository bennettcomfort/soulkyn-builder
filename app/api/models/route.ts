import { NextRequest, NextResponse } from 'next/server'
import { listModels } from '@/lib/ai'
import { listOpenAICompatModels } from '@/lib/providers/openai-compat'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    // Allow callers to pass current (unsaved) baseUrl/apiKey as query params
    const url = new URL(req.url)
    const baseUrl = url.searchParams.get('baseUrl')
    const apiKey = url.searchParams.get('apiKey')

    if (baseUrl) {
      // Fetch directly from the provided endpoint without touching saved settings
      const models = await listOpenAICompatModels(baseUrl, apiKey ?? '')
      return NextResponse.json({ models })
    }

    const models = await listModels()
    return NextResponse.json({ models })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ models: [], error: msg }, { status: 500 })
  }
}
