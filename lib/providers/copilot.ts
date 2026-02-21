import OpenAI from 'openai'
import type { AIMessage, AIStreamOptions } from '../ai'

interface CopilotSession {
  token: string
  expiresAt: number // Unix ms
}

// In-memory cache — refreshed when within 60s of expiry
let sessionCache: CopilotSession | null = null

export async function getCopilotSessionToken(githubToken: string): Promise<string> {
  const now = Date.now()

  if (sessionCache && sessionCache.expiresAt - now > 60_000) {
    return sessionCache.token
  }

  const res = await fetch('https://api.github.com/copilot_internal/v2/token', {
    headers: {
      Authorization: `token ${githubToken}`,
      'Accept': 'application/json',
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Copilot token exchange failed (${res.status}): ${text}`)
  }

  const data = await res.json() as { token: string; expires_at: number }
  sessionCache = {
    token: data.token,
    expiresAt: data.expires_at * 1000, // convert to ms
  }

  return sessionCache.token
}

export async function streamCopilotResponse(
  messages: AIMessage[],
  systemPrompt: string,
  options: AIStreamOptions,
  githubToken: string,
  model: string
): Promise<ReadableStream<string>> {
  const sessionToken = await getCopilotSessionToken(githubToken)

  const client = new OpenAI({
    baseURL: 'https://api.githubcopilot.com',
    apiKey: sessionToken,
    defaultHeaders: {
      'Copilot-Integration-Id': 'vscode-chat',
      'Editor-Version': 'vscode/1.85.0',
      'Editor-Plugin-Version': 'copilot-chat/0.12.2',
    },
  })

  const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m): OpenAI.Chat.ChatCompletionMessageParam => ({
      role: m.role,
      content: typeof m.content === 'string' ? m.content : '',
    })),
  ]

  const stream = await client.chat.completions.create({
    model,
    messages: openaiMessages,
    max_tokens: options.maxTokens || 4096,
    stream: true,
  })

  return new ReadableStream<string>({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content
          if (content) controller.enqueue(content)
        }
        controller.close()
      } catch (err) {
        controller.error(err)
      }
    },
  })
}

export async function copilotCompletion(
  prefix: string,
  githubToken: string
): Promise<string> {
  const sessionToken = await getCopilotSessionToken(githubToken)

  const res = await fetch('https://api.githubcopilot.com/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${sessionToken}`,
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
          content: 'You are an inline text completion assistant. Continue the text naturally and concisely. Output ONLY the completion — no explanations, no quotation marks, no preamble. Match the tone and style. Keep it short: 5–20 words.',
        },
        {
          role: 'user',
          content: `Continue this text:\n${prefix}`,
        },
      ],
      max_tokens: 60,
      temperature: 0.3,
      stream: false,
    }),
  })

  if (!res.ok) return ''

  const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> }
  const raw = data.choices?.[0]?.message?.content ?? ''
  return raw.replace(/^["'\s]+|["'\s]+$/g, '').trim()
}
