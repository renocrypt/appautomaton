# Open by nature

A field guide to a workshop. Botanical geometry meets public software, with
an invitation to explore rather than a fixed image to admire.

The sense of scale and editorial rhythm draws from Madame Polare. The artwork,
colors, typography, and copy belong to this guide. Basteleur gives the display
type its sculpted silhouette. Apfel Grotezk keeps navigation and project
information clear. Both are licensed, self-hosted fonts.

## Color and composition

| Role | Day | Night |
| --- | --- | --- |
| Paper | `#f2f0df` | `#182820` |
| Main ink | `#273d2d` | `#e5e9cb` |
| Secondary ink | `#52604d` | `#b5bfa7` |
| Lilac | `#c5c7ec` | `#bfc0df` |
| Small accent | `#c8502c` | `#ef9c75` |

The opening sculpture is an original eight-blade drawing with folded surfaces,
engraved lines, an orbital frame, and a rosette at its center. Its layers move
at different speeds. Each blade opens independently, while pointer and scroll
movement change the perspective. “Turn a new leaf” cycles through three
arrangements. Keyboard and touch users can explore the same forms.

The project plates use eight drawing families: iris, interference, orbit,
pleats, current, lattice, ribbon, and seed. Each has four structural variations.
A stable hash of the repository name selects the family, variation, orientation,
and phase at build time. There is no project list or URL-to-artwork map to edit.
Adding a repository does not reassign another repository's drawing. Renaming a
repository may give it a different drawing.

Subject colors and small topic marks connect the plates to their metadata.
The large drawing has its own form and movement. Real labels and numbering use
full-contrast ink. Decorative lines can be quieter without carrying information.

## Motion as an enhancement

All content, headings, descriptions, destinations, and structured data are
present in the initial HTML. The main heading never waits behind a reveal.
Scroll is native. There is no loading curtain, scroll interception, canvas,
WebGL renderer, third-party animation library, or runtime data request.

CSS transforms move independently composited HTML layers containing SVGs.
Continuous motion does not rewrite SVG paths, gradients, shadows, or layout.
An intersection observer enables animation only while the relevant artwork is
onscreen. Background tabs pause animation. The hero's event-driven frame loop
stops once its small pointer or scroll response settles.

Filtering changes visibility immediately. Visible results receive a short
position transition, with obsolete animation canceled on further input. A
native View Transition adds a brief palette dissolve where supported. Other
browsers change palette directly. Neither feature is required to read or follow
any link.

The Motion control persists the reader's preference. The operating system's
reduced-motion setting always wins. It disables continuous and interaction
animation, including view transitions. Changing the flower arrangement still
works instantly. With JavaScript disabled, the complete static composition and
all project links remain available, and inactive controls stay hidden.

## Engineering limits and review

The publication check enforces compressed budgets of 6 KiB for browser
JavaScript and 9 KiB for CSS. Assets are fingerprinted. Font files are local and
preloaded. Artwork dimensions are reserved by aspect ratio. The site remains a
plain HTML, CSS, and JavaScript project with a Node standard-library build.

Review changes at narrow phone, tablet, desktop, and wide desktop widths in
both palettes. Exercise keyboard navigation, combined search and filtering,
empty results, rapid changes, all flower arrangements, motion pausing,
reduced motion, and the page without JavaScript. Check the detailed audit
findings as well as headline scores, and measure the live deployment after
publication. Laboratory results vary and do not promise search rankings.

Project descriptions remain their maintainers' words. Normalize punctuation
without inventing performance, licensing, or authorship claims.
