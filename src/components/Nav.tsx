import { useEffect, useRef, useState } from 'react'
import { CREATOR_LAUNCHER, NAV_LINKS, SITE } from '../data/site'
import { Icon } from './Icon'

export function Nav() {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState<string>('')
  const toggleRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const ids = NAV_LINKS.map((link) => link.href.slice(1))
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node))
    if (sections.length === 0 || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (best) setCurrent(best.target.id)
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.2, 0.6] },
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    const onResize = () => {
      if (window.innerWidth > 900) setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', onResize)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('resize', onResize)
    }
  }, [open])

  return (
    <header className="nav">
      <div className="wrap nav__inner">
        <a className="brand" href="#top" onClick={() => setOpen(false)}>
          <img
            className="brand__mark"
            src="/assets/brand/x-avatar.jpg"
            alt=""
            width={40}
            height={40}
          />
          <span className="brand__name">
            CARTOON AI <span className="brand__ticker">// $CARTOON</span>
          </span>
        </a>

        <button
          ref={toggleRef}
          type="button"
          className="nav__toggle"
          aria-expanded={open}
          aria-controls="nav-panel"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((value) => !value)}
        >
          <span aria-hidden="true" />
        </button>

        <div className="nav__panel" id="nav-panel" data-open={open ? 'true' : 'false'}>
          <ul className="nav__links">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  className="nav__link"
                  href={link.href}
                  aria-current={current === link.href.slice(1) ? 'true' : undefined}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            className="btn btn--gold nav__launcher"
            href={CREATOR_LAUNCHER.href}
            title={CREATOR_LAUNCHER.description}
            aria-label={CREATOR_LAUNCHER.description}
            onClick={() => setOpen(false)}
          >
            <Icon name={CREATOR_LAUNCHER.icon} />
            <span className="nav__launcher-label">{CREATOR_LAUNCHER.label}</span>
          </a>
          <a
            className="btn btn--primary nav__cta"
            href={SITE.handleUrl}
            target="_blank"
            rel="noreferrer noopener"
            onClick={() => setOpen(false)}
          >
            <Icon name="x" />
            Follow
          </a>
        </div>
      </div>
    </header>
  )
}
