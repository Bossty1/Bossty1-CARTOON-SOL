/**
 * Copies the source artwork for each shareable page into public/og/ so every
 * share page has a matching Open Graph image at a stable URL:
 *
 *   src/data/shareables.json  ->  public/og/<slug>.jpg
 *
 * Sources are existing project artwork (official key art, real timeline media),
 * so nothing is re-encoded or fabricated. Run `npm run og` after `npm run sharepages`.
 */
import { readFileSync, mkdirSync, existsSync, copyFileSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const data = JSON.parse(readFileSync(path.join(root, 'src/data/shareables.json'), 'utf8'))
const outDir = path.join(root, 'public/og')
mkdirSync(outDir, { recursive: true })

const MIN_BYTES = 20 * 1024
let ok = 0

for (const p of data.pages) {
  const src = path.join(root, 'public', p.sourceImage.replace(/^\//, ''))
  const dest = path.join(outDir, `${p.slug}.jpg`)

  if (!existsSync(src)) {
    console.warn(`! ${p.slug}: source missing -> ${p.sourceImage}`)
    continue
  }
  if (statSync(src).size < MIN_BYTES) {
    console.warn(`! ${p.slug}: source looks too small (${statSync(src).size} B) -> ${p.sourceImage}`)
    continue
  }

  copyFileSync(src, dest)
  ok++
  console.log(`og/${p.slug}.jpg  <-  ${p.sourceImage} (${statSync(src).size} B)`)
}

const fallback = path.join(outDir, 'default.jpg')
if (!existsSync(fallback)) {
  const src = path.join(root, 'public/assets/brand/og.jpg')
  if (existsSync(src)) {
    copyFileSync(src, fallback)
    console.log('og/default.jpg  <-  /assets/brand/og.jpg')
  }
}

console.log(`og images: ${ok}/${data.pages.length}`)
