import { readFile, writeFile, mkdir, cp } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { eligibleRepositories, readOrganization, resolveWebsite, department, editorial, escapeHTML as e } from './catalog.mjs'
import { icon, bloom } from './icons.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const config = JSON.parse(await readFile(join(root, 'site.config.json'), 'utf8'))
const out = join(root, '_site')
const offline = process.argv.includes('--offline')
const cache = join(root, '.cache/source.json')
const preview = config.publication !== 'production'
const source = offline ? JSON.parse(await readFile(cache, 'utf8')) : await readOrganization(config.organization, process.env.GITHUB_TOKEN)
const projects = eligibleRepositories(source, config.organization)
if (!projects.length) throw new Error('No eligible public projects. Keeping the previous deployment.')
const warnings = []
if (!offline) {
  for (let i = 0; i < projects.length; i += 6) {
    await Promise.all(projects.slice(i, i + 6).map(async project => {
      try { project.website = await resolveWebsite(project.configuredWebsite) }
      catch (error) { warnings.push(`${project.name}: ${error.message}. Retained the About URL.`) }
    }))
  }
  await mkdir(join(root, '.cache'), { recursive: true })
  await writeFile(cache, JSON.stringify(source, null, 2))
} else {
  // An offline build is for local design review only, with original About URLs.
  warnings.push('Offline preview uses the saved GitHub snapshot and does not check redirects.')
}
const date = new Date().toISOString().slice(0,10)
const dateLabel = new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(date))
const groups = [...new Map(projects.map(p => { const g = department(p); return [g.id, g] })).values()]
const description = `A field guide to ${projects.length} public App Automaton projects. Explore tools for coding agents, sound, vision, and scientific work, collected by RenoCrypt.`
const canonical = `${config.canonicalOrigin}/`
const graph = {
 '@context': 'https://schema.org', '@graph': [
  { '@type':'WebSite','@id':`${canonical}#website`,url:canonical,name:'App Automaton · A RenoCrypt field guide',publisher:{'@id':'https://www.renocrypt.com/#organization'} },
  { '@type':'Organization','@id':'https://www.renocrypt.com/#organization',name:'RenoCrypt',url:'https://www.renocrypt.com/' },
  { '@type':'CollectionPage','@id':`${canonical}#page`,url:canonical,name:'Open by nature. An App Automaton field guide.',description,isPartOf:{'@id':`${canonical}#website`},relatedLink:config.mainWebsite,mainEntity:{'@id':`${canonical}#collection`} },
  { '@type':'ItemList','@id':`${canonical}#collection`,name:'Public App Automaton project websites',numberOfItems:projects.length,itemListElement:projects.map((p,i)=>({'@type':'ListItem',position:i+1,item:{'@type':'SoftwareSourceCode',name:p.name,description:editorial(p.description),url:p.website,codeRepository:p.source}})) }
 ]
}
const projectCards = projects.map((p,i) => {
 const group = department(p)
 const desc = editorial(p.description) || `Explore ${p.name}, a public project from App Automaton.`
 const number = String(i + 1).padStart(2,'0')
 const hostname = new URL(p.website).hostname
 const title = e(p.name).replaceAll('-', '-<wbr>').replaceAll('.', '.<wbr>')
 return `<article class="project" id="project-${e(p.name)}" data-category="${group.id}" data-search="${e([p.name,desc,...p.topics].join(' ').toLowerCase())}">
 <div class="project-plate plate-${group.id}" aria-hidden="true"><span class="plate-number">${number}</span>${icon(group.icon,'plate-mark')}<span class="plate-note">${e(group.name)}</span><div class="plate-corner">↗</div></div>
 <div class="project-body"><div class="project-meta"><span>${e(group.name)}</span><span>${p.archived ? 'Archived' : p.language ? e(p.language) : 'Public project'}</span></div>
 <h3><a href="${e(p.website)}">${title}</a></h3><p>${e(desc)}</p>
 <div class="project-links"><a class="visit" href="${e(p.website)}">Visit project<span class="sr-only">: ${e(p.name)}</span>${icon('arrow')}</a><a class="source-link" href="${e(p.source)}" aria-label="${e(p.name)} source on GitHub">Source ↗</a></div>
 <span class="site-address">${e(hostname + new URL(p.website).pathname)}</span></div></article>`
}).join('\n')
const html = `<!doctype html>
<html lang="en" data-theme="day"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>App Automaton · Open by nature · A RenoCrypt field guide</title>
<meta name="description" content="${e(description)}"><meta name="robots" content="${preview ? 'noindex, follow' : 'index, follow, max-image-preview:large'}">
<link rel="canonical" href="${canonical}"><meta name="theme-color" content="#f2f0df">
<meta property="og:type" content="website"><meta property="og:site_name" content="App Automaton · RenoCrypt"><meta property="og:title" content="Open by nature. An App Automaton field guide."><meta property="og:description" content="${e(description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${canonical}assets/social.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Open by nature. A field guide to App Automaton, by RenoCrypt."><meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml"><link rel="preload" href="assets/fonts/Basteleur-Bold.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="assets/fonts/ApfelGrotezk-Regular.woff2" as="font" type="font/woff2" crossorigin>
<script>try{const t=localStorage.getItem('field-theme');document.documentElement.dataset.theme=t|| (matchMedia('(prefers-color-scheme: dark)').matches?'night':'day')}catch{}</script>
<link rel="stylesheet" href="assets/style.css"><script type="application/ld+json">${JSON.stringify(graph).replaceAll('<','\\u003c')}</script><script src="assets/app.js" defer></script>
</head><body>
<a class="skip" href="#collection">Skip to the projects</a>
<header class="masthead" id="top"><a class="wordmark" href="#top" aria-label="App Automaton field guide home">${icon('flower')}<span>APP<br>AUTOMATON</span></a><span class="masthead-note">A FIELD GUIDE<br>BY RENOCRYPT</span><nav aria-label="Main"><a href="#collection">The collection <sup>${projects.length}</sup></a><a href="#colophon">Our intention</a><button class="theme-toggle" type="button" aria-label="Switch to night palette" hidden>${icon('sun','sun')}${icon('moon','moon')}<span class="theme-label">Night</span></button></nav></header>
<main>
<section class="hero" aria-labelledby="hero-title"><div class="hero-kicker"><span>INDEPENDENT TOOLS. SHARED POSSIBILITIES.</span><span>VOLUME 001 <span class="tiny-star">✳</span></span></div>
<div class="hero-stage"><h1 id="hero-title"><span class="hero-open">Open</span><span class="hero-nature">by nature.</span></h1><div class="hero-object">${bloom()}<span class="object-caption">FIG. 01 / AN IDEA TAKING SHAPE</span></div></div>
<div class="hero-bottom"><p>A small field guide to a wider world.<br>Discover what App Automaton is making<br>for curious minds and capable machines.</p><a class="round-link" href="#collection"><span>Wander through<br>the collection</span><span class="round-arrow">↓</span></a><span class="hero-edition">${projects.length} OPEN DOORS<br>ONE SHARED WORKSHOP</span></div></section>
<div class="ribbon" aria-hidden="true"><div><span>Made to be explored</span>${icon('spark')}<span>Open to possibility</span>${icon('flower')}<span>Made to be explored</span>${icon('spark')}<span>Open to possibility</span>${icon('flower')}</div></div>
<section class="intro" aria-labelledby="intro-title"><span class="section-label">01 / THE IDEA</span><div><h2 id="intro-title">Good tools make<br>room for <em>what if.</em></h2><p>Words become working code. Sound finds a voice. Images open into three dimensions. This is a collection of public projects from App Automaton, brought together by RenoCrypt for the pleasure of finding something useful.</p><a class="text-link" href="${e(config.mainWebsite)}">Meet the App Automaton workshop ${icon('arrow')}</a></div><div class="intro-drawing" aria-hidden="true">${icon('orbit')}<span>ALWAYS A WORK IN PROGRESS</span></div></section>
<section class="collection" id="collection" aria-labelledby="collection-title"><div class="collection-heading"><div><span class="section-label">02 / THE COLLECTION</span><h2 id="collection-title">Follow your<br><span>curiosity.</span></h2></div><div class="collection-aside"><span class="collection-count">${String(projects.length).padStart(2,'0')}</span><p>Public projects with<br>a place of their own.</p></div></div>
<form class="catalog-tools" role="search" hidden><div class="filters" aria-label="Filter projects by subject"><button type="button" class="filter active" data-filter="all" aria-pressed="true">Everything <span>${projects.length}</span></button>${groups.map(g=>`<button type="button" class="filter" data-filter="${g.id}" aria-pressed="false">${e(g.name)}</button>`).join('')}</div><label class="search"><span class="sr-only">Search projects</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/></svg><input type="search" placeholder="Something in mind?" autocomplete="off" spellcheck="false" aria-label="Search projects"><kbd>/</kbd></label></form>
<p class="filter-status sr-only" aria-live="polite"></p><div class="projects">${projectCards}</div><div class="empty" hidden><h3>A little further afield.</h3><p>No projects match this search. Try another word, or explore the whole collection.</p><button type="button" class="reset-search">Show everything ↗</button></div>
<div class="collection-foot"><span>Last gathered <time datetime="${date}">${dateLabel}</time></span><a href="${e(config.repository)}">How this guide is made ↗</a></div></section>
<section class="colophon" id="colophon" aria-labelledby="colophon-title"><span class="section-label">03 / A NOTE FROM RENOCRYPT</span><div class="colophon-grid"><h2 id="colophon-title">A living index.<br>A human<br><span>point of view.</span></h2><div class="colophon-copy"><p>We like tools that invite you in. Things you can inspect, understand, and make your own.</p><p>Every entry here is a public App Automaton repository with a website in its GitHub About section. The collection refreshes each week. The projects, and the people behind them, supply the substance.</p><p>RenoCrypt gives the collection a different setting. App Automaton is where the work lives.</p><a class="text-link" href="${e(config.mainWebsite)}">Explore App Automaton ${icon('arrow')}</a><div class="colophon-mark" aria-hidden="true">${icon('spark')}</div></div></div></section>
</main><footer><div class="footer-top"><a href="https://www.renocrypt.com/">A RENOCRYPT CREATION ↗</a><div><a href="${e(config.mainWebsite)}">App Automaton ↗</a><a href="${e(config.repository)}">Source ↗</a><a href="llms.txt">Text edition ↗</a><a href="credits.html">Colophon ↗</a></div><a href="#top">Back to the light ↑</a></div><div class="footer-word" aria-hidden="true">Stay curious.</div><div class="footer-bottom"><span>INDEPENDENT IN SPIRIT. OPEN BY NATURE.</span><span>© ${date.slice(0,4)} RENOCRYPT</span></div></footer>
</body></html>`
await mkdir(out, { recursive: true })
await cp(join(root,'site/assets'), join(out,'assets'), { recursive: true })
await writeFile(join(out, 'index.html'), html)
await writeFile(join(out,'catalog.json'),JSON.stringify({organization:config.organization,gatheredAt:date,projects},null,2)+'\n')
await writeFile(join(out,'robots.txt'),`User-agent: *\nAllow: /\n${preview ? '# Preview carries a noindex directive in each HTML page.\n' : `\nSitemap: ${canonical}sitemap.xml\n`}`)
await writeFile(join(out,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${preview?'':`<url><loc>${canonical}</loc></url><url><loc>${canonical}credits.html</loc></url>`}</urlset>\n`)
await writeFile(join(out,'llms.txt'),`# App Automaton: a RenoCrypt field guide\n\n> ${description}\n\nPublisher: https://www.renocrypt.com/\nMain workshop: ${config.mainWebsite}\nUpdated: ${date}\nSource: ${config.repository}\n\n## Project websites\n\n${projects.map(p=>`- [${p.name}](${p.website}): ${editorial(p.description)}`).join('\n')}\n`)
await writeFile(join(out,'credits.html'),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="${preview?'noindex, follow':'index, follow'}"><title>Colophon · App Automaton field guide</title><meta name="description" content="The typefaces, drawings, and principles behind RenoCrypt’s App Automaton field guide."><link rel="canonical" href="${canonical}credits.html"><link rel="stylesheet" href="assets/style.css"></head><body><main class="credits"><a href="./">← Back to the field guide</a><h1>The colophon.</h1><p>Original art direction, SVG illustrations, and interface for RenoCrypt.</p><h2>Type with a point of view.</h2><p>Basteleur by Keussel, with contributions by George Triantafyllakos, from <a href="https://gitlab.com/velvetyne/basteleur">Velvetyne</a>. Apfel Grotezk by Luigi Gorlero, from <a href="https://github.com/collletttivo/apfel-grotezk">Collletttivo</a>. Both are self-hosted under the SIL Open Font License. <a href="assets/fonts/Basteleur-LICENSE.txt">Basteleur license</a>. <a href="assets/fonts/ApfelGrotezk-LICENSE.txt">Apfel Grotezk license</a>.</p><h2>Collected at the source.</h2><p>Project names, descriptions, topics, and website destinations come from the public GitHub API. Only public App Automaton repositories with a valid About website URL qualify. Permanent redirects are followed at build time. This guide does not claim authorship of the listed projects.</p><h2>A point of departure.</h2><p><a href="https://madamepolare.com/en">Madame Polare</a> inspired the generous scale and rhythm. The typography, colors, artwork, and content here were developed for this field guide.</p><a href="${e(config.repository)}">Read the source ↗</a></main></body></html>`)
await writeFile(join(out,'404.html'),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>A little off the path · RenoCrypt</title></head><body style="background:#f2f0df;color:#273d2d;font:24px Georgia;padding:12vw"><h1>A little off the path.</h1><p>This page is not part of the field guide.</p><a href="${canonical}">Return to the collection</a></body></html>`)
await writeFile(join(out,'.nojekyll'),'')
for (const warning of warnings) console.warn(`Warning: ${warning}`)
console.log(`Built ${projects.length} public project entries. Publication: ${preview?'preview (noindex)':'production'}.`)
if (process.env.GITHUB_STEP_SUMMARY) await writeFile(process.env.GITHUB_STEP_SUMMARY,`## Field guide build\n\n${projects.length} public projects with About website URLs. ${warnings.length} warnings.\n\n${warnings.map(w=>`- ${w}`).join('\n')}\n`)
