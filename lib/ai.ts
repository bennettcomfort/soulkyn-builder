import { loadSettings } from './settings'
import { streamAnthropicResponse, listAnthropicModels } from './providers/anthropic'
import { streamOpenAICompatResponse, listOpenAICompatModels } from './providers/openai-compat'
import { streamOllamaResponse } from './providers/ollama-native'

export type AIContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } }

export interface AIMessage {
  role: 'user' | 'assistant'
  content: string | AIContentPart[]
}

export interface AIStreamOptions {
  maxTokens?: number
  enableWebSearch?: boolean
  /** Set to false to disable chain-of-thought/thinking for models that support it (e.g. Ollama think: false) */
  thinkingEnabled?: boolean
}

export interface ProviderCapabilities {
  supportsWebSearch: boolean
  supportsVision: boolean
  supportsTools: boolean
}

export function getCapabilities(): ProviderCapabilities {
  const settings = loadSettings()
  return {
    supportsWebSearch: settings.provider === 'anthropic',
    supportsVision: settings.provider === 'anthropic',
    supportsTools: true,
  }
}

export async function streamResponse(
  messages: AIMessage[],
  systemPrompt: string,
  options: AIStreamOptions = {}
): Promise<ReadableStream<string>> {
  const settings = loadSettings()

  if (settings.provider === 'anthropic') {
    return streamAnthropicResponse(
      messages,
      systemPrompt,
      options,
      settings.apiKey,
      settings.model
    )
  }

  // Use native Ollama API so `think: false` and proper streaming work correctly
  if (settings.provider === 'ollama') {
    return streamOllamaResponse(
      messages,
      systemPrompt,
      options,
      settings.baseUrl,
      settings.model
    )
  }

  // All other OpenAI-compat providers (lmstudio, openai, custom)
  return streamOpenAICompatResponse(
    messages,
    systemPrompt,
    options,
    settings.baseUrl,
    settings.apiKey,
    settings.model
  )
}

export async function listModels(): Promise<string[]> {
  const settings = loadSettings()

  if (settings.provider === 'anthropic') {
    return listAnthropicModels()
  }

  return listOpenAICompatModels(settings.baseUrl, settings.apiKey)
}

export async function testConnection(): Promise<{ ok: boolean; error?: string }> {
  try {
    const settings = loadSettings()

    if (settings.provider === 'anthropic') {
      if (!settings.apiKey) {
        return { ok: false, error: 'API key is required for Anthropic' }
      }
    }

    const models = await listModels()
    if (models.length === 0 && settings.provider !== 'anthropic') {
      return { ok: false, error: 'Could not retrieve model list — is the server running?' }
    }

    // Try a minimal stream
    const stream = await streamResponse(
      [{ role: 'user', content: 'Reply with just: OK' }],
      'You are a test assistant.',
      { maxTokens: 10 }
    )

    const reader = stream.getReader()
    let got = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      got += value
      if (got.length > 5) break
    }
    reader.cancel()

    return { ok: true }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}
