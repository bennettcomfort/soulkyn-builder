'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'

/** Streams a single completion and returns the full text, without touching any React state. */
async function fetchCompletion(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  systemPrompt: string,
  signal?: AbortSignal
): Promise<string> {
  const res = await fetch('/api/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      systemPrompt,
      useCreatorSystem: false,
      enableWebSearch: false,
      maxTokens: 8192,
      thinkingEnabled: false,
    }),
    signal,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(err.error || 'Request failed')
  }
  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let buf = ''
  let out = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    const lines = buf.split('\n')
    buf = lines.pop() || ''
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6)
      if (data === '[DONE]') break
      try {
        const p = JSON.parse(data)
        if (p.error) throw new Error(p.error)
        if (p.text && !p.thinking) out += p.text
      } catch { /* ignore individual chunk parse errors */ }
    }
  }
  return out.trim()
}

import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { DraftEditor, type DraftEditorHandle } from './DraftPreview/DraftEditor'
import { BudgetBar } from './BudgetBar/BudgetBar'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { TypeStructureGuide } from './TypeStructureGuide'
import { cn } from '@/lib/utils'
import { getTotalLimit } from '@/lib/budget'
import type { Session } from '@/lib/sessions'
import type { TagSets } from '@/lib/tag-sets'
import { DEFAULT_TAG_SETS } from '@/lib/tag-sets'
import type { ContentType } from '@/lib/budget'
import type { SectionGuideItem } from '@/lib/content-types'

interface ChatBuildSessionProps {
  session: Session
  onSave: (updates: Partial<Session>) => Promise<void>
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

const TYPE_BADGE: Record<ContentType, 'rpg' | 'sc' | 'dll' | 'wrl'> = {
  RPG: 'rpg', SC: 'sc', DLL: 'dll', WRL: 'wrl',
}

function buildSystemPrompt(session: Session, draftContent: string): string {
  return `You are a collaborative Soulkyn build assistant helping the user create a ${session.type} content file named "${session.name}".

Your role:
- Respond conversationally in the chat. Keep chat responses concise and direct.
- When you need to update or add draft content, emit one or more <draft_patch> blocks.
- Each <draft_patch> block must contain a section in [Important: Section Name ... ] format. The section name identifies which section to replace in the current draft. If it's a new section, it gets appended.
- Chat commentary goes OUTSIDE the <draft_patch> tags. Never explain what's inside a patch — just tell the user what you changed and why.
- Proactively ask clarifying questions, flag budget or rule issues, and propose improvements.
- Keep track of the character budget. The total limit for ${session.type} is ${getTotalLimit(session.type).toLocaleString()} characters.

Patch protocol example:
  I've updated the Background and removed the Thirst mechanic from Stats.

  <draft_patch>
  [Important: Background
  - updated content here
  ]
  </draft_patch>
  <draft_patch>
  [Important: Stats
  - stats content without thirst
  ]
  </draft_patch>

Rules:
- Only emit <draft_patch> blocks when the draft content actually changes.
- Always include the full updated section content inside each patch block — not a partial snippet.
- If the user asks a question or you're clarifying something, respond in chat only with no patch.
- Do NOT use **double asterisks** for bold in draft content — write plain text with no markdown bold formatting.
- Write draft sections with rich, detailed prose — at least 400-800 characters per section unless budget-constrained.
- Format EVERY section using this structure: [Important: Section Name\n- content\n]

Current draft:
${draftContent || '(empty — ask what to build)'}`
}

function extractPatches(raw: string): string[] {
  const regex = /<draft_patch>([\s\S]*?)<\/draft_patch>/g
  const patches: string[] = []
  let match
  while ((match = regex.exec(raw)) !== null) {
    patches.push(match[1].trim())
  }
  return patches
}

function stripPatches(raw: string): string {
  return raw.replace(/<draft_patch>[\s\S]*?<\/draft_patch>/g, '').trim()
}

function applyPatches(patches: string[], draft: string): string {
  let result = draft

  for (const patch of patches) {
    // New format: [Important: Section Name ... ]
    const importantMatch = patch.match(/^\[important:\s*([^\n]+)/im)
    if (importantMatch) {
      const sectionName = importantMatch[1].trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      // Match the existing [Important: SectionName ... \n] block
      const sectionRegex = new RegExp(
        `\\[important:\\s*${sectionName}[\\s\\S]*?\\n\\]`,
        'i'
      )
      if (sectionRegex.test(result)) {
        result = result.replace(sectionRegex, patch)
      } else {
        result = result ? result + '\n\n' + patch : patch
      }
      continue
    }

    // Legacy: ## header format
    const headerMatch = patch.match(/^(#{1,3}) (.+)$/m)
    if (!headerMatch) {
      result = result ? result + '\n\n' + patch : patch
      continue
    }

    const level = headerMatch[1].length
    const headerLine = headerMatch[0]

    const escapedHeader = headerLine.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const sectionRegex = new RegExp(
      `(${escapedHeader}[\\s\\S]*?)(?=^#{1,${level}} |$)`,
      'gm'
    )

    if (sectionRegex.test(result)) {
      sectionRegex.lastIndex = 0
      result = result.replace(sectionRegex, patch)
    } else {
      result = result ? result + '\n\n' + patch : patch
    }
  }

  return result
}

function computeLivePreview(raw: string, baseDraft: string): string {
  const OPEN_TAG = '<draft_patch>'
  const CLOSE_TAG = '</draft_patch>'
  const lastOpenIdx = raw.lastIndexOf(OPEN_TAG)
  const lastCloseIdx = raw.lastIndexOf(CLOSE_TAG)
  const inPatch = lastOpenIdx !== -1 && (lastCloseIdx === -1 || lastOpenIdx > lastCloseIdx)

  if (inPatch) {
    // Partial patch content streaming in now
    const partialPatch = raw.slice(lastOpenIdx + OPEN_TAG.length)
    const completedPatches = extractPatches(raw)
    const base = completedPatches.length > 0 ? applyPatches(completedPatches, baseDraft) : baseDraft
    return base ? base + '\n\n' + partialPatch : partialPatch
  } else {
    // Between patches — show completed patches applied
    const completedPatches = extractPatches(raw)
    return completedPatches.length > 0 ? applyPatches(completedPatches, baseDraft) : baseDraft
  }
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}

const QUICK_ACTIONS = [
  { label: '→ Continue', text: 'Continue generating the next section.' },
  { label: '↕ Expand', text: 'Expand the last section with more detail.' },
  { label: '⊟ Compress', text: 'Compress the last section to save character budget.' },
  { label: '✓ Checklist', text: 'Review the draft against the quality checklist and list any issues.' },
]

export function ChatBuildSession({ session, onSave }: ChatBuildSessionProps) {
  const router = useRouter()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draftContent, setDraftContent] = useState(session.draftContent || '')
  const rawTagSets = session.tagSets
  const [tagSets, setTagSets] = useState<TagSets>(
    (typeof rawTagSets === 'object' && rawTagSets !== null) ? rawTagSets as TagSets : { ...DEFAULT_TAG_SETS }
  )
  const rawExamples = session.chatExamples
  const [chatExamples, setChatExamples] = useState<string[]>(
    Array.isArray(rawExamples) && rawExamples.length === 4 ? rawExamples : ['', '', '', '']
  )
  const [livePreview, setLivePreview] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingMsgId, setStreamingMsgId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [guideOpen, setGuideOpen] = useState(false)
  const [leftOpen, setLeftOpen] = useState(true)
  const abortRef = useRef<AbortController | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const draftEditorRef = useRef<DraftEditorHandle>(null)
  const totalLimit = getTotalLimit(session.type)
  const hasInitialized = useRef(false)

  // Scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // On mount: show welcome if draft is empty
  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    if (!session.draftContent) {
      const welcomeMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: `Ready to build your ${session.type}. Tell me what you have in mind — a rough concept, a theme, or just a name is enough to start.`,
      }
      setMessages([welcomeMsg])
    }
  }, [session])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return
    setError(null)

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: text.trim(),
    }

    const assistantMsgId = generateId()
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      isStreaming: true,
    }

    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setStreamingMsgId(assistantMsgId)
    setIsStreaming(true)

    // Build message history for API (excluding the new assistant placeholder)
    const currentDraft = draftContent
    const systemPrompt = buildSystemPrompt(session, currentDraft)

    // Build history from existing messages (excluding current streaming assistant)
    const historyMsgs = messages
      .filter((m) => !m.isStreaming)
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))

    const apiMessages = [
      ...historyMsgs,
      { role: 'user' as const, content: text.trim() },
    ]

    const ctrl = new AbortController()
    abortRef.current = ctrl

    let rawBuffer = ''

    try {
      const res = await fetch('/api/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          systemPrompt,
          useCreatorSystem: false,
          enableWebSearch: false,
          maxTokens: 8192,
          thinkingEnabled: false,
        }),
        signal: ctrl.signal,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Stream failed')
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let sseBuffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        sseBuffer += decoder.decode(value, { stream: true })
        const lines = sseBuffer.split('\n')
        sseBuffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data)
            if (parsed.error) throw new Error(parsed.error)
            if (parsed.text && !parsed.thinking) {
              rawBuffer += parsed.text
              // Chat bubble: strip patch blocks, show only commentary
              const displayText = stripPatches(rawBuffer)
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId ? { ...m, content: displayText } : m
                )
              )
              // Draft panel: stream patch content live
              setLivePreview(computeLivePreview(rawBuffer, currentDraft))
            }
          } catch (parseErr) {
            if (parseErr instanceof Error && parseErr.message !== 'Stream failed') {
              // ignore individual chunk parse errors
            } else {
              throw parseErr
            }
          }
        }
      }

      // Stream complete — apply patches and clear live preview
      const chatText = stripPatches(rawBuffer)
      const patches = extractPatches(rawBuffer)

      let newDraft = currentDraft
      if (patches.length > 0) {
        newDraft = applyPatches(patches, currentDraft)
        setDraftContent(newDraft)
        await onSave({ draftContent: newDraft, budgetUsed: newDraft.length })
      }
      setLivePreview(null)

      // Finalize assistant message
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, content: chatText || rawBuffer, isStreaming: false }
            : m
        )
      )
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        // Stopped by user — finalize whatever we have
        const chatText = stripPatches(rawBuffer)
        const patches = extractPatches(rawBuffer)
        if (patches.length > 0) {
          const newDraft = applyPatches(patches, currentDraft)
          setDraftContent(newDraft)
          await onSave({ draftContent: newDraft, budgetUsed: newDraft.length })
        }
        setLivePreview(null)
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, content: chatText || rawBuffer, isStreaming: false }
              : m
          )
        )
      } else {
        const msg = err instanceof Error ? err.message : String(err)
        setError(msg)
        setLivePreview(null)
        setMessages((prev) => prev.filter((m) => m.id !== assistantMsgId))
      }
    } finally {
      setIsStreaming(false)
      setStreamingMsgId(null)
      abortRef.current = null
    }
  }, [isStreaming, messages, draftContent, session, onSave])

  const handleDraftChange = (v: string) => {
    setDraftContent(v)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => onSave({ draftContent: v, budgetUsed: v.length }), 1500)
  }

  const handleTagSetsChange = (v: TagSets) => {
    setTagSets(v)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => onSave({ tagSets: v }), 1500)
  }

  const handleChatExamplesChange = (v: string[]) => {
    setChatExamples(v)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => onSave({ chatExamples: v }), 1500)
  }

  const handleAddSection = useCallback(async (item: SectionGuideItem, notes: string, instructions: string) => {
    if (!session || isStreaming) return
    const systemPrompt = `You are a Soulkyn build assistant creating a ${session.type} content file named "${session.name}".
Write ONLY the "${item.name}" section using this exact format:

[Important: ${item.name}
- content here
]

What goes in this section: ${item.hint}${item.budgetNote ? `\nBudget constraint: ${item.budgetNote}` : ''}
Write rich, detailed, specific content — aim for 400-800 characters of actual prose. Be thorough.
Do NOT use **double asterisks** for bold — write plain text with no markdown bold formatting.
No preamble, no commentary — output only the section block starting with [Important: and ending with ].`

    const userContent = [
      `Current draft for context:\n\n${draftContent || '(empty)'}`,
      `\n\nWrite the "${item.name}" section.`,
      notes.trim() ? `\n\nContent / context to include:\n${notes.trim()}` : '',
      instructions.trim() ? `\n\nFormatting / style instructions:\n${instructions.trim()}` : '',
    ].join('')

    setIsStreaming(true)
    setError(null)
    try {
      const generated = await fetchCompletion([{ role: 'user', content: userContent }], systemPrompt)
      if (!generated) return
      const newDraft = draftContent ? draftContent + '\n\n' + generated : generated
      handleDraftChange(newDraft)
      setTimeout(() => draftEditorRef.current?.scrollToSection(item.name), 50)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsStreaming(false)
    }
  }, [session, isStreaming, draftContent, handleDraftChange])

  const handleExecuteComments = useCallback(async () => {
    if (isStreaming || !draftContent) return

    const re = /\/\/([\s\S]+?)\/\//g
    const found: Array<{ full: string; instruction: string }> = []
    let m
    const snapshot = draftContent
    while ((m = re.exec(snapshot)) !== null) {
      found.push({ full: m[0], instruction: m[1].trim() })
    }
    if (found.length === 0) return

    setIsStreaming(true)
    setError(null)
    const ctrl = new AbortController()
    abortRef.current = ctrl

    const systemPrompt = `You are a text editor assistant. The user gives you a short instruction. Output ONLY the text that should replace that instruction — no explanation, no preamble, no quotes. Pure replacement text only.`

    try {
      let result = snapshot

      for (const { full, instruction } of found) {
        const idx = result.indexOf(full)
        const ctxStart = Math.max(0, idx - 300)
        const ctxEnd = Math.min(result.length, idx + full.length + 300)
        const context = result.slice(ctxStart, ctxEnd)

        const prompt = `Context in document (where the instruction appears):\n\n${context}\n\nInstruction to execute: ${instruction}`

        const replacement = await fetchCompletion(
          [{ role: 'user', content: prompt }],
          systemPrompt,
          ctrl.signal
        )

        result = result.slice(0, idx) + replacement + result.slice(idx + full.length)
        setDraftContent(result)
      }

      await onSave({ draftContent: result, budgetUsed: result.length })
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError(err instanceof Error ? err.message : String(err))
      }
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }, [isStreaming, draftContent, onSave])

  const handleSubmit = () => {
    if (!input.trim()) return
    const text = input
    setInput('')
    sendMessage(text)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleStop = () => {
    abortRef.current?.abort()
  }

  const [isFinalizing, setIsFinalizing] = useState(false)

  const handleFinalize = async () => {
    if (isFinalizing) return
    setIsFinalizing(true)
    try {
      await onSave({ status: 'complete', finalContent: draftContent })
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to finalize')
      setIsFinalizing(false)
    }
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 h-14 border-b border-[#3c3c3c] px-6 flex items-center gap-4">
        <button
          onClick={() => router.push('/')}
          className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
        >
          ← Back
        </button>
        <Badge variant={TYPE_BADGE[session.type]}>{session.type}</Badge>
        <h1 className="font-semibold text-slate-200 truncate">{session.name}</h1>
        <span className="text-xs text-[#888] bg-[#2d2d2d] px-2 py-0.5 rounded">Chat Build</span>
        <div className="flex-1" />
        {isStreaming && (
          <Button variant="ghost" size="sm" onClick={handleStop} className="text-red-400">
            ■ Stop
          </Button>
        )}
        {draftContent && (
          <button
            onClick={() => navigator.clipboard.writeText(draftContent)}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Copy Draft
          </button>
        )}
      </header>

      {/* Main split layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat panel */}
        <div className={cn(
          'flex-shrink-0 border-r border-[#3c3c3c] flex flex-col overflow-hidden',
          leftOpen ? 'w-[400px]' : 'w-10'
        )}>
          {/* Collapse toggle strip */}
          <div className="flex-shrink-0 h-9 border-b border-[#3c3c3c] flex items-center px-2">
            {leftOpen && (
              <span className="flex-1 text-xs text-slate-500 font-medium uppercase tracking-wider pl-1">Chat</span>
            )}
            <button
              onClick={() => setLeftOpen((o) => !o)}
              title={leftOpen ? 'Collapse chat' : 'Expand chat'}
              className="text-slate-500 hover:text-slate-300 transition-colors p-1"
            >
              {leftOpen ? '◂' : '▸'}
            </button>
          </div>
          {leftOpen && (
          <>
          {/* Message history */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                {error}
                <button onClick={() => setError(null)} className="ml-2 opacity-60 hover:opacity-100">✕</button>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-violet-600 text-white rounded-br-sm'
                      : 'bg-[#2d2d2d] text-slate-200 rounded-bl-sm'
                  )}
                >
                  {msg.role === 'user' ? (
                    msg.content
                  ) : msg.content ? (
                    <>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          strong: ({ children }) => <strong className="font-semibold text-slate-100">{children}</strong>,
                          em: ({ children }) => <em className="italic text-slate-300">{children}</em>,
                          ul: ({ children }) => <ul className="mb-2 space-y-0.5 pl-4 list-disc marker:text-slate-500">{children}</ul>,
                          ol: ({ children }) => <ol className="mb-2 space-y-0.5 pl-4 list-decimal marker:text-slate-500">{children}</ol>,
                          li: ({ children }) => <li className="text-slate-200">{children}</li>,
                          h1: ({ children }) => <h1 className="text-base font-semibold text-amber-300 mt-2 mb-1">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-sm font-semibold text-amber-300 mt-2 mb-1">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-sm font-medium text-amber-200 mt-1.5 mb-0.5">{children}</h3>,
                          code: ({ children, className }) => {
                            const isBlock = className?.includes('language-')
                            return isBlock
                              ? <code className="block bg-[#1e1e1e] rounded-lg px-3 py-2 text-xs font-mono text-slate-300 my-2 overflow-x-auto whitespace-pre">{children}</code>
                              : <code className="bg-[#1e1e1e] rounded px-1 py-0.5 text-xs font-mono text-amber-300">{children}</code>
                          },
                          pre: ({ children }) => <pre className="bg-[#1e1e1e] rounded-lg my-2 overflow-x-auto">{children}</pre>,
                          blockquote: ({ children }) => <blockquote className="border-l-2 border-slate-600 pl-3 my-1.5 text-slate-400 italic">{children}</blockquote>,
                          hr: () => <hr className="border-slate-700 my-2" />,
                          table: ({ children }) => (
                            <div className="overflow-x-auto my-2">
                              <table className="w-full text-xs border-collapse">{children}</table>
                            </div>
                          ),
                          thead: ({ children }) => <thead className="bg-[#1e1e1e]">{children}</thead>,
                          th: ({ children }) => <th className="px-3 py-1.5 text-left font-semibold text-slate-300 border border-[#444]">{children}</th>,
                          td: ({ children }) => <td className="px-3 py-1.5 text-slate-300 border border-[#3a3a3a]">{children}</td>,
                          tr: ({ children }) => <tr className="even:bg-[#262626]">{children}</tr>,
                          input: ({ type, checked }) =>
                            type === 'checkbox'
                              ? <input type="checkbox" checked={checked} readOnly className="mr-1.5 accent-violet-400 cursor-default" />
                              : null,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                      {msg.isStreaming && (
                        <span className="inline-block w-1.5 h-3.5 bg-violet-400 animate-pulse ml-0.5 align-middle" />
                      )}
                    </>
                  ) : msg.isStreaming ? (
                    <span className="inline-flex gap-1 items-center text-slate-400">
                      <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick actions */}
          <div className="flex-shrink-0 px-3 py-2 border-t border-[#3c3c3c]/60 flex flex-wrap gap-1.5">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => sendMessage(action.text)}
                disabled={isStreaming}
                className="text-xs px-2.5 py-1 rounded-lg bg-[#2d2d2d] text-slate-400 hover:text-slate-200 hover:bg-[#3c3c3c] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {action.label}
              </button>
            ))}
            <button
              onClick={handleFinalize}
              disabled={isStreaming || !draftContent || isFinalizing}
              className="text-xs px-2.5 py-1 rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              {isFinalizing ? (
                <><span className="w-2.5 h-2.5 border border-green-400 border-t-transparent rounded-full animate-spin" />Saving…</>
              ) : '✓ Finalize'}
            </button>
          </div>

          {/* Chat input */}
          <div className="flex-shrink-0 p-3 border-t border-[#3c3c3c]">
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isStreaming}
                placeholder="Give an instruction or ask a question..."
                className="flex-1 bg-[#3c3c3c] border border-[#5a5a5a] rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none transition-colors disabled:opacity-50"
                rows={2}
              />
              <button
                onClick={handleSubmit}
                disabled={!input.trim() || isStreaming}
                className="flex-shrink-0 w-9 h-9 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-white"
              >
                ↑
              </button>
            </div>
          </div>

          {/* Budget bar */}
          <div className="flex-shrink-0 px-3 pb-3">
            <BudgetBar
              used={draftContent.length}
              limit={totalLimit}
              label={`${session.type} Budget`}
              compact
            />
          </div>
          </>
          )}
        </div>

        {/* Draft + collapsible section guide */}
        <div className="flex-1 flex overflow-hidden">
          {/* Live draft panel */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#1e1e1e]">
            <div className="flex-shrink-0 h-10 border-b border-[#3c3c3c] px-4 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                Live Draft
              </span>
              <div className="flex items-center gap-3">
                {draftContent && (
                  <button
                    onClick={() => navigator.clipboard.writeText(draftContent)}
                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    Copy
                  </button>
                )}
                <button
                  onClick={() => setGuideOpen((o) => !o)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                    guideOpen
                      ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                      : 'border-[#474747] text-slate-500 hover:border-slate-500 hover:text-slate-300'
                  }`}
                >
                  {guideOpen ? '▸ Sections' : '◂ Sections'}
                </button>
              </div>
            </div>
            <DraftEditor
              ref={draftEditorRef}
              content={livePreview ?? draftContent}
              onChange={handleDraftChange}
              isStreaming={livePreview !== null}
              onExecuteComments={handleExecuteComments}
              isExecuting={isStreaming}
              tagSets={tagSets}
              onTagSetsChange={handleTagSetsChange}
              chatExamples={chatExamples}
              onChatExamplesChange={handleChatExamplesChange}
              contentType={session.type}
              className="flex-1"
            />
          </div>

          {/* Collapsible section guide panel */}
          {guideOpen && (
            <div className="w-80 flex-shrink-0 border-l border-[#3c3c3c] overflow-y-auto bg-[#252526] flex flex-col">
              <TypeStructureGuide
                type={session.type}
                defaultOpen={true}
                className="flex-1"
                onSectionClick={(name) => draftEditorRef.current?.scrollToSection(name)}
                onAddSection={handleAddSection}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
