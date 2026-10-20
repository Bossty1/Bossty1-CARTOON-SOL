import { CONTRACT_ADDRESS, OFFICIAL_COPY, SITE, type SocialLink } from '../data/site'
import { useCopy } from '../hooks/useCopy'
import { Icon } from './Icon'
import { Reveal } from './Reveal'
import { useToast } from './Toast'

const LINKS: SocialLink[] = [
  {
    label: 'Chart on Dex Screener',
    href: SITE.explorerLinks.dexscreener,
    icon: 'dexscreener',
    description: 'Raydium pair, live chart',
  },
  {
    label: 'Pair on Dex Tools',
    href: SITE.explorerLinks.dextools,
    icon: 'dextools',
    description: 'Second opinion on the pair',
  },
  {
    label: 'Contract on Solscan',
    href: SITE.explorerLinks.solscan,
    icon: 'solscan',
    description: 'Transfers, holders, supply',
  },
  {
    label: `${SITE.handle} on X`,
    href: SITE.handleUrl,
    icon: 'x',
    description: 'Official account',
  },
  {
    label: 'Telegram chat',
    href: SITE.telegram,
    icon: 'telegram',
    description: '@cartoon_Labs',
  },
  {
    label: 'Product site',
    href: SITE.officialWebsite,
    icon: 'globe',
    description: 'cartoonai.tech',
  },
]

export function Token() {
  const toast = useToast()
  const { copied, copy } = useCopy()

  return (
    <section className="section token" id="token">
      <div className="wrap">
        <Reveal className="section-head">
          <span className="eyebrow eyebrow--coral">The token</span>
          <h2 className="section-title">$CARTOON — verified links only</h2>
          <p className="section-lead">
            Every link below comes from the account&apos;s own bio or the token&apos;s DexScreener
            profile. No prices, no market cap, no forecasts — open a chart link if you want live
            numbers.
          </p>
        </Reveal>

        <Reveal className="token__panel">
          <div className="token__head">
            <img
              className="token__logo"
              src="/assets/brand/token-icon-256.png"
              alt="$CARTOON token icon"
              width={76}
              height={76}
            />
            <div>
              <div className="token__name">$CARTOON</div>
              <div className="token__meta">
                {SITE.chain} · {SITE.network} · CA published in the X bio
              </div>
            </div>
          </div>

          <div className="ca">
            <span className="ca__label">Contract</span>
            <code className="ca__value">{CONTRACT_ADDRESS}</code>
            <button
              type="button"
              className={`btn ${copied === CONTRACT_ADDRESS ? 'btn--gold' : 'btn--primary'} btn--sm`}
              onClick={() => {
                void copy(CONTRACT_ADDRESS).then((ok) =>
                  toast(
                    ok ? OFFICIAL_COPY.copyToast : 'Copy failed — select the text instead',
                  ),
                )
              }}
            >
              <Icon name={copied === CONTRACT_ADDRESS ? 'check' : 'copy'} />
              {copied === CONTRACT_ADDRESS ? 'Copied' : 'Copy CA'}
            </button>
          </div>

          <div className="token__links">
            {LINKS.map((link) => (
              <a
                key={link.href}
                className="token__link"
                href={link.href}
                target="_blank"
                rel="noreferrer noopener"
                title={link.description}
              >
                <Icon name={link.icon} />
                <span>
                  {link.label}
                  <br />
                  <small style={{ opacity: 0.7, fontFamily: 'var(--font-body)' }}>
                    {link.description}
                  </small>
                </span>
              </a>
            ))}
          </div>

          <p className="token__warn">
            <Icon name="alert" />
            <span>
              <strong>One official address.</strong> If a contract does not match the string above,
              it is not $CARTOON. Always copy it from here or from the X bio, and never from a DM,
              a reply, or a sponsored ad.
            </span>
          </p>
        </Reveal>

        <div className="pills">
          <span className="chip">
            <Icon name="check" /> Links cross-checked with the DexScreener API
          </span>
          <span className="chip">
            <Icon name="check" /> Chat verified as @cartoon_Labs
          </span>
          <span className="chip">
            <Icon name="archive" /> Chart data intentionally not shown on this page
          </span>
        </div>
      </div>
    </section>
  )
}
