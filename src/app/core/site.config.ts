/**
 * Single source of truth for company facts and content slots.
 *
 * Every value here was checked against the live nsrl.in site on 21 Nov 2026
 * (see REDESIGN-REPORT.md for the audit and the discrepancies it found).
 * Slots set to `null` are waiting on the client — the UI hides or falls back
 * gracefully; nothing is invented to fill them.
 */

export interface City {
  id: string;
  name: string;
  /** Position inside the 612×696 viewBox of @svg-maps/india (city-level, indicative). */
  x: number;
  y: number;
  headOffice?: boolean;
  branch: boolean;
  served: boolean;
}

export interface Service {
  id: string;
  name: string;
  short: string;
  summary: string;
  body: string[];
  benefits: string[];
  image: ImageKey;
}

export interface Client {
  name: string;
  /** Official logo file under /clients with its intrinsic size. null = show the name set in type. */
  logo: { src: string; width: number; height: number } | null;
}

export type ImageKey = 'hero' | 'intro' | 'about' | 'transport' | 'supplyChain' | 'threePl' | 'network' | 'contact';

export const SITE = {
  name: 'North South Roadlines',
  brand: 'NSRL',
  tagline: 'Trucking value since 1994',
  business: 'Supply chain and logistics management, transportation and third-party logistics (3PL).',

  /**
   * The original logo from nsrl.in (/public/brand/nsrl-logo.png), resampled to WebP for
   * delivery. Never redraw, recolour or crop it.
   */
  logo: {
    src: '/brand/nsrl-logo-320.webp',
    srcset: '/brand/nsrl-logo-160.webp 160w, /brand/nsrl-logo-320.webp 320w',
    width: 320,
    height: 200,
  } as { src: string; srcset?: string; width: number; height: number } | null,

  phones: [
    { display: '+91 94254-10665', tel: '+919425410665', primary: true },
    { display: '+91 92001-61925', tel: '+919200161925', primary: false },
    { display: '+91 98931-33019', tel: '+919893133019', primary: false },
  ],
  email: 'northsouthrl@gmail.com',
  /** Set only after the company confirms which number is on WhatsApp, e.g. '919425410665'. */
  whatsappNumber: null as string | null,
  /** Existing "Login" portal URL. Set only once the real destination is confirmed. */
  loginUrl: null as string | null,
  /** Verified social profiles only. */
  social: [] as { label: string; url: string }[],
  /** Ownership / leadership rows for the About page. Empty until the company supplies them. */
  ownership: [] as { label: string; value: string }[],

  address: {
    lines: ['21/7, Gulab Bagh, Dewas Naka', 'Indore, Madhya Pradesh, India'],
    street: '21/7, Gulab Bagh, Dewas Naka',
    city: 'Indore',
    region: 'Madhya Pradesh',
    country: 'IN',
    mapQuery: 'North South Roadlines, 21/7, Gulab Bagh, Dewas Naka, Indore, Madhya Pradesh, India',
  },
};

export const CITIES: City[] = [
  { id: 'indore', name: 'Indore', x: 161.9, y: 348.3, headOffice: true, branch: true, served: true },
  { id: 'ahmedabad', name: 'Ahmedabad', x: 93.2, y: 341.5, branch: true, served: true },
  { id: 'pune', name: 'Pune', x: 120.1, y: 442.4, branch: true, served: true },
  { id: 'mumbai', name: 'Mumbai', x: 99.6, y: 430, branch: true, served: true },
  { id: 'gurgaon', name: 'Gurgaon', x: 186.3, y: 214.9, branch: true, served: false },
  { id: 'chandigarh', name: 'Chandigarh', x: 179.5, y: 159.9, branch: true, served: false },
  { id: 'raipur', name: 'Raipur', x: 282.4, y: 381.5, branch: true, served: false },
  { id: 'bhopal', name: 'Bhopal', x: 194.3, y: 336, branch: true, served: false },
  { id: 'delhi', name: 'Delhi', x: 190.1, y: 211.3, branch: false, served: true },
  { id: 'hyderabad', name: 'Hyderabad', x: 216.8, y: 467.3, branch: false, served: true },
  { id: 'jaipur', name: 'Jaipur', x: 160.4, y: 251.5, branch: false, served: true },
];

export const SERVICES: Service[] = [
  {
    id: 'transportation',
    name: 'Transportation and road logistics',
    short: 'Transportation',
    summary: 'Road freight between Indore and the major commercial centres NSRL serves.',
    body: [
      'Road transport is where NSRL started and it is still the core of the business. Consignments move by truck between our head office in Indore and the cities on our network, with branch teams handling the ground work at either end.',
      'Tell us what is moving, from where and to where, and we will plan the vehicle and the route around your dispatch schedule.',
    ],
    benefits: [
      'One operator accountable from pickup to delivery',
      'Branch teams in seven cities, coordinated from Indore',
      'A direct line to the people moving your consignment',
    ],
    image: 'transport',
  },
  {
    id: 'supply-chain',
    name: 'Supply chain management',
    short: 'Supply chain',
    summary: 'Planning and coordination of the flow of goods, not only the truck that carries them.',
    body: [
      'NSRL has worked in supply chain and logistics management since its early years in Central India. We coordinate the movement of goods between your suppliers, your stock points and your customers so that transport fits the rest of your operation.',
      'The scope is agreed with you first. We would rather take on a defined piece of your supply chain and run it properly than promise all of it.',
    ],
    benefits: [
      'Transport planned around your production and dispatch cycles',
      'Fewer hand-offs between separate vendors',
      'A logistics partner that already knows the Central India lanes',
    ],
    image: 'supplyChain',
  },
  {
    id: '3pl',
    name: 'Third-party logistics (3PL)',
    short: '3PL',
    summary: 'Outsource the logistics function to a team that has grown up running it.',
    body: [
      'NSRL has expanded from transportation into third-party logistics. As your 3PL partner we take responsibility for an agreed part of your logistics, so your own team can stay with manufacturing, sales and customers.',
      'Every 3PL engagement is scoped individually. Share your requirement through the enquiry form and we will come back with what we can take on.',
    ],
    benefits: [
      'Logistics handled by a specialist rather than an internal side-function',
      'A single partner to brief, measure and hold to account',
      'Capacity that can follow your volumes',
    ],
    image: 'threePl',
  },
];

/**
 * Logos are the same official files the live site displays. Bisleri, Samsung and
 * Nilkamal stay set in type until their files can be supplied (see ASSET-REQUIREMENTS.md).
 */
export const CLIENTS: Client[] = [
  { name: 'Britannia', logo: { src: '/clients/britannia.svg', width: 340, height: 180 } },
  { name: 'Bisleri', logo: null },
  { name: 'Samsung', logo: null },
  { name: 'Nilkamal', logo: null },
  { name: 'TATA', logo: { src: '/clients/tata.svg', width: 451, height: 414 } },
  { name: 'DMart', logo: { src: '/clients/dmart.png', width: 196, height: 46 } },
];

export interface Photo {
  src: string;
  width: number;
  height: number;
  srcset?: string;
}

/** The only company photograph on nsrl.in: an NSRL Eicher truck at a loading dock. */
const TRUCK_AT_DOCK: Photo = {
  src: '/images/nsrl-truck-loading-dock-800.webp',
  width: 800,
  height: 1010,
  srcset:
    '/images/nsrl-truck-loading-dock-480.webp 480w, /images/nsrl-truck-loading-dock-800.webp 800w, /images/nsrl-truck-loading-dock-1200.webp 1200w',
};

/**
 * Photography slots. Set a slot to a file in /public/images (WebP or AVIF,
 * properly licensed) with its intrinsic width and height. While a slot is
 * null the site renders a drawn road plate in its place.
 */
export const IMAGES: Record<ImageKey, Photo | null> = {
  hero: null, // heavy commercial trucks on an Indian highway, wide
  intro: TRUCK_AT_DOCK, // loading or unloading operation
  about: TRUCK_AT_DOCK, // fleet or yard, Indore
  transport: null, // truck on the road
  supplyChain: null, // distribution centre / dispatch floor
  threePl: null, // warehouse interior
  network: null, // highway infrastructure
  contact: null, // office or yard exterior
};

export const NAV = [
  { label: 'About', path: '/about' },
  { label: 'Services', path: '/services' },
  { label: 'Network', path: '/network' },
  { label: 'Clients', path: '/clients' },
  { label: 'Contact', path: '/contact' },
];
