import { useEffect, useRef } from 'react'
import type { GalleryEntry } from '../data/gallery'
import { SITE } from '../data/site'
import { useCopy } from '../hooks/useCopy'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { useScrollLock } from '../hooks/useScrollLock'
import { Icon } from './Icon'
import { useToast } from './Toast'

interface LightboxProps {
  entry: GalleryEntry
  onPrev?: () => void
  onNext?: () => void
  onClose: () => void
}

const pageUrl = (id: string) => {
  const { origin, pathname, search } = window.location
  return `${origin}${pathname}${search}#gal/${id}`
}

const shareText = (entry: GalleryEntry) =>
  `${entry.title} — artwork from the @CARTOON_SOL timeline`

export function Lightbox({ entry, onPrev, onNext, onClose }: LightboxProps) {
  const panelRef = useRef<HTMLDivElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const toast = useToast()
  const { copied, copy } = useCopy()

  useScrollLock(true)
  useFocusTrap(panelRef, true, onClose)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' && onPrev) onPrev()
      if (event.key === 'ArrowRight' && onNext) onNext()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onPrev, onNext])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    void video.play().catch(() => {})
  }, [entry.id])

  const shareUrl = pageUrl(entry.id)
  const xIntent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText(entry),
  )}&url=${encodeURIComponent(shareUrl)}`
  const tgIntent = `https://t.me/share/url?url=${encodeURIComponent(
    shareUrl,
  )}&text=${encodeURIComponent(shareText(entry))}`

  const isVideo = entry.kind === 'video'

  return (
    <div
      className="overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        className="lightbox"
        role="dialog"
        aria-modal="true"
        aria-label={`${entry.title} — gallery item`}
        ref={panelRef}
        tabIndex={-1}
      >
        <button type="button" className="lightbox__close" onClick={onClose} aria-label="Close">
          <Icon name="close" />
        </button>

        {onPrev ? (
          <button
            type="button"
            className="lightbox__nav lightbox__nav--prev"
            onClick={onPrev}
            aria-label="Previous item"
          >
            <Icon name="chevron-left" />
          </button>
        ) : null}
        {onNext ? (
          <button
            type="button"
            className="lightbox__nav lightbox__nav--next"
            onClick={onNext}
            aria-label="Next item"
          >
            <Icon name="chevron-right" />
          </button>
        ) : null}

        <div className="lightbox__media">
          {isVideo ? (
            <video
              key={entry.id}
              ref={videoRef}
              src={entry.src}
              controls
              playsInline
              preload="metadata"
            />
          ) : (
            <img src={entry.src} alt={entry.title} width={1280} height={960} />
          )}
        </div>

        <div className="lightbox__body">
          <p className="lightbox__caption">{entry.caption}</p>

          <div className="lightbox__meta">
            <span className="chip">
              <Icon name={isVideo ? 'video' : 'image'} />
              {isVideo ? 'Video' : 'Photo'}
            </span>
            <span>{entry.dateLabel}</span>
            {typeof entry.likes === 'number' ? (
              <span>
                <Icon name="heart" /> {entry.likes}
              </span>
            ) : null}
            {typeof entry.replies === 'number' ? (
              <span>
                <Icon name="reply" /> {entry.replies}
              </span>
            ) : null}
            {entry.source === 'official' ? (
              <span className="chip">
                <Icon name="check" /> Official
              </span>
            ) : null}
          </div>

          <div className="share">
            <button
              type="button"
              className="share__btn"
              onClick={() => {
                void copy(shareUrl).then((ok) => toast(ok ? 'Link copied' : 'Could not copy link'))
              }}
            >
              <Icon name={copied === shareUrl ? 'check' : 'copy'} />
              {copied === shareUrl ? 'Copied' : 'Copy link'}
            </button>
            <a className="share__btn" href={xIntent} target="_blank" rel="noreferrer noopener">
              <Icon name="x" />
              Share on X
            </a>
            <a className="share__btn" href={tgIntent} target="_blank" rel="noreferrer noopener">
              <Icon name="telegram" />
              Share on Telegram
            </a>
            {entry.link ? (
              <a
                className="share__btn"
                href={entry.link}
                target="_blank"
                rel="noreferrer noopener"
              >
                <Icon name="external" />
                Original post
              </a>
            ) : (
              <a
                className="share__btn"
                href={SITE.handleUrl}
                target="_blank"
                rel="noreferrer noopener"
              >
                <Icon name="external" />
                On {SITE.handle}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
