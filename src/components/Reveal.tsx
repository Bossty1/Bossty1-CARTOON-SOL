import { useEffect, useRef, useState, type ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'section' | 'article' | 'li' | 'figure' | 'header'
}

/** Fades content in when it scrolls into view (no-op under reduced motion). */
export function Reveal({ children, delay = 0, className, as = 'div' }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
          }
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.06 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const Tag = as as 'div'

  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement>}
      className={['reveal', visible ? 'is-visible' : '', className].filter(Boolean).join(' ')}
      style={delay ? ({ '--reveal-delay': `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  )
}
