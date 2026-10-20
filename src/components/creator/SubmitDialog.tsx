import { useRef, useState, type FormEvent } from 'react'
import { blobToDataUrl, communityStore } from '../../lib/creator/communityStore'
import { STYLES, type StyleId } from '../../lib/creator/provider'
import { Icon } from '../Icon'

export interface SubmitDialogProps {
  imageBlob: Blob
  engine: string
  engineIsAi: boolean
  style: StyleId
  challengeId?: string
  onClose: () => void
  onSubmitted: () => void
}

const HANDLE_RE = /^@?[A-Za-z0-9_]{1,15}$/

export function SubmitDialog({
  imageBlob,
  engine,
  engineIsAi,
  style,
  challengeId,
  onClose,
  onSubmitted,
}: SubmitDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [creator, setCreator] = useState('')
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const honeypot = useRef('')

  const styleLabel = STYLES.find((s) => s.id === style)?.label ?? style

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (honeypot.current.trim()) {
      onClose()
      return
    }
    const next: Record<string, string> = {}
    if (title.trim().length < 3) next.title = 'Give your creation a title of at least 3 characters.'
    if (title.trim().length > 80) next.title = 'Keep the title under 80 characters.'
    if (description.length > 300) next.description = 'Keep the description under 300 characters.'
    if (creator.trim() && !HANDLE_RE.test(creator.trim()))
      next.creator = 'Use an X handle such as @yourname.'
    if (!consent) next.consent = 'Confirm you have permission to publish this artwork.'
    if (Object.keys(next).length > 0) {
      setErrors(next)
      return
    }

    setBusy(true)
    try {
      const imageDataUrl = await blobToDataUrl(imageBlob)
      communityStore.add({
        title: title.trim(),
        description: description.trim(),
        style: styleLabel,
        creator: creator.trim() || undefined,
        imageDataUrl,
        challengeId,
        engine,
        engineIsAi,
      })
      onSubmitted()
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'The submission failed.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="submit-title">
      <div className="lightbox submit-dialog">
        <button type="button" className="lightbox__close" aria-label="Close" onClick={onClose}>
          <Icon name="close" />
        </button>
        <div className="lightbox__body">
          <h2 id="submit-title" className="submit-dialog__title">
            Submit to the community
          </h2>
          <p className="submit-dialog__note">
            Submissions are queued for moderation and are <strong>not</strong> published
            automatically.
          </p>

          <img className="submit-dialog__preview" src={URL.createObjectURL(imageBlob)} alt="" />

          <form className="submit-dialog__form" onSubmit={onSubmit} noValidate>
            <label className="field">
              <span>Title</span>
              <input
                type="text"
                maxLength={80}
                value={title}
                aria-invalid={errors.title ? 'true' : undefined}
                onChange={(e) => setTitle(e.target.value)}
              />
              {errors.title ? <em className="field__error" role="alert">{errors.title}</em> : null}
            </label>

            <label className="field">
              <span>Description (optional)</span>
              <textarea
                rows={3}
                maxLength={300}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              {errors.description ? (
                <em className="field__error" role="alert">{errors.description}</em>
              ) : null}
            </label>

            <label className="field">
              <span>Your X handle (optional, for credit)</span>
              <input
                type="text"
                placeholder="@yourname"
                value={creator}
                aria-invalid={errors.creator ? 'true' : undefined}
                onChange={(e) => setCreator(e.target.value)}
              />
              {errors.creator ? (
                <em className="field__error" role="alert">{errors.creator}</em>
              ) : null}
            </label>

            <label className="meme__check">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => {
                  setConsent(e.target.checked)
                  setErrors((c) => ({ ...c, consent: '' }))
                }}
              />
              <span>
                This artwork is mine, or I have the creator&rsquo;s permission to publish it.
              </span>
            </label>
            {errors.consent ? (
              <em className="field__error" role="alert">{errors.consent}</em>
            ) : null}

            <div className="drop__hp" aria-hidden="true">
              <label htmlFor="submit-website">Leave this field empty</label>
              <input
                id="submit-website"
                tabIndex={-1}
                autoComplete="off"
                onChange={(e) => {
                  honeypot.current = e.target.value
                }}
              />
            </div>

            {errors.form ? <em className="field__error" role="alert">{errors.form}</em> : null}

            <div className="submit-dialog__actions">
              <button type="submit" className="btn btn--primary" disabled={busy}>
                <Icon name="check" /> {busy ? 'Submitting…' : 'Submit for review'}
              </button>
              <button type="button" className="btn btn--ghost" onClick={onClose}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
