import { useMemo, useState } from 'react'
import {
  GALLERY_ENTRIES,
  GALLERY_FILTERS,
  filterGallery,
  type GalleryFilter,
} from '../data/gallery'
import { SITE, OFFICIAL_COPY } from '../data/site'
import { useGalleryRoute } from '../hooks/useGalleryRoute'
import { Icon } from './Icon'
import { Lightbox } from './Lightbox'
import { Reveal } from './Reveal'

const ALL_IDS = GALLERY_ENTRIES.map((entry) => entry.id)

export function Gallery() {
  const [filter, setFilter] = useState<GalleryFilter>('all')
  const entries = useMemo(() => filterGallery(GALLERY_ENTRIES, filter), [filter])
  const { activeId, open, close, step } = useGalleryRoute()

  const activeIndex = activeId ? ALL_IDS.indexOf(activeId) : -1
  const active = activeIndex >= 0 ? GALLERY_ENTRIES[activeIndex] : null

  return (
    <section className="section gallery" id="gallery">
      <div className="wrap">
        <Reveal className="section-head">
          <span className="eyebrow eyebrow--coral">Gallery</span>
          <h2 className="section-title">Artwork and clips from the project itself</h2>
          <p className="section-lead">
            {GALLERY_ENTRIES.length} items: everything the account posted between Jan 23 and Feb
            21, 2025, plus the official example clips and key art. Nothing here is stock imagery.
          </p>
        </Reveal>

        <div className="strip" role="note">
          <Icon name="archive" />
          <span>
            Archived from the public {SITE.handle} timeline (last post: Feb 21, 2025). Follow the
            account on X for anything newer.
          </span>
          <a href={SITE.handleUrl} target="_blank" rel="noreferrer noopener">
            Open {SITE.handle} →
          </a>
        </div>

        <p className="strip strip--official">
          <Icon name="video" />
          <span>{OFFICIAL_COPY.examplesLine}</span>
        </p>

        <div className="gallery__bar" role="group" aria-label="Filter gallery">
          {GALLERY_FILTERS.map((option) => (
            <button
              key={option.id}
              type="button"
              className="filter"
              aria-pressed={filter === option.id}
              onClick={() => setFilter(option.id)}
            >
              {option.label}
            </button>
          ))}
          <span className="gallery__count" aria-live="polite">
            {entries.length} shown
          </span>
        </div>

        {entries.length === 0 ? (
          <p className="gallery__empty">Nothing in this filter yet.</p>
        ) : (
          <ul className="gallery__grid">
            {entries.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  className="tile"
                  onClick={() => open(entry.id)}
                  aria-label={`Open ${entry.title}`}
                >
                  {entry.thumb ? (
                    <img
                      src={entry.thumb}
                      alt=""
                      loading="lazy"
                      width={512}
                      height={512}
                      decoding="async"
                    />
                  ) : (
                    <video src={entry.src} muted playsInline preload="metadata" />
                  )}
                  <span className="tile__meta">
                    <span className="tile__kind">
                      <Icon name={entry.kind === 'video' ? 'video' : 'image'} />
                      {entry.kind === 'video' ? 'Video' : 'Photo'}
                    </span>
                    <span>{entry.dateLabel}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {active ? (
        <Lightbox
          entry={active}
          onPrev={
            ALL_IDS.length > 1 ? () => step(ALL_IDS, -1) : undefined
          }
          onNext={ALL_IDS.length > 1 ? () => step(ALL_IDS, 1) : undefined}
          onClose={close}
        />
      ) : null}
    </section>
  )
}
