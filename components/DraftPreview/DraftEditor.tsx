'use client'

import React, { useMemo, useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import type { ContentType } from '@/lib/budget'
import type { TagSets } from '@/lib/tag-sets'

interface DraftEditorProps {
  content: string
  onChange: (v: string) => void
  isStreaming?: boolean
  onExecuteComments?: () => void
  isExecuting?: boolean
  tagSets: TagSets
  onTagSetsChange: (v: TagSets) => void
  chatExamples: string[]
  onChatExamplesChange: (v: string[]) => void
  contentType: ContentType
  className?: string
}

export interface DraftEditorHandle {
  scrollToSection: (term: string) => void
}

// ─── Tag set definitions ────────────────────────────────────────────────────

interface TagSetDef {
  key: keyof TagSets
  title: string
  description: string
  titleColor: string
  chipText: string
  chipBg: string
  chipBorder: string
  inputFocus: string
  countOver: string
}

const TAG_SET_DEFS: TagSetDef[] = [
  {
    key: 'physical',
    title: 'Physical Traits',
    description: 'Must be in English — e.g. Very dark skin, Freckles, Tattoo on left arm, Glowing eyes',
    titleColor: 'text-cyan-400',
    chipText: 'text-cyan-300',
    chipBg: 'bg-cyan-500/15',
    chipBorder: 'border-cyan-500/25',
    inputFocus: 'focus:border-cyan-500',
    countOver: 'text-red-400',
  },
  {
    key: 'personality',
    title: 'Personality Tags',
    description: 'Keywords e.g. Shy, Funny, Sarcastic, Empathetic, Brooding',
    titleColor: 'text-amber-400',
    chipText: 'text-amber-300',
    chipBg: 'bg-amber-500/15',
    chipBorder: 'border-amber-500/25',
    inputFocus: 'focus:border-amber-500',
    countOver: 'text-red-400',
  },
  {
    key: 'identity',
    title: 'Identity Tags',
    description: 'Keywords e.g. Loves cats, Vegan, Goblin speech, Coffee addict',
    titleColor: 'text-purple-400',
    chipText: 'text-purple-300',
    chipBg: 'bg-purple-500/15',
    chipBorder: 'border-purple-500/25',
    inputFocus: 'focus:border-purple-500',
    countOver: 'text-red-400',
  },
  {
    key: 'clothing',
    title: 'Clothing Style',
    description: 'Used for image generation and as default clothes in chat scenarios',
    titleColor: 'text-emerald-400',
    chipText: 'text-emerald-300',
    chipBg: 'bg-emerald-500/15',
    chipBorder: 'border-emerald-500/25',
    inputFocus: 'focus:border-emerald-500',
    countOver: 'text-red-400',
  },
  {
    key: 'location',
    title: 'Location',
    description: 'For image generation and as default location in chat scenarios',
    titleColor: 'text-orange-400',
    chipText: 'text-orange-300',
    chipBg: 'bg-orange-500/15',
    chipBorder: 'border-orange-500/25',
    inputFocus: 'focus:border-orange-500',
    countOver: 'text-red-400',
  },
]

const TAG_LIMIT = 18
const CHAT_EXAMPLE_LIMIT = 800

function TagSetField({ def, value, onChange }: { def: TagSetDef; value: string; onChange: (v: string) => void }) {
  const [inputVal, setInputVal] = useState('')

  const tags = value.split(',').map((t) => t.trim()).filter(Boolean)
  const count = tags.length
  const atLimit = count >= TAG_LIMIT

  const commit = (raw: string) => {
    const incoming = raw.split(',').map((t) => t.trim()).filter(Boolean)
    if (incoming.length === 0) return
    const merged = [...tags, ...incoming]
    onChange(merged.join(', '))
    setInputVal('')
  }

  const removeTag = (i: number) => {
    const next = tags.filter((_, idx) => idx !== i)
    onChange(next.join(', '))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      commit(inputVal)
    } else if (e.key === 'Backspace' && inputVal === '' && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val.endsWith(',')) {
      commit(val.slice(0, -1))
    } else {
      setInputVal(val)
    }
  }

  const handleBlur = () => {
    if (inputVal.trim()) commit(inputVal)
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className={cn('text-xs font-semibold', def.titleColor)}>{def.title}</span>
        <span className={cn('text-[10px] font-mono tabular-nums', count > TAG_LIMIT ? def.countOver : atLimit ? def.titleColor : 'text-[#888]')}>
          {count}/{TAG_LIMIT}
        </span>
      </div>

      {/* Description */}
      <p className="text-[11px] text-slate-500 leading-snug">{def.description}</p>

      {/* Tag chips */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag, i) => (
            <span
              key={i}
              className={cn(
                'inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border leading-4',
                i < TAG_LIMIT
                  ? cn(def.chipBg, def.chipText, def.chipBorder)
                  : 'bg-red-500/15 text-red-400 border-red-500/25'
              )}
            >
              {tag}
              <button
                onClick={() => removeTag(i)}
                className="opacity-50 hover:opacity-100 transition-opacity leading-none text-[10px] ml-0.5"
                title="Remove"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <input
        type="text"
        value={inputVal}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        disabled={atLimit}
        placeholder={atLimit ? `Limit reached (${TAG_LIMIT})` : 'Type a tag and press Enter or ,'}
        className={cn(
          'w-full bg-[#3c3c3c] rounded-lg px-2.5 py-1.5 text-xs text-[#cccccc] placeholder-[#666]',
          'focus:outline-none border transition-colors',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          count > TAG_LIMIT ? 'border-red-500/60 focus:border-red-400' : cn('border-[#5a5a5a]', def.inputFocus)
        )}
      />
    </div>
  )
}

// ─── Syntax highlight helpers ────────────────────────────────────────────────

/** Highlight __DOUBLE_UNDERSCORE__ identifiers in a pre-escaped string */
function applyIdents(str: string): string {
  return str.replace(/__[A-Z][A-Z0-9_]*__/g, (m) =>
    `<span style='color:#4ec9b0;'>${m}</span>`
  )
}

/** Build HTML for the highlight layer: line-by-line stateful parser for [Important:] blocks + inline patterns */
function buildHighlight(text: string): string {
  const lines = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .split('\n')

  let inBlock = false

  return lines.map(line => {
    // ── Block opening: [Very Important: Title  or  [Important: Title ──
    const veryMatch = line.match(/^(\[)(very important:)(.*)/i)
    if (veryMatch) {
      inBlock = true
      return `<span style="color:#f472b6;">[</span><span style="color:#f14c4c;">${veryMatch[2]}${applyIdents(veryMatch[3])}</span>`
    }
    const impMatch = line.match(/^(\[)(important:)(.*)/i)
    if (impMatch) {
      inBlock = true
      return `<span style="color:#f472b6;">[</span><span style="color:#dcdcaa;">${impMatch[2]}${applyIdents(impMatch[3])}</span>`
    }

    // ── Block closing: ] ──
    if (/^\]/.test(line)) {
      inBlock = false
      return `<span style="color:#f472b6;">]</span>`
    }

    // ── Inside block: color bullets/arrows/numbers; ident-highlight item text ──
    if (inBlock) {
      const arrowM = line.match(/^(\s*-&gt;)(.*)/)
      if (arrowM) return `<span style="color:#f59e0b;">${arrowM[1]}</span>${applyIdents(arrowM[2])}`
      const dashM = line.match(/^(\s*-)(\s+.*)/)
      if (dashM) return `<span style="color:#f59e0b;">${dashM[1]}</span>${applyIdents(dashM[2])}`
      const numM = line.match(/^(\s*\d+\.)(\s+.*)/)
      if (numM) return `<span style="color:#f59e0b;">${numM[1]}</span>${applyIdents(numM[2])}`
      return applyIdents(line)
    }

    // ── Outside block: ## headers ──
    if (/^#{1,3} /.test(line)) return `<span style="color:#fbbf24;">${applyIdents(line)}</span>`

    // ── Outside block: list items ──
    const outArrowM = line.match(/^(\s*-&gt;)(.*)/)
    if (outArrowM) return `<span style="color:#f59e0b;">${outArrowM[1]}</span>${applyIdents(outArrowM[2])}`
    const outDashM = line.match(/^(\s*-)(\s+.*)/)
    if (outDashM) return `<span style="color:#f59e0b;">${outDashM[1]}</span>${applyIdents(outDashM[2])}`
    const outNumM = line.match(/^(\s*\d+\.)(\s+.*)/)
    if (outNumM) return `<span style="color:#f59e0b;">${outNumM[1]}</span>${applyIdents(outNumM[2])}`

    // ── Outside block: inline patterns + idents ──
    return applyIdents(line).replace(
      /\/\/([\s\S]+?)\/\/|\{\{[^}]*\}\}|\([^)\n]{2,}\)|"[^"\n]+"/g,
      (match) => {
        if (match.startsWith('//')) return `<mark style="color:#f59e0b;background:rgba(245,158,11,0.14);border-radius:3px;padding:0 2px;">${match}</mark>`
        if (match.startsWith('{{')) return `<span style="color:#c586c0;background:rgba(197,134,192,0.10);border-radius:3px;padding:0 2px;">${match}</span>`
        if (match.startsWith('(')) return `<span style="color:#4fc1ff;background:rgba(79,193,255,0.08);border-radius:3px;padding:0 2px;">${match}</span>`
        if (match.startsWith('"')) return `<span style="color:#ce9178;background:rgba(206,145,120,0.08);border-radius:3px;padding:0 2px;">${match}</span>`
        return match
      }
    )
  }).join('\n')
}

// ─── Main component ──────────────────────────────────────────────────────────

export const DraftEditor = forwardRef<DraftEditorHandle, DraftEditorProps>(function DraftEditor({
  content,
  onChange,
  isStreaming = false,
  onExecuteComments,
  isExecuting = false,
  tagSets,
  onTagSetsChange,
  chatExamples,
  onChatExamplesChange,
  contentType,
  className,
}, ref) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)
  const [suppOpen, setSuppOpen] = useState(false)

  useImperativeHandle(ref, () => ({
    scrollToSection(term: string) {
      const ta = textareaRef.current
      if (!ta || !term) return
      const content = ta.value
      const lower = content.toLowerCase()

      const words = term.toLowerCase().split(/[\s&,/]+/).filter((w) => w.length > 3)
      let idx = lower.indexOf(term.toLowerCase())

      if (idx === -1) {
        outer: for (const word of words) {
          for (const prefix of ['\n## ', '\n# ', '\n']) {
            const i = lower.indexOf(prefix + word)
            if (i !== -1) { idx = i + 1; break outer }
          }
        }
      }

      if (idx === -1) return

      const linesBefore = content.slice(0, idx).split('\n').length - 1
      const totalLines = content.split('\n').length || 1
      const scrollTarget = Math.max(0, (ta.scrollHeight * linesBefore) / totalLines - 40)

      ta.scrollTop = scrollTarget
      if (highlightRef.current) highlightRef.current.scrollTop = scrollTarget
      ta.focus()
      ta.setSelectionRange(idx, idx)
    },
  }), [])

  const comments = useMemo(() => {
    const re = /\/\/([\s\S]+?)\/\//g
    const out: string[] = []
    let m
    while ((m = re.exec(content)) !== null) out.push(m[1].trim())
    return out
  }, [content])

  const highlighted = useMemo(() => buildHighlight(content), [content])

  useEffect(() => {
    if (isStreaming && textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight
    }
  }, [content, isStreaming])

  const syncScroll = () => {
    if (highlightRef.current && textareaRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }

  const showCommentBar = comments.length > 0 && !isStreaming

  return (
    <div className={cn('flex flex-col h-full', className)}>

      {/* ── Editor area with highlight overlay ── */}
      <div className="relative flex-1 min-h-0">
        <div
          ref={highlightRef}
          aria-hidden
          className="absolute inset-0 p-4 font-mono text-sm leading-relaxed pointer-events-none overflow-hidden"
          style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#d4d4d4' }}
          dangerouslySetInnerHTML={{ __html: highlighted + '\n' }}
        />
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => onChange(e.target.value)}
          onScroll={syncScroll}
          readOnly={isStreaming}
          className={cn(
            'absolute inset-0 w-full h-full resize-none p-4 font-mono text-sm leading-relaxed',
            'bg-transparent focus:outline-none overflow-y-auto',
            isStreaming && 'cursor-default'
          )}
          style={{
            color: 'transparent',
            caretColor: '#cbd5e1',
            WebkitTextFillColor: 'transparent',
          }}
          spellCheck={false}
        />
        {!content && (
          <div className="absolute top-4 left-4 pointer-events-none font-mono text-sm text-slate-600 italic select-none">
            Output will appear here as it streams in…
          </div>
        )}
        {isStreaming && (
          <div className="absolute bottom-2 left-4 pointer-events-none">
            <span className="inline-block w-2 h-4 bg-amber-400 animate-pulse align-middle" />
          </div>
        )}
      </div>

      {/* ── Comment bar ── */}
      {showCommentBar && (
        <div className="flex-shrink-0 flex items-center justify-between gap-3 px-4 py-2 border-t border-amber-500/25 bg-amber-500/5">
          <span className="text-xs text-amber-400/80">
            {comments.length} instruction {comments.length === 1 ? 'comment' : 'comments'}
          </span>
          {onExecuteComments && (
            <button
              onClick={onExecuteComments}
              disabled={isExecuting}
              className="text-xs px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
            >
              {isExecuting ? (
                <>
                  <span className="w-3 h-3 border border-amber-400 border-t-transparent rounded-full animate-spin" />
                  Executing…
                </>
              ) : (
                <>⚡ Execute {comments.length} {comments.length === 1 ? 'instruction' : 'instructions'}</>
              )}
            </button>
          )}
        </div>
      )}

      {/* ── Supplementary panel ── */}
      <div className="flex-shrink-0 border-t border-[#3c3c3c]">
        <button
          onClick={() => setSuppOpen((o) => !o)}
          className="w-full flex items-center gap-2 px-4 py-2 text-xs text-amber-500 hover:text-amber-300 font-medium transition-colors"
        >
          <span className={cn('transition-transform duration-150', suppOpen ? 'rotate-90' : '')}>▶</span>
          Tag Sets &amp; Chat Examples
        </button>

        {suppOpen && (
          <div className="px-4 pb-6 space-y-6 max-h-[70vh] overflow-y-auto">

            {/* ── Tag Sets ── */}
            <div className="space-y-5">
              <p className="text-xs font-semibold text-amber-500 uppercase tracking-wider pt-1">Tag Sets</p>
              {TAG_SET_DEFS.map((def) => (
                <TagSetField
                  key={def.key}
                  def={def}
                  value={tagSets[def.key]}
                  onChange={(v) => onTagSetsChange({ ...tagSets, [def.key]: v })}
                />
              ))}
            </div>

            {/* ── Divider ── */}
            <div className="border-t border-[#3c3c3c]" />

            {/* ── Chat Examples ── */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Chat Examples</p>
              {[0, 1, 2, 3].map((idx) => {
                const val = chatExamples[idx] ?? ''
                const len = val.length
                const over = len > CHAT_EXAMPLE_LIMIT
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] text-amber-400/70">Example {idx + 1}</label>
                      <span className={cn('text-[10px] font-mono tabular-nums', over ? 'text-red-400' : 'text-[#888]')}>
                        {len}/{CHAT_EXAMPLE_LIMIT}
                      </span>
                    </div>
                    <textarea
                      value={val}
                      onChange={(e) => {
                        const next = [...chatExamples] as string[]
                        next[idx] = e.target.value
                        onChatExamplesChange(next)
                      }}
                      rows={4}
                      placeholder={`Chat example ${idx + 1}…`}
                      className={cn(
                        'w-full bg-[#3c3c3c] rounded-lg p-2 text-xs text-[#cccccc] placeholder-[#666] focus:outline-none resize-none font-mono border',
                        over ? 'border-red-500/60 focus:border-red-400' : 'border-[#5a5a5a] focus:border-amber-500'
                      )}
                    />
                  </div>
                )
              })}
            </div>

          </div>
        )}
      </div>
    </div>
  )
})
