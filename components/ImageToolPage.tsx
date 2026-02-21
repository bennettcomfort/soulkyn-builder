'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { cn } from '@/lib/utils'



// Matches the Python tool's system prompt exactly
const IMAGE_SYSTEM_PROMPT = `You are a Soulkyn image prompt specialist. Generate optimized image prompts that strictly follow Soulkyn platform rules.

## CRITICAL RULES
1. The user will specify a HARD character limit. You MUST stay within it — count every character before responding.
2. If your draft is too long, remove the least important keywords until it fits. Never exceed the limit.
3. Return ONLY the raw prompt keywords — no wrapper, no explanation, no preamble, no character count.

## OUTPUT FORMAT
Return only the comma-separated keyword prompt directly — no ((picture of "...")) wrapper, no quotes, no extra text.

## SYNTAX RULES
- Use SPACES between words: (long black hair) ✓  NOT (long_black_hair) ✗
- Separate keywords with commas
- Wrap important terms in parentheses: (keyword)

## WEIGHT SYSTEM
Simple weights:
- (keyword)+++ = 1.33 strong increase
- (keyword)++ = 1.21 moderate increase
- (keyword)+ = 1.1 slight increase
- (keyword)- = 0.9 slight decrease
- (keyword)-- = 0.81 moderate decrease
- (keyword)--- = 0.73 strong decrease

Numerical weights:
- (keyword):1.5 = precise control
- (keyword):2 = double emphasis (MAXIMUM for Anime Original — breaks above this)
- Realistic Freedom can handle up to :5

NEVER combine preset style selectors with numerical weights — causes oily painting effect.

## BUILD ORDER (always follow this sequence)
1. Quality tags: (masterpiece):1.8, (best quality)++, (high detail)++
2. Character count control: (solo)+++, (1girl)+++
3. Character appearance: hair, eyes, skin, build, expression
4. Clothing or lack thereof
5. Pose and action
6. Environment / background
7. Lighting
8. Negative prompts (ALWAYS at the end)

## NEGATIVE PROMPTS (ALWAYS INCLUDE)
Anatomy: (bad anatomy)---, (extra fingers)---, (fused fingers)---, (bad hands)---, (mutated)---, (deformed)---, (extra limbs)---
Quality: (worst quality)---, (low quality)---, (blurry)---, (jpeg artifacts)---, (watermark)---, (signature)---
Count control (if solo): (2girls)---, (2persons)---, (multiple people)---, (crowd)---

## TRAP WORDS (avoid or replace)
- "frozen" → use "icy landscape"
- "bow" → specify "ribbon bow" or "archer's bow"
- "hourglass figure" → use "curvy body, slim waist, wide hips"
- "cell" → use "prison cell" explicitly
- "tie" → use "necktie" specifically
- "cream" → use "beige color"
- underscores in ANY keyword → always use spaces

## STYLE KEYWORDS
Perspective: portrait, full body, wide shot, close up, cowboy shot, from above, from below, POV
Style: (anime stylized):2, (realistic style):2, (semi-realistic):2, (manga style):2
Lighting: (cinematic lighting)++, (dramatic lighting)++, (soft lighting)+, (golden hour), (rim lighting)+, (volumetric lighting):2
Quality: (masterpiece):1.8, (best quality)++, (highly detailed):2, (perfect picture):2`

const MODEL_NOTES: Record<string, string> = {
  anime: 'Anime Original — max weight :2, CLIP Skip 2, Euler A scheduler',
  'anime-enhanced': 'Anime Enhanced — max weight :2.5, CLIP Skip 2, DPM++ 2M scheduler',
  realistic: 'Realistic Original — max weight :3, DPM++ 2M Karras scheduler',
  'realistic-freedom': 'Realistic Freedom — max weight :5, most stable, DPM++ 2M Karras scheduler',
}

type ModelKey = 'anime' | 'anime-enhanced' | 'realistic' | 'realistic-freedom'

interface CacheStatus {
  exists: boolean
  builtAt?: string
  sizeMb?: number
}

async function readSSEStream(
  res: Response,
  onText: (text: string) => void,
  onThinking?: (thinking: boolean) => void,
): Promise<string> {
  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let accumulated = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6)
      if (data === '[DONE]') break
      try {
        const parsed = JSON.parse(data)
        if (parsed.error) throw new Error(parsed.error)
        if (parsed.thinking) {
          onThinking?.(true)
        } else if (parsed.text) {
          onThinking?.(false)
          accumulated += parsed.text
          onText(accumulated)
        }
      } catch (parseErr) {
        if (parseErr instanceof Error && parseErr.message !== 'Unexpected token') {
          throw parseErr
        }
      }
    }
  }
  return accumulated
}

export function ImageToolPage() {
  const [description, setDescription] = useState('')
  const [model, setModel] = useState<ModelKey>('anime')
  const [limit, setLimit] = useState<550 | 1000>(550)
  const [output, setOutput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [isTrimming, setIsTrimming] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [cacheStatus, setCacheStatus] = useState<CacheStatus | null>(null)
  const [initializingCache, setInitializingCache] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load cache status on mount
  useEffect(() => {
    fetch('/api/pdf-init')
      .then((r) => r.json())
      .then(setCacheStatus)
      .catch(() => {})
  }, [])

  const handleImageUpload = (file: File) => {
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file)
    }
  }

  const initCache = async () => {
    setInitializingCache(true)
    try {
      const res = await fetch('/api/pdf-init', { method: 'POST' })
      const data = await res.json()
      setCacheStatus(data)
    } finally {
      setInitializingCache(false)
    }
  }

  const streamRequest = useCallback(async (
    userContent: string,
    maxTokens: number,
    onText: (t: string) => void,
    onThinking: (t: boolean) => void,
    imageDataUrl?: string,
  ): Promise<string> => {
    const content = imageDataUrl
      ? [
          { type: 'image_url' as const, image_url: { url: imageDataUrl } },
          { type: 'text' as const, text: userContent },
        ]
      : userContent

    const res = await fetch('/api/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content }],
        systemPrompt: IMAGE_SYSTEM_PROMPT,
        maxTokens,
        thinkingEnabled: false,
      }),
    })
    if (!res.ok) {
      const errText = await res.text()
      try {
        const errJson = JSON.parse(errText)
        throw new Error(errJson.error || errText)
      } catch {
        throw new Error(errText || `HTTP ${res.status}`)
      }
    }
    return readSSEStream(res, onText, onThinking)
  }, [])

  const generate = useCallback(async () => {
    if (!description.trim() && !imageFile) return
    setIsGenerating(true)
    setIsThinking(false)
    setIsTrimming(false)
    setOutput('')
    setGenError(null)

    try {
      const modelNote = MODEL_NOTES[model]
      // Vision/reasoning models (e.g. qwen3-vl) can spend thousands of tokens on internal
      // reasoning. Use 8192 for image requests so thinking finishes and content is produced.
      const maxTokens = imageFile ? 8192 : limit === 550 ? 1200 : 1800

      let userContent: string
      if (imageFile) {
        userContent = `Using the image as visual inspiration, generate a Soulkyn image prompt${description.trim() ? ` for: "${description.trim()}"` : ''}.

STRICT REQUIREMENTS:
- HARD character limit: ${limit} characters — count every character of the raw keyword output
- If your draft exceeds ${limit} characters, trim keywords until it fits
- Target model: ${modelNote}
- Return ONLY the raw keywords, no wrapper, nothing else`
      } else {
        userContent = `Generate a Soulkyn image prompt for the following description:

"${description}"

STRICT REQUIREMENTS:
- HARD character limit: ${limit} characters — count every character of the raw keyword output
- If your draft exceeds ${limit} characters, remove the least important keywords until it fits
- Target model: ${modelNote}
- Include negative prompts at the end
- Follow the build order strictly
- Return ONLY the raw keywords, no wrapper, nothing else`
      }

      let accumulated = await streamRequest(
        userContent,
        maxTokens,
        setOutput,
        setIsThinking,
        imageFile ? (imagePreview ?? undefined) : undefined,
      )

      if (!accumulated) {
        setGenError(
          imageFile
            ? 'No output received. Make sure your model supports vision (e.g. qwen2.5vl, llava). Check the server console for the actual error.'
            : 'No output received. Check that your Ollama model is running and responding.'
        )
        return
      }

      // Up to 2 trim passes — LLMs often overshoot on the first correction
      for (let pass = 0; pass < 2; pass++) {
        if (accumulated.length <= limit) break
        setIsThinking(false)
        setIsTrimming(true)
        const overage = accumulated.length - limit
        const trimContent = `This image prompt is ${accumulated.length} characters — ${overage} over the ${limit} character limit:

${accumulated}

Remove the least important positive keywords until the total length is ≤ ${limit} characters. Keep all negative prompts. Return ONLY the trimmed keywords, no wrapper, nothing else.`

        const trimmed = await streamRequest(trimContent, maxTokens, setOutput, () => {})
        if (trimmed) accumulated = trimmed
      }

      setOutput(accumulated)
    } catch (err) {
      setGenError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsGenerating(false)
      setIsThinking(false)
      setIsTrimming(false)
    }
  }, [description, imageFile, imagePreview, model, limit, streamRequest])

  const charCount = output.length
  const isWithinLimit = charCount <= limit
  const charPercent = Math.min((charCount / limit) * 100, 100)

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100 mb-1">Image Prompt Tool</h1>
        <p className="text-sm text-slate-400">
          Generate optimized Soulkyn image prompts following all platform rules.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left — Input */}
        <div className="space-y-5">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. A seductive vampire girl in a gothic castle, dramatic lighting..."
              className="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 resize-none transition-colors"
              rows={5}
            />
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Reference Image <span className="text-slate-500 font-normal">(optional — AI derives prompt from it)</span>
            </label>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all',
                imagePreview
                  ? 'border-violet-500/50 bg-violet-500/5'
                  : 'border-slate-600 hover:border-slate-400 hover:bg-slate-800/40'
              )}
            >
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Reference"
                    className="max-h-32 mx-auto rounded-lg object-contain"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setImageFile(null)
                      setImagePreview(null)
                    }}
                    className="absolute top-0 right-0 w-6 h-6 bg-red-500 rounded-full text-white text-xs flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="text-slate-500 text-sm">
                  <div className="text-2xl mb-1">🖼</div>
                  Drop an image or click to upload
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleImageUpload(file)
              }}
            />
          </div>

          {/* Model selector */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Model</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(MODEL_NOTES) as ModelKey[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setModel(m)}
                  className={cn(
                    'p-2.5 rounded-lg border text-xs text-left transition-all',
                    model === m
                      ? 'border-violet-500/50 bg-violet-500/10 text-violet-300'
                      : 'border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-200'
                  )}
                >
                  <div className="font-medium capitalize">{m.replace('-', ' ')}</div>
                  <div className="text-slate-500 mt-0.5 text-[10px] leading-tight">
                    {MODEL_NOTES[m].split('—')[1]?.trim().split(',')[0]}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Limit selector */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Character Limit
            </label>
            <div className="flex gap-2">
              {([550, 1000] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLimit(l)}
                  className={cn(
                    'flex-1 py-2 rounded-lg border text-sm transition-all',
                    limit === l
                      ? 'border-violet-500/50 bg-violet-500/10 text-violet-300'
                      : 'border-slate-600 text-slate-400 hover:border-slate-500'
                  )}
                >
                  {l} chars
                  <div className="text-xs text-slate-500 mt-0.5">
                    {l === 550 ? 'Direct generation' : 'Chat-based'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={generate}
            disabled={isGenerating || (!description.trim() && !imageFile)}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </span>
            ) : (
              '✨ Generate Prompt'
            )}
          </Button>
          {output && (
            <Button
              onClick={generate}
              disabled={isGenerating}
              variant="outline"
              className="w-full"
            >
              ↺ Regenerate Variation
            </Button>
          )}
        </div>

        {/* Right — Output */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-300">Output</label>
              {output && (
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'text-xs font-mono tabular-nums',
                      isWithinLimit ? 'text-green-400' : 'text-red-400'
                    )}
                  >
                    {charCount}/{limit} {isWithinLimit ? '✓' : '⚠ OVER LIMIT'}
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(output)}
                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    Copy
                  </button>
                </div>
              )}
            </div>

            {/* Character bar */}
            {output && (
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden mb-3">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-300',
                    isWithinLimit ? 'bg-green-500' : 'bg-red-500'
                  )}
                  style={{ width: `${charPercent}%` }}
                />
              </div>
            )}

            {isThinking && (
              <div className="mb-3 flex items-center gap-2 text-xs text-slate-500">
                <span className="w-3 h-3 border border-violet-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                Reasoning...
              </div>
            )}
            {isTrimming && (
              <div className="mb-3 flex items-center gap-2 text-xs text-amber-500/80">
                <span className="w-3 h-3 border border-amber-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                Over limit — trimming to fit...
              </div>
            )}

            {genError && (
              <div className="mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs leading-relaxed">
                <span className="font-semibold">Error: </span>{genError}
              </div>
            )}

            <div
              className={cn(
                'bg-slate-900/60 border rounded-xl p-4 min-h-[280px] font-mono text-sm leading-relaxed whitespace-pre-wrap break-words',
                output
                  ? 'border-slate-700/50 text-slate-200'
                  : 'border-slate-700/30 text-slate-500 italic'
              )}
            >
              {output || 'Generated prompt will appear here...'}
              {isGenerating && (
                <span className="inline-block w-2 h-4 bg-violet-400 animate-pulse ml-0.5" />
              )}
            </div>
          </div>

          {/* PDF cache status */}
          <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Image Library Cache</span>
              {cacheStatus?.exists ? (
                <span className="text-green-400">
                  ✓ Loaded ({cacheStatus.sizeMb}MB)
                </span>
              ) : (
                <span className="text-slate-500">Not built</span>
              )}
            </div>
            {cacheStatus?.builtAt && (
              <p className="text-xs text-slate-600 mt-1">
                Last built: {new Date(cacheStatus.builtAt).toLocaleString()}
              </p>
            )}
            {!cacheStatus?.exists && (
              <Button
                variant="ghost"
                size="sm"
                onClick={initCache}
                disabled={initializingCache}
                className="mt-2 text-xs w-full"
              >
                {initializingCache ? 'Building...' : 'Build PDF Cache'}
              </Button>
            )}
          </div>

          {/* Quick reference */}
          <Card className="p-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Quick Reference
            </h3>
            <div className="text-xs text-slate-500 space-y-1">
              <p><span className="text-slate-300">(keyword)+++</span> = strong emphasis (1.33)</p>
              <p><span className="text-slate-300">(keyword):2</span> = precise weight (max for anime)</p>
              <p><span className="text-slate-300">(keyword)---</span> = negative prompt</p>
              <p className="text-yellow-500/80">Never use underscores — always spaces</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
