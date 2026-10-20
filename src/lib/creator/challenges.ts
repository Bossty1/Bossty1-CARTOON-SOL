/**
 * Challenge configuration.
 *
 * Kept as plain data so a new challenge is a config change, not a code change.
 * Status is derived from the dates so an entry cannot claim to be "live" after
 * its window has closed. No prizes, tokens or cash are attached — matching the
 * site's rule of not promising rewards it cannot guarantee.
 */

export interface Challenge {
  id: string
  title: string
  description: string
  startISO: string
  endISO: string
  cover?: string
  prompt: string
}

export const CHALLENGES: Challenge[] = [
  {
    id: 'childhood-2025',
    title: 'Bring Your Childhood to Life',
    description:
      'Create a cartoon inspired by a childhood memory, a favourite toy, or an imaginary world you used to draw.',
    startISO: '2025-06-01T00:00:00.000Z',
    endISO: '2026-12-31T23:59:59.000Z',
    cover: '/media/photo-1892748455820275867.jpg',
    prompt: 'A kid and their favourite toy in a wild imaginary world',
  },
]

export type ChallengeStatus = 'upcoming' | 'live' | 'closed'

export function challengeStatus(challenge: Challenge, now = Date.now()): ChallengeStatus {
  const start = Date.parse(challenge.startISO)
  const end = Date.parse(challenge.endISO)
  if (now < start) return 'upcoming'
  if (now > end) return 'closed'
  return 'live'
}

export function challengeById(id: string | null | undefined): Challenge | undefined {
  if (!id) return undefined
  return CHALLENGES.find((c) => c.id === id)
}
