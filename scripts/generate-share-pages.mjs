/**
 * Generates static, shareable landing pages from src/data/shareables.json.
 *
 *   npm run sharepages            -> writes public/share/<slug>.html
 *   SITE_URL=https://site.com npm run sharepages
 *                                 -> makes every canonical/OG URL absolute
 *
 * OG images are placed next to these pages by `npm run og`.
 * The pages are plain HTML + inline CSS so they work with no build step and
 * render correctly for social crawlers as well as for people.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const data = JSON.parse(readFileSync(path.join(root, 'src/data/shareables.json'), 'utf8'))
const base = (process.env.SITE_URL || '').replace(/\/+$/, '')
const outDir = path.join(root, 'public/share')
mkdirSync(outDir, { recursive: true })

const esc = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const url = (u) => (u.startsWith('http') ? u : `${base}${u}`)

const FONTS =
  'https://fonts.googleapis.com/css2?family=Delicious+Handrawn&family=Knewave&family=Nunito:ital,wght@0,400;0,700;1,400&display=swap'

const page = (p) => {
  const { site } = data
  const title = `${p.title} | ${site.name}`
  const image = url(p.image)
  const cta = p.cta ? `<a class="cta" href="${esc(p.cta.href)}">${esc(p.cta.label)}</a>` : ''

  let bodyBlock = ''
  if (p.kind === 'prompt') {
    bodyBlock = `
      <div class="prompt" id="prompt">${esc(p.prompt)}</div>
      <button class="btn" type="button" data-copy="${esc(p.prompt)}">Copy prompt</button>`
  } else if (p.kind === 'post') {
    bodyBlock = `
      <figure class="shot">
        <img src="${url(p.sourceImage)}" alt="${esc(p.headline)}" width="1280" height="796" loading="lazy">
        ${p.postLink ? `<figcaption>Posted on X by ${esc(site.handle)}</figcaption>` : ''}
      </figure>
      ${p.postLink ? `<p class="src">Original post: <a href="${esc(p.postLink)}">${esc(p.postLink)}</a></p>` : ''}`
  } else if (p.kind === 'facts') {
    bodyBlock = `
      <dl class="facts">
        ${p.facts
          .map(
            (f) => `<div class="facts__row"><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`,
          )
          .join('')}
      </dl>`
  }

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(p.description)}">
  <link rel="canonical" href="${url(`/share/${p.slug}.html`)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${esc(site.name)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(p.description)}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:alt" content="${esc(p.headline)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="${esc(site.handle)}">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(p.description)}">
  <meta name="twitter:image" content="${image}">
  <link rel="icon" href="${url('/assets/brand/favicon-128.png')}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${FONTS}" rel="stylesheet">
  <style>
    :root{--sky:#a8d8f0;--sky2:#78c0d8;--cream:#f0f0d8;--paper:#fffaf0;--gold:#f0c048;
      --coral:#ff7f50;--brown:#382603;--ink:#303030;--muted:#6d6a60;
      --disp:"Delicious Handrawn",serif;--acc:"Knewave",system-ui,sans-serif;--body:"Nunito",system-ui,sans-serif}
    *{box-sizing:border-box}
    body{margin:0;min-height:100vh;font-family:var(--body);color:var(--ink);line-height:1.6;
      background:linear-gradient(180deg,var(--sky) 0%,#90c0d8 45%,var(--cream) 100%);
      display:flex;flex-direction:column;padding:clamp(16px,4vw,48px)}
    main{width:min(100%,760px);margin:auto;background:var(--paper);border:3px solid var(--brown);
      border-radius:26px;box-shadow:8px 8px 0 rgba(56,38,3,.85);overflow:hidden}
    .top{display:flex;align-items:center;gap:.6rem;padding:14px clamp(16px,4vw,32px);
      border-bottom:3px solid var(--brown);background:rgba(255,250,240,.9)}
    .top img{width:38px;height:38px;border-radius:50%;border:2px solid var(--brown);object-fit:cover}
    .top b{font-family:var(--acc);color:var(--brown);letter-spacing:.02em}
    .top span{margin-left:auto;font-family:var(--acc);font-size:.8rem;color:var(--coral)}
    .body{padding:clamp(20px,5vw,44px);display:grid;gap:1rem}
    .eyebrow{justify-self:start;font-family:var(--acc);font-size:.78rem;letter-spacing:.12em;
      text-transform:uppercase;background:var(--gold);border:2px solid var(--brown);
      border-radius:999px;padding:.2rem .8rem;transform:rotate(-1.2deg);color:var(--brown)}
    h1{font-family:var(--disp);font-weight:400;font-size:clamp(2rem,6vw,3.4rem);line-height:1.05;
      color:var(--brown);margin:0;text-wrap:balance}
    .lead{margin:0;font-size:clamp(1rem,2.4vw,1.15rem);color:#55524b}
    .prompt{font-family:var(--disp);font-size:clamp(1.3rem,4vw,2rem);color:var(--brown);
      background:#fff8e6;border:2px dashed var(--brown);border-radius:14px;padding:1rem 1.1rem;
      transform:rotate(-.5deg);overflow-wrap:anywhere}
    .shot{margin:0}
    .shot img{width:100%;height:auto;border:2px solid var(--brown);border-radius:14px;display:block}
    .shot figcaption,.src{font-size:.82rem;color:var(--muted);margin:.5rem 0 0;overflow-wrap:anywhere}
    .facts{margin:0;display:grid;gap:.55rem;border-top:1px dashed rgba(56,38,3,.3);padding-top:1rem}
    .facts__row{display:grid;grid-template-columns:minmax(88px,140px) 1fr;gap:.6rem;
      font-size:.95rem;border-bottom:1px dashed rgba(56,38,3,.18);padding-bottom:.55rem}
    .facts dt{font-family:var(--acc);color:var(--brown);font-size:.8rem;letter-spacing:.06em;
      text-transform:uppercase}
    .facts dd{margin:0;overflow-wrap:anywhere}
    .btn,.cta{display:inline-flex;justify-content:center;align-items:center;gap:.5rem;
      font-family:var(--acc);text-decoration:none;color:var(--brown);background:var(--coral);
      border:3px solid var(--brown);border-radius:999px;padding:.7rem 1.4rem;box-shadow:4px 4px 0 var(--brown);
      cursor:pointer;font-size:1rem;transition:transform .15s ease}
    .btn:hover,.cta:hover{transform:translate(-2px,-2px)}
    .foot{border-top:3px solid var(--brown);background:var(--cream);padding:16px clamp(16px,4vw,32px);
      display:flex;flex-wrap:wrap;gap:.5rem 1.2rem;font-size:.85rem}
    .foot a{color:var(--brown);font-family:var(--acc)}
    .disclaimer{width:100%;color:var(--muted);font-size:.78rem;margin:.3rem 0 0}
    a{color:var(--brown)}
  </style>
</head>
<body>
  <main>
    <header class="top">
      <img src="${url('/assets/brand/x-avatar.jpg')}" alt="" width="38" height="38">
      <b>${esc(site.name)}</b>
      <span>${esc(site.ticker)}</span>
    </header>
    <div class="body">
      <span class="eyebrow">${esc(p.eyebrow)}</span>
      <h1>${esc(p.headline)}</h1>
      <p class="lead">${esc(p.body)}</p>
      ${bodyBlock}
      ${cta}
    </div>
    <footer class="foot">
      <a href="${esc(site.xUrl)}">X / ${esc(site.handle)}</a>
      <a href="${esc(site.telegram)}">Telegram</a>
      <a href="https://dexscreener.com/solana/9yL9ehBzL6y3i8D4A45SAVVGjBj4F3kKBNrSSQDthKBS">Chart</a>
      <p class="disclaimer">Community information page for the CARTOON AI project. Not financial advice — no price data or forecasts are shown anywhere on this page.</p>
    </footer>
  </main>
  <script>
    document.querySelectorAll('[data-copy]').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        try {
          await navigator.clipboard.writeText(btn.getAttribute('data-copy'))
          var original = btn.textContent
          btn.textContent = 'Copied to clipboard'
          setTimeout(function () { btn.textContent = original }, 2000)
        } catch (e) {
          btn.textContent = 'Copy failed — select the text instead'
        }
      })
    })
  </script>
</body>
</html>
`
}

let written = 0
for (const p of data.pages) {
  const file = path.join(outDir, `${p.slug}.html`)
  if (!existsSync(p.sourceImage.startsWith('/') ? path.join(root, 'public', p.sourceImage) : p.sourceImage)) {
    console.warn(`! skip ${p.slug}: missing source image ${p.sourceImage}`)
    continue
  }
  writeFileSync(file, page(p), 'utf8')
  written++
  console.log(`wrote share/${p.slug}.html`)
}
console.log(`share pages: ${written}/${data.pages.length}${base ? ` (base ${base})` : ' (relative URLs — set SITE_URL for absolute OG links)'}`)
