'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { Badge } from './ui/Badge'
import { cn } from '@/lib/utils'
import type { ProviderType } from '@/lib/settings'

const PROVIDER_LABELS: Record<ProviderType, string> = {
  anthropic: 'Anthropic Claude',
  ollama: 'Ollama (local)',
  lmstudio: 'LM Studio (local)',
  openai: 'OpenAI',
  xai: 'xAI (Grok)',
  copilot: 'GitHub Copilot',
  custom: 'Custom OpenAI-compatible',
}

const PROVIDER_DEFAULTS: Record<ProviderType, { baseUrl: string; placeholder: string; needsKey: boolean }> = {
  anthropic: {
    baseUrl: 'https://api.anthropic.com',
    placeholder: 'sk-ant-...',
    needsKey: true,
  },
  ollama: {
    baseUrl: 'http://localhost:11434/v1',
    placeholder: 'No API key needed',
    needsKey: false,
  },
  lmstudio: {
    baseUrl: 'http://localhost:1234/v1',
    placeholder: 'No API key needed',
    needsKey: false,
  },
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    placeholder: 'sk-...',
    needsKey: true,
  },
  xai: {
    baseUrl: 'https://api.x.ai/v1',
    placeholder: 'xai-...',
    needsKey: true,
  },
  copilot: {
    baseUrl: 'https://api.githubcopilot.com',
    placeholder: 'GitHub OAuth token — run: gh auth token',
    needsKey: true,
  },
  custom: {
    baseUrl: 'http://localhost:8080/v1',
    placeholder: 'API key (if required)',
    needsKey: false,
  },
}

const PROVIDER_CAPABILITIES: Record<ProviderType, string[]> = {
  anthropic: ['Web Search', 'Vision', 'Tools', 'Streaming'],
  ollama: ['Streaming', 'Tools (model-dependent)'],
  lmstudio: ['Streaming', 'Tools (model-dependent)'],
  openai: ['Vision (GPT-4o)', 'Tools', 'Streaming'],
  xai: ['Streaming', 'Tools', 'Vision (grok-2-vision)'],
  copilot: ['Streaming', 'Tools', 'Vision (gpt-4o)', 'Draft Autocomplete'],
  custom: ['Streaming', 'Tools (provider-dependent)'],
}

const COPILOT_MODELS = ['gpt-4o', 'gpt-4o-mini', 'claude-3.5-sonnet', 'o3-mini']

export function SettingsPage() {
  const [provider, setProvider] = useState<ProviderType>('anthropic')
  const [baseUrl, setBaseUrl] = useState('https://api.anthropic.com')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('claude-sonnet-4-6')
  const [models, setModels] = useState<string[]>([])
  const [fetchingModels, setFetchingModels] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; error?: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copilotToken, setCopilotToken] = useState('')

  // Load current settings
  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        setProvider(data.provider || 'anthropic')
        setBaseUrl(data.baseUrl || '')
        setApiKey(data.apiKey || '')
        setModel(data.model || '')
        setCopilotToken(data.copilotToken || '')
      })
      .catch(() => {})
  }, [])

  const fetchModels = useCallback(async () => {
    setFetchingModels(true)
    try {
      const res = await fetch('/api/models')
      const data = await res.json()
      setModels(data.models || [])
    } catch {
      setModels([])
    } finally {
      setFetchingModels(false)
    }
  }, [])

  const handleProviderChange = (p: ProviderType) => {
    setProvider(p)
    const defaults = PROVIDER_DEFAULTS[p]
    setBaseUrl(defaults.baseUrl)
    setApiKey('')
    setModel('')
    setModels([])
    setTestResult(null)
  }

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)

    // Save first, then test
    await handleSave()

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test' }),
      })
      const result = await res.json()
      setTestResult(result)
    } catch (err) {
      setTestResult({ ok: false, error: String(err) })
    } finally {
      setTesting(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, baseUrl, apiKey, model, copilotToken }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100 mb-1">Settings</h1>
        <p className="text-sm text-slate-400">Configure your AI provider and model.</p>
      </div>

      {/* Provider selector */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
          AI Provider
        </h2>
        <div className="grid grid-cols-1 gap-2">
          {(Object.keys(PROVIDER_LABELS) as ProviderType[]).map((p) => (
            <button
              key={p}
              onClick={() => handleProviderChange(p)}
              className={cn(
                'w-full text-left p-4 rounded-xl border transition-all',
                provider === p
                  ? 'border-amber-500/50 bg-amber-500/10'
                  : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600/50'
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn('font-medium', provider === p ? 'text-amber-300' : 'text-slate-200')}>
                  {PROVIDER_LABELS[p]}
                </span>
                <div className="flex gap-1 flex-wrap">
                  {PROVIDER_CAPABILITIES[p].slice(0, 2).map((cap) => (
                    <span
                      key={cap}
                      className="text-xs bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Connection config */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Connection
        </h2>
        <Card className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Base URL</label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          {PROVIDER_DEFAULTS[provider].needsKey && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={PROVIDER_DEFAULTS[provider].placeholder}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-mono placeholder-slate-600"
              />
              <p className="text-xs text-slate-500 mt-1">
                Stored locally in data/settings.json
              </p>
            </div>
          )}

          {/* Model selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-slate-300">Model</label>
              {provider !== 'anthropic' && provider !== 'xai' && provider !== 'copilot' && (
                <button
                  onClick={fetchModels}
                  disabled={fetchingModels}
                  className="text-xs text-violet-400 hover:text-amber-300 transition-colors"
                >
                  {fetchingModels ? 'Fetching...' : '↻ Fetch from server'}
                </button>
              )}
            </div>

            {provider === 'anthropic' ? (
              <div className="flex flex-col gap-1.5">
                {['claude-opus-4-6', 'claude-sonnet-4-6', 'claude-haiku-4-5-20251001'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setModel(m)}
                    className={cn(
                      'text-left px-3 py-2 rounded-lg border text-sm font-mono transition-all',
                      model === m
                        ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                        : 'border-slate-700 text-slate-400 hover:border-slate-500'
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            ) : provider === 'xai' ? (
              <div className="flex flex-col gap-1.5">
                {['grok-2-1212', 'grok-2-vision-1212', 'grok-3-beta', 'grok-3-mini-beta'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setModel(m)}
                    className={cn(
                      'text-left px-3 py-2 rounded-lg border text-sm font-mono transition-all',
                      model === m
                        ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                        : 'border-slate-700 text-slate-400 hover:border-slate-500'
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            ) : provider === 'copilot' ? (
              <div className="flex flex-col gap-1.5">
                {COPILOT_MODELS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setModel(m)}
                    className={cn(
                      'text-left px-3 py-2 rounded-lg border text-sm font-mono transition-all',
                      model === m
                        ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                        : 'border-slate-700 text-slate-400 hover:border-slate-500'
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            ) : models.length > 0 ? (
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              >
                {models.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Model name (e.g. llama3.2)"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-mono placeholder-slate-600"
              />
            )}
          </div>
        </Card>
      </section>

      {/* Copilot Autocomplete */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Copilot Draft Autocomplete
        </h2>
        <p className="text-xs text-slate-500 mb-3">
          Ghost-text completions in the draft editor. Always uses GitHub Copilot regardless of main provider.
          Get your token by running <code className="text-amber-400 bg-slate-800 px-1 rounded">gh auth token</code> in your terminal.
        </p>
        <Card className="p-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">GitHub OAuth Token</label>
            <input
              type="password"
              value={copilotToken}
              onChange={(e) => setCopilotToken(e.target.value)}
              placeholder="gho_... (run: gh auth token)"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-mono placeholder-slate-600"
            />
            <p className="text-xs text-slate-500 mt-1">
              Stored locally in data/settings.json. Leave blank to disable autocomplete.
            </p>
          </div>
        </Card>
      </section>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={handleTest}
          disabled={testing || saving}
          variant="secondary"
          size="lg"
        >
          {testing ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-slate-300/30 border-t-slate-300 rounded-full animate-spin" />
              Testing...
            </span>
          ) : (
            '⟳ Test Connection'
          )}
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          size="lg"
          className="flex-1"
        >
          {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {/* Test result */}
      {testResult && (
        <div
          className={cn(
            'mt-4 p-3 rounded-lg border text-sm',
            testResult.ok
              ? 'bg-green-500/10 border-green-500/30 text-green-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          )}
        >
          {testResult.ok
            ? '✓ Connection successful'
            : `✕ ${testResult.error || 'Connection failed'}`}
        </div>
      )}

      {/* Capabilities reminder */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Provider Capabilities
        </h2>
        <Card className="p-4">
          <div className="space-y-2">
            {PROVIDER_CAPABILITIES[provider].map((cap) => (
              <div key={cap} className="flex items-center gap-2 text-sm">
                <span className="text-green-400">✓</span>
                <span className="text-slate-300">{cap}</span>
              </div>
            ))}
            {provider !== 'anthropic' && (
              <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                <span className="text-slate-600">✗</span>
                <span>Web Search (Anthropic only)</span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
