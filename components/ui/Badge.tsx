import React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'rpg' | 'sc' | 'dll' | 'wrl' | 'success' | 'warning' | 'error'
}

const VARIANTS = {
  default: 'bg-slate-700 text-slate-300',
  rpg: 'bg-violet-500/20 text-violet-300 border border-violet-500/40',
  sc: 'bg-pink-500/20 text-pink-300 border border-pink-500/40',
  dll: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
  wrl: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
  success: 'bg-green-500/20 text-green-300 border border-green-500/40',
  warning: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40',
  error: 'bg-red-500/20 text-red-300 border border-red-500/40',
}

export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium',
        VARIANTS[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
