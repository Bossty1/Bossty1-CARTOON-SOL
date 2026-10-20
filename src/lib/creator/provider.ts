/**
 * Cartoonization provider abstraction.
 *
 * Two providers ship here:
 *
 *  1. `CanvasCartoonProvider` — a real, deterministic, in-browser image
 *     transform (posterize + edge ink + smoothing) drawn to a canvas. It runs
 *     everywhere, needs no backend and no API key, and is honestly reported as
 *     `engine: 'canvas-filter'`, `isAi: false`. It is NOT a neural network and
 *     the UI never calls it AI.
 *
 *  2. `RemoteCartoonProvider` — talks to the existing Cartoon AI Studio
 *     FastAPI backend (cartoon-ai-studio/), which exposes a real cartoonization
 *     endpoint with the same honest engine reporting. It is used automatically
 *     when `VITE_CARTOON_API_BASE` is configured, and can also fall back to a
 *     generic image-to-image HTTP provider.
 *
 * The provider is chosen once and surfaced in the UI so a visitor always knows
 * which engine produced their result. Nothing here pretends a canvas filter is
 * AI, and nothing invents a result that was not produced.
 */

import {
  neuralModelInfo,
  neuralRuntimeAvailable,
  runNeuralCartoon,
  type NeuralStyle,
} from './neural'

export type StyleId =
  | 'classic'
  | 'anime'
  | 'comic'
  | 'storybook'
  | 'nostalgic'
  | 'threeD'

export interface StyleOption {
  id: StyleId
  label: string
  description: string
}

export interface GenerateInput {
  file: File
  style: StyleId
  prompt?: string
}

export type ProgressFn = (stage: string, percent: number) => void

export interface GenerateResult {
  /** Object URL or remote URL of the finished image. */
  url: string
  /** Which engine actually ran (never mistated as AI). */
  engine: string
  /** True only when a learned model produced the image. */
  isAi: boolean
  /** Human-readable note about the engine, shown to the visitor. */
  note: string
  /** The image as a Blob so callers can download or feed it to the meme maker. */
  blob: Blob
}

export interface CartoonProvider {
  readonly id: string
  readonly label: string
  readonly isAi: boolean
  readonly available: boolean
  generate(input: GenerateInput, onProgress?: ProgressFn): Promise<GenerateResult>
}

export const STYLES: StyleOption[] = [
  { id: 'anime', label: 'Anime (Shinkai)', description: 'AnimeGANv2 Shinkai look — vivid skies and colour.' },
  { id: 'classic', label: 'Classic (Hayao)', description: 'AnimeGANv2 Hayao look — soft Ghibli-style palette.' },
  { id: 'comic', label: 'Bold (Paprika)', description: 'AnimeGANv2 Paprika look — punchy, high-contrast anime.' },
  { id: 'storybook', label: 'Soft storybook', description: 'Gentle Hayao look, lightly blended with the photo.' },
  { id: 'nostalgic', label: 'Nostalgic', description: 'Paprika look, slightly faded toward the original.' },
  { id: 'threeD', label: 'Poster', description: 'Full-strength Shinkai anime rendering.' },
]

/* ------------------------------------------------------------------ *
 * Canvas (client-side) provider                                       *
 * ------------------------------------------------------------------ */

interface StyleRecipe {
  levels: number
  edge: number
  smooth: number
  saturation: number
  warmth: number
  vignette: number
}

const RECIPES: Record<StyleId, StyleRecipe> = {
  classic: { levels: 6, edge: 0.55, smooth: 3, saturation: 1.15, warmth: 0.03, vignette: 0.06 },
  anime: { levels: 8, edge: 0.4, smooth: 5, saturation: 1.25, warmth: 0.0, vignette: 0.04 },
  comic: { levels: 5, edge: 0.85, smooth: 1, saturation: 1.4, warmth: 0.0, vignette: 0.0 },
  storybook: { levels: 7, edge: 0.35, smooth: 4, saturation: 1.1, warmth: 0.08, vignette: 0.08 },
  nostalgic: { levels: 6, edge: 0.5, smooth: 3, saturation: 0.95, warmth: 0.12, vignette: 0.12 },
  threeD: { levels: 9, edge: 0.45, smooth: 2, saturation: 1.3, warmth: 0.0, vignette: 0.05 },
}

const MAX_EDGE = 1400

async function loadImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.decoding = 'async'
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('That file could not be read as an image.'))
      img.src = url
    })
    return img
  } finally {
    URL.revokeObjectURL(url)
  }
}

function toBitmap(img: HTMLImageElement): HTMLCanvasElement {
  const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale))
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale))
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Your browser does not support canvas rendering.')
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  return canvas
}

/** Box blur, applied in place, used to soften detail before posterizing. */
function boxBlur(data: Uint8ClampedArray, w: number, h: number, radius: number) {
  if (radius <= 0) return
  const copy = new Uint8ClampedArray(data)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0
      let g = 0
      let b = 0
      let n = 0
      for (let dy = -radius; dy <= radius; dy++) {
        const yy = y + dy
        if (yy < 0 || yy >= h) continue
        for (let dx = -radius; dx <= radius; dx++) {
          const xx = x + dx
          if (xx < 0 || xx >= w) continue
          const i = (yy * w + xx) * 4
          r += copy[i]
          g += copy[i + 1]
          b += copy[i + 2]
          n++
        }
      }
      const o = (y * w + x) * 4
      data[o] = r / n
      data[o + 1] = g / n
      data[o + 2] = b / n
    }
  }
}

/**
 * Posterize + ink overlay. Pure pixel maths — deterministic and auditable.
 * `cb` yields to the event loop so the UI can show progress.
 */
function cartoonizeBitmap(
  canvas: HTMLCanvasElement,
  recipe: StyleRecipe,
  cb: (percent: number) => Promise<void>,
) {
  const ctx = canvas.getContext('2d')!
  const { width: w, height: h } = canvas
  const src = ctx.getImageData(0, 0, w, h)
  const base = new Uint8ClampedArray(src.data)

  boxBlur(base, w, h, recipe.smooth)

  const grey = new Float32Array(w * h)
  for (let i = 0, p = 0; i < base.length; i += 4, p++) {
    grey[p] = 0.299 * base[i] + 0.587 * base[i + 1] + 0.114 * base[i + 2]
  }

  const step = 255 / (recipe.levels - 1)
  const out = src.data
  for (let p = 0, i = 0; p < grey.length; p++, i += 4) {
    let r = base[i]
    let g = base[i + 1]
    let b = base[i + 2]

    // saturation
    const lum = grey[p]
    r = lum + (r - lum) * recipe.saturation
    g = lum + (g - lum) * recipe.saturation
    b = lum + (b - lum) * recipe.saturation

    // warmth
    r += 255 * recipe.warmth
    b -= 255 * recipe.warmth * 0.6

    // posterize
    r = Math.round(r / step) * step
    g = Math.round(g / step) * step
    b = Math.round(b / step) * step

    out[i] = r
    out[i + 1] = g
    out[i + 2] = b
  }

  // Sobel edge detection -> ink lines
  const x = w
  const inkThreshold = 110 - recipe.edge * 90
  for (let y = 1; y < h - 1; y++) {
    for (let xx = 1; xx < w - 1; xx++) {
      const p = y * x + xx
      const gx =
        -grey[p - x - 1] - 2 * grey[p - 1] - grey[p + x - 1] +
        grey[p - x + 1] + 2 * grey[p + 1] + grey[p + x + 1]
      const gy =
        -grey[p - x - 1] - 2 * grey[p - x] - grey[p - x + 1] +
        grey[p + x - 1] + 2 * grey[p + x] + grey[p + x + 1]
      const mag = Math.sqrt(gx * gx + gy * gy)
      if (mag > inkThreshold) {
        const i = p * 4
        const shade = Math.max(0, 1 - (mag - inkThreshold) / 120) * 255
        out[i] = shade
        out[i + 1] = shade
        out[i + 2] = shade
      }
    }
    if (y % 64 === 0) void cb(60 + Math.round((y / h) * 30))
  }

  // vignette
  if (recipe.vignette > 0) {
    const cx = w / 2
    const cy = h / 2
    const maxD = Math.sqrt(cx * cx + cy * cy)
    for (let y = 0; y < h; y++) {
      for (let xx = 0; xx < w; xx++) {
        const d = Math.sqrt((xx - cx) ** 2 + (y - cy) ** 2) / maxD
        const f = 1 - recipe.vignette * d * d
        const i = (y * w + xx) * 4
        out[i] *= f
        out[i + 1] *= f
        out[i + 2] *= f
      }
    }
  }

  ctx.putImageData(src, 0, 0)
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('The image could not be exported.'))),
      type,
      quality,
    )
  })
}

const yieldToUi = () => new Promise<void>((r) => setTimeout(r, 0))

export class CanvasCartoonProvider implements CartoonProvider {
  readonly id = 'canvas-filter'
  readonly label = 'In-browser canvas filter'
  readonly isAi = false
  readonly available = true

  async generate(input: GenerateInput, onProgress?: ProgressFn): Promise<GenerateResult> {
    onProgress?.('Reading image', 5)
    const img = await loadImage(input.file)
    const canvas = toBitmap(img)

    onProgress?.('Smoothed', 20)
    await yieldToUi()
    await yieldToUi()
    onProgress?.('Cartoonizing', 40)
    await yieldToUi()

    const recipe = RECIPES[input.style] ?? RECIPES.classic
    await cartoonizeBitmap(canvas, recipe, async (percent) => {
      onProgress?.('Drawing ink lines', percent)
      await yieldToUi()
    })

    onProgress?.('Finishing', 96)
    const blob = await canvasToBlob(canvas, 'image/png', 0.95)
    return {
      url: URL.createObjectURL(blob),
      blob,
      engine: this.id,
      isAi: false,
      note: 'Rendered by the built-in canvas filter in your browser. This is a classic image transform, not a neural network.',
    }
  }
}

/* ------------------------------------------------------------------ *
 * Remote (FastAPI studio) provider                                    *
 * ------------------------------------------------------------------ */

const REMOTE_BASE = (import.meta.env.VITE_CARTOON_API_BASE as string | undefined)?.replace(/\/$/, '') ?? ''

const REMOTE_STYLE: Record<StyleId, string> = {
  classic: 'comic',
  anime: 'anime',
  comic: 'comic',
  storybook: 'illustration',
  nostalgic: 'pastel',
  threeD: '3d',
}

export class RemoteCartoonProvider implements CartoonProvider {
  readonly id = 'remote-studio'
  readonly label = 'Cartoon AI Studio API'
  readonly isAi: boolean
  readonly available: boolean

  constructor(
    private readonly base: string,
    isAiEngine: boolean,
  ) {
    this.isAi = isAiEngine
    this.available = Boolean(base)
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.base}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
      ...init,
    })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      const message = body?.error?.message ?? body?.detail ?? res.statusText
      const error = new Error(message) as Error & { code?: string }
      error.code = body?.error?.code
      throw error
    }
    return (await res.json()) as T
  }

  async generate(input: GenerateInput, onProgress?: ProgressFn): Promise<GenerateResult> {
    onProgress?.('Uploading to studio', 10)
    const form = new FormData()
    form.append('file', input.file)
    form.append('kind', 'image')
    const uploaded = await fetch(`${this.base}/uploads`, { method: 'POST', body: form }).then((r) => {
      if (!r.ok) throw new Error('Upload to the studio failed.')
      return r.json() as Promise<{ asset: { id: string } }>
    })

    onProgress?.('Queued for cartoonization', 30)
    const job = await this.request<{ id: string }>('/cartoonize', {
      method: 'POST',
      body: JSON.stringify({
        asset_id: uploaded.asset.id,
        style: REMOTE_STYLE[input.style] ?? 'anime',
        engine: 'auto',
        allow_classic_fallback: true,
      }),
    })

    const start = Date.now()
    const timeoutMs = 120_000
    for (;;) {
      const status = await this.request<{
        status: string
        progress: number
        stage: string
        result: { asset_id?: string; output_asset_id?: string; engine?: string; is_ai?: boolean }
        error_code?: string | null
        error_message?: string | null
      }>(`/jobs/${job.id}`)

      onProgress?.(status.stage || 'Working', Math.max(30, status.progress || 0))

      if (status.status === 'failed') {
        throw new Error(status.error_message || 'The studio could not finish that image.')
      }
      if (status.status === 'succeeded') {
        const assetId = status.result?.output_asset_id ?? status.result?.asset_id
        if (!assetId) throw new Error('The studio returned no image.')
        const res = await fetch(`${this.base}/assets/${assetId}/content`)
        if (!res.ok) throw new Error('The finished image could not be downloaded.')
        const blob = await res.blob()
        const isAi = Boolean(status.result?.is_ai)
        return {
          url: URL.createObjectURL(blob),
          blob,
          engine: status.result?.engine ?? this.id,
          isAi,
          note: isAi
            ? 'Generated by the studio’s configured model.'
            : 'Rendered by the studio using its classic filter preset (not a neural network).',
        }
      }
      if (Date.now() - start > timeoutMs) {
        throw new Error('The studio took too long to respond. Try again with a smaller image.')
      }
      await new Promise((r) => setTimeout(r, 1500))
    }
  }
}

/**
 * In-browser neural provider (AnimeGANv2 via ONNX Runtime Web). This is a real
 * learned model running on the visitor's device, so it reports `isAi: true`.
 * The three bundled AnimeGANv2 looks are mapped from the site's style IDs.
 */
const NEURAL_STYLE: Record<StyleId, NeuralStyle> = {
  classic: 'hayao',
  storybook: 'hayao',
  nostalgic: 'paprika',
  comic: 'paprika',
  anime: 'shinkai',
  threeD: 'shinkai',
}

const NEURAL_STRENGTH: Record<StyleId, number> = {
  classic: 0.95,
  storybook: 0.85,
  nostalgic: 0.9,
  comic: 1,
  anime: 1,
  threeD: 1,
}

export class NeuralCartoonProvider implements CartoonProvider {
  readonly id = 'animeganv2-onnx'
  readonly label = 'AnimeGANv2 (in-browser)'
  readonly isAi = true
  readonly available = true

  async generate(input: GenerateInput, onProgress?: ProgressFn): Promise<GenerateResult> {
    const style = NEURAL_STYLE[input.style] ?? 'hayao'
    const strength = NEURAL_STRENGTH[input.style] ?? 1
    const output = await runNeuralCartoon(input.file, style, strength, onProgress)
    const info = neuralModelInfo(style)
    return {
      url: URL.createObjectURL(output.blob),
      blob: output.blob,
      engine: this.id,
      isAi: true,
      note: `${info.label} — a learned neural style-transfer model run in your browser. ${info.credit}.`,
    }
  }
}

/**
 * Pick the best provider available. The remote studio is preferred only when a
 * base URL is configured; otherwise the in-browser neural model is used, with
 * the canvas filter as a last resort.
 */
export function resolveProvider(): CartoonProvider {
  if (REMOTE_BASE) {
    return new RemoteCartoonProvider(REMOTE_BASE, false)
  }
  if (neuralRuntimeAvailable()) {
    return new NeuralCartoonProvider()
  }
  return new CanvasCartoonProvider()
}

export const providerStatus = {
  remoteConfigured: Boolean(REMOTE_BASE),
  neuralAvailable: neuralRuntimeAvailable(),
  note: REMOTE_BASE
    ? 'Connected to the Cartoon AI Studio API.'
    : neuralRuntimeAvailable()
      ? 'Running AnimeGANv2 in your browser with ONNX Runtime Web.'
      : 'Running the built-in canvas filter. Set VITE_CARTOON_API_BASE to use the studio backend.',
}
