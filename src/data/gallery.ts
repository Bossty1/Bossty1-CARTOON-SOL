import { GALLERY, type GalleryItem } from './content'
import { BRAND_ITEMS, type BrandItem } from './official'

export type GalleryFilter = 'all' | 'photo' | 'video' | 'brand'

export interface GalleryEntry {
  id: string
  kind: 'photo' | 'video'
  src: string
  thumb: string
  title: string
  caption: string
  dateLabel: string
  created: string
  link?: string
  likes?: number
  replies?: number
  source: 'timeline' | 'official'
}

export const GALLERY_FILTERS: { id: GalleryFilter; label: string }[] = [
  { id: 'all', label: 'Everything' },
  { id: 'photo', label: 'Photos' },
  { id: 'video', label: 'Videos' },
  { id: 'brand', label: 'Official art' },
]

const shortLabel = (caption: string) => {
  const firstLine = caption.split('\n')[0].trim()
  return firstLine.length > 72 ? `${firstLine.slice(0, 69).trimEnd()}…` : firstLine
}

const fromTimeline = (item: GalleryItem): GalleryEntry => ({
  id: item.id,
  kind: item.kind,
  src: item.src,
  thumb: item.thumb,
  title: shortLabel(item.caption),
  caption: item.caption,
  dateLabel: item.dateLabel,
  created: item.created,
  link: item.link,
  likes: item.likes,
  replies: item.replies,
  source: 'timeline',
})

const fromBrand = (item: BrandItem): GalleryEntry => ({
  id: item.id,
  kind: item.kind,
  src: item.src,
  thumb: item.thumb ?? item.src,
  title: item.title,
  caption: item.caption,
  dateLabel: item.dateLabel ?? 'cartoonai.tech',
  created: '',
  link: item.link,
  source: 'official',
})

export const GALLERY_ENTRIES: GalleryEntry[] = [
  ...GALLERY.map(fromTimeline),
  ...BRAND_ITEMS.map(fromBrand),
]

export const filterGallery = (entries: GalleryEntry[], filter: GalleryFilter): GalleryEntry[] => {
  if (filter === 'all') return entries
  if (filter === 'brand') return entries.filter((entry) => entry.source === 'official')
  return entries.filter((entry) => entry.kind === filter)
}
