import fs from 'fs'
import path from 'path'

const PDF_DIR = path.join(
  process.cwd(),
  '..',
  'Soulkyn Claude',
  'Research',
  'Guides and Tutorials',
  'Image Prompting'
)

const CACHE_PATH = path.join(process.cwd(), 'data', 'pdf-cache', 'image-library.json')
const RULES_MD_PATH = path.join(PDF_DIR, 'image_prompting_rules_input.md')
const GUIDE_MD_PATH = path.join(PDF_DIR, 'SoulkynGuide-for images.md')

interface PdfCache {
  extractedText: string
  filesMtime: Record<string, number>
  builtAt: string
}

function ensureCacheDir() {
  const dir = path.dirname(CACHE_PATH)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function getPdfFiles(): string[] {
  try {
    return fs
      .readdirSync(PDF_DIR)
      .filter((f) => f.endsWith('.pdf'))
      .map((f) => path.join(PDF_DIR, f))
  } catch {
    return []
  }
}

function getMtimes(files: string[]): Record<string, number> {
  const mtimes: Record<string, number> = {}
  for (const f of files) {
    try {
      mtimes[f] = fs.statSync(f).mtimeMs
    } catch {
      mtimes[f] = 0
    }
  }
  return mtimes
}

function isCacheStale(cache: PdfCache, currentMtimes: Record<string, number>): boolean {
  for (const [file, mtime] of Object.entries(currentMtimes)) {
    if (cache.filesMtime[file] !== mtime) return true
  }
  return false
}

export async function buildImageLibrary(): Promise<string> {
  ensureCacheDir()

  const pdfFiles = getPdfFiles()
  const currentMtimes = getMtimes(pdfFiles)

  // Check cache
  if (fs.existsSync(CACHE_PATH)) {
    try {
      const cached = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8')) as PdfCache
      if (!isCacheStale(cached, currentMtimes)) {
        return cached.extractedText
      }
    } catch {
      // rebuild
    }
  }

  // Extract from markdown files first (always available)
  const parts: string[] = []

  if (fs.existsSync(RULES_MD_PATH)) {
    parts.push('=== IMAGE PROMPTING RULES ===\n' + fs.readFileSync(RULES_MD_PATH, 'utf-8'))
  }

  if (fs.existsSync(GUIDE_MD_PATH)) {
    parts.push('=== SOULKYN GUIDE FOR IMAGES ===\n' + fs.readFileSync(GUIDE_MD_PATH, 'utf-8'))
  }

  // Extract PDFs using pdfjs-dist if available
  for (const pdfPath of pdfFiles) {
    try {
      const text = await extractPdfText(pdfPath)
      if (text.trim()) {
        parts.push(`=== ${path.basename(pdfPath)} ===\n${text}`)
      }
    } catch {
      // skip failed PDFs
    }
  }

  const extractedText = parts.join('\n\n---\n\n')

  const cache: PdfCache = {
    extractedText,
    filesMtime: currentMtimes,
    builtAt: new Date().toISOString(),
  }

  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2))

  return extractedText
}

async function extractPdfText(pdfPath: string): Promise<string> {
  try {
    // Dynamic import to avoid SSR issues
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
    const data = new Uint8Array(fs.readFileSync(pdfPath))
    const doc = await pdfjs.getDocument({ data }).promise
    const textParts: string[] = []

    for (let i = 1; i <= Math.min(doc.numPages, 30); i++) {
      const page = await doc.getPage(i)
      const content = await page.getTextContent()
      const pageText = content.items
        .map((item: Record<string, unknown>) => ('str' in item ? (item.str as string) : ''))
        .join(' ')
      textParts.push(pageText)
    }

    return textParts.join('\n')
  } catch {
    return ''
  }
}

export function getImageLibraryFromCache(): string | null {
  try {
    if (fs.existsSync(CACHE_PATH)) {
      const cached = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8')) as PdfCache
      return cached.extractedText
    }
  } catch {
    // ignore
  }
  return null
}

export function getCacheStatus(): { exists: boolean; builtAt?: string; sizeMb?: number } {
  if (!fs.existsSync(CACHE_PATH)) {
    return { exists: false }
  }
  try {
    const stat = fs.statSync(CACHE_PATH)
    const cached = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8')) as PdfCache
    return {
      exists: true,
      builtAt: cached.builtAt,
      sizeMb: Math.round((stat.size / 1024 / 1024) * 100) / 100,
    }
  } catch {
    return { exists: false }
  }
}
