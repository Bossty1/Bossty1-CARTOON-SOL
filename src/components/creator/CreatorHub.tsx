import { CREATOR_TOOLS } from '../../data/site'
import { Icon } from '../Icon'
import { CommunityGallery } from './CommunityGallery'
import { CreatorStudio } from './CreatorStudio'
export type CreatorTool = 'studio' | 'gallery'

export interface CreatorHubProps {
  tool: CreatorTool
  initialSubTool?: 'cartoon' | 'meme' | null
  initialTab?: 'gallery' | 'challenges'
  challengeId?: string | null
  onNavigate: (href: string) => void
}

export function CreatorHub({
  tool,
  initialSubTool,
  initialTab,
  challengeId,
  onNavigate,
}: CreatorHubProps) {
  return (
    <section className="section creator-hub" id="creator-hub">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow eyebrow--coral">
            <Icon name="wand" /> Creator Hub
          </span>
          <h2 className="section-title">Make cartoons, memes and challenge entries</h2>
          <p className="section-lead">
            The Creator Hub lives inside the CARTOON AI site. Everything below runs in your browser;
            the cartoon engine in use is always named, and nothing is presented as AI when it is not.
          </p>
        </div>

        <nav className="creator-hub__tools" aria-label="Creator tools">
          {CREATOR_TOOLS.map((item) => {
            const isStudio = item.id === 'studio' || item.id === 'meme'
            const activeTool: CreatorTool =
              tool === 'gallery' ? 'gallery' : 'studio'
            const targetTool = isStudio ? 'studio' : 'gallery'
            const isActive = activeTool === targetTool && !item.href.includes('tab=')
            return (
              <button
                key={item.id}
                type="button"
                className="creator-hub__tool"
                data-active={isActive}
                aria-current={isActive ? 'true' : undefined}
                onClick={() => onNavigate(item.href)}
              >
                <span className="creator-hub__tool-icon">
                  <Icon name={item.icon} />
                </span>
                <span className="creator-hub__tool-label">{item.label}</span>
                <span className="creator-hub__tool-text">{item.text}</span>
              </button>
            )
          })}
        </nav>

        {tool === 'gallery' ? (
          <CommunityGallery
            initialTab={initialTab}
            onOpenStudio={(opts) =>
              onNavigate(opts?.challengeId ? `#create?challenge=${opts.challengeId}` : '#create')
            }
          />
        ) : (
          <CreatorStudio
            initialTool={initialSubTool}
            challengeId={challengeId}
            onOpenCommunity={() => onNavigate('#community-hub')}
          />
        )}
      </div>
    </section>
  )
}
