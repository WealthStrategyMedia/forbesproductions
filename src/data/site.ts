/** Site-wide chrome: navigation, contact details, socials, partners. */

export const site = {
  name: 'Forbes Productions',
  legalName: 'Forbes Productions US',
  tagline: 'Where Entertainment Meets Purpose.',
  description:
    'A Hollywood-crafted production house delivering high-impact film, theatre, stand-up comedy and red carpet experiences. Female driven. Cinematic taste. Unapologetically bold.',
  url: 'https://forbesproductions.us',
  email: 'forbesproductionsus@gmail.com',
  phone: '+1 917-974-7100',
  phoneHref: '+19179747100',
  youtube: 'https://www.youtube.com/@BrookeForbes1',
  youtubeChannel: 'https://www.youtube.com/channel/UCznEU_gpiqdF3I7sPMS9MIQ',
} as const;

export const nav = [
  { label: 'About', href: '/about' },
  { label: 'Brooke Forbes', href: '/brooke-forbes' },
  { label: 'Natasha', href: '/natasha' },
  { label: 'Events', href: '/events' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Videos', href: '/videos' },
  { label: 'Training', href: '/training' },
  { label: 'News', href: '/news' },
] as const;

export const navCta = { label: 'Contact', href: '/contact' };

export const socials = [
  { label: 'Instagram', href: 'https://www.instagram.com/forbesproductionsllc/?hl=en', icon: 'instagram' },
  { label: 'Facebook', href: 'https://www.facebook.com/brooke.forbes1', icon: 'facebook' },
  { label: 'YouTube', href: 'https://www.youtube.com/@BrookeForbes1', icon: 'youtube' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@brookeforbes5?lang=en', icon: 'tiktok' },
  { label: 'Vimeo', href: 'https://vimeo.com/brookeforbes', icon: 'vimeo' },
] as const;

/** Project-specific profiles kept from the live footer. */
export const extraSocials = [
  { label: 'Natasha Mail Order Bride on Facebook', href: 'https://www.facebook.com/natashamailorderbride', icon: 'facebook' },
  { label: 'Forbes Productions on Facebook', href: 'https://www.facebook.com/profile.php?id=100057621550944', icon: 'facebook' },
  { label: 'BB Forbes on Instagram', href: 'https://www.instagram.com/bbforbes/', icon: 'instagram' },
] as const;

export const footerNav = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Brooke Forbes', href: '/brooke-forbes' },
  { label: 'Natasha', href: '/natasha' },
  { label: 'Events', href: '/events' },
  { label: 'Event Gallery', href: '/event-gallery' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Training', href: '/training' },
  { label: 'Videos', href: '/videos' },
  { label: 'News', href: '/news' },
  { label: 'Contact', href: '/contact' },
] as const;

export const partners = [
  { name: 'Relief Alliance', media: 'relief-6-1-1', href: 'https://reliefalliance.org/' },
  { name: 'Wealth Strategy Media', media: 'wsm', href: 'https://wealthstrategymedia.com/' },
  { name: 'McNally Software', media: 'untitled-270-x-60-px-1-1', href: 'https://mcnallysoftware.com/' },
  { name: 'Malibu Education', media: 'malibu-education-logo', href: null },
  { name: 'Maurice Samuels', media: 'maurice-samuels-1', href: null },
  { name: 'SG Promotions', media: 'sg-promotions-1', href: null },
  { name: 'EPS Security', media: 'eps-security', href: null },
  { name: 'The Kookaburra Lounge', media: 'c3ca135c-a47a-43b4-972a-18ac7b88e9e1-1-photoroom-2-1-1', href: null },
  { name: 'Partner', media: 'logo-1-1', href: null },
] as const;

export const credits = {
  developer: { name: 'McNally Software', href: 'https://mcnallysoftware.com/' },
  media: { name: 'Wealth Strategy Media', href: 'https://wealthstrategymedia.com/' },
};
