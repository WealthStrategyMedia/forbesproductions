/**
 * The Stained Red Carpet — copy, ticket tiers and sponsorship packages,
 * transcribed from forbesproductions.us/stained-red-carpet/.
 *
 * Ticket and sponsor purchases are wired to Tweeble later; see PAYMENTS.md.
 * Prices here are the source of truth for the on-page order summary only.
 */

export const event = {
  slug: 'stained-red-carpet',
  title: 'Stained Red Carpet',
  subtitle: "Hollywood's Ultimate Celebrity Experience",
  dateLabel: 'February 7th · 6:00 PM – 9:30 PM PT',
  dateISO: '2026-02-07T18:00:00-08:00',
  endISO: '2026-02-07T21:30:00-08:00',
  venue: 'The Kookaburra Lounge',
  address: '6801 Hollywood Blvd #407, Hollywood, CA 90028, USA',
  mapQuery: '6801 Hollywood Blvd %23407, Hollywood, CA 90028',
  presentedBy: 'Forbes Productions & Relief Alliance, led by Aiden and Jeremy McNally',
  sponsorExternal: 'https://reliefalliance.org/stained-red-carpet/',
  hero: 'ei',
  intro: [
    "Step into Hollywood's most exclusive red carpet event — a night where comedy, fashion, celebrity and excitement collide. Stained Red Carpet is more than a show: it's a full-throttle, unforgettable evening of glitz, glamour and laughter.",
    'A portion of all sponsorships and ticket sales goes directly to Relief Alliance, led by Aiden and Jeremy McNally, supporting their mission to provide emergency aid, long-term rehabilitation and youth empowerment across the United States. By attending or sponsoring, you experience Hollywood magic while making a real impact for families in need.',
  ],
  experience: [
    'Celebrity comedian Tom Arnold delivering a performance that will leave the audience laughing nonstop',
    'Supermodels like Brittany Taylor walking the runway in a spectacular fashion show',
    'Exclusive red carpet interviews and media coverage by Wealth Strategy Media, capturing every dazzling moment',
    'Professional photo opportunities with Vogue Magazine photographers on the red carpet',
    'Hollywood Engaged, Wealth Strategy Magazine and other mainstream distribution',
    "VIP access to network with Hollywood's elite, investors, creators and tastemakers",
    'High-energy performances, celebrity guests and unforgettable moments you will talk about for months',
  ],
  whySponsor: [
    'Celebrity-level visibility in a high-profile Hollywood setting',
    'Exclusive media coverage powered by Wealth Strategy Media, Forbes Productions, Hollywood Engaged and Vogue Magazine',
    "Alignment with Relief Alliance, supporting social impact and elevating your brand's prestige",
    'VIP access to network with top Hollywood talent, influencers and media personalities',
    'Professional photo and video content to amplify your brand across social, digital and broadcast platforms',
  ],
  wealthStrategy: [
    ['TV Distribution', 'National and global airtime, high-impact commercials and targeted audience reach'],
    ['National Award Campaigns', 'Winning strategies and submissions to elevate credibility and recognition'],
    ['Red-Carpet Access', "Exclusive interviews, photo ops and media coverage alongside Hollywood's elite"],
    ['Celebrity Partnerships', 'Align your brand with top influencers, talent and A-list stars'],
    ['Event Coverage & Media Production', 'Cinematic photography and videography for broadcast and social platforms'],
    ['Social Media & Branding', 'Amplified brand voice, professional design and celebrity branding services'],
    ['Global Visibility', 'Reach over half a billion households worldwide'],
  ] as const,
  ticketPerks: [
    'VIP access to the event, including runway seating and photo opportunities',
    'Full entertainment experience with celebrity comedians and models',
    'Networking with high-profile talent, creators and sponsors',
    'A night filled with unforgettable Hollywood glamour and laughter',
  ],
  unmissable: [
    ['National Exposure for Your Brand', 'Interviews, social media mentions, step-and-repeat photo ops and press coverage'],
    ['Celebrity Glamour Meets Comedy', 'A mashup of elegance, outrageous humour and high fashion'],
    ['Support a Worthy Cause', 'A portion of ticket sales and sponsorships benefit Relief Alliance'],
    ['Hollywood-Level Production', 'Forbes Productions brings the stars, the cameras and the energy'],
    ['Networking Opportunity', 'Connect with influencers, investors, media and talent in a high-profile setting'],
  ] as const,
  standsOut: [
    ['Inclusive & International', 'Featuring talent from around the world, including first-gen creators, immigrant voices and women-led productions.'],
    ['Celebrity Comedy + Culture', 'A mashup of high-level comedy, entertainment and social impact.'],
    ['Cameras Rolling', 'Every Stained Red Carpet is filmed for syndication, viral content and media partners.'],
    ['Brand Visibility', 'A dream space for sponsors, collaborators and media brands to shine.'],
  ] as const,
  whoWalks: [
    'Award-winning actors and rising stars',
    'Visionary filmmakers and producers',
    'Comedians, creators and influencers',
    'Investors, partners and community champions',
    'You — if you dare to stand out',
  ],
  pressOpportunities: [
    'Logo placement on backdrop walls',
    'Shoutouts during press interviews and livestreams',
    'On-site brand activations and step-and-repeat moments',
    'Access to our VIP network of investors, talent and creatives',
  ],
};

export type Ticket = {
  id: string;
  name: string;
  detail?: string;
  price: number;
  featured?: boolean;
};

export const tickets: Ticket[] = [
  { id: 'vip-front-row-stage', name: 'VIP Front Row Stage', detail: 'Red Carpet Access', price: 55, featured: true },
  { id: 'vip-2nd-row', name: 'VIP 2nd Row', detail: 'Red Carpet Access', price: 45 },
  { id: 'vip-3rd-row', name: 'VIP 3rd Row', detail: 'Red Carpet Access', price: 35 },
  { id: 'vip-access', name: 'VIP Red Carpet Access', detail: 'General VIP admission', price: 28.52 },
  { id: 'vip-sofa', name: 'VIP Front Row Sofa', detail: 'Seats 3 · 2 champagne bottles included', price: 215, featured: true },
  { id: 'high-table', name: 'High Table', detail: 'Seats 3–4', price: 135 },
];

export type SponsorTier = {
  id: string;
  name: string;
  price: number;
  group: 'event' | 'film';
  headline?: string;
  featured?: boolean;
  benefits: { heading?: string; items: string[] }[];
};

export const sponsorTiers: SponsorTier[] = [
  {
    id: 'platinum',
    name: 'Platinum Sponsor',
    price: 5000,
    group: 'event',
    featured: true,
    headline: 'Event branded as: The Stained Red Carpet "Powered by [Your Brand]"',
    benefits: [
      {
        heading: 'Stage & Visibility',
        items: [
          '15 minutes of stage time to promote your brand (speakers), or a model runway show',
          'Top logo placement on all step & repeat banners, printed flyers, digital promotions and website',
        ],
      },
      {
        heading: 'Media & Coverage',
        items: [
          'Featured red carpet interview + full media coverage package (photo + video shared on IG, FB & YouTube)',
          'Social media feature post (IG + FB) and "Powered by" tag on all promo materials leading up to the event',
          'Hashtagging your brand across all social platforms',
          'Press release inclusion',
          'Magazine articles',
          '4 fashion runway shows — celebrity models wear your merchandise',
        ],
      },
      { heading: 'Tickets & Access', items: ['25 VIP tickets', 'Booth to promote and sell your merchandise'] },
      {
        heading: 'Post-Event Recognition',
        items: [
          'Logo featured in post-event recap video + tagged in reels/stories',
          'Recognition on our Medium blog, magazines and press release',
          'Hollywood Engaged and Wealth Strategy Media interviews',
        ],
      },
    ],
  },
  {
    id: 'gold',
    name: 'Gold Sponsor',
    price: 2500,
    group: 'event',
    benefits: [
      {
        heading: 'Stage & Visibility',
        items: [
          '10 minutes of stage time to promote your brand (speakers), or a model runway show',
          'Top logo placement on all step & repeat banners, printed flyers, digital promotions and website',
        ],
      },
      {
        heading: 'Media & Coverage',
        items: [
          'Featured red carpet interview + full media coverage package (photo + video shared on IG, FB & YouTube)',
          'Social media feature post (IG + FB) and "Powered by" tag on all promo materials',
          'Hashtagging your brand across all social platforms',
          'Press release inclusion',
          'Heart of Hollywood Magazine article',
          '2 fashion runway shows — models wear your merchandise',
        ],
      },
      { heading: 'Tickets & Access', items: ['4 VIP tickets + 2 general admission tickets'] },
      {
        heading: 'Post-Event Recognition',
        items: [
          'Logo featured in post-event recap video + tagged in reels/stories',
          'Recognition on our Medium blog',
          'Hollywood Engaged and Wealth Strategy Media interviews',
        ],
      },
    ],
  },
  {
    id: 'silver',
    name: 'Silver Sponsor',
    price: 1200,
    group: 'event',
    benefits: [
      {
        heading: 'Event Branding',
        items: ['Logo placement on all step & repeat banners, printed flyers, digital promotions and website'],
      },
      {
        heading: 'Media & Coverage',
        items: [
          'Featured red carpet interview + full media coverage',
          'Social media post naming your brand as a sponsor (IG + FB)',
          '5 minutes of stage time or a model runway show',
          'One fashion designer show wears your merchandise',
        ],
      },
      { heading: 'Tickets & Access', items: ['4 general admission tickets'] },
      {
        heading: 'Post-Event Recognition',
        items: ['Recognition on our Medium blog', 'Hollywood Engaged and Wealth Strategy Media interviews'],
      },
    ],
  },
  {
    id: 'bronze',
    name: 'Bronze Sponsor',
    price: 600,
    group: 'event',
    benefits: [
      { heading: 'Event Branding', items: ['Shout-outs across all digital promotions'] },
      {
        heading: 'Media & Coverage',
        items: ['Featured red carpet interview + full media coverage', 'Social media post naming your brand as a sponsor (IG + FB)'],
      },
      { heading: 'Tickets & Access', items: ['4 general admission tickets'] },
      {
        heading: 'Post-Event Recognition',
        items: ['Recognition on our Medium blog', 'Hollywood Engaged and Wealth Strategy Media interviews'],
      },
    ],
  },
  {
    id: 'fashion-designers',
    name: 'Fashion Designers',
    price: 600,
    group: 'event',
    benefits: [
      {
        items: [
          'Showcase your latest fashion with 8–10 models',
          '8 minutes of stage time, runway show',
          'Photos with celebrities',
          'Media marketing and photo galleries',
          'Video of your show',
          '2 VIP tickets',
        ],
      },
    ],
  },
  {
    id: 'vendor',
    name: 'Vendor Opportunity',
    price: 250,
    group: 'event',
    benefits: [
      {
        items: [
          '6-foot vendor table with black cover and two chairs',
          'Red carpet interviews',
          'One free VIP ticket for your guest of choice',
          'Marketing and branding throughout the show and on social media',
          'Sell your products at the event — models walk with your product',
        ],
      },
    ],
  },
  {
    id: 'film-vendor',
    name: 'Film & Vendor',
    price: 800,
    group: 'film',
    benefits: [
      {
        items: [
          'All Fashion Designers benefits',
          'Special thanks on rolling credits for the film on the official IMDb Pro page',
          'Your logo on the step & repeat',
          'Vendor table space provided',
          'Opportunity to speak for 5 minutes on stage',
          '2 VIP tickets',
        ],
      },
    ],
  },
  {
    id: 'film-bronze',
    name: 'Film — Bronze',
    price: 1000,
    group: 'film',
    benefits: [{ items: ['All Film & Vendor benefits', '2 VIP tickets for the film screening', 'Option to attend filming', '2 VIP tickets'] }],
  },
  {
    id: 'film-silver',
    name: 'Film — Silver',
    price: 5000,
    group: 'film',
    benefits: [{ items: ['All Film — Bronze benefits', 'Your product placed at the event for photo opportunities', 'Associate Producer credit', '4 VIP tickets'] }],
  },
  {
    id: 'film-gold',
    name: 'Film — Gold',
    price: 10000,
    group: 'film',
    benefits: [{ items: ['All Film — Silver benefits', 'Product placement in the film'] }],
  },
  {
    id: 'film-platinum',
    name: 'Film — Platinum',
    price: 25000,
    group: 'film',
    featured: true,
    benefits: [{ items: ['All Film — Gold benefits', 'A scene written into the screenplay with your branding'] }],
  },
  {
    id: 'film-executive',
    name: 'Film — Executive',
    price: 50000,
    group: 'film',
    benefits: [
      {
        items: [
          'All Film — Platinum benefits',
          'Products, logos and brand identity featured in at least three prominent scenes in Natasha: Escape to America',
          '6 VIP tickets',
        ],
      },
    ],
  },
];
