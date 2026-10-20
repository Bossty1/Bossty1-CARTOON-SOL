/**
 * In-browser neural cartoonization via AnimeGANv2 (ONNX Runtime Web).
 *
 * Runs entirely on the visitor's device — no server, no API key, no per-image
 * cost. The model weights and the onnxruntime-web WASM runtime are self-hosted
 * under /models and /ort so nothing is fetched from a third-party CDN.
 *
 * The three bundled AnimeGANv2 looks are mapped onto the site's style IDs. This
 * is a real learned model, so callers report `isAi: true` and name the engine.
 */

export type NeuralStyle = 'hayao' | 'shinkai' | 'paprika'

export interface NeuralModelInfo {
  /** Public path to the .onnx file (self-hosted). */
  path: string
  /** Human-readable name of the underlying model. */
  label: string
  /** Attribution line shown in the UI. */
  credit: string
}

const MODELS: Record<NeuralStyle, NeuralModelInfo> = {
  hayao: {
    path: '/models/AnimeGANv2_Hayao.onnx',
    label: 'AnimeGANv2 · Hayao',
    credit: 'AnimeGANv2 by Asher Chan (TachibanaYoshino)',
  },
  shinkai: {
    path: '/models/AnimeGANv2_Shinkai.onnx',
    label: 'AnimeGANv2 · Shinkai',
    credit: 'AnimeGANv2 by Asher Chan (TachibanaYoshino)',
  },
  paprika: {
    path: '/models/AnimeGANv2_Paprika.onnx',
    label: 'AnimeGANv2 · Paprika',
    credit: 'AnimeGANv2 by Asher Chan (TachibanaYoshino)',
  },
}

export function neuralModelInfo(style: NeuralStyle): NeuralModelInfo {
  return MODELS[style]
}

/** Longest-edge size fed to the generator. AnimeGANv2 is fully convolutional. */
const MAX_EDGE = 720

type OrtModule = typeof import('onnxruntime-web')
type OrtSession = import('onnxruntime-web').InferenceSession

let ortPromise: Promise<OrtModule> | null = null
const sessionCache = new Map<NeuralStyle, Promise<OrtSession>>()

/**
 * Load onnxruntime-web once. The WASM runtime binaries are self-hosted under
 * /ort/ (copied from the package at build time), so nothing is fetched from a
 * third-party CDN. Prefers WebGPU when available, else SIMD WASM.
 */
async function getOrt(): Promise<OrtModule> {
  if (!ortPromise) {
    ortPromise = (async () => {
      const ort = await import('onnxruntime-web')
      // Multi-threading requires cross-origin isolation (COOP/COEP headers).
      // Without it ORT warns and falls back to single-thread, so only ask for
      // threads when the page is actually isolated. ORT resolves its WASM
      // runtime relative to the bundled module, which Vite copies into /assets
      // — no CDN dependency and no manual wasm directory.
      const isolated = typeof crossOriginIsolated !== 'undefined' && crossOriginIsolated
      ort.env.wasm.numThreads = isolated
        ? Math.min(4, Math.max(1, navigator.hardwareConcurrency || 1))
        : 1
      ort.env.wasm.simd = true
      return ort
    })()
  }
  return ortPromise
}

export function neuralRuntimeAvailable(): boolean {
  return typeof WebAssembly === 'object'
}

async function getSession(style: NeuralStyle): Promise<OrtSession> {
  const cached = sessionCache.get(style)
  if (cached) return cached

  const created: Promise<OrtSession> = (async () => {
    const ort = await getOrt()
    const info = MODELS[style]
    // WebGPU (jsep) when available, otherwise the SIMD WASM path.
    const eps: string[] = []
    if (typeof navigator !== 'undefined' && 'gpu' in navigator) eps.push('webgpu')
    eps.push('wasm')
    try {
      return await ort.InferenceSession.create(info.path, {
        executionProviders: eps,
        graphOptimizationLevel: 'all',
      })
    } catch {
      // Retry without WebGPU if that backend failed for any reason.
      return await ort.InferenceSession.create(info.path, {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all',
      })
    }
  })()

  sessionCache.set(style, created)
  return created
}

function loadImageEl(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('That file could not be read as an image.'))
    }
    img.src = url
  })
}

function drawToCanvas(img: HTMLImageElement, maxEdge: number): HTMLCanvasElement {
  const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight))
  const w = Math.max(1, Math.round(img.naturalWidth * scale))
  const h = Math.max(1, Math.round(img.naturalHeight * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Your browser does not support canvas rendering.')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, w, h)
  return canvas
}

export interface NeuralRunResult {
  blob: Blob
  width: number
  height: number
  model: NeuralModelInfo
}

/**
 * Run AnimeGANv2 over an image blob.
 *
 * @param strength 0..1 blend of result over the original (mirrors the studio).
 */
export async function runNeuralCartoon(
  blob: Blob,
  style: NeuralStyle,
  strength: number,
  onProgress?: (stage: string, percent: number) => void,
): Promise<NeuralRunResult> {
  const ort = await getOrt()
  onProgress?.('Loading model', 8)

  const session = await getSession(style)
  const info = MODELS[style]

  onProgress?.('Preparing image', 25)
  const img = await loadImageEl(blob)
  const srcCanvas = drawToCanvas(img, MAX_EDGE)
  const w = srcCanvas.width
  const h = srcCanvas.height
  const srcCtx = srcCanvas.getContext('2d')!
  const { data } = srcCtx.getImageData(0, 0, w, h)

  onProgress?.('Building tensor', 40)
  // The bundled tf2onnx conversion expects NHWC: [1, h, w, 3], values [-1, 1].
  const input = new Float32Array(w * h * 3)
  for (let p = 0, i = 0; p < w * h; p++, i += 4) {
    const o = p * 3
    input[o] = (data[i] / 255) * 2 - 1 // R
    input[o + 1] = (data[i + 1] / 255) * 2 - 1 // G
    input[o + 2] = (data[i + 2] / 255) * 2 - 1 // B
  }

  const inputName = session.inputNames[0]
  const tensor = new ort.Tensor('float32', input, [1, h, w, 3])

  onProgress?.('Cartoonizing', 60)
  const feeds: Record<string, unknown> = { [inputName]: tensor }
  const outputs = await session.run(feeds as never)
  const outputName = session.outputNames[0]
  const out = outputs[outputName]
  const outData = out.data as Float32Array

  onProgress?.('Finishing', 90)
  const outCanvas = document.createElement('canvas')
  outCanvas.width = w
  outCanvas.height = h
  const outCtx = outCanvas.getContext('2d')!
  const result = outCtx.createImageData(w, h)
  const alpha = Math.min(1, Math.max(0, strength))
  for (let p = 0, i = 0; p < w * h; p++, i += 4) {
    // Tanh output (NHWC) is in [-1, 1] -> [0, 255], then blend with the source.
    const o = p * 3
    const r = (outData[o] + 1) * 127.5
    const g = (outData[o + 1] + 1) * 127.5
    const b = (outData[o + 2] + 1) * 127.5
    result.data[i] = alpha * r + (1 - alpha) * data[i]
    result.data[i + 1] = alpha * g + (1 - alpha) * data[i + 1]
    result.data[i + 2] = alpha * b + (1 - alpha) * data[i + 2]
    result.data[i + 3] = 255
  }
  outCtx.putImageData(result, 0, 0)

  const outBlob = await new Promise<Blob>((resolve, reject) =>
    outCanvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('The image could not be exported.'))),
      'image/png',
      0.95,
    ),
  )

  onProgress?.('Done', 100)
  return { blob: outBlob, width: w, height: h, model: info }
}
