import { useCallback, useEffect, useRef, useState } from 'react'

const PREFIX = 'gal/'

const readHash = () => {
  const hash = window.location.hash.replace(/^#/, '')
  return hash.startsWith(PREFIX) ? hash.slice(PREFIX.length) : null
}

/**
 * Deep-linkable gallery lightbox.
 *
 * Opening pushes `#gal/<id>` onto the history stack so the URL is shareable and
 * the browser Back button closes the lightbox (the previous history entry has no
 * gallery hash). Closing with the X button pops that entry when we pushed it, and
 * rewrites the hash in place when the visitor arrived with the URL already set.
 */
export function useGalleryRoute() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const pushedByUs = useRef(false)

  useEffect(() => {
    setActiveId(readHash())
  }, [])

  useEffect(() => {
    const sync = () => {
      setActiveId(readHash())
      pushedByUs.current = false
    }
    window.addEventListener('popstate', sync)
    window.addEventListener('hashchange', sync)
    return () => {
      window.removeEventListener('popstate', sync)
      window.removeEventListener('hashchange', sync)
    }
  }, [])

  const open = useCallback((id: string) => {
    setActiveId(id)
    window.history.pushState({ gallery: id }, '', `#${PREFIX}${id}`)
    pushedByUs.current = true
  }, [])

  const close = useCallback(() => {
    setActiveId(null)
    if (pushedByUs.current) {
      pushedByUs.current = false
      window.history.back()
      return
    }
    const { pathname, search } = window.location
    window.history.replaceState(window.history.state, '', `${pathname}${search}`)
  }, [])

  const step = useCallback((ids: string[], delta: number) => {
    setActiveId((current) => {
      if (!current) return current
      const index = ids.indexOf(current)
      if (index === -1) return current
      const next = ids[(index + delta + ids.length) % ids.length]
      window.history.replaceState({ gallery: next }, '', `#${PREFIX}${next}`)
      return next
    })
  }, [])

  return { activeId, open, close, step }
}
