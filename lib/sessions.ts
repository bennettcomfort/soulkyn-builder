import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import type { ContentType } from './budget'
import { TYPE_SCHEMAS } from './content-types'
export type { TagSets } from './tag-sets'
export { DEFAULT_TAG_SETS } from './tag-sets'
import { DEFAULT_TAG_SETS } from './tag-sets'
import type { TagSets } from './tag-sets'
import { generateExportMarkdown, exportFilename } from './export'

export type SessionStatus = 'in_progress' | 'complete' | 'draft'
export type BuildMode = 'interview' | 'freeform' | 'roughdraft' | 'chat'

export interface Session {
  id: string
  type: ContentType
  name: string
  status: SessionStatus
  buildMode: BuildMode
  interviewAnswers: Record<string, string>
  draftContent: string
  finalContent: string | null
  budgetUsed: number
  currentStep: number
  brainstormNotes?: string
  tagSets: TagSets
  chatExamples: string[]
  createdAt: string
  updatedAt: string
}

const SESSIONS_DIR = path.join(process.cwd(), 'data', 'sessions')

function ensureDir() {
  if (!fs.existsSync(SESSIONS_DIR)) {
    fs.mkdirSync(SESSIONS_DIR, { recursive: true })
  }
}

export function createSession(
  type: ContentType,
  name: string,
  buildMode: BuildMode = 'interview'
): Session {
  const now = new Date().toISOString()
  const session: Session = {
    id: uuidv4(),
    type,
    name,
    status: 'in_progress',
    buildMode,
    interviewAnswers: {},
    draftContent: TYPE_SCHEMAS[type].draftTemplate ?? '',
    finalContent: null,
    budgetUsed: 0,
    currentStep: 0,
    tagSets: { ...DEFAULT_TAG_SETS },
    chatExamples: ['', '', '', ''],
    createdAt: now,
    updatedAt: now,
  }
  saveSession(session)
  return session
}

export function loadSession(id: string): Session | null {
  ensureDir()
  const filePath = path.join(SESSIONS_DIR, `${id}.json`)
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8')
      const parsed = JSON.parse(raw) as Session
      // Migrate old string tagSets to structured object
      if (typeof (parsed.tagSets as unknown) === 'string') {
        parsed.tagSets = { ...DEFAULT_TAG_SETS }
      }
      return parsed
    }
  } catch {
    // ignore
  }
  return null
}

export function saveSession(session: Session): void {
  ensureDir()
  session.updatedAt = new Date().toISOString()
  const filePath = path.join(SESSIONS_DIR, `${session.id}.json`)
  fs.writeFileSync(filePath, JSON.stringify(session, null, 2))
}

export function listSessions(): Session[] {
  ensureDir()
  try {
    return fs
      .readdirSync(SESSIONS_DIR)
      .filter((f) => f.endsWith('.json'))
      .map((f) => {
        try {
          const raw = fs.readFileSync(path.join(SESSIONS_DIR, f), 'utf-8')
          return JSON.parse(raw) as Session
        } catch {
          return null
        }
      })
      .filter((s): s is Session => s !== null)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  } catch {
    return []
  }
}

export function deleteSession(id: string): void {
  ensureDir()
  const filePath = path.join(SESSIONS_DIR, `${id}.json`)
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }
}

export function writeFinalOutput(session: Session): void {
  const projectsDir = path.join(
    process.cwd(),
    '..',
    'Soulkyn Claude',
    'Projects',
    session.name.replace(/[^a-zA-Z0-9-_]/g, '-')
  )
  if (!fs.existsSync(projectsDir)) {
    fs.mkdirSync(projectsDir, { recursive: true })
  }
  const markdown = generateExportMarkdown({
    name: session.name,
    draftContent: session.draftContent,
    finalContent: session.finalContent,
    tagSets: session.tagSets,
    chatExamples: session.chatExamples,
  })
  const finalPath = path.join(projectsDir, exportFilename(session.name))
  fs.writeFileSync(finalPath, markdown)
}
