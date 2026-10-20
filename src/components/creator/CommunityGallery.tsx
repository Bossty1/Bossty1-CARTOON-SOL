import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CHALLENGES,
  challengeById,
  challengeStatus,
  type Challenge,
} from '../../lib/creator/challenges'
import { communityStore, visitorId, type Submission } from '../../lib/creator/communityStore'
import { Icon } from '../Icon'
import { useToast } from '../Toast'

export interface CommunityGalleryProps {
  initialTab?: 'gallery' | 'challenges'
  onOpenStudio: (opts?: { challengeId?: string }) => void
}

type Sort = 'newest' | 'popular'

function ShareButton({ submission }: { submission: Submission }) {
  const toast = useToast()
  const [copied, setCopied] = useState(false)

  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}#community-hub?item=${submission.id}`
    try {
      if (navigator.share) {
        await navigator.share({ title: submission.title, url })
      } else {
        await navigator.clipboard.writeText(url)
      }
      setCopied(true)
      toast('Share link copied')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast('Could not copy the link')
    }
  }

  return (
    <button type="button" className="btn btn--ghost btn--sm" onClick={share}>
      <Icon name={copied ? 'check' : 'external'} /> {copied ? 'Copied' : 'Share'}
    </button>
  )
}

function ChallengeCard({
  challenge,
  count,
  onEnter,
}: {
  challenge: Challenge
  count: number
  onEnter: () => void
}) {
  const status = challengeStatus(challenge)
  return (
    <article className="card challenge-card">
      {challenge.cover ? (
        <img className="challenge-card__cover" src={challenge.cover} alt="" loading="lazy" />
      ) : null}
      <span className="chip challenge-card__status" data-status={status}>
        {status}
      </span>
      <h3 className="challenge-card__title">{challenge.title}</h3>
      <p className="challenge-card__text">{challenge.description}</p>
      <p className="challenge-card__prompt">
        <Icon name="sparkle" /> Prompt idea: {challenge.prompt}
      </p>
      <div className="challenge-card__footer">
        <span className="muted">
          {count} {count === 1 ? 'entry' : 'entries'}
        </span>
        <button
          type="button"
          className="btn btn--primary btn--sm"
          disabled={status === 'closed'}
          onClick={onEnter}
        >
          {status === 'closed' ? 'Closed' : 'Enter challenge'}
        </button>
      </div>
    </article>
  )
}

export function CommunityGallery({ initialTab = 'gallery', onOpenStudio }: CommunityGalleryProps) {
  const toast = useToast()
  const [tab, setTab] = useState<'gallery' | 'challenges'>(initialTab)
  const [items, setItems] = useState<Submission[]>([])
  const [sort, setSort] = useState<Sort>('newest')
  const [active, setActive] = useState<Submission | null>(null)
  const [admin, setAdmin] = useState(false)
  const [pending, setPending] = useState<Submission[]>([])

  const refresh = useCallback(() => {
    setItems(communityStore.listPublic())
    setPending(
      communityStore
        .list()
        .filter((item) => item.status === 'pending'),
    )
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const sorted = useMemo(() => {
    const copy = [...items]
    copy.sort((a, b) => (sort === 'popular' ? b.likes - a.likes : b.createdAt - a.createdAt))
    return copy
  }, [items, sort])

  const challengeCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const item of items) {
      if (item.challengeId) counts[item.challengeId] = (counts[item.challengeId] ?? 0) + 1
    }
    return counts
  }, [items])

  const like = (item: Submission) => {
    communityStore.like(item.id, visitorId())
    refresh()
    toast('Thanks for the reaction')
  }

  const moderate = (id: string, status: 'approved' | 'rejected') => {
    communityStore.setStatus(id, status)
    refresh()
    toast(status === 'approved' ? 'Approved' : 'Rejected')
  }

  return (
    <section className="section community-hub" id="community-hub">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow eyebrow--teal">Creator community</span>
          <h2 className="section-title">Community Gallery &amp; Challenges</h2>
          <p className="section-lead">
            Approved creations from the Creator Hub, plus open cartoon challenges. Moderation is a
            local dashboard here — the site has no server, so only approved items in this browser
            are shown publicly.
          </p>
        </div>

        <div className="community-hub__bar" role="tablist" aria-label="Community sections">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'gallery'}
            className="filter"
            aria-pressed={tab === 'gallery'}
            onClick={() => setTab('gallery')}
          >
            Gallery
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'challenges'}
            className="filter"
            aria-pressed={tab === 'challenges'}
            onClick={() => setTab('challenges')}
          >
            Challenges
          </button>
        </div>

        {tab === 'gallery' ? (
          <>
            <div className="community-hub__controls">
              <div className="community-hub__sort" role="group" aria-label="Sort gallery">
                <button
                  type="button"
                  className="filter"
                  aria-pressed={sort === 'newest'}
                  onClick={() => setSort('newest')}
                >
                  Newest
                </button>
                <button
                  type="button"
                  className="filter"
                  aria-pressed={sort === 'popular'}
                  onClick={() => setSort('popular')}
                >
                  Most liked
                </button>
              </div>
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={() => onOpenStudio()}
              >
                <Icon name="wand" /> Create yours
              </button>
            </div>

            {sorted.length === 0 ? (
              <p className="community-hub__empty">
                <Icon name="image" /> No approved creations yet. Make one in the Creator Studio and
                submit it for review.
              </p>
            ) : (
              <ul className="community-hub__grid">
                {sorted.map((item) => (
                  <li key={item.id} className="community-hub__item card">
                    <button
                      type="button"
                      className="community-hub__thumb"
                      onClick={() => setActive(item)}
                      aria-label={`Open ${item.title}`}
                    >
                      <img src={item.imageDataUrl} alt="" loading="lazy" />
                    </button>
                    <div className="community-hub__meta">
                      <h3 className="community-hub__item-title">{item.title}</h3>
                      <p className="community-hub__style">{item.style}</p>
                      {item.creator ? <p className="muted">{item.creator}</p> : null}
                      <div className="community-hub__actions">
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => like(item)}
                        >
                          <Icon name="heart" /> {item.likes}
                        </button>
                        <ShareButton submission={item} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {pending.length > 0 ? (
              <div className="moderation">
                <button
                  type="button"
                  className="moderation__toggle"
                  onClick={() => setAdmin((v) => !v)}
                  aria-expanded={admin}
                >
                  <Icon name="users" /> Moderation queue ({pending.length})
                </button>
                {admin ? (
                  <ul className="moderation__list">
                    {pending.map((item) => (
                      <li key={item.id} className="moderation__row">
                        <img src={item.imageDataUrl} alt="" />
                        <div>
                          <strong>{item.title}</strong>
                          <p className="muted">
                            {item.style} · engine: {item.engine}
                            {item.engineIsAi ? ' (AI model)' : ' (classic filter)'}
                          </p>
                        </div>
                        <div className="moderation__actions">
                          <button
                            type="button"
                            className="btn btn--teal btn--sm"
                            onClick={() => moderate(item.id, 'approved')}
                          >
                            <Icon name="check" /> Approve
                          </button>
                          <button
                            type="button"
                            className="btn btn--ghost btn--sm"
                            onClick={() => moderate(item.id, 'rejected')}
                          >
                            Reject
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </>
        ) : (
          <div className="challenges">
            {CHALLENGES.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                count={challengeCounts[challenge.id] ?? 0}
                onEnter={() => onOpenStudio({ challengeId: challenge.id })}
              />
            ))}
            <p className="challenge-note">
              <Icon name="alert" /> Challenges are a community prompt only. No prizes, tokens or
              cash rewards are attached.
            </p>
          </div>
        )}
      </div>

      {active ? (
        <div className="overlay" role="dialog" aria-modal="true" aria-label={active.title}>
          <div className="lightbox">
            <button
              type="button"
              className="lightbox__close"
              aria-label="Close"
              onClick={() => setActive(null)}
            >
              <Icon name="close" />
            </button>
            <div className="lightbox__media">
              <img src={active.imageDataUrl} alt={active.title} />
            </div>
            <div className="lightbox__body">
              <h3 className="lightbox__caption">{active.title}</h3>
              {active.description ? <p>{active.description}</p> : null}
              <p className="lightbox__meta">
                <span>{active.style}</span>
                {active.creator ? <span>{active.creator}</span> : null}
                <span>{new Date(active.createdAt).toLocaleDateString()}</span>
                {active.challengeId ? (
                  <span>Challenge: {challengeById(active.challengeId)?.title}</span>
                ) : null}
              </p>
              <div className="lightbox__actions">
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => {
                    like(active)
                    setActive({ ...active, likes: active.likes + 1 })
                  }}
                >
                  <Icon name="heart" /> {active.likes}
                </button>
                <ShareButton submission={active} />
              </div>
              <p className="muted" style={{ fontSize: 'var(--step--1)' }}>
                Engine: {active.engine}
                {active.engineIsAi ? ' (AI model)' : ' (classic filter — not AI)'}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
