# App Automaton, a RenoCrypt field guide

This public site lives in `renocrypt/appautomaton`. It lists public repositories
owned by `appautomaton` that have a valid HTTP(S) About website URL.

- HTML, CSS, and browser JavaScript only at runtime. Build scripts use Node's
  standard library. No package.json, npm dependencies, or framework.
- GitHub repository metadata is the source of project names, descriptions,
  topics, and website links. Never maintain a project list or invent project URLs.
- Render every eligible link into the built HTML. Motion, themes, search, and
  filters are progressive enhancements. Respect reduced motion and keyboard use.
- No Google Fonts. Self-host the licensed fonts and retain their licenses.
- All illustrative SVGs are original to this project. Do not copy reference assets.
- Write precise, elegant copy without mid-sentence em dashes or semicolon habits.
- Source branch is main. Weekly and manual builds refresh metadata before
  deployment. API failures must preserve the previous deployment.
- Default publication is a noindex preview. Do not point the production hostname
  here until its existing redirects and Google migration have been reconciled
  with the operator. See docs/launch.md.
