export type BudgetZone = 'green' | 'yellow' | 'red' | 'over'

export interface BudgetInfo {
  used: number
  limit: number
  remaining: number
  percentage: number
  zone: BudgetZone
}

export const TYPE_LIMITS = {
  RPG: { background: 7000, chatExample: 700, chatExampleCount: 4 },
  SC: { total: 7000, chatExample: 700, chatExampleCount: 4 },
  DLL: { total: 7000, chatExample: 700, chatExampleCount: 4 },
  WRL: { intro: 800, lore: 6000, total: 7000, chatExample: 700, chatExampleCount: 4 },
} as const

export type ContentType = keyof typeof TYPE_LIMITS

export function calculateBudget(used: number, limit: number): BudgetInfo {
  const remaining = limit - used
  const percentage = Math.min((used / limit) * 100, 100)

  let zone: BudgetZone
  if (used > limit) {
    zone = 'over'
  } else if (percentage >= 90) {
    zone = 'red'
  } else if (percentage >= 75) {
    zone = 'yellow'
  } else {
    zone = 'green'
  }

  return { used, limit, remaining, percentage, zone }
}

export function getZoneColor(zone: BudgetZone): string {
  switch (zone) {
    case 'green': return '#22c55e'
    case 'yellow': return '#eab308'
    case 'red': return '#ef4444'
    case 'over': return '#dc2626'
  }
}

export function getZoneLabel(zone: BudgetZone): string {
  switch (zone) {
    case 'green': return 'On track'
    case 'yellow': return 'Getting full'
    case 'red': return 'Nearly full — compress'
    case 'over': return 'OVER LIMIT'
  }
}

export function getTotalLimit(type: ContentType): number {
  const limits = TYPE_LIMITS[type]
  if ('total' in limits) return limits.total
  if ('background' in limits) return limits.background
  return 7000
}

export function countChars(text: string): number {
  return text.length
}
