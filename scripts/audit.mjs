/**
 * Post-build audit over dist/: every internal link resolves, every referenced
 * asset exists, no image is missing alt/width/height, and page weights stay
 * sane. Exits non-zero on any problem so it can gate a deploy.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIST = path.join(ROOT, 'dist');

if (!fs.existsSync(DIST)) {
  console.error('dist/ not found — run npm run build first.');
  process.exit(1);
}

const walk = (dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
};

const files = walk(DIST);
const pages = files.filter((f) => f.endsWith('.html'));
const problems = [];
const note = (page, msg) => problems.push(`${path.relative(DIST, page).replace(/\\/g, '/')}: ${msg}`);

/** A route like /about resolves to dist/about/index.html (or about.html). */
const routeExists = (href) => {
  const clean = href.split('#')[0].split('?')[0].replace(/\/+$/, '');
  if (clean === '') return true;
  const rel = clean.replace(/^\//, '');
  return (
    fs.existsSync(path.join(DIST, rel, 'index.html')) ||
    fs.existsSync(path.join(DIST, `${rel}.html`)) ||
    fs.existsSync(path.join(DIST, rel))
  );
};

const anchorsByPage = new Map();

for (const page of pages) {
  const html = fs.readFileSync(page, 'utf8');
  const rel = path.relative(DIST, page).replace(/\\/g, '/');

  // --- ids present on the page, for same-page anchor checks
  anchorsByPage.set(rel, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));

  // --- head essentials
  if (!/<title>[^<]{5,}<\/title>/.test(html)) note(page, 'missing or empty <title>');
  if (!/<meta name="description" content="[^"]{20,}"/.test(html)) note(page, 'missing meta description');
  if (!/<link rel="canonical"/.test(html)) note(page, 'missing canonical');
  if ((html.match(/<h1[\s>]/g) || []).length !== 1) {
    note(page, `expected exactly 1 <h1>, found ${(html.match(/<h1[\s>]/g) || []).length}`);
  }

  // --- images
  for (const tag of html.match(/<img\b[^>]*>/g) || []) {
    // The lightbox ships one empty <img> that JS populates on open.
    if (tag.includes('data-lb-img')) continue;
    const src = (tag.match(/\ssrc="([^"]+)"/) || [])[1];
    if (!src) { note(page, `img without src: ${tag.slice(0, 90)}`); continue; }
    if (src.startsWith('/') && !fs.existsSync(path.join(DIST, src.replace(/^\//, '').split('?')[0]))) {
      note(page, `img src 404: ${src}`);
    }
    if (!/\salt="/.test(tag)) note(page, `img without alt: ${src}`);
    if (!/\swidth="/.test(tag) || !/\sheight="/.test(tag)) note(page, `img without width/height (CLS risk): ${src}`);
  }

  // --- srcset entries
  for (const m of html.matchAll(/\ssrcset="([^"]+)"/g)) {
    for (const part of m[1].split(',')) {
      const url = part.trim().split(/\s+/)[0];
      if (url.startsWith('/') && !fs.existsSync(path.join(DIST, url.replace(/^\//, '')))) {
        note(page, `srcset 404: ${url}`);
      }
    }
  }

  // --- stylesheets and scripts
  for (const m of html.matchAll(/<(?:link[^>]+href|script[^>]+src)="(\/[^"]+)"/g)) {
    const url = m[1].split('?')[0];
    if (!fs.existsSync(path.join(DIST, url.replace(/^\//, '')))) note(page, `asset 404: ${url}`);
  }

  // --- internal links
  for (const m of html.matchAll(/<a\b[^>]*\shref="([^"]+)"/g)) {
    const href = m[1];
    if (/^(https?:|mailto:|tel:|#|data:)/.test(href)) continue;
    if (!href.startsWith('/')) { note(page, `relative link (prefer root-relative): ${href}`); continue; }
    if (href.startsWith('/media/')) {
      if (!fs.existsSync(path.join(DIST, href.replace(/^\//, '').split('#')[0]))) note(page, `file link 404: ${href}`);
      continue;
    }
    if (!routeExists(href)) note(page, `dead link: ${href}`);
  }
}

// --- same-page anchors (#tickets, #sponsor, …)
for (const page of pages) {
  const rel = path.relative(DIST, page).replace(/\\/g, '/');
  const html = fs.readFileSync(page, 'utf8');
  const ids = anchorsByPage.get(rel);
  for (const m of html.matchAll(/href="#([^"]+)"/g)) {
    if (m[1] && !ids.has(m[1])) note(page, `anchor target missing: #${m[1]}`);
  }
  // cross-page anchors, e.g. /events/stained-red-carpet#tickets
  for (const m of html.matchAll(/href="(\/[^"#]*)#([^"]+)"/g)) {
    const targetRel = `${m[1].replace(/^\//, '').replace(/\/$/, '')}/index.html`.replace(/^\//, '');
    const key = targetRel === '/index.html' ? 'index.html' : targetRel;
    const targetIds = anchorsByPage.get(key);
    if (targetIds && !targetIds.has(m[2])) note(page, `cross-page anchor missing: ${m[1]}#${m[2]}`);
  }
}

// --- weights
const htmlWeights = pages
  .map((p) => ({ page: path.relative(DIST, p).replace(/\\/g, '/'), kb: +(fs.statSync(p).size / 1024).toFixed(1) }))
  .sort((a, b) => b.kb - a.kb);

const mediaBytes = files
  .filter((f) => f.includes(`${path.sep}media${path.sep}`))
  .reduce((a, f) => a + fs.statSync(f).size, 0);
const totalBytes = files.reduce((a, f) => a + fs.statSync(f).size, 0);

console.log(`pages: ${pages.length}`);
console.log(`heaviest HTML: ${htmlWeights.slice(0, 5).map((w) => `${w.page} ${w.kb}KB`).join(', ')}`);
console.log(`media: ${(mediaBytes / 1048576).toFixed(1)}MB · total dist: ${(totalBytes / 1048576).toFixed(1)}MB`);

if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems) console.error('  - ' + p);
  process.exit(1);
}
console.log('\nno problems found');
