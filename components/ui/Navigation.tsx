'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/', icon: '⬡', label: 'Home' },
  { href: '/build', icon: '⚒', label: 'Build' },
  { href: '/brainstorm', icon: '💡', label: 'Brainstorm' },
  { href: '/images', icon: '🎨', label: 'Images' },
  { href: '/settings', icon: '⚙', label: 'Settings' },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed left-0 top-0 h-screen w-20 bg-[#252526] border-r border-[#3c3c3c] flex flex-col items-center py-5 gap-2 z-50">
      {/* Logo */}
      <div className="w-12 h-12 rounded-xl bg-amber-600 flex items-center justify-center text-white font-bold text-xl mb-4 shadow-lg shadow-amber-500/30">
        S
      </div>

      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href)

        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            className={cn(
              'w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-all duration-150 group relative',
              isActive
                ? 'bg-amber-600/20 text-amber-300 shadow shadow-amber-500/10'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700/50'
            )}
          >
            {item.icon}
            {/* Tooltip */}
            <span className="absolute left-16 bg-slate-800 text-slate-200 text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-slate-700">
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
