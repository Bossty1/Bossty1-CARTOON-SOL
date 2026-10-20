import { useCallback, useEffect, useState } from 'react'

/**
 * Minimal hash router.
 *
 * The site has always used hash navigation for its sections (`#gallery`,
 * `#token`, …) and for the gallery lightbox (`#gal/<id>`). The Creator Hub
 * needs full "pages" without pulling in a router dependency, so we treat a
 * small, explicit set of hash prefixes as routes and leave every other hash
 * (section anchors, `#gal/...`) to the existing behaviour.
 */

export type Route = {
  /** Route name, e.g. "create" or "community-hub". */
  name: string
  /** Everything after the route name, e.g. "?tool=meme". */
  query: string
}

const ROUTE_NAMES = ['create', 'community-hub'] as const

function readRoute(): Route | null {
  const hash = window.location.hash.replace(/^#/, '')
  const [name, ...rest] = hash.split('?')
  if (!(ROUTE_NAMES as readonly string[]).includes(name)) return null
  return { name, query: rest.join('?') }
}

export function useHashRoute() {
  const [route, setRoute] = useState<Route | null>(null)

  useEffect(() => {
    const sync = () => setRoute(readRoute())
    sync()
    window.addEventListener('hashchange', sync)
    window.addEventListener('popstate', sync)
    return () => {
      window.removeEventListener('hashchange', sync)
      window.removeEventListener('popstate', sync)
    }
  }, [])

  const navigate = useCallback((target: string) => {
    window.location.hash = target.replace(/^#/, '')
  }, [])

  return { route, navigate, home: '#top' }
}

/** Read a single query parameter from a route query string (`a=1&b=2`). */
export function routeParam(query: string, key: string): string | null {
  const params = new URLSearchParams(query)
  return params.get(key)
}
