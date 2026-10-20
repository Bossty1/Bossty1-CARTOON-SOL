/**
 * Community store.
 *
 * The root site is a static build with no server, so submissions and their
 * moderation state live in `localStorage` under a single namespaced key. This
 * is honest about its limits: nothing is sent anywhere, "approved" items are
 * only visible in the browser that created them, and the moderation action is a
 * local stand-in for a real admin workflow. Images are stored as data URLs so a
 * submission survives a reload without a backend.
 *
 * When a backend is added later, swap the three functions below for API calls —
 * the rest of the UI only depends on this interface.
 */

export type ModerationStatus = 'pending' | 'approved' | 'rejected'

export interface Submission {
  id: string
  title: string
  description: string
  style: string
  creator?: string
  imageDataUrl: string
  createdAt: number
  status: ModerationStatus
  likes: number
  challengeId?: string
  engine: string
  engineIsAi: boolean
}

const KEY = 'cartoon-ai:community:v1'
const MAX_ITEMS = 60
const MAX_DATA_URL = 900_000 // ~900KB per stored image, keeps localStorage sane

function readAll(): Submission[] {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Submission[]) : []
  } catch {
    return []
  }
}

function writeAll(items: Submission[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX_ITEMS)))
  } catch {
    /* storage full or blocked — the UI still works for the current session */
  }
}

export const communityStore = {
  list(): Submission[] {
    return readAll().sort((a, b) => b.createdAt - a.createdAt)
  },

  listPublic(): Submission[] {
    return this.list().filter((item) => item.status === 'approved')
  },

  get(id: string): Submission | undefined {
    return readAll().find((item) => item.id === id)
  },

  add(input: Omit<Submission, 'id' | 'createdAt' | 'status' | 'likes'>): Submission {
    const item: Submission = {
      ...input,
      id: `sub_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: Date.now(),
      status: 'pending',
      likes: 0,
    }
    if (item.imageDataUrl.length > MAX_DATA_URL) {
      throw new Error('That image is too large to store locally. Try a smaller one.')
    }
    writeAll([item, ...readAll()])
    return item
  },

  setStatus(id: string, status: ModerationStatus) {
    const items = readAll()
    const item = items.find((i) => i.id === id)
    if (!item) return
    item.status = status
    writeAll(items)
  },

  like(id: string, voter: string) {
    const items = readAll()
    const item = items.find((i) => i.id === id)
    if (!item) return
    const voters = new Set<string>(
      (item as Submission & { voters?: string[] }).voters ?? [],
    )
    if (voters.has(voter)) return
    voters.add(voter)
    item.likes += 1
    ;(item as Submission & { voters?: string[] }).voters = [...voters]
    writeAll(items)
  },
}

/** A stable per-browser id so one visitor counts once per submission. */
export function visitorId(): string {
  const key = 'cartoon-ai:visitor'
  let id = window.localStorage.getItem(key)
  if (!id) {
    id = `v_${Math.random().toString(36).slice(2, 10)}`
    window.localStorage.setItem(key, id)
  }
  return id
}

export async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('The image could not be read.'))
    reader.readAsDataURL(blob)
  })
}
