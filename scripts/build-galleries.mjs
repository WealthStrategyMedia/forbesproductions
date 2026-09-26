/**
 * Sorts every mirrored asset into the site's gallery categories.
 *
 * The live site filed most of its photos under a single "Personal Training &
 * Yoga" heading regardless of subject, so the categories here are re-derived
 * from filenames with an explicit override list for the ones that need a human
 * call. Nothing is dropped: every image asset lands in exactly one category,
 * and `npm run media:manifest` fails loudly if that stops being true.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const { assets } = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/media-manifest.json'), 'utf8'));

export const CATEGORIES = [
  { id: 'redcarpet', title: 'Red Carpet & Events', blurb: 'Step-and-repeat moments, premieres and the Stained Red Carpet.' },
  { id: 'fashion', title: 'Fashion & Runway', blurb: 'Designer showcases and celebrity runway walks.' },
  { id: 'comedy', title: 'Comedy & Stand-Up', blurb: 'Headline sets at the Roosevelt, Flappers and the Comedy Chateau.' },
  { id: 'natasha', title: 'Natasha: Escape to America', blurb: 'Stills, cast and behind the scenes from the award-winning feature.' },
  { id: 'portraits', title: 'Portraits & Headshots', blurb: 'Press portraits and promotional photography.' },
  { id: 'yoga', title: 'Yoga & Wellness', blurb: 'Kundalini practice, sound baths and training sessions.' },
  { id: 'flyers', title: 'Posters & Flyers', blurb: 'Show artwork from a decade of live productions.' },
];

/** Assets that are site furniture (logos, backgrounds, PDFs) — never in a gallery. */
const CHROME = new Set([
  'forbes-blk-transparent-copy-1', 'forbes-blk-transparent-copy-1-1', 'ico',
  'what-we-do-bgoverlay', 'loy', 'untitled-270-x-60-px-1-1', 'wsm',
  'c3ca135c-a47a-43b4-972a-18ac7b88e9e1-1-photoroom-2-1-1', 'eps-security',
  'malibu-education-logo', 'maurice-samuels-1', 'sg-promotions-1', 'logo-1-1',
  'relief-6-1-1', 'stained-red-carpet-logo-copy',
  'i', 'film-marketing', '1x-1',
  'screen-capture-041', 'screenshot-2025-11-05-215128', 'tvla-screenshot',
  'aiden-headshot', 'jeremy-headshot',
  'official-escape-to-america-pitch-proposal-copy', 'atlanticdigital-ebook-web',
]);

/** Judgement calls the filename rules get wrong. */
const OVERRIDE = {
  '9-faf3bb88': 'natasha', '12-e44af655': 'natasha', '13-1590f3ff': 'natasha',
  '5-686d95f6': 'natasha', '7-50a898e3': 'natasha', '8-0b29be22': 'natasha',
  'photod-5b5a91b0': 'natasha', 'screen-shot-2022-12-07-at-124006-pm-48b88495': 'natasha',
  '11-e4950916': 'comedy', '2-1c2ffd10': 'comedy', 'thumbnail-img-0511-56578e4e': 'comedy',
  'thumbnail-img-0799-2af79db8': 'comedy',
  '15-c9af3055': 'portraits', 'brooke-forbes-amazon-prime-forbes-productions': 'portraits',
  'img-0765': 'yoga', 'img-2717': 'yoga', 'event-one': 'yoga',
  'yoga-poster-5de377a0': 'yoga', 'amazon-prime-yoga-48c64bc7': 'yoga',
  'june-2025': 'flyers', 'march-2025': 'flyers', 'sept-28-2025': 'flyers',
  '3-poster-natasha': 'natasha', 'poster-natasha-1': 'natasha',
  'photo-flyer-natasha-and-red-carpet-shoes-be189753': 'natasha',
  'natashalogo-step-and-repeat-tues-may-18-2021-comedy-chatea': 'natasha',
  'natashalogo-step-and-repeat-tues-may-18-2021-comedy-chatea-5350': 'natasha',
  'natasha-flag-copy': 'natasha', 'photo-copy-5': 'natasha',
  'ei': 'redcarpet',
};

const RULES = [
  ['flyers', /flyer|snl|american-legion|i-love-america|xotv|matt-rife|new-year|comedy-chateau|banner-web-size/i],
  ['yoga', /yoga|bollyx|sound-bath|gula|kundalini/i],
  ['natasha', /natasha|crapistan|photocast|^photo[a-m](-\d+)?$|wrapfest|^wrap\d|irina|mv5b|escape-to-america|^design$/i],
  ['portraits', /headshot|body-shot|promo-pix|brooke-promo|brooke-flag|ceragem|brookie-doggy|thumbnail-photo/i],
  ['comedy', /flappers|^s\d+-|roosevelt|promo-brooke|^\d{9,}-\d{10,}/i],
  ['fashion', /fashion|runway|models?-red-carpet|girls-swimsuits|guys-fashion|shows-guests/i],
  ['redcarpet', /./],
];

function categorize(key) {
  if (CHROME.has(key)) return null;
  if (OVERRIDE[key]) return OVERRIDE[key];
  for (const [id, re] of RULES) if (re.test(key)) return id;
  return 'redcarpet';
}

/** Portrait-orientation posters read best first; otherwise keep a stable order. */
function order(a, b) {
  return a.localeCompare(b);
}

const galleries = {};
for (const c of CATEGORIES) galleries[c.id] = [];

const unplaced = [];
for (const [key, rec] of Object.entries(assets)) {
  if (rec.kind !== 'image') continue;
  const cat = categorize(key);
  if (!cat) continue;
  if (!galleries[cat]) { unplaced.push(key); continue; }
  galleries[cat].push(key);
}
for (const id of Object.keys(galleries)) galleries[id].sort(order);

if (unplaced.length) {
  console.error('Unplaced assets:', unplaced);
  process.exit(1);
}

const out = {
  categories: CATEGORIES.map(c => ({ ...c, count: galleries[c.id].length })),
  items: galleries,
};
fs.writeFileSync(path.join(ROOT, 'src/data/galleries.json'), JSON.stringify(out, null, 1));

const placed = Object.values(galleries).reduce((a, v) => a + v.length, 0);
const totalImages = Object.values(assets).filter(a => a.kind === 'image').length;
console.log(out.categories.map(c => `${c.id}: ${c.count}`).join('\n'));
console.log(`placed ${placed} of ${totalImages} images (${totalImages - placed} reserved as site chrome)`);
