import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Clipboard copy with a fallback for contexts where the async clipboard API is
 * unavailable (non-secure origins). Returns the value that was copied for the
 * duration of `timeout` so callers can render inline feedback.
 */
export function useCopy(timeout = 2000) {
  const [copied, setCopied] = useState<string | null>(null)
  const timer = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current)
    },
    [],
  )

  const legacyCopy = (text: string) => {
    try {
      const area = document.createElement('textarea')
      area.value = text
      area.setAttribute('readonly', '')
      area.style.position = 'fixed'
      area.style.top = '-1000px'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(area)
      return ok
    } catch {
      return false
    }
  }

  const copy = useCallback(
    async (text: string) => {
      let ok = false
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text)
          ok = true
        }
      } catch {
        ok = false
      }
      if (!ok) ok = legacyCopy(text)

      if (ok) {
        setCopied(text)
        if (timer.current) window.clearTimeout(timer.current)
        timer.current = window.setTimeout(() => setCopied(null), timeout)
      }
      return ok
    },
    [timeout],
  )

  return { copied, copy }
}
