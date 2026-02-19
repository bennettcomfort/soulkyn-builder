import { NextRequest } from 'next/server'
import { streamResponse } from '@/lib/ai'
import type { AIMessage } from '@/lib/ai'
import { loadCreatorAssistant, loadMasterReference } from '@/lib/master-reference'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      messages: AIMessage[]
      systemPrompt?: string
      useCreatorSystem?: boolean
      enableWebSearch?: boolean
      maxTokens?: number
    }

    let systemPrompt = body.systemPrompt || ''

    if (body.useCreatorSystem) {
      systemPrompt = loadCreatorAssistant()
    }

    const messages: AIMessage[] = [...(body.messages || [])]

    // If using creator system, inject master reference as first user message
    if (body.useCreatorSystem && messages.length > 0 && messages[0].role === 'user') {
      const masterRef = loadMasterReference()
      if (masterRef && masterRef !== '(MASTER_REFERENCE.md not found)') {
        messages.unshift(
          { role: 'user', content: masterRef },
          { role: 'assistant', content: 'Loaded. I have the persona inventory, used mechanics, unused mechanics pool, and pattern warnings. Ready to begin.' }
        )
      }
    }

    const stream = await streamResponse(messages, systemPrompt, {
      maxTokens: body.maxTokens || 8192,
      enableWebSearch: body.enableWebSearch,
    })

    const encoder = new TextEncoder()

    const sseStream = new ReadableStream({
      async start(controller) {
        try {
          const reader = stream.getReader()
          while (true) {
            const { done, value } = await reader.read()
            if (done) {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'))
              controller.close()
              break
            }
            // SSE format — \x01 prefix marks reasoning/thinking tokens
            const isThinking = value.startsWith('\x01')
            const text = isThinking ? value.slice(1) : value
            const chunk = isThinking
              ? JSON.stringify({ text, thinking: true })
              : JSON.stringify({ text })
            controller.enqueue(encoder.encode(`data: ${chunk}\n\n`))
          }
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err)
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: errMsg })}\n\n`)
          )
          controller.close()
        }
      },
    })

    return new Response(sseStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
