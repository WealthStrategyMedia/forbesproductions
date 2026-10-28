# Launching on forbesproductions.us

Repo: https://github.com/WealthStrategyMedia/forbesproductions
Host: Netlify (free plan) · Registrar/DNS: GoDaddy

> **The domain currently serves the live WordPress site.** Changing DNS takes
> that site offline the moment it propagates. Do steps 1–2 and verify on the
> `*.netlify.app` URL **before** touching DNS in step 4.

---

## 1. Create the Netlify site

1. Log in at [app.netlify.com](https://app.netlify.com).
2. **Add new site → Import an existing project → GitHub**.
3. Authorise Netlify for the `WealthStrategyMedia` org and pick
   **`forbesproductions`**.
4. Build settings are read from [`netlify.toml`](netlify.toml) — leave them
   alone. For reference they are:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 20
5. **Deploy site.** First build takes roughly 1–2 minutes.

No environment variables are needed. No serverless functions. Nothing to
configure beyond the above.

## 2. Verify on the Netlify URL

Netlify gives the site a name like `random-words-123456.netlify.app`. Rename it
to something sane under **Site configuration → Site details → Change site name**
(e.g. `forbes-productions`), then walk through it:

- [ ] Home, About, Brooke Forbes, Natasha, Events, Gallery, Videos, Training, News, Contact
- [ ] Click an image — lightbox opens, arrow keys move through the set
- [ ] `/events/stained-red-carpet` — greyscale past-event hero, read-only ticket tiers
- [ ] On a phone — menu opens, nothing scrolls sideways
- [ ] A made-up URL like `/nope` — shows the styled 404
- [ ] Old links redirect: `/event` → `/events`, `/stained-red-carpet` → `/events/stained-red-carpet`

## 3. Add the domain in Netlify

**Site configuration → Domain management → Add a domain** →
`forbesproductions.us`.

Netlify will say the domain is registered elsewhere and show you **the exact
DNS records to create**. Use the values Netlify shows you — they are
authoritative. The values in step 4 are what Netlify normally gives, included
so you know what to expect.

Choose **"Add domain"** (keep DNS at GoDaddy), *not* "Delegate to Netlify".
Reason: switching nameservers moves **all** DNS for the domain to Netlify, and
any MX (email), SPF, DKIM or verification TXT records that live at GoDaddy stop
resolving until they are recreated by hand. Keeping GoDaddy DNS and changing
only two records avoids that risk entirely.

## 4. GoDaddy DNS changes

GoDaddy: **My Products → Domains → `forbesproductions.us` → DNS → Manage Zones**
(or **DNS → Records**).

### Before you change anything

- Screenshot or export the current zone. You will want it if anything needs
  rolling back.
- **Do not touch MX, TXT or any Google/Microsoft verification records.** Only
  the two records below change.
- If **Forwarding** is set up on the domain (GoDaddy → Domain Settings →
  Forwarding), delete it. Forwarding overrides A records and will break the site.

### Optional but recommended: lower the TTL first

A day before cutover, set the TTL on the existing `@` A record to **600 seconds**
and save. That shortens how long the old WordPress IP stays cached, so the
switch and any rollback both take effect in ~10 minutes rather than an hour.

### The records

**A record — apex domain**

| Field | Value |
| --- | --- |
| Type | `A` |
| Name | `@` |
| Value | `75.2.60.5` |
| TTL | 600 seconds (raise to 1 hour once it's stable) |

Edit the existing `@` A record rather than adding a second one. If there are
several `@` A records pointing at the WordPress host, **delete the extras** —
leaving them makes the site load the old host at random.

**CNAME — www**

| Field | Value |
| --- | --- |
| Type | `CNAME` |
| Name | `www` |
| Value | `<your-site-name>.netlify.app` (note the trailing dot if GoDaddy requires one) |
| TTL | 600 seconds |

Delete any existing `www` A record — a name cannot have both an A and a CNAME.

> Confirm `75.2.60.5` against what Netlify's Domain management panel shows for
> this site before saving. It is Netlify's standard load-balancer address, but
> their panel is the source of truth.

## 5. HTTPS

Once DNS resolves to Netlify (minutes to an hour), go to
**Domain management → HTTPS** and click **Verify DNS configuration**, then
**Provision certificate**. Netlify issues a free Let's Encrypt certificate and
renews it automatically.

Also set the primary domain under **Domain management → Domains**: pick whether
`forbesproductions.us` or `www.forbesproductions.us` is canonical. Netlify
301-redirects the other one.

## 6. Check it

```bash
nslookup forbesproductions.us
nslookup www.forbesproductions.us
```

The apex should return `75.2.60.5`; `www` should resolve via the `.netlify.app`
name. Then load https://forbesproductions.us in a private window and confirm the
padlock.

---

## Rolling back

Set the `@` A record back to the WordPress host's IP (from the screenshot you
took in step 4) and delete the `www` CNAME. With a 600-second TTL it reverts in
about ten minutes. **Do not cancel the WordPress hosting until you are happy
with the new site** — it is the only rollback target.

---

## Known at launch

### Forms are not connected

Contact, sponsor enquiry, media accreditation and training enquiry forms all
render and validate, then report that they are not wired up. Nothing is sent or
stored. The same goes for ticket and sponsorship checkout, and the event gallery
access code. This is by design pending Tweeble — see [PAYMENTS.md](PAYMENTS.md).

**This means a visitor cannot reach you through the contact form.** The contact
page does show a clickable email address and phone number, so there is a path,
but it is worth deciding before launch whether to:

- **(a) Launch as-is** and rely on the email/phone on `/contact`, or
- **(b) Point the forms at Netlify Forms** as a stopgap. Netlify's free tier
  covers 100 submissions a month and needs no backend — roughly a 20-line
  change to `StubForm.astro`, swapped out when Tweeble lands.

Ticket checkout being inert matters less right now: the only event on the site
is past, so there is nothing to sell until the next date is announced.

### Natasha banner logo

`Context/Photos/natasha_movie/natasha_logo.jpeg` is not used — a phone's "scan
text" button is composited across the "Escape to America" stamp and no crop is
both complete and clean. The film uses the poster key art instead. A clean
export can be dropped in later.

### Content to confirm

- The live WordPress site shows the event date as **February 7th** on the home
  and event pages but **December 7th** on the Brooke Forbes page. This site uses
  February 7th throughout, now marked as a past event.
- Legal pages carry an effective date of **September 26, 2026**, carried over
  verbatim from the live site.
