import { NAV_LINKS, SITE } from '../data/site'
import { Icon } from './Icon'

const EXPLORERS = [
  { label: 'Dex Screener', href: SITE.explorerLinks.dexscreener },
  { label: 'Dex Tools', href: SITE.explorerLinks.dextools },
  { label: 'Solscan', href: SITE.explorerLinks.solscan },
  { label: 'cartoonai.tech', href: SITE.officialWebsite },
]

const SHARE = [
  { label: 'Prompt card', href: '/share/prompt-card.html' },
  { label: 'Gallery pick', href: '/share/gallery-pick.html' },
  { label: 'Quick facts card', href: '/share/quick-facts.html' },
]

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__grid">
          <div>
            <div className="footer__title">CARTOON AI // $CARTOON</div>
            <p className="footer__blurb">{SITE.bio}.</p>
            <div className="share" style={{ marginTop: '1rem' }}>
              <a
                className="share__btn"
                href={SITE.handleUrl}
                target="_blank"
                rel="noreferrer noopener"
              >
                <Icon name="x" /> X
              </a>
              <a
                className="share__btn"
                href={SITE.telegram}
                target="_blank"
                rel="noreferrer noopener"
              >
                <Icon name="telegram" /> Telegram
              </a>
            </div>
          </div>

          <div>
            <div className="footer__title">Explore</div>
            <ul className="footer__list">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="footer__title">Verify</div>
            <ul className="footer__list">
              {EXPLORERS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} target="_blank" rel="noreferrer noopener">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="footer__title">Share</div>
            <ul className="footer__list">
              {SHARE.map((link) => (
                <li key={link.href}>
                  <a href={link.href} target="_blank" rel="noreferrer noopener">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <span>
            Contract: <code>{SITE.contractAddress.slice(0, 6)}…{SITE.contractAddress.slice(-6)}</code>
          </span>
          <span>
            Built from the public {SITE.handle} timeline archive and the official cartoonai.tech
            snapshot.
          </span>
          <span>
            Informational site only — not financial advice, and no live market data is shown.
          </span>
        </div>
      </div>
    </footer>
  )
}
