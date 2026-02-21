import OpenAI from 'openai'
import type { AIMessage, AIStreamOptions } from '../ai'

export async function streamOpenAICompatResponse(
  messages: AIMessage[],
  systemPrompt: string,
  options: AIStreamOptions,
  baseUrl: string,
  apiKey: string,
  model: string
): Promise<ReadableStream<string>> {
  const client = new OpenAI({ baseURL: baseUrl, apiKey: apiKey || 'no-key' })

  const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m): OpenAI.Chat.ChatCompletionMessageParam => {
      if (m.role === 'assistant') {
        return { role: 'assistant', content: typeof m.content === 'string' ? m.content : '' }
      }
      return {
        role: 'user',
        // Cast needed: OpenAI SDK accepts image_url content parts for vision models
        content: m.content as OpenAI.Chat.ChatCompletionUserMessageParam['content'],
      }
    }),
  ]

  const baseParams: OpenAI.Chat.ChatCompletionCreateParamsStreaming = {
    model,
    messages: openaiMessages,
    max_tokens: options.maxTokens || 4096,
    stream: true,
  }
  // Pass `think: false` for compat providers that support it (extra field forwarded by SDK)
  const extraParams = options.thinkingEnabled === false ? { think: false } : {}

  const stream = await client.chat.completions.create(
    { ...baseParams, ...extraParams } as OpenAI.Chat.ChatCompletionCreateParamsStreaming
  )

  return new ReadableStream<string>({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta as Record<string, string | undefined>
          const reasoning = delta?.reasoning
          const content = delta?.content
          // Prefix reasoning tokens with \x01 so the route can tag them as thinking:true
          if (reasoning) {
            controller.enqueue('\x01' + reasoning)
          }
          if (content) {
            controller.enqueue(content)
          }
        }
        controller.close()
      } catch (err) {
        controller.error(err)
      }
    },
  })
}

export async function listOpenAICompatModels(baseUrl: string, apiKey: string): Promise<string[]> {
  try {
    const client = new OpenAI({ baseURL: baseUrl, apiKey: apiKey || 'no-key' })
    const response = await client.models.list()
    return response.data.map((m) => m.id)
  } catch {
    return []
  }
}
