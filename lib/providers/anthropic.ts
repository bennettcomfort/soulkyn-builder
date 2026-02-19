import Anthropic from '@anthropic-ai/sdk'
import type { AIMessage, AIStreamOptions } from '../ai'

let client: Anthropic | null = null

function getClient(apiKey: string): Anthropic {
  if (!client || (client as unknown as { apiKey: string }).apiKey !== apiKey) {
    client = new Anthropic({ apiKey })
  }
  return client
}

export async function streamAnthropicResponse(
  messages: AIMessage[],
  systemPrompt: string,
  options: AIStreamOptions,
  apiKey: string,
  model: string
): Promise<ReadableStream<string>> {
  const anthropic = getClient(apiKey)

  const anthropicMessages = messages.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }))

  const stream = anthropic.messages.stream({
    model,
    max_tokens: options.maxTokens || 4096,
    system: systemPrompt,
    messages: anthropicMessages,
    ...(options.enableWebSearch
      ? {
          tools: [
            {
              type: 'web_search_20250305' as const,
              name: 'web_search',
              max_uses: 5,
            },
          ],
        }
      : {}),
  })

  return new ReadableStream<string>({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            controller.enqueue(chunk.delta.text)
          }
        }
        controller.close()
      } catch (err) {
        controller.error(err)
      }
    },
  })
}

export async function listAnthropicModels(): Promise<string[]> {
  return [
    'claude-opus-4-6',
    'claude-sonnet-4-6',
    'claude-haiku-4-5-20251001',
  ]
}
