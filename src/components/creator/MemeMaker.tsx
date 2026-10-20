import { useCallback, useEffect, useRef, useState } from 'react'
import {
  DEFAULT_MEME_OPTIONS,
  MEME_LAYOUTS,
  blobToImage,
  downloadBlob,
  renderMeme,
  type Alignment,
  type MemeOptions,
} from '../../lib/creator/meme'
import { Icon } from '../Icon'
import { useToast } from '../Toast'

export interface MemeMakerProps {
  imageUrl?: string
  imageBlob?: Blob
  onBack?: () => void
}

const ALIGNMENTS: Alignment[] = ['left', 'center', 'right']

export function MemeMaker({ imageUrl, imageBlob, onBack }: MemeMakerProps) {
  const toast = useToast()
  const [options, setOptions] = useState<MemeOptions>(DEFAULT_MEME_OPTIONS)
  const [sourceBlob, setSourceBlob] = useState<Blob | null>(imageBlob ?? null)
  const [sourceUrl, setSourceUrl] = useState<string | null>(imageUrl ?? null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)

  const update = <K extends keyof MemeOptions>(key: K, value: MemeOptions[K]) =>
    setOptions((current) => ({ ...current, [key]: value }))

  const onUpload = useCallback((file: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast('Choose a JPG, PNG or WebP image')
      return
    }
    if (sourceUrl && sourceUrl !== imageUrl) URL.revokeObjectURL(sourceUrl)
    setSourceBlob(file)
    setSourceUrl(URL.createObjectURL(file))
  }, [sourceUrl, imageUrl, toast])

  // Live preview: re-render whenever the image or options change (debounced a touch).
  useEffect(() => {
    let cancelled = false
    if (!sourceBlob) {
      setPreviewUrl(null)
      return
    }
    setBusy(true)
    const timer = window.setTimeout(async () => {
      try {
        const img = await blobToImage(sourceBlob)
        if (cancelled) return
        imgRef.current = img
        const blob = await renderMeme(img, options)
        if (cancelled) return
        setPreviewUrl((current) => {
          if (current) URL.revokeObjectURL(current)
          return URL.createObjectURL(blob)
        })
      } catch {
        /* preview failures are non-fatal */
      } finally {
        if (!cancelled) setBusy(false)
      }
    }, 120)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [sourceBlob, options])

  const exportMeme = async () => {
    if (!imgRef.current) return
    try {
      const blob = await renderMeme(imgRef.current, options)
      downloadBlob(blob, 'cartoon-meme.png')
      toast('Meme exported')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Export failed')
    }
  }

  return (
    <div className="meme">
      <div className="meme__preview">
        {previewUrl ? (
          <img src={previewUrl} alt="Meme preview" />
        ) : (
          <div className="meme__placeholder">
            <Icon name="image" />
            <p>Upload an image to start captioning.</p>
          </div>
        )}
        {busy ? <span className="meme__busy" aria-hidden="true" /> : null}
      </div>

      <div className="meme__controls">
        {onBack ? (
          <button type="button" className="btn btn--ghost btn--sm" onClick={onBack}>
            <Icon name="chevron-left" /> Back to result
          </button>
        ) : null}

        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => fileRef.current?.click()}
        >
          <Icon name="upload" /> {sourceBlob ? 'Change image' : 'Choose image'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="visually-hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onUpload(file)
            e.target.value = ''
          }}
        />

        <label className="meme__field">
          <span>Top caption</span>
          <input
            type="text"
            maxLength={120}
            value={options.topText}
            onChange={(e) => update('topText', e.target.value)}
          />
        </label>
        <label className="meme__field">
          <span>Bottom caption</span>
          <input
            type="text"
            maxLength={120}
            value={options.bottomText}
            onChange={(e) => update('bottomText', e.target.value)}
          />
        </label>

        <div className="meme__row">
          <label className="meme__field">
            <span>Layout</span>
            <select value={options.layout} onChange={(e) => update('layout', e.target.value)}>
              {MEME_LAYOUTS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
          <label className="meme__field">
            <span>Aspect</span>
            <select
              value={options.aspect}
              onChange={(e) => update('aspect', e.target.value as MemeOptions['aspect'])}
            >
              <option value="original">Original</option>
              <option value="1:1">1:1</option>
              <option value="4:5">4:5</option>
              <option value="16:9">16:9</option>
            </select>
          </label>
        </div>

        <label className="meme__field">
          <span>Text size: {options.fontSize}px</span>
          <input
            type="range"
            min={20}
            max={120}
            value={options.fontSize}
            onChange={(e) => update('fontSize', Number(e.target.value))}
          />
        </label>

        <div className="meme__row">
          <label className="meme__field">
            <span>Text colour</span>
            <input
              type="color"
              value={options.textColor}
              onChange={(e) => update('textColor', e.target.value)}
            />
          </label>
          <label className="meme__field">
            <span>Outline</span>
            <input
              type="color"
              value={options.strokeColor}
              onChange={(e) => update('strokeColor', e.target.value)}
            />
          </label>
        </div>

        <div className="meme__field">
          <span>Alignment</span>
          <div className="meme__align" role="radiogroup" aria-label="Text alignment">
            {ALIGNMENTS.map((align) => (
              <button
                key={align}
                type="button"
                role="radio"
                aria-checked={options.align === align}
                className="meme__align-btn"
                data-active={options.align === align}
                onClick={() => update('align', align)}
              >
                {align}
              </button>
            ))}
          </div>
        </div>

        <label className="meme__check">
          <input
            type="checkbox"
            checked={options.attribution}
            onChange={(e) => update('attribution', e.target.checked)}
          />
          <span>Show “Made with Cartoon AI”</span>
        </label>

        <button
          type="button"
          className="btn btn--primary btn--block"
          disabled={!sourceBlob}
          onClick={exportMeme}
        >
          <Icon name="download" /> Export meme (PNG)
        </button>
      </div>
    </div>
  )
}
