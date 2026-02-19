import type { Metadata } from 'next'
import './globals.css'
import { Navigation } from '@/components/ui/Navigation'

export const metadata: Metadata = {
  title: 'Soulkyn Builder',
  description: 'Create AI-powered interactive personas for the Soulkyn platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-[#0d0f1a] text-slate-200 min-h-screen antialiased">
        <div className="flex min-h-screen">
          <Navigation />
          <main className="flex-1 ml-16 min-h-screen">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
