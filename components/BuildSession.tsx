'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'

/** Streams a single completion from /api/stream and returns the full text, without touching any React state. */
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
import { InterviewFlow } from './Interview/InterviewFlow'
import { DraftEditor, type DraftEditorHandle } from './DraftPreview/DraftEditor'
import { BudgetBar } from './BudgetBar/BudgetBar'
import { TypeStructureGuide } from './TypeStructureGuide'
import { ChatBuildSession } from './ChatBuildSession'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { Card } from './ui/Card'
import { cn } from '@/lib/utils'
import { getSchema, type SectionGuideItem } from '@/lib/content-types'
import { getTotalLimit } from '@/lib/budget'
import type { Session } from '@/lib/sessions'
import type { TagSets } from '@/lib/tag-sets'
import { DEFAULT_TAG_SETS } from '@/lib/tag-sets'
import type { ContentType } from '@/lib/budget'
import { generateExportMarkdown, exportFilename } from '@/lib/export'

type BuildPhase = 'interview' | 'generating' | 'review' | 'complete'
type SectionAction = 'expand' | 'compress' | 'continue'

const TYPE_BADGE: Record<ContentType, 'rpg' | 'sc' | 'dll' | 'wrl'> = {
  RPG: 'rpg', SC: 'sc', DLL: 'dll', WRL: 'wrl',
}

interface BuildSessionProps {
  sessionId: string
}

export function BuildSession({ sessionId }: BuildSessionProps) {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState<BuildPhase>('interview')
  const [draftContent, setDraftContent] = useState('')
  const [tagSets, setTagSets] = useState<TagSets>({ ...DEFAULT_TAG_SETS })
  const [chatExamples, setChatExamples] = useState<string[]>(['', '', '', ''])
  const [isStreaming, setIsStreaming] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [checklist, setChecklist] = useState<Record<string, boolean>>({})
  const [roughDraft, setRoughDraft] = useState('')
  const [freeformBrief, setFreeformBrief] = useState('')
  const [sectionFeedback, setSectionFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [guideOpen, setGuideOpen] = useState(false)
  const [leftOpen, setLeftOpen] = useState(true)
  const abortRef = useRef<AbortController | null>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const draftEditorRef = useRef<DraftEditorHandle>(null)

  // Load session
  useEffect(() => {
    fetch(`/api/projects`)
      .then((r) => r.json())
      .then((sessions: Session[]) => {
        const found = sessions.find((s) => s.id === sessionId)
        if (!found) {
          router.push('/')
          return
        }
        setSession(found)
        setDraftContent(found.draftContent || '')
        const rawTagSets = found.tagSets
        setTagSets((typeof rawTagSets === 'object' && rawTagSets !== null) ? rawTagSets as TagSets : { ...DEFAULT_TAG_SETS })
        const raw = found.chatExamples
        setChatExamples(Array.isArray(raw) && raw.length === 4 ? raw : ['', '', '', ''])

        // Determine phase
        if (found.status === 'complete') {
          setPhase('complete')
        } else if (found.draftContent) {
          setPhase('review')
        } else if (found.buildMode !== 'interview') {
          setPhase('interview') // will show input form
        }
      })
      .catch(() => router.push('/'))
      .finally(() => setLoading(false))
  }, [sessionId, router])

  const saveSession = useCallback(async (updates: Partial<Session>) => {
    if (!session) return
    await fetch('/api/projects', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: session.id, ...updates }),
    })
    setSession((prev) => prev ? { ...prev, ...updates } : prev)
  }, [session])

  const startStream = useCallback(async (
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    systemPrompt?: string
  ) => {
    setIsStreaming(true)
    setError(null)
    const ctrl = new AbortController()
    abortRef.current = ctrl

    try {
      const res = await fetch('/api/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          useCreatorSystem: !systemPrompt,
          systemPrompt,
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
            if (parsed.error) throw new Error(parsed.error)
            if (parsed.text && !parsed.thinking) {
              accumulated += parsed.text
              setDraftContent(accumulated)
            }
          } catch {
            // ignore parse errors for individual chunks
          }
        }
      }

      return accumulated
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }, [])

  const handleInterviewComplete = useCallback(async (answers: Record<string, string>) => {
    if (!session) return
    setPhase('generating')

    // Save answers
    await saveSession({ interviewAnswers: answers })

    const schema = getSchema(session.type)

    // Build the generation prompt from answers
    const answersSummary = schema.questions
      .map((q) => `${q.question}: ${answers[q.id] || '(not answered)'}`)
      .join('\n')

    const generationPrompt = `
I have completed the interview for a ${session.type} persona named "${session.name}".

Interview answers:
${answersSummary}

Now generate the complete ${session.type} persona following all rules from CREATOR_ASSISTANT.md.
Track the character budget as you go.
Generate section by section in order.
Name: ${session.name}

IMPORTANT: Do NOT use **double asterisks** for bold — write plain text with no markdown bold formatting.
Format EVERY section using this structure:
[Important: Section Name
- content here
]
`.trim()

    try {
      const result = await startStream([{ role: 'user', content: generationPrompt }])
      if (result) {
        const charCount = result.length
        await saveSession({ draftContent: result, budgetUsed: charCount })
        setPhase('review')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setPhase('interview')
    }
  }, [session, saveSession, startStream])

  const handleFreeformGenerate = useCallback(async () => {
    if (!session || !freeformBrief.trim()) return
    setPhase('generating')

    const prompt = `
Generate a complete ${session.type} persona for: "${session.name}"

Description: ${freeformBrief}

Follow all rules from CREATOR_ASSISTANT.md. Generate the full ${session.type} persona.
IMPORTANT: Do NOT use **double asterisks** for bold — write plain text with no markdown bold formatting.
Format EVERY section using this structure:
[Important: Section Name
- content here
]
`.trim()

    try {
      const result = await startStream([{ role: 'user', content: prompt }])
      if (result) {
        await saveSession({ draftContent: result, budgetUsed: result.length })
        setPhase('review')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setPhase('interview')
    }
  }, [session, freeformBrief, saveSession, startStream])

  const handleRoughDraftProcess = useCallback(async () => {
    if (!session || !roughDraft.trim()) return
    setPhase('generating')

    const prompt = `
I have a rough draft for a ${session.type} persona named "${session.name}".
Complete it fully, filling in all missing sections and ensuring it follows all rules from CREATOR_ASSISTANT.md.
IMPORTANT: Do NOT use **double asterisks** for bold — write plain text with no markdown bold formatting.
Format EVERY section using this structure:
[Important: Section Name
- content here
]

Rough draft:
${roughDraft}
`.trim()

    try {
      const result = await startStream([{ role: 'user', content: prompt }])
      if (result) {
        await saveSession({ draftContent: result, budgetUsed: result.length })
        setPhase('review')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setPhase('interview')
    }
  }, [session, roughDraft, saveSession, startStream])

  const handleSectionAction = useCallback(async (action: SectionAction) => {
    if (!session || isStreaming) return
    setSectionFeedback(null)

    let prompt = ''
    if (action === 'expand') {
      prompt = `The last section I generated feels too short. Please expand it with more detail while staying within budget.`
    } else if (action === 'compress') {
      prompt = `The last section is too long. Please compress it to save character budget while preserving all key information.`
    } else {
      prompt = `Continue generating the next section of the ${session.type} persona "${session.name}".`
    }

    const messages = [
      { role: 'user' as const, content: `Current draft:\n\n${draftContent}\n\n${prompt}` },
    ]

    try {
      const result = await startStream(messages)
      if (result) {
        await saveSession({ draftContent: result, budgetUsed: result.length })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [session, isStreaming, draftContent, saveSession, startStream])

  const handleRunChecklist = useCallback(async () => {
    if (!session || !draftContent || isStreaming) return

    const schema = getSchema(session.type)
    const items = schema.checklist

    // Quick local checklist pass
    const results: Record<string, boolean> = {}
    for (const item of items) {
      // Very basic heuristic checks — just mark all as passing for now
      // Real validation happens via AI
      results[item] = true
    }

    // Run AI checklist
    const prompt = `
Review this ${session.type} persona draft against the quality checklist:

Draft:
${draftContent}

Check each item and respond with: PASS or FAIL for each, with brief notes on failures.

Checklist:
${items.map((item, i) => `${i + 1}. ${item}`).join('\n')}
`.trim()

    try {
      const result = await startStream([{ role: 'user', content: prompt }])
      if (result) {
        setSectionFeedback(result)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [session, draftContent, isStreaming, startStream])

  const handleFinalize = useCallback(async () => {
    if (!session) return
    await saveSession({
      status: 'complete',
      finalContent: draftContent,
      budgetUsed: draftContent.length,
    })
    setPhase('complete')
  }, [session, draftContent, saveSession])

  const handleExport = useCallback(() => {
    if (!session) return
    const md = generateExportMarkdown({
      name: session.name,
      draftContent,
      finalContent: session.finalContent ?? null,
      tagSets,
      chatExamples,
    })
    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = exportFilename(session.name)
    a.click()
    URL.revokeObjectURL(url)
  }, [session, draftContent, tagSets, chatExamples])

  const handleStopStream = () => {
    abortRef.current?.abort()
  }

  const handleDraftChange = (v: string) => {
    setDraftContent(v)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => saveSession({ draftContent: v, budgetUsed: v.length }), 1500)
  }

  const handleTagSetsChange = (v: TagSets) => {
    setTagSets(v)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => saveSession({ tagSets: v }), 1500)
  }

  const handleChatExamplesChange = (v: string[]) => {
    setChatExamples(v)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => saveSession({ chatExamples: v }), 1500)
  }

  const handleExecuteComments = useCallback(async () => {
    if (!session || isStreaming || isExecuting || !draftContent) return

    // Find all comment blocks in the current draft
    const re = /\/\/([\s\S]+?)\/\//g
    const found: Array<{ full: string; instruction: string }> = []
    let m
    const snapshot = draftContent
    while ((m = re.exec(snapshot)) !== null) {
      found.push({ full: m[0], instruction: m[1].trim() })
    }
    if (found.length === 0) return

    setIsExecuting(true)
    setError(null)
    const ctrl = new AbortController()
    abortRef.current = ctrl

    const systemPrompt = `You are a text editor assistant. The user gives you a short instruction. Output ONLY the text that should replace that instruction — no explanation, no preamble, no quotes. Pure replacement text only.`

    try {
      let result = snapshot

      for (const { full, instruction } of found) {
        // Give context: ~300 chars around the comment so the AI understands placement
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

        // Client-side in-place replacement — replaces only the first occurrence
        result = result.slice(0, idx) + replacement + result.slice(idx + full.length)
        setDraftContent(result)
      }

      await saveSession({ draftContent: result, budgetUsed: result.length })
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError(err instanceof Error ? err.message : String(err))
      }
    } finally {
      setIsExecuting(false)
      abortRef.current = null
    }
  }, [session, isStreaming, isExecuting, draftContent, saveSession])

  const handleAddSection = useCallback(async (item: SectionGuideItem, notes: string, instructions: string) => {
    if (!session) return
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

    const generated = await fetchCompletion(
      [{ role: 'user', content: userContent }],
      systemPrompt
    )
    if (!generated) return

    const newDraft = draftContent ? draftContent + '\n\n' + generated : generated
    setDraftContent(newDraft)
    await saveSession({ draftContent: newDraft, budgetUsed: newDraft.length })
    setTimeout(() => draftEditorRef.current?.scrollToSection(item.name), 50)
  }, [session, draftContent, saveSession])

  if (loading || !session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-slate-400">Loading...</div>
      </div>
    )
  }

  // Chat build mode gets its own dedicated component
  if (session.buildMode === 'chat') {
    return <ChatBuildSession session={session} onSave={saveSession} />
  }

  const schema = getSchema(session.type)
  const totalLimit = getTotalLimit(session.type)

  return (
    <div className="h-screen flex flex-col">
      {/* Top bar */}
      <header className="flex-shrink-0 h-14 border-b border-[#3c3c3c] px-6 flex items-center gap-4">
        <button
          onClick={() => router.push('/')}
          className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
        >
          ← Back
        </button>
        <Badge variant={TYPE_BADGE[session.type]}>{session.type}</Badge>
        <h1 className="font-semibold text-slate-200 truncate">{session.name}</h1>
        <div className="flex-1" />
        {isStreaming && (
          <Button variant="ghost" size="sm" onClick={handleStopStream} className="text-red-400">
            ■ Stop
          </Button>
        )}
        <span className="text-xs text-slate-500 capitalize">{phase}</span>
      </header>

      {/* Main 2-column layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel — interview/controls */}
        <div className={cn(
          'flex-shrink-0 border-r border-[#3c3c3c] flex flex-col overflow-hidden',
          leftOpen ? 'w-[420px]' : 'w-10'
        )}>
          {/* Collapse toggle strip */}
          <div className="flex-shrink-0 h-9 border-b border-[#3c3c3c] flex items-center px-2">
            {leftOpen && (
              <span className="flex-1 text-xs text-slate-500 font-medium uppercase tracking-wider pl-1">Controls</span>
            )}
            <button
              onClick={() => setLeftOpen((o) => !o)}
              title={leftOpen ? 'Collapse panel' : 'Expand panel'}
              className="text-slate-500 hover:text-slate-300 transition-colors p-1"
            >
              {leftOpen ? '◂' : '▸'}
            </button>
          </div>
          {leftOpen && (
          <>
          <div className="flex-1 min-h-0 overflow-y-auto p-5">
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                {error}
                <button onClick={() => setError(null)} className="ml-2 opacity-60 hover:opacity-100">✕</button>
              </div>
            )}

            {/* Interview phase */}
            {phase === 'interview' && session.buildMode === 'interview' && (
              <InterviewFlow
                schema={schema}
                onComplete={handleInterviewComplete}
                initialAnswers={session.interviewAnswers}
              />
            )}

            {/* Free-form phase */}
            {phase === 'interview' && session.buildMode === 'freeform' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-slate-200 mb-2">Describe your {session.type}</h3>
                  <p className="text-sm text-slate-400 mb-3">
                    Give a brief description and the AI will generate a complete persona.
                  </p>
                  <textarea
                    value={freeformBrief}
                    onChange={(e) => setFreeformBrief(e.target.value)}
                    className="w-full bg-[#3c3c3c] border border-[#5a5a5a] rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
                    rows={8}
                    placeholder={`e.g. "A cyberpunk city RPG with 3 rival factions, focused on corruption mechanics and moral choices. The player is an underground hacker..."`}
                  />
                </div>
                <Button
                  onClick={handleFreeformGenerate}
                  disabled={!freeformBrief.trim()}
                  className="w-full"
                  size="lg"
                >
                  Generate →
                </Button>
              </div>
            )}

            {/* Rough draft phase */}
            {phase === 'interview' && session.buildMode === 'roughdraft' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-slate-200 mb-2">Paste Your Rough Draft</h3>
                  <p className="text-sm text-slate-400 mb-3">
                    The AI will complete any missing sections and ensure it meets all {session.type} requirements.
                  </p>
                  <textarea
                    value={roughDraft}
                    onChange={(e) => setRoughDraft(e.target.value)}
                    className="w-full bg-[#3c3c3c] border border-[#5a5a5a] rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none font-mono"
                    rows={12}
                    placeholder="Paste your existing draft here..."
                  />
                </div>
                <Button
                  onClick={handleRoughDraftProcess}
                  disabled={!roughDraft.trim()}
                  className="w-full"
                  size="lg"
                >
                  Complete Draft →
                </Button>
              </div>
            )}

            {/* Generating phase */}
            {phase === 'generating' && (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-300 text-sm">Generating your {session.type}...</p>
                <p className="text-slate-500 text-xs mt-1">Output streaming in the right panel</p>
              </div>
            )}

            {/* Review phase */}
            {phase === 'review' && (
              <div className="space-y-4">
                <h3 className="font-medium text-slate-200">Review & Refine</h3>

                <div className="grid grid-cols-3 gap-2">
                  {(['expand', 'compress', 'continue'] as SectionAction[]).map((action) => (
                    <Button
                      key={action}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSectionAction(action)}
                      disabled={isStreaming}
                      className="capitalize"
                    >
                      {action === 'expand' ? '↕ Expand' : action === 'compress' ? '⊟ Compress' : '→ Continue'}
                    </Button>
                  ))}
                </div>

                <div className="border-t border-[#474747] pt-4 space-y-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleRunChecklist}
                    disabled={isStreaming}
                    className="w-full"
                  >
                    ✓ Run Quality Checklist
                  </Button>
                  <Button
                    onClick={handleFinalize}
                    disabled={isStreaming}
                    className="w-full"
                    size="md"
                  >
                    ✓ Finalize & Save
                  </Button>
                </div>

                {sectionFeedback && (
                  <div className="mt-4">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Checklist Results
                    </h4>
                    <div className="bg-[#2d2d2d] rounded-lg p-3 text-xs text-slate-300 whitespace-pre-wrap max-h-64 overflow-y-auto">
                      {sectionFeedback}
                    </div>
                  </div>
                )}

                {/* Checklist items */}
                <div className="mt-4">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Quality Checklist
                  </h4>
                  <div className="space-y-1">
                    {schema.checklist.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                        <span
                          className={cn(
                            'flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center text-[10px] mt-0.5',
                            checklist[item]
                              ? 'bg-green-500/20 border-green-500/50 text-green-400'
                              : 'border-slate-600'
                          )}
                        >
                          {checklist[item] ? '✓' : ''}
                        </span>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}


            {/* Complete phase */}
            {phase === 'complete' && (
              <div className="space-y-4 text-center py-6">
                <div className="w-12 h-12 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-2xl mx-auto">
                  ✓
                </div>
                <h3 className="font-semibold text-slate-200">Persona Complete!</h3>
                <p className="text-sm text-slate-400">
                  Saved to{' '}
                  <code className="text-violet-300 text-xs">Projects/{session.name}/final.md</code>
                </p>
                <div className="flex gap-2 justify-center flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPhase('review')
                      saveSession({ status: 'in_progress' })
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(draftContent)}
                    variant="secondary"
                  >
                    Copy Output
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleExport}
                  >
                    Export .md
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Budget bar — always pinned to bottom */}
          <div className="flex-shrink-0 p-4 border-t border-[#3c3c3c]">
            <BudgetBar
              used={draftContent.length}
              limit={totalLimit}
              label={`${session.type} Budget`}
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
                  <>
                    <button
                      onClick={() => navigator.clipboard.writeText(draftContent)}
                      className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      Copy
                    </button>
                    <button
                      onClick={handleExport}
                      className="text-xs text-amber-500/70 hover:text-amber-300 transition-colors"
                    >
                      Export .md
                    </button>
                  </>
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
              content={draftContent}
              onChange={handleDraftChange}
              isStreaming={isStreaming}
              onExecuteComments={handleExecuteComments}
              isExecuting={isExecuting}
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
