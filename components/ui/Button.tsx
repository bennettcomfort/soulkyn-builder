'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-amber-600 hover:bg-amber-500 text-white focus:ring-amber-500 shadow-lg shadow-amber-500/20':
            variant === 'primary',
          'bg-slate-700 hover:bg-slate-600 text-slate-100 focus:ring-slate-500':
            variant === 'secondary',
          'bg-transparent hover:bg-slate-700/50 text-slate-300 hover:text-slate-100 focus:ring-slate-500':
            variant === 'ghost',
          'bg-red-600/80 hover:bg-red-600 text-white focus:ring-red-500':
            variant === 'danger',
          'border border-slate-600 hover:border-slate-400 bg-transparent text-slate-300 hover:text-slate-100 focus:ring-slate-500':
            variant === 'outline',
        },
        {
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-sm': size === 'md',
          'px-6 py-3 text-base': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
