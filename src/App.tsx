import { useEffect } from 'react'
import { Community } from './components/Community'
import { CreatorHub, type CreatorTool } from './components/creator/CreatorHub'
import { FinalCTA } from './components/FinalCTA'
import { Footer } from './components/Footer'
import { Gallery } from './components/Gallery'
import { Hero } from './components/Hero'
import { Latest } from './components/Latest'
import { Nav } from './components/Nav'
import { ToastProvider } from './components/Toast'
import { Token } from './components/Token'
import { Universe } from './components/Universe'
import { routeParam, useHashRoute } from './hooks/useHashRoute'

/**
 * The site's original single-page sections. These render exactly as before for
 * every hash except the Creator Hub routes, so the homepage is unchanged.
 */
function HomeSections() {
  return (
    <>
      <Hero />
      <Universe />
      <Gallery />
      <Latest />
      <Community />
      <Token />
      <FinalCTA />
    </>
  )
}

export function App() {
  const { route, navigate, home } = useHashRoute()

  // Jump to the top whenever a Creator Hub route is (re)opened.
  useEffect(() => {
    if (route) window.scrollTo({ top: 0, behavior: 'auto' })
  }, [route])

  const creatorView = route
    ? (() => {
        const toolParam = routeParam(route.query, 'tool')
        const tabParam = routeParam(route.query, 'tab')
        const challengeParam = routeParam(route.query, 'challenge')

        if (route.name === 'community-hub') {
          return (
            <CreatorHub
              tool={'gallery' as CreatorTool}
              initialTab={tabParam === 'challenges' ? 'challenges' : 'gallery'}
              onNavigate={navigate}
            />
          )
        }

        return (
          <CreatorHub
            tool={'studio' as CreatorTool}
            initialSubTool={toolParam === 'meme' ? 'meme' : 'cartoon'}
            challengeId={challengeParam}
            onNavigate={navigate}
          />
        )
      })()
    : null

  return (
    <ToastProvider>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Nav />
      <main id="main">
        {creatorView ? (
          <>
            <div className="wrap" style={{ paddingTop: '1rem' }}>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => navigate(home)}>
                ← Back to homepage
              </button>
            </div>
            {creatorView}
          </>
        ) : (
          <HomeSections />
        )}
      </main>
      <Footer />
    </ToastProvider>
  )
}
