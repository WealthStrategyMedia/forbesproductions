# Payment & form flows — Tweeble integration points

Every payment and form flow on the site is **built and visible but deliberately not wired up**.
Each one renders a `PendingNotice` telling the visitor it is a preview, and each intercepts its own
submit so nothing is sent or stored.

This document lists every place that needs to change when Tweeble is switched on.

---

## Summary

| # | Flow | Page | Component | Currently does |
| --- | --- | --- | --- | --- |
| 1 | Ticket checkout | `/events/stained-red-carpet#tickets` | `TicketPicker.astro` | Calculates a real total, then shows a notice instead of redirecting |
| 2 | Event sponsorship | `/events/stained-red-carpet#sponsor` | `SponsorTiers.astro` | "Sponsor Now" names the package, then shows a notice |
| 3 | Film sponsorship | `/natasha#sponsor` | `SponsorTiers.astro` | Same as above |
| 4 | Sponsor enquiry form | `/events/stained-red-carpet#sponsor-form` | `StubForm.astro` | Validates, then reports "not connected" |
| 5 | Media accreditation form | `/events/stained-red-carpet#press` | `StubForm.astro` | Same |
| 6 | Contact form | `/contact` | `StubForm.astro` | Same |
| 7 | Training enquiry form | `/training#enquire` | `StubForm.astro` | Same |
| 8 | Event gallery access code | `/event-gallery` | inline script in the page | Always shows the preview gallery |
| 9 | Event gallery uploads | `/event-gallery` | disabled buttons | Buttons are `disabled` |

---

## 1–3 · Payments

### Ticket checkout

`src/components/TicketPicker.astro`, bottom `<script>`. The handler on `[data-checkout]` already
builds the line items:

```js
const lines = rows
  .map((r) => ({ name: …, qty: … }))
  .filter((l) => l.qty > 0);
```

Replace the notice with a Tweeble checkout session created from `lines` plus each row's
`data-price`, and redirect to the returned URL. Ticket definitions (id, name, price) live in
`src/data/event.ts` → `tickets`; use the `id` field as the Tweeble SKU so the two stay in sync.

### Sponsorship

`src/components/SponsorTiers.astro`, bottom `<script>`. Each button carries `data-sponsor` (package
name) and `data-sponsor-price`. Package definitions live in `src/data/event.ts` → `sponsorTiers`,
again keyed by `id` for use as the SKU.

Note the film tiers are rendered on two pages (`/natasha` and the event page), so the handler is
delegated at the document level — keep it that way or both copies will need wiring.

### Prices

All prices are in `src/data/event.ts` and are the single source of truth for the on-page maths.
Once Tweeble holds the catalogue, decide whether prices are still authored here (and pushed to
Tweeble) or read from Tweeble at build time — do not let the two drift.

---

## 4–7 · Forms

All four use `src/components/StubForm.astro`. There is one handler for every form:

```js
document.querySelectorAll('form[data-form]').forEach((form) => { … });
```

Replace the body with a `POST` of the `FormData` to the Tweeble form endpoint, keyed by the form's
`data-form` id (`contact`, `sponsor-enquiry`, `media-application`, `training-enquiry`). Field
`name` attributes are already set and stable; the field lists are declared in each page's
frontmatter.

Add real success and error states in place of the single `[data-form-result]` paragraph, and remove
the `<PendingNotice>` from the form footer.

**Spam:** no honeypot or captcha is in place yet. Add whatever Tweeble provides before going live.

---

## 8–9 · Event gallery

`src/pages/event-gallery.astro`. The gate is a placeholder: any code shows the preview. Real
gating must happen server-side — a static build cannot keep a secret, so the unlocked assets must
live behind a Tweeble (or Netlify Function) endpoint rather than in `public/`.

The page is `noindex` and excluded from `robots.txt` and the sitemap, but treat everything in
`public/media/` as public regardless.

The Videos / Files / Links tabs and both upload buttons are rendered `disabled` and need the same
backend.

---

## When removing the stubs

1. Delete the `<PendingNotice>` usage from whichever flow is now live (the component itself stays
   until all flows are done).
2. Remove the `[data-form-result]` / `[data-checkout-result]` placeholder text.
3. Re-run `npm run build && node scripts/audit.mjs`.
4. Search the repo for `Tweeble` — every stub mentions it by name, so the search should come back
   empty once the work is finished.

---

## Content feeds (added later)

Events, blog posts and sale items will also be served from Tweeble. The data
layer is already shaped for that swap:

| Feed | Replace | Read by |
| --- | --- | --- |
| Events | `events` array in `src/data/event.ts` | `upcomingEvents`, `pastEvents` — pages never read a single hard-coded event |
| Blog / press | `press` array in `src/data/content.ts` | `/news`, home, `/about` |
| Sale items | not yet modelled | — |

Each event carries `status: 'upcoming' | 'past'`. A past event renders its
listing card in black and white, swaps the "Upcoming" badge for "Past event",
drops the ticket CTAs, and shows its ticket tiers as a read-only price list
(`<TicketPicker readonly />`). Set `status` from the Tweeble payload and that
behaviour follows automatically.
