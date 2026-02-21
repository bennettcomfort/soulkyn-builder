'use client'

import React, { useState, useMemo } from 'react'
import { getSchema, type SectionGuideItem } from '@/lib/content-types'
import { cn } from '@/lib/utils'
import type { ContentType } from '@/lib/budget'

const TYPE_COLOR: Record<ContentType, { dot: string; header: string; name: string; badge: string; focus: string; border: string; hoverName: string }> = {
  RPG: { dot: 'bg-orange-500',   header: 'text-orange-400',   name: 'text-orange-300',   badge: 'bg-orange-500/15 text-orange-400',   focus: 'focus:border-orange-500',   border: 'border-orange-500/40',   hoverName: 'hover:text-orange-200' },
  SC:  { dot: 'bg-amber-500',   header: 'text-amber-400',   name: 'text-amber-300',   badge: 'bg-amber-500/15 text-amber-400',   focus: 'focus:border-amber-500',   border: 'border-amber-500/40',   hoverName: 'hover:text-amber-200' },
  DLL: { dot: 'bg-cyan-500',    header: 'text-cyan-400',    name: 'text-cyan-300',    badge: 'bg-cyan-500/15 text-cyan-400',    focus: 'focus:border-cyan-500',    border: 'border-cyan-500/40',    hoverName: 'hover:text-cyan-200' },
  WRL: { dot: 'bg-emerald-500', header: 'text-emerald-400', name: 'text-emerald-300', badge: 'bg-emerald-500/15 text-emerald-400', focus: 'focus:border-emerald-500', border: 'border-emerald-500/40', hoverName: 'hover:text-emerald-200' },
}

interface TypeStructureGuideProps {
  type: ContentType
  defaultOpen?: boolean
  className?: string
  onSectionClick?: (sectionName: string) => void
  /** Second arg is context/notes, third is formatting instructions (both may be empty) */
  onAddSection?: (item: SectionGuideItem, notes: string, instructions: string) => Promise<void>
}

// ─── Syntax highlighter ──────────────────────────────────────────────────────
// Produces HTML string from pseudo-code syntax reference text.

function escapeSyntaxHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function highlightSyntax(raw: string): string {
  const escaped = escapeSyntaxHtml(raw)
  const lines = escaped.split('\n')

  return lines.map((line) => {
    // # comment lines → green
    if (/^\s*#/.test(line)) {
      return `<span style='color:#6a9955;'>${line}</span>`
    }

    // [VERY IMPORTANT: ...] opening bracket lines
    const veryImpM = line.match(/^(\[)(VERY IMPORTANT:)(.*)/i)
    if (veryImpM) {
      return (
        `<span style='color:#f472b6;'>[</span>` +
        `<span style='color:#f14c4c;font-weight:600;'>VERY IMPORTANT:</span>` +
        highlightInline(veryImpM[3])
      )
    }
    const impM = line.match(/^(\[)(IMPORTANT:|Important:)(.*)/i)
    if (impM) {
      return (
        `<span style='color:#f472b6;'>[</span>` +
        `<span style='color:#dcdcaa;font-weight:600;'>${impM[2]}</span>` +
        highlightInline(impM[3])
      )
    }
    // Standalone ] closing bracket
    if (/^\]/.test(line)) {
      return `<span style='color:#f472b6;'>]</span>${line.slice(1)}`
    }
    // [LoadLibrary: ...] opening
    if (/^\[LoadLibrary:/.test(line)) {
      return `<span style='color:#f472b6;'>[</span><span style='color:#dcdcaa;font-weight:600;'>LoadLibrary:</span>${highlightInline(line.slice(13))}`
    }
    // [Scenario: ...] or other [Label: ...] brackets
    const bracketLabelM = line.match(/^(\[)([A-Za-z][^:\n]*:)(.*)/)
    if (bracketLabelM) {
      return (
        `<span style='color:#f472b6;'>[</span>` +
        `<span style='color:#dcdcaa;'>${bracketLabelM[2]}</span>` +
        highlightInline(bracketLabelM[3])
      )
    }
    // | table rows
    if (/^\s*\|/.test(line)) {
      return line
        .replace(/\|/g, `<span style='color:#888;'>|</span>`)
        .replace(/__[A-Z][A-Z0-9_]*__/g, (m) => `<span style='color:#4ec9b0;'>${m}</span>`)
    }
    // ├─ └─ tree characters
    if (/^\s*[├└]/.test(line)) {
      const splitAt = line.search(/[^├└─\s]/)
      return `<span style='color:#888;'>${line.slice(0, splitAt)}</span>${highlightInline(line.slice(splitAt))}`
    }
    // Numbered items: 1. 1a. 2. etc.
    const numM = line.match(/^(\s*\d+[a-z]?\.)(\s+.*)/)
    if (numM) {
      return `<span style='color:#f59e0b;'>${numM[1]}</span>${highlightInline(numM[2])}`
    }
    // Bullet - items
    const dashM = line.match(/^(\s*-)(\s+.*)/)
    if (dashM) {
      return `<span style='color:#f59e0b;'>${dashM[1]}</span>${highlightInline(dashM[2])}`
    }
    // # OPTION A/B/C/D headers
    if (/^# OPTION [A-D]/.test(line)) {
      return `<span style='color:#c586c0;font-weight:600;'>${line}</span>`
    }
    // MANDATORY / OPTIONAL / CHOOSE ONE keywords at line start
    const keywordM = line.match(/^(\s*)(MANDATORY|OPTIONAL|CHOOSE ONE|Choose ONE|Integration level:)(.*)/)
    if (keywordM) {
      return `${keywordM[1]}<span style='color:#dcdcaa;font-weight:600;'>${keywordM[2]}</span>${highlightInline(keywordM[3])}`
    }

    return highlightInline(line)
  }).join('\n')
}

function highlightInline(segment: string): string {
  // __VARIABLE__ → teal (single-quote style to avoid collision with "string" pattern)
  let out = segment.replace(/__[A-Z][A-Z0-9_]*__/g, (m) =>
    `<span style='color:#4ec9b0;'>${m}</span>`
  )
  // "quoted strings" → rust (matches &quot;...&quot; after HTML escaping, or raw "..." not inside spans)
  out = out.replace(/&quot;([^&<\n]+)&quot;/g, (_, inner) =>
    `<span style='color:#ce9178;'>&quot;${inner}&quot;</span>`
  )
  // *italic* → light blue
  out = out.replace(/\*([^*<\n]+)\*/g, (_, inner) =>
    `<span style='color:#4fc1ff;'>*${inner}*</span>`
  )
  // /commands → violet (negative lookbehind prevents matching </span>, </div>, etc.)
  out = out.replace(/(?<!<)\/[a-z_]+/gi, (m) =>
    `<span style='color:#c586c0;'>${m}</span>`
  )
  return out
}

// ─── Component ───────────────────────────────────────────────────────────────

export function TypeStructureGuide({
  type,
  defaultOpen = true,
  className,
  onSectionClick,
  onAddSection,
}: TypeStructureGuideProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [loadingSection, setLoadingSection] = useState<string | null>(null)

  // Modal state
  const [modal, setModal] = useState<SectionGuideItem | null>(null)
  const [modalNotes, setModalNotes] = useState('')
  const [modalInstructions, setModalInstructions] = useState('')
  const [syntaxOpen, setSyntaxOpen] = useState(false)

  const schema = getSchema(type)
  const colors = TYPE_COLOR[type]

  const openModal = (item: SectionGuideItem) => {
    setModal(item)
    setModalNotes('')
    setModalInstructions('')
    setSyntaxOpen(false)
  }

  const closeModal = () => {
    setModal(null)
    setModalNotes('')
    setModalInstructions('')
    setSyntaxOpen(false)
  }

  const handleJump = () => {
    if (!modal) return
    onSectionClick?.(modal.name)
    closeModal()
  }

  const handleGenerate = async () => {
    if (!modal || !onAddSection || loadingSection) return
    setLoadingSection(modal.name)
    try {
      await onAddSection(modal, modalNotes, modalInstructions)
      closeModal()
    } finally {
      setLoadingSection(null)
    }
  }

  // Pre-compute syntax HTML when modal opens
  const syntaxHtml = useMemo(() => {
    if (!modal?.syntax) return ''
    return highlightSyntax(modal.syntax)
  }, [modal?.syntax])

  return (
    <>
      <div className={cn('flex flex-col h-full', className)}>
        {/* Header / toggle */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex-shrink-0 w-full flex items-center gap-2.5 px-4 py-3 bg-[#2d2d2d] hover:bg-[#333333] transition-colors text-left border-b border-[#3c3c3c]"
        >
          <span className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', colors.dot)} />
          <span className={cn('text-sm font-bold tracking-wide', colors.header)}>
            {type} — {schema.label}
          </span>
          <span className="text-slate-500 text-xs ml-auto">{schema.sectionGuide.length} sections</span>
          <span className={cn('text-slate-500 text-xs transition-transform duration-150', open ? 'rotate-90' : '')}>▶</span>
        </button>

        {/* Section list */}
        {open && (
          <div className="divide-y divide-[#3c3c3c] flex-1">
            {schema.sectionGuide.map((item, i) => {
              const isLoading = loadingSection === item.name

              return (
                <div key={i} className={cn('px-4 pt-3 pb-2.5', item.optional && 'opacity-50')}>
                  <div className="flex items-start gap-3">
                    {/* Number circle */}
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#3c3c3c] flex items-center justify-center text-xs font-mono text-slate-500 mt-0.5">
                      {i + 1}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Section name */}
                        <button
                          onClick={() => openModal(item)}
                          title="Open section options"
                          className={cn(
                            'text-sm font-semibold text-left focus:outline-none transition-colors underline-offset-2',
                            item.optional
                              ? 'text-slate-500 italic hover:text-slate-400'
                              : cn(colors.name, colors.hoverName, 'hover:underline')
                          )}
                        >
                          {item.name}
                        </button>

                        {item.optional && (
                          <span className="text-[10px] text-slate-500 bg-[#3c3c3c] px-1.5 py-0.5 rounded">optional</span>
                        )}
                        {item.budgetNote && (
                          <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-mono', colors.badge)}>
                            {item.budgetNote}
                          </span>
                        )}

                        {/* Add button */}
                        {onAddSection && (
                          <button
                            onClick={() => openModal(item)}
                            disabled={!!loadingSection}
                            className="ml-auto flex-shrink-0 text-xs px-2.5 py-0.5 rounded border border-[#5a5a5a] text-slate-400 hover:border-amber-500 hover:text-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            {isLoading ? (
                              <span className="inline-flex items-center gap-1">
                                <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                                Adding…
                              </span>
                            ) : '+ Add'}
                          </button>
                        )}
                      </div>

                      {/* Short human-readable hint */}
                      <p className="text-xs text-slate-400 leading-snug mt-1">{item.hint}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal overlay */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />

          {/* Modal panel */}
          <div className={cn(
            'relative w-full max-w-lg rounded-2xl border bg-[#252526] shadow-2xl flex flex-col',
            'max-h-[90vh]',
            colors.border
          )}>
            {/* Modal header */}
            <div className="flex-shrink-0 flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-[#3c3c3c]">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={cn('w-2 h-2 rounded-full flex-shrink-0', colors.dot)} />
                  <h3 className={cn('font-bold text-base', colors.name)}>{modal.name}</h3>
                  {modal.optional && (
                    <span className="text-[10px] text-[#888] bg-[#3c3c3c] px-1.5 py-0.5 rounded">optional</span>
                  )}
                  {modal.budgetNote && (
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-mono', colors.badge)}>
                      {modal.budgetNote}
                    </span>
                  )}
                </div>
                {/* Human-readable description */}
                <p className="text-sm text-slate-300 leading-relaxed">{modal.hint}</p>
              </div>
              <button
                onClick={closeModal}
                className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors text-lg leading-none mt-0.5"
              >
                ×
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              {/* Syntax reference — collapsible */}
              {modal.syntax && (
                <div className="border-b border-[#3c3c3c]">
                  <button
                    onClick={() => setSyntaxOpen((o) => !o)}
                    className="w-full flex items-center gap-2 px-5 py-2.5 text-left hover:bg-[#2d2d2d] transition-colors group"
                  >
                    <span className={cn(
                      'text-[10px] font-mono font-semibold uppercase tracking-widest transition-colors',
                      syntaxOpen ? 'text-slate-400' : 'text-slate-600 group-hover:text-slate-500'
                    )}>
                      Syntax Reference
                    </span>
                    <span className={cn(
                      'text-[10px] text-slate-600 group-hover:text-slate-500 transition-all duration-150 ml-auto',
                      syntaxOpen ? 'rotate-90' : ''
                    )}>▶</span>
                  </button>

                  {syntaxOpen && (
                    <div className="px-5 pb-4">
                      <pre
                        className="text-[11px] leading-[1.65] font-mono bg-[#1e1e1e] rounded-xl p-3.5 overflow-x-auto whitespace-pre-wrap break-words border border-[#333]"
                        dangerouslySetInnerHTML={{ __html: syntaxHtml }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Notes + Instructions area */}
              <div className="px-5 py-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">
                    Notes
                    <span className="ml-1 text-slate-600 font-normal">(content / context to include)</span>
                  </label>
                  <textarea
                    autoFocus
                    rows={5}
                    value={modalNotes}
                    onChange={(e) => setModalNotes(e.target.value)}
                    placeholder={`e.g. specific details for "${modal.name}" — names, ages, traits, constraints, tone preferences…`}
                    className={cn(
                      'w-full bg-[#3c3c3c] border border-[#5a5a5a] rounded-xl px-3.5 py-3',
                      'text-sm text-slate-200 placeholder-[#666] resize-none focus:outline-none leading-relaxed',
                      colors.focus
                    )}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">
                    Instructions
                    <span className="ml-1 text-slate-600 font-normal">(how to format or write it — leave blank for default)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={modalInstructions}
                    onChange={(e) => setModalInstructions(e.target.value)}
                    placeholder="e.g. turn this into bullets, be short on characters, write in first person…"
                    className={cn(
                      'w-full bg-[#3c3c3c] border border-[#5a5a5a] rounded-xl px-3.5 py-3',
                      'text-sm text-slate-200 placeholder-[#666] resize-none focus:outline-none leading-relaxed',
                      colors.focus
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 flex items-center justify-between gap-3 px-5 pb-5 pt-2 border-t border-[#3c3c3c]">
              {onSectionClick ? (
                <button
                  onClick={handleJump}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors underline underline-offset-2"
                >
                  Jump to section in draft
                </button>
              ) : (
                <div />
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={closeModal}
                  className="px-3 py-1.5 text-xs rounded-lg border border-[#5a5a5a] text-slate-400 hover:border-[#777] hover:text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                {onAddSection && (
                  <button
                    onClick={handleGenerate}
                    disabled={!!loadingSection}
                    className={cn(
                      'px-4 py-1.5 text-xs rounded-lg font-medium transition-colors flex items-center gap-1.5',
                      'bg-amber-600 text-white hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                  >
                    {loadingSection ? (
                      <>
                        <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                        Generating…
                      </>
                    ) : (
                      'Generate section'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
