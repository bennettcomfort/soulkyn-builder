'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChatInterface, type ChatMessage } from './Chat/ChatInterface'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { cn } from '@/lib/utils'
import { v4 as uuidv4 } from 'uuid'

const BRAINSTORM_SYSTEM = `You are a Soulkyn creative collaborator specializing in persona brainstorming.

Your role is to help the user explore ideas for Soulkyn personas before any structured creation begins.

Topics you excel at:
- Character backstories and personality depth
- World-building: societies, factions, power dynamics
- Story mechanics: quest hooks, conflict drivers, escalation arcs
- Novel game mechanics: stat systems, progression curves, special abilities
- Genre blending and tone calibration
- Villain archetypes and complex NPC motivations
- Relationship dynamics between characters

Style:
- Ask probing questions that reveal what's interesting about an idea
- Suggest unexpected angles and combinations
- Point out what's generic vs. what's memorable
- Be enthusiastic but honest — flag weak concepts directly
- Help the user think through implications before they commit to a build

When the user seems ready to build, summarize the key ideas clearly so they can carry them into a build session.`

interface Note {
  id: string
  content: string
  savedAt: string
}

export function BrainstormPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [notes, setNotes] = useState<Note[]>([])
  const [showNotes, setShowNotes] = useState(false)

  const sendMessage = useCallback(async (userText: string) => {
    const userMsg: ChatMessage = {
      role: 'user',
      content: userText,
      id: uuidv4(),
    }

    const assistantId = uuidv4()
    const assistantMsg: ChatMessage = {
      role: 'assistant',
      content: '',
      id: assistantId,
    }

    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setIsStreaming(true)

    try {
      const res = await fetch('/api/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: userText },
          ],
          systemPrompt: BRAINSTORM_SYSTEM,
          maxTokens: 2048,
        }),
      })

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data)
            if (parsed.text && !parsed.thinking) {
              accumulated += parsed.text
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: accumulated } : m
                )
              )
            }
          } catch {
            // ignore
          }
        }
      }
    } finally {
      setIsStreaming(false)
    }
  }, [messages])

  const saveNote = useCallback((content: string) => {
    const note: Note = {
      id: uuidv4(),
      content,
      savedAt: new Date().toISOString(),
    }
    setNotes((prev) => [...prev, note])
    setShowNotes(true)
  }, [])

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const handleStartBuild = useCallback(async () => {
    // Carry notes into a new session as freeform context
    const notesText = notes.map((n) => n.content).join('\n\n---\n\n')
    const sessionName = `Brainstorm Session ${new Date().toLocaleDateString()}`

    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'RPG',
        name: sessionName,
        buildMode: 'freeform',
      }),
    })
    const session = await res.json()

    // Pre-populate with notes summary
    if (notesText) {
      await fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: session.id,
          brainstormNotes: notesText,
        }),
      })
    }

    router.push(`/build/${session.id}`)
  }, [notes, router])

  return (
    <div className="h-screen flex">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 h-14 border-b border-slate-800 px-6 flex items-center gap-4">
          <h1 className="font-semibold text-slate-200">Brainstorm</h1>
          <span className="text-xs text-slate-500">Free exploration — no commitment to a build</span>
          <div className="flex-1" />
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
          >
            📝 Notes ({notes.length})
          </button>
        </div>

        <ChatInterface
          messages={messages}
          onSend={sendMessage}
          isStreaming={isStreaming}
          placeholder="Explore an idea, ask for mechanic suggestions, describe a character concept..."
          className="flex-1"
          onSaveNote={saveNote}
          showSaveNote={true}
        />
      </div>

      {/* Notes sidebar */}
      {showNotes && (
        <div className="w-72 flex-shrink-0 border-l border-slate-800 flex flex-col">
          <div className="flex-shrink-0 h-14 border-b border-slate-800 px-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-300">Saved Notes</h2>
            <button
              onClick={() => setShowNotes(false)}
              className="text-slate-500 hover:text-slate-300 text-sm"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {notes.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-4">
                Click &quot;Save as note&quot; on any AI message
              </p>
            )}
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-slate-800/60 rounded-lg p-3 text-xs text-slate-300 border border-slate-700/50 group"
              >
                <p className="leading-relaxed line-clamp-4">{note.content}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-slate-600">
                    {new Date(note.savedAt).toLocaleTimeString()}
                  </span>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {notes.length > 0 && (
            <div className="p-4 border-t border-slate-800">
              <Button onClick={handleStartBuild} className="w-full" size="sm">
                Start Build with Notes →
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
