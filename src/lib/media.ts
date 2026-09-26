import manifest from '../data/media-manifest.json';

export type Asset = {
  key: string;
  kind: 'image' | 'file';
  animated?: boolean;
  width: number;
  height: number;
  aspect: number;
  thumb: string;
  full: string;
  thumbBytes?: number;
  fullBytes?: number;
};

const assets = manifest.assets as unknown as Record<string, Asset>;

/** Look up a mirrored asset by manifest key. Throws at build time on a typo. */
export function asset(key: string): Asset {
  const a = assets[key];
  if (!a) throw new Error(`Unknown media key "${key}". Run npm run media:optimize.`);
  return a;
}

export function maybeAsset(key: string | null | undefined): Asset | null {
  if (!key) return null;
  return assets[key] ?? null;
}

/**
 * Fallback alt text built from the source filename.
 *
 * The mirrored library carries almost no alt attributes, and plenty of files
 * are named things like "6-1" or "IMG_6547". Anything that does not survive
 * cleaning into real words is dropped in favour of the section name, so the
 * lightbox caption never reads "Red Carpet & Events — 6". Pass an explicit
 * `alt` wherever the subject is actually known.
 */
const NOISE = /^(img|dsc|photo|image\d*|screenshot|screen|thumbnail|copy|scaled|final|edit|new)$/i;

export function describe(key: string, context?: string): string {
  const words = key
    .replace(/-[0-9a-f]{6,}$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\d{1,2} \d{1,2} \d{4}\b/g, '')
    .split(' ')
    .filter((w) => w && !/^\d+$/.test(w) && !NOISE.test(w));

  const pretty = words.join(' ').trim();
  const meaningful = pretty.replace(/[^a-z]/gi, '').length >= 4;

  if (!meaningful) return context ? `${context} — Forbes Productions photograph` : 'Forbes Productions photograph';

  const sentence = pretty.charAt(0).toUpperCase() + pretty.slice(1);
  return context ? `${context} — ${sentence}` : sentence;
}

export const ASPECT_FALLBACK = 1.5;
