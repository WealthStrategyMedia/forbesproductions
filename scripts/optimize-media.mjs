/**
 * Media pipeline for forbesproductions.us -> static site.
 *
 * Reads the raw downloads mirrored from the live WordPress media library,
 * de-duplicates by content hash, and emits two WebP derivatives per image
 * into public/media (thumb for grids, full for the lightbox), plus
 * src/data/media-manifest.json describing every asset.
 *
 * Run:  npm run media:optimize -- <rawDir> <extractDir>
 *
 * Derivatives are committed so Netlify builds stay inside the free tier's
 * build-minute budget (no image work happens during `astro build`).
 */
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const RAW = process.argv[2];
const EXTRACT = process.argv[3];
const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'public', 'media');
const OUT_THUMB = path.join(OUT, 'thumb');
const OUT_FULL = path.join(OUT, 'full');
const OUT_FILE = path.join(OUT, 'file');

if (!RAW || !EXTRACT) {
  console.error('usage: node scripts/optimize-media.mjs <rawDir> <extractDir>');
  process.exit(1);
}

await Promise.all([OUT_THUMB, OUT_FULL, OUT_FILE].map(d => fsp.mkdir(d, { recursive: true })));

const THUMB_W = 820;
const FULL_W = 1920;

const rawFiles = new Set(await fsp.readdir(RAW));

/** wp upload url -> the local mirror filename (2025/10/a.webp -> 2025__10__a.webp) */
function localName(url) {
  const u = new URL(url);
  const parts = u.pathname.split('/uploads/')[1] || u.pathname.replace(/^\//, '');
  return parts.replace(/\//g, '__');
}

/** Prefer the uncropped original over WordPress' -1024x768 style crops. */
function resolveBest(url) {
  const name = localName(url);
  const uncropped = name.replace(/-\d+x\d+(\.[a-z0-9]+)$/i, '$1');
  if (uncropped !== name && rawFiles.has(uncropped)) return uncropped;
  if (rawFiles.has(name)) return name;
  return null;
}

function slugify(name) {
  return name
    .replace(/^\d{4}__\d{2}__/, '')
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/-scaled(-\d+)?$/i, '')
    .replace(/-\d+x\d+$/i, '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 58) || 'asset';
}

const manifest = {};      // key -> record
const byHash = new Map(); // hash -> key
const usedKeys = new Set();

async function ingest(url) {
  const file = resolveBest(url);
  if (!file) return null;
  const abs = path.join(RAW, file);
  const buf = await fsp.readFile(abs);
  const hash = crypto.createHash('sha1').update(buf).digest('hex');

  if (byHash.has(hash)) {
    const key = byHash.get(hash);
    manifest[key].sources.push(url);
    return key;
  }

  const ext = path.extname(file).toLowerCase();
  let key = slugify(file);
  while (usedKeys.has(key)) key = `${key}-${hash.slice(0, 4)}`;
  usedKeys.add(key);
  byHash.set(hash, key);

  // Non-image payloads (pitch deck PDFs) are passed through untouched.
  if (ext === '.pdf') {
    const out = `${key}.pdf`;
    await fsp.writeFile(path.join(OUT_FILE, out), buf);
    manifest[key] = { key, kind: 'file', file: `/media/file/${out}`, bytes: buf.length, sources: [url] };
    return key;
  }

  const meta = await sharp(buf, { animated: ext === '.gif' }).metadata();
  const animated = (meta.pages ?? 1) > 1;
  // For animated GIFs sharp reports the filmstrip height; recover one frame.
  const w = meta.width ?? 0;
  const h = animated ? Math.round((meta.pageHeight ?? meta.height) || 0) : (meta.height ?? 0);

  const rec = {
    key,
    kind: 'image',
    animated,
    width: w,
    height: h,
    aspect: w && h ? +(w / h).toFixed(4) : 1.5,
    sources: [url],
  };

  const load = () => sharp(buf, { animated });

  if (animated) {
    // Animated WebP keeps the motion at a fraction of the GIF weight.
    const full = await load().resize({ width: Math.min(FULL_W, w), withoutEnlargement: true })
      .webp({ quality: 72, effort: 4 }).toBuffer();
    const thumb = await load().resize({ width: Math.min(THUMB_W, w), withoutEnlargement: true })
      .webp({ quality: 66, effort: 4 }).toBuffer();
    await fsp.writeFile(path.join(OUT_FULL, `${key}.webp`), full);
    await fsp.writeFile(path.join(OUT_THUMB, `${key}.webp`), thumb);
    rec.full = `/media/full/${key}.webp`;
    rec.thumb = `/media/thumb/${key}.webp`;
    rec.fullBytes = full.length;
    rec.thumbBytes = thumb.length;
  } else {
    const full = await load().rotate().resize({ width: Math.min(FULL_W, w || FULL_W), withoutEnlargement: true })
      .webp({ quality: 78, effort: 5 }).toBuffer();
    const thumb = await load().rotate().resize({ width: Math.min(THUMB_W, w || THUMB_W), withoutEnlargement: true })
      .webp({ quality: 74, effort: 5 }).toBuffer();
    await fsp.writeFile(path.join(OUT_FULL, `${key}.webp`), full);
    await fsp.writeFile(path.join(OUT_THUMB, `${key}.webp`), thumb);
    rec.full = `/media/full/${key}.webp`;
    rec.thumb = `/media/thumb/${key}.webp`;
    rec.fullBytes = full.length;
    rec.thumbBytes = thumb.length;
  }

  manifest[key] = rec;
  return key;
}

// ---------------------------------------------------------------- input list
const readList = f => {
  const p = path.join(EXTRACT, f);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8').split('\n').map(s => s.trim()).filter(Boolean) : [];
};

// urls-missed holds asset URLs whose filenames carry characters (e.g. IMDb's
// "@") that the main URL sweep skips.
const pageUrls = [...readList('urls-all-pages.txt'), ...readList('urls-missed.txt')];

const chrome = [
  'https://forbesproductions.us/wp-content/uploads/2025/09/FORBES-Blk-Transparent-copy-1.png',
  'https://forbesproductions.us/wp-content/uploads/2025/10/ico.png',
  'https://forbesproductions.us/wp-content/uploads/2025/09/What_We_Do-BgOverlay.png',
  'https://forbesproductions.us/wp-content/uploads/2025/09/loy.png',
  'https://mcnallysoftware.com/wp-content/uploads/2025/08/Untitled-270-x-60-px-1-1.png',
];

const inputs = [...new Set([...chrome, ...pageUrls])];

// url -> key, so page data can be written in terms of the original live URLs
const urlToKey = {};
let done = 0;
for (const url of inputs) {
  try {
    const key = await ingest(url);
    if (key) urlToKey[url] = key;
    else console.warn('UNRESOLVED', url);
  } catch (e) {
    console.warn('FAIL', url, e.message);
  }
  if (++done % 40 === 0) process.stdout.write(`.${done}`);
}

const records = Object.values(manifest);
const imgs = records.filter(r => r.kind === 'image');
const totalThumb = imgs.reduce((a, r) => a + (r.thumbBytes || 0), 0);
const totalFull = imgs.reduce((a, r) => a + (r.fullBytes || 0), 0);

await fsp.mkdir(path.join(ROOT, 'src', 'data'), { recursive: true });
await fsp.writeFile(
  path.join(ROOT, 'src', 'data', 'media-manifest.json'),
  JSON.stringify({ generated: new Date().toISOString(), urlToKey, assets: manifest }, null, 1),
);

console.log(`\ninputs=${inputs.length} unique=${records.length} images=${imgs.length}`);
console.log(`thumbs=${(totalThumb / 1048576).toFixed(1)}MB full=${(totalFull / 1048576).toFixed(1)}MB`);
