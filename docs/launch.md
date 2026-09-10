# Publication and migration

The field guide is live at `https://appautomaton.renocrypt.com/`, published
from `renocrypt/appautomaton` through GitHub Actions Pages. Cloudflare's proxied
CNAME points to `renocrypt.github.io`. GitHub enforces HTTPS with a valid origin
certificate. The default GitHub project URL redirects to the custom hostname.

The old organization catalog lives at `https://appautomaton.com/`. Cloudflare
preserves the 16 legacy project paths and their descendants with 301 redirects,
including query strings. The former whole-host redirect is disabled. New site
routes must not collide with those preserved legacy paths.

Production publication allows indexing of the homepage and colophon, with
self-canonical metadata and a sitemap of those pages. Outgoing project links
are rendered as ordinary HTML links without restrictive rel attributes.

The original organization landing repository's About URL is corrected to
`https://appautomaton.com/`. All 17 approved repository About URLs now point directly to `appautomaton.com`.
Metadata within the individual project pages remains a separate migration task.
Legacy redirects continue to protect existing external links.

The obsolete whole-site Google Change of Address has been canceled, and Google
accepted the new sitemap submission. Account state and Cloudflare routing
belong in Armada's `edge/cloudflare/appautomaton.com/README.md`.
Provider credentials and private account observations do not belong here.
