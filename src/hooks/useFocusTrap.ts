import { useEffect, type RefObject } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, video[controls], [tabindex]:not([tabindex="-1"])'

/**
 * Keeps keyboard focus inside `ref` while `active`, restores it to the element
 * that opened the overlay, and closes on Escape.
 */
export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  onClose: () => void,
) {
  useEffect(() => {
    if (!active) return
    const container = ref.current
    if (!container) return

    const opener = document.activeElement as HTMLElement | null
    const first = container.querySelector<HTMLElement>(FOCUSABLE)
    ;(first ?? container).focus({ preventScroll: true })

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const nodes = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (node) => node.offsetParent !== null || node === document.activeElement,
      )
      if (nodes.length === 0) {
        event.preventDefault()
        container.focus({ preventScroll: true })
        return
      }
      const firstNode = nodes[0]
      const lastNode = nodes[nodes.length - 1]
      const activeEl = document.activeElement

      if (event.shiftKey && (activeEl === firstNode || !container.contains(activeEl))) {
        event.preventDefault()
        lastNode.focus()
      } else if (!event.shiftKey && activeEl === lastNode) {
        event.preventDefault()
        firstNode.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true })
    }
  }, [ref, active, onClose])
}
