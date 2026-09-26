# CLAUDE.md

Guidance for Claude Code working in this repo.

## What this is

A static Astro site replacing the WordPress site at forbesproductions.us. Deployed to Netlify's
free plan. Read [README.md](README.md) for the stack and [CONTENT-PARITY.md](CONTENT-PARITY.md)
for what came from where.

## Commands

```bash
npm run dev                  # dev server on :4321
npm run build                # static build into dist/
npm run check                # Astro/TS diagnostics
node scripts/audit.mjs       # post-build audit — run after every build
```

There is no test suite. `scripts/audit.mjs` is the safety net: it fails on dead links, missing
anchor targets, 404'd assets, images without `alt` or without `width`/`height`, pages without a
title/description/canonical, and pages without exactly one `<h1>`. Run it before calling work done.

## Conventions that matter here

- **No client framework.** Astro ships zero JS by default and that is the point. The handful of
  interactive pieces are plain `<script>` blocks inside their components. Do not add React, Vue,
  Alpine or a CSS framework without being asked.
- **Design tokens only.** Colours, spacing, fonts and easing come from the custom properties in
  `src/styles/global.css`. Do not hard-code a hex value in a component.
- **Copy lives in `src/data/`**, not in templates: `site.ts` (chrome), `content.ts` (editorial),
  `event.ts` (event, tickets, sponsor tiers), `legal.ts`. Edit copy there.
- **Images are referenced by manifest key**, never by path. Use `asset('key')` from
  `src/lib/media.ts` — it throws at build time on a typo, which is how missing images get caught.
  `src/data/media-manifest.json` and `src/data/galleries.json` are generated; do not hand-edit them
  except when adding a one-off image (see README).
- **Images are pre-optimised and committed.** `astro build` must stay free of image processing so
  Netlify builds stay inside the free tier. Do not switch to `astro:assets` for the photo library.
- **Every `<img>` needs explicit `width` and `height`.** The audit enforces it.

## Payment and form flows are intentionally broken

Ticket checkout, sponsorship checkout and all four enquiry forms are rendered but inert, pending a
Tweeble integration. Each shows a `PendingNotice`. **Do not "fix" them into working submissions.**
[PAYMENTS.md](PAYMENTS.md) lists all nine stubs and exactly what to change when Tweeble lands.

## Gotchas discovered the hard way

- The logo file is named `FORBES-Blk-Transparent` but the artwork is **white** on transparent. It
  needs no `invert()` filter on the dark shell.
- `aspect-ratio` combined with `min-height` makes the element derive its *width* from the height,
  which silently over-sizes images inside cards. Clear `min-height: 0` when adding `aspect-ratio`
  at a breakpoint.
- `PhotoGrid` has two variants. Use `variant="masonry"` for posters and flyers so the artwork is
  not cropped; the default `mosaic` crops to a uniform rhythm and is right for photographs.
- Astro frontmatter cannot host a multi-line `export type` union — put shared types in `src/lib/`.
