import type { TagSets } from './tag-sets'

const TAG_SET_LABELS: Record<keyof TagSets, string> = {
  physical: 'Physical Traits',
  personality: 'Personality Tags',
  identity: 'Identity Tags',
  clothing: 'Clothing Style',
  location: 'Location',
}

const TAG_SET_ORDER: (keyof TagSets)[] = ['physical', 'personality', 'identity', 'clothing', 'location']

interface ExportData {
  name: string
  draftContent: string
  finalContent: string | null
  tagSets: TagSets
  chatExamples: string[]
}

export function generateExportMarkdown(data: ExportData): string {
  const content = (data.finalContent || data.draftContent).trim()
  const lines: string[] = []

  // ── Background Story ──────────────────────────────────────────────────────
  lines.push('# Background Story', '')
  lines.push(content)
  lines.push('')

  // ── Chat Examples ─────────────────────────────────────────────────────────
  const filledExamples = data.chatExamples
    .map((e, i) => ({ text: e.trim(), idx: i + 1 }))
    .filter(({ text }) => text.length > 0)

  if (filledExamples.length > 0) {
    lines.push('# Chat Examples', '')
    for (const { text, idx } of filledExamples) {
      lines.push(`## Example ${idx}`, '')
      lines.push(text)
      lines.push('')
    }
  }

  // ── Tag Sets ──────────────────────────────────────────────────────────────
  const filledTags = TAG_SET_ORDER.filter(key => data.tagSets[key]?.trim())
  if (filledTags.length > 0) {
    lines.push('# Tag Sets', '')
    for (const key of filledTags) {
      lines.push(`## ${TAG_SET_LABELS[key]}`, '')
      lines.push(data.tagSets[key].trim())
      lines.push('')
    }
  }

  return lines.join('\n')
}

export function exportFilename(name: string): string {
  return `${name.replace(/[^a-zA-Z0-9-_]/g, '-')}.md`
}
