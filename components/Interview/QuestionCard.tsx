'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import type { InterviewQuestion, QuestionOption } from '@/lib/content-types'
import { Button } from '@/components/ui/Button'

interface QuestionCardProps {
  question: InterviewQuestion
  questionNumber: number
  totalQuestions: number
  onAnswer: (answer: string) => void
  disabled?: boolean
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  disabled,
}: QuestionCardProps) {
  const [selected, setSelected] = useState<string[]>([])
  const [customText, setCustomText] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  const handleOptionClick = (optionId: string) => {
    if (disabled) return

    if (question.multiSelect) {
      setSelected((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId]
      )
    } else {
      setSelected([optionId])
    }
  }

  const handleSubmit = () => {
    if (disabled) return

    if (showCustom && customText.trim()) {
      onAnswer(customText.trim())
      return
    }

    if (selected.length === 0) return

    if (question.multiSelect) {
      const labels = selected.map(
        (id) => question.options.find((o) => o.id === id)?.label || id
      )
      if (customText.trim()) labels.push(customText.trim())
      onAnswer(labels.join(', '))
    } else {
      const opt = question.options.find((o) => o.id === selected[0])
      onAnswer(opt?.label || selected[0])
    }
  }

  const canSubmit = showCustom
    ? customText.trim().length > 0
    : selected.length > 0

  return (
    <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
      {/* Progress */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span>Question {questionNumber} of {totalQuestions}</span>
        <div className="flex-1 h-0.5 bg-slate-700 rounded">
          <div
            className="h-full bg-violet-500 rounded transition-all duration-500"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div>
        <h3 className="text-lg font-medium text-slate-100 mb-1">{question.question}</h3>
        {question.hint && (
          <p className="text-sm text-slate-400 mb-3">{question.hint}</p>
        )}
        {question.multiSelect && (
          <p className="text-xs text-violet-300 mb-3">Select all that apply</p>
        )}
      </div>

      {/* Options */}
      <div className="grid gap-2">
        {question.options.map((option) => (
          <OptionButton
            key={option.id}
            option={option}
            selected={selected.includes(option.id)}
            onClick={() => handleOptionClick(option.id)}
            disabled={disabled || showCustom}
          />
        ))}

        {question.allowCustom && (
          <button
            onClick={() => {
              setShowCustom(!showCustom)
              setSelected([])
            }}
            disabled={disabled}
            className={cn(
              'w-full text-left px-4 py-3 rounded-lg border text-sm transition-all duration-150',
              showCustom
                ? 'border-violet-500 bg-violet-500/10 text-violet-200'
                : 'border-slate-600 bg-slate-800/40 text-slate-400 hover:border-slate-400 hover:text-slate-200'
            )}
          >
            <span className="font-mono text-xs opacity-70 mr-2">
              {question.options.length + 1 === 5 ? 'E' :
               question.options.length + 1 === 6 ? 'F' : 'Custom'}
            </span>
            Custom — describe your own
          </button>
        )}
      </div>

      {/* Custom input */}
      {showCustom && (
        <textarea
          className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 resize-none"
          rows={3}
          placeholder="Describe your choice in detail..."
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          autoFocus
        />
      )}

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={!canSubmit || disabled}
        className="w-full"
        size="lg"
      >
        {question.multiSelect && selected.length > 0
          ? `Confirm ${selected.length} selection${selected.length !== 1 ? 's' : ''}`
          : 'Continue →'}
      </Button>
    </div>
  )
}

function OptionButton({
  option,
  selected,
  onClick,
  disabled,
}: {
  option: QuestionOption
  selected: boolean
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full text-left px-4 py-3 rounded-lg border text-sm transition-all duration-150',
        selected
          ? 'border-violet-500 bg-violet-500/15 text-slate-100 shadow shadow-violet-500/20'
          : 'border-slate-600 bg-slate-800/40 text-slate-300 hover:border-slate-400 hover:text-slate-100 hover:bg-slate-700/30',
        disabled && !selected && 'opacity-50 cursor-not-allowed'
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold flex-shrink-0 mt-0.5',
            selected ? 'bg-violet-500 text-white' : 'bg-slate-700 text-slate-400'
          )}
        >
          {option.id}
        </span>
        <div>
          <div className="font-medium">{option.label}</div>
          {option.description && (
            <div className="text-xs text-slate-400 mt-0.5">{option.description}</div>
          )}
        </div>
      </div>
    </button>
  )
}
