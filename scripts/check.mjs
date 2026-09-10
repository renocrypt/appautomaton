import assert from 'node:assert/strict'
import { gzipSync } from 'node:zlib'
import { readFile, access } from 'node:fs/promises'
import { escapeHTML } from './catalog.mjs'
const html=await readFile('_site/index.html','utf8')
const catalog=JSON.parse(await readFile('_site/catalog.json','utf8'))
assert(catalog.projects.length>0,'Empty directory')
assert.equal((html.match(/<article class="project"/g)||[]).length,catalog.projects.length,'Card count differs from GitHub discovery')
for(const p of catalog.projects) {
 assert(html.includes(`href="${escapeHTML(p.website)}"`),`Missing crawlable website link: ${p.name}`)
 assert(html.includes(`href="${escapeHTML(p.source)}"`),`Missing repository link: ${p.name}`)
}
assert.equal((html.match(/<h1\b/g)||[]).length,1,'Expected one page heading')
assert(!/fonts\.googleapis|fonts\.gstatic/.test(html),'Google Fonts are not allowed')
assert(!/[—;]/.test(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'').replace(/<[^>]+>/g,'').replace(/&[a-z#0-9]+;/gi,'')),'Editorial punctuation needs review')
const data=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])
assert.equal(data['@graph'].find(x=>x['@type']==='ItemList').numberOfItems,catalog.projects.length)
for(const match of html.matchAll(/(?:src|href)="(assets\/[^"#?]+)"/g)) await access('_site/'+match[1])
await access('_site/assets/social.png')
assert(html.includes('href="https://appautomaton.com/"'),'Missing main workshop backlink')
const config=JSON.parse(await readFile('site.config.json','utf8'))
assert(html.includes(`content="${config.publication==='production'?'index, follow, max-image-preview:large':'noindex, follow'}"`),'Publication indexing policy is inconsistent')
console.log(`Verified ${catalog.projects.length} crawlable project entries, local assets, publication metadata, and structured data.`)

if (config.publication === 'production') {
 for (const p of catalog.projects) assert(p.website !== config.canonicalOrigin + '/', `Project ${p.name} points back to this directory. Correct its GitHub About URL before cutover.`)
}

const projectMarkup = [...html.matchAll(/<article class="project"[\s\S]*?<\/article>/g)].map(m => m[0]).join('')
for (const anchor of projectMarkup.matchAll(/<a\b([^>]*)>/g)) {
 const rel = anchor[1].match(/\brel\s*=\s*(["'])(.*?)\1/i)?.[2] || ''
 assert(!/\b(nofollow|sponsored|ugc)\b/i.test(rel), 'Project backlinks must allow normal following')
}
if (config.publication === 'production') {
 const sitemap = await readFile('_site/sitemap.xml', 'utf8')
 const robots = await readFile('_site/robots.txt', 'utf8')
 assert(sitemap.includes(`<loc>${config.canonicalOrigin}/</loc>`), 'Production sitemap must include the homepage')
 assert(robots.includes(`Sitemap: ${config.canonicalOrigin}/sitemap.xml`), 'robots.txt must declare the production sitemap')
}

// Keep the progressive enhancement small as the automatically discovered
// collection grows. Artwork is built HTML, never a browser rendering dependency.
for (const [file, limit] of [['app.js', 6*1024], ['style.css', 9*1024]]) {
 const bytes = gzipSync(await readFile('site/assets/' + file)).length
 assert(bytes <= limit, `${file} exceeds its compressed delivery budget: ${bytes}/${limit} bytes`)
 console.log(`${file}: ${bytes} bytes gzip, budget ${limit}`)
}
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1])
assert.equal(new Set(ids).size, ids.length, 'Duplicate DOM or SVG IDs')
for (const article of html.matchAll(/<article\b[^>]*>/g)) {
 assert(!/\bhidden(?:\s|=|>)/.test(article[0]), 'Initial HTML must expose every project without JavaScript')
}
