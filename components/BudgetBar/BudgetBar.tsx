'use client'

import React from 'react'
import { calculateBudget, getZoneColor, getZoneLabel, type BudgetZone } from '@/lib/budget'
import { cn } from '@/lib/utils'

interface BudgetBarProps {
  used: number
  limit: number
  label?: string
  compact?: boolean
}

function ZoneIndicator({ zone }: { zone: BudgetZone }) {
  const colors: Record<BudgetZone, string> = {
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    red: 'text-red-400',
    over: 'text-red-500 animate-pulse',
  }
  return (
    <span className={cn('text-xs font-medium', colors[zone])}>
      {getZoneLabel(zone)}
    </span>
  )
}

export function BudgetBar({ used, limit, label, compact = false }: BudgetBarProps) {
  const budget = calculateBudget(used, limit)

  const barColor =
    budget.zone === 'green'
      ? 'bg-green-500'
      : budget.zone === 'yellow'
      ? 'bg-yellow-500'
      : 'bg-red-500'

  const trackColor =
    budget.zone === 'green'
      ? 'bg-green-500/10'
      : budget.zone === 'yellow'
      ? 'bg-yellow-500/10'
      : 'bg-red-500/10'

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {label && <span className="text-xs text-slate-400">{label}</span>}
        <div className={cn('h-1.5 rounded-full flex-1', trackColor)}>
          <div
            className={cn('h-full rounded-full transition-all duration-300', barColor)}
            style={{ width: `${Math.min(budget.percentage, 100)}%` }}
          />
        </div>
        <span className="text-xs text-slate-400 tabular-nums w-28 text-right">
          {used.toLocaleString()}/{limit.toLocaleString()}
        </span>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-300">
            {label || 'Character Budget'}
          </span>
          <ZoneIndicator zone={budget.zone} />
        </div>
        <span className="text-sm tabular-nums text-slate-300">
          <span
            className={cn({
              'text-green-400': budget.zone === 'green',
              'text-yellow-400': budget.zone === 'yellow',
              'text-red-400': budget.zone === 'red' || budget.zone === 'over',
            })}
          >
            {used.toLocaleString()}
          </span>
          <span className="text-slate-500"> / </span>
          <span>{limit.toLocaleString()}</span>
        </span>
      </div>

      <div className={cn('h-2.5 rounded-full overflow-hidden', trackColor)}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', barColor)}
          style={{ width: `${Math.min(budget.percentage, 100)}%` }}
        />
      </div>

      <div className="flex justify-between mt-1.5">
        <span className="text-xs text-slate-500">{budget.percentage.toFixed(1)}% used</span>
        <span className="text-xs text-slate-500">
          {budget.remaining > 0
            ? `${budget.remaining.toLocaleString()} remaining`
            : `${Math.abs(budget.remaining).toLocaleString()} over limit`}
        </span>
      </div>
    </div>
  )
}
