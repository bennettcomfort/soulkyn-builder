import fs from 'fs'
import path from 'path'

const MASTER_REF_PATH = path.join(
  process.cwd(),
  '..',
  'Soulkyn Claude',
  'Projects',
  'MASTER_REFERENCE.md'
)

const CREATOR_ASSISTANT_PATH = path.join(
  process.cwd(),
  '..',
  'Soulkyn Claude',
  'Projects',
  'CREATOR_ASSISTANT.md'
)

let cachedMasterRef: string | null = null
let cachedCreatorAssistant: string | null = null

export function loadMasterReference(): string {
  if (cachedMasterRef) return cachedMasterRef

  try {
    if (fs.existsSync(MASTER_REF_PATH)) {
      cachedMasterRef = fs.readFileSync(MASTER_REF_PATH, 'utf-8')
      return cachedMasterRef
    }
  } catch {
    // fall through
  }

  return '(MASTER_REFERENCE.md not found)'
}

export function loadCreatorAssistant(): string {
  if (cachedCreatorAssistant) return cachedCreatorAssistant

  try {
    if (fs.existsSync(CREATOR_ASSISTANT_PATH)) {
      cachedCreatorAssistant = fs.readFileSync(CREATOR_ASSISTANT_PATH, 'utf-8')
      return cachedCreatorAssistant
    }
  } catch {
    // fall through
  }

  return '(CREATOR_ASSISTANT.md not found)'
}

export function clearCache() {
  cachedMasterRef = null
  cachedCreatorAssistant = null
}
