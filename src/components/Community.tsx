import { SITE } from '../data/site'
import { Icon } from './Icon'
import { MemeDrop } from './MemeDrop'
import { Reveal } from './Reveal'

/** Milestones exactly as the account announced them, with the post they came from. */
const MILESTONE_POST = 'https://x.com/CARTOON_SOL/status/1892748455820275867'

/**
 * Participation formats worked out in docs/promotion-package.md. They are
 * proposals — nothing here is announced by the account, so it is labelled as
 * such wherever it appears.
 */
const CAMPAIGNS = [
  {
    id: 'cartoon-your-day',
    name: 'Cartoon Your Day',
    cadence: 'Daily prompt, weekly round-up',
    pitch:
      'An ordinary photo — commute, desk, pet, dinner — gets cartooned by everyone and the best five go out in a Friday thread.',
    cta: '#CartoonYourDay',
  },
  {
    id: 'panel-by-panel',
    name: 'Panel by Panel',
    cadence: 'One short thread a week',
    pitch:
      'The rabbits from the hero scene anchor a three-frame story each week, ending on a poll that decides what happens next.',
    cta: 'Vote in the last panel',
  },
  {
    id: 'clip-drop',
    name: 'Clip Drop Friday',
    cadence: 'Fridays, fixed hour',
    pitch:
      'One new example clip, posted with the exact prompt that produced it, so anyone can run the same prompt themselves.',
    cta: 'Prompt attached',
  },
] as const


const STATS = [
  { value: '1,000+', label: 'holders announced' },
  { value: '1,500', label: 'chat members announced' },
  { value: '#7', label: 'on DEX trending' },
  { value: '10M+', label: 'volume announced' },
]

const SHARE_PAGES = [
  { href: '/share/prompt-card.html', label: 'Prompt card' },
  { href: '/share/gallery-pick.html', label: 'Gallery pick' },
  { href: '/share/quick-facts.html', label: 'Quick facts card' },
]

export function Community() {
  return (
    <section className="section community" id="community">
      <div className="wrap">
        <Reveal className="section-head">
          <span className="eyebrow eyebrow--teal">Community</span>
          <h2 className="section-title">Where the cartoon people are</h2>
          <p className="section-lead">
            Two official rooms — the account and the chat — plus ready-made pages you can drop
            anywhere to bring people back.
          </p>
        </Reveal>

        <div className="community__grid">
          <Reveal as="article" className="card social social--x">
            <span className="social__icon">
              <Icon name="x" />
            </span>
            <h3 className="social__title">{SITE.handle}</h3>
            <p className="social__text">
              “{SITE.bio}” — the official account, posting since {SITE.joined}.
            </p>
            <a
              className="btn btn--primary btn--sm"
              href={SITE.handleUrl}
              target="_blank"
              rel="noreferrer noopener"
              style={{ width: 'fit-content' }}
            >
              Open profile
            </a>
          </Reveal>

          <Reveal as="article" className="card social" delay={90}>
            <span className="social__icon">
              <Icon name="telegram" />
            </span>
            <h3 className="social__title">@cartoon_Labs</h3>
            <p className="social__text">
              The community chat, listed as the token&apos;s official Telegram on DexScreener.
              Ask for help, share what you made, report fake accounts.
            </p>
            <a
              className="btn btn--teal btn--sm"
              href={SITE.telegram}
              target="_blank"
              rel="noreferrer noopener"
              style={{ width: 'fit-content' }}
            >
              Join Telegram
            </a>
          </Reveal>

          <Reveal as="article" className="card social" delay={180}>
            <span className="social__icon" style={{ background: 'var(--gold)' }}>
              <Icon name="users" />
            </span>
            <h3 className="social__title">Share it forward</h3>
            <p className="social__text">
              Three standalone pages with their own social previews — copy a prompt, feature a
              piece of artwork, or hand someone the verified facts.
            </p>
            <ul className="share-list">
              {SHARE_PAGES.map((page) => (
                <li key={page.href}>
                  <a href={page.href} target="_blank" rel="noreferrer noopener">
                    {page.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div className="stats">
          {STATS.map((stat) => (
            <Reveal key={stat.label} className="stat">
              <div className="stat__value">{stat.value}</div>
              <div className="stat__label">{stat.label}</div>
            </Reveal>
          ))}
        </div>

        <Reveal className="campaigns" delay={60}>
          <div className="campaigns__head">
            <h3 className="campaigns__title">Join in — three formats, all open</h3>
            <span className="chip">
              <Icon name="alert" /> Proposed by this site — not announced by the account
            </span>
          </div>
          <ul className="campaigns__list">
            {CAMPAIGNS.map((campaign) => (
              <li className="campaign" key={campaign.id}>
                <span className="campaign__cadence">{campaign.cadence}</span>
                <h4 className="campaign__name">{campaign.name}</h4>
                <p className="campaign__pitch">{campaign.pitch}</p>
                <span className="campaign__cta">{campaign.cta}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={90}>
          <MemeDrop />
        </Reveal>

        <div className="strip" role="note" style={{ marginTop: '1.2rem', marginBottom: 0 }}>
          <Icon name="alert" />
          <span>
            Milestones above are the account&apos;s own announcement from Feb 21, 2025 — not live
            figures.
          </span>
          <a href={MILESTONE_POST} target="_blank" rel="noreferrer noopener">
            Read the announcement →
          </a>
        </div>
      </div>
    </section>
  )
}
