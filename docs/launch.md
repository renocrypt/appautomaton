# Launch dependency

Current publication is a noindex preview on GitHub Pages. The intended custom
hostname is `appautomaton.renocrypt.com`; it is not assigned by this repository.

On 2026-09-09 the old catalog moved to `appautomaton.com`. Cloudflare currently
redirects the old hostname and all paths there. Google accepted a whole-host
Change of Address on the same date. The new field guide is different content
under RenoCrypt, so it needs an explicit launch decision before replacing that
redirect. Keep legacy project redirects when assigning new site routes.

Before production:

1. Confirm launch timing with the operator and reconcile the existing Search
   Console migration. It currently tells Google to prefer the new catalog host.
2. Inventory the old URL paths and retain their exact project destinations.
   Update the original repositories’ GitHub About URLs to their new destinations
   before repurposing the old homepage. The build rejects a project link back
   to this directory’s root in production.
3. Set the GitHub Pages custom domain on this repository, verify DNS ownership,
   and obtain HTTPS before changing the public routing.
4. Set `publication` to `production`, build, and verify the intended canonical,
   public indexing directives, project backlinks, and sitemap.
5. Switch the homepage routing, then verify the new page and retained legacy
   redirects from outside the account. Update Search Console for the new content.

Cloudflare routing remains owned by Armada at
`edge/cloudflare/appautomaton.com/README.md`; credentials belong in its wrappers.
This repository must not contain provider credentials or private account reports.
