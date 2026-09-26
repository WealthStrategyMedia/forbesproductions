# Forbes Productions US — website

Replacement for the live WordPress site at [forbesproductions.us](https://forbesproductions.us).
Static Astro build, deployed to Netlify's free plan.

Every page, image, form and price on this site was extracted from the live site — see
[CONTENT-PARITY.md](CONTENT-PARITY.md) for the source-by-source map.

Payment and form flows are **deliberately inert** pending the Tweeble integration — see
[PAYMENTS.md](PAYMENTS.md).

---

## Quick start

```bash
npm install
npm run dev
```

Then open http://localhost:4321.

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server on :4321 |
| `npm run build` | Static build into `dist/` |
| `npm run preview` | Serve the built output |
| `npm run check` | Astro/TypeScript diagnostics |
| `node scripts/audit.mjs` | Post-build audit: dead links, missing assets, missing alt/dimensions, page weights |

---

## Stack

- **[Astro](https://astro.build) 5**, `output: 'static'` — zero client framework, no hydration.
  The only JavaScript shipped is a few KB of hand-written vanilla: the lightbox, the mobile nav,
  the ticket calculator, the scroll-reveal observer and the video facade.
- **Self-hosted variable fonts** (`@fontsource-variable`) — Bodoni Moda for display, Inter for UI.
  No external font requests.
- **No CSS framework.** Design tokens live in [`src/styles/global.css`](src/styles/global.css);
  everything else is component-scoped.

### Why images are pre-optimised instead of built

Netlify's free plan allows 300 build minutes a month. Running Astro's image pipeline over 228
photographs on every deploy would eat that quickly and make builds slow and flaky. Instead
`scripts/optimize-media.mjs` generates the WebP derivatives once, locally, into `public/media/`,
and those are committed. `astro build` then does no image work at all and finishes in ~2 seconds.

---

## Project layout

```
public/
  media/thumb/    820px WebP  — grid tiles      (~11 MB total)
  media/full/    1920px WebP  — lightbox/hero   (~20 MB total)
  media/file/                 — the Natasha pitch PDF
  _headers                    — Netlify cache + security headers
src/
  components/    Header, Footer, Lightbox, PhotoGrid, PhotoRail, Figure,
                 TicketPicker, SponsorTiers, StubForm, PendingNotice, …
  data/          site.ts, content.ts, event.ts, legal.ts  (all copy)
                 galleries.json, media-manifest.json      (generated)
  layouts/       Base.astro — head, schema.org, reveal observer
  lib/           media.ts (asset lookup + alt text), forms.ts
  pages/         one file per route
  styles/        global.css — tokens, typography, buttons, layout primitives
scripts/
  optimize-media.mjs   mirror → deduped WebP derivatives + manifest
  build-galleries.mjs  assign every asset to a gallery category
  audit.mjs            post-build checks
```

### Routes

| Route | Replaces on the live site |
| --- | --- |
| `/` | `/` |
| `/about` | `/about` |
| `/brooke-forbes` | `/brooke-forbes` |
| `/natasha` | *(new)* film content that was buried inside `/brooke-forbes` |
| `/events` | `/event` |
| `/events/stained-red-carpet` | `/stained-red-carpet` |
| `/gallery` | `/gallery` + `/image-gallery` |
| `/event-gallery` | `/event-gallery` + `/gallery/images` |
| `/training` | `/training` |
| `/videos` | `/videos` |
| `/news` | `/news` |
| `/contact` | `/contact` |
| `/privacy-policy`, `/terms-and-conditions` | same |
| `/404` | *(new)* |

Old URLs are 301-redirected in [`netlify.toml`](netlify.toml).

---

## Media pipeline

The raw mirror of the live media library is **not** committed (132 MB, 797 files). To regenerate
the derivatives you need that mirror on disk, then:

```bash
node scripts/optimize-media.mjs <rawDir> <extractDir>
node scripts/build-galleries.mjs
```

`optimize-media.mjs` de-duplicates by SHA-1 content hash. The live library stores many photos
several times under `-1` / `-1-1` names; 422 referenced URLs collapse to 229 distinct assets.

To add a new photo by hand: drop a WebP into `public/media/thumb/` and `public/media/full/`, add a
record to `src/data/media-manifest.json`, then re-run `build-galleries.mjs`.

---

## Deploying to Netlify

[`netlify.toml`](netlify.toml) is already configured:

- Build command `npm run build`, publish directory `dist`, Node 20.
- Legacy-URL redirects and a 404 fallback.
- `public/_headers` sets immutable caching on `/media/*` and `/_astro/*` plus baseline security
  headers.

Connect the GitHub repo in the Netlify UI and it will deploy on push. No environment variables and
no serverless functions are needed yet; Tweeble will add both.

### Performance notes

- No render-blocking third-party requests. Fonts, CSS and images are same-origin.
- Vimeo and YouTube load only after a click (`VideoEmbed.astro`), saving ~700 KB on first paint.
- Every `<img>` carries explicit `width`/`height`, so cumulative layout shift stays near zero —
  `scripts/audit.mjs` fails the build if one does not.
- Grid tiles are lazy-loaded; the first few on each page are eager.

---

## Accessibility

- Skip link, visible focus rings, `aria-current` on the active nav item.
- The lightbox is a native `<dialog>`: focus trapping, `Esc`, and arrow-key navigation come free,
  and focus returns to the tile that opened it.
- All motion is suppressed under `prefers-reduced-motion`.
- Scroll-reveal is additive, so content is visible with JavaScript disabled.
