'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  id: string
}

interface ChatInterfaceProps {
  messages: ChatMessage[]
  onSend: (message: string) => void
  isStreaming?: boolean
  placeholder?: string
  systemPrompt?: string
  className?: string
  onSaveNote?: (content: string) => void
  showSaveNote?: boolean
}

export function ChatInterface({
  messages,
  onSend,
  isStreaming = false,
  placeholder = 'Type a message...',
  className,
  onSaveNote,
  showSaveNote = false,
}: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const [selectedText, setSelectedText] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  const handleSend = useCallback(() => {
    const text = input.trim()
    if (!text || isStreaming) return
    onSend(text)
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [input, isStreaming, onSend])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`
  }

  const handleTextSelect = (content: string) => {
    const selection = window.getSelection()?.toString().trim()
    if (selection) setSelectedText(selection)
    else setSelectedText(content)
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-slate-500 text-sm py-12">
            Start the conversation...
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'flex gap-3',
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-1">
                S
              </div>
            )}

            <div
              className={cn(
                'max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'bg-violet-600/30 text-slate-100 border border-violet-500/30'
                  : 'bg-slate-800 text-slate-200 border border-slate-700/50'
              )}
              onMouseUp={() => handleTextSelect(msg.content)}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {msg.role === 'assistant' && showSaveNote && onSaveNote && (
                <button
                  onClick={() => onSaveNote(msg.content)}
                  className="mt-2 text-xs text-violet-400 hover:text-violet-300 transition-colors"
                >
                  + Save as note
                </button>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-1">
                U
              </div>
            )}
          </div>
        ))}

        {isStreaming && messages[messages.length - 1]?.role === 'assistant' && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              S
            </div>
            <div className="flex items-center gap-1 px-4 py-3 bg-slate-800 rounded-xl border border-slate-700/50">
              <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-slate-700/50 p-4">
        <div className="flex gap-3 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isStreaming}
            rows={1}
            className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 resize-none disabled:opacity-50 transition-colors"
            style={{ minHeight: '44px', maxHeight: '200px' }}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            size="md"
            className="h-11 px-5 flex-shrink-0"
          >
            {isStreaming ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              '↑'
            )}
          </Button>
        </div>
        <p className="text-xs text-slate-600 mt-2">Enter to send · Shift+Enter for newline</p>
      </div>
    </div>
  )
}
