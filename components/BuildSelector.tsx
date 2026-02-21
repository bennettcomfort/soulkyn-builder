'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { cn } from '@/lib/utils'
import type { ContentType } from '@/lib/budget'

const TYPE_CARDS = [
  {
    type: 'RPG' as ContentType,
    icon: '⚔',
    title: 'RPG Scenario',
    description: 'Multi-NPC game-master scenario with stats, factions, and inner monologue system.',
    limit: '6,850 bg + 4×700 chat examples',
    color: 'violet',
  },
  {
    type: 'SC' as ContentType,
    icon: '👤',
    title: 'Single Character',
    description: 'One-on-one persona with deep psychology, relationship arc, and optional v2 mechanics.',
    limit: '6,800 content + 4×700 chat examples',
    color: 'pink',
  },
  {
    type: 'DLL' as ContentType,
    icon: '🔧',
    title: 'DLL Modifier',
    description: 'Single-behavior overlay that injects into any existing persona. One change per file.',
    limit: '6,800 content + 4×700 chat examples',
    color: 'cyan',
  },
  {
    type: 'WRL' as ContentType,
    icon: '🌍',
    title: 'World Overlay',
    description: 'Injectable world-environment file that defines setting, factions, and atmosphere.',
    limit: '6,800 content + 4×700 chat examples',
    color: 'amber',
  },
]

const MODE_OPTIONS = [
  {
    id: 'interview' as const,
    icon: '📝',
    label: 'Guided Interview',
    description: 'Step through questions one by one — options provided for every decision.',
  },
  {
    id: 'freeform' as const,
    icon: '✍',
    label: 'Free-form Brief',
    description: 'Give a short description and the AI generates a complete persona.',
  },
  {
    id: 'roughdraft' as const,
    icon: '📄',
    label: 'Rough Draft',
    description: 'Paste an existing draft and the AI completes or refines it.',
  },
  {
    id: 'chat' as const,
    icon: '💬',
    label: 'Chat Build',
    description: 'Conversational build — give instructions, the AI drafts and proposes in real time.',
  },
]

const COLOR_CLASSES: Record<string, string> = {
  violet: 'border-violet-500/50 bg-violet-500/10 hover:bg-violet-500/15',
  pink: 'border-pink-500/50 bg-pink-500/10 hover:bg-pink-500/15',
  cyan: 'border-cyan-500/50 bg-cyan-500/10 hover:bg-cyan-500/15',
  amber: 'border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/15',
}

const COLOR_TEXT: Record<string, string> = {
  violet: 'text-violet-300',
  pink: 'text-pink-300',
  cyan: 'text-cyan-300',
  amber: 'text-amber-300',
}

export function BuildSelector() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<ContentType | null>(null)
  const [selectedMode, setSelectedMode] = useState<'interview' | 'freeform' | 'roughdraft' | 'chat'>('interview')
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    if (!selectedType || !name.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: selectedType, name: name.trim(), buildMode: selectedMode }),
      })
      const session = await res.json()
      router.push(`/build/${session.id}`)
    } catch (err) {
      console.error(err)
      setCreating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100 mb-1">New Build</h1>
        <p className="text-sm text-slate-400">Choose a content type and creation mode.</p>
      </div>

      {/* Type selection */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
          1. Content Type
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {TYPE_CARDS.map((card) => (
            <button
              key={card.type}
              onClick={() => setSelectedType(card.type)}
              className={cn(
                'text-left p-5 rounded-xl border transition-all duration-150',
                selectedType === card.type
                  ? COLOR_CLASSES[card.color]
                  : 'border-slate-700/50 bg-slate-800/30 hover:bg-slate-700/20 hover:border-slate-600/50'
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{card.icon}</span>
                <div>
                  <span className={cn('font-semibold', selectedType === card.type ? COLOR_TEXT[card.color] : 'text-slate-200')}>
                    {card.title}
                  </span>
                  <div className="text-xs text-slate-500 mt-0.5">{card.limit}</div>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">{card.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Mode selection */}
      {selectedType && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            2. Creation Mode
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {MODE_OPTIONS.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={cn(
                  'text-left p-4 rounded-xl border transition-all duration-150',
                  selectedMode === mode.id
                    ? 'border-amber-500/50 bg-amber-500/10'
                    : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600/50'
                )}
              >
                <div className="text-xl mb-2">{mode.icon}</div>
                <div className={cn('font-medium text-sm mb-1', selectedMode === mode.id ? 'text-amber-300' : 'text-slate-200')}>
                  {mode.label}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{mode.description}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Project name */}
      {selectedType && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            3. Project Name
          </h2>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="e.g. NetPunk City 2, Shadow Court RPG..."
            className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors text-sm"
            autoFocus
          />
        </section>
      )}

      {/* Create button */}
      {selectedType && name.trim() && (
        <Button
          onClick={handleCreate}
          disabled={creating}
          size="lg"
          className="w-full"
        >
          {creating ? 'Creating...' : `Create ${selectedType} → ${selectedMode === 'interview' ? 'Start Interview' : selectedMode === 'freeform' ? 'Generate' : selectedMode === 'roughdraft' ? 'Paste Draft' : 'Chat Build'}`}
        </Button>
      )}
    </div>
  )
}
