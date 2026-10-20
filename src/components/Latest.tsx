import { POSTS } from '../data/content'
import { SITE } from '../data/site'
import { Icon } from './Icon'
import { Reveal } from './Reveal'

const LATEST = POSTS.slice(0, 6)

export function Latest() {
  return (
    <section className="section latest" id="updates">
      <div className="wrap">
        <Reveal className="section-head">
          <span className="eyebrow">Latest from X</span>
          <h2 className="section-title">What the account posted</h2>
          <p className="section-lead">
            The six most recent posts from {SITE.handle}, shown exactly as the account wrote them.
          </p>
        </Reveal>

        <div className="strip" role="note">
          <Icon name="archive" />
          <span>
            This section is manually updated from the public timeline — it is not a live feed. The
            account&apos;s last visible post is from Feb 21, 2025.
          </span>
          <a href={SITE.handleUrl} target="_blank" rel="noreferrer noopener">
            Follow for live updates →
          </a>
        </div>

        <ul className="latest__grid">
          {LATEST.map((post, index) => (
            <Reveal as="li" key={post.id} delay={index * 70} className="card post">
              <div className="post__head">
                <img
                  className="post__avatar"
                  src="/assets/brand/x-avatar.jpg"
                  alt=""
                  width={34}
                  height={34}
                  loading="lazy"
                />
                <span>
                  <span className="post__handle">{SITE.handle}</span>
                  <time dateTime={post.created}>{post.dateLabel}</time>
                </span>
                <span className="chip" style={{ marginLeft: 'auto' }}>
                  {post.category}
                </span>
              </div>

              <p className="post__body">{post.text}</p>

              <div className="post__foot">
                <span>
                  <Icon name="heart" /> {post.likes}
                </span>
                <span>
                  <Icon name="reply" /> {post.replies}
                </span>
                <a href={post.link} target="_blank" rel="noreferrer noopener">
                  Open on X <Icon name="external" />
                </a>
              </div>
            </Reveal>
          ))}
        </ul>

        <Reveal>
          <a
            className="btn btn--gold"
            href={SITE.handleUrl}
            target="_blank"
            rel="noreferrer noopener"
            style={{ marginTop: '1.6rem' }}
          >
            <Icon name="x" />
            Read all {POSTS.length} archived posts on X
          </a>
        </Reveal>
      </div>
    </section>
  )
}
