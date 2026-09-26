# Content parity with the live site

A map of everything on [forbesproductions.us](https://forbesproductions.us) and where it now lives.
Extraction was done from the live WordPress REST API (`/wp-json/wp/v2/pages`, `/media`, `/gallery`)
rather than by hand, so this is an inventory of the source, not a best guess at it.

**Source totals:** 14 pages + 1 custom gallery post · 621 media library items · 422 distinct asset
URLs actually referenced by page content.

**Mirrored:** all 422 referenced URLs, de-duplicated by content hash to **229 distinct assets**
(228 images + the Natasha pitch PDF). The 199 collapsed duplicates were byte-identical files the
live site had uploaded several times under `-1` / `-1-1` names.

---

## Pages

| Live page | New route | Notes |
| --- | --- | --- |
| `/` Home | `/` | All 12 sections carried over. The "Spotlight Moments" carousel rendered **empty slides** on the live site (the Unlimited Elements widget produced no images); rebuilt as a working scroll rail. |
| `/about` | `/about` | Mission, poster wall, capabilities, founder bio, values, Relief Alliance + Teen-X, "My Story", partners, articles. |
| `/brooke-forbes` | `/brooke-forbes` | Brand statement, acting, Natasha summary, headshots, stand-up, flyers, yoga, Madonna tribute, event card. Full film detail moved to `/natasha`. |
| *(none)* | `/natasha` | **New.** The film content was previously buried mid-way down `/brooke-forbes`. Given its role in attracting producers and brand partners it now has its own page with synopsis, awards, reel, Crapistan lore, 48 stills and film sponsorship tiers. |
| `/event` | `/events` | Was a bare listing with one card; now carries quick links to tickets / sponsorship / press / gallery. |
| `/stained-red-carpet` | `/events/stained-red-carpet` | Full parity: intro, "Experience the Night", "Why Sponsor or Attend", Wealth Strategy Media, all 12 sponsor packages, all 6 ticket tiers with the order summary, media coverage form, sponsor form, "Why It's Unmissable", "Why It Stands Out", "Who Walks", "Opportunities for Sponsors & Press", partners, 80-photo archive. |
| `/gallery` | `/gallery` | Re-categorised — see below. |
| `/image-gallery` | → `/gallery` (301) | Live page was **empty** (0 bytes of content). |
| `/event-gallery` | `/event-gallery` | Password gate, tabs and upload UI reproduced as a non-functional preview. |
| `/gallery/images` | → `/event-gallery` (301) | Duplicate of the event gallery behind the same WS Form password widget. |
| `/training` | `/training` | Bio, all 7 certifications (broken out of the original run-on paragraph), Kundalini schedule, 10 photos, enquiry form. |
| `/videos` | `/videos` | Production reel + channel links. See caveat below. |
| `/news` | `/news` | All 8 articles. The live page listed the Amazon Prime piece twice; kept once here. |
| `/contact` | `/contact` | Email, phone, socials, map, full form. |
| `/privacy-policy` | `/privacy-policy` | Verbatim, split into 9 headed clauses with a table of contents. |
| `/terms-and-conditions` | `/terms-and-conditions` | Verbatim, split into 9 headed clauses with a table of contents. |
| *(none)* | `/404` | **New.** |

---

## Gallery re-categorisation

The live `/gallery` had four headings — Shows (7), Natasha (44), Comedy (16) and
**Personal Training & Yoga (66)**. The last one was a catch-all: after 11 genuine yoga photos it
continued with red carpet shots, runway photos, audience shots and headshots under the same
"Fitness and wellness sessions" subtitle.

Every image was re-filed by subject. Nothing was dropped:

| Category | Count |
| --- | --- |
| Red Carpet & Events | 47 |
| Natasha: Escape to America | 48 |
| Fashion & Runway | 33 |
| Comedy & Stand-Up | 26 |
| Portraits & Headshots | 20 |
| Posters & Flyers | 21 |
| Yoga & Wellness | 10 |
| **Total in galleries** | **205** |
| Site chrome (logos, partner marks, service imagery, press thumbnails, favicon, PDF) | 24 |
| **Total assets** | **229** |

`scripts/build-galleries.mjs` exits non-zero if any image fails to land in exactly one category, so
this cannot silently drift.

---

## Assets carried over

- **Logo** — `FORBES-Blk-Transparent-copy-1.png`. Despite the "Blk" filename the artwork is white
  on transparent, which is why it is used unfiltered on the dark shell.
- **Favicon** — regenerated from `ico.png` (plus a new inline SVG favicon).
- **Partner logos** — all 9: Relief Alliance, Wealth Strategy Media, McNally Software, Malibu
  Education, Maurice Samuels, SG Promotions, EPS Security, The Kookaburra Lounge, and the
  unnamed `logo-1`.
- **Pitch deck** — `Official-ESCAPE-TO-AMERICA-Pitch-Proposal-copy.pdf`, linked from `/natasha` and
  `/brooke-forbes`.
- **Socials** — all 8 profiles from the live footer, including the three project-specific ones
  (Natasha Mail Order Bride, Forbes Productions, BB Forbes).
- **Animated GIFs** — the 17 GIFs in the Natasha set were converted to animated WebP; the motion is
  preserved at a fraction of the weight.

### Not carried over, deliberately

| Item | Why |
| --- | --- |
| 199 duplicate uploads | Byte-identical copies of files already present. |
| ~200 unreferenced media library items | WordPress-generated crops and uploads no page linked to. The originals are all in the media mirror if any are wanted. |
| `AtlanticDigital_EBook_Web.pdf` | In the media library but not linked from any page. Say the word and it can be surfaced. |
| Elementor / WS Form / Unlimited Elements runtime | Replaced by ~5 KB of hand-written JavaScript. |

---

## Known gaps needing your input

1. **Videos page.** The live page embeds one Vimeo reel and otherwise links out to YouTube — there
   are no individual video IDs to extract. The new page mirrors that: the reel plus four tiles
   linking to the channel. Send video IDs and they become real embeds.
2. **Vimeo reel 313488082** is not publicly listed (its oEmbed endpoint returns 404), so the player
   loads behind a click facade with a Natasha still as the poster frame. If the video is
   domain-restricted, `forbesproductions.us` and the Netlify preview domain will need whitelisting.
3. **Event date.** The live site shows *February 7th* on the home and event pages but *December 7th*
   on `/brooke-forbes`. February 7th is used throughout here; confirm which is right.
4. **Legal effective date** reads *September 26, 2026* on the live site — carried over verbatim.
5. **Alt text.** The live library has almost no alt attributes. Descriptions are derived from
   filenames where those are meaningful and fall back to the section name where they are not
   (e.g. a file called `6-1`). Real captions would improve both accessibility and SEO.
