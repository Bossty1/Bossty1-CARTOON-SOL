/**
 * Meme composition. Runs entirely on a canvas in the browser — no AI call, no
 * backend — so captions and export work even when the cartoon provider is
 * unavailable, as long as an image is already in hand.
 */

export type Alignment = 'left' | 'center' | 'right'

export interface MemeLayout {
  id: string
  label: string
  /** Text area top/bottom insets as a fraction of image height. */
  topInset: number
  bottomInset: number
  uppercase: boolean
}

export interface MemeOptions {
  topText: string
  bottomText: string
  fontSize: number
  textColor: string
  strokeColor: string
  align: Alignment
  layout: string
  /** Output aspect ratio. */
  aspect: 'original' | '1:1' | '4:5' | '16:9'
  attribution: boolean
}

export const MEME_LAYOUTS: MemeLayout[] = [
  { id: 'classic', label: 'Classic top/bottom', topInset: 0.1, bottomInset: 0.9, uppercase: true },
  { id: 'caption-bottom', label: 'Bottom caption', topInset: 0, bottomInset: 0.92, uppercase: false },
  { id: 'caption-top', label: 'Top caption', topInset: 0.1, bottomInset: 1.2, uppercase: false },
  { id: 'clean', label: 'Clean (no text)', topInset: 0, bottomInset: 1.2, uppercase: false },
]

export const DEFAULT_MEME_OPTIONS: MemeOptions = {
  topText: '',
  bottomText: '',
  fontSize: 56,
  textColor: '#ffffff',
  strokeColor: '#382603',
  align: 'center',
  layout: 'classic',
  aspect: 'original',
  attribution: true,
}

const ATTR_TEXT = 'Made with Cartoon AI'

const ASPECT_RATIO: Record<Exclude<MemeOptions['aspect'], 'original'>, number> = {
  '1:1': 1,
  '4:5': 4 / 5,
  '16:9': 16 / 9,
}

interface Size {
  width: number
  height: number
}

function fitAspect(width: number, height: number, aspect: MemeOptions['aspect']): Size {
  if (aspect === 'original') return { width, height }
  const ratio = ASPECT_RATIO[aspect]
  const current = width / height
  if (current > ratio) return { width: Math.round(height * ratio), height }
  return { width, height: Math.round(width / ratio) }
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  }
  if (line) lines.push(line)
  return lines
}

function drawBlock(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  options: MemeOptions,
  width: number,
  y: number,
  lineHeight: number,
  fromTop: boolean,
) {
  ctx.font = `bold ${options.fontSize}px "Baloo 2", system-ui, sans-serif`
  ctx.fillStyle = options.textColor
  ctx.strokeStyle = options.strokeColor
  ctx.lineWidth = Math.max(4, options.fontSize * 0.12)
  ctx.lineJoin = 'round'
  ctx.textBaseline = 'top'

  const blocks = lines
  const totalHeight = blocks.length * lineHeight

  blocks.forEach((line, index) => {
    const startY = fromTop ? y + index * lineHeight : y - totalHeight + index * lineHeight
    let x = width / 2
    if (options.align === 'left') {
      x = width * 0.06
      ctx.textAlign = 'left'
    } else if (options.align === 'right') {
      x = width * 0.94
      ctx.textAlign = 'right'
    } else {
      ctx.textAlign = 'center'
    }
    ctx.strokeText(line, x, startY)
    ctx.fillText(line, x, startY)
  })
}

/** Compose the meme and return a PNG blob. */
export async function renderMeme(
  img: HTMLImageElement,
  options: MemeOptions,
): Promise<Blob> {
  const { width, height } = fitAspect(img.naturalWidth, img.naturalHeight, options.aspect)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Your browser does not support canvas rendering.')

  // cover-fit the image into the target canvas
  const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight)
  const dw = img.naturalWidth * scale
  const dh = img.naturalHeight * scale
  ctx.drawImage(img, (width - dw) / 2, (height - dh) / 2, dw, dh)

  const layout = MEME_LAYOUTS.find((l) => l.id === options.layout) ?? MEME_LAYOUTS[0]
  const maxWidth = width * 0.88
  const applyCase = (value: string) => (layout.uppercase ? value.toUpperCase() : value)

  ctx.font = `bold ${options.fontSize}px "Baloo 2", system-ui, sans-serif`
  const lineHeight = options.fontSize * 1.15

  if (layout.id !== 'clean') {
    if (options.topText.trim()) {
      const lines = wrap(ctx, applyCase(options.topText.trim()), maxWidth)
      drawBlock(ctx, lines, options, width, height * layout.topInset, lineHeight, true)
    }
    if (options.bottomText.trim()) {
      const lines = wrap(ctx, applyCase(options.bottomText.trim()), maxWidth)
      drawBlock(ctx, lines, options, width, height * layout.bottomInset, lineHeight, false)
    }
  }

  if (options.attribution) {
    const pad = Math.max(10, width * 0.018)
    const font = Math.max(14, Math.round(width * 0.022))
    ctx.font = `600 ${font}px "Nunito", system-ui, sans-serif`
    ctx.textAlign = 'right'
    ctx.textBaseline = 'bottom'
    const w = ctx.measureText(ATTR_TEXT).width
    ctx.fillStyle = 'rgba(0,0,0,0.55)'
    ctx.fillRect(width - w - pad * 1.4, height - font - pad * 1.8, w + pad * 0.8, font + pad * 0.8)
    ctx.fillStyle = 'rgba(255,255,255,0.92)'
    ctx.fillText(ATTR_TEXT, width - pad, height - pad)
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('The meme could not be exported.'))),
      'image/png',
    )
  })
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}

export async function blobToImage(blob: Blob): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(blob)
  try {
    const img = new Image()
    img.decoding = 'async'
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('The image could not be loaded.'))
      img.src = url
    })
    return img
  } finally {
    URL.revokeObjectURL(url)
  }
}
