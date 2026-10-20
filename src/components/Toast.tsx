import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Icon } from './Icon'

type Show = (message: string) => void

const ToastContext = createContext<Show>(() => {})

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null)
  const timer = useRef<number | null>(null)

  const show = useCallback((next: string) => {
    setMessage(next)
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setMessage(null), 2400)
  }, [])

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current)
    },
    [],
  )

  return (
    <ToastContext.Provider value={show}>
      {children}
      {message ? (
        <div className="toast" role="status" aria-live="polite">
          <Icon name="check" />
          <span>{message}</span>
        </div>
      ) : null}
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
