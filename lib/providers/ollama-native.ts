import type { AIMessage, AIStreamOptions } from '../ai'

interface OllamaChatChunk {
  model: string
  created_at: string
  message?: {
    role: string
    content: string
    thinking?: string
  }
  done: boolean
  done_reason?: string
  error?: string
}

/**
 * Uses Ollama's native /api/chat endpoint instead of the OpenAI-compat shim.
 * This is the only way to pass `think: false` to disable chain-of-thought reasoning.
 */
export async function streamOllamaResponse(
  messages: AIMessage[],
  systemPrompt: string,
  options: AIStreamOptions,
  baseUrl: string,
  model: string
): Promise<ReadableStream<string>> {
  // Derive native API base from the /v1 base URL (e.g. http://localhost:11434/v1 → http://localhost:11434)
  const nativeBase = baseUrl.replace(/\/v1\/?$/, '')

  // Ollama native format: images extracted into a separate `images` array field
  const ollamaMessages = messages.map((m) => {
    if (typeof m.content === 'string') {
      return { role: m.role, content: m.content }
    }
    const textParts = m.content.filter((p) => p.type === 'text')
    const imageParts = m.content.filter((p) => p.type === 'image_url')
    const text = textParts.map((p) => (p as { type: 'text'; text: string }).text).join('\n')
    const images = imageParts.map((p) => {
      const url = (p as { type: 'image_url'; image_url: { url: string } }).image_url.url
      // Strip data URL prefix — Ollama wants raw base64
      return url.replace(/^data:[^;]+;base64,/, '')
    })
    return images.length > 0 ? { role: m.role, content: text, images } : { role: m.role, content: text }
  })

  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      ...ollamaMessages,
    ],
    stream: true,
    options: {
      num_predict: options.maxTokens || 4096,
    },
  }

  if (options.thinkingEnabled === false) {
    body.think = false
  }

  const response = await fetch(`${nativeBase}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Ollama error ${response.status}: ${text}`)
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()

  return new ReadableStream<string>({
    async start(controller) {
      let buffer = ''
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (!line.trim()) continue
            try {
              const chunk = JSON.parse(line) as OllamaChatChunk
              if (chunk.error) {
                throw new Error(`Ollama: ${chunk.error}`)
              }
              const thinking = chunk.message?.thinking
              const content = chunk.message?.content
              // Prefix thinking tokens with \x01 so the SSE route tags them as thinking:true
              if (thinking) controller.enqueue('\x01' + thinking)
              if (content) controller.enqueue(content)
            } catch (lineErr) {
              if (lineErr instanceof Error && lineErr.message.startsWith('Ollama:')) {
                throw lineErr
              }
              // skip malformed JSON lines
            }
          }
        }
        controller.close()
      } catch (err) {
        controller.error(err)
      }
    },
  })
}
