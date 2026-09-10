import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'

export function websiteURL(value) {
  if (typeof value !== 'string' || !value.trim()) return null
  try {
    const url = new URL(value.trim())
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return null
    const host = url.hostname.toLowerCase()
    if (isIP(host.replace(/^\[|\]$/g, '')) || !host.includes('.') || /\.(local|internal|localhost|test|invalid)$/.test(host)) return null
    return url.href
  } catch { return null }
}

export function eligibleRepositories(repos, organization) {
  if (!Array.isArray(repos)) throw new Error('Expected a GitHub repository array')
  const unique = new Map()
  for (const repo of repos) {
    const website = websiteURL(repo.homepage)
    if (repo.private !== false || repo.visibility === 'private' || repo.owner?.login?.toLowerCase() !== organization.toLowerCase() || !website) continue
    const source = websiteURL(repo.html_url)
    if (!source || !repo.name) throw new Error('Incomplete public repository metadata')
    unique.set(repo.id ?? repo.full_name, {
      name: repo.name, source, configuredWebsite: website, website,
      description: typeof repo.description === 'string' ? repo.description : '',
      topics: Array.isArray(repo.topics) ? repo.topics.filter(x => typeof x === 'string') : [],
      language: repo.language || null, archived: repo.archived === true, fork: repo.fork === true,
    })
  }
  return [...unique.values()].sort((a, b) => a.name.localeCompare(b.name, 'en'))
}

export async function readOrganization(organization, token, fetcher = fetch) {
  const repos = []
  for (let page = 1; page <= 100; page++) {
    const url = `https://api.github.com/orgs/${encodeURIComponent(organization)}/repos?type=public&per_page=100&sort=full_name&direction=asc&page=${page}`
    const headers = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2026-03-10', 'User-Agent': 'renocrypt-appautomaton-directory' }
    if (token) headers.Authorization = `Bearer ${token}`
    const res = await fetcher(url, { headers, signal: AbortSignal.timeout(20000) })
    if (!res.ok) throw new Error(`GitHub metadata request failed (${res.status}), page ${page}`)
    const batch = await res.json()
    if (!Array.isArray(batch)) throw new Error('GitHub returned malformed metadata')
    repos.push(...batch)
    if (batch.length < 100) return repos
  }
  throw new Error('GitHub pagination exceeded its safety limit')
}

export function publicAddress(ip) {
  if (isIP(ip) === 4) {
    const [a,b] = ip.split('.').map(Number)
    return !(a === 0 || a === 10 || a === 127 || a >= 224 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127))
  }
  return isIP(ip) === 6 && !/^(::|fc|fd|fe[89ab])/i.test(ip)
}

async function publicHost(url) {
  const addresses = await lookup(new URL(url).hostname, { all: true })
  if (!addresses.length || addresses.some(a => !publicAddress(a.address))) throw new Error('Website resolves to a non-public address')
}

// Resolve only permanent moves. About metadata remains the source of each URL.
// No GitHub token is ever sent to website hosts.
export async function resolveWebsite(initial, fetcher = fetch, checkHost = publicHost) {
  let current = initial
  const visited = new Set()
  for (let i = 0; i < 6; i++) {
    if (visited.has(current)) throw new Error('Website redirect loop')
    visited.add(current)
    await checkHost(current)
    const res = await fetcher(current, { method: 'HEAD', redirect: 'manual', signal: AbortSignal.timeout(10000) })
    if ([301, 308].includes(res.status)) {
      const location = res.headers.get('location')
      const next = location && websiteURL(new URL(location, current).href)
      if (!next) throw new Error('Unsafe or missing redirect destination')
      current = next
      continue
    }
    if (res.status >= 400 && ![403,405,429].includes(res.status)) throw new Error(`Website returned HTTP ${res.status}`)
    return current
  }
  throw new Error('Too many permanent redirects')
}

export const departments = [
  { id: 'agents', name: 'Agent craft', words: /agent|skill|mcp|orchestrat|coding/, icon: 'spark' },
  { id: 'sound', name: 'Sound & motion', words: /speech|audio|music|asr|tts|video|sound/, icon: 'wave' },
  { id: 'vision', name: 'Vision & space', words: /vision|3d|spatial|image|mesh|depth|geometry/, icon: 'orbit' },
  { id: 'science', name: 'Scientific work', words: /scientific|atomistic|molecular|dft|research|arxiv|latex/, icon: 'atom' },
  { id: 'systems', name: 'Working systems', words: /docker|container|parser|markdown/, icon: 'weave' },
]
export function department(repo) {
  const words = [repo.name, ...repo.topics].join(' ').toLowerCase()
  // Specific materials take precedence over general agent vocabulary.
  for (const id of ['sound','vision','science','systems','agents']) {
    const item = departments.find(d => d.id === id)
    if (item.words.test(words)) return item
  }
  return { id: 'other', name: 'Open explorations', icon: 'flower' }
}
export function editorial(text) {
  return text.replace(/\s*[—–]\s*/g, ': ').replace(/;\s*([a-z])/g, (_, first) => '. ' + first.toUpperCase()).replace(/;\s*/g, '. ').replace(/\s+/g, ' ').trim()
}
export const escapeHTML = text => String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))
