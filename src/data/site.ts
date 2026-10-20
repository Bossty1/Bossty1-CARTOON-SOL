/**
 * Verified brand facts for CARTOON AI // $CARTOON.
 *
 * Every value below was checked against a primary source:
 *  - the public X profile timeline of @CARTOON_SOL (syndication archive, .data/posts.json)
 *  - the DexScreener API response for the token CA
 *  - the official cartoonai.tech snapshot kept in research/
 *
 * Nothing here is invented. Market data (price, liquidity, volume) is deliberately
 * NOT exposed in this file: the pair is thinly traded and any static number would go
 * stale. Links point at the live explorers instead.
 */

export const CONTRACT_ADDRESS = '8fwSfhLoLmoAWmVtgpTsb99vb6bg1nkkFgW7cyK3pump'
export const PAIR_ADDRESS = '9yL9ehBzL6y3i8D4A45SAVVGjBj4F3kKBNrSSQDthKBS'

export interface SocialLink {
  label: string
  href: string
  icon: 'x' | 'telegram' | 'dexscreener' | 'dextools' | 'solscan' | 'globe'
  description: string
}

export const SITE = {
  name: 'CARTOON AI',
  ticker: '$CARTOON',
  displayName: 'CARTOON AI // $CARTOON',
  handle: 'CARTOON_SOL',
  handleUrl: 'https://x.com/CartoonAiCoin',
  bio: 'Exciting journey to childhood through AI technologies',
  chain: 'Solana',
  network: 'pump.fun / Raydium',
  joined: 'August 2024',
  location: 'USA',
  officialWebsite: 'http://cartoonai.tech',
  telegram: 'https://t.me/cartoonaicoin',
  contractAddress: CONTRACT_ADDRESS,
  pairAddress: PAIR_ADDRESS,
  explorerLinks: {
    dexscreener: `https://dexscreener.com/solana/${PAIR_ADDRESS}`,
    dextools: `https://www.dextools.io/app/en/solana/pair-explorer/${PAIR_ADDRESS}`,
    solscan: `https://solscan.io/token/${CONTRACT_ADDRESS}`,
  },
} as const

export const NAV_LINKS = [
  { href: '#top', label: 'Home' },
  { href: '#universe', label: 'Universe' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#updates', label: 'Updates' },
  { href: '#community', label: 'Community' },
  { href: '#token', label: '$CARTOON' },
] as const

/**
 * Creator Hub routes. These are hash routes handled by the app's own tiny
 * router (App.tsx) rather than the in-page section anchors above, so the
 * existing sections and their scroll-spy navigation are untouched.
 */
export const CREATOR_ROUTES = {
  studio: '#create',
  community: '#community-hub',
} as const

/** The app-launcher entry point shown in the header, next to the Follow button. */
export const CREATOR_LAUNCHER = {
  label: 'AI Creator',
  href: CREATOR_ROUTES.studio,
  description: 'Open the Cartoon AI Creator Studio',
  icon: 'wand',
} as const

/** The four tools reachable from the Creator Hub. */
export const CREATOR_TOOLS = [
  {
    id: 'studio',
    href: CREATOR_ROUTES.studio,
    label: 'AI Cartoon Creator',
    text: 'Upload a photo and turn it into cartoon artwork.',
    icon: 'wand',
  },
  {
    id: 'meme',
    href: `${CREATOR_ROUTES.studio}?tool=meme`,
    label: 'Cartoon Meme Maker',
    text: 'Add captions and export a shareable meme.',
    icon: 'image',
  },
  {
    id: 'gallery',
    href: CREATOR_ROUTES.community,
    label: 'Community Gallery',
    text: 'Browse and share approved creations.',
    icon: 'users',
  },
  {
    id: 'challenges',
    href: `${CREATOR_ROUTES.community}?tab=challenges`,
    label: 'Cartoon Challenges',
    text: 'Join a creative challenge and submit an entry.',
    icon: 'sparkle',
  },
] as const

export const FOOTER_LINKS: SocialLink[] = [
  {
    label: 'X / Twitter',
    href: SITE.handleUrl,
    icon: 'x',
    description: 'The project account: @CARTOON_SOL',
  },
  {
    label: 'Telegram',
    href: SITE.telegram,
    icon: 'telegram',
    description: 'Community chat @cartoon_Labs',
  },
  {
    label: 'Dex Screener',
    href: SITE.explorerLinks.dexscreener,
    icon: 'dexscreener',
    description: 'Live pair chart and community updates',
  },
  {
    label: 'Dex Tools',
    href: SITE.explorerLinks.dextools,
    icon: 'dextools',
    description: 'Pair explorer on DEXTools',
  },
  {
    label: 'Solscan',
    href: SITE.explorerLinks.solscan,
    icon: 'solscan',
    description: 'Token contract on Solana',
  },
  {
    label: 'cartoonai.tech',
    href: SITE.officialWebsite,
    icon: 'globe',
    description: 'The product site linked from the X bio',
  },
]

/** Three product cards — copy quoted from the official cartoonai.tech snapshot. */
export const FEATURE_CARDS = [
  {
    id: 'llm',
    tag: 'LLM',
    title: 'LLM',
    text: 'We are using LLM models to improve your prompts for smoother and better generation',
    image: '/assets/characters/card-llm.png',
    icon: '/assets/characters/icon-llm.png',
  },
  {
    id: 'animate',
    tag: 'Animate',
    title: 'Animate',
    text: 'Video animation using AI technologies — Animate your favorite characters or memes!',
    image: '/assets/characters/card-animate.png',
    icon: '/assets/characters/icon-animate.png',
  },
  {
    id: 'free',
    tag: 'Free',
    title: 'Free',
    text: 'Download and share our AI with friends!',
    image: '/assets/characters/card-free.png',
    icon: '/assets/characters/icon-free.png',
  },
] as const

/** Quotes lifted verbatim from the official site so the wording stays consistent. */
export const OFFICIAL_COPY = {
  heroLine: 'AI-powered image-to-video generator. Powered by high scalable LLM modules',
  samplePrompt: 'A young couple went on a romantic walk in the park',
  examplesLine:
    'Examples of videos, generated by our AI model. Create your own videos and share it everywhere!',
  generationHint: 'Takes up to 2-3 minutes',
  copyToast: 'copied to clipboard',
} as const
