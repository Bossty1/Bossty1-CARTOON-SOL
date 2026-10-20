import { writeFileSync, readFileSync, existsSync } from 'node:fs'

const cached = new URL('../.data/timeline-utf8.html', import.meta.url)
let html
if (existsSync(cached)) {
  html = readFileSync(cached, 'utf8')
  console.log('using cached timeline-utf8.html')
} else {
  const url = 'https://syndication.twitter.com/srv/timeline-profile/screen-name/CARTOON_SOL'
  const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } })
  if (!res.ok) throw new Error('fetch failed: ' + res.status)
  html = await res.text()
}
const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/)
if (!m) throw new Error('no NEXT_DATA')
const j = JSON.parse(m[1])
const entries = j.props.pageProps.timeline.entries

const fmt = new Intl.DateTimeFormat('en-US', {
  year: 'numeric', month: 'short', day: '2-digit', timeZone: 'UTC',
})

const posts = []
for (const e of entries) {
  const t = e.content?.tweet
  if (!t) continue
  const media = []
  const em = t.extended_entities?.media || []
  for (const mu of em) {
    if (mu.type === 'video' || mu.type === 'animated_gif') {
      const variants = (mu.video_info?.variants || []).filter(v => v.content_type === 'video/mp4')
      variants.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))
      media.push({ type: mu.type, url: variants[0]?.url || mu.media_url_https, poster: mu.media_url_https })
    } else {
      media.push({ type: mu.type, url: mu.media_url_https, poster: mu.media_url_https })
    }
  }
  const createdIso = new Date(t.created_at).toISOString()
  posts.push({
    id: t.id_str,
    created: createdIso,
    dateLabel: fmt.format(new Date(t.created_at)),
    text: t.full_text,
    link: `https://x.com/CARTOON_SOL/status/${t.id_str}`,
    likes: t.favorite_count,
    rts: t.retweet_count,
    replies: t.reply_count,
    media,
  })
}
posts.sort((a, b) => b.created.localeCompare(a.created))
writeFileSync(new URL('../.data/posts.json', import.meta.url), JSON.stringify(posts, null, 2), 'utf8')
console.log('posts:', posts.length, 'withMedia:', posts.filter(p => p.media.length).length)
console.log(posts.slice(0, 3).map(p => `${p.dateLabel} :: ${p.text.slice(0, 60).replace(/\n/g, ' ')}`).join('\n'))
