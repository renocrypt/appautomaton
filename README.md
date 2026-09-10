# App Automaton, a RenoCrypt field guide

A living directory of public App Automaton projects, set in original artwork,
expressive typography, and paired day and night palettes. The site serves plain
HTML, CSS, and JavaScript. There is no npm project or framework.

## The collection has one source

GitHub's public organization API supplies the entries. A repository qualifies
when it belongs to `appautomaton`, is public, and has a valid HTTP(S) website in
its About section (`homepage` in the API). Forked or archived projects are not
silently excluded. Archived status is displayed.

Names, descriptions, topics, and URLs are derived from GitHub, with no project
allowlist or URL map. A build follows permanent website redirects to their
current destinations. If a website cannot be checked, the original About URL
is kept and a warning appears in the Actions summary. API failures and an empty
collection stop publication, leaving the previous deployment in place.

Topic-based filters are broad browsing aids, not editorial rankings.
Source punctuation is normalized for readable presentation without rewriting
project claims. The App Automaton organization website is also linked explicitly
as the main workshop.

## Refresh and publication

[Refresh and publish field guide](https://github.com/renocrypt/appautomaton/actions/workflows/publish.yml) runs:

- Every Monday at 08:23 UTC.
- On a push to `main`.
- On demand through **Actions → Refresh and publish field guide → Run workflow**.
- On pull requests for validation and a downloadable preview, without deployment.

Each successful main-branch run fetches GitHub metadata, renders the site,
checks the output, and deploys the Pages artifact. It does not make automated
source commits. The repository's read-only `GITHUB_TOKEN` handles GitHub API
rate limits; it never reaches project website hosts.

Scheduled Actions can be delayed by GitHub. GitHub may disable schedules in
public repositories after 60 days without repository activity. Re-enable the
workflow from Actions if needed; manual runs remain available when enabled.
No automatic refresh is promised while a schedule is disabled.

## Local work

Use Node 24 or newer. No installation step is required.

```sh
node --test tests/*.test.mjs
node scripts/build.mjs
node scripts/check.mjs
node scripts/serve.mjs
```

Open `http://127.0.0.1:4173/`. For design work without network access, a prior
successful build leaves a local `.cache/source.json`; use
`node scripts/build.mjs --offline`. That mode retains the original About URLs
and is never used by the publication workflow.

The output in `_site/` contains complete HTML links and descriptions, JSON-LD,
a machine-readable `catalog.json`, a plain `llms.txt` edition, robots.txt, a
sitemap, licensed local fonts, and original SVG illustrations. JavaScript only
adds search, filtering, motion, and a persistent theme preference.

## Publication state

Preview: https://renocrypt.github.io/appautomaton/

`site.config.json` starts in **preview** mode. The preview carries `noindex`
and publishes an empty sitemap. It does not claim that the intended production
hostname has been assigned. Production uses a self-canonical collection page
and a sitemap of this site's own pages, not third-party destinations.

The intended hostname is `appautomaton.renocrypt.com`. Its existing redirects
and Google address change must be reconciled before switching it to this site.
See [launch notes](docs/launch.md).

## Art direction and credits

[Design notes](docs/design.md) describe the visual system. Basteleur by Keussel
and contributors, and Apfel Grotezk by Luigi Gorlero, are self-hosted under
SIL OFL 1.1. Licenses are next to the fonts. All SVG drawings were authored for
this project. Madame Polare was studied for scale and rhythm; its assets and
copy are not used here.

Discovery markup helps crawlers understand the collection. It cannot guarantee
rankings, indexing, or inclusion in generated answers.
