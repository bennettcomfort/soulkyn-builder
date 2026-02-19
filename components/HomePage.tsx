'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card } from './ui/Card'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import type { Session } from '@/lib/sessions'
import type { ContentType } from '@/lib/budget'
import { calculateBudget, getTotalLimit } from '@/lib/budget'
import { cn } from '@/lib/utils'

const TYPE_COLORS: Record<ContentType, 'rpg' | 'sc' | 'dll' | 'wrl'> = {
  RPG: 'rpg',
  SC: 'sc',
  DLL: 'dll',
  WRL: 'wrl',
}

const QUICK_ACTIONS = [
  {
    href: '/build',
    icon: '⚒',
    title: 'New Build',
    description: 'Start a new RPG, SC, DLL, or WRL persona',
    color: 'from-violet-500/20 to-violet-600/5',
    border: 'hover:border-violet-500/50',
  },
  {
    href: '/brainstorm',
    icon: '💡',
    title: 'Brainstorm',
    description: 'Explore ideas before committing to a build',
    color: 'from-blue-500/20 to-blue-600/5',
    border: 'hover:border-blue-500/50',
  },
  {
    href: '/images',
    icon: '🎨',
    title: 'Image Prompts',
    description: 'Generate optimized image prompts for Soulkyn',
    color: 'from-pink-500/20 to-pink-600/5',
    border: 'hover:border-pink-500/50',
  },
]

export function HomePage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((data) => {
        setSessions(Array.isArray(data) ? data : [])
      })
      .catch(() => setSessions([]))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return
    await fetch(`/api/projects?id=${id}`, { method: 'DELETE' })
    setSessions((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-violet-500/30">
            S
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Soulkyn Builder</h1>
            <p className="text-sm text-slate-400">AI-powered persona creation studio</p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={cn(
              'block p-5 rounded-xl border border-slate-700/50 bg-gradient-to-br transition-all duration-200 group',
              action.color,
              action.border
            )}
          >
            <div className="text-2xl mb-3">{action.icon}</div>
            <h3 className="font-semibold text-slate-100 mb-1 group-hover:text-white">
              {action.title}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">{action.description}</p>
          </Link>
        ))}
      </div>

      {/* Recent projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-200">Recent Projects</h2>
          <Link href="/build">
            <Button variant="outline" size="sm">+ New Project</Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-slate-500 text-sm py-8 text-center">Loading...</div>
        ) : sessions.length === 0 ? (
          <Card className="py-12 text-center">
            <p className="text-slate-400 text-sm mb-4">No projects yet</p>
            <Link href="/build">
              <Button size="sm">Start your first build</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => (
              <SessionRow
                key={session.id}
                session={session}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SessionRow({
  session,
  onDelete,
}: {
  session: Session
  onDelete: (id: string) => void
}) {
  const limit = getTotalLimit(session.type)
  const budget = calculateBudget(session.budgetUsed, limit)

  const statusLabel =
    session.status === 'complete'
      ? 'Complete'
      : session.status === 'draft'
      ? 'Draft'
      : 'In Progress'

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/30 hover:border-slate-600/50 transition-all group">
      <Badge variant={TYPE_COLORS[session.type]}>{session.type}</Badge>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-200 truncate">{session.name}</span>
          <Badge
            variant={
              session.status === 'complete'
                ? 'success'
                : session.status === 'draft'
                ? 'default'
                : 'warning'
            }
            className="text-xs"
          >
            {statusLabel}
          </Badge>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-slate-500">
            {new Date(session.updatedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          <span className="text-xs text-slate-500">
            {session.budgetUsed.toLocaleString()}/{limit.toLocaleString()} chars
            ({budget.percentage.toFixed(0)}%)
          </span>
        </div>
      </div>

      {/* Budget mini bar */}
      <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            budget.zone === 'green'
              ? 'bg-green-500'
              : budget.zone === 'yellow'
              ? 'bg-yellow-500'
              : 'bg-red-500'
          )}
          style={{ width: `${Math.min(budget.percentage, 100)}%` }}
        />
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link href={`/build/${session.id}`}>
          <Button variant="outline" size="sm">
            {session.status === 'complete' ? 'View' : 'Continue'}
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(session.id)}
          className="text-red-400 hover:text-red-300"
        >
          ✕
        </Button>
      </div>
    </div>
  )
}
