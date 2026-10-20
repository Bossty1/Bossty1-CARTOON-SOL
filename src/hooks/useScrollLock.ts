import { useEffect } from 'react'

/** Locks page scrolling while an overlay is open, without layout shift. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    const body = document.body
    const previous = body.dataset.scrollLocked
    const gap = window.innerWidth - document.documentElement.clientWidth
    body.dataset.scrollLocked = 'true'
    if (gap > 0) body.style.paddingRight = `${gap}px`
    return () => {
      if (previous === undefined) delete body.dataset.scrollLocked
      else body.dataset.scrollLocked = previous
      body.style.paddingRight = ''
    }
  }, [active])
}
