import { FEATURE_CARDS, OFFICIAL_COPY } from '../data/site'
import { Reveal } from './Reveal'

export function Universe() {
  return (
    <section className="section universe" id="universe">
      <div className="wrap">
        <Reveal className="section-head">
          <span className="eyebrow eyebrow--teal">The Cartoon Universe</span>
          <h2 className="section-title">One photo in, a cartoon out — then a moving one</h2>
          <p className="section-lead">
            Cartoon AI turns a still picture into a cartoon frame, and that frame into an animated
            clip. Three pieces of the product do the work, and all three are described in the
            project&apos;s own words below.
          </p>
        </Reveal>

        <div className="cast">
          {FEATURE_CARDS.map((card, index) => (
            <Reveal as="article" className="card cast__card" key={card.id} delay={index * 90}>
              <div className="cast__media">
                <img src={card.image} alt="" width={512} height={384} loading="lazy" />
                <span className="cast__tag">{card.tag}</span>
              </div>
              <h3 className="cast__title">{card.title}</h3>
              <p className="cast__text">{card.text}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="world" delay={120}>
          <img
            className="world__sky"
            src="/assets/world/sky-desktop.jpg"
            alt=""
            aria-hidden="true"
            width={1920}
            height={1241}
            loading="lazy"
          />
          <img
            className="world__meadow"
            src="/assets/world/meadow.jpg"
            alt=""
            aria-hidden="true"
            width={1440}
            height={420}
            loading="lazy"
          />
          <img
            className="world__hares"
            src="/assets/world/hares-cutout.png"
            alt=""
            width={500}
            height={500}
            loading="lazy"
          />
          <div className="world__content">
            <span className="eyebrow">Sample prompt</span>
            <h3>“{OFFICIAL_COPY.samplePrompt}”</h3>
            <p>
              The prompt that ships with the official generator, set against the official hero
              scene. Everything you see in the gallery below came out of the same model.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
