import { SITE } from '../data/site'
import { Icon } from './Icon'
import { Reveal } from './Reveal'

export function FinalCTA() {
  return (
    <section className="section final">
      <div className="wrap">
        <Reveal className="final__panel">
          <h2 className="final__title">Make something, then show us</h2>
          <p className="final__text">
            Run a photo through the generator, share what comes out, and bring it to the chat —
            the best ones end up in the gallery on this page.
          </p>
          <div className="final__actions">
            <a
              className="btn btn--gold"
              href={SITE.telegram}
              target="_blank"
              rel="noreferrer noopener"
            >
              <Icon name="telegram" />
              Join @cartoon_Labs
            </a>
            <a className="btn btn--teal" href="#gallery">
              <Icon name="image" />
              Browse the gallery
            </a>
            <a
              className="btn btn--ghost"
              href={SITE.handleUrl}
              target="_blank"
              rel="noreferrer noopener"
            >
              <Icon name="x" />
              Follow {SITE.handle}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
