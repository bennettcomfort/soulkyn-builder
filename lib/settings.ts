import fs from 'fs'
import path from 'path'

export type ProviderType = 'anthropic' | 'ollama' | 'lmstudio' | 'openai' | 'custom'

export interface AppSettings {
  provider: ProviderType
  baseUrl: string
  apiKey: string
  model: string
  customProviderName?: string
}

const SETTINGS_PATH = path.join(process.cwd(), 'data', 'settings.json')

const DEFAULTS: Record<ProviderType, Partial<AppSettings>> = {
  anthropic: {
    baseUrl: 'https://api.anthropic.com',
    model: 'claude-sonnet-4-6',
  },
  ollama: {
    baseUrl: 'http://localhost:11434/v1',
    apiKey: 'ollama',
    model: 'llama3.2',
  },
  lmstudio: {
    baseUrl: 'http://localhost:1234/v1',
    apiKey: 'lm-studio',
    model: 'local-model',
  },
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o',
  },
  custom: {
    baseUrl: 'http://localhost:8080/v1',
    apiKey: '',
    model: 'local-model',
  },
}

const DEFAULT_SETTINGS: AppSettings = {
  provider: 'anthropic',
  baseUrl: 'https://api.anthropic.com',
  apiKey: process.env.ANTHROPIC_API_KEY || '',
  model: 'claude-sonnet-4-6',
}

export function loadSettings(): AppSettings {
  try {
    if (fs.existsSync(SETTINGS_PATH)) {
      const raw = fs.readFileSync(SETTINGS_PATH, 'utf-8')
      const parsed = JSON.parse(raw) as Partial<AppSettings>
      return { ...DEFAULT_SETTINGS, ...parsed }
    }
  } catch {
    // fall through to defaults
  }

  // Try to pick up key from environment
  const settings = { ...DEFAULT_SETTINGS }
  if (process.env.ANTHROPIC_API_KEY) {
    settings.apiKey = process.env.ANTHROPIC_API_KEY
  }
  return settings
}

export function saveSettings(settings: AppSettings): void {
  const dir = path.dirname(SETTINGS_PATH)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2))
}

export function getProviderDefaults(provider: ProviderType): Partial<AppSettings> {
  return DEFAULTS[provider] || {}
}
