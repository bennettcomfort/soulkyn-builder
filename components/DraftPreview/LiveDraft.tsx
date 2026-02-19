'use client'

import React, { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface LiveDraftProps {
  content: string
  isStreaming?: boolean
  className?: string
}

export function LiveDraft({ content, isStreaming = false, className }: LiveDraftProps) {
  const endRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isStreaming && endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [content, isStreaming])

  // Simple markdown-ish rendering (no heavy dep)
  const renderContent = (text: string) => {
    if (!text) {
      return (
        <p className="text-slate-500 italic text-sm">
          Output will appear here as it streams in...
        </p>
      )
    }
    return text.split('\n').map((line, i) => {
      if (line.startsWith('# ')) {
        return (
          <h1 key={i} className="text-xl font-bold text-violet-300 mt-6 mb-2">
            {line.slice(2)}
          </h1>
        )
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={i} className="text-lg font-semibold text-violet-200 mt-5 mb-1.5">
            {line.slice(3)}
          </h2>
        )
      }
      if (line.startsWith('### ')) {
        return (
          <h3 key={i} className="text-base font-semibold text-violet-100 mt-4 mb-1">
            {line.slice(4)}
          </h3>
        )
      }
      if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
        return (
          <p key={i} className="font-bold text-slate-100 mt-2">
            {line.slice(2, -2)}
          </p>
        )
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={i} className="text-slate-300 ml-4 list-disc">
            {line.slice(2)}
          </li>
        )
      }
      if (line.trim() === '') {
        return <br key={i} />
      }
      // Bold inline
      const parts = line.split(/(\*\*[^*]+\*\*|\`[^`]+\`)/g)
      return (
        <p key={i} className="text-slate-300 leading-relaxed">
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="text-slate-100">{part.slice(2, -2)}</strong>
            }
            if (part.startsWith('`') && part.endsWith('`')) {
              return (
                <code key={j} className="bg-slate-700 text-violet-300 px-1 py-0.5 rounded text-sm font-mono">
                  {part.slice(1, -1)}
                </code>
              )
            }
            return part
          })}
        </p>
      )
    })
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'h-full overflow-y-auto p-4 font-mono text-sm leading-relaxed',
        className
      )}
    >
      <div className="space-y-1">
        {renderContent(content)}
        {isStreaming && (
          <span className="inline-block w-2 h-4 bg-violet-400 animate-pulse ml-0.5" />
        )}
      </div>
      <div ref={endRef} />
    </div>
  )
}
