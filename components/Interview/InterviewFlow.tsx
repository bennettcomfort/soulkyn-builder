'use client'

import React, { useState, useCallback } from 'react'
import { QuestionCard } from './QuestionCard'
import type { TypeSchema } from '@/lib/content-types'

interface InterviewFlowProps {
  schema: TypeSchema
  onComplete: (answers: Record<string, string>) => void
  initialAnswers?: Record<string, string>
}

export function InterviewFlow({ schema, onComplete, initialAnswers = {} }: InterviewFlowProps) {
  const [currentStep, setCurrentStep] = useState(
    Object.keys(initialAnswers).length
  )
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const questions = schema.questions
  const currentQuestion = questions[currentStep]

  const handleAnswer = useCallback(
    (answer: string) => {
      if (isTransitioning) return

      const questionId = currentQuestion.id
      const newAnswers = { ...answers, [questionId]: answer }
      setAnswers(newAnswers)
      setIsTransitioning(true)

      setTimeout(() => {
        setIsTransitioning(false)
        if (currentStep + 1 >= questions.length) {
          onComplete(newAnswers)
        } else {
          setCurrentStep(currentStep + 1)
        }
      }, 200)
    },
    [currentStep, questions, answers, currentQuestion, onComplete, isTransitioning]
  )

  if (currentStep >= questions.length) {
    return (
      <div className="text-center py-8 text-slate-400">
        Interview complete — generating...
      </div>
    )
  }

  return (
    <div
      className="transition-opacity duration-200"
      style={{ opacity: isTransitioning ? 0 : 1 }}
    >
      <QuestionCard
        question={currentQuestion}
        questionNumber={currentStep + 1}
        totalQuestions={questions.length}
        onAnswer={handleAnswer}
        disabled={isTransitioning}
      />

      {/* Previous answers summary */}
      {currentStep > 0 && (
        <div className="mt-6 space-y-1">
          <p className="text-xs text-slate-500 mb-2">Previous answers:</p>
          {questions.slice(0, currentStep).map((q) => (
            <div key={q.id} className="flex gap-2 text-xs text-slate-500">
              <span className="text-slate-600">Q{q.id.slice(1)}:</span>
              <span className="text-slate-400">{answers[q.id]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
