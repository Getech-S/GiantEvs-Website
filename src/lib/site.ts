/**
 * Single source of truth for brand, navigation and contact details.
 * Sections added later should read from here rather than hard-coding copy.
 */

export const site = {
  name: 'Giant Evs',
  tagline: 'Simply Powerful',
  description:
    "Rwanda's EV charging network. Real-time availability, transparent pricing and zero range anxiety — find an open charger before you start the ignition.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://giantevs.rw',
  locale: 'en_RW',
  phone: {
    display: '+250 787 672 455',
    // E.164 for tel: links.
    href: 'tel:+250787672455',
    // wa.me needs the number with no leading + and no spaces.
    whatsapp: 'https://wa.me/250787672455',
  },
  /** Where the contact form (see /contact and /api/contact) delivers every message. */
  email: 'operations@giantevs.com',
} as const;

export type NavItem = {
  label: string;
  href: string;
};

export const navigation: readonly NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Stations', href: '/stations' },
  { label: 'Partner with Us', href: '/partner' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'News', href: '/news' },
];

export type Language = {
  code: string;
  label: string;
};

export const languages: readonly Language[] = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'rw', label: 'Kinyarwanda' },
];

export const hero = {
  /** Split into lines so each one can animate in on its own. */
  headline: ["Powering Rwanda's", 'Drive Forward.'],
  subheadline:
    'Real-time availability. Transparent pricing. Zero range anxiety. Locate an open charger before you even start the ignition.',
  primaryCta: { label: 'Find a Station', href: '/stations' },
  secondaryCta: { label: 'Host a Charger', href: '/partner' },
  video: {
    src: '/media/hero-charging.mp4',
    /**
     * 40x23 JPEG of the video's own mid-point frame, inlined so the hero has
     * a colour-accurate placeholder on first paint with zero extra requests.
     * Regenerate with `python scripts/prepare-hero-video.py <src>`.
     */
    lqip:
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAwICQsJCAwLCgsODQwOEh4UEhEREiUbHBYeLCcuLisnKyoxN0Y7MTRCNCorPVM+QkhKTk9OLztWXFVMW0ZNTkv/2wBDAQ0ODhIQEiQUFCRLMisyS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0v/wAARCAAWACgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDjr6T5AjybgTvDY9sf0qpb+WWzLKoz2INO86Jmbz1LkcAg/KPrT41hUbTCJCO5z/jTWgnqOKLJcERqArH5cHOB/OrCWJki3I6kkZCjOTzj0phu1gidY4YkLjBwoJx+PStC1FuiYdX3Lxndj5d2enriqUmS0Zt3bOsTM6sXGAOO1Fa8iK8f7uOXYM/e9MD2oqWuw0cgr5jz3wR0qzb2090P9aAvpRRQM07XSIgytJI7kenArZjtIApcKQ3rxmiiqRnIo6pqEkYEaEgnnJooorOT1KR//9k=',
  },
} as const;

export const story = {
  eyebrow: 'Our Story',
  /** Split into lines so each one reveals on its own, as in the hero. */
  headline: ['Giant represents the size', 'of the future we believe in.'],
  body:
    "A future where charging is everywhere it needs to be. Where electric mobility is accessible to everyone. Where businesses can grow with clean technology. And where Africa doesn't simply adopt the electric revolution we help build it.",
  cta: { label: 'Learn More', href: '/about' },
  image: {
    src: '/media/story-bay.jpg',
    alt: 'Two Giant Evs fast chargers in an indoor bay, cables connected to parked cars',
  },
  video: {
    src: '/media/story-demo.mp4',
    /** Describes the clip for anyone who cannot see it play. */
    label: 'A Giant Evs engineer walking a customer through an 8800 EV DC charger',
  },
} as const;

/**
 * Real station data lives in src/lib/stations (a small JSON-file store,
 * managed from /admin) — nothing here is fabricated placeholder content.
 */
export const stationsSection = {
  eyebrow: 'Our Stations',
  headline: 'Find your nearest charger',
  cta: { label: 'View all Stations', href: '/stations' },
} as const;

export const howToCharge = {
  eyebrow: 'How To Charge',
  headline: 'Easier than filling a tank',
  steps: [
    {
      title: 'Pull Up & Connect',
      body: 'Stop by any Giant EVs station our on-site team will greet you and plug you in securely.',
    },
    {
      title: 'Relax & Unwind',
      body: 'Stay in your car or take a break while our team monitors your charging cycle.',
    },
    {
      title: 'Pay & Drive',
      body: 'Our team unplugs your vehicle when done—pay via your preferred local method and go.',
    },
  ],
} as const;

export const hostPromo = {
  /** Line two carries a leading no-break space, matching the comp's indent. */
  headline: ['You Have the Space.', ' We Have the Power.'],
  body:
    'Transform your parking real estate into a premium destination. We handle the hardware, installation, and continuous maintenance. You attract high-value EV drivers who stay longer and spend more.',
  cta: { label: 'Learn More', href: '/partner' },
  image: {
    src: '/media/promo-space.jpg',
    alt: 'An electric car charging from a Giant Evs pillar outside a glass-fronted building at dusk',
  },
} as const;

export type Service = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  cta: { label: string; href: string };
  /** The middle card is inverted in the comp. */
  featured?: boolean;
};

export const servicesSection = {
  eyebrow: 'What we offer',
  headline: 'Everything you need to stay charged',
} as const;

export const services: readonly Service[] = [
  {
    id: 'public-charging',
    eyebrow: 'For the daily drive.',
    title: 'Public Charging',
    body: "Fast and standard charging stations strategically located across Rwanda's busiest routes. Just pull up, plug in, and go.",
    cta: { label: 'Find a Station', href: '/stations' },
  },
  {
    id: 'mobile-rescue',
    eyebrow: '24/7 wherever you are',
    title: 'Mobile Rescue Charging.',
    body: "Out of charge and far from a station? Don't panic. Our emergency mobile units will bring the power directly to your vehicle, wherever you are.",
    cta: { label: 'Request Emergency Support', href: '/contact' },
    featured: true,
  },
  {
    id: 'charger-installation',
    eyebrow: 'At your premises',
    title: 'Charger Installation',
    body: 'We install AC or DC charging units at your home, office, or commercial property. Full certification and ongoing support included.',
    cta: { label: 'Get a Quote', href: '/partner' },
  },
];

// --- /partner page ----------------------------------------------------

export const partnerHero = {
  headline: ['Turn Your Parking Space', 'Into a Premium Asset'],
  body: 'We handle the hardware, installation, and ongoing support. You attract high-value EV drivers who stay longer and spend more at your business.',
  cta: { label: 'Get a Quote', href: '#partner-enquiry' },
  // Same real photo as the homepage's Host Promo band (see `hostPromo`
  // above) — this page's hero is that same full-bleed treatment, reused
  // rather than duplicated, with copy aimed at a prospective host instead
  // of a general visitor.
  image: hostPromo.image,
} as const;

export type PartnerValueIcon = 'customers' | 'hassle' | 'brand';
export type PartnerValue = { id: string; icon: PartnerValueIcon; title: string; body: string };

export const partnerValueSection = {
  eyebrow: 'The value',
  headline: 'Powering Your Business Growth.',
} as const;

export const partnerValues: readonly PartnerValue[] = [
  {
    id: 'customers',
    icon: 'customers',
    title: 'Attract Premium Customers',
    body: 'EV drivers actively choose destinations based on charger availability. Bring a new, high-spending demographic directly to your door.',
  },
  {
    id: 'hassle',
    icon: 'hassle',
    title: 'Zero Operational Hassle',
    body: 'From initial load testing to daily maintenance, our engineering team manages the entire lifecycle. You run your business; we run the chargers.',
  },
  {
    id: 'brand',
    icon: 'brand',
    title: 'Elevate Your Brand',
    body: "Seamlessly align with Rwanda's green energy transition. Show your customers and stakeholders that your business is built for the future.",
  },
];

export type PartnerStep = { title: string; body: string };

export const partnerHowItWorks = {
  eyebrow: 'How it works',
  headline: 'Effortless Integration in Three Steps',
  // Same real charging-bay photo used elsewhere on the site (Our Story,
  // the news article) — see the note on `contactPage.image` below for why
  // real assets are reused rather than duplicated.
  image: {
    src: '/media/story-bay.jpg',
    alt: 'Two Giant Evs fast chargers in an indoor bay, cables connected to parked cars',
  },
  steps: [
    {
      title: 'Site Assessment',
      body: 'Our technicians evaluate your location, foot traffic, and electrical capacity to design the optimal charging layout.',
    },
    {
      title: 'Custom Installation',
      body: 'We deploy the required hardware with minimal disruption to your daily operations.',
    },
    {
      title: 'Launch & Attract',
      body: 'Your location goes live on the Giant Evs network, instantly guiding drivers to your property.',
    },
  ] satisfies PartnerStep[],
} as const;

/**
 * The enquiry-form band. Note: the source design repeats "How it works /
 * Effortless Integration in Three Steps" verbatim as this section's own
 * heading too — almost certainly a copy-paste carried over from the section
 * above rather than an intentional repeat, since this band is a contact
 * form, not a continuation of the three steps. Given a real, distinct
 * heading here instead; easy to swap back if the repeat was deliberate.
 */
export const partnerEnquiry = {
  eyebrow: 'Get started',
  headline: 'Ready to Host a Charger?',
  subjects: [
    'New partnership enquiry',
    'Site assessment request',
    'Pricing & packages',
    'General question',
  ],
  sideEyebrow: 'Prefer to talk first?',
  sideHeadline: 'Our business team is available Monday – Friday, 8 AM to 6 PM.',
  phoneCaption: 'Direct line, no menu, no wait',
  emailCaption: 'We reply within 24 hours',
  location: { caption: 'Rwanda — visits by appointment', detail: 'KG 7 Ave, Kigali' },
} as const;

export const calculatorSection = {
  eyebrow: 'Charging Cost Calculator',
  headline: 'Know before you charge',
  intro:
    'Estimate your charging cost in seconds. Choose your charger type, your battery size, and how much you need.',
} as const;

export type Story = {
  id: string;
  category: string;
  title: string;
  href: string;
  image: { src: string; alt: string };
};

export const storiesSection = {
  eyebrow: 'Updates',
  headline: 'The Giant Evs stories.',
} as const;

export const stories: readonly Story[] = [
  {
    id: 'fuel-retail-fleet',
    category: 'Retail & Hospitality',
    title: 'How The Fuel Retail Industry Can Benefit From The Huge Electric Fleet Vehicles?',
    href: '/news',
    image: {
      src: '/media/stories/story-plug-in.jpg',
      alt: 'A driver connecting a charging cable to the port of an electric car',
    },
  },
  {
    id: 'forecourt-transition',
    category: 'Retail & Hospitality',
    title: 'How The Fuel Retail Industry Can Benefit From The Huge Electric Fleet Vehicles?',
    href: '/news',
    image: {
      src: '/media/stories/story-forecourt.jpg',
      alt: 'A customer refuelling a car on a service station forecourt',
    },
  },
  {
    id: 'public-charging-uptake',
    category: 'Retail & Hospitality',
    title: 'How The Fuel Retail Industry Can Benefit From The Huge Electric Fleet Vehicles?',
    href: '/news',
    image: {
      src: '/media/stories/story-charging-station.jpg',
      alt: 'A driver using the touchscreen on a public fast-charging pillar',
    },
  },
];

export type Partner = {
  id: string;
  name: string;
  src: string;
  /**
   * Rendered size. Height is tuned per mark rather than shared, so logos of
   * very different proportions (a square crest next to a wide wordmark) read
   * at the same optical weight; width follows each file's own ratio.
   */
  width: number;
  height: number;
};

export const partnersSection = {
  label: 'Our trusted partners',
} as const;

export const partners: readonly Partner[] = [
  { id: 'reg', name: 'Rwanda Energy Group', src: '/media/partners/reg.png', width: 141, height: 49 },
  {
    id: 'city-of-kigali',
    name: 'City of Kigali',
    src: '/media/partners/city-of-kigali.png',
    width: 96,
    height: 90,
  },
  {
    id: 'rura',
    name: 'Rwanda Utilities Regulatory Authority',
    src: '/media/partners/rura.png',
    width: 125,
    height: 32,
  },
  { id: 'rra', name: 'Rwanda Revenue Authority', src: '/media/partners/rra.png', width: 69, height: 71 },
];

export type FooterLink = { label: string; href: string };
export type FooterColumn = { title: string; links: readonly FooterLink[] };

export const footer = {
  tagline:
    "Rwanda's most trusted EV charging network. Powering clean mobility across the Land of a Thousand Hills.",
  socials: [
    { id: 'facebook', label: 'Facebook', href: 'https://facebook.com' },
    { id: 'x', label: 'X (formerly Twitter)', href: 'https://x.com' },
    { id: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com' },
    { id: 'instagram', label: 'Instagram', href: 'https://instagram.com' },
  ],
  columns: [
    {
      title: 'Quick Links',
      links: [
        { label: 'Home', href: '/' },
        { label: 'Find a Station', href: '/stations' },
        { label: 'For Business', href: '/partner' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'Our Story', href: '/about' },
        { label: 'News & Press', href: '/news' },
        { label: 'Careers', href: '/about' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Center', href: '/contact' },
        { label: 'Contact Us', href: '/contact' },
        { label: 'Calculator', href: '/#calculator-heading' },
      ],
    },
  ] as readonly FooterColumn[],
  legalLinks: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ] as readonly FooterLink[],
  location: 'Kigali, Rwanda.',
} as const;

export const aboutStory = {
  eyebrow: 'Our Story',
  headline: ['Giant represents the size', 'of the future we believe in.'],
  // Paragraph 1 is verbatim the homepage's Our Story copy (story.body above);
  // kept as its own literal rather than a reference so this page's copy can
  // be edited independently later.
  paragraphs: [
    "A future where charging is everywhere it needs to be. Where electric mobility is accessible to everyone. Where businesses can grow with clean technology. And where Africa doesn't simply adopt the electric revolution we help build it.",
    'We started in Rwanda with one ambition: to build something that can grow far beyond Rwanda. Today, every charger we deploy is more than a charging point. It is a step toward a bigger, smarter, more connected Africa. Giant is not just our name. It is the size of our ambition.',
  ],
  // Same real photo and clip as the homepage's "Our Story" (see `story`
  // above) — reused rather than duplicated, so there's one real asset to
  // keep current instead of two copies drifting apart.
  image: story.image,
  video: story.video,
} as const;

export const visionMission = {
  headline: 'Our Vision & Mission',
  cards: [
    {
      title: 'Our Vision',
      body: "To power Africa's transition to intelligent, accessible, and sustainable electric mobility.",
    },
    {
      title: 'Our Mission',
      body: 'To build reliable, connected EV charging infrastructure that makes electric mobility simple, accessible, and scalable across Africa.',
    },
  ],
} as const;

export type TeamMember = {
  name: string;
  role: string;
  photo: { src: string; alt: string };
};

export const teamSection = {
  eyebrow: 'Our People',
  headline: 'The Experts Behind the Network',
} as const;

/**
 * Real team members only. The comp mocks this grid with one photo repeated
 * four times — that's a layout placeholder demonstrating the grid, not four
 * distinct people — so only real entries ship here. Add real teammates as
 * you get their name, role and photo; Team (components/sections/team.tsx)
 * lays out anywhere from 1 to 4+ across with no code changes.
 */
export const team: readonly TeamMember[] = [
  {
    name: 'Manzi Derrick',
    role: 'CEO',
    photo: { src: '/media/about/manzi-derrick.jpg', alt: 'Portrait of Manzi Derrick, CEO of Giant Evs' },
  },
  {
    name: 'Umwiza Phiona',
    role: 'Marketing Manager',
    photo: {
      src: '/media/about/umwiza-phiona.jpg',
      alt: 'Portrait of Umwiza Phiona, Marketing Manager at Giant Evs',
    },
  },
];

export const experienceCta = {
  headline: ['Ready to experience the', 'difference?'],
  image: {
    src: '/media/about/experience-cta.jpg',
    alt: 'Close-up of an electric vehicle charging cable connected to a car',
  },
  primaryCta: { label: 'Find a Station', href: '/stations' },
  secondaryCta: { label: 'Host a Charger', href: '/partner' },
} as const;

export const vipReserve = {
  title: 'Reserve VIP Spot',
  body: 'Prefer to book by phone or email? Our team handles VIP reservations directly.',
  cta: { label: 'Find a Station', href: '/stations' },
} as const;

export const contactPage = {
  eyebrow: "Let's talk",
  headline: "We're easy to reach.",
  subjects: [
    'General enquiry',
    'Find a station',
    'Host a charger',
    'Partnership',
    'Press',
    'Support',
  ],
  image: {
    src: '/media/contact/charging-hub.jpg',
    alt: 'The Kigali EV Charging Hub, with buses and cars charging at Giant Evs stations',
  },
} as const;
