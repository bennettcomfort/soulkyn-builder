import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean
}

export function Card({ glow, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-slate-800/60 border border-slate-700/50 rounded-xl backdrop-blur-sm',
        glow && 'shadow-lg shadow-violet-500/10',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
