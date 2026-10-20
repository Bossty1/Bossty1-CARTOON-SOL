import { useCallback, useMemo, useRef, useState } from 'react'
import {
  resolveProvider,
  providerStatus,
  STYLES,
  type GenerateResult,
  type StyleId,
} from '../../lib/creator/provider'
import { downloadBlob } from '../../lib/creator/meme'
import { Icon } from '../Icon'
import { useToast } from '../Toast'
import { MemeMaker } from './MemeMaker'
import { SubmitDialog } from './SubmitDialog'

const ACCEPT = 'image/jpeg,image/png,image/webp'
const MAX_MB = 25
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']

type Stage = 'idle' | 'generating' | 'done' | 'error'

interface Preview {
  file: File
  url: string
  width: number
  height: number
}

export interface CreatorStudioProps {
  /** Open straight on the meme tool (used by the "Cartoon Meme Maker" shortcut). */
  initialTool?: 'cartoon' | 'meme' | null
  challengeId?: string | null
  onOpenCommunity: () => void
}

export function CreatorStudio({ initialTool, challengeId, onOpenCommunity }: CreatorStudioProps) {
  const toast = useToast()
  const provider = useMemo(() => resolveProvider(), [])
  const [preview, setPreview] = useState<Preview | null>(null)
  const [style, setStyle] = useState<StyleId>('classic')
  const [prompt, setPrompt] = useState('')
  const [stage, setStage] = useState<Stage>('idle')
  const [progress, setProgress] = useState({ stage: '', percent: 0 })
  const [result, setResult] = useState<GenerateResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tool, setTool] = useState<'cartoon' | 'meme'>(initialTool ?? 'cartoon')
  const [submitting, setSubmitting] = useState(false)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const clearResult = useCallback(() => {
    setResult((current) => {
      if (current) URL.revokeObjectURL(current.url)
      return null
    })
    setStage('idle')
    setError(null)
  }, [])

  const acceptFile = useCallback(
    (file: File) => {
      if (!ALLOWED.includes(file.type)) {
        setError('Please choose a JPG, PNG or WebP image.')
        return
      }
      if (file.size > MAX_MB * 1024 * 1024) {
        setError(`That image is larger than ${MAX_MB} MB.`)
        return
      }
      clearResult()
      const url = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => {
        setPreview({ file, url, width: img.naturalWidth, height: img.naturalHeight })
        setError(null)
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        setError('That file could not be read as an image.')
      }
      img.src = url
    },
    [clearResult],
  )

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      setDragging(false)
      const file = event.dataTransfer.files?.[0]
      if (file) acceptFile(file)
    },
    [acceptFile],
  )

  const generate = useCallback(async () => {
    if (!preview) return
    clearResult()
    setStage('generating')
    setProgress({ stage: 'Starting', percent: 0 })
    try {
      const output = await provider.generate(
        { file: preview.file, style, prompt: prompt.trim() || undefined },
        (s, percent) => setProgress({ stage: s, percent }),
      )
      setResult(output)
      setStage('done')
      toast('Cartoon ready')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Generation failed.'
      setError(message)
      setStage('error')
    }
  }, [preview, provider, style, prompt, clearResult, toast])

  const inMemeMode = tool === 'meme'

  return (
    <div className="creator">
      <div className="creator__tabs" role="tablist" aria-label="Creator tools">
        <button
          type="button"
          role="tab"
          aria-selected={tool === 'cartoon'}
          className="creator__tab"
          data-active={tool === 'cartoon'}
          onClick={() => setTool('cartoon')}
        >
          <Icon name="wand" /> Cartoon Creator
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tool === 'meme'}
          className="creator__tab"
          data-active={tool === 'meme'}
          onClick={() => setTool('meme')}
        >
          <Icon name="image" /> Meme Maker
        </button>
      </div>

      <p className="creator__engine" role="note">
        <Icon name="alert" />
        <span>
          Engine: <strong>{provider.label}</strong>.{' '}
          {provider.isAi
            ? 'This engine uses a learned model.'
            : 'This is a classic image transform — not a neural network — and results are labelled as such.'}{' '}
          {providerStatus.note}
        </span>
      </p>

      {tool === 'meme' && !result ? (
        <p className="creator__empty">
          The Meme Maker works on any image and needs no AI. Upload one below, or generate a cartoon
          first and caption that instead.
        </p>
      ) : null}

      <div className="creator__grid">
        <section className="card creator__panel" aria-labelledby="creator-upload-title">
          <h3 id="creator-upload-title" className="creator__panel-title">
            1. Your image
          </h3>

          {!preview ? (
            <div
              className="creator__drop"
              data-dragging={dragging}
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
            >
              <Icon name="upload" />
              <p>Drag an image here, or</p>
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={() => inputRef.current?.click()}
              >
                Choose a file
              </button>
              <p className="creator__hint">JPG, PNG or WebP · up to {MAX_MB} MB</p>
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPT}
                className="visually-hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) acceptFile(file)
                  e.target.value = ''
                }}
              />
            </div>
          ) : (
            <div className="creator__preview">
              <img src={preview.url} alt="Your uploaded image" />
              <p className="creator__meta">
                {preview.width}×{preview.height} · {(preview.file.size / 1024 / 1024).toFixed(1)} MB
              </p>
              <div className="creator__preview-actions">
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => inputRef.current?.click()}
                >
                  <Icon name="upload" /> Replace
                </button>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => {
                    URL.revokeObjectURL(preview.url)
                    setPreview(null)
                    clearResult()
                  }}
                >
                  <Icon name="trash" /> Remove
                </button>
                <input
                  ref={inputRef}
                  type="file"
                  accept={ACCEPT}
                  className="visually-hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) acceptFile(file)
                    e.target.value = ''
                  }}
                />
              </div>
            </div>
          )}

          {error ? (
            <p className="creator__error" role="alert">
              <Icon name="alert" /> {error}
            </p>
          ) : null}
        </section>

        <section className="card creator__panel" aria-labelledby="creator-style-title">
          <h3 id="creator-style-title" className="creator__panel-title">
            2. Cartoon style
          </h3>
          <div className="creator__styles" role="radiogroup" aria-label="Cartoon style">
            {STYLES.map((option) => (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={style === option.id}
                className="creator__style"
                data-active={style === option.id}
                onClick={() => setStyle(option.id)}
              >
                <span className="creator__style-name">{option.label}</span>
                <span className="creator__style-desc">{option.description}</span>
              </button>
            ))}
          </div>

          <label className="creator__field">
            <span>Prompt or instruction (optional)</span>
            <textarea
              rows={3}
              maxLength={300}
              placeholder="e.g. a kid and their toy robot in a jungle"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </label>

          <button
            type="button"
            className="btn btn--primary btn--block"
            disabled={!preview || stage === 'generating'}
            onClick={generate}
          >
            <Icon name="sparkle" />
            {stage === 'generating' ? 'Cartoonizing…' : 'Generate cartoon'}
          </button>

          {stage === 'generating' ? (
            <div className="creator__progress" aria-live="polite">
              <div className="creator__bar" style={{ width: `${progress.percent}%` }} />
              <span>
                {progress.stage} · {progress.percent}%
              </span>
            </div>
          ) : null}
        </section>

        <section className="card creator__panel creator__panel--result" aria-labelledby="creator-result-title">
          <h3 id="creator-result-title" className="creator__panel-title">
            3. Result
          </h3>

          {inMemeMode ? (
            <MemeMaker
              imageUrl={result?.url}
              imageBlob={result?.blob}
              onBack={result ? () => setTool('cartoon') : undefined}
            />
          ) : result ? (
            <div className="creator__result">
              <figure>
                <img src={result.url} alt="Your cartoon result" />
                <figcaption>{result.note}</figcaption>
              </figure>
              <div className="creator__result-actions">
                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  onClick={() => downloadBlob(result.blob, `cartoon-${style}.png`)}
                >
                  <Icon name="download" /> Download
                </button>
                <button
                  type="button"
                  className="btn btn--teal btn--sm"
                  onClick={() => setTool('meme')}
                >
                  <Icon name="image" /> Create meme
                </button>
                <button
                  type="button"
                  className="btn btn--gold btn--sm"
                  onClick={() => setSubmitting(true)}
                >
                  <Icon name="users" /> Submit to community
                </button>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  disabled={stage === 'generating'}
                  onClick={generate}
                >
                  <Icon name="sparkle" /> Another variation
                </button>
              </div>
            </div>
          ) : (
            <p className="creator__empty">
              Your cartoon appears here. Nothing is generated until you press the button, and no
              result is ever faked.
            </p>
          )}
        </section>
      </div>

      {submitting && result ? (
        <SubmitDialog
          imageBlob={result.blob}
          engine={result.engine}
          engineIsAi={result.isAi}
          style={style}
          challengeId={challengeId ?? undefined}
          onClose={() => setSubmitting(false)}
          onSubmitted={() => {
            setSubmitting(false)
            toast('Submitted for moderation')
            onOpenCommunity()
          }}
        />
      ) : null}
    </div>
  )
}
