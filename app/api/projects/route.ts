import { NextRequest, NextResponse } from 'next/server'
import {
  listSessions,
  createSession,
  loadSession,
  saveSession,
  deleteSession,
  writeFinalOutput,
} from '@/lib/sessions'
import type { ContentType } from '@/lib/budget'

export const runtime = 'nodejs'

export async function GET() {
  const sessions = listSessions()
  return NextResponse.json(sessions)
}

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    type: ContentType
    name: string
    buildMode?: 'interview' | 'freeform' | 'roughdraft'
  }

  if (!body.type || !body.name) {
    return NextResponse.json({ error: 'type and name are required' }, { status: 400 })
  }

  const session = createSession(body.type, body.name, body.buildMode || 'interview')
  return NextResponse.json(session, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { id, ...updates } = body

  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }

  const session = loadSession(id)
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  Object.assign(session, updates)
  saveSession(session)

  // If finalizing, write to Projects/
  if (updates.status === 'complete' && (session.finalContent || session.draftContent)) {
    try {
      writeFinalOutput(session)
    } catch {
      // Non-fatal — file write to workspace is best-effort
    }
  }

  return NextResponse.json(session)
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }

  deleteSession(id)
  return NextResponse.json({ ok: true })
}
