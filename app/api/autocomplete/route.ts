import { NextRequest, NextResponse } from 'next/server'
import { loadSettings } from '@/lib/settings'

export async function POST(req: NextRequest) {
  try {
    const { prefix, suffix } = await req.json() as { prefix: string; suffix?: string }

    if (!prefix || prefix.trim().length < 10) {
      return NextResponse.json({ suggestion: '' })
    }

    const settings = loadSettings()
    const token = settings.copilotToken

    if (!token) {
      return NextResponse.json({ suggestion: '' })
    }

    const prompt = suffix
      ? `Continue this text naturally. Output ONLY the inline continuation (a few words to one sentence). Do not repeat what came before.\n\nText so far:\n${prefix}`
      : `Continue this text naturally. Output ONLY the inline continuation (a few words to one sentence). Do not repeat what came before.\n\nText so far:\n${prefix}`

    const res = await fetch('https://api.githubcopilot.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Copilot-Integration-Id': 'vscode-chat',
        'Editor-Version': 'vscode/1.85.0',
        'Editor-Plugin-Version': 'copilot-chat/0.12.2',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an inline text completion assistant. When given text, continue it naturally and concisely. Output ONLY the completion itself — no explanations, no quotation marks, no preamble. Match the tone and style of the existing text. Keep completions short: typically 5–20 words.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 60,
        temperature: 0.3,
        stream: false,
      }),
    })

    if (!res.ok) {
      return NextResponse.json({ suggestion: '' })
    }

    const data = await res.json() as {
      choices?: Array<{ message?: { content?: string } }>
    }
    const raw = data.choices?.[0]?.message?.content ?? ''
    // Strip any leading/trailing quotes or whitespace artifacts
    const suggestion = raw.replace(/^["'\s]+|["'\s]+$/g, '').trim()

    return NextResponse.json({ suggestion })
  } catch {
    return NextResponse.json({ suggestion: '' })
  }
}
