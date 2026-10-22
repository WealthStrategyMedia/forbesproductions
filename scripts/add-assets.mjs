/**
 * Processes the brand/film artwork supplied in Context/ plus the Substack
 * article cover, and appends them to src/data/media-manifest.json so they can
 * be referenced by `asset('key')` like any other image.
 *
 * Run: node scripts/add-assets.mjs
 *
 * Two of the inputs need real work rather than a straight resize:
 *
 * 1. The Forbes wordmark ships as a JPEG — gold lettering and BLACK subtitle
 *    on a WHITE background. Dropped onto the dark shell as-is it would be a
 *    white box. We key the white out by combining saturation and darkness
 *    (white scores zero on both; gold is saturated; the subtitle is dark), then
 *    recolour the near-neutral dark pixels to ivory so the subtitle, rule and
 *    URL read against the dark background while the gold stays gold.
 *
 * 2. Both Natasha files were captured from a phone and have the OS "scan text"
 *    button composited into the bottom-right corner, overlapping a festival
 *    laurel. Inpainting it leaves a visible scar, so instead we crop off the
 *    bottom strip that contains it. Nothing is lost that the page does not
 *    already say: the laurels are rendered as text from `natasha.awards`, and
 *    the cropped-out URL is this site's own address. Replace these two inputs
 *    with clean exports and the crops can go away.
 */
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT_THUMB = path.join(ROOT, 'public', 'media', 'thumb');
const OUT_FULL = path.join(ROOT, 'public', 'media', 'full');
const MANIFEST = path.join(ROOT, 'src', 'data', 'media-manifest.json');

const THUMB_W = 820;
const FULL_W = 1920;

await Promise.all([OUT_THUMB, OUT_FULL].map((d) => fsp.mkdir(d, { recursive: true })));

/** Knock a white studio background out of a JPEG logo and relight dark text. */
async function keyWhiteBackground(src, { relightDark = true } = {}) {
  const img = sharp(src).ensureAlpha();
  const { width, height } = await img.metadata();
  const raw = await img.raw().toBuffer();

  for (let i = 0; i < raw.length; i += 4) {
    const r = raw[i], g = raw[i + 1], b = raw[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max - min;          // white and grey score 0
    const dark = 255 - max;         // white scores 0, black scores 255

    // Either signal is enough to call a pixel "ink".
    let a = Math.max(sat * 3.2, dark * 1.35);
    a = a > 255 ? 255 : a < 0 ? 0 : a;
    raw[i + 3] = a;

    // Near-neutral dark ink (subtitle, rule, URL) becomes ivory so it reads on
    // the dark shell; saturated gold is left alone.
    if (relightDark && sat < 38 && dark > 70) {
      raw[i] = 245;
      raw[i + 1] = 242;
      raw[i + 2] = 235;
    }
  }

  return sharp(raw, { raw: { width, height, channels: 4 } });
}

/**
 * Partner marks ship as near-black wordmarks on transparent, which all but
 * disappear on this site's dark shell. Recolour the neutral dark ink to ivory
 * and leave saturated pixels alone, so e.g. Relief Alliance keeps its green
 * leaf while its wordmark becomes legible.
 */
async function relightDarkInk(src) {
  const img = sharp(src).ensureAlpha();
  const { width, height } = await img.metadata();
  const raw = await img.raw().toBuffer();

  for (let i = 0; i < raw.length; i += 4) {
    if (raw[i + 3] < 8) continue;
    const r = raw[i], g = raw[i + 1], b = raw[i + 2];
    const max = Math.max(r, g, b);
    const sat = max - Math.min(r, g, b);
    if (sat < 42 && max < 165) {
      // Preserve relative shading so antialiased edges stay smooth.
      const t = 1 - max / 165;
      raw[i] = Math.round(235 + 20 * t);
      raw[i + 1] = Math.round(232 + 20 * t);
      raw[i + 2] = Math.round(225 + 20 * t);
    }
  }

  return sharp(raw, { raw: { width, height, channels: 4 } });
}

/** Keep the top `height` px of an image, dropping the bottom strip. */
async function cropTop(src, height) {
  const { width } = await sharp(src).metadata();
  return sharp(src).extract({ left: 0, top: 0, width, height });
}

async function emit(key, pipeline, { lossless = false, maxWidth = FULL_W } = {}) {
  const buf = await pipeline.png().toBuffer();
  const meta = await sharp(buf).metadata();
  const w = meta.width, h = meta.height;

  const full = await sharp(buf)
    .resize({ width: Math.min(maxWidth, w), withoutEnlargement: true })
    .webp(lossless ? { quality: 95, alphaQuality: 100, effort: 6 } : { quality: 82, effort: 5 })
    .toBuffer();
  const thumb = await sharp(buf)
    .resize({ width: Math.min(THUMB_W, maxWidth, w), withoutEnlargement: true })
    .webp(lossless ? { quality: 92, alphaQuality: 100, effort: 6 } : { quality: 76, effort: 5 })
    .toBuffer();

  await fsp.writeFile(path.join(OUT_FULL, `${key}.webp`), full);
  await fsp.writeFile(path.join(OUT_THUMB, `${key}.webp`), thumb);

  // Record the dimensions actually emitted, so srcset widths and the
  // width/height attributes describe the real file.
  const out = await sharp(full).metadata();

  return {
    key,
    kind: 'image',
    animated: false,
    width: out.width,
    height: out.height,
    aspect: +(out.width / out.height).toFixed(4),
    thumb: `/media/thumb/${key}.webp`,
    full: `/media/full/${key}.webp`,
    thumbBytes: thumb.length,
    fullBytes: full.length,
    sources: ['supplied in Context/'],
  };
}

const C = path.join(ROOT, 'Context');
const SCRATCH = process.argv[2];

const records = [];

// 1. Forbes wordmark — white keyed out, subtitle relit to ivory.
//    The supplied artwork ends with a rule and "www.forbesproductions.us".
//    That line is redundant in this site's own header and turns to mush at the
//    size a header logo renders, so it is cropped off. Capped at 900px because
//    it displays ~150px wide; anything larger is dead weight on every page.
const WORDMARK = path.join(C, 'Logo', 'Logo_New.jpeg');
records.push(await emit(
  'forbes-wordmark-gold',
  await keyWhiteBackground(WORDMARK).then(async (p) => {
    const buf = await p.png().toBuffer();
    return sharp(buf).extract({ left: 0, top: 0, width: 2048, height: 592 });
  }),
  { lossless: true, maxWidth: 900 },
));

/*
 * NOT SHIPPED: natasha_logo.jpeg.
 *
 * The scan-button artifact sits directly across the "Escape to America" stamp
 * rather than beside it. Cropping above it clips the stamp, cropping to the
 * left of it severs the heart from "NATASHA" and cuts "BRIDE"/"AMERICA", and
 * patching it over leaves a visible blob. There is no crop of this file that
 * is both complete and clean, so the poster below is used for the film's
 * branding instead. Supply a clean export of the banner and it can go back in.
 */

// 2. Natasha key art. Cropped to 1222px tall, dropping the laurel row, the URL
//    and the scan-button artifact that overlaps them.
records.push(await emit(
  'natasha-poster-2026',
  await cropTop(path.join(C, 'Photos', 'natasha_movie', 'natasha_poster.jpeg'), 1222),
));

// 4. Partner marks, pulled from tweeble.com/branding (their own canonical
//    files) and relit for the dark shell.
const BRANDING = SCRATCH ? path.join(SCRATCH, 'tweeble') : null;
if (BRANDING && fs.existsSync(path.join(BRANDING, 'tweeble-logo.png'))) {
  records.push(await emit('tweeble-logo', await relightDarkInk(path.join(BRANDING, 'tweeble-logo.png')), { lossless: true, maxWidth: 480 }));
}
if (BRANDING && fs.existsSync(path.join(BRANDING, 'relief-alliance-logo.png'))) {
  records.push(await emit('relief-alliance-logo', await relightDarkInk(path.join(BRANDING, 'relief-alliance-logo.png')), { lossless: true, maxWidth: 700 }));
}

// 5. Substack article cover.
if (SCRATCH && fs.existsSync(path.join(SCRATCH, 'article', 'cover.png'))) {
  records.push(await emit('brooke-close-up-substack', sharp(path.join(SCRATCH, 'article', 'cover.png'))));
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
for (const rec of records) manifest.assets[rec.key] = rec;
manifest.generated = new Date().toISOString();
fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1));

for (const r of records) {
  console.log(`${r.key}  ${r.width}x${r.height}  thumb ${(r.thumbBytes / 1024).toFixed(0)}KB  full ${(r.fullBytes / 1024).toFixed(0)}KB`);
}
