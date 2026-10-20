import { OFFICIAL_COPY, SITE } from '../data/site'
import { Icon } from './Icon'
import { Reveal } from './Reveal'

function Clouds() {
  return (
    <>
      <svg className="cloud cloud--1" viewBox="0 0 240 96" aria-hidden="true">
        <path
          d="M34 78c-16 0-28-11-28-25s12-25 27-25c3-17 18-29 36-29 15 0 28 8 34 21 5-4 12-7 19-7 16 0 29 12 30 27 13 2 23 13 23 26 0 15-13 27-29 27H34z"
          fill="#ffffff"
          stroke="#382603"
          strokeWidth="3"
        />
      </svg>
      <svg className="cloud cloud--2" viewBox="0 0 240 96" aria-hidden="true">
        <path
          d="M34 78c-16 0-28-11-28-25s12-25 27-25c3-17 18-29 36-29 15 0 28 8 34 21 5-4 12-7 19-7 16 0 29 12 30 27 13 2 23 13 23 26 0 15-13 27-29 27H34z"
          fill="#f4fbff"
          stroke="#382603"
          strokeWidth="3"
        />
      </svg>
      <svg className="cloud cloud--3" viewBox="0 0 240 96" aria-hidden="true">
        <path
          d="M34 78c-16 0-28-11-28-25s12-25 27-25c3-17 18-29 36-29 15 0 28 8 34 21 5-4 12-7 19-7 16 0 29 12 30 27 13 2 23 13 23 26 0 15-13 27-29 27H34z"
          fill="#ffffff"
          stroke="#382603"
          strokeWidth="3"
        />
      </svg>
    </>
  )
}

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero__sky-glow" aria-hidden="true">
        <Clouds />
      </div>

      <svg className="hero__hills" viewBox="0 0 1440 320" preserveAspectRatio="none" aria-hidden="true">
        <path
          d="M0 190c140-46 260 24 400 6s232-74 386-52 246 92 400 74 180-70 254-96v204H0z"
          fill="#a8c060"
        />
        <path
          d="M0 246c150-38 268 18 420 4s238-64 392-44 236 78 384 62 176-56 244-78v130H0z"
          fill="#90a860"
        />
        <path
          d="M0 288c170-26 280 12 430 4s250-42 404-26 232 52 366 42 170-30 240-48v60H0z"
          fill="#789048"
        />
      </svg>

      <img className="hero__hares" src="/assets/world/hares.png" alt="" width={1300} height={677} />

      <div className="hero__inner">
        <div className="hero__copy">
          <Reveal>
            <span className="eyebrow">Solana · AI image &amp; video</span>
            <h1 className="hero__title">CARTOON AI</h1>
            <p className="hero__sub">{SITE.bio}</p>
            <p className="hero__lead">{OFFICIAL_COPY.heroLine}</p>
          </Reveal>

          <Reveal delay={90}>
            <p className="hero__prompt">
              <b>Prompt</b>
              <span>“{OFFICIAL_COPY.samplePrompt}”</span>
            </p>
            <p className="hero__hint">{OFFICIAL_COPY.generationHint}</p>
          </Reveal>

          <Reveal delay={160}>
            <div className="hero__actions">
              <a
                className="btn btn--primary"
                href={SITE.handleUrl}
                target="_blank"
                rel="noreferrer noopener"
              >
                <Icon name="x" />
                Follow @{SITE.handle}
              </a>
              <a className="btn btn--gold" href="#gallery">
                <Icon name="play" />
                See real examples
              </a>
              <a
                className="btn btn--teal"
                href={SITE.telegram}
                target="_blank"
                rel="noreferrer noopener"
              >
                <Icon name="telegram" />
                Join the chat
              </a>
            </div>
          </Reveal>
        </div>
      </div>

      <a className="hero__scroll" href="#universe">
        The Cartoon Universe
        <Icon name="arrow-down" />
      </a>
    </section>
  )
}
