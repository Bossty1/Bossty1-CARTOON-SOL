import { useState, type FormEvent } from 'react'
import { SITE } from '../data/site'
import { Icon } from './Icon'
import { useToast } from './Toast'

/**
 * Community meme / artwork drop.
 *
 * There is no server behind this site, so nothing is uploaded and nothing is
 * stored. The form validates the input, then hands the visitor a ready-made
 * post draft for X (or a link to the chat) that they publish themselves.
 * Moderation hooks that are genuinely enforceable in the browser:
 *  - a honeypot field that silently discards bot submissions,
 *  - a per-browser cooldown so the drop cannot be hammered,
 *  - a hard requirement to confirm ownership of the artwork,
 *  - strict input limits and URL validation before anything is prefilled.
 */

const COOLDOWN_MS = 60_000
const STORAGE_KEY = 'cartoon-ai:last-drop'

const HANDLE_RE = /^@?[A-Za-z0-9_]{1,15}$/
const URL_RE = /^https?:\/\/[^\s]+$/i
const HASHTAG = '#CartoonAI'

interface Draft {
  caption: string
  link: string
  handle: string
}

type FieldErrors = Partial<Record<'caption' | 'link' | 'handle' | 'consent' | 'limit', string>>

function buildShareText(draft: Draft) {
  const lines = [draft.caption.trim(), '']
  if (draft.link.trim()) lines.push(draft.link.trim(), '')
  lines.push(
    draft.handle.trim()
      ? `Made with ${SITE.displayName} — credit: ${draft.handle.trim()} ${HASHTAG}`
      : `Made with ${SITE.displayName} ${HASHTAG}`,
  )
  lines.push(SITE.handleUrl)
  return lines.join('\n')
}

export function MemeDrop() {
  const toast = useToast()
  const [draft, setDraft] = useState<Draft>({ caption: '', link: '', handle: '' })
  const [consent, setConsent] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [ready, setReady] = useState<string | null>(null)

  const update = (key: keyof Draft, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined, limit: undefined }))
  }

  const validate = (): FieldErrors => {
    const next: FieldErrors = {}
    const caption = draft.caption.trim()

    if (caption.length < 8) next.caption = 'Give the drawing a caption of at least 8 characters.'
    else if (caption.length > 280) next.caption = 'Keep the caption under 280 characters.'
    else if (/[<>]/.test(caption)) next.caption = 'Angle brackets are not allowed in the caption.'

    if (draft.link.trim() && !URL_RE.test(draft.link.trim()))
      next.link = 'The artwork link must be a full http(s) URL.'

    if (draft.handle.trim() && !HANDLE_RE.test(draft.handle.trim()))
      next.handle = 'Use an X handle such as @yourname (letters, numbers, underscore).'

    if (!consent) next.consent = 'Confirm the artwork is yours or you have permission to share it.'

    return next
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    // Honeypot: a human never fills a field they cannot see.
    if (honeypot.trim()) {
      setReady(null)
      toast('Thanks — your draft was discarded.')
      return
    }

    const found = validate()
    if (Object.keys(found).length > 0) {
      setErrors(found)
      setReady(null)
      return
    }

    const last = Number(window.localStorage.getItem(STORAGE_KEY) ?? 0)
    const elapsed = Date.now() - last
    if (last && elapsed < COOLDOWN_MS) {
      setErrors({ limit: `One submission per minute — try again in ${Math.ceil((COOLDOWN_MS - elapsed) / 1000)}s.` })
      return
    }

    const text = buildShareText(draft)
    const intent = `https://x.com/intent/post?text=${encodeURIComponent(text)}`
    window.localStorage.setItem(STORAGE_KEY, String(Date.now()))
    setErrors({})
    setReady(intent)
    toast('Draft ready — review it on X before posting')
  }

  return (
    <div className="drop" id="drop">
      <div className="drop__intro">
        <span className="eyebrow eyebrow--coral">Meme drop</span>
        <h3 className="drop__title">Share what you made</h3>
        <p className="drop__text">
          Cartooned your dog? Animated your lunch? Write a caption, drop a link to the artwork and
          this page builds the post for you — you publish it from your own account.
        </p>
        <ul className="drop__rules">
          <li>
            <Icon name="check" /> Own it or have permission. No reposting someone else&rsquo;s
            work without credit.
          </li>
          <li>
            <Icon name="alert" /> No price talk, no fake contract addresses, no &ldquo;next
            100x&rdquo; — the panel below is the only official CA.
          </li>
          <li>
            <Icon name="users" /> The team reviews what gets shared in the chat and will remove
            anything on request.
          </li>
        </ul>
        <p className="drop__privacy">
          This form has no server attached: it validates input in your browser and opens a draft on
          X. Nothing is uploaded, stored or added to a mailing list.
        </p>
      </div>

      <form className="drop__form" onSubmit={onSubmit} noValidate>
        <div className="field">
          <label htmlFor="drop-caption">Caption</label>
          <textarea
            id="drop-caption"
            name="caption"
            rows={4}
            maxLength={280}
            required
            placeholder="A young couple went on a romantic walk in the park — made with CARTOON AI"
            value={draft.caption}
            aria-invalid={errors.caption ? 'true' : undefined}
            aria-describedby={errors.caption ? 'drop-caption-error' : 'drop-caption-hint'}
            onChange={(event) => update('caption', event.target.value)}
          />
          <p className="field__hint" id="drop-caption-hint">
            {draft.caption.trim().length}/280 characters
          </p>
          {errors.caption && (
            <p className="field__error" id="drop-caption-error" role="alert">
              {errors.caption}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="drop-link">
            Artwork link <span className="field__optional">(optional)</span>
          </label>
          <input
            id="drop-link"
            name="link"
            type="url"
            inputMode="url"
            placeholder="https://…"
            value={draft.link}
            aria-invalid={errors.link ? 'true' : undefined}
            aria-describedby={errors.link ? 'drop-link-error' : undefined}
            onChange={(event) => update('link', event.target.value)}
          />
          {errors.link && (
            <p className="field__error" id="drop-link-error" role="alert">
              {errors.link}
            </p>
          )}
        </div>

        <div className="field">
          <label htmlFor="drop-handle">
            Your X handle <span className="field__optional">(optional, for credit)</span>
          </label>
          <input
            id="drop-handle"
            name="handle"
            type="text"
            placeholder="@yourname"
            value={draft.handle}
            aria-invalid={errors.handle ? 'true' : undefined}
            aria-describedby={errors.handle ? 'drop-handle-error' : undefined}
            onChange={(event) => update('handle', event.target.value)}
          />
          {errors.handle && (
            <p className="field__error" id="drop-handle-error" role="alert">
              {errors.handle}
            </p>
          )}
        </div>

        <label className="drop__check" htmlFor="drop-consent">
          <input
            id="drop-consent"
            name="consent"
            type="checkbox"
            checked={consent}
            aria-invalid={errors.consent ? 'true' : undefined}
            onChange={(event) => {
              setConsent(event.target.checked)
              setErrors((current) => ({ ...current, consent: undefined }))
            }}
          />
          <span>
            This artwork is mine, or I have the creator&rsquo;s permission to share it, and I am
            happy for the account to repost it.
          </span>
        </label>
        {errors.consent && (
          <p className="field__error" role="alert">
            {errors.consent}
          </p>
        )}

        {/* honeypot — hidden from people, irresistible to bots */}
        <div className="drop__hp" aria-hidden="true">
          <label htmlFor="drop-website">Leave this field empty</label>
          <input
            id="drop-website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(event) => setHoneypot(event.target.value)}
          />
        </div>

        {errors.limit && (
          <p className="field__error" role="alert">
            {errors.limit}
          </p>
        )}

        <div className="drop__actions">
          <button className="btn btn--primary" type="submit">
            <Icon name="x" />
            Build my post
          </button>
          <a className="btn btn--teal" href={SITE.telegram} target="_blank" rel="noreferrer noopener">
            <Icon name="telegram" />
            Drop it in the chat
          </a>
        </div>

        {ready && (
          <p className="drop__ready" role="status">
            <Icon name="check" /> Draft built. If the new tab did not open,{' '}
            <a href={ready} target="_blank" rel="noreferrer noopener">
              open it here
            </a>{' '}
            and check it before posting.
          </p>
        )}
      </form>
    </div>
  )
}
